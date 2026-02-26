import { createContext } from 'react';

export interface IDashboardOverview {
  opportunities?: { 
    totalCount: number; 
    wonCount: number; 
    winRate: number; 
    pipelineValue: number; 
  };
  pipeline?: { stages: any[]; weightedPipelineValue: number };
  activities?: { upcomingCount: number; overdueCount: number; completedTodayCount: number };
  contracts?: { totalActiveCount: number; expiringThisMonthCount: number; totalContractValue: number };
  revenue?: { thisMonth: number; thisQuarter: number; thisYear: number; monthlyTrend: any[] };
  pipelineMetrics?: any;
  salesPerformance?: any;
  activitiesSummary?: any;
}

export interface IDashboardState {
  overview: IDashboardOverview | null;
  recentOpportunities: any[];
  isPending: boolean;
  isError: boolean;
}

export const DashboardStateContext = createContext<IDashboardState>(null!);
export const DashboardActionContext = createContext<{
  getDashboardOverview: () => Promise<void>;
  getPipelineMetrics: () => Promise<void>;
  getSalesPerformance: () => Promise<void>;
  getActivitiesSummary: () => Promise<void>;
  getRecentOpportunities: () => Promise<void>;
}>(null!);