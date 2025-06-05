// Test script to verify JWT authentication
// Run with: node test-auth.js

const axios = require('axios');

// API endpoint base URL
const API_URL = 'http://localhost:3003/api';

// Store tokens
let accessToken = '';
let refreshToken = '';

// Test user credentials (modify with valid credentials)
const testUser = {
  email: 'youremail@example.com',  // Replace with a valid email
  password: 'YourPassword123!'      // Replace with a valid password
};

// Function to test login and get tokens
async function testLogin() {
  try {
    console.log('Testing login...');
    const response = await axios.post(`${API_URL}/auth/login`, testUser);
    
    accessToken = response.data.token;
    refreshToken = response.data.refreshToken;
    
    console.log('Login successful!');
    console.log('User type:', response.data.userType);
    console.log('Access token:', accessToken.substring(0, 20) + '...');
    console.log('Refresh token exists:', !!refreshToken);
    
    return true;
  } catch (error) {
    console.error('Login failed:', error.response?.data?.message || error.message);
    return false;
  }
}

// Function to test protected route
async function testProtectedRoute() {
  try {
    console.log('\nTesting protected route with valid token...');
    const response = await axios.get(`${API_URL}/test-auth`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    
    console.log('Protected route access successful!');
    console.log('Response:', response.data);
    return true;
  } catch (error) {
    console.error('Protected route access failed:', error.response?.data?.message || error.message);
    return false;
  }
}

// Function to test protected route with invalid token
async function testInvalidToken() {
  try {
    console.log('\nTesting protected route with invalid token...');
    const response = await axios.get(`${API_URL}/test-auth`, {
      headers: {
        Authorization: 'Bearer invalid_token_here'
      }
    });
    
    console.log('Should not see this - test failed');
    return false;
  } catch (error) {
    console.log('Expected error received:', error.response?.data?.message);
    return error.response?.status === 401; // Should return 401 Unauthorized
  }
}

// Function to test protected route with no token
async function testNoToken() {
  try {
    console.log('\nTesting protected route with no token...');
    const response = await axios.get(`${API_URL}/test-auth`);
    
    console.log('Should not see this - test failed');
    return false;
  } catch (error) {
    console.log('Expected error received:', error.response?.data?.message);
    return error.response?.status === 403; // Should return 403 Forbidden
  }
}

// Run all tests
async function runTests() {
  console.log('=== JWT AUTHENTICATION TEST ===\n');
  
  // Test 1: Login
  const loginSuccessful = await testLogin();
  if (!loginSuccessful) {
    console.log('\nLogin failed, cannot continue tests.');
    return;
  }
  
  // Test 2: Access protected route with valid token
  const validTokenTest = await testProtectedRoute();
  
  // Test 3: Access protected route with invalid token
  const invalidTokenTest = await testInvalidToken();
  
  // Test 4: Access protected route with no token
  const noTokenTest = await testNoToken();
  
  // Report results
  console.log('\n=== TEST RESULTS ===');
  console.log('Login test:', loginSuccessful ? 'PASSED ✓' : 'FAILED ✗');
  console.log('Valid token test:', validTokenTest ? 'PASSED ✓' : 'FAILED ✗');
  console.log('Invalid token test:', invalidTokenTest ? 'PASSED ✓' : 'FAILED ✗');
  console.log('No token test:', noTokenTest ? 'PASSED ✓' : 'FAILED ✗');
}

// Run the tests
runTests(); 