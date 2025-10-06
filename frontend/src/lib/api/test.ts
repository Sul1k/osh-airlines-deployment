/**
 * API Client Test
 * Simple test to verify API connectivity and basic functionality
 */

import { apiClient, authApi, flightsApi } from './index';

/**
 * Test API connectivity
 */
export const testApiConnectivity = async () => {
  console.log('🧪 Testing API connectivity...');
  
  try {
    // Test basic connectivity with a simple GET request
    const response = await apiRequest('/flights');
    console.log('✅ API connectivity test passed');
    console.log('📊 Response:', response);
    return true;
  } catch (error) {
    console.error('❌ API connectivity test failed:', error);
    return false;
  }
};

/**
 * Test authentication flow
 */
export const testAuthentication = async () => {
  console.log('🧪 Testing authentication flow...');
  
  try {
    // Test login with admin credentials
    const loginResponse = await authApi.login({
      email: 'admin@osh.com',
      password: 'admin123'
    });
    
    console.log('✅ Login test passed');
    console.log('🔑 Token received:', !!loginResponse.access_token);
    
    // Test profile retrieval
    const profileResponse = await authApi.getProfile();
    console.log('✅ Profile test passed');
    console.log('👤 User profile:', profileResponse.user.name);
    
    return true;
  } catch (error) {
    console.error('❌ Authentication test failed:', error);
    return false;
  }
};

/**
 * Test flights API
 */
export const testFlightsApi = async () => {
  console.log('🧪 Testing flights API...');
  
  try {
    // Test getting all flights
    const flights = await flightsApi.getAll();
    console.log('✅ Flights API test passed');
    console.log('✈️ Flights count:', flights.length);
    
    return true;
  } catch (error) {
    console.error('❌ Flights API test failed:', error);
    return false;
  }
};

/**
 * Run all tests
 */
export const runAllTests = async () => {
  console.log('🚀 Starting API client tests...');
  
  const results = {
    connectivity: false,
    authentication: false,
    flights: false
  };
  
  // Test connectivity
  results.connectivity = await testApiConnectivity();
  
  // Test authentication (only if connectivity passed)
  if (results.connectivity) {
    results.authentication = await testAuthentication();
  }
  
  // Test flights API (only if authentication passed)
  if (results.authentication) {
    results.flights = await testFlightsApi();
  }
  
  console.log('📊 Test Results:', results);
  
  const allPassed = Object.values(results).every(result => result === true);
  console.log(allPassed ? '🎉 All tests passed!' : '⚠️ Some tests failed');
  
  return results;
};

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).testApi = {
    connectivity: testApiConnectivity,
    authentication: testAuthentication,
    flights: testFlightsApi,
    all: runAllTests
  };
}
