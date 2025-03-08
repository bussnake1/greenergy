import { MarketDocument, TimeSeries } from '@prisma/client';

export interface UnavailabilityFilter {
  startDate?: Date;
  endDate?: Date;
  resourceName?: string;
  resourceLocation?: string;
}

export interface UnavailabilityStats {
  totalUnavailableCapacity: number;
}

export interface IUnavailabilityDAL {
  /**
   * Find unavailabilities based on filter criteria
   */
  findUnavailabilities(filter: UnavailabilityFilter): Promise<TimeSeries[]>;
  
  /**
   * Get statistics about unavailabilities
   */
  getUnavailabilityStats(filter: UnavailabilityFilter): Promise<UnavailabilityStats>;
  
  /**
   * Find grouped unavailabilities based on rules
   * (e.g., filtering redundant records)
   */
  findGroupedUnavailabilities(filter: UnavailabilityFilter): Promise<TimeSeries[]>;
}
