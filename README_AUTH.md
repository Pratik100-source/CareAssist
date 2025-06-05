# Authentication System with HTTP Interceptors

This document explains how the JWT authentication system works with HTTP interceptors, access tokens, and refresh tokens.

## Overview

The authentication system uses:
- Access tokens (short-lived, 15 minutes by default)
- Refresh tokens (long-lived, 7 days by default)
- HTTP interceptors to automatically handle token refresh

## Files Structure

- **Backend**:
  - `controllers/jwtController.js` - Handles token generation and verification
  - `controllers/authController.js` - Handles login, signup, and token refresh
  - `routes/authRouter.js` - Defines authentication endpoints

- **Frontend**:
  - `services/authService.js` - Manages authentication and HTTP interceptors
  - `services/apiService.js` - Uses the intercepted axios instance for API calls
  - `App.jsx` - Initializes auth check on app load
  - `protectedRoute.jsx` - Protects routes based on authentication and role

## How It Works

1. **Login Process**:
   - User logs in through `/api/auth/login`
   - Server provides both access token and refresh token
   - Tokens are stored in localStorage and Redux store

2. **API Requests**:
   - Every API request automatically includes the access token
   - The HTTP interceptor adds the token to the Authorization header

3. **Token Refresh**:
   - When an API call receives a 401 error:
     - The interceptor tries to refresh the token
     - If successful, it retries the original request
     - If unsuccessful, it logs the user out

4. **Protected Routes**:
   - Routes check both the Redux store and token validity

## Environment Setup

Add the following to your backend `.env` file:

```
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your_refresh_token_secret_key_here
REFRESH_TOKEN_EXPIRES_IN=7d
```

## Using the API Service

Example:

```javascript
import apiService from './services/apiService';

// Get user profile
const fetchProfile = async () => {
  const response = await apiService.patients.getProfile();
  if (response.success) {
    // Handle success
    console.log(response.data);
  } else {
    // Handle error
    console.error(response.error);
  }
};

// Create a booking
const createBooking = async (bookingData) => {
  const response = await apiService.bookings.createBooking(bookingData);
  if (response.success) {
    // Handle success
  } else {
    // Handle error
  }
};
```

## Manual Authentication Actions

```javascript
import { authService } from './services/authService';

// Login
const login = async (email, password) => {
  const result = await authService.login(email, password);
  return result.success;
};

// Logout
const logout = () => {
  authService.logout();
  // Redirect to login page
};

// Check if user is authenticated
const isLoggedIn = () => {
  return authService.isAuthenticated();
};
```

## Security Considerations

- Tokens are stored in localStorage which is vulnerable to XSS attacks
- Consider using HTTP-only cookies for production environments
- Regularly rotate your JWT secrets
- Keep access token lifetime short (15 minutes is a good default) 