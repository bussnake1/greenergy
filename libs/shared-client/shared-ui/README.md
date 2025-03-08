# Shared UI Library

This library provides reusable UI components for dashboard layouts and interfaces.

## Components

### Dashboard Components

- `Aside`: Sidebar navigation component for dashboard layouts
- `DashboardHeader`: Header component with breadcrumbs and actions
- `DashboardContent`: Main content wrapper for dashboard pages
- `UserMenu`: User profile dropdown menu

## Usage

Import components from the library:

```vue
<script setup>
import { Aside, DashboardLayout } from '@nx-template/shared-ui';
</script>

<template>
  <DashboardLayout>
    <!-- Your dashboard content here -->
  </DashboardLayout>
</template>
```
