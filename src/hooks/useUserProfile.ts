import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { useAuthStore } from "@/stores/authStore";
import type {
  UpdateProfileInput,
  ChangePasswordInput,
  ChangeEmailInput,
  VerifyChangeEmailInput,
  MessageResponse,
} from "@/types";

export const useUpdateProfile = () => {
  return useMutation({
    mutationFn: (data: UpdateProfileInput) =>
      api.put<MessageResponse>(endpoints.auth.profile, data),
    onSuccess: () => {
      useAuthStore.getState().refreshUser();
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: ChangePasswordInput) =>
      api.put<MessageResponse>(endpoints.auth.password, data),
  });
};

export const useChangeEmail = () => {
  return useMutation({
    mutationFn: (data: ChangeEmailInput) =>
      api.post<MessageResponse>(endpoints.auth.changeEmail, data),
  });
};

export const useVerifyChangeEmail = () => {
  return useMutation({
    mutationFn: (data: VerifyChangeEmailInput) =>
      api.post<MessageResponse>(endpoints.auth.verifyChangeEmail, data),
    onSuccess: () => {
      useAuthStore.getState().refreshUser();
    },
  });
};
