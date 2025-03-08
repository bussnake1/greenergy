<template>
  <div>
    <UCard class="mb-4">
      <div class="flex justify-between items-center">
        <div>
          <h3 class="text-lg font-semibold mb-2">{{ apiKey.name }}</h3>
          <div class="text-sm text-gray-500">
            <p>Created: {{ formatDate(apiKey.createdAt) }}</p>
            <p v-if="apiKey.lastUsedAt">
              Last used: {{ formatDate(apiKey.lastUsedAt) }}
            </p>
            <p v-if="apiKey.expiresAt">
              Expires: {{ formatDate(apiKey.expiresAt) }}
            </p>
          </div>
        </div>
        <div>
          <UButton
            color="red"
            variant="solid"
            :loading="isRevoking"
            @click="confirmRevoke"
          >
            Revoke
          </UButton>
        </div>
      </div>
    </UCard>

    <UModal v-model="showConfirmModal">
      <UCard>
        <template #header>
          <div class="text-xl font-semibold">Revoke API Key</div>
        </template>

        <div class="py-4">
          Are you sure you want to revoke the API key "{{ apiKey.name }}"?
        </div>

        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton color="gray" @click="showConfirmModal = false">
              Cancel
            </UButton>
            <UButton color="red" @click="handleConfirm" :loading="isRevoking">
              Revoke
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useToast } from '@nuxt/ui/dist/runtime/composables/useToast';

import { ApiKey } from '../types';

const props = defineProps<{
  apiKey: ApiKey;
  onRevoke: (id: string) => Promise<boolean>;
}>();

const isRevoking = ref(false);

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString();
};

const toast = useToast();

const showConfirmModal = ref(false);

const confirmRevoke = () => {
  showConfirmModal.value = true;
};

const handleConfirm = async () => {
  isRevoking.value = true;
  try {
    await props.onRevoke(props.apiKey.id);
    toast.add({
      title: 'API key revoked',
      color: 'green',
    });
  } catch (error) {
    toast.add({
      title: 'Failed to revoke API key',
      color: 'red',
    });
  } finally {
    isRevoking.value = false;
    showConfirmModal.value = false;
  }
};
</script>
