<template>
  <DashboardLayout
    app-name="Greenergy App"
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
import { DashboardLayout } from '@greenergy/shared-ui';
import { useAuth } from '@greenergy/auth-client';

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
  {
    label: 'Power Outages',
    to: '/dashboard/power-outages',
    icon: 'i-heroicons-bolt-slash',
  },
]);
</script>
