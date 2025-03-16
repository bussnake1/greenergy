<template>
  <DashboardContent
    title="Power Plant Outages"
    description="Monitor power plant unavailability and generation capacity loss"
  >
    <!-- Filters and summary stats -->
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
      <div class="lg:col-span-3">
        <DateRangeFilter
          :filters="filters"
          @update:filters="updateFilters"
          @reset="resetFilters"
        />
      </div>
      <div class="order-first lg:order-none mb-2 lg:mb-0">
        <OutageStatsCard :stats="stats" />
      </div>
    </div>

    <!-- Bar chart visualization -->
    <div class="mb-4 md:mb-6">
      <OutageBarChart
        :outages="outages"
        :loading="loading"
        :filters="filters"
      />
    </div>

    <!-- Outage list -->
    <OutageList
      :outages="outages"
      :total="total"
      :loading="loading"
      :page-size="10"
      :show-pagination="false"
      :show-export-options="true"
      :show-grouped-toggle="true"
      :grouped="showGrouped"
      @page-change="handlePageChange"
      @export-excel="exportToExcel"
      @export-csv="exportToCsv"
      @toggle-grouped="toggleGrouped"
    />
  </DashboardContent>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { DashboardContent } from '@greenergy/shared-ui';
import {
  DateRangeFilter,
  OutageList,
  OutageStatsCard,
  OutageBarChart,
} from '@greenergy/outage-client';
import {
  useOutageData,
  useOutageFilters,
  useOutageExport,
  OutageFilters,
} from '@greenergy/outage-client';

// Define layout
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth'],
});

// Set up composables
const { outages, stats, total, loading, fetchOutages, fetchStats } =
  useOutageData();
const {
  filters,
  setFilter,
  resetFilters: resetFilterValues,
} = useOutageFilters();
const { exportToExcel: doExportExcel, exportToCsv: doExportCsv } =
  useOutageExport();

// Local state
const page = ref(1);
const showGrouped = ref(false);

// Fetch data on mount
onMounted(async () => {
  await fetchOutages(filters.value, showGrouped.value);
});

// Watch for filter changes
watch(
  filters,
  async () => {
    page.value = 1;
    await fetchOutages(filters.value, showGrouped.value);
  },
  { deep: true }
);

// Update filters
const updateFilters = (updatedFilters: OutageFilters) => {
  if (updatedFilters.startDate !== undefined) {
    setFilter('startDate', updatedFilters.startDate);
  }
  if (updatedFilters.endDate !== undefined) {
    setFilter('endDate', updatedFilters.endDate);
  }
  if (updatedFilters.resourceName !== undefined) {
    setFilter('resourceName', updatedFilters.resourceName);
  }
  if (updatedFilters.resourceLocation !== undefined) {
    setFilter('resourceLocation', updatedFilters.resourceLocation);
  }
};

// Reset filters
const resetFilters = async () => {
  resetFilterValues();
  page.value = 1;
  // Increment chart key to force re-rendering
  await fetchOutages(filters.value, showGrouped.value);
};

// Handle pagination
const handlePageChange = async (newPage: number) => {
  page.value = newPage;
  // If we implement pagination in the API, we'd update this
  // Currently the API returns all results, but we could add pagination parameters
};

// Export functions
const exportToExcel = () => {
  doExportExcel(filters.value, showGrouped.value);
};

const exportToCsv = () => {
  doExportCsv(filters.value, showGrouped.value);
};

// Toggle grouped view
const toggleGrouped = async () => {
  showGrouped.value = !showGrouped.value;
  await fetchOutages(filters.value, showGrouped.value);
  // Also update the stats with the grouped value
  await fetchStats(filters.value, showGrouped.value);
};
</script>
