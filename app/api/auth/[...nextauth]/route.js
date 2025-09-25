import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { MongoClient } from 'mongodb';

// MongoDB connection for NextAuth
async function connectToDatabase() {
  const client = new MongoClient(process.env.MONGO_URL);
  await client.connect();
  const db = client.db(process.env.DB_NAME);
  return { client, db };
}

export const { handlers, auth } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events",
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required');
        }

        try {
          const { db } = await connectToDatabase();
          const user = await db.collection('users').findOne({ 
            email: credentials.email 
          });

          if (!user) {
            throw new Error('No user found with this email');
          }

          const isValidPassword = await bcrypt.compare(
            credentials.password, 
            user.password
          );

          if (!isValidPassword) {
            throw new Error('Invalid password');
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role || 'client',
          };
        } catch (error) {
          console.error('Auth error:', error);
          throw new Error('Authentication failed');
        }
      }
    }),
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
      }
      
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }

      if (Date.now() < token.expiresAt * 1000) {
        return token;
      }
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.error = token.error;
      session.user.role = token.role;
      session.user.id = token.id;
      
      // For Google OAuth users, ensure they exist in our database
      if (token.sub && !token.id) {
        try {
          const { db } = await connectToDatabase();
          let user = await db.collection('users').findOne({ 
            email: session.user.email 
          });
          
          if (!user) {
            // Create new user for Google OAuth
            user = {
              email: session.user.email,
              name: session.user.name,
              image: session.user.image,
              role: session.user.email === 'lago.mistico11@gmail.com' ? 'admin' : 'client',
              createdAt: new Date(),
              provider: 'google',
              birthInfo: {
                birthDate: null,
                birthTime: null,
                birthPlace: null
              }
            };
            
            const result = await db.collection('users').insertOne(user);
            session.user.id = result.insertedId.toString();
            session.user.role = user.role;
          } else {
            session.user.id = user._id.toString();
            session.user.role = user.role;
          }
        } catch (error) {
          console.error('Error creating/fetching user:', error);
        }
      }
      
      return session;
    },
    async signIn({ user, account, profile }) {
      // Allow sign in for all authenticated users
      return true;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
});

async function refreshAccessToken(token) {
  try {
    const url = "https://oauth2.googleapis.com/token?" +
      new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
      });

    const response = await fetch(url, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      method: "POST",
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      expiresAt: Math.floor(Date.now() / 1000 + refreshedTokens.expires_in),
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export const { GET, POST } = handlers;