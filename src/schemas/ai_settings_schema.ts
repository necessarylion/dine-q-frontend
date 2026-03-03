import { z } from "zod";

export const createAISettingFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  base_url: z.string().url("Must be a valid URL"),
  model: z.string().min(1, "Model is required"),
  vision_model: z.string().min(1, "Vision model is required"),
  api_key: z.string().min(1, "API key is required"),
  is_active: z.boolean().default(false),
});

export const updateAISettingFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  base_url: z.string().url("Must be a valid URL"),
  model: z.string().min(1, "Model is required"),
  vision_model: z.string().min(1, "Vision model is required"),
  api_key: z.string().optional(),
  is_active: z.boolean().default(false),
});

export type CreateAISettingFormData = z.infer<typeof createAISettingFormSchema>;
export type UpdateAISettingFormData = z.infer<typeof updateAISettingFormSchema>;
