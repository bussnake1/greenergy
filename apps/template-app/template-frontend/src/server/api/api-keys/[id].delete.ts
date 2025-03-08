import { defineEventHandler, getHeaders } from 'h3';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const headers = getHeaders(event);
  const token = headers.authorization?.replace('Bearer ', '');
  const id = event.context.params?.id;

  if (!token) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    });
  }

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'API key ID is required',
    });
  }

  try {
    const response = await fetch(`${config.apiBaseUrl}/api-keys/${id}`, {
      method: 'DELETE',
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

    return { message: 'API key revoked successfully' };
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to revoke API key',
    });
  }
});
