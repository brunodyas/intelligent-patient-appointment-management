"use client";
import { useRouter } from 'next/navigation';
import * as Tooltip from "@radix-ui/react-tooltip";
import { LoadingIcon } from "@/assets/icons";
import { Alerts, Button, Title } from "@/components/atomics";
import UserForm from "@/components/templates/settings/UserForm";
import { useAuth } from "@/context/auth";
import { useUser } from "@/hooks/user/useUser";
import { EditProfile } from "@/services/user";
import { useEffect, useState } from "react";
import { useJune } from "@/hooks/useJune";
import { unlinkGoogleAccount } from "@/services/auth";
import GoogleIcon from "@/assets/icons/GoogleIcon";
import { BiBell } from "react-icons/bi";
import { twMerge } from "tailwind-merge";
import useUserAgent from "@/hooks/usePwa";
import NotificatioPopUp from "@/components/templates/NotificatioPopUp";
import useUserRoles from '@/hooks/useUserRoles';
import { unformatPhoneNumber } from '@/utils/formatPhoneForCall';

const userInitialValue: any = {
    name: "",
    email: "",
    photo: "",
    phone: "",
    role: "",
    franchise: null,
    tech_license_plate: "",
    tech_vehicle: "",
};

const PersonalSetting = () => {
    const router = useRouter();
    const [userData, setuserData] = useState<any>(userInitialValue);
    const [enableNotification, setEnableNotification] = useState<boolean>(false)
    const [openNotificationPopup, setOpenNotificationPopUp] = useState<boolean>(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isLoading, setIsLoading] = useState(false);
    const [openSuccess, setOpenSuccess] = useState(false);
    const { isSuperAdmin, isCustomerCare } = useUserRoles();
    const { user, fetchUserDetails } = useAuth();
    const { file, blob, reset, handleChangeFile, setDefault } = useUser();
    const analytics = useJune();
    const { userAgent, isMobile } = useUserAgent();

    useEffect(() => {
        if ('Notification' in window) {
            setEnableNotification(Notification.permission === "granted");
        }
    }, [enableNotification]);


    const validate = () => {
        const newErrors: { [key: string]: string } = {};
        if (!userData.name) newErrors.title = "Name is required";
        if (!userData.email) newErrors.content = "Email is required";
        if (!userData.role) newErrors.role = "Role is required";
        if (userData.role == "Tech") {
            if (!userData.shift_start_time) {
                newErrors.shift_start_time = "Shift start time is required";
            }
            if (!userData.shift_end_time) {
                newErrors.shift_end_time = "Shift end time is required";
            }
        }
        if (!userData.tech_vehicle) newErrors.tech_vehicle = "Vehicle is required";
        const phoneRegex = /^\d{10}$/;
        if (userData.user_phone && !phoneRegex.test(unformatPhoneNumber(userData.user_phone))) {
            newErrors.user_phone = "Phone number must be exactly 10 digits.";
        }
        if (!userData.tech_license_plate)
            newErrors.tech_license_plate = "License plate is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        try {
            setIsLoading(true);
            const response = await EditProfile({
                ...userData,
                ...(blob && { photo: blob }),
            });
            analytics?.track("EditProfile");
            response && setIsLoading(false);
            setOpenSuccess(true);
            fetchUserDetails && fetchUserDetails();
        } catch (e) {
            throw e;
        } finally {
            setIsLoading(false);
            reset();
        }
    };

    useEffect(() => {
        if (user) {
            const { photo, ...restOfUser } = user
            setuserData({
                ...restOfUser,
                user_phone: user.user_phone ? user.user_phone.substring(2) : "",
            });

            photo && setDefault(photo);
        }
    }, [user]);

    const handleGoogleAccount = async () => {
        if (user?.google_refresh_token) {
            try {
                setIsLoading(true);
                const userResponse = await unlinkGoogleAccount(userData.email);
                analytics?.track("EditProfile");
                userResponse && setIsLoading(false);
                setOpenSuccess(true);
                fetchUserDetails && fetchUserDetails();
            } catch (e) {
                throw e;
            } finally {
                setIsLoading(false);
                reset();
            }
        } else {
            handleGoogleSignIn();
        }
    }

    const handleGoogleSignIn = () => {
        const googleOAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
            }&redirect_uri=${encodeURIComponent(`${window.location.origin}/callback`)}&response_type=code&scope=email profile openid https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/gmail.send&access_type=offline&prompt=consent&state=${encodeURIComponent(
                JSON.stringify({ email: user?.email || "" })
            )}`;
        window.location.href = googleOAuthUrl;
    };

    const handleEnableNotification = () => {
        Notification.requestPermission().then((permission) => {
            if (permission === "granted") {
                setEnableNotification(true);
            }
        });

        if (Notification.permission === "denied") {
            setOpenNotificationPopUp(true);
        }
    }

    return (
        <>
            {/* {(!isSuperAdmin && !isCustomerCare) &&
                <div className="flex justify-between items-start px-1 pt-5">
                    <Title
                        size="2xl"
                        variant={"undefined"}
                        className="gap-0 !text-2xl text-text-black"
                    >
                        Settings
                    </Title>

                </div>} */}

            <div className="py-8 px-3 sm:px-1">
                <div className="pb-8">
                    <div className="flex flex-col sm:flex-row gap-3 justify-between pb-[22px] mb-6 border-b border-gray-200">
                        <div>
                            <h1 className="text-lg font-semibold text-gray-900">
                                Personal info
                            </h1>
                            <p className="text-sm text-gray-600">
                                Update your photo and personal details here.
                            </p>
                        </div>
                        <Button
                            size="md"
                            variant="primary-bg"
                            onClick={async (e) => {
                                await handleSubmit();
                            }}
                            disabled={isLoading}
                            className="!w-[59px] !h-[40px]"
                        >
                            {isLoading ? <LoadingIcon /> : "Save"}
                        </Button>
                    </div>
                    <div className="flex flex-col">
                        <UserForm
                            setFormData={setuserData}
                            errors={errors}
                            formData={userData}
                            formType="edit"
                            userRole={user?.role || ""}
                            handleChangeFile={handleChangeFile}
                            file={file}
                        />
                    </div>

                    <div>
                        <h1 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-[22px] mb-6">
                            Notifications
                        </h1>
                        <div
                            className="flex flex-row gap-1.5 md:gap-5 pb-5 mb-6 border-b border-gray-200"
                        >
                            <p className="text-gray-700 text-sm font-semibold md:max-w-[280px] w-full">
                                Enable Notification
                            </p>
                            <div className="md:max-w-[512px] w-full justify-end md:justify-start flex">
                                <Tooltip.Provider>
                                    <Tooltip.Root>
                                        <Tooltip.Trigger asChild>
                                            <div>
                                                <Button
                                                    disabled={enableNotification}
                                                    size="md"
                                                    variant="primary-bg"
                                                    onClick={() => handleEnableNotification()}
                                                    className="order-3 min-[633px]:order-1"
                                                >
                                                    <BiBell className="h-4 w-4" />
                                                    Allow
                                                </Button>
                                            </div>
                                        </Tooltip.Trigger>
                                        {enableNotification && (
                                            <Tooltip.Portal>
                                                <Tooltip.Content className="data-[state=delayed-open]:data-[side=top]:animate-slideDownAndFade data-[state=delayed-open]:data-[side=right]:animate-slideLeftAndFade data-[state=delayed-open]:data-[side=left]:animate-slideRightAndFade data-[state=delayed-open]:data-[side=bottom]:animate-slideUpAndFade text-white select-none rounded-[4px] bg-[#aaaaaa] px-3 py-1 !text-xs leading-none shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] will-change-[transform,opacity] max-w-[250px] relative z-[9999] font-bold" sideOffset={5}>
                                                    Notifications are already enabled. If you wish to disable them, please go to your browser&apos;s settings
                                                    <Tooltip.Arrow className="fill-[#aaaaaa]" />
                                                </Tooltip.Content>
                                            </Tooltip.Portal>)}
                                    </Tooltip.Root>
                                </Tooltip.Provider>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2 items-center">
                        <Button
                            variant="default-bg"
                            className="border !border-gray-200 !h-12"
                            onClick={handleGoogleAccount}
                            disabled={isLoading}
                        >
                            <GoogleIcon />
                            {isLoading ? <LoadingIcon /> : null}
                            {user?.google_refresh_token ? "Unlink" : "Link"} Google
                        </Button>
                        <span
                            className={twMerge(
                                "text-primary-main font-semibold bg-primary-surface px-2.5 py-1.5 rounded-full h-fit",
                                !user?.google_mail && "hidden"
                            )}
                        >
                            {user?.google_mail}
                        </span>
                    </div>
                </div>
                <Alerts
                    key="alert-EditUser-added"
                    variant="success"
                    open={openSuccess}
                    setOpen={setOpenSuccess}
                    title="Profile updated successfully."
                    desc=""
                />
                {openNotificationPopup && (
                    <div
                        className="fixed top-0 left-0 right-0 bottom-0 bg-black/70 z-[99]"
                    >
                        <NotificatioPopUp
                            browserType={userAgent}
                            setOpenNotificationPopUp={setOpenNotificationPopUp}
                            isMobile={isMobile}
                        />
                    </div>
                )
                }


            </div >
        </>
    );
};

export default PersonalSetting;
