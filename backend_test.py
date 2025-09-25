#!/usr/bin/env python3
"""
Comprehensive Backend Testing for Astrology Platform MVP Architecture
Testing the merged platform with new service structure and payment system
"""

import requests
import json
import time
import os
from datetime import datetime

# Configuration
BASE_URL = "https://celestia-astro.preview.emergentagent.com"
API_BASE = f"{BASE_URL}/api"

class AstrologyPlatformTester:
    def __init__(self):
        self.results = []
        self.total_tests = 0
        self.passed_tests = 0
        
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

    def test_api_health(self):
        """Test API health check"""
        try:
            response = requests.get(f"{API_BASE}/health", timeout=10)
            if response.status_code == 200:
                data = response.json()
                self.log_result("API Health Check", True, f"Status: {data.get('status')}")
                return True
            else:
                self.log_result("API Health Check", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_result("API Health Check", False, f"Exception: {str(e)}")
            return False

    def test_services_api(self):
        """Test /api/services endpoint - should return 5 seeded services with Stripe integration"""
        try:
            response = requests.get(f"{API_BASE}/services", timeout=10)
            if response.status_code == 200:
                services = response.json()
                if isinstance(services, list) and len(services) == 5:
                    # Check if services have Stripe integration
                    has_stripe_ids = all(
                        service.get('stripeProductId') and service.get('stripePriceId') 
                        for service in services
                    )
                    if has_stripe_ids:
                        service_names = [s.get('name') for s in services]
                        self.log_result("Services API", True, 
                                      f"Found {len(services)} services with Stripe integration: {', '.join(service_names)}")
                        return True
                    else:
                        self.log_result("Services API", False, "Services missing Stripe integration", services)
                        return False
                else:
                    self.log_result("Services API", False, f"Expected 5 services, got {len(services) if isinstance(services, list) else 'non-list'}", services)
                    return False
            else:
                self.log_result("Services API", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_result("Services API", False, f"Exception: {str(e)}")
            return False

    def test_payment_system_new(self):
        """Test new payment system /api/payments/v1/checkout/session"""
        try:
            payload = {
                "serviceKey": "personal-tarot",
                "userEmail": "test@example.com",
                "successUrl": f"{BASE_URL}/success",
                "cancelUrl": f"{BASE_URL}/cancel"
            }
            response = requests.post(f"{API_BASE}/payments/v1/checkout/session", 
                                   json=payload, timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get('url') and data.get('checkoutSessionId'):
                    self.log_result("New Payment System", True, 
                                  f"Checkout session created: {data.get('checkoutSessionId')[:20]}...")
                    return True
                else:
                    self.log_result("New Payment System", False, "Missing URL or checkoutSessionId", data)
                    return False
            else:
                self.log_result("New Payment System", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_result("New Payment System", False, f"Exception: {str(e)}")
            return False

    def test_sessions_management(self):
        """Test /api/sessions endpoint for session management"""
        try:
            # Test GET sessions
            response = requests.get(f"{API_BASE}/sessions", timeout=10)
            if response.status_code == 200:
                sessions = response.json()
                self.log_result("Sessions Management (GET)", True, 
                              f"Retrieved {len(sessions) if isinstance(sessions, list) else 'non-list'} sessions")
                
                # Test POST session creation
                payload = {
                    "serviceKey": "personal-tarot",
                    "scheduledAt": "2024-02-15T14:00:00Z",
                    "userId": "test@example.com",
                    "notes": "Test session booking"
                }
                response = requests.post(f"{API_BASE}/sessions", json=payload, timeout=10)
                if response.status_code in [200, 201]:
                    data = response.json()
                    self.log_result("Sessions Management (POST)", True, "Session created successfully")
                    return True
                else:
                    self.log_result("Sessions Management (POST)", False, f"HTTP {response.status_code}", response.text)
                    return False
            else:
                self.log_result("Sessions Management (GET)", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_result("Sessions Management", False, f"Exception: {str(e)}")
            return False

    def test_stripe_webhook(self):
        """Test Stripe webhook processing"""
        try:
            # Test webhook endpoint exists
            webhook_payload = {
                "id": "evt_test_webhook",
                "object": "event",
                "type": "checkout.session.completed",
                "data": {
                    "object": {
                        "id": "cs_test_session",
                        "customer_email": "test@example.com",
                        "amount_total": 8500,
                        "metadata": {
                            "serviceId": "personal-tarot",
                            "serviceName": "Personal Tarot Reading",
                            "duration": "60"
                        }
                    }
                }
            }
            
            # Note: This will fail signature verification, but we can test if endpoint exists
            response = requests.post(f"{API_BASE}/webhook/stripe", 
                                   json=webhook_payload, timeout=10)
            
            # Webhook should return 400 for signature verification failure, not 404
            if response.status_code == 400:
                self.log_result("Stripe Webhook", True, "Webhook endpoint exists (signature verification expected to fail)")
                return True
            elif response.status_code == 404:
                self.log_result("Stripe Webhook", False, "Webhook endpoint not found")
                return False
            else:
                self.log_result("Stripe Webhook", True, f"Webhook responded with HTTP {response.status_code}")
                return True
        except Exception as e:
            self.log_result("Stripe Webhook", False, f"Exception: {str(e)}")
            return False

    def test_user_authentication(self):
        """Test NextAuth authentication system"""
        try:
            # Test NextAuth providers endpoint
            response = requests.get(f"{API_BASE}/auth/providers", timeout=10)
            if response.status_code == 200:
                providers = response.json()
                if 'google' in providers and 'credentials' in providers:
                    self.log_result("NextAuth Providers", True, "Both Google OAuth and Credentials providers configured")
                    
                    # Test signin endpoint
                    response = requests.get(f"{API_BASE}/auth/signin", timeout=10)
                    if response.status_code == 200:
                        self.log_result("NextAuth Signin", True, "Signin endpoint accessible")
                        return True
                    else:
                        self.log_result("NextAuth Signin", False, f"HTTP {response.status_code}")
                        return False
                else:
                    self.log_result("NextAuth Providers", False, f"Missing providers. Available: {list(providers.keys())}", providers)
                    return False
            else:
                self.log_result("NextAuth Providers", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_result("NextAuth Authentication", False, f"Exception: {str(e)}")
            return False

    def test_credentials_authentication(self):
        """Test credentials sign-in with test user: test.working@example.com / workingtest123"""
        try:
            # First get CSRF token
            csrf_response = requests.get(f"{API_BASE}/auth/csrf", timeout=10)
            if csrf_response.status_code != 200:
                self.log_result("Credentials Auth - CSRF Token", False, f"HTTP {csrf_response.status_code}")
                return False
                
            csrf_token = csrf_response.json().get('csrfToken')
            if not csrf_token:
                self.log_result("Credentials Auth - CSRF Token", False, "No CSRF token in response")
                return False
                
            self.log_result("Credentials Auth - CSRF Token", True, "CSRF token obtained successfully")
            
            # Test credentials sign-in
            signin_data = {
                'email': 'test.working@example.com',
                'password': 'workingtest123',
                'csrfToken': csrf_token,
                'callbackUrl': f"{BASE_URL}/portal",
                'json': 'true'
            }
            
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            }
            
            # Convert to form data
            form_data = '&'.join([f"{k}={v}" for k, v in signin_data.items()])
            
            response = requests.post(
                f"{API_BASE}/auth/callback/credentials",
                data=form_data,
                headers=headers,
                timeout=10,
                allow_redirects=False
            )
            
            print(f"    Credentials Auth Response Status: {response.status_code}")
            print(f"    Response Headers: {dict(response.headers)}")
            print(f"    Response Body: {response.text[:300]}...")
            
            # Check for successful authentication
            if response.status_code in [200, 302]:
                if response.status_code == 302:
                    location = response.headers.get('location', '')
                    if '/portal' in location:
                        self.log_result("Credentials Authentication", True, 
                                      f"Successful authentication - redirected to portal: {location}")
                        return True
                    elif 'error' in location.lower():
                        self.log_result("Credentials Authentication", False, 
                                      f"Authentication failed - error redirect: {location}")
                        return False
                    else:
                        self.log_result("Credentials Authentication", False, 
                                      f"Unexpected redirect: {location}")
                        return False
                else:
                    # Check response body for success indicators
                    response_text = response.text.lower()
                    if 'error' in response_text:
                        self.log_result("Credentials Authentication", False, 
                                      f"Authentication error: {response.text}")
                        return False
                    else:
                        self.log_result("Credentials Authentication", True, 
                                      f"Authentication successful (HTTP 200)")
                        return True
            else:
                self.log_result("Credentials Authentication", False, 
                              f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Credentials Authentication", False, f"Exception: {str(e)}")
            return False

    def test_session_establishment(self):
        """Test session establishment after credentials sign-in"""
        try:
            # Create a session to test authentication flow
            session = requests.Session()
            
            # First get CSRF token
            csrf_response = session.get(f"{API_BASE}/auth/csrf", timeout=10)
            if csrf_response.status_code != 200:
                self.log_result("Session Establishment", False, "Could not get CSRF token")
                return False
                
            csrf_token = csrf_response.json().get('csrfToken')
            
            # Attempt sign-in
            signin_data = {
                'email': 'test.working@example.com',
                'password': 'workingtest123',
                'csrfToken': csrf_token,
                'callbackUrl': f"{BASE_URL}/portal",
                'json': 'true'
            }
            
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            }
            
            form_data = '&'.join([f"{k}={v}" for k, v in signin_data.items()])
            
            signin_response = session.post(
                f"{API_BASE}/auth/callback/credentials",
                data=form_data,
                headers=headers,
                timeout=10,
                allow_redirects=False
            )
            
            # Check if we have session cookies
            cookies = session.cookies.get_dict()
            has_session_cookie = any('session' in cookie.lower() or 'auth' in cookie.lower() 
                                    for cookie in cookies.keys())
            
            if has_session_cookie:
                self.log_result("Session Establishment", True, 
                              f"Session cookies established: {list(cookies.keys())}")
                return True
            else:
                self.log_result("Session Establishment", False, 
                              f"No session cookies found. Available cookies: {list(cookies.keys())}")
                return False
                
        except Exception as e:
            self.log_result("Session Establishment", False, f"Exception: {str(e)}")
            return False

    def test_database_user_verification(self):
        """Verify test user exists in database"""
        try:
            # Try to register the same user to see if they already exist
            registration_data = {
                'email': 'test.working@example.com',
                'password': 'workingtest123',
                'name': 'Test Working User'
            }
            
            response = requests.post(
                f"{API_BASE}/register",
                json=registration_data,
                timeout=10
            )
            
            if response.status_code == 400:
                response_data = response.json()
                if 'already exists' in response_data.get('message', '').lower():
                    self.log_result("Database User Verification", True, 
                                  f"Test user test.working@example.com exists in database")
                    return True
                else:
                    self.log_result("Database User Verification", False, 
                                  f"Unexpected 400 response: {response_data}")
                    return False
            elif response.status_code == 201:
                self.log_result("Database User Verification", True, 
                              f"Test user test.working@example.com was just created")
                return True
            else:
                self.log_result("Database User Verification", False, 
                              f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Database User Verification", False, f"Exception: {str(e)}")
            return False

    def test_user_registration(self):
        """Test user registration with enhanced email templates"""
        try:
            payload = {
                "email": f"testuser_{int(time.time())}@example.com",
                "password": "SecurePass123!",
                "name": "Test User",
                "birthDate": "1990-05-15",
                "birthTime": "14:30",
                "birthPlace": "New York, NY"
            }
            
            response = requests.post(f"{API_BASE}/register", json=payload, timeout=10)
            if response.status_code == 201:
                data = response.json()
                if data.get('user') and data.get('message'):
                    self.log_result("User Registration", True, 
                                  f"User created: {data['user'].get('email')}")
                    return True
                else:
                    self.log_result("User Registration", False, "Invalid response format", data)
                    return False
            else:
                self.log_result("User Registration", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_result("User Registration", False, f"Exception: {str(e)}")
            return False

    def test_admin_portal_new_structure(self):
        """Test admin portal APIs with new service structure"""
        try:
            # Test admin stats
            response = requests.post(f"{API_BASE}/admin/stats", json={}, timeout=10)
            if response.status_code == 200:
                stats = response.json()
                self.log_result("Admin Stats", True, f"Retrieved stats: {list(stats.keys())}")
                
                # Test admin users with new structure
                response = requests.post(f"{API_BASE}/admin/users", json={}, timeout=10)
                if response.status_code == 200:
                    users = response.json()
                    self.log_result("Admin Users", True, f"Retrieved {len(users)} users")
                    
                    # Test admin sessions
                    response = requests.post(f"{API_BASE}/admin/sessions", json={}, timeout=10)
                    if response.status_code == 200:
                        sessions = response.json()
                        self.log_result("Admin Sessions", True, f"Retrieved {len(sessions)} sessions")
                        return True
                    else:
                        self.log_result("Admin Sessions", False, f"HTTP {response.status_code}")
                        return False
                else:
                    self.log_result("Admin Users", False, f"HTTP {response.status_code}")
                    return False
            else:
                self.log_result("Admin Stats", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_result("Admin Portal", False, f"Exception: {str(e)}")
            return False

    def test_client_portal_updated(self):
        """Test client portal APIs with updated service integration"""
        try:
            # Test user profile
            response = requests.post(f"{API_BASE}/user/profile", json={}, timeout=10)
            if response.status_code == 200:
                profile = response.json()
                self.log_result("Client Profile", True, f"Profile data: {list(profile.keys())}")
                
                # Test user sessions with updated structure
                response = requests.post(f"{API_BASE}/user/sessions", json={}, timeout=10)
                if response.status_code == 200:
                    sessions = response.json()
                    self.log_result("Client Sessions", True, f"Retrieved {len(sessions)} sessions")
                    
                    # Test birth chart generation
                    response = requests.post(f"{API_BASE}/user/generate-birth-chart", json={}, timeout=10)
                    if response.status_code == 200:
                        chart = response.json()
                        self.log_result("Birth Chart Generation", True, "Chart generated successfully")
                        return True
                    else:
                        self.log_result("Birth Chart Generation", False, f"HTTP {response.status_code}")
                        return False
                else:
                    self.log_result("Client Sessions", False, f"HTTP {response.status_code}")
                    return False
            else:
                self.log_result("Client Profile", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_result("Client Portal", False, f"Exception: {str(e)}")
            return False

    def test_enhanced_email_system(self):
        """Test enhanced email templates and notifications"""
        try:
            # Test email sending with enhanced templates
            payload = {
                "to": "test@example.com",
                "type": "booking_confirmation",
                "data": {
                    "bookingId": "test_booking_123",
                    "customerName": "Test Customer",
                    "serviceName": "Personal Tarot Reading",
                    "duration": "60",
                    "amount": "85.00",
                    "sessionDateTime": "2024-02-15 at 2:00 PM"
                }
            }
            
            response = requests.post(f"{API_BASE}/send-email", json=payload, timeout=10)
            if response.status_code == 200:
                result = response.json()
                if result.get('success') and result.get('messageId'):
                    self.log_result("Enhanced Email System", True, 
                                  f"Email sent successfully: {result.get('messageId')}")
                    return True
                else:
                    self.log_result("Enhanced Email System", False, "Email sending failed", result)
                    return False
            else:
                self.log_result("Enhanced Email System", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_result("Enhanced Email System", False, f"Exception: {str(e)}")
            return False

    def test_legacy_payment_system(self):
        """Test existing payment system for compatibility"""
        try:
            payload = {
                "serviceId": "personal-tarot",
                "userId": "test@example.com",
                "serviceName": "Personal Tarot Reading",
                "price": 85,
                "duration": 60
            }
            response = requests.post(f"{API_BASE}/create-checkout", 
                                   json=payload, timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get('url') and data.get('sessionId'):
                    self.log_result("Legacy Payment System", True, 
                                  f"Legacy checkout working: {data.get('sessionId')[:20]}...")
                    return True
                else:
                    self.log_result("Legacy Payment System", False, "Missing URL or sessionId", data)
                    return False
            else:
                self.log_result("Legacy Payment System", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_result("Legacy Payment System", False, f"Exception: {str(e)}")
            return False

    def run_comprehensive_test(self):
        """Run all tests for the merged astrology platform"""
        print("🌟 Starting Comprehensive Backend Testing for Astrology Platform MVP")
        print("=" * 80)
        print()
        
        # Core API Tests
        self.test_api_health()
        
        # New MVP Architecture Tests
        self.test_services_api()
        self.test_payment_system_new()
        self.test_sessions_management()
        self.test_stripe_webhook()
        
        # Authentication & User Management
        self.test_user_authentication()
        self.test_database_user_verification()
        self.test_credentials_authentication()
        self.test_session_establishment()
        self.test_user_registration()
        
        # Portal Tests with New Structure
        self.test_admin_portal_new_structure()
        self.test_client_portal_updated()
        
        # Enhanced Features
        self.test_enhanced_email_system()
        
        # Legacy Compatibility
        self.test_legacy_payment_system()
        
        # Summary
        print("=" * 80)
        print("🎯 TEST SUMMARY")
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
            print("✅ ALL TESTS PASSED!")
        
        print()
        return self.passed_tests, self.total_tests, self.results

if __name__ == "__main__":
    tester = AstrologyPlatformTester()
    passed, total, results = tester.run_comprehensive_test()
    
    # Save results to file
    with open('/app/test_results_detailed.json', 'w') as f:
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
    
    print(f"📊 Detailed results saved to test_results_detailed.json")