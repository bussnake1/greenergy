import { ref, Ref } from 'vue';
import { useCookie } from 'nuxt/app';
import { ApiKey, ApiKeyWithRawKey, CreateApiKeyDto } from '../types';

export function useApiKeys() {
  const apiKeys: Ref<ApiKey[]> = ref([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const newApiKey: Ref<ApiKeyWithRawKey | null> = ref(null);
  const token = useCookie('auth_token');

  /**
   * Fetch all API keys for the current user
   */
  const fetchApiKeys = async () => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await fetch('/api/api-keys', {
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch API keys: ${response.statusText}`);
      }
      
      apiKeys.value = await response.json();
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch API keys';
      console.error(error.value);
    } finally {
      loading.value = false;
    }
  };

  /**
   * Create a new API key
   */
  const createApiKey = async (data: CreateApiKeyDto) => {
    loading.value = true;
    error.value = null;
    newApiKey.value = null;
    
    try {
      const response = await fetch('/api/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token.value}`,
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create API key: ${response.statusText}`);
      }
      
      const result = await response.json();
      newApiKey.value = {
        ...result.apiKey,
        rawKey: result.rawKey,
      };
      
      // Refresh the API keys list
      await fetchApiKeys();
      
      return newApiKey.value;
    } catch (err: any) {
      error.value = err.message || 'Failed to create API key';
      console.error(error.value);
      return null;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Revoke an API key
   */
  const revokeApiKey = async (id: string) => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await fetch(`/api/api-keys/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to revoke API key: ${response.statusText}`);
      }
      
      // Refresh the API keys list
      await fetchApiKeys();
      
      return true;
    } catch (err: any) {
      error.value = err.message || 'Failed to revoke API key';
      console.error(error.value);
      return false;
    } finally {
      loading.value = false;
    }
  };

  return {
    apiKeys,
    loading,
    error,
    newApiKey,
    fetchApiKeys,
    createApiKey,
    revokeApiKey,
  };
}
