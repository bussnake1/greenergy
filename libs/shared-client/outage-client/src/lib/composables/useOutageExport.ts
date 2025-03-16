import { ref, Ref } from 'vue';
import { OutageFilters } from '../types';
import { useCookie } from 'nuxt/app';

export function useOutageExport() {
  const loading: Ref<boolean> = ref(false);
  const error: Ref<string | null> = ref(null);

  const exportToExcel = async (filters: OutageFilters, useGrouped: boolean = false) => {
    loading.value = true;
    error.value = null;
    
    try {
      // Create a URL with query parameters
      const queryParams = new URLSearchParams();
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      if (filters.resourceName) queryParams.append('resourceName', filters.resourceName);
      if (filters.resourceLocation) queryParams.append('resourceLocation', filters.resourceLocation);
      queryParams.append('useGrouped', useGrouped.toString());
      
      const url = `/api/unavailability/export/excel?${queryParams.toString()}`;
      
      // Get the auth token from cookies
      const token = useCookie('auth_token').value;
      
      // Use fetch with authorization header
      const response = await fetch(url, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      // Get the blob from the response
      const blob = await response.blob();
      
      // Create a URL for the blob
      const downloadUrl = window.URL.createObjectURL(blob);
      
      // Create a temporary link and trigger the download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'unavailabilities.xlsx';
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Error exporting to Excel:', err);
      error.value = 'Failed to export data to Excel';
    } finally {
      loading.value = false;
    }
  };

  const exportToCsv = async (filters: OutageFilters, useGrouped: boolean = false) => {
    loading.value = true;
    error.value = null;
    
    try {
      // Create a URL with query parameters
      const queryParams = new URLSearchParams();
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      if (filters.resourceName) queryParams.append('resourceName', filters.resourceName);
      if (filters.resourceLocation) queryParams.append('resourceLocation', filters.resourceLocation);
      queryParams.append('useGrouped', useGrouped.toString());
      
      const url = `/api/unavailability/export/csv?${queryParams.toString()}`;
      
      // Get the auth token from cookies
      const token = useCookie('auth_token').value;
      
      // Use fetch with authorization header
      const response = await fetch(url, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      // Get the blob from the response
      const blob = await response.blob();
      
      // Create a URL for the blob
      const downloadUrl = window.URL.createObjectURL(blob);
      
      // Create a temporary link and trigger the download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'unavailabilities.csv';
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Error exporting to CSV:', err);
      error.value = 'Failed to export data to CSV';
    } finally {
      loading.value = false;
    }
  };


  return {
    loading,
    error,
    exportToExcel,
    exportToCsv
  };
}
