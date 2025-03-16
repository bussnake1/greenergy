import { Controller, Get, Query, Res, Header } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UnavailabilityService } from '../services/unavailability.service';
import { UnavailabilityFilterDto } from '../dto/unavailability-filter.dto';
import { UnavailabilityResponseDto, UnavailabilityStatsDto } from '../dto/unavailability-response.dto';
import { Response } from 'express';
import * as ExcelJS from 'exceljs';

@ApiTags('unavailability')
@Controller('unavailability')
export class UnavailabilityController {
  constructor(private readonly unavailabilityService: UnavailabilityService) {}

  @Get()
  @ApiOperation({ summary: 'Get unavailabilities based on filter criteria' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of unavailabilities', 
    type: UnavailabilityResponseDto 
  })
  async getUnavailabilities(
    @Query() filterDto: UnavailabilityFilterDto,
  ): Promise<UnavailabilityResponseDto> {
    return this.unavailabilityService.getUnavailabilities(filterDto);
  }

  @Get('grouped')
  @ApiOperation({ 
    summary: 'Get grouped unavailabilities with redundant records filtered' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'List of grouped unavailabilities', 
    type: UnavailabilityResponseDto 
  })
  async getGroupedUnavailabilities(
    @Query() filterDto: UnavailabilityFilterDto,
  ): Promise<UnavailabilityResponseDto> {
    return this.unavailabilityService.getGroupedUnavailabilities(filterDto);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get statistics about unavailabilities' })
  @ApiResponse({ 
    status: 200, 
    description: 'Unavailability statistics', 
    type: UnavailabilityStatsDto 
  })
  @ApiQuery({
    name: 'useGrouped',
    required: false,
    type: Boolean,
    description: 'Whether to use grouped unavailabilities for stats calculation'
  })
  async getStats(
    @Query() filterDto: UnavailabilityFilterDto,
    @Query('useGrouped') useGroupedParam?: string,
  ): Promise<UnavailabilityStatsDto> {
    const useGrouped = useGroupedParam === 'true';
    return this.unavailabilityService.getStats(filterDto, useGrouped);
  }

  @Get('export/excel')
  @ApiOperation({ summary: 'Export unavailabilities to Excel' })
  @ApiResponse({ 
    status: 200, 
    description: 'Excel file with unavailabilities' 
  })
  @ApiQuery({
    name: 'useGrouped',
    required: false,
    type: Boolean,
    description: 'Whether to use grouped unavailabilities'
  })
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  @Header('Content-Disposition', 'attachment; filename=unavailabilities.xlsx')
  async exportToExcel(
    @Query() filterDto: UnavailabilityFilterDto,
    @Query('useGrouped') useGroupedParam?: string,
    @Res() res: Response,
  ): Promise<void> {
    const useGrouped = useGroupedParam === 'true';
    const data = useGrouped 
      ? await this.unavailabilityService.getGroupedUnavailabilities(filterDto)
      : await this.unavailabilityService.getUnavailabilities(filterDto);
    
    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Unavailabilities');
    
    // Add headers
    worksheet.columns = [
      { header: 'Resource Name', key: 'resourceName', width: 20 },
      { header: 'Location', key: 'resourceLocation', width: 15 },
      { header: 'Type', key: 'resourceType', width: 10 },
      { header: 'Start Time', key: 'startTime', width: 20 },
      { header: 'End Time', key: 'endTime', width: 20 },
      { header: 'Nominal Power (MW)', key: 'nominalPower', width: 15 },
      { header: 'Available Capacity (MW)', key: 'availableCapacity', width: 15 },
      { header: 'Unavailable Capacity (MW)', key: 'unavailableCapacity', width: 15 },
      { header: 'Business Type', key: 'businessType', width: 15 },
      { header: 'Reason Code', key: 'reasonCode', width: 15 },
    ];
    
    // Add data
    worksheet.addRows(data.items);
    
    // Format dates
    worksheet.getColumn('startTime').numFmt = 'yyyy-mm-dd hh:mm:ss';
    worksheet.getColumn('endTime').numFmt = 'yyyy-mm-dd hh:mm:ss';
    
    // Add summary at the bottom
    worksheet.addRow([]);
    worksheet.addRow(['Total Unavailable Capacity (MAW)', data.stats.totalUnavailableCapacity]);
    worksheet.addRow(['Total Records', data.total]);
    
    // Write to response
    const buffer = await workbook.xlsx.writeBuffer();
    res.end(buffer);
  }

  @Get('export/csv')
  @ApiOperation({ summary: 'Export unavailabilities to CSV' })
  @ApiResponse({ 
    status: 200, 
    description: 'CSV file with unavailabilities' 
  })
  @ApiQuery({
    name: 'useGrouped',
    required: false,
    type: Boolean,
    description: 'Whether to use grouped unavailabilities'
  })
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename=unavailabilities.csv')
  async exportToCsv(
    @Query() filterDto: UnavailabilityFilterDto,
    @Query('useGrouped') useGroupedParam?: string,
    @Res() res: Response,
  ): Promise<void> {
    const useGrouped = useGroupedParam === 'true';
    const data = useGrouped 
      ? await this.unavailabilityService.getGroupedUnavailabilities(filterDto)
      : await this.unavailabilityService.getUnavailabilities(filterDto);
    
    // Create CSV content
    const headers = 'Resource Name,Location,Type,Start Time,End Time,Nominal Power (MW),Available Capacity (MW),Unavailable Capacity (MW),Business Type,Reason Code\n';
    
    const rows = data.items.map(item => {
      return [
        item.resourceName,
        item.resourceLocation || '',
        item.resourceType || '',
        item.startTime.toISOString(),
        item.endTime.toISOString(),
        item.nominalPower || '',
        item.availableCapacity || '',
        item.unavailableCapacity || '',
        item.businessType,
        item.reasonCode || '',
      ].join(',');
    }).join('\n');
    
    const summary = `\n\nTotal Unavailable Capacity (MAW),${data.stats.totalUnavailableCapacity}\nTotal Records,${data.total}`;
    
    // Write to response
    res.write(headers + rows + summary);
    res.end();
  }
}
