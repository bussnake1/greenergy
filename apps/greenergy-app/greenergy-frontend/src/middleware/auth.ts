import type { NavigationGuard } from 'vue-router';
import { useAuth } from 'shared-client/auth-client';

export default defineNuxtRouteMiddleware(async (to) => {
  const { isAuthenticated, refreshAccessToken, user } = useAuth();
  
  // Check if we're already authenticated first
  if (isAuthenticated.value) {
    // Log for debugging
    // console.log('Auth middleware: User is authenticated, allowing access');
    return; // Already authenticated, allow access
  }
  
  // On server-side, we rely on the server middleware to set the user
  // If we're on server and don't have a user, redirect to login
  if (process.server) {
    // console.log('Auth middleware (server): User authenticated:', !!user.value);
    
    if (!user.value && to.path !== '/login') {
      return navigateTo({
        path: '/login',
        query: { redirect: to.fullPath }
      });
    }
    return;
  }
  
  // Client-side handling
  // Check for cookies directly to avoid potential issues with the auth state
  const accessTokenCookie = useCookie('auth_token');
  const refreshTokenCookie = useCookie('refresh_token');
  
  // Debug cookie state
  // console.log('Auth middleware (client) - access token exists:', !!accessTokenCookie.value);
  // console.log('Auth middleware (client) - refresh token exists:', !!refreshTokenCookie.value);
  
  // If we have an access token but aren't authenticated, the auth plugin will handle it
  // Just allow access if we have a token
  if (accessTokenCookie.value) {
    return;
  }
  
  // If we have a refresh token but no access token, try to refresh
  if (!accessTokenCookie.value && refreshTokenCookie.value) {
    try {
      const refreshSuccess = await refreshAccessToken();
      
      if (refreshSuccess) {
        // Successfully refreshed, allow access
        return;
      }
    } catch (error) {
      console.error('Token refresh failed in middleware:', error);
    }
  }
  
  // If we get here, we're not authenticated and couldn't refresh
  // Redirect to login with the original URL
  if (to.path !== '/login') {
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath }
    });
  }
  
  return navigateTo('/login');
}) as NavigationGuard;
