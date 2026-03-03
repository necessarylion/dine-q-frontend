import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { useAlertDialog } from "@/hooks/useAlertDialog";
import {
  useUpdateProfile,
  useChangePassword,
  useChangeEmail,
  useVerifyChangeEmail,
} from "@/hooks/useUserProfile";
import {
  updateProfileSchema,
  changePasswordSchema,
  changeEmailSchema,
  verifyOtpSchema,
  type UpdateProfileFormData,
  type ChangePasswordFormData,
  type ChangeEmailFormData,
  type VerifyOtpFormData,
} from "@/schemas/auth_schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldContent, FieldError, FieldDescription } from "@/components/ui/field";

export const UserProfileTab = () => {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <UpdateNameCard />
      <ChangePasswordCard />
      <ChangeEmailCard />
    </div>
  );
};

const UpdateNameCard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { alert } = useAlertDialog();
  const updateProfile = useUpdateProfile();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { name: user?.name || "" },
  });

  const onSubmit = async (data: UpdateProfileFormData) => {
    try {
      await updateProfile.mutateAsync(data);
      await alert({ title: t("settings.profileUpdated"), description: t("settings.profileUpdatedDescription") });
    } catch (error: unknown) {
      const message = (error as { message?: string })?.message || t("settings.failedToUpdateProfile");
      await alert({ title: t("common.error"), description: message });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("settings.updateName")}</CardTitle>
        <p className="text-sm text-muted-foreground">{t("settings.updateNameDescription")}</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field data-invalid={!!errors.name}>
            <FieldLabel>{t("settings.name")}</FieldLabel>
            <FieldContent>
              <Input {...register("name")} />
            </FieldContent>
            {errors.name && <FieldError>{errors.name.message}</FieldError>}
          </Field>
          <Button type="submit" size="sm" disabled={updateProfile.isPending}>
            {updateProfile.isPending ? t("common.saving") : t("common.save")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

const ChangePasswordCard = () => {
  const { t } = useTranslation();
  const { alert } = useAlertDialog();
  const changePassword = useChangePassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { current_password: "", new_password: "" },
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      await changePassword.mutateAsync(data);
      reset();
      await alert({ title: t("settings.passwordChanged"), description: t("settings.passwordChangedDescription") });
    } catch (error: unknown) {
      const message = (error as { message?: string })?.message || t("settings.failedToChangePassword");
      await alert({ title: t("common.error"), description: message });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("settings.changePassword")}</CardTitle>
        <p className="text-sm text-muted-foreground">{t("settings.changePasswordDescription")}</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field data-invalid={!!errors.current_password}>
            <FieldLabel>{t("settings.currentPassword")}</FieldLabel>
            <FieldContent>
              <Input type="password" {...register("current_password")} />
            </FieldContent>
            {errors.current_password && <FieldError>{errors.current_password.message}</FieldError>}
          </Field>
          <Field data-invalid={!!errors.new_password}>
            <FieldLabel>{t("settings.newPassword")}</FieldLabel>
            <FieldContent>
              <Input type="password" {...register("new_password")} />
            </FieldContent>
            {errors.new_password && <FieldError>{errors.new_password.message}</FieldError>}
            <FieldDescription>{t("settings.passwordRule")}</FieldDescription>
          </Field>
          <Button type="submit" size="sm" disabled={changePassword.isPending}>
            {changePassword.isPending ? t("common.saving") : t("settings.changePassword")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

const ChangeEmailCard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { alert } = useAlertDialog();
  const changeEmail = useChangeEmail();
  const verifyChangeEmail = useVerifyChangeEmail();

  const [otpSent, setOtpSent] = useState(false);

  const emailForm = useForm<ChangeEmailFormData>({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: { new_email: "" },
  });

  const otpForm = useForm<VerifyOtpFormData>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { otp: "" },
  });

  const onSendOtp = async (data: ChangeEmailFormData) => {
    try {
      await changeEmail.mutateAsync(data);
      setOtpSent(true);
    } catch (error: unknown) {
      const message = (error as { message?: string })?.message || t("settings.failedToChangeEmail");
      await alert({ title: t("common.error"), description: message });
    }
  };

  const onVerifyOtp = async (data: VerifyOtpFormData) => {
    try {
      await verifyChangeEmail.mutateAsync(data);
      setOtpSent(false);
      emailForm.reset();
      otpForm.reset();
      await alert({ title: t("settings.emailChanged"), description: t("settings.emailChangedDescription") });
    } catch (error: unknown) {
      const message = (error as { message?: string })?.message || t("settings.failedToVerifyOtp");
      await alert({ title: t("common.error"), description: message });
    }
  };

  const handleBack = () => {
    setOtpSent(false);
    otpForm.reset();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("settings.changeEmail")}</CardTitle>
        <p className="text-sm text-muted-foreground">{t("settings.changeEmailDescription")}</p>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">{t("settings.currentEmail")}</p>
          <p className="text-sm font-medium">{user?.email}</p>
        </div>

        {!otpSent ? (
          <form onSubmit={emailForm.handleSubmit(onSendOtp)} className="space-y-4">
            <Field data-invalid={!!emailForm.formState.errors.new_email}>
              <FieldLabel>{t("settings.newEmail")}</FieldLabel>
              <FieldContent>
                <Input type="email" {...emailForm.register("new_email")} />
              </FieldContent>
              {emailForm.formState.errors.new_email && (
                <FieldError>{emailForm.formState.errors.new_email.message}</FieldError>
              )}
            </Field>
            <Button type="submit" size="sm" disabled={changeEmail.isPending}>
              {changeEmail.isPending ? t("common.saving") : t("settings.sendOtp")}
            </Button>
          </form>
        ) : (
          <form onSubmit={otpForm.handleSubmit(onVerifyOtp)} className="space-y-4">
            <p className="text-sm text-muted-foreground">{t("settings.otpDescription")}</p>
            <Field data-invalid={!!otpForm.formState.errors.otp}>
              <FieldLabel>{t("settings.otp")}</FieldLabel>
              <FieldContent>
                <Input
                  {...otpForm.register("otp")}
                  maxLength={6}
                  placeholder="000000"
                />
              </FieldContent>
              {otpForm.formState.errors.otp && (
                <FieldError>{otpForm.formState.errors.otp.message}</FieldError>
              )}
            </Field>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={handleBack}>
                {t("common.back")}
              </Button>
              <Button type="submit" size="sm" disabled={verifyChangeEmail.isPending}>
                {verifyChangeEmail.isPending ? t("common.saving") : t("settings.verifyOtp")}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
};
