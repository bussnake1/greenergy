<template>
  <UCard class="w-full max-w-sm mx-auto">
    <UForm
      :state="form"
      :validate="validate"
      @submit="handleSubmit"
      class="space-y-4"
    >
      <UFormGroup label="Username" name="username" :required="true">
        <UInput
          v-model="form.username"
          type="text"
          placeholder="Enter your username"
          autocomplete="username"
        />
      </UFormGroup>

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
          autocomplete="new-password"
        />
      </UFormGroup>

      <div v-if="error" class="text-red-500 text-sm mt-2">
        {{ error }}
      </div>

      <UButton type="submit" :loading="loading" :disabled="loading" block>
        Register
      </UButton>
    </UForm>
  </UCard>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import type { RegisterData } from '../types/auth.types';
import { useAuth } from '../composables/useAuth';

const { register, loading, error } = useAuth();

const form = reactive<RegisterData>({
  username: '',
  email: '',
  password: '',
});

const validate = (state: RegisterData) => {
  const errors = [];

  if (!state.username) {
    errors.push({
      path: 'username',
      message: 'Username is required',
    });
  } else if (state.username.length < 3) {
    errors.push({
      path: 'username',
      message: 'Username must be at least 3 characters',
    });
  }

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
    await register(form);
  } catch (err) {
    // Error is handled by useAuth composable
  }
};
</script>
