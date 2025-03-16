import { reactive, toRefs } from 'vue';
import { OutageFilters } from '../types';

export function useOutageFilters() {
  const state = reactive<{
    filters: OutageFilters;
  }>({
    filters: {
      startDate: '2025-01-01T00:00:00Z',
      endDate: '2025-02-01T00:00:00Z',
      resourceName: undefined,
      resourceLocation: undefined
    }
  });

  const setFilter = (key: keyof OutageFilters, value: string | undefined) => {
    state.filters[key] = value;
  };

  const resetFilters = () => {
    state.filters.startDate = '2025-01-01T00:00:00Z';
    state.filters.endDate = '2025-02-01T00:00:00Z';
    state.filters.resourceName = undefined;
    state.filters.resourceLocation = undefined;
  };

  return {
    ...toRefs(state),
    setFilter,
    resetFilters
  };
}
