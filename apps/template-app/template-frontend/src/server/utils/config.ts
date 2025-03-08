import { useRuntimeConfig } from '#imports';

export const getBackendUrl = () => {
  const config = useRuntimeConfig();
  console.log(config.apiBaseUrl)
  return `${config.apiBaseUrl}`;
};
