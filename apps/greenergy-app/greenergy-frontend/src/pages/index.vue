<template>
  <h1>Hello world!</h1>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  middleware: ['guest'],
});
</script>
