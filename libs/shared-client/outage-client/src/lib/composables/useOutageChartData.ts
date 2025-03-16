import { computed, Ref } from 'vue';
import { OutageItem } from '../types';

/**
 * Generates an array of dates between start and end dates (inclusive)
 */
function generateDateRange(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = [];
  const currentDate = new Date(startDate);
  
  // Set time to beginning of day for consistent comparison
  currentDate.setHours(0, 0, 0, 0);
  const endDateNormalized = new Date(endDate);
  endDateNormalized.setHours(0, 0, 0, 0);
  
  // Add each day to the array
  while (currentDate <= endDateNormalized) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
}

/**
 * Checks if a date falls between start and end dates (inclusive)
 */
function isDateBetween(date: Date, startDate: Date, endDate: Date): boolean {
  // Normalize all dates to beginning of day for day-level comparison
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);
  
  const normalizedStart = new Date(startDate);
  normalizedStart.setHours(0, 0, 0, 0);
  
  const normalizedEnd = new Date(endDate);
  normalizedEnd.setHours(0, 0, 0, 0);
  
  return normalizedDate >= normalizedStart && normalizedDate <= normalizedEnd;
}

/**
 * Format date as YYYY-MM-DD
 */
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Composable for processing outage data into chart-friendly format
 */
export function useOutageChartData(outages: Ref<OutageItem[]>, startDate: Ref<string | undefined>, endDate: Ref<string | undefined>) {
  // Compute daily aggregated data for chart
  const dailyOutageData = computed(() => {
    if (!outages.value.length || !startDate.value || !endDate.value) {
      return [];
    }
    
    // Parse dates from string format
    const start = new Date(startDate.value);
    const end = new Date(endDate.value);
    
    // Generate all days in the range
    const dateRange = generateDateRange(start, end);
    
    // Calculate total unavailable capacity for each day
    return dateRange.map(day => {
      const dayTotal = outages.value.reduce((sum, outage) => {
        // Check if outage is active on this day
        if (isDateBetween(day, new Date(outage.startTime), new Date(outage.endTime))) {
          return sum + (outage.nominalPower || 0);
        }
        return sum;
      }, 0);
      
      return {
        date: formatDate(day),
        unavailablePower: dayTotal
      };
    });
  });

  // Format data for ApexCharts
  const series = computed(() => {
    if (dailyOutageData.value.length === 0) {
      return [];
    }
    
    return [
      {
        name: 'Unavailable Capacity (MAW)',
        data: dailyOutageData.value.map(item => item.unavailablePower.toFixed(0))
      }
    ];
  });

  // X-axis categories (dates)
  const categories = computed(() => {
    return dailyOutageData.value.map(item => {
      const date = new Date(item.date);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    });
  });

  // Chart options
  const chartOptions = computed(() => {
    return {
      chart: {
        type: 'bar',
        height: 350,
        toolbar: {
          show: false
        }
      },
      plotOptions: {
        bar: {
          borderRadius: 4,
          dataLabels: {
            position: 'top'
          }
        }
      },
      dataLabels: {
        enabled: true,
        formatter: function(val: number) {
          return val.toFixed(0);
        },
        offsetY: -20,
        style: {
          fontSize: '12px',
          colors: ['#304758']
        }
      },
      xaxis: {
        categories: categories.value,
        position: 'bottom',
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false
        },
        tooltip: {
          enabled: false
        }
      },
      yaxis: {
        title: {
          text: 'Unavailable Capacity (MAW)'
        },
      },
      title: {
        // text: 'Daily Unavailable Capacity',
        align: 'left',
        style: {
          fontSize: '16px'
        }
      },
      colors: ['#22c55e'] // Green color to match the app's theme
    };
  });

  return {
    series,
    chartOptions
  };
}
