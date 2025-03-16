<template>
  <!-- Desktop sidebar -->
  <aside
    class="dashboard-aside hidden lg:flex flex-col h-screen bg-white border-r border-gray-200 transition-all duration-300 z-10"
    :class="[{ 'w-64': !collapsed, 'w-20': collapsed }, $attrs.class]"
    v-bind="$attrs"
  >
    <!-- Logo/branding slot -->
    <div
      class="dashboard-aside-header flex items-center justify-between p-4 border-b border-gray-200"
    >
      <slot name="brand">
        <div class="flex items-center space-x-2 overflow-hidden">
          <UIcon
            name="i-heroicons-squares-2x2"
            class="flex-shrink-0 text-primary"
          />
          <span v-if="!collapsed" class="font-semibold truncate"
            >Dashboard</span
          >
        </div>
      </slot>
      <UButton
        :icon="collapsed ? 'i-heroicons-bars-3' : 'i-heroicons-chevron-left'"
        color="gray"
        variant="ghost"
        size="sm"
        @click="toggleCollapsed"
        class="flex-shrink-0"
      />
    </div>

    <!-- Navigation menu -->
    <nav class="dashboard-aside-nav flex-grow overflow-y-auto p-2">
      <ul>
        <li v-for="item in menuItems" :key="item.to">
          <NuxtLink
            :to="item.to"
            :class="[
              'flex items-center px-3 py-2 rounded-md transition-colors space-x-3',
              isActive(item.to)
                ? 'bg-primary-50 text-primary-700'
                : 'text-gray-700 hover:bg-gray-100',
            ]"
          >
            <UIcon
              v-if="item.icon"
              :name="item.icon"
              class="flex-shrink-0 mr-3"
            />
            <span v-if="!collapsed" class="truncate">{{ item.label }}</span>
          </NuxtLink>
        </li>
      </ul>
    </nav>

    <!-- User profile slot -->
    <div class="dashboard-aside-footer border-t border-gray-200 p-2">
      <slot name="user">
        <div v-if="!collapsed" class="text-sm text-gray-500">User Profile</div>
        <div v-else class="flex justify-center">
          <UIcon name="i-heroicons-user-circle" class="text-gray-500" />
        </div>
      </slot>
    </div>
  </aside>

  <!-- Mobile drawer overlay -->
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="mobileOpen"
        class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        @click="closeMobileMenu"
      ></div>
    </Transition>

    <Transition name="slide">
      <aside
        v-if="mobileOpen"
        class="dashboard-aside-mobile fixed top-0 left-0 h-full w-[280px] bg-white border-r border-gray-200 z-50 lg:hidden flex flex-col"
      >
        <!-- Mobile header -->
        <div
          class="dashboard-aside-header flex items-center justify-between p-4 border-b border-gray-200"
        >
          <slot name="brand">
            <div class="flex items-center space-x-2 overflow-hidden">
              <UIcon
                name="i-heroicons-squares-2x2"
                class="flex-shrink-0 text-primary"
              />
              <span class="font-semibold truncate">Dashboard</span>
            </div>
          </slot>
          <UButton
            icon="i-heroicons-x-mark"
            color="gray"
            variant="ghost"
            size="sm"
            @click="closeMobileMenu"
            class="flex-shrink-0"
          />
        </div>

        <!-- Mobile navigation -->
        <nav class="dashboard-aside-nav flex-grow overflow-y-auto p-2">
          <ul>
            <li v-for="item in menuItems" :key="item.to">
              <NuxtLink
                :to="item.to"
                :class="[
                  'flex items-center px-3 py-3 rounded-md transition-colors space-x-3',
                  isActive(item.to)
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-100',
                ]"
                @click="closeMobileMenu"
              >
                <UIcon
                  v-if="item.icon"
                  :name="item.icon"
                  class="flex-shrink-0 mr-3"
                />
                <span class="truncate">{{ item.label }}</span>
              </NuxtLink>
            </li>
          </ul>
        </nav>

        <!-- Mobile user profile -->
        <div class="dashboard-aside-footer border-t border-gray-200 p-4">
          <slot name="user">
            <div class="text-sm text-gray-500">User Profile</div>
          </slot>
        </div>
      </aside>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useNavigation } from '../../composables/useNavigation';
import type { NavigationItem } from '../../types/navigation.types';

// Disable automatic attribute inheritance since we have multiple root elements
defineOptions({
  inheritAttrs: false,
});

const props = defineProps<{
  items?: NavigationItem[];
  modelValue?: boolean;
  mobileModelValue?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'update:mobileModelValue', value: boolean): void;
}>();

const navigation = useNavigation(props.items || []);
const { collapsed, menuItems, isActive } = navigation;

// Mobile menu state
const mobileOpen = ref(props.mobileModelValue || false);

// Two-way binding for collapsed state
if (props.modelValue !== undefined) {
  collapsed.value = props.modelValue;
}

// Two-way binding for mobile menu state
if (props.mobileModelValue !== undefined) {
  mobileOpen.value = props.mobileModelValue;
}

// Override the toggle function to emit the update event
const toggleCollapsed = () => {
  navigation.toggleCollapsed();
  if (props.modelValue !== undefined) {
    emit('update:modelValue', collapsed.value);
  }
};

// Mobile menu functions
const closeMobileMenu = () => {
  mobileOpen.value = false;
  if (props.mobileModelValue !== undefined) {
    emit('update:mobileModelValue', false);
  }
};

// Watch for external changes to mobile menu state
if (props.mobileModelValue !== undefined) {
  watch(
    () => props.mobileModelValue,
    (newValue: boolean | undefined) => {
      mobileOpen.value = newValue || false;
    }
  );
}
</script>

<style scoped>
.dashboard-aside {
  min-height: 100vh;
}

.dashboard-aside-nav {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
}

.dashboard-aside-nav::-webkit-scrollbar {
  width: 4px;
}

.dashboard-aside-nav::-webkit-scrollbar-track {
  background: transparent;
}

.dashboard-aside-nav::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 2px;
}

/* Transitions for mobile drawer */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}
</style>
