import { useAuth } from 'shared-client/auth-client';

// Auth plugin that initializes auth state and sets up persistence
export default defineNuxtPlugin(async (nuxtApp) => {
  const { initAuth, user } = useAuth();
  
  // On server, auth state should already be set by middleware
  // On client, we need to initialize from cookies
  if (process.client) {
    // Only initialize if we don't already have user data from SSR
    if (!user.value) {
      await initAuth();
    }
    
    // Add a debug function to check cookie state
    const checkCookies = () => {
      const authCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth_token='));
      
      const refreshCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('refresh_token='));
      
      console.log('Auth cookie exists:', !!authCookie);
      console.log('Refresh cookie exists:', !!refreshCookie);
      console.log('User state exists:', !!user.value);
    };
    
    // Check cookies on navigation
    nuxtApp.hook('page:finish', () => {
      checkCookies();
    });
  } else {
    // On server, log the auth state for debugging
    console.log('Server-side auth plugin: User state exists:', !!user.value);
  }
  
  return {
    provide: {
      // Provide nothing, just ensure the plugin runs
    }
  };
});
