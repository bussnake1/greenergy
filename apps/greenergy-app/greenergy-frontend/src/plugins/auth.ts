import { useAuth } from 'shared-client/auth-client';

export default defineNuxtPlugin(async () => {
  const { initAuth } = useAuth();
  
  // Initialize auth state
  await initAuth();
});
