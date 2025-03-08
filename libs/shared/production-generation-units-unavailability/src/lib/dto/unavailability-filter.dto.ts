import { IsDateString, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UnavailabilityFilterDto {
  @ApiProperty({
    description: 'Start date for filtering unavailabilities (ISO format)',
    example: '2025-01-01T00:00:00Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({
    description: 'End date for filtering unavailabilities (ISO format)',
    example: '2025-02-01T00:00:00Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({
    description: 'Filter by resource name',
    example: 'OROEBIOuz',
    required: false,
  })
  @IsString()
  @IsOptional()
  resourceName?: string;

  @ApiProperty({
    description: 'Filter by resource location',
    example: 'Budapest',
    required: false,
  })
  @IsString()
  @IsOptional()
  resourceLocation?: string;
}
