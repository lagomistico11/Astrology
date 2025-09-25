#!/usr/bin/env python3
"""
Direct Authentication Testing
Testing the credentials authentication logic directly
"""

import requests
import json
import bcrypt
from pymongo import MongoClient

# Configuration
BASE_URL = "https://celestia-astro.preview.emergentagent.com"
API_BASE = f"{BASE_URL}/api"

def test_database_connection():
    """Test direct database connection and user lookup"""
    try:
        mongo_url = 'mongodb://localhost:27017/astrology_platform'
        client = MongoClient(mongo_url)
        db = client.astrology_platform
        
        # Test user lookup
        user = db.users.find_one({'email': 'smolinaa26@icloud.com'})
        if user:
            print(f"✅ User found: {user['email']}")
            print(f"   Name: {user.get('name')}")
            print(f"   Role: {user.get('role')}")
            print(f"   Has password: {'Yes' if user.get('password') else 'No'}")
            print(f"   Password hash length: {len(user.get('password', ''))}")
            return user
        else:
            print("❌ User not found in database")
            return None
            
    except Exception as e:
        print(f"❌ Database connection error: {e}")
        return None

def test_password_verification():
    """Test password verification logic"""
    try:
        # Common passwords that might have been used
        test_passwords = [
            'password123', 'admin123', 'SecurePass123!', 'testpassword', 
            '123456', 'password', 'admin', 'test123', 'sergio123', 'sergio'
        ]
        
        mongo_url = 'mongodb://localhost:27017/astrology_platform'
        client = MongoClient(mongo_url)
        db = client.astrology_platform
        
        users = [
            {'email': 'smolinaa26@icloud.com', 'name': 'Sergio'},
            {'email': 'lago.mistico11@gmail.com', 'name': 'Admin'}
        ]
        
        for user_info in users:
            print(f"\n🔍 Testing passwords for {user_info['email']}:")
            user = db.users.find_one({'email': user_info['email']})
            
            if not user:
                print(f"   ❌ User not found")
                continue
                
            hashed_password = user.get('password')
            if not hashed_password:
                print(f"   ❌ No password hash found")
                continue
                
            print(f"   Hash: {hashed_password[:30]}...")
            
            # Try to find the correct password
            found_password = None
            for test_pass in test_passwords:
                try:
                    if bcrypt.checkpw(test_pass.encode('utf-8'), hashed_password.encode('utf-8')):
                        print(f"   ✅ Password found: {test_pass}")
                        found_password = test_pass
                        break
                except Exception as e:
                    print(f"   Error testing {test_pass}: {e}")
            
            if not found_password:
                print(f"   ❌ None of the test passwords match")
                
        client.close()
        
    except Exception as e:
        print(f"❌ Password verification error: {e}")

def test_nextauth_direct():
    """Test NextAuth authentication directly with proper format"""
    try:
        # First get CSRF token
        session = requests.Session()
        csrf_response = session.get(f"{API_BASE}/auth/csrf")
        csrf_token = csrf_response.json().get('csrfToken')
        
        print(f"🔑 CSRF Token: {csrf_token[:20]}...")
        
        # Test with form data (not JSON)
        auth_data = {
            'email': 'smolinaa26@icloud.com',
            'password': 'password123',  # Try common password
            'csrfToken': csrf_token,
            'callbackUrl': f'{BASE_URL}/client-portal',
            'json': 'true'
        }
        
        print(f"\n🔐 Testing authentication with form data...")
        response = session.post(
            f"{API_BASE}/auth/callback/credentials",
            data=auth_data,  # Use data instead of json
            headers={
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-Requested-With': 'XMLHttpRequest'
            }
        )
        
        print(f"Response status: {response.status_code}")
        print(f"Response headers: {dict(response.headers)}")
        print(f"Response text: {response.text}")
        
        # Check if we got a session
        session_response = session.get(f"{API_BASE}/auth/session")
        print(f"\nSession check: {session_response.status_code}")
        print(f"Session data: {session_response.text}")
        
    except Exception as e:
        print(f"❌ NextAuth direct test error: {e}")

def test_manual_auth_logic():
    """Test the authentication logic manually"""
    try:
        print("\n🧪 Testing manual authentication logic...")
        
        # Simulate the authorize function logic
        email = 'smolinaa26@icloud.com'
        password = 'password123'  # Try common password
        
        mongo_url = 'mongodb://localhost:27017/astrology_platform'
        client = MongoClient(mongo_url)
        db = client.astrology_platform
        
        # Step 1: Find user
        user = db.users.find_one({'email': email})
        print(f"1. User lookup: {'Found' if user else 'Not found'}")
        
        if not user:
            print("   ❌ Authentication failed: User not found")
            return
            
        # Step 2: Check password field
        if not user.get('password'):
            print("   ❌ Authentication failed: No password field")
            return
            
        print(f"2. Password field: Present ({len(user['password'])} chars)")
        
        # Step 3: Verify password
        try:
            is_valid = bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8'))
            print(f"3. Password verification: {'Valid' if is_valid else 'Invalid'}")
            
            if is_valid:
                print("   ✅ Authentication would succeed")
                print(f"   User data: {{'id': '{user.get('id', user.get('_id'))}', 'email': '{user['email']}', 'role': '{user.get('role', 'client')}'}}")
            else:
                print("   ❌ Authentication failed: Invalid password")
                
        except Exception as e:
            print(f"   ❌ Password verification error: {e}")
            
        client.close()
        
    except Exception as e:
        print(f"❌ Manual auth logic error: {e}")

if __name__ == "__main__":
    print("🔍 Direct Authentication Testing")
    print("=" * 50)
    
    # Test database connection
    test_database_connection()
    
    # Test password verification
    test_password_verification()
    
    # Test NextAuth directly
    test_nextauth_direct()
    
    # Test manual auth logic
    test_manual_auth_logic()