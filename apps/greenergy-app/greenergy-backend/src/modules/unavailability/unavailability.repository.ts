import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IUnavailabilityDAL, UnavailabilityFilter, UnavailabilityStats } from '@greenergy/production-generation-units-unavailability';
import { TimeSeries } from '@prisma/client';

@Injectable()
export class UnavailabilityRepository implements IUnavailabilityDAL {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find unavailabilities based on filter criteria
   */
  async findUnavailabilities(filter: UnavailabilityFilter): Promise<TimeSeries[]> {
    const { startDate, endDate, resourceName, resourceLocation } = filter;
    
    return this.prisma.timeSeries.findMany({
      where: {
        ...(startDate && { startTime: { gte: startDate } }),
        ...(endDate && { endTime: { lte: endDate } }),
        ...(resourceName && { resourceName: { contains: resourceName, mode: 'insensitive' } }),
        ...(resourceLocation && { resourceLocation: { contains: resourceLocation, mode: 'insensitive' } }),
      },
      include: {
        marketDocument: true,
      },
      orderBy: {
        startTime: 'asc',
      },
    });
  }

  /**
   * Get statistics about unavailabilities
   */
  async getUnavailabilityStats(filter: UnavailabilityFilter): Promise<UnavailabilityStats> {
    const { startDate, endDate, resourceName, resourceLocation } = filter;
    
    // Get all time series that match the filter
    const timeSeries = await this.prisma.timeSeries.findMany({
      where: {
        ...(startDate && { startTime: { gte: startDate } }),
        ...(endDate && { endTime: { lte: endDate } }),
        ...(resourceName && { resourceName: { contains: resourceName, mode: 'insensitive' } }),
        ...(resourceLocation && { resourceLocation: { contains: resourceLocation, mode: 'insensitive' } }),
      },
      include: {
        availablePeriods: {
          include: {
            points: true,
          },
        },
      },
    });
    
    // Calculate total unavailable capacity
    let totalUnavailableCapacity = 0;
    
    for (const series of timeSeries) {
      // If nominal power is available, use it
      if (series.nominalPower) {
        // For each available period, check the points
        for (const period of series.availablePeriods) {
          for (const point of period.points) {
            // If quantity is 0, the full capacity is unavailable
            if (point.quantity === 0) {
              totalUnavailableCapacity += series.nominalPower;
            } 
            // Otherwise, the unavailable capacity is the difference
            else if (point.quantity < series.nominalPower) {
              totalUnavailableCapacity += (series.nominalPower - point.quantity);
            }
          }
        }
      }
    }
    
    return {
      totalUnavailableCapacity,
    };
  }

  /**
   * Find grouped unavailabilities based on rules
   * (e.g., filtering redundant records)
   */
  async findGroupedUnavailabilities(filter: UnavailabilityFilter): Promise<TimeSeries[]> {
    // Get all time series that match the filter
    const allTimeSeries = await this.findUnavailabilities(filter);
    
    // Group by time periods and filter redundant records
    const groupedTimeSeries: TimeSeries[] = [];
    const processedGroups = new Set<string>();
    
    // Example grouping rule: If there are multiple records for the same time period
    // and location, keep only the one with the highest nominal power
    for (const series of allTimeSeries) {
      // Create a key for grouping (e.g., location + time period)
      const groupKey = `${series.resourceLocation || 'unknown'}_${series.startTime.toISOString()}_${series.endTime.toISOString()}`;
      
      // Skip if we've already processed this group
      if (processedGroups.has(groupKey)) {
        continue;
      }
      
      // Find all series in the same group
      const sameGroup = allTimeSeries.filter(s => 
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
        groupedTimeSeries.push(sameGroup[0]);
      } else {
        // If there's only one, add it
        groupedTimeSeries.push(series);
      }
      
      // Mark this group as processed
      processedGroups.add(groupKey);
    }
    
    return groupedTimeSeries;
  }
}
