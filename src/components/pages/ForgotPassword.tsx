"use client";
import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import "../../../app/globals.css";
import { Alerts, Button, Checkbox, Input } from "../atomics";
import { forgotPassword, resetPassword } from "@/services/auth";
import { ConfirmResetPassword, ResetPassword } from "@/type/forgotPassword";
import {
  forgotPasswordInititals,
  passwordResetInititals,
} from "@/data/resetPassword";
import Spinner from "../atomics/Spinner";
import PageLoader from "../atomics/PageLoader";
import { useRouteChange } from "@/hooks/useRouteChange";
import { useJune } from "@/hooks/useJune";

const ForgotPassword = ({ uid, token }: ConfirmResetPassword) => {
  const router = useRouter();
  const { routeClicked, setRouteClicked } = useRouteChange();

  const [loading, setLoading] = useState(false);
  const [openSuccess, setOpenSuccess] = useState(false);
  const [openError, setOpenError] = useState(false);
  const [openPasswordError, setOpenPasswordError] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const analytics = useJune();
  const isForgotPassword = useMemo(() => {
    return !uid && !token;
  }, [uid, token]);

  const [formData, setFormData] = useState<ResetPassword>(() => {
    return !isForgotPassword ? forgotPasswordInititals : passwordResetInititals;
  });

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!isForgotPassword) {
      if (!formData?.new_password) {
        newErrors.password = "Password is required";
      } else {
        const passwordRegex =
          /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^])[A-Za-z\d@$!%*?&#^]{8,}$/;
        if (!passwordRegex.test(formData?.new_password)) {
          newErrors.password =
            "Password must be at least 8 characters, contain at least one capital letter, one symbol, and one number";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prevState) => ({
      ...prevState,
      [event.target.name]: event.target.value,
    }));
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;
    if (
      !isForgotPassword &&
      formData.new_password !== formData.confirm_password
    ) {
      setOpenPasswordError(true);
      return null;
    }
    setLoading(true);
    const baseUrl = window.location.origin;
    const body = {
      new_password: formData.new_password,
      uid,
      token,
    };
    try {
      isForgotPassword
        ? await forgotPassword(formData, baseUrl)
        : await resetPassword(body);
      analytics?.track(isForgotPassword ? "forgotPassword" : "resetPassword");
      setOpenSuccess(true);
      setFormData({ email: "", new_password: "", confirm_password: "" });
      !isForgotPassword && router.push("/sign-in");
      !isForgotPassword && setRouteClicked(true);
    } catch (err) {
      setOpenError(true);
    }
    setLoading(false);
  };

  return (
    <section className="px-[5%]">
      <div className="relative flex min-h-svh flex-col items-stretch justify-center overflow-auto py-24 lg:py-20">
        <div className="absolute bottom-auto left-0 right-0 top-0 flex h-16 w-full items-center justify-between md:h-18">
          <a href="#">
            <Image
              src="/logo/bloomin-logo.webp"
              alt="Blomin Blinds Logo"
              width="250"
              height="50"
            />
          </a>
        </div>
        <div className="container max-w-sm">
          <div className="mb-6 text-center md:mb-8">
            <h1 className="mb-5 text-5xl font-bold md:mb-6 md:text-7xl lg:text-8xl">
              {isForgotPassword ? "Forgot Password" : "Reset Password"}
            </h1>
          </div>
          <form className="grid grid-cols-1 gap-6" onSubmit={handleSubmit}>
            <div className="grid w-full items-center">
              <Input
                type={isForgotPassword ? "email" : "password"}
                id={isForgotPassword ? "email" : "new_password"}
                value={
                  !isForgotPassword ? formData?.new_password : formData.email
                }
                variant="text"
                label={isForgotPassword ? "Email" : "New Password"}
                placeholder={isForgotPassword ? "Enter Email" : "Enter Password"}
                handleChange={handleChange}
                isRequired
              />
              {errors.email && errors.email && (
                <span className="text-red-500 text-xs">{errors.email}</span>
              )}
              {errors.password && errors.password && (
                <span className="text-red-500 text-xs">{errors.password}</span>
              )}
            </div>
            <div className="grid w-full items-center">
              {!isForgotPassword ? (
                <Input
                  type="password"
                  id="confirm_password"
                  variant="text"
                  label="Re Enter Password"
                  placeholder="Enter password"
                  handleChange={handleChange}
                  value={formData.confirm_password}
                  isRequired
                />
              ) : null}
            </div>
            <div className="grid-col-1 grid gap-4">
              <Button
                variant="primary-bg"
                type="submit"
                className="border-none !h-12"
              >
                {loading ? (
                  <>
                    <Spinner />
                    Submiting
                  </>
                ) : (
                  "Submit"
                )}
              </Button>
            </div>
          </form>
        </div>
        <footer className="absolute bottom-0 left-0 right-0 top-auto flex h-16 w-full items-center justify-center md:h-18">
          <p className="text-sm">© 2024 Revscale AI</p>
        </footer>
      </div>
      {openSuccess && (
        <Alerts
          key={
            isForgotPassword
              ? "request-reset-password"
              : "reset-password-confirm"
          }
          variant="success"
          open={openSuccess}
          setOpen={setOpenSuccess}
          title={isForgotPassword ? "Reset Email Sent" : "Reset Password"}
          desc={
            isForgotPassword
              ? "Please check your email to reset your password"
              : "Your password has been reset successfully"
          }
        />
      )}
      {openError && (
        <Alerts
          key={
            isForgotPassword ? "forgot-password-error" : "reset-password-error"
          }
          variant="error"
          open={openError}
          setOpen={setOpenError}
          title={
            isForgotPassword
              ? "No account found with the provided email address. Please verify your email or customer support for assistance."
              : "Reset Password Error"
          }
          desc={
            isForgotPassword
              ? "Something went wrong please try again"
              : "Something went wrong please try again"
          }
        />
      )}
      {openPasswordError && (
        <Alerts
          key={"reset-password-error"}
          variant="error"
          open={openPasswordError}
          setOpen={setOpenPasswordError}
          title={"Reset Password Error"}
          desc={"Password does not match"}
        />
      )}
      {routeClicked && <PageLoader />}
    </section>
  );
};

export default ForgotPassword;
