#!/usr/bin/env python3
"""
Backend API Testing Suite for Astrology Platform
Tests all backend endpoints and integrations
"""

import requests
import json
import os
import time
from datetime import datetime

# Get base URL from environment
BASE_URL = "https://astro-client-1.preview.emergentagent.com"
API_BASE = f"{BASE_URL}/api"

class AstrologyBackendTester:
    def __init__(self):
        self.results = {
            "api_health": {"status": "pending", "details": ""},
            "database_connection": {"status": "pending", "details": ""},
            "stripe_integration": {"status": "pending", "details": ""},
            "email_service": {"status": "pending", "details": ""},
            "auth_setup": {"status": "pending", "details": ""},
            "error_handling": {"status": "pending", "details": ""}
        }
        
    def test_api_health(self):
        """Test basic API health check"""
        print("🔍 Testing API Health Check...")
        try:
            response = requests.get(f"{API_BASE}", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("message") == "API is working":
                    self.results["api_health"]["status"] = "pass"
                    self.results["api_health"]["details"] = "API health check successful"
                    print("✅ API Health Check: PASSED")
                    return True
                else:
                    self.results["api_health"]["status"] = "fail"
                    self.results["api_health"]["details"] = f"Unexpected response: {data}"
                    print(f"❌ API Health Check: FAILED - Unexpected response: {data}")
                    return False
            else:
                self.results["api_health"]["status"] = "fail"
                self.results["api_health"]["details"] = f"HTTP {response.status_code}: {response.text}"
                print(f"❌ API Health Check: FAILED - HTTP {response.status_code}")
                return False
                
        except requests.exceptions.RequestException as e:
            self.results["api_health"]["status"] = "fail"
            self.results["api_health"]["details"] = f"Request failed: {str(e)}"
            print(f"❌ API Health Check: FAILED - {str(e)}")
            return False

    def test_stripe_integration(self):
        """Test Stripe checkout session creation"""
        print("🔍 Testing Stripe Integration...")
        try:
            test_data = {
                "serviceId": "personal_tarot",
                "userId": "test@example.com",
                "serviceName": "Personal Tarot Reading",
                "price": 85,
                "duration": 60
            }
            
            response = requests.post(
                f"{API_BASE}/create-checkout",
                json=test_data,
                headers={"Content-Type": "application/json"},
                timeout=15
            )
            
            if response.status_code == 200:
                data = response.json()
                if "url" in data and "sessionId" in data:
                    self.results["stripe_integration"]["status"] = "pass"
                    self.results["stripe_integration"]["details"] = "Stripe checkout session created successfully"
                    print("✅ Stripe Integration: PASSED")
                    return True
                else:
                    self.results["stripe_integration"]["status"] = "fail"
                    self.results["stripe_integration"]["details"] = f"Missing required fields in response: {data}"
                    print(f"❌ Stripe Integration: FAILED - Missing fields: {data}")
                    return False
            else:
                self.results["stripe_integration"]["status"] = "fail"
                self.results["stripe_integration"]["details"] = f"HTTP {response.status_code}: {response.text}"
                print(f"❌ Stripe Integration: FAILED - HTTP {response.status_code}")
                return False
                
        except requests.exceptions.RequestException as e:
            self.results["stripe_integration"]["status"] = "fail"
            self.results["stripe_integration"]["details"] = f"Request failed: {str(e)}"
            print(f"❌ Stripe Integration: FAILED - {str(e)}")
            return False

    def test_database_connection(self):
        """Test database connection by fetching bookings"""
        print("🔍 Testing Database Connection...")
        try:
            response = requests.post(
                f"{API_BASE}/bookings",
                json={},
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.results["database_connection"]["status"] = "pass"
                    self.results["database_connection"]["details"] = f"Database connection successful, found {len(data)} bookings"
                    print("✅ Database Connection: PASSED")
                    return True
                else:
                    self.results["database_connection"]["status"] = "fail"
                    self.results["database_connection"]["details"] = f"Unexpected response format: {data}"
                    print(f"❌ Database Connection: FAILED - Unexpected format: {data}")
                    return False
            else:
                self.results["database_connection"]["status"] = "fail"
                self.results["database_connection"]["details"] = f"HTTP {response.status_code}: {response.text}"
                print(f"❌ Database Connection: FAILED - HTTP {response.status_code}")
                return False
                
        except requests.exceptions.RequestException as e:
            self.results["database_connection"]["status"] = "fail"
            self.results["database_connection"]["details"] = f"Request failed: {str(e)}"
            print(f"❌ Database Connection: FAILED - {str(e)}")
            return False

    def test_email_service(self):
        """Test email service configuration"""
        print("🔍 Testing Email Service...")
        try:
            test_email_data = {
                "to": "test@example.com",
                "subject": "Test Email from Astrology Platform",
                "html": "<h1>Test Email</h1><p>This is a test email to verify SMTP configuration.</p>"
            }
            
            response = requests.post(
                f"{API_BASE}/send-email",
                json=test_email_data,
                headers={"Content-Type": "application/json"},
                timeout=15
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "messageId" in data:
                    self.results["email_service"]["status"] = "pass"
                    self.results["email_service"]["details"] = "Email service working correctly"
                    print("✅ Email Service: PASSED")
                    return True
                else:
                    self.results["email_service"]["status"] = "fail"
                    self.results["email_service"]["details"] = f"Email sending failed: {data}"
                    print(f"❌ Email Service: FAILED - {data}")
                    return False
            else:
                self.results["email_service"]["status"] = "fail"
                self.results["email_service"]["details"] = f"HTTP {response.status_code}: {response.text}"
                print(f"❌ Email Service: FAILED - HTTP {response.status_code}")
                return False
                
        except requests.exceptions.RequestException as e:
            self.results["email_service"]["status"] = "fail"
            self.results["email_service"]["details"] = f"Request failed: {str(e)}"
            print(f"❌ Email Service: FAILED - {str(e)}")
            return False

    def test_auth_setup(self):
        """Test NextAuth configuration by checking auth endpoints"""
        print("🔍 Testing Authentication Setup...")
        try:
            # Test NextAuth configuration endpoint
            response = requests.get(f"{API_BASE}/auth/providers", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if "google" in data:
                    self.results["auth_setup"]["status"] = "pass"
                    self.results["auth_setup"]["details"] = "NextAuth Google provider configured correctly"
                    print("✅ Authentication Setup: PASSED")
                    return True
                else:
                    self.results["auth_setup"]["status"] = "fail"
                    self.results["auth_setup"]["details"] = f"Google provider not found: {data}"
                    print(f"❌ Authentication Setup: FAILED - Google provider missing: {data}")
                    return False
            else:
                self.results["auth_setup"]["status"] = "fail"
                self.results["auth_setup"]["details"] = f"HTTP {response.status_code}: {response.text}"
                print(f"❌ Authentication Setup: FAILED - HTTP {response.status_code}")
                return False
                
        except requests.exceptions.RequestException as e:
            self.results["auth_setup"]["status"] = "fail"
            self.results["auth_setup"]["details"] = f"Request failed: {str(e)}"
            print(f"❌ Authentication Setup: FAILED - {str(e)}")
            return False

    def test_error_handling(self):
        """Test API error handling"""
        print("🔍 Testing Error Handling...")
        try:
            # Test invalid endpoint
            response = requests.post(
                f"{API_BASE}/invalid-endpoint",
                json={"test": "data"},
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 404:
                data = response.json()
                if "error" in data:
                    self.results["error_handling"]["status"] = "pass"
                    self.results["error_handling"]["details"] = "Error handling working correctly"
                    print("✅ Error Handling: PASSED")
                    return True
                else:
                    self.results["error_handling"]["status"] = "fail"
                    self.results["error_handling"]["details"] = f"Error response missing error field: {data}"
                    print(f"❌ Error Handling: FAILED - Missing error field: {data}")
                    return False
            else:
                self.results["error_handling"]["status"] = "fail"
                self.results["error_handling"]["details"] = f"Expected 404, got HTTP {response.status_code}: {response.text}"
                print(f"❌ Error Handling: FAILED - Expected 404, got {response.status_code}")
                return False
                
        except requests.exceptions.RequestException as e:
            self.results["error_handling"]["status"] = "fail"
            self.results["error_handling"]["details"] = f"Request failed: {str(e)}"
            print(f"❌ Error Handling: FAILED - {str(e)}")
            return False

    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting Astrology Platform Backend Tests")
        print("=" * 60)
        
        # Run tests in order of priority
        tests = [
            ("API Health Check", self.test_api_health),
            ("Database Connection", self.test_database_connection),
            ("Stripe Integration", self.test_stripe_integration),
            ("Email Service", self.test_email_service),
            ("Authentication Setup", self.test_auth_setup),
            ("Error Handling", self.test_error_handling)
        ]
        
        passed = 0
        total = len(tests)
        
        for test_name, test_func in tests:
            print(f"\n📋 Running {test_name}...")
            if test_func():
                passed += 1
            time.sleep(1)  # Brief pause between tests
        
        print("\n" + "=" * 60)
        print(f"🏁 Test Results: {passed}/{total} tests passed")
        print("=" * 60)
        
        # Print detailed results
        for test_name, result in self.results.items():
            status_icon = "✅" if result["status"] == "pass" else "❌" if result["status"] == "fail" else "⏳"
            print(f"{status_icon} {test_name.replace('_', ' ').title()}: {result['status'].upper()}")
            if result["details"]:
                print(f"   Details: {result['details']}")
        
        return self.results

if __name__ == "__main__":
    tester = AstrologyBackendTester()
    results = tester.run_all_tests()
    
    # Exit with appropriate code
    failed_tests = [k for k, v in results.items() if v["status"] == "fail"]
    if failed_tests:
        print(f"\n❌ {len(failed_tests)} test(s) failed: {', '.join(failed_tests)}")
        exit(1)
    else:
        print("\n✅ All tests passed!")
        exit(0)