<template>
  <DashboardContent
    title="Profile"
    description="Manage your account information"
  >
    <UCard class="max-w-2xl">
      <div class="space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center gap-4">
          <UAvatar
            size="xl"
            src="https://i.pravatar.cc/300"
            alt="User Avatar"
          />
          <div>
            <h3 class="text-lg font-medium">{{ user?.name || 'User' }}</h3>
            <p class="text-sm text-gray-500">
              {{ user?.email || 'user@example.com' }}
            </p>
            <div class="mt-2">
              <UButton size="sm" color="gray">Change Avatar</UButton>
            </div>
          </div>
        </div>

        <UDivider />

        <UForm :state="form" class="space-y-4">
          <UFormGroup label="Name" name="name">
            <UInput v-model="form.name" placeholder="Your name" />
          </UFormGroup>

          <UFormGroup label="Email" name="email">
            <UInput
              v-model="form.email"
              type="email"
              placeholder="Your email"
            />
          </UFormGroup>

          <UFormGroup label="Username" name="username">
            <UInput v-model="form.username" placeholder="Your username" />
          </UFormGroup>

          <UFormGroup label="Bio" name="bio">
            <UTextarea
              v-model="form.bio"
              placeholder="Tell us about yourself"
            />
          </UFormGroup>

          <div class="flex justify-end">
            <UButton type="submit" color="primary">Save Changes</UButton>
          </div>
        </UForm>
      </div>
    </UCard>
  </DashboardContent>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue';
import { DashboardContent } from '@nx-template/shared-ui';
import { useAuth } from '@nx-template/auth-client';

// Define layout
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth'],
});

const { user: authUser } = useAuth();

// Transform the auth user to the format expected by the profile page
const user = computed(() => {
  if (!authUser.value) return undefined;

  return {
    name: authUser.value.username,
    email: authUser.value.email,
  };
});

// Form state
const form = reactive({
  name: user.value?.name || '',
  email: user.value?.email || '',
  username: user.value?.name || '',
  bio: '',
});
</script>
