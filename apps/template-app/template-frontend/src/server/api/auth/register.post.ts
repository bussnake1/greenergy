import { defineEventHandler, readBody, createError } from 'h3';
import { getBackendUrl } from '../../utils/config';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  console.log('register');
  try {
    const response = await fetch(`${getBackendUrl()}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        message: data.message || 'Registration failed',
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
