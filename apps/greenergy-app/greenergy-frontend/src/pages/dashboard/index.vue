<template>
  <DashboardContent title="Dashboard" description="Welcome to your dashboard">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- Stats cards -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold text-gray-900">Total Users</h3>
            <UIcon name="i-heroicons-users" class="text-primary h-6 w-6" />
          </div>
        </template>
        <div class="text-3xl font-bold">1,234</div>
        <div class="text-sm text-gray-500 mt-1">+12% from last month</div>
      </UCard>

      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold text-gray-900">Revenue</h3>
            <UIcon
              name="i-heroicons-currency-dollar"
              class="text-primary h-6 w-6"
            />
          </div>
        </template>
        <div class="text-3xl font-bold">$24,500</div>
        <div class="text-sm text-gray-500 mt-1">+8% from last month</div>
      </UCard>

      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold text-gray-900">
              Active Projects
            </h3>
            <UIcon name="i-heroicons-folder" class="text-primary h-6 w-6" />
          </div>
        </template>
        <div class="text-3xl font-bold">12</div>
        <div class="text-sm text-gray-500 mt-1">3 completed this month</div>
      </UCard>
    </div>

    <!-- Recent activity -->
    <div class="mt-8">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
      <UCard>
        <UTable :columns="columns" :rows="activities" />
      </UCard>
    </div>
  </DashboardContent>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { DashboardContent } from '@greenergy/shared-ui';

// Define layout
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth'],
});

// Sample data for the activity table
const columns = [
  {
    key: 'date',
    label: 'Date',
  },
  {
    key: 'user',
    label: 'User',
  },
  {
    key: 'action',
    label: 'Action',
  },
  {
    key: 'details',
    label: 'Details',
  },
];

const activities = ref([
  {
    date: '2025-02-27',
    user: 'John Doe',
    action: 'Created',
    details: 'New project "Website Redesign"',
  },
  {
    date: '2025-02-26',
    user: 'Jane Smith',
    action: 'Updated',
    details: 'Profile information',
  },
  {
    date: '2025-02-25',
    user: 'Mike Johnson',
    action: 'Completed',
    details: 'Task "Design Homepage"',
  },
  {
    date: '2025-02-24',
    user: 'Sarah Williams',
    action: 'Commented',
    details: 'On project "Mobile App"',
  },
  {
    date: '2025-02-23',
    user: 'David Brown',
    action: 'Uploaded',
    details: 'New documents',
  },
]);
</script>
