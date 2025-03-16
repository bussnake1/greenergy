import { defineEventHandler, getHeaders, getQuery, setResponseHeader } from 'h3';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const headers = getHeaders(event);
  const token = headers.authorization?.replace('Bearer ', '');
  const query = getQuery(event);

  if (!token) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    });
  }

  try {
    // Build the query string
    const queryParams = new URLSearchParams();
    if (query.startDate) queryParams.append('startDate', query.startDate as string);
    if (query.endDate) queryParams.append('endDate', query.endDate as string);
    if (query.resourceName) queryParams.append('resourceName', query.resourceName as string);
    if (query.resourceLocation) queryParams.append('resourceLocation', query.resourceLocation as string);
    if (query.useGrouped !== undefined) queryParams.append('useGrouped', query.useGrouped as string);
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    
    const response = await fetch(`${config.apiBaseUrl}/unavailability/export/csv${queryString}`, {
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

    // Set appropriate headers for CSV file download
    setResponseHeader(event, 'Content-Type', 'text/csv');
    setResponseHeader(event, 'Content-Disposition', 'attachment; filename=unavailabilities.csv');
    
    // Return the blob data
    return Buffer.from(await response.arrayBuffer());
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to export data to CSV',
    });
  }
});
