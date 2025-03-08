<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <h2 class="text-3xl font-bold">Create a new account</h2>
        <p class="mt-2 text-gray-600">
          Or
          <NuxtLink to="/login" class="text-primary hover:text-primary-dark">
            sign in to your account
          </NuxtLink>
        </p>
      </div>

      <RegisterForm />
    </div>
  </div>
</template>

<script setup lang="ts">
import { RegisterForm } from 'shared-client/auth-client';

definePageMeta({
  layout: 'auth',
  middleware: ['guest'],
});
</script>
