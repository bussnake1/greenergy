<template>
  <DashboardContent title="Settings" description="Manage your account settings">
    <UCard class="max-w-2xl">
      <UTabs :items="tabs" :key="'settings-tabs'">
        <template #account>
          <div class="space-y-6 py-2" :key="'account-tab'">
            <h3 class="text-lg font-medium">Account Settings</h3>

            <UDivider />

            <UForm :state="accountForm" class="space-y-4">
              <UFormGroup label="Email Notifications" name="emailNotifications">
                <UToggle v-model="accountForm.emailNotifications" />
                <template #hint>
                  Receive email notifications about account activity
                </template>
              </UFormGroup>

              <UFormGroup label="Two-Factor Authentication" name="twoFactor">
                <UToggle v-model="accountForm.twoFactor" />
                <template #hint>
                  Enable two-factor authentication for added security
                </template>
              </UFormGroup>

              <UFormGroup
                label="Session Timeout (minutes)"
                name="sessionTimeout"
              >
                <USelect
                  v-model="accountForm.sessionTimeout"
                  :options="[
                    { label: '15 minutes', value: 15 },
                    { label: '30 minutes', value: 30 },
                    { label: '1 hour', value: 60 },
                    { label: '2 hours', value: 120 },
                  ]"
                />
              </UFormGroup>

              <div class="flex justify-end">
                <UButton type="submit" color="primary"
                  >Save Account Settings</UButton
                >
              </div>
            </UForm>
          </div>
        </template>

        <template #appearance>
          <div class="space-y-6 py-2" :key="'appearance-tab'">
            <h3 class="text-lg font-medium">Appearance Settings</h3>

            <UDivider />

            <UForm :state="appearanceForm" class="space-y-4">
              <UFormGroup label="Theme" name="theme">
                <USelect
                  v-model="appearanceForm.theme"
                  :options="[
                    { label: 'Light', value: 'light' },
                    { label: 'Dark', value: 'dark' },
                    { label: 'System', value: 'system' },
                  ]"
                />
              </UFormGroup>

              <UFormGroup
                label="Sidebar Collapsed by Default"
                name="sidebarCollapsed"
              >
                <UToggle v-model="appearanceForm.sidebarCollapsed" />
              </UFormGroup>

              <UFormGroup label="Density" name="density">
                <URadioGroup
                  v-model="appearanceForm.density"
                  :options="[
                    { label: 'Comfortable', value: 'comfortable' },
                    { label: 'Compact', value: 'compact' },
                  ]"
                />
              </UFormGroup>

              <div class="flex justify-end">
                <UButton type="submit" color="primary"
                  >Save Appearance Settings</UButton
                >
              </div>
            </UForm>
          </div>
        </template>

        <template #security>
          <div class="space-y-6 py-2" :key="'security-tab'">
            <h3 class="text-lg font-medium">Security Settings</h3>

            <UDivider />

            <UForm :state="securityForm" class="space-y-4">
              <UFormGroup label="Change Password" name="password">
                <UInput
                  id="current-password"
                  v-model="securityForm.currentPassword"
                  type="password"
                  placeholder="Current password"
                />
                <UInput
                  id="new-password"
                  v-model="securityForm.newPassword"
                  type="password"
                  placeholder="New password"
                  class="mt-2"
                />
                <UInput
                  id="confirm-new-password"
                  v-model="securityForm.confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  class="mt-2"
                />
              </UFormGroup>

              <UFormGroup label="Active Sessions" name="sessions">
                <div class="border rounded-md divide-y">
                  <div
                    v-for="(session, index) in activeSessions"
                    :key="index"
                    class="p-3 flex justify-between items-center"
                  >
                    <div>
                      <div class="font-medium">{{ session.device }}</div>
                      <div class="text-sm text-gray-500">
                        {{ session.location }} · {{ session.lastActive }}
                      </div>
                    </div>
                    <UButton
                      v-if="!session.current"
                      size="sm"
                      color="red"
                      variant="ghost"
                      icon="i-heroicons-x-mark"
                    >
                      Revoke
                    </UButton>
                    <UBadge v-else color="primary">Current</UBadge>
                  </div>
                </div>
              </UFormGroup>

              <div class="flex justify-end">
                <UButton type="submit" color="primary">Update Password</UButton>
              </div>
            </UForm>
          </div>
        </template>
      </UTabs>
    </UCard>
  </DashboardContent>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { DashboardContent } from '@greenergy/shared-ui';

// Define layout
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth'],
});

// Tabs configuration
const tabs = [
  {
    label: 'Account',
    slot: 'account',
    icon: 'i-heroicons-user',
  },
  {
    label: 'Appearance',
    slot: 'appearance',
    icon: 'i-heroicons-paint-brush',
  },
  {
    label: 'Security',
    slot: 'security',
    icon: 'i-heroicons-shield-check',
  },
];

// Account settings form
const accountForm = reactive({
  emailNotifications: true,
  twoFactor: false,
  sessionTimeout: 30,
});

// Appearance settings form
const appearanceForm = reactive({
  theme: 'light',
  sidebarCollapsed: false,
  density: 'comfortable',
});

// Security form
const securityForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
});

// Sample active sessions
const activeSessions = ref([
  {
    device: 'Chrome on macOS',
    location: 'Budapest, Hungary',
    lastActive: 'Now',
    current: true,
  },
  {
    device: 'Safari on iPhone',
    location: 'Budapest, Hungary',
    lastActive: '2 hours ago',
    current: false,
  },
  {
    device: 'Firefox on Windows',
    location: 'Vienna, Austria',
    lastActive: '3 days ago',
    current: false,
  },
]);
</script>
