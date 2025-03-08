import type { AuthResponse, LoginCredentials, RegisterData, User } from '../types/auth.types';
import { ref, computed, readonly } from 'vue';
import { useState, useCookie, useFetch, navigateTo } from 'nuxt/app';

export const useAuth = () => {
  const user = useState<User | null>('auth_user', () => null);
  const isAuthenticated = computed(() => !!user.value);
  const token = useCookie('auth_token');
  const loading = ref(false);
  const error = ref<string | null>(null);

  const setUser = (newUser: User | null) => {
    user.value = newUser;
  };

  const setToken = (newToken: string | null) => {
    token.value = newToken;
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      loading.value = true;
      error.value = null;

      const { data, error: fetchError } = await useFetch<AuthResponse>('/api/auth/login', {
        method: 'POST',
        body: credentials,
      });

      if (fetchError.value) {
        throw new Error(fetchError.value.message);
      }

      if (data.value) {
        setToken(data.value.access_token);
        setUser(data.value.user);
        return navigateTo('/dashboard');
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Login failed';
      throw error.value;
    } finally {
      loading.value = false;
    }
  };

  const register = async (registerData: RegisterData) => {
    try {
      loading.value = true;
      error.value = null;

      const { data, error: fetchError } = await useFetch<AuthResponse>('/api/auth/register', {
        method: 'POST',
        body: registerData,
      });

      if (fetchError.value) {
        throw new Error(fetchError.value.message);
      }

      if (data.value) {
        setToken(data.value.access_token);
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
    setToken(null);
    navigateTo('/login');
  };

  // Initialize auth state from token
  const initAuth = async () => {
    try {
      if (token.value) {
        const { data } = await useFetch<User>('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token.value}`,
          },
        });
        if (data.value) {
          setUser(data.value);
        }
      }
    } catch {
      setToken(null);
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
  };
};
