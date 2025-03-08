<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <h2 class="text-3xl font-bold">Sign in to your account</h2>
        <p class="mt-2 text-gray-600">
          Or
          <NuxtLink to="/register" class="text-primary hover:text-primary-dark">
            create a new account
          </NuxtLink>
        </p>
      </div>

      <LoginForm />
    </div>
  </div>
</template>

<script setup lang="ts">
import { LoginForm } from 'shared-client/auth-client';

definePageMeta({
  layout: 'auth',
  middleware: ['guest'],
});
</script>
