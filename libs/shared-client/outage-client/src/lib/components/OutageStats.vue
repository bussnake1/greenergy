<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="text-base font-semibold text-gray-900">
          Unavailable Capacity
        </h3>
        <UIcon name="i-heroicons-bolt" class="text-primary h-6 w-6" />
      </div>
    </template>
    <div class="flex flex-col items-center sm:items-start">
      <div v-if="stats" class="text-2xl sm:text-3xl font-bold">
        {{ formatNumber(stats.totalUnavailableCapacity) }} MW
      </div>
      <div v-else class="text-2xl sm:text-3xl font-bold">-</div>
      <div class="text-sm text-gray-500 mt-1 text-center sm:text-left">
        Total unavailable power plant capacity
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { OutageStats } from '../types';

defineProps<{
  stats: OutageStats | null;
}>();

function formatNumber(value: number): string {
  return new Intl.NumberFormat('hu-HU').format(value);
}
</script>
