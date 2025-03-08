import { defineEventHandler, getHeaders, createError } from 'h3';
import { getBackendUrl } from '../../utils/config';

export default defineEventHandler(async (event) => {
  const headers = getHeaders(event);
  const authHeader = headers.authorization;

  if (!authHeader) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    });
  }

  try {
    const response = await fetch(`${getBackendUrl()}/auth/me`, {
      headers: {
        Authorization: authHeader,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        message: data.message || 'Failed to fetch user data',
      });
    }

    return data;
  } catch (error: any) {
    throw createError({
      statusCode: error?.statusCode || 500,
      message: error?.message || 'Internal server error',
    });
  }
});
