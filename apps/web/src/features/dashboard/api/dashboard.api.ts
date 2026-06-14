import { apiClient, unwrap } from '@/lib/api-client';
import type { DashboardOverview } from '../types/dashboard.types';

export const dashboardApi = {
  async overview(): Promise<DashboardOverview> {
    const { data } = await apiClient.get('/admin/dashboard');
    return unwrap<DashboardOverview>(data);
  },
};
