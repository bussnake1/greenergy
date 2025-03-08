<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-bold">API Keys</h2>
      <UButton
        v-if="!showGenerator"
        color="primary"
        @click="showGenerator = true"
      >
        Create API Key
      </UButton>
    </div>

    <ApiKeyGenerator
      v-if="showGenerator"
      :on-create="createApiKey"
      class="mb-8"
    />

    <div v-if="loading" class="flex justify-center py-8">
      <!-- <ULoader /> -->
      <USkeleton class="h-4 w-[200px]" />
    </div>

    <div v-else-if="error" class="mb-6">
      <UAlert title="Error" :description="error" color="red" />
    </div>

    <div v-else-if="apiKeys.length === 0" class="text-center py-8">
      <p class="text-gray-500">You don't have any API keys yet.</p>
      <UButton
        v-if="!showGenerator"
        color="primary"
        class="mt-4"
        @click="showGenerator = true"
      >
        Create your first API key
      </UButton>
    </div>

    <div v-else>
      <ApiKeyItem
        v-for="apiKey in apiKeys"
        :key="apiKey.id"
        :api-key="apiKey"
        :on-revoke="revokeApiKey"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useApiKeys } from '../composables';
import ApiKeyItem from './ApiKeyItem.vue';
import ApiKeyGenerator from './ApiKeyGenerator.vue';

const { apiKeys, loading, error, fetchApiKeys, createApiKey, revokeApiKey } =
  useApiKeys();

const showGenerator = ref(false);

onMounted(() => {
  fetchApiKeys();
});
</script>
