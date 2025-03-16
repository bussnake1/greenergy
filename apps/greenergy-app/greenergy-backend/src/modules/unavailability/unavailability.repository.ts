import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IUnavailabilityDAL, UnavailabilityFilter, UnavailabilityStats, UnavailabilityPGTimeSeriesWithCapacity } from '@greenergy/production-generation-units-unavailability';
import { UnavailabilityPGTimeSeries } from '@prisma/client';

@Injectable()
export class UnavailabilityRepository implements IUnavailabilityDAL {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find unavailabilities based on filter criteria
   */
  async findUnavailabilities(filter: UnavailabilityFilter): Promise<UnavailabilityPGTimeSeriesWithCapacity[]> {
    const { startDate, endDate, resourceName, resourceLocation } = filter;
    
    // Fetch time series with their available periods and points
    const timeSeries = await this.prisma.unavailabilityPGTimeSeries.findMany({
      where: {
        ...(startDate && { startTime: { gte: startDate } }),
        ...(endDate && { endTime: { lte: endDate } }),
        ...(resourceName && { resourceName: { contains: resourceName, mode: 'insensitive' } }),
        ...(resourceLocation && { resourceLocation: { contains: resourceLocation, mode: 'insensitive' } }),
      },
      include: {
        unavailabilityPGMarketDocument: true,
        unavailabilityPGAvailablePeriods: {
          include: {
            unavailabilityPGPoints: true,
          },
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    });
    
    // Calculate capacity values for each item
    return timeSeries.map(series => {
      const { availableCapacity, unavailableCapacity } = this.calculateCapacityForItem(series);
      return {
        ...series,
        availableCapacity,
        unavailableCapacity,
      };
    });
  }

  /**
   * Calculate capacity values for a single time series item
   */
  private calculateCapacityForItem(series: UnavailabilityPGTimeSeries): { 
    availableCapacity: number; 
    unavailableCapacity: number; 
  } {
    let availableCapacity = 0;
    let unavailableCapacity = 0;
    
    if (series.nominalPower) {
      // Get the value of the highest point of the available periods
      const highestPoint = series.unavailabilityPGAvailablePeriods?.reduce((max, period) => {
        return period.unavailabilityPGPoints.reduce((max, point) => {
          return point.quantity > max ? point.quantity : max;
        }, 0);
      }, 0) || 0;

      // Available capacity is the highest point
      availableCapacity = highestPoint;
      
      // Unavailable capacity is the difference between nominal power and available capacity
      unavailableCapacity = series.nominalPower - availableCapacity;
    }
    
    return {
      availableCapacity,
      unavailableCapacity,
    };
  }

  /**
   * Calculate statistics from a list of unavailabilities
   */
  private calculateStats(unavailabilityPGTimeSeries: UnavailabilityPGTimeSeries[]): UnavailabilityStats {
    // Calculate total unavailable capacity
    let totalUnavailableCapacity = 0;
    
    for (const series of unavailabilityPGTimeSeries) {
      if (series.nominalPower) {
        const { unavailableCapacity } = this.calculateCapacityForItem(series);
        totalUnavailableCapacity += unavailableCapacity;
      }
    }
    
    return {
      totalUnavailableCapacity,
    };
  }

  /**
   * Get statistics about unavailabilities
   * This now accepts a parameter to determine whether to use grouped or ungrouped data
   */
  async getUnavailabilityStats(filter: UnavailabilityFilter, useGrouped = false): Promise<UnavailabilityStats> {
    // Get the appropriate unavailabilities based on the useGrouped parameter
    const unavailabilityPGTimeSeries = useGrouped 
      ? await this.findGroupedUnavailabilities(filter)
      : await this.findUnavailabilities(filter);
    
    // Make sure we include the necessary relation data for stats calculation
    const unavailabilitiesWithPeriods = await this.prisma.unavailabilityPGTimeSeries.findMany({
      where: {
        id: { in: unavailabilityPGTimeSeries.map(item => item.id) }
      },
      include: {
        unavailabilityPGAvailablePeriods: {
          include: {
            unavailabilityPGPoints: true,
          },
        },
      },
    });
    
    return this.calculateStats(unavailabilitiesWithPeriods);
  }

  /**
   * Find grouped unavailabilities based on rules
   * (e.g., filtering redundant records)
   */
  async findGroupedUnavailabilities(filter: UnavailabilityFilter): Promise<UnavailabilityPGTimeSeriesWithCapacity[]> {
    // Get all time series that match the filter
    const allUnavailabilityPGTimeSeries = await this.findUnavailabilities(filter);
    
    // Group by time periods and filter redundant records
    const groupedUnavailabilityPGTimeSeries: UnavailabilityPGTimeSeriesWithCapacity[] = [];
    const processedGroups = new Set<string>();
    
    // Example grouping rule: If there are multiple records for the same time period
    // and location, keep only the one with the highest nominal power
    for (const series of allUnavailabilityPGTimeSeries) {
      // Create a key for grouping (e.g., location + time period)
      const groupKey = `${series.resourceLocation || 'unknown'}_${series.startTime.toISOString()}_${series.endTime.toISOString()}`;
      
      // Skip if we've already processed this group
      if (processedGroups.has(groupKey)) {
        continue;
      }
      
      // Find all series in the same group
      const sameGroup = allUnavailabilityPGTimeSeries.filter(s => 
        (s.resourceLocation || 'unknown') === (series.resourceLocation || 'unknown') &&
        s.startTime.getTime() === series.startTime.getTime() &&
        s.endTime.getTime() === series.endTime.getTime()
      );
      
      // Apply rule: Keep the one with the highest nominal power
      if (sameGroup.length > 1) {
        // Sort by nominal power (descending)
        sameGroup.sort((a, b) => 
          (b.nominalPower || 0) - (a.nominalPower || 0)
        );
        
        // Add the one with the highest nominal power
        groupedUnavailabilityPGTimeSeries.push(sameGroup[0]);
      } else {
        // If there's only one, add it
        groupedUnavailabilityPGTimeSeries.push(series);
      }
      
      // Mark this group as processed
      processedGroups.add(groupKey);
    }
    
    return groupedUnavailabilityPGTimeSeries;
  }
}
