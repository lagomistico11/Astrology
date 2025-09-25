#!/usr/bin/env python3
"""
Credentials Sign-In Authentication Flow Testing
Testing NextAuth credentials provider with existing user accounts
"""

import requests
import json
import time
from datetime import datetime

# Configuration
BASE_URL = "https://celestia-astro.preview.emergentagent.com"
API_BASE = f"{BASE_URL}/api"

class CredentialsAuthTester:
    def __init__(self):
        self.results = []
        self.total_tests = 0
        self.passed_tests = 0
        self.session = requests.Session()
        
    def log_result(self, test_name, success, details="", response_data=None):
        """Log test result"""
        self.total_tests += 1
        if success:
            self.passed_tests += 1
            status = "✅ PASS"
        else:
            status = "❌ FAIL"
            
        result = {
            "test": test_name,
            "status": status,
            "success": success,
            "details": details,
            "response_data": response_data,
            "timestamp": datetime.now().isoformat()
        }
        self.results.append(result)
        print(f"{status}: {test_name}")
        if details:
            print(f"   Details: {details}")
        if not success and response_data:
            print(f"   Response: {response_data}")
        print()

    def test_nextauth_providers(self):
        """Test NextAuth providers endpoint"""
        try:
            response = self.session.get(f"{API_BASE}/auth/providers", timeout=10)
            if response.status_code == 200:
                providers = response.json()
                if 'credentials' in providers:
                    self.log_result("NextAuth Providers - Credentials", True, 
                                  f"Credentials provider found: {providers['credentials']['name']}")
                    return True
                else:
                    self.log_result("NextAuth Providers - Credentials", False, 
                                  "Credentials provider not found", providers)
                    return False
            else:
                self.log_result("NextAuth Providers - Credentials", False, 
                              f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_result("NextAuth Providers - Credentials", False, f"Exception: {str(e)}")
            return False

    def test_nextauth_signin_page(self):
        """Test NextAuth signin page accessibility"""
        try:
            response = self.session.get(f"{API_BASE}/auth/signin", timeout=10)
            if response.status_code == 200:
                self.log_result("NextAuth Signin Page", True, "Signin page accessible")
                return True
            else:
                self.log_result("NextAuth Signin Page", False, f"HTTP {response.status_code}")
                return False
        except Exception as e:
            self.log_result("NextAuth Signin Page", False, f"Exception: {str(e)}")
            return False

    def test_credentials_signin_client_user(self):
        """Test credentials sign-in with client user (smolinaa26@icloud.com)"""
        try:
            # Test with known client user
            signin_data = {
                "email": "smolinaa26@icloud.com",
                "password": "password123",  # Assuming this is the password used during registration
                "csrfToken": "test-csrf-token",
                "callbackUrl": f"{BASE_URL}/client-portal",
                "json": "true"
            }
            
            response = self.session.post(f"{API_BASE}/auth/callback/credentials", 
                                       data=signin_data, timeout=10)
            
            print(f"Response status: {response.status_code}")
            print(f"Response headers: {dict(response.headers)}")
            print(f"Response text: {response.text[:500]}")
            
            # NextAuth typically returns 200 with redirect URL or error
            if response.status_code == 200:
                try:
                    data = response.json()
                    if data.get('url'):
                        self.log_result("Credentials Signin - Client User", True, 
                                      f"Signin successful, redirect to: {data['url']}")
                        return True
                    elif data.get('error'):
                        self.log_result("Credentials Signin - Client User", False, 
                                      f"Signin failed with error: {data['error']}")
                        return False
                    else:
                        self.log_result("Credentials Signin - Client User", False, 
                                      "Unexpected response format", data)
                        return False
                except json.JSONDecodeError:
                    # Check if it's a redirect response
                    if 'location' in response.headers:
                        self.log_result("Credentials Signin - Client User", True, 
                                      f"Signin successful, redirected to: {response.headers['location']}")
                        return True
                    else:
                        self.log_result("Credentials Signin - Client User", False, 
                                      "Non-JSON response without redirect", response.text[:200])
                        return False
            elif response.status_code == 302:
                # Redirect response - check location header
                location = response.headers.get('location', '')
                if 'client-portal' in location or 'dashboard' in location:
                    self.log_result("Credentials Signin - Client User", True, 
                                  f"Signin successful, redirected to: {location}")
                    return True
                elif 'error' in location:
                    self.log_result("Credentials Signin - Client User", False, 
                                  f"Signin failed, redirected to error: {location}")
                    return False
                else:
                    self.log_result("Credentials Signin - Client User", False, 
                                  f"Unexpected redirect: {location}")
                    return False
            else:
                self.log_result("Credentials Signin - Client User", False, 
                              f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result("Credentials Signin - Client User", False, f"Exception: {str(e)}")
            return False

    def test_credentials_signin_admin_user(self):
        """Test credentials sign-in with admin user (lago.mistico11@gmail.com)"""
        try:
            # Test with known admin user
            signin_data = {
                "email": "lago.mistico11@gmail.com",
                "password": "admin123",  # Assuming this is the password used during registration
                "csrfToken": "test-csrf-token",
                "callbackUrl": f"{BASE_URL}/admin-portal",
                "json": "true"
            }
            
            response = self.session.post(f"{API_BASE}/auth/callback/credentials", 
                                       data=signin_data, timeout=10)
            
            print(f"Admin signin response status: {response.status_code}")
            print(f"Admin signin response headers: {dict(response.headers)}")
            print(f"Admin signin response text: {response.text[:500]}")
            
            # NextAuth typically returns 200 with redirect URL or error
            if response.status_code == 200:
                try:
                    data = response.json()
                    if data.get('url'):
                        self.log_result("Credentials Signin - Admin User", True, 
                                      f"Admin signin successful, redirect to: {data['url']}")
                        return True
                    elif data.get('error'):
                        self.log_result("Credentials Signin - Admin User", False, 
                                      f"Admin signin failed with error: {data['error']}")
                        return False
                    else:
                        self.log_result("Credentials Signin - Admin User", False, 
                                      "Unexpected response format", data)
                        return False
                except json.JSONDecodeError:
                    # Check if it's a redirect response
                    if 'location' in response.headers:
                        self.log_result("Credentials Signin - Admin User", True, 
                                      f"Admin signin successful, redirected to: {response.headers['location']}")
                        return True
                    else:
                        self.log_result("Credentials Signin - Admin User", False, 
                                      "Non-JSON response without redirect", response.text[:200])
                        return False
            elif response.status_code == 302:
                # Redirect response - check location header
                location = response.headers.get('location', '')
                if 'admin-portal' in location or 'dashboard' in location:
                    self.log_result("Credentials Signin - Admin User", True, 
                                  f"Admin signin successful, redirected to: {location}")
                    return True
                elif 'error' in location:
                    self.log_result("Credentials Signin - Admin User", False, 
                                  f"Admin signin failed, redirected to error: {location}")
                    return False
                else:
                    self.log_result("Credentials Signin - Admin User", False, 
                                  f"Unexpected redirect: {location}")
                    return False
            else:
                self.log_result("Credentials Signin - Admin User", False, 
                              f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result("Credentials Signin - Admin User", False, f"Exception: {str(e)}")
            return False

    def test_invalid_credentials(self):
        """Test credentials sign-in with invalid credentials"""
        try:
            # Test with invalid credentials
            signin_data = {
                "email": "smolinaa26@icloud.com",
                "password": "wrongpassword",
                "csrfToken": "test-csrf-token",
                "callbackUrl": f"{BASE_URL}/client-portal",
                "json": "true"
            }
            
            response = self.session.post(f"{API_BASE}/auth/callback/credentials", 
                                       data=signin_data, timeout=10)
            
            print(f"Invalid credentials response status: {response.status_code}")
            print(f"Invalid credentials response text: {response.text[:500]}")
            
            # Should fail with error
            if response.status_code == 200:
                try:
                    data = response.json()
                    if data.get('error'):
                        self.log_result("Invalid Credentials Test", True, 
                                      f"Correctly rejected invalid credentials: {data['error']}")
                        return True
                    elif data.get('url'):
                        self.log_result("Invalid Credentials Test", False, 
                                      "Invalid credentials were accepted - security issue!")
                        return False
                    else:
                        self.log_result("Invalid Credentials Test", False, 
                                      "Unexpected response format", data)
                        return False
                except json.JSONDecodeError:
                    self.log_result("Invalid Credentials Test", False, 
                                  "Non-JSON response for invalid credentials", response.text[:200])
                    return False
            elif response.status_code == 302:
                location = response.headers.get('location', '')
                if 'error' in location:
                    self.log_result("Invalid Credentials Test", True, 
                                  f"Correctly rejected invalid credentials, redirected to: {location}")
                    return True
                else:
                    self.log_result("Invalid Credentials Test", False, 
                                  f"Invalid credentials accepted - redirected to: {location}")
                    return False
            else:
                self.log_result("Invalid Credentials Test", False, 
                              f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result("Invalid Credentials Test", False, f"Exception: {str(e)}")
            return False

    def test_session_verification(self):
        """Test session verification after successful signin"""
        try:
            response = self.session.get(f"{API_BASE}/auth/session", timeout=10)
            
            print(f"Session verification response status: {response.status_code}")
            print(f"Session verification response text: {response.text[:500]}")
            
            if response.status_code == 200:
                try:
                    session_data = response.json()
                    if session_data.get('user'):
                        user = session_data['user']
                        self.log_result("Session Verification", True, 
                                      f"Session active for user: {user.get('email')} (role: {user.get('role')})")
                        return True
                    else:
                        self.log_result("Session Verification", False, 
                                      "No active session found", session_data)
                        return False
                except json.JSONDecodeError:
                    self.log_result("Session Verification", False, 
                                  "Invalid JSON response", response.text[:200])
                    return False
            else:
                self.log_result("Session Verification", False, 
                              f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result("Session Verification", False, f"Exception: {str(e)}")
            return False

    def test_csrf_token_retrieval(self):
        """Test CSRF token retrieval for secure signin"""
        try:
            response = self.session.get(f"{API_BASE}/auth/csrf", timeout=10)
            
            if response.status_code == 200:
                try:
                    csrf_data = response.json()
                    if csrf_data.get('csrfToken'):
                        self.log_result("CSRF Token Retrieval", True, 
                                      f"CSRF token retrieved: {csrf_data['csrfToken'][:20]}...")
                        return csrf_data['csrfToken']
                    else:
                        self.log_result("CSRF Token Retrieval", False, 
                                      "No CSRF token in response", csrf_data)
                        return None
                except json.JSONDecodeError:
                    self.log_result("CSRF Token Retrieval", False, 
                                  "Invalid JSON response", response.text[:200])
                    return None
            else:
                self.log_result("CSRF Token Retrieval", False, 
                              f"HTTP {response.status_code}", response.text)
                return None
                
        except Exception as e:
            self.log_result("CSRF Token Retrieval", False, f"Exception: {str(e)}")
            return None

    def run_credentials_auth_test(self):
        """Run comprehensive credentials authentication testing"""
        print("🔐 Starting Credentials Sign-In Authentication Testing")
        print("=" * 80)
        print()
        
        # Test NextAuth setup
        self.test_nextauth_providers()
        self.test_nextauth_signin_page()
        
        # Get CSRF token for secure testing
        csrf_token = self.test_csrf_token_retrieval()
        
        # Test credentials signin with existing users
        self.test_credentials_signin_client_user()
        self.test_credentials_signin_admin_user()
        
        # Test security - invalid credentials
        self.test_invalid_credentials()
        
        # Test session verification
        self.test_session_verification()
        
        # Summary
        print("=" * 80)
        print("🎯 CREDENTIALS AUTHENTICATION TEST SUMMARY")
        print("=" * 80)
        print(f"Total Tests: {self.total_tests}")
        print(f"Passed: {self.passed_tests}")
        print(f"Failed: {self.total_tests - self.passed_tests}")
        print(f"Success Rate: {(self.passed_tests/self.total_tests)*100:.1f}%")
        print()
        
        # Failed tests details
        failed_tests = [r for r in self.results if not r['success']]
        if failed_tests:
            print("❌ FAILED TESTS:")
            for test in failed_tests:
                print(f"   • {test['test']}: {test['details']}")
        else:
            print("✅ ALL CREDENTIALS TESTS PASSED!")
        
        print()
        return self.passed_tests, self.total_tests, self.results

if __name__ == "__main__":
    tester = CredentialsAuthTester()
    passed, total, results = tester.run_credentials_auth_test()
    
    # Save results to file
    with open('/app/credentials_auth_results.json', 'w') as f:
        json.dump({
            'summary': {
                'total_tests': total,
                'passed_tests': passed,
                'failed_tests': total - passed,
                'success_rate': f"{(passed/total)*100:.1f}%"
            },
            'results': results,
            'timestamp': datetime.now().isoformat()
        }, f, indent=2)
    
    print(f"📊 Detailed results saved to credentials_auth_results.json")