import { $fetch } from 'ofetch';
import { User } from '@greenergy/auth-client';

export default defineEventHandler(async (event) => {
  // Get cookies from the request
  const cookies = parseCookies(event);
  const accessToken = cookies.auth_token;
  
  if (accessToken) {
    try {
      // Get the API base URL from runtime config
      const config = useRuntimeConfig();
      const baseURL = config.apiBaseUrl || 'http://localhost:3333/api';
      
      // Verify the token by making a request to your API
      const userData = await $fetch<User>(`${baseURL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      
      // Add user data to the event context so it's available in SSR
      event.context.user = userData;
      
      // Log success for debugging
      console.log('Server auth middleware: User authenticated');
    } catch (error) {
      // Token validation failed, but we don't redirect here
      // We just don't set the user in context
      console.error('Server auth middleware error:', error);
      
      // Try to refresh the token if we have a refresh token
      const refreshToken = cookies.refresh_token;
      if (refreshToken) {
        try {
          const config = useRuntimeConfig();
          const baseURL = config.apiBaseUrl || 'http://localhost:3333/api';
          
          // Try to refresh the token
          const refreshResult = await $fetch(`${baseURL}/auth/refresh`, {
            method: 'POST',
            body: { refresh_token: refreshToken }
          });
          
          if (refreshResult && refreshResult.access_token) {
            // Try again with the new token
            const userData = await $fetch<User>(`${baseURL}/auth/me`, {
              headers: {
                Authorization: `Bearer ${refreshResult.access_token}`
              }
            });
            
            // Add user data to the event context
            event.context.user = userData;
            
            // Set the new tokens as cookies for the response
            setCookie(event, 'auth_token', refreshResult.access_token, {
              maxAge: 60 * 60, // 1 hour
              path: '/',
              httpOnly: false,
              sameSite: 'lax'
            });
            
            if (refreshResult.refresh_token) {
              setCookie(event, 'refresh_token', refreshResult.refresh_token, {
                maxAge: 60 * 60 * 24 * 7, // 7 days
                path: '/',
                httpOnly: false,
                sameSite: 'lax'
              });
            }
            
            console.log('Server auth middleware: Token refreshed successfully');
          }
        } catch (refreshError) {
          console.error('Server auth middleware: Token refresh failed', refreshError);
        }
      }
    }
  }
});
