<template>
  <UCard>
    <template #header>
      <div
        class="flex flex-col sm:flex-row sm:items-center justify-between gap-2"
      >
        <h3 class="text-base font-semibold text-gray-900">Date Range Filter</h3>
        <UButton
          size="sm"
          color="gray"
          variant="ghost"
          icon="i-heroicons-arrow-path"
          @click="resetFilters"
        />
      </div>
    </template>

    <div class="grid grid-cols-1 gap-4">
      <UFormGroup label="Date Range">
        <UPopover :popper="{ placement: 'bottom-start' }">
          <UButton
            icon="i-heroicons-calendar-days-20-solid"
            class="w-full sm:w-auto text-left justify-start sm:justify-center overflow-hidden"
          >
            <span class="truncate">{{ formatDateRange }}</span>
          </UButton>

          <template #panel="{ close }">
            <div
              class="flex flex-col sm:flex-row items-stretch sm:items-center sm:divide-x divide-gray-200 dark:divide-gray-800"
            >
              <!-- Mobile view: Predefined ranges as buttons -->
              <div class="sm:hidden mb-2 px-2 flex flex-wrap gap-2">
                <UButton
                  v-for="(range, index) in predefinedRanges"
                  :key="index"
                  :label="range.label"
                  color="gray"
                  size="xs"
                  variant="soft"
                  :class="[
                    isRangeSelected(range.duration)
                      ? 'bg-gray-100 dark:bg-gray-800'
                      : '',
                  ]"
                  @click="selectRange(range.duration)"
                />
              </div>

              <div class="hidden sm:flex flex-col py-4">
                <UButton
                  v-for="(range, index) in predefinedRanges"
                  :key="index"
                  :label="range.label"
                  color="gray"
                  variant="ghost"
                  class="rounded-none px-6"
                  :class="[
                    isRangeSelected(range.duration)
                      ? 'bg-gray-100 dark:bg-gray-800'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800/50',
                  ]"
                  truncate
                  @click="selectRange(range.duration)"
                />
              </div>

              <DatePicker v-model="dateRange" @close="close" />
            </div>
          </template>
        </UPopover>
      </UFormGroup>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <UFormGroup label="Resource Name">
          <UInput
            v-model="resourceName"
            placeholder="Filter by resource name"
            @input="debouncedUpdateResourceName"
          />
        </UFormGroup>

        <UFormGroup label="Resource Location">
          <UInput
            v-model="resourceLocation"
            placeholder="Filter by location"
            @input="debouncedUpdateResourceLocation"
          />
        </UFormGroup>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { debounce } from 'lodash-es';
import { format, sub, isSameDay } from 'date-fns';
import { DatePicker } from '@greenergy/shared-ui';
import { OutageFilters } from '../types';
import type { DatePickerRangeObject } from 'v-calendar/dist/types/src/use/datePicker';

const props = defineProps<{
  filters: OutageFilters;
}>();

const emit = defineEmits<{
  (e: 'update:filters', filters: OutageFilters): void;
  (e: 'reset'): void;
}>();

// Constants
const minDate = new Date('2025-01-01T00:00');
const maxDate = new Date('2025-02-01T23:59');

// Predefined date ranges
const predefinedRanges = [
  { label: 'Last 7 days', duration: { days: 7 } },
  { label: 'Last 14 days', duration: { days: 14 } },
  { label: 'Last 30 days', duration: { days: 30 } },
];

// Local state
const resourceName = ref(props.filters.resourceName || '');
const resourceLocation = ref(props.filters.resourceLocation || '');

// Initialize date range
const dateRange = ref<DatePickerRangeObject>({
  start: props.filters.startDate ? new Date(props.filters.startDate) : minDate,
  end: props.filters.endDate ? new Date(props.filters.endDate) : maxDate,
});

// Format date range for display
const formatDateRange = computed(() => {
  const startDate =
    dateRange.value.start instanceof Date
      ? dateRange.value.start
      : new Date(dateRange.value.start as string);

  const endDate =
    dateRange.value.end instanceof Date
      ? dateRange.value.end
      : new Date(dateRange.value.end as string);

  return `${format(startDate, 'd MMM, yyyy')} - ${format(
    endDate,
    'd MMM, yyyy'
  )}`;
});

// Check if a predefined range is selected
function isRangeSelected(duration: { days?: number }) {
  const startDate =
    dateRange.value.start instanceof Date
      ? dateRange.value.start
      : new Date(dateRange.value.start as string);

  const endDate =
    dateRange.value.end instanceof Date
      ? dateRange.value.end
      : new Date(dateRange.value.end as string);

  return (
    isSameDay(startDate, sub(new Date(), duration)) &&
    isSameDay(endDate, new Date())
  );
}

// Select a predefined range
function selectRange(duration: { days?: number }) {
  dateRange.value = {
    start: sub(new Date(), duration),
    end: new Date(),
  };
  updateDateRange();
}

// Update methods
function updateDateRange() {
  const startDate =
    dateRange.value.start instanceof Date
      ? dateRange.value.start
      : new Date(dateRange.value.start as string);

  const endDate =
    dateRange.value.end instanceof Date
      ? dateRange.value.end
      : new Date(dateRange.value.end as string);

  emit('update:filters', {
    ...props.filters,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  });
}

const debouncedUpdateResourceName = debounce(() => {
  emit('update:filters', {
    ...props.filters,
    resourceName: resourceName.value || '',
  });
}, 300);

const debouncedUpdateResourceLocation = debounce(() => {
  emit('update:filters', {
    ...props.filters,
    resourceLocation: resourceLocation.value || '',
  });
}, 300);

const resetFilters = () => {
  dateRange.value = {
    start: minDate,
    end: maxDate,
  };
  resourceName.value = '';
  resourceLocation.value = '';
  emit('reset');
};

// Watch for date range changes
watch(
  dateRange,
  () => {
    updateDateRange();
  },
  { deep: true }
);

// Watch for external changes
watch(
  () => props.filters,
  (newFilters) => {
    if (newFilters.startDate) {
      dateRange.value.start = new Date(newFilters.startDate);
    }
    if (newFilters.endDate) {
      dateRange.value.end = new Date(newFilters.endDate);
    }
    resourceName.value = newFilters.resourceName || '';
    resourceLocation.value = newFilters.resourceLocation || '';
  },
  { deep: true }
);
</script>
