import { Inject, Injectable } from '@nestjs/common';
import { IUnavailabilityDAL, UnavailabilityFilter, UnavailabilityStats } from '../interfaces/unavailability-dal.interface';
import { UnavailabilityModuleOptions } from '../production-generation-units-unavailability.module';
import { UnavailabilityFilterDto } from '../dto/unavailability-filter.dto';
import { UnavailabilityItemDto, UnavailabilityResponseDto, UnavailabilityStatsDto } from '../dto/unavailability-response.dto';
import { TimeSeries } from '@prisma/client';

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
   * Map TimeSeries entity to DTO
   */
  private mapToItemDto(timeSeries: TimeSeries, reasonCode?: string): UnavailabilityItemDto {
    return {
      id: timeSeries.id,
      resourceName: timeSeries.resourceName,
      resourceLocation: timeSeries.resourceLocation || undefined,
      resourceType: timeSeries.resourceType || undefined,
      startTime: timeSeries.startTime,
      endTime: timeSeries.endTime,
      nominalPower: timeSeries.nominalPower || undefined,
      businessType: timeSeries.businessType,
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
      this.unavailabilityDAL.getUnavailabilityStats(filter),
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
      this.unavailabilityDAL.getUnavailabilityStats(filter),
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
   */
  async getStats(filterDto: UnavailabilityFilterDto): Promise<UnavailabilityStatsDto> {
    const filter = this.convertFilter(filterDto);
    const stats = await this.unavailabilityDAL.getUnavailabilityStats(filter);
    
    return {
      totalUnavailableCapacity: stats.totalUnavailableCapacity,
    };
  }
}
