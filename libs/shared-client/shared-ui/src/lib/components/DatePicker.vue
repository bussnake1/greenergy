<script setup lang="ts">
import { DatePicker as VCalendarDatePicker } from 'v-calendar';
// @ts-ignore
import type {
  DatePickerDate,
  DatePickerRangeObject,
} from 'v-calendar/dist/types/src/use/datePicker';
import 'v-calendar/dist/style.css';
import { PropType, computed, ref, onMounted, onUnmounted } from 'vue';

defineOptions({
  inheritAttrs: false,
});

const props = defineProps({
  modelValue: {
    type: [Date, Object] as PropType<
      DatePickerDate | DatePickerRangeObject | null
    >,
    default: null,
  },
});

const emit = defineEmits(['update:model-value', 'close']);

const date = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:model-value', value);
    emit('close');
  },
});

// Responsive calendar columns
const isMobile = ref(false);
const calendarColumns = computed(() => (isMobile.value ? 1 : 2));

// Check if device is mobile
const checkMobile = () => {
  isMobile.value = window.innerWidth < 768; // md breakpoint
};

// Set up responsive behavior
onMounted(() => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
});

const attrs = {
  transparent: true,
  borderless: true,
  color: 'primary',
  'is-dark': { selector: 'html', darkClass: 'dark' },
  'first-day-of-week': 2,
};

function onDayClick(_: any, event: MouseEvent): void {
  const target = event.target as HTMLElement;
  target.blur();
}
</script>

<template>
  <VCalendarDatePicker
    v-if="date && (date as DatePickerRangeObject)?.start && (date as DatePickerRangeObject)?.end"
    v-model.range="date"
    :columns="calendarColumns"
    v-bind="{ ...attrs, ...$attrs }"
    @dayclick="onDayClick"
  />
  <VCalendarDatePicker
    v-else
    v-model="date"
    v-bind="{ ...attrs, ...$attrs }"
    @dayclick="onDayClick"
  />
</template>

<style>
:root {
  --vc-gray-50: rgb(var(--color-gray-50));
  --vc-gray-100: rgb(var(--color-gray-100));
  --vc-gray-200: rgb(var(--color-gray-200));
  --vc-gray-300: rgb(var(--color-gray-300));
  --vc-gray-400: rgb(var(--color-gray-400));
  --vc-gray-500: rgb(var(--color-gray-500));
  --vc-gray-600: rgb(var(--color-gray-600));
  --vc-gray-700: rgb(var(--color-gray-700));
  --vc-gray-800: rgb(var(--color-gray-800));
  --vc-gray-900: rgb(var(--color-gray-900));
}

.vc-primary {
  --vc-accent-50: rgb(var(--color-primary-50));
  --vc-accent-100: rgb(var(--color-primary-100));
  --vc-accent-200: rgb(var(--color-primary-200));
  --vc-accent-300: rgb(var(--color-primary-300));
  --vc-accent-400: rgb(var(--color-primary-400));
  --vc-accent-500: rgb(var(--color-primary-500));
  --vc-accent-600: rgb(var(--color-primary-600));
  --vc-accent-700: rgb(var(--color-primary-700));
  --vc-accent-800: rgb(var(--color-primary-800));
  --vc-accent-900: rgb(var(--color-primary-900));
}

/* Responsive styles for the date picker */
@media (max-width: 767px) {
  /* Make sure the calendar fits within the viewport */
  .vc-container {
    width: 100% !important;
    max-width: 100%;
  }

  /* Adjust the day cells to be more touch-friendly */
  .vc-day {
    min-height: 40px !important;
    min-width: 40px !important;
  }

  /* Ensure the popover doesn't overflow */
  .vc-popover-content-wrapper {
    max-width: 90vw !important;
  }

  /* Make navigation buttons more touch-friendly */
  .vc-nav-arrow {
    padding: 8px !important;
  }
}
</style>
