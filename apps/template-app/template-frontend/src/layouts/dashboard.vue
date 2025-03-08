<template>
  <DashboardLayout
    app-name="Template App"
    :navigation-items="navigationItems"
    :user="user"
    @logout="logout"
  >
    <template #header-actions>
      <UButton
        icon="i-heroicons-bell"
        color="gray"
        variant="ghost"
        aria-label="Notifications"
      />
    </template>
    <slot />
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { DashboardLayout } from '@nx-template/shared-ui';
import { useAuth } from '@nx-template/auth-client';

const { user: authUser, logout } = useAuth();

// Transform the auth user to the format expected by DashboardLayout
const user = computed(() => {
  if (!authUser.value) return undefined;

  return {
    name: authUser.value.username,
    email: authUser.value.email,
  };
});

// Define navigation items
const navigationItems = ref([
  {
    label: 'Dashboard',
    to: '/dashboard',
    icon: 'i-heroicons-home',
  },
  // {
  //   label: 'API Keys',
  //   to: '/dashboard/api-keys',
  //   icon: 'i-heroicons-key',
  // },
  // {
  //   label: 'Profile',
  //   to: '/dashboard/profile',
  //   icon: 'i-heroicons-user',
  // },
  // {
  //   label: 'Settings',
  //   to: '/dashboard/settings',
  //   icon: 'i-heroicons-cog-6-tooth',
  // },
]);
</script>
