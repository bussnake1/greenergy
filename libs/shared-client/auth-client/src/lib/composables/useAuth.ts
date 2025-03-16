import type { AuthResponse, LoginCredentials, RegisterData, User, TokenResponse } from '../types/auth.types';
import { ref, computed, readonly } from 'vue';
import { useState, useCookie, useFetch, navigateTo, useRuntimeConfig } from 'nuxt/app';
import { $fetch, FetchOptions } from 'ofetch';

export const useAuth = () => {
  // Get the Nuxt app instance to access SSR context
  const nuxtApp = useNuxtApp();
  
  // Check if there's server-provided user data
  const initialUser = process.server && nuxtApp.ssrContext?.event.context.user 
    ? nuxtApp.ssrContext.event.context.user 
    : null;
  
  // Initialize state with server data if available
  const user = useState<User | null>('auth_user', () => initialUser);
  const isAuthenticated = computed(() => !!user.value);
  const accessToken = useCookie('auth_token', {
    maxAge: 60 * 60, // 1 hour in seconds
    expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
    path: '/',
    sameSite: 'lax',
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production'
  });
  const refreshToken = useCookie('refresh_token', {
    maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
    expires: new Date(Date.now() + 60 * 60 * 24 * 7 * 1000), // 7 days from now
    path: '/',
    sameSite: 'lax',
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production'
  });
  const loading = ref(false);
  const error = ref<string | null>(null);
  const isRefreshing = ref(false);

  const setUser = (newUser: User | null) => {
    user.value = newUser;
  };

  const setTokens = (access: string | null, refresh: string | null) => {
    accessToken.value = access;
    refreshToken.value = refresh;
  };

  const clearTokens = () => {
    accessToken.value = null;
    refreshToken.value = null;
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      loading.value = true;
      error.value = null;
      
      // Clear any existing tokens before login attempt
      clearTokens();

      const { data, error: fetchError } = await useFetch<AuthResponse>('/api/auth/login', {
        method: 'POST',
        body: credentials,
        headers: {
          // Explicitly do not include an Authorization header
          Authorization: ''
        }
      });

      if (fetchError.value) {
        throw new Error(fetchError.value.message);
      }

      if (data.value) {
        setTokens(data.value.access_token, data.value.refresh_token);
        setUser(data.value.user);
        
        // Check if there's a redirect parameter in the URL
        const route = useRoute();
        const redirectPath = route.query.redirect as string;
        
        if (redirectPath) {
          return navigateTo(redirectPath);
        } else {
          return navigateTo('/dashboard');
        }
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Login failed';
      throw error.value;
    } finally {
      loading.value = false;
    }
  };

  // Function to add authorization header to requests
  const addAuthHeader = (options: any = {}) => {
    if (!options.headers) {
      options.headers = {};
    }
    
    if (accessToken.value) {
      options.headers.Authorization = `Bearer ${accessToken.value}`;
    }
    
    return options;
  };
  
  // Enhanced fetch function that handles token refresh
  const authFetch = async <T = any>(url: string, options: any = {}): Promise<T> => {
    try {
      // Don't add token to login/register/refresh requests
      const shouldAddAuth = !(
        url.includes('/api/auth/login') || 
        url.includes('/api/auth/register') ||
        url.includes('/api/auth/refresh')
      );
      
      const fetchOptions = shouldAddAuth ? addAuthHeader(options) : options;
      
      // Make the request
      const response = await $fetch(url, fetchOptions);
      return response;
    } catch (error: any) {
      // If error is due to expired token, try to refresh
      if (error.status === 401 && refreshToken.value && !isRefreshing.value) {
        try {
          // Try to refresh the token
          const refreshed = await refreshAccessToken();
          
          if (refreshed) {
            // Retry the original request with new token
            const newOptions = shouldAddAuth ? addAuthHeader(options) : options;
            return await $fetch(url, newOptions);
          }
        } catch (refreshError) {
          // If refresh fails, proceed with original error
        }
      }
      
      // If we can't handle it, rethrow
      throw error;
    }
  };
  
  // Helper function to refresh access token
  const refreshAccessToken = async (): Promise<boolean> => {
    if (!refreshToken.value || isRefreshing.value) {
      return false;
    }

    try {
      isRefreshing.value = true;
      
      const data = await $fetch<TokenResponse>('/api/auth/refresh', {
        method: 'POST',
        body: { refresh_token: refreshToken.value },
      });

      if (!data) {
        // If refresh fails, clear tokens and return false
        clearTokens();
        setUser(null);
        return false;
      }

      // Update only the access token
      accessToken.value = data.access_token;
      
      // Update refresh token if a new one was provided
      if (data.refresh_token) {
        refreshToken.value = data.refresh_token;
      }
      
      return true;
    } catch (err) {
      clearTokens();
      setUser(null);
      return false;
    } finally {
      isRefreshing.value = false;
    }
  };

  const register = async (registerData: RegisterData) => {
    try {
      loading.value = true;
      error.value = null;

      // Clear any existing tokens before registration
      clearTokens();

      const { data, error: fetchError } = await useFetch<AuthResponse>('/api/auth/register', {
        method: 'POST',
        body: registerData,
      });

      if (fetchError.value) {
        throw new Error(fetchError.value.message);
      }

      if (data.value) {
        setTokens(data.value.access_token, data.value.refresh_token);
        setUser(data.value.user);
        return navigateTo('/dashboard');
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Registration failed';
      throw error.value;
    } finally {
      loading.value = false;
    }
  };

  const logout = () => {
    setUser(null);
    clearTokens();
    navigateTo('/login');
  };

  // Initialize auth state from token
  const initAuth = async () => {
    // Only proceed if we have a token
    if (!accessToken.value) {
      return;
    }
    
    try {
      // First, try to get user data with the current token
      try {
        // Use a direct fetch first to avoid potential token refresh logic
        const userData = await $fetch<User>('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${accessToken.value}`
          }
        });
        
        if (userData) {
          setUser(userData);
          return; // Success, exit early
        }
      } catch (directError: any) {
        // Only attempt refresh if it's a 401 error
        if (directError.status === 401 && refreshToken.value) {
          try {
            // Try to refresh the token
            const refreshed = await refreshAccessToken();
            
            if (refreshed) {
              // Try again with the new token
              const userData = await $fetch<User>('/api/auth/me', {
                headers: {
                  Authorization: `Bearer ${accessToken.value}`
                }
              });
              
              if (userData) {
                setUser(userData);
                return; // Success after refresh, exit early
              }
            }
          } catch (refreshError) {
            // Only clear tokens if refresh explicitly failed
            // Don't clear here, let the outer catch handle it
            console.error('Token refresh failed:', refreshError);
          }
        }
        
        // If we get here, both direct fetch and refresh failed
        // Only clear user, not tokens yet
        setUser(null);
      }
    } catch (error) {
      // Only clear tokens on catastrophic errors
      console.error('Auth initialization error:', error);
      setUser(null);
    }
  };

  return {
    user: readonly(user),
    isAuthenticated,
    loading: readonly(loading),
    error: readonly(error),
    login,
    register,
    logout,
    initAuth,
    refreshAccessToken,
    authFetch, // Expose the enhanced fetch function
  };
};
