import { ApiProperty } from '@nestjs/swagger';

export class UnavailabilityItemDto {
  @ApiProperty({ description: 'Unique identifier' })
  id: string;

  @ApiProperty({ description: 'Resource name' })
  resourceName: string;

  @ApiProperty({ description: 'Resource location', required: false })
  resourceLocation?: string;

  @ApiProperty({ description: 'Resource type', required: false })
  resourceType?: string;

  @ApiProperty({ description: 'Start time of unavailability' })
  startTime: Date;

  @ApiProperty({ description: 'End time of unavailability' })
  endTime: Date;

  @ApiProperty({ description: 'Nominal power in MAW', required: false })
  nominalPower?: number;

  @ApiProperty({ description: 'Business type (A53, A54, etc.)' })
  businessType: string;

  @ApiProperty({ description: 'Reason code (B18, B19, etc.)', required: false })
  reasonCode?: string;
}

export class UnavailabilityStatsDto {
  @ApiProperty({ description: 'Total unavailable capacity in MAW' })
  totalUnavailableCapacity: number;
}

export class UnavailabilityResponseDto {
  @ApiProperty({ type: [UnavailabilityItemDto] })
  items: UnavailabilityItemDto[];

  @ApiProperty()
  stats: UnavailabilityStatsDto;

  @ApiProperty()
  total: number;
}
