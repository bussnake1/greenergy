import { Inject, Injectable } from '@nestjs/common';
import { IUnavailabilityDAL, UnavailabilityFilter, UnavailabilityStats } from '../interfaces/unavailability-dal.interface';
import { UnavailabilityModuleOptions } from '../production-generation-units-unavailability.module';
import { UnavailabilityFilterDto } from '../dto/unavailability-filter.dto';
import { UnavailabilityItemDto, UnavailabilityResponseDto, UnavailabilityStatsDto } from '../dto/unavailability-response.dto';
import { UnavailabilityPGTimeSeries } from '@prisma/client';

@Injectable()
export class UnavailabilityService {
  constructor(
    @Inject('UNAVAILABILITY_OPTIONS')
    private readonly options: UnavailabilityModuleOptions,
    @Inject('UNAVAILABILITY_DAL')
    private readonly unavailabilityDAL: IUnavailabilityDAL,
  ) {}

  /**
   * Convert filter DTO to domain filter
   */
  private convertFilter(filterDto: UnavailabilityFilterDto): UnavailabilityFilter {
    return {
      startDate: filterDto.startDate ? new Date(filterDto.startDate) : undefined,
      endDate: filterDto.endDate ? new Date(filterDto.endDate) : undefined,
      resourceName: filterDto.resourceName,
      resourceLocation: filterDto.resourceLocation,
    };
  }

  /**
   * Map UnavailabilityPGTimeSeries entity to DTO
   */
  private mapToItemDto(unavailabilityPGTimeSeries: UnavailabilityPGTimeSeries, reasonCode?: string): UnavailabilityItemDto {
    // Handle the extended properties from UnavailabilityPGTimeSeriesWithCapacity
    const availableCapacity = (unavailabilityPGTimeSeries as any).availableCapacity;
    const unavailableCapacity = (unavailabilityPGTimeSeries as any).unavailableCapacity;
    
    return {
      id: unavailabilityPGTimeSeries.id,
      resourceName: unavailabilityPGTimeSeries.resourceName,
      resourceLocation: unavailabilityPGTimeSeries.resourceLocation || undefined,
      resourceType: unavailabilityPGTimeSeries.resourceType || undefined,
      startTime: unavailabilityPGTimeSeries.startTime,
      endTime: unavailabilityPGTimeSeries.endTime,
      nominalPower: unavailabilityPGTimeSeries.nominalPower || undefined,
      availableCapacity: availableCapacity !== undefined ? availableCapacity : undefined,
      unavailableCapacity: unavailableCapacity !== undefined ? unavailableCapacity : undefined,
      businessType: unavailabilityPGTimeSeries.businessType,
      reasonCode: reasonCode,
    };
  }

  /**
   * Get unavailabilities based on filter criteria
   */
  async getUnavailabilities(filterDto: UnavailabilityFilterDto): Promise<UnavailabilityResponseDto> {
    const filter = this.convertFilter(filterDto);
    
    const [items, stats] = await Promise.all([
      this.unavailabilityDAL.findUnavailabilities(filter),
      this.unavailabilityDAL.getUnavailabilityStats(filter, false), // Pass false to use ungrouped data
    ]);
    
    return {
      items: items.map(item => this.mapToItemDto(item)),
      stats: {
        totalUnavailableCapacity: stats.totalUnavailableCapacity,
      },
      total: items.length,
    };
  }

  /**
   * Get grouped unavailabilities (with redundant records filtered)
   */
  async getGroupedUnavailabilities(filterDto: UnavailabilityFilterDto): Promise<UnavailabilityResponseDto> {
    const filter = this.convertFilter(filterDto);
    
    const [items, stats] = await Promise.all([
      this.unavailabilityDAL.findGroupedUnavailabilities(filter),
      this.unavailabilityDAL.getUnavailabilityStats(filter, true), // Pass true to use grouped data
    ]);
    
    return {
      items: items.map(item => this.mapToItemDto(item)),
      stats: {
        totalUnavailableCapacity: stats.totalUnavailableCapacity,
      },
      total: items.length,
    };
  }

  /**
   * Get statistics about unavailabilities
   * @param filterDto The filter criteria
   * @param useGrouped Whether to use grouped unavailabilities (default: false)
   */
  async getStats(filterDto: UnavailabilityFilterDto, useGrouped = false): Promise<UnavailabilityStatsDto> {
    const filter = this.convertFilter(filterDto);
    const stats = await this.unavailabilityDAL.getUnavailabilityStats(filter, useGrouped);
    
    return {
      totalUnavailableCapacity: stats.totalUnavailableCapacity,
    };
  }
}
