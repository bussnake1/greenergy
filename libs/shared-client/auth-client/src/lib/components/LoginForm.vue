<template>
  <UCard class="w-full max-w-sm mx-auto">
    <UForm
      :state="form"
      :validate="validate"
      @submit="handleSubmit"
      class="space-y-4"
    >
      <UFormGroup label="Email" name="email" :required="true">
        <UInput
          v-model="form.email"
          type="email"
          placeholder="Enter your email"
          autocomplete="email"
        />
      </UFormGroup>

      <UFormGroup label="Password" name="password" :required="true">
        <UInput
          v-model="form.password"
          type="password"
          placeholder="Enter your password"
          autocomplete="current-password"
        />
      </UFormGroup>

      <div v-if="error" class="text-red-500 text-sm mt-2">
        {{ error }}
      </div>

      <UButton type="submit" :loading="loading" :disabled="loading" block>
        Login
      </UButton>
    </UForm>
  </UCard>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import type { LoginCredentials } from '../types/auth.types';
import { useAuth } from '../composables/useAuth';

const { login, loading, error } = useAuth();

const form = reactive<LoginCredentials>({
  email: '',
  password: '',
});

const validate = (state: LoginCredentials) => {
  const errors = [];

  if (!state.email) {
    errors.push({
      path: 'email',
      message: 'Email is required',
    });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) {
    errors.push({
      path: 'email',
      message: 'Invalid email format',
    });
  }

  if (!state.password) {
    errors.push({
      path: 'password',
      message: 'Password is required',
    });
  } else if (state.password.length < 6) {
    errors.push({
      path: 'password',
      message: 'Password must be at least 6 characters',
    });
  }

  return errors;
};

const handleSubmit = async () => {
  try {
    // The useAuth composable now handles clearing tokens before login,
    // which prevents issues with expired tokens
    await login(form);
  } catch (err) {
    // Error is already handled by useAuth composable
    console.error('Login error:', err);
  }
};
</script>
