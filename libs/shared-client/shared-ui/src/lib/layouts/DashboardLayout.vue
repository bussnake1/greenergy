<template>
  <div class="dashboard-layout flex">
    <!-- Desktop sidebar -->
    <Aside
      v-model="sidebarCollapsed"
      v-model:mobileModelValue="mobileMenuOpen"
      :items="navigationItems"
      class="dashboard-layout-aside"
    >
      <template #brand>
        <slot name="brand">
          <div class="flex items-center space-x-2 overflow-hidden">
            <UIcon
              name="i-heroicons-squares-2x2"
              class="flex-shrink-0 text-primary"
            />
            <span v-if="!sidebarCollapsed" class="font-semibold truncate">
              {{ appName }}
            </span>
          </div>
        </slot>
      </template>
      <template #user>
        <slot name="user">
          <UserMenu
            :collapsed="sidebarCollapsed"
            :user="user"
            @logout="onLogout"
            @menu-click="closeMobileMenu"
          />
        </slot>
      </template>
    </Aside>

    <div class="dashboard-layout-main flex-1 flex flex-col">
      <DashboardHeader
        :breadcrumbs="breadcrumbs"
        @toggle-mobile-menu="toggleMobileMenu"
      >
        <template #breadcrumbs>
          <slot name="breadcrumbs" />
        </template>
        <template #actions>
          <slot name="header-actions" />
        </template>
      </DashboardHeader>

      <DashboardContent>
        <slot />
      </DashboardContent>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useNavigation } from '../composables/useNavigation';
import Aside from '../components/dashboard/Aside.vue';
import DashboardHeader from '../components/dashboard/DashboardHeader.vue';
import DashboardContent from '../components/dashboard/DashboardContent.vue';
import UserMenu from '../components/dashboard/UserMenu.vue';
import type { NavigationItem, BreadcrumbItem } from '../types/navigation.types';

const props = defineProps<{
  appName?: string;
  navigationItems?: NavigationItem[];
  breadcrumbs?: BreadcrumbItem[];
  user?: {
    name?: string;
    email?: string;
    avatar?: string;
  };
}>();

const emit = defineEmits<{
  (e: 'logout'): void;
}>();

// State
const sidebarCollapsed = ref(false);
const mobileMenuOpen = ref(false);
const navigation = useNavigation(props.navigationItems || []);

// Use provided breadcrumbs or auto-generated ones
const breadcrumbs = computed(() => {
  try {
    const items = props.breadcrumbs || navigation.currentBreadcrumbs.value;

    // Validate that we have an array of valid breadcrumb items
    if (!items || !Array.isArray(items)) {
      return [];
    }

    // Filter out any invalid items
    return items.filter(
      (item) => item && typeof item === 'object' && item.label
    );
  } catch (error) {
    console.error('Error processing breadcrumbs in layout:', error);
    return [];
  }
});

// Toggle mobile menu
const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
};

// Close mobile menu
const closeMobileMenu = () => {
  mobileMenuOpen.value = false;
};

// Handle logout
const onLogout = () => {
  emit('logout');
};
</script>

<style scoped>
.dashboard-layout {
  min-height: 100vh;
  overflow: hidden;
}

.dashboard-layout-main {
  transition: margin-left 0.3s ease;
  max-height: 100vh;
}
</style>
