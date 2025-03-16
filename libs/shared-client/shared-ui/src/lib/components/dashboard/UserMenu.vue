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
          <span
            v-if="!collapsed"
            class="text-sm font-medium truncate max-w-[120px]"
          >
            {{ user?.name || 'User' }}
          </span>
        </div>
        <UIcon
          v-if="!collapsed"
          name="i-heroicons-chevron-down"
          class="h-4 w-4 text-gray-500 flex-shrink-0"
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

const emit = defineEmits<{
  (e: 'logout'): void;
  (e: 'menu-click'): void;
}>();

// Default menu items - can be customized via props
const menuItems = computed(() => [
  [
    {
      label: 'API Keys',
      to: '/dashboard/api-keys',
      icon: 'i-heroicons-key',
      click: () => {
        // Emit menu-click event
        emit('menu-click');
      },
    },
    {
      label: 'Profile',
      icon: 'i-heroicons-user',
      to: '/dashboard/profile',
      click: () => {
        // Emit menu-click event
        emit('menu-click');
      },
    },
    {
      label: 'Settings',
      icon: 'i-heroicons-cog-6-tooth',
      to: '/dashboard/settings',
      click: () => {
        // Emit menu-click event
        emit('menu-click');
      },
    },
  ],
  [
    {
      label: 'Logout',
      icon: 'i-heroicons-arrow-right-on-rectangle',
      click: () => {
        // Emit menu-click event
        emit('menu-click');
        emit('logout');
      },
    },
  ],
]);
</script>

<style scoped>
.user-menu {
  position: relative;
}
</style>
