<template>
  <div class="user-menu">
    <UDropdown
      :items="menuItems"
      :popper="{ placement: 'bottom-end' }"
      class="w-full"
    >
      <UButton
        color="gray"
        variant="ghost"
        class="flex items-center space-x-2 w-full justify-between"
      >
        <div class="flex items-center space-x-2">
          <UAvatar
            v-if="user?.avatar"
            :src="user.avatar"
            :alt="user?.name || 'User'"
            size="sm"
          />
          <UIcon
            v-else
            name="i-heroicons-user-circle"
            class="text-gray-500 h-8 w-8"
          />
          <span v-if="!collapsed" class="text-sm font-medium">
            {{ user?.name || 'User' }}
          </span>
        </div>
        <UIcon
          v-if="!collapsed"
          name="i-heroicons-chevron-down"
          class="h-4 w-4 text-gray-500"
        />
      </UButton>
    </UDropdown>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const { user, collapsed } = defineProps<{
  user?: {
    name?: string;
    email?: string;
    avatar?: string;
  };
  collapsed?: boolean;
}>();

// Default menu items - can be customized via props
const menuItems = computed(() => [
  [
    {
      label: 'API Keys',
      to: '/dashboard/api-keys',
      icon: 'i-heroicons-key',
    },
    {
      label: 'Profile',
      icon: 'i-heroicons-user',
      to: '/dashboard/profile',
    },
    {
      label: 'Settings',
      icon: 'i-heroicons-cog-6-tooth',
      to: '/dashboard/settings',
    },
  ],
  [
    {
      label: 'Logout',
      icon: 'i-heroicons-arrow-right-on-rectangle',
      click: () => {
        // Emit logout event
        emit('logout');
      },
    },
  ],
]);

const emit = defineEmits<{
  (e: 'logout'): void;
}>();
</script>

<style scoped>
.user-menu {
  position: relative;
}
</style>
