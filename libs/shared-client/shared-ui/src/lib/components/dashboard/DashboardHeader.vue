<template>
  <header class="dashboard-header bg-white border-b border-gray-200 py-4 px-6">
    <div class="flex items-center justify-between">
      <!-- Left side: Breadcrumbs -->
      <div class="flex items-center">
        <slot name="breadcrumbs">
          <ClientOnly>
            <UBreadcrumb
              v-if="validBreadcrumbs.length"
              :links="validBreadcrumbs"
              divider="i-heroicons-chevron-right-20-solid"
            />
          </ClientOnly>
        </slot>
      </div>

      <!-- Right side: Actions -->
      <div class="flex items-center space-x-4">
        <slot name="actions">
          <!-- Default actions can go here -->
        </slot>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useNavigation } from '../../composables/useNavigation';
import type { BreadcrumbItem } from '../../types/navigation.types';

const props = defineProps<{
  breadcrumbs?: BreadcrumbItem[];
}>();

const navigation = useNavigation();

// Ensure we have valid breadcrumbs and handle any potential errors
const validBreadcrumbs = computed(() => {
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
    console.error('Error processing breadcrumbs:', error);
    return [];
  }
});
</script>

<style scoped>
.dashboard-header {
  height: 64px;
}
</style>
