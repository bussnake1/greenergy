import { defineEventHandler, getHeaders } from 'h3';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const headers = getHeaders(event);
  const token = headers.authorization?.replace('Bearer ', '');

  if (!token) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    });
  }

  try {
    const response = await fetch(`${config.apiBaseUrl}/api-keys`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        message: response.statusText,
      });
    }

    return await response.json();
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to fetch API keys',
    });
  }
});
