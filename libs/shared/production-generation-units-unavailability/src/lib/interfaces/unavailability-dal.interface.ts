import { UnavailabilityPGMarketDocument, UnavailabilityPGTimeSeries } from '@prisma/client';

export interface UnavailabilityFilter {
  startDate?: Date;
  endDate?: Date;
  resourceName?: string;
  resourceLocation?: string;
}

export interface UnavailabilityStats {
  totalUnavailableCapacity: number;
}

// Extended interface to include capacity information
export interface UnavailabilityPGTimeSeriesWithCapacity extends UnavailabilityPGTimeSeries {
  availableCapacity?: number;
  unavailableCapacity?: number;
}

export interface IUnavailabilityDAL {
  /**
   * Find unavailabilities based on filter criteria
   */
  findUnavailabilities(filter: UnavailabilityFilter): Promise<UnavailabilityPGTimeSeriesWithCapacity[]>;
  
  /**
   * Get statistics about unavailabilities
   * @param filter The filter criteria
   * @param useGrouped Whether to use grouped unavailabilities for stats calculation
   */
  getUnavailabilityStats(filter: UnavailabilityFilter, useGrouped?: boolean): Promise<UnavailabilityStats>;
  
  /**
   * Find grouped unavailabilities based on rules
   * (e.g., filtering redundant records)
   */
  findGroupedUnavailabilities(filter: UnavailabilityFilter): Promise<UnavailabilityPGTimeSeriesWithCapacity[]>;
}
