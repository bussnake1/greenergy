import type { NavigationGuard } from 'vue-router';
import { useAuth } from 'shared-client/auth-client';

export default defineNuxtRouteMiddleware(() => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated.value) {
    return navigateTo('/dashboard');
  }
}) as NavigationGuard;
