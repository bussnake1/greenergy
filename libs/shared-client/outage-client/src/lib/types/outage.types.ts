export interface OutageItem {
  id: string;
  resourceName: string;
  resourceLocation?: string;
  resourceType?: string;
  startTime: Date;
  endTime: Date;
  nominalPower?: number;
  availableCapacity?: number;
  unavailableCapacity?: number;
  businessType: string;
  reasonCode?: string;
}

export interface OutageStats {
  totalUnavailableCapacity: number;
}

export interface OutageResponse {
  items: OutageItem[];
  stats: OutageStats;
  total: number;
}

export interface OutageFilters {
  startDate?: string;
  endDate?: string;
  resourceName?: string;
  resourceLocation?: string;
}
