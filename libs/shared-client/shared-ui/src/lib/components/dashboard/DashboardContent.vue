<template>
  <main class="dashboard-content p-6">
    <div v-if="title || $slots.actions" class="mb-6">
      <div class="flex items-center justify-between">
        <h1 v-if="title" class="text-2xl font-semibold text-gray-900">
          {{ title }}
        </h1>
        <div v-if="$slots.actions" class="flex items-center space-x-2">
          <slot name="actions" />
        </div>
      </div>
      <p v-if="description" class="mt-1 text-sm text-gray-500">
        {{ description }}
      </p>
    </div>

    <div
      class="dashboard-content-body"
      :class="{ 'bg-white rounded-lg border border-gray-200 p-6': withCard }"
    >
      <slot />
    </div>
  </main>
</template>

<script setup lang="ts">
defineProps<{
  title?: string;
  description?: string;
  withCard?: boolean;
}>();
</script>

<style scoped>
.dashboard-content {
  overflow: auto;
}
</style>
