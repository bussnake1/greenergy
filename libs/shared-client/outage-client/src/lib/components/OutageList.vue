<template>
  <UCard>
    <template #header>
      <div
        class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
      >
        <h3 class="text-base font-semibold text-gray-900">
          Unavailable Power Generation Units
        </h3>
        <div class="flex items-center space-x-2 justify-between sm:w-auto">
          <UButton
            v-if="showGroupedToggle"
            :variant="grouped ? 'solid' : 'outline'"
            color="primary"
            size="sm"
            @click="toggleGrouped"
          >
            {{ grouped ? 'Showing Grouped' : 'Show Grouped' }}
          </UButton>
          <UDropdown v-if="showExportOptions" :items="dropdownItems">
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-ellipsis-vertical"
            />
            <template #item="{ item }">
              <div class="flex items-center gap-2">
                <UIcon :name="item.icon" />
                <span>{{ item.label }}</span>
              </div>
            </template>
          </UDropdown>
        </div>
      </div>
    </template>

    <!-- Desktop view: Full table -->
    <div class="hidden xl:block">
      <UTable
        :columns="columns"
        :rows="outages"
        :loading="loading"
        :empty-state="{
          icon: 'i-heroicons-circle-stack',
          label: 'No outages found',
        }"
      >
        <template #loading-state>
          <div class="flex justify-center items-center h-32">
            <!-- <ULoader /> -->
          </div>
        </template>

        <template #resourceName-data="{ row }">
          <div class="font-medium">{{ row.resourceName }}</div>
        </template>

        <template #startTime-data="{ row }">
          <div>{{ formatDate(row.startTime) }}</div>
        </template>

        <template #endTime-data="{ row }">
          <div>{{ formatDate(row.endTime) }}</div>
        </template>

        <template #nominalPower-data="{ row }">
          <div class="text-right">
            {{ row.nominalPower ? `${row.nominalPower} MW` : '-' }}
          </div>
        </template>

        <template #availableCapacity-data="{ row }">
          <div class="text-right">
            {{
              row.availableCapacity !== undefined
                ? `${row.availableCapacity} MW`
                : '-'
            }}
          </div>
        </template>

        <template #unavailableCapacity-data="{ row }">
          <div class="text-right">
            {{
              row.unavailableCapacity !== undefined
                ? `${row.unavailableCapacity} MW`
                : '-'
            }}
          </div>
        </template>
      </UTable>
    </div>

    <!-- Mobile view: Card-based list -->
    <div class="xl:hidden">
      <div v-if="loading" class="flex justify-center items-center h-32">
        <!-- <ULoader /> -->
      </div>
      <div
        v-else-if="outages.length === 0"
        class="py-8 text-center text-gray-500"
      >
        <UIcon
          name="i-heroicons-circle-stack"
          class="mx-auto h-12 w-12 text-gray-400"
        />
        <h3 class="mt-2 text-sm font-medium text-gray-900">No outages found</h3>
      </div>
      <div v-else class="space-y-4">
        <div
          v-for="(row, index) in outages"
          :key="index"
          class="border border-gray-200 rounded-lg p-4 shadow-sm"
        >
          <div class="font-medium text-lg mb-2">{{ row.resourceName }}</div>
          <div class="grid grid-cols-2 gap-2 text-sm">
            <div class="text-gray-500">Location:</div>
            <div>{{ row.resourceLocation || '-' }}</div>

            <div class="text-gray-500">Start Time:</div>
            <div>{{ formatDate(row.startTime) }}</div>

            <div class="text-gray-500">End Time:</div>
            <div>{{ formatDate(row.endTime) }}</div>

            <div class="text-gray-500">Nominal Power:</div>
            <div>{{ row.nominalPower ? `${row.nominalPower} MW` : '-' }}</div>

            <div class="text-gray-500">Available Capacity:</div>
            <div>
              {{
                row.availableCapacity !== undefined
                  ? `${row.availableCapacity} MW`
                  : '-'
              }}
            </div>

            <div class="text-gray-500">Unavailable Capacity:</div>
            <div>
              {{
                row.unavailableCapacity !== undefined
                  ? `${row.unavailableCapacity} MW`
                  : '-'
              }}
            </div>

            <!-- <div class="text-gray-500">Business Type:</div>
            <div>{{ row.businessType }}</div>

            <div class="text-gray-500">Reason Code:</div>
            <div>{{ row.reasonCode || '-' }}</div> -->
          </div>
        </div>
      </div>
    </div>

    <div
      class="mt-4 flex flex-col sm:flex-row justify-between items-center gap-2"
    >
      <div>
        <span class="text-sm text-gray-500">
          Showing {{ outages.length }} of {{ total }} outages
        </span>
      </div>

      <UPagination
        v-if="showPagination && total > pageSize"
        v-model="page"
        :total="total"
        :page-count="Math.ceil(total / pageSize)"
        :ui="{ wrapper: 'flex items-center gap-1' }"
        @update:model-value="$emit('page-change', $event)"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { OutageItem } from '../types';

const props = defineProps<{
  outages: OutageItem[];
  total: number;
  loading: boolean;
  pageSize?: number;
  showPagination?: boolean;
  showExportOptions?: boolean;
  showGroupedToggle?: boolean;
  grouped?: boolean;
}>();

const emit = defineEmits<{
  (e: 'page-change', page: number): void;
  (e: 'export-excel'): void;
  (e: 'export-csv'): void;
  (e: 'toggle-grouped'): void;
}>();

// Local state
const page = ref(1);

// Dropdown items for the actions menu
const dropdownItems = [
  [
    {
      label: 'Export to Excel',
      icon: 'i-heroicons-table-cells',
      click: () => exportToExcel(),
    },
    {
      label: 'Export to CSV',
      icon: 'i-heroicons-document-text',
      click: () => exportToCsv(),
    },
  ],
];

// Default values
const pageSize = props.pageSize || 10;

// Table columns
const columns = [
  {
    key: 'resourceName',
    label: 'Resource Name',
  },
  {
    key: 'resourceLocation',
    label: 'Location',
  },
  {
    key: 'startTime',
    label: 'Start Time',
  },
  {
    key: 'endTime',
    label: 'End Time',
  },
  {
    key: 'nominalPower',
    label: 'Nominal Power (MW)',
    class: 'text-right',
  },
  {
    key: 'availableCapacity',
    label: 'Available Capacity (MW)',
    class: 'text-right',
  },
  {
    key: 'unavailableCapacity',
    label: 'Unavailable Capacity (MW)',
    class: 'text-right',
  },
  // Business type and reason code are hidden but data is still available
  // {
  //   key: 'businessType',
  //   label: 'Business Type',
  // },
  // {
  //   key: 'reasonCode',
  //   label: 'Reason Code',
  // },
];

// Format date
const formatDate = (date: Date | string) => {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  return date.toLocaleString('hu-HU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Export actions
const exportToExcel = () => {
  emit('export-excel');
};

const exportToCsv = () => {
  emit('export-csv');
};

// Toggle grouped view
const toggleGrouped = () => {
  emit('toggle-grouped');
};
</script>
