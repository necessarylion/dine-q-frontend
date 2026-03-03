import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { useRestaurantStore } from "@/stores/restaurantStore";
import type { AISetting, Restaurant } from "@/types";
import type { CreateAISettingInput, UpdateAISettingInput } from "@/types";

const refreshCurrentRestaurant = async (restaurantId: number) => {
  const restaurant = await api.get<Restaurant>(endpoints.restaurants.get(restaurantId));
  const { currentRestaurant, setCurrentRestaurant } = useRestaurantStore.getState();
  if (currentRestaurant?.id === restaurantId) {
    setCurrentRestaurant(restaurant);
  }
};

export const useAIModels = (
  restaurantId: number | undefined,
  aiSettingId: number | undefined
) => {
  return useQuery({
    queryKey: ["aiModels", restaurantId, aiSettingId],
    queryFn: () =>
      api.get<string[]>(endpoints.aiSettings.models(restaurantId!, aiSettingId!)),
    enabled: !!restaurantId && !!aiSettingId,
  });
};

export const useAISettings = (restaurantId: number | undefined) => {
  return useQuery({
    queryKey: ["aiSettings", restaurantId],
    refetchOnMount: "always",
    queryFn: () => api.get<AISetting[]>(endpoints.aiSettings.list(restaurantId!)),
    enabled: !!restaurantId,
  });
};

export const useCreateAISetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      restaurantId,
      data,
    }: {
      restaurantId: number;
      data: CreateAISettingInput;
    }) => {
      return api.post<AISetting>(endpoints.aiSettings.create(restaurantId), data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["aiSettings", variables.restaurantId],
      });
      refreshCurrentRestaurant(variables.restaurantId);
    },
  });
};

export const useUpdateAISetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      restaurantId,
      aiSettingId,
      data,
    }: {
      restaurantId: number;
      aiSettingId: number;
      data: UpdateAISettingInput;
    }) => {
      return api.put<AISetting>(
        endpoints.aiSettings.update(restaurantId, aiSettingId),
        data
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["aiSettings", variables.restaurantId],
      });
      refreshCurrentRestaurant(variables.restaurantId);
    },
  });
};

export const useDeleteAISetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      restaurantId,
      aiSettingId,
    }: {
      restaurantId: number;
      aiSettingId: number;
    }) => {
      return api.delete(endpoints.aiSettings.delete(restaurantId, aiSettingId));
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["aiSettings", variables.restaurantId],
      });
      refreshCurrentRestaurant(variables.restaurantId);
    },
  });
};
