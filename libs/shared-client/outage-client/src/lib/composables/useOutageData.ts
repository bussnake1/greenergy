import { ref, Ref } from 'vue';
import { useFetch, useCookie } from 'nuxt/app';
import { OutageItem, OutageStats, OutageFilters, OutageResponse } from '../types';

export function useOutageData() {
  const outages: Ref<OutageItem[]> = ref([]);
  const stats: Ref<OutageStats | null> = ref(null);
  const total: Ref<number> = ref(0);
  const loading: Ref<boolean> = ref(false);
  const error: Ref<string | null> = ref(null);
  const token = useCookie('auth_token');

  const fetchOutages = async (
    filters: OutageFilters, 
    grouped: boolean = false
  ) => {
    loading.value = true;
    error.value = null;
    
    try {
      const endpoint = grouped ? '/api/unavailability/grouped' : '/api/unavailability';
      
      // Use useFetch from Nuxt
      const { data } = await useFetch<OutageResponse>(endpoint, {
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
        method: 'GET',
        params: filters
      });
      
      if (data.value) {
        outages.value = data.value.items;
        stats.value = data.value.stats;
        total.value = data.value.total;
      }
    } catch (err) {
      console.error('Error fetching outage data:', err);
      error.value = 'Failed to fetch outage data';
    } finally {
      loading.value = false;
    }
  };

  const fetchStats = async (filters: OutageFilters, grouped: boolean = false) => {
    try {
      // Use useFetch from Nuxt
      const { data } = await useFetch<OutageStats>('/api/unavailability/stats', {
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
        method: 'GET',
        params: {
          ...filters,
          useGrouped: grouped
        }
      });
      
      if (data.value) {
        stats.value = data.value;
      }
    } catch (err) {
      console.error('Error fetching outage stats:', err);
      // Don't update error state here to avoid disrupting the UI if only stats fail
    }
  };

  return {
    outages,
    stats,
    total,
    loading,
    error,
    fetchOutages,
    fetchStats
  };
}
