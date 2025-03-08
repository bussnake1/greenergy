<template>
  <div>
    <UForm :state="formState" @submit="onSubmit">
      <UFormGroup label="API Key Name" name="name">
        <UInput
          v-model="formState.name"
          placeholder="Enter a name for your API key"
        />
      </UFormGroup>

      <UFormGroup label="Expiration" name="expiresAt">
        <USelect
          v-model="formState.expiration"
          :options="expirationOptions"
          placeholder="Select expiration time"
        />
      </UFormGroup>

      <div class="flex justify-end mt-4">
        <UButton type="submit" color="primary" :loading="isCreating">
          Generate API Key
        </UButton>
      </div>
    </UForm>

    <div v-if="newApiKey" class="mt-6">
      <UAlert
        title="API Key Created"
        description="This key will only be shown once. Make sure to copy it now."
        color="green"
        class="mb-4"
      />

      <UCard>
        <div class="flex justify-between items-center">
          <div>
            <h3 class="text-lg font-semibold mb-2">{{ newApiKey.name }}</h3>
            <p class="text-sm text-gray-500">
              Created: {{ formatDate(newApiKey.createdAt) }}
            </p>
            <p v-if="newApiKey.expiresAt" class="text-sm text-gray-500">
              Expires: {{ formatDate(newApiKey.expiresAt) }}
            </p>
          </div>
        </div>

        <div class="mt-4">
          <UFormGroup label="API Key">
            <div class="flex">
              <UInput v-model="newApiKey.rawKey" readonly class="flex-grow" />
              <UButton
                color="gray"
                icon="i-heroicons-clipboard"
                square
                class="ml-2"
                @click="copyApiKey"
              />
            </div>
          </UFormGroup>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useToast } from '@nuxt/ui/dist/runtime/composables/useToast';
import { ApiKeyWithRawKey, CreateApiKeyDto } from '../types';

const props = defineProps<{
  onCreate: (data: CreateApiKeyDto) => Promise<ApiKeyWithRawKey | null>;
}>();

const toast = useToast();
const isCreating = ref(false);
const newApiKey = ref<ApiKeyWithRawKey | null>(null);

const expirationOptions = [
  { label: 'No expiration', value: null },
  { label: '30 days', value: 30 },
  { label: '60 days', value: 60 },
  { label: '90 days', value: 90 },
  { label: '1 year', value: 365 },
];

const formState = reactive({
  name: '',
  expiration: null as number | null,
});

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString();
};

const onSubmit = async () => {
  isCreating.value = true;

  try {
    const expiresAt = formState.expiration
      ? new Date(
          Date.now() + formState.expiration * 24 * 60 * 60 * 1000
        ).toISOString()
      : undefined;

    const result = await props.onCreate({
      name: formState.name,
      expiresAt,
    });

    if (result) {
      newApiKey.value = result;

      // Reset form
      formState.name = '';
      formState.expiration = null;
    }
  } catch (error) {
    console.error('Failed to create API key:', error);
  } finally {
    isCreating.value = false;
  }
};

const copyApiKey = () => {
  if (!newApiKey.value) return;

  navigator.clipboard
    .writeText(newApiKey.value.rawKey)
    .then(() => {
      console.log('toast');
      toast.add({
        title: 'API key copied to clipboard',
        color: 'green',
      });
    })
    .catch((error) => {
      console.error('Failed to copy API key:', error);
      toast.add({
        title: 'Failed to copy API key',
        color: 'red',
      });
    });
};
</script>
