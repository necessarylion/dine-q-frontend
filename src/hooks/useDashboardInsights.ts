import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { DashboardInsightsResult } from "@/types";

interface DashboardInsightsParams {
  restaurantId: number;
  dateFrom: string;
  dateTo: string;
  language: string;
}

export const useDashboardInsights = () => {
  return useMutation({
    mutationFn: async ({ restaurantId, dateFrom, dateTo, language }: DashboardInsightsParams) => {
      return api.post<DashboardInsightsResult>(
        endpoints.dashboard.insights(restaurantId),
        null,
        { params: { date_from: dateFrom, date_to: dateTo, language } }
      );
    },
  });
};
