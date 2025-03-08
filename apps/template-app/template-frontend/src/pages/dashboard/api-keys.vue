<template>
  <DashboardContent
    title="API Keys"
    description="Manage your API keys to access the API programmatically"
  >
    <UCard class="mt-6">
      <ApiKeyList />
    </UCard>
  </DashboardContent>
</template>

<script setup lang="ts">
import { ApiKeyList } from 'shared-client/api-key-client';
import { DashboardContent } from '@nx-template/shared-ui';

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth'],
});
</script>
