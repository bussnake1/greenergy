<template>
  <div class="bg-white rounded-lg shadow p-4">
    <div
      class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2"
    >
      <h3 class="text-lg font-medium text-gray-900">
        Daily Unavailable Capacity
      </h3>
    </div>

    <!-- Show skeleton while loading -->
    <div v-if="loading" class="h-80">
      <USkeleton class="h-full w-full" />
    </div>

    <!-- Show no data message -->
    <div v-else-if="series.length === 0" class="py-8 text-center text-gray-500">
      No data available for the selected period
    </div>

    <!-- Show chart when data is loaded -->
    <div v-else class="h-80">
      <client-only>
        <apexchart
          type="bar"
          height="100%"
          :options="chartOptions"
          :series="series"
        />
      </client-only>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { OutageItem } from '../types';
import { useOutageChartData } from '../composables/useOutageChartData';

const props = defineProps<{
  outages: OutageItem[];
  loading: boolean;
  filters: {
    startDate?: string;
    endDate?: string;
  };
}>();

// Convert props to refs for the composable
const outagesRef = computed(() => props.outages);
const startDateRef = computed(() => props.filters.startDate);
const endDateRef = computed(() => props.filters.endDate);

// Use the chart data composable
const { series, chartOptions } = useOutageChartData(
  outagesRef,
  startDateRef,
  endDateRef
);
</script>
