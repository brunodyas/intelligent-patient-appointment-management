"use client";

import "./index.css";
import { useCall } from "@/context/callContext";
import { initializeAlert } from "@/data";
import { useLogout } from "@/hooks/useLogout";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Sheet,
  SheetClose,
  SheetContent,
  SheetOverlay,
  SheetPortal,
  SheetTrigger,
} from "@relume_io/relume-ui";
import Link from "next/link";
import { useEffect, useState, useRef, useMemo, Fragment } from "react";
import { BiBell } from "react-icons/bi";
import { FaUser } from "react-icons/fa";
import { FiPhone } from "react-icons/fi";
import { RxCross2, RxHamburgerMenu } from "react-icons/rx";
import { routes } from "../../src/constants/routes";
import { Alerts } from "./atomics";
import PageLoader from "./atomics/PageLoader";
import Route from "./atomics/Route";
import PersistentCallModal from "./molecules/PersistentCallModal";
import SideNav from "./SideNav";
import ProfileSettingModal from "./templates/user/ProfileSettingModal";
import { useAuth } from "@/context/auth";
import useNotificationWebSocket from "@/hooks/useNotification";
import { markNotificationAsRead } from "@/services/notifications";
import Notification from "./templates/Notification";
import SupportModal from "./templates/support/SupportModal";

import { getTwilioToken } from "@/services/phoneCall";

import Image from "next/image";
import { useRouteChange } from "@/hooks/useRouteChange";
import { twMerge } from "tailwind-merge";
import { useJune } from "@/hooks/useJune";
import useUserRoles from "@/hooks/useUserRoles";
import SuperAdminOrCustomerCareGuard from "@/guard/SuperAdminOrCustomerCareGuard";
import getWebSocketUrl from "@/utils/getWebSocketUrl";

interface NavShellProps {
  children: React.ReactNode;
}

const NavShell: React.FC<NavShellProps> = ({ children }) => {
  const { routeClicked, logoutAlert, setLogoutAlert, handleLogout } =
    useLogout();
  const {isCustomerCare,isAdmin,isSuperAdmin, isCustomerCareManager } = useUserRoles();
  const { currentRoute } = useRouteChange();
  const [openMobileNav, setOpenMobileNav] = useState(false);

  useMemo(() => openMobileNav && setOpenMobileNav(false), [currentRoute]);

  const { user, token, fetchUserDetails } = useAuth();

  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [identity, setIdentity] = useState("");
  const [openSuccess, setOpenSuccess] = useState(false);
  const [openSuccessSupport, setOpenSuccessSupport] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [profileDropDownToggle, setProfileDropDownToggle] = useState(false);
  const [supportModalTitle, setSupportModalTitle] =
  useState<string>("Bug Report");
  const [openEditProfile, SetOpenEditProfile] = useState(false);
  const [openSupportModal, setOpenSupportModal] = useState(false);
  
  const { call, isBusy, incomingCall, pickedCall } = useCall();

  const isBusyRef = useRef(isBusy);
  
  const isOnlineRef = useRef(isOnline);

  const analytics = useJune();

  const {
    isAllNotificationRead,
    notifications,
    loadMoreNotifications,
    handleReadNotification,
    hasMore,
    loading,
  } = useNotificationWebSocket(!!user);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastNotificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isOnlineStatus = localStorage.getItem("isOnline");
      setIsOnline(isOnlineStatus === "true");
      isOnlineRef.current = isOnlineStatus === "true";
    }
  }, []);

  // Update the ref whenever isBusy changes
  useEffect(() => {
    isBusyRef.current = isBusy;
  }, [isBusy]);

  useEffect(() => {
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        loadMoreNotifications();
      }
    });

    if (lastNotificationRef.current) {
      observer.current.observe(lastNotificationRef.current);
    }

    return () => {
      if (observer.current) observer.current.disconnect();
    };
  }, [hasMore, loading, loadMoreNotifications]);

  // Effect to initialize state from localStorage on mount only
  useEffect(() => {
    const storedVisibility = localStorage.getItem("modalVisibility");
    if (storedVisibility !== null) {
      setIsModalVisible(JSON.parse(storedVisibility));
    }
  }, []);

  // Effect to auto-toggle modal visibility based on call state
  useEffect(() => {
    // Automatically show the modal if there's an active incoming call
    if (incomingCall || pickedCall) {
      setIsModalVisible(true); // Show modal on incoming call
    } else if (!call) {
      setIsModalVisible(false); // Hide if no active call
    }
  }, [incomingCall, call, pickedCall]);


  // Effect to update localStorage whenever isModalVisible changes
  useEffect(() => {
    localStorage.setItem("modalVisibility", JSON.stringify(isModalVisible));
  }, [isModalVisible]);

  const toggleModalVisibility = () => {
    setIsModalVisible((prev) => !prev);
  };


  useEffect(() => {
    const fetchIdentity = async () => {
      try {
        const response = await getTwilioToken();
        analytics?.track("getTwilioToken");
        const { identity } = response;

        setIdentity(identity);
      } catch (error) {
        console.error("Failed to get Twilio token:", error);
      }
    };

    fetchIdentity();
  }, []);

  const toggleSwitch = () => {
    setIsOnline((prevState) => !prevState);
    isOnlineRef.current = !isOnlineRef.current;
    localStorage.setItem("isOnline", JSON.stringify(!isOnline));
    if (isOnline) {
      console.log("user is offline", identity);
    } else {
      console.log("user is online", identity);
    }
  };

    useEffect(() => {

      if (!isCustomerCare && !isCustomerCareManager) return;

      const backendUrl = process.env.NEXT_PUBLIC_BE_URL;
      const wsUrl = backendUrl ? getWebSocketUrl(backendUrl) : "";
      if (!wsUrl) return;

      let ws: WebSocket | null = null;
      let intervalId: NodeJS.Timeout | null = null;
      let retryTimeout: NodeJS.Timeout | null = null;
      let retryCount = 0;
      const maxRetries = 5; 
      const retryDelay = 5000;
      
      const cleanup = () => {
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
        if (ws) {
          ws.close();
          ws = null;
        }
        if (retryTimeout) {
          clearTimeout(retryTimeout);
          retryTimeout = null;
        }
      };
  
      if (!isOnlineRef.current) {
        cleanup();
        console.log("Disabling the websocket connection to check the status beacuse user is set to offline");
        return;
      }
  
      const connectWebSocket = () => {
        ws = new WebSocket(`${wsUrl}/ws/status/`);
  
        ws.onopen = () => {
          retryCount = 0;
          console.log("WebSocket connection established in navshell with", backendUrl);
  
          const initialData = { status: isOnlineRef.current, identity, isBusy: isBusyRef.current };
  
          if (ws?.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(initialData));
            console.log("Sent on open:", initialData);
  
            intervalId = setInterval(() => {
              if (ws?.readyState === WebSocket.OPEN && identity) {
                const data = { status: isOnlineRef.current, identity, isBusy: isBusyRef.current };
                ws.send(JSON.stringify(data));
                console.log("Pinging BE for call center:", data);
              }
            }, 5000);
          }
        };
  
        ws.onclose = (event) => {
          console.warn("WebSocket connection closed:", event.reason);
          cleanup();
          isOnlineRef.current && retryConnection();
        };
  
        ws.onerror = (error) => {
          console.error("WebSocket error in navshell:", error);
          cleanup();
          isOnlineRef.current && retryConnection();
        };
      };
  
      const retryConnection = () => {
        if (retryCount < maxRetries) {
          retryCount++;
          console.log(`Retrying WebSocket connection (attempt ${retryCount}/${maxRetries})...`);
          retryTimeout = setTimeout(connectWebSocket, retryDelay);
        } else {
          console.error("Max retries reached. WebSocket connection failed.");
        }
      };
  
  
      connectWebSocket();
  
      return () => {
        cleanup();
      };
    }, [isOnline, identity]);

  const handleToggleNavUserIcon = () =>
    setProfileDropDownToggle(!profileDropDownToggle);

  return (
    <>
      <div className="sticky top-0 flex min-h-16 w-full items-center border-b px-2 sm:px-4 md:min-h-18 md:px-8 bg-white z-[31]">
        <ProfileSettingModal
          SetOpenEditProfile={SetOpenEditProfile}
          openEditProfile={openEditProfile}
          setOpenSuccess={setOpenSuccess}
          refetch={fetchUserDetails}
        />
        <SupportModal
          setOpenSupportModal={setOpenSupportModal}
          openSupportModal={openSupportModal}
          setOpenSuccessSupport={setOpenSuccessSupport}
          setSupportModalTitle={setSupportModalTitle}
        />
        <div className="mx-auto grid size-full grid-cols-2 items-center">
          <div className="flex justify-start items-center gap-2">
            <div className="lg:hidden flex !pointer-events-auto">
              <Sheet
                open={openMobileNav}
                onOpenChange={() => setOpenMobileNav(!openMobileNav)}
              >
                <SheetTrigger>
                  <RxHamburgerMenu className="size-8 max-sm:size-6" />
                </SheetTrigger>
                <SheetPortal>
                  <SheetOverlay className="bg-black/60" />
                  <SheetContent
                    side="left"
                    className="overflow-hidden sm:w-full sm:max-w-[19.5rem] lg:w-full lg:max-w-[19.5rem] lg:overflow-auto !p-0 max-sm:w-full"
                  >
                    <SheetClose className="right-5 top-5 text-black z-50">
                      <RxCross2 className="size-6" />
                    </SheetClose>
                    <SideNav
                      SetOpenEditProfile={SetOpenEditProfile}
                      setOpenSupportModal={setOpenSupportModal}
                    />
                  </SheetContent>
                </SheetPortal>
              </Sheet>
            </div>
            <Route route={routes.feed} linkClassName="justify-self-start">
              <img
                src="/logo/bloomin-logo.webp"
                alt="Bloomin Blindslogo"
                className="shrink-0"
                width="220"
                height="50"
              />
            </Route>
          </div>
          <div className="flex gap-2 max-sm:gap-0 justify-self-end md:gap-4 items-center hover:cursor-pointer">
            {/* {process.env.NODE_ENV !== ENVS.production && ( */}
              <>
              {(isCustomerCare|| isCustomerCareManager) && (
                <>
                <div className={`relative hidden md:flex items-center w-[80px] h-6 ${isOnline? 'shadow-2xl shadow-green-500 ring-2 ring-green-500 rounded-full' : 'shadow-2xl shadow-red-400 ring-2 ring-red-400 rounded-full'}`}>
                  <input
                    type="checkbox"
                    id="bopis"
                    className="absolute opacity-0 w-0 h-0"
                    checked={isOnline}
                    onChange={toggleSwitch}
                  />
                  <label
                    htmlFor="bopis"
                    className={`block w-full h-full rounded-full cursor-pointer transition-colors duration-300 bg-gray-300 `}
                  >

                    <span
                      className={`block w-5 h-5 mt-[2px] rounded-full  shadow-inner transform transition-transform duration-300 ${isOnline ? 'translate-x-[3.47rem] mx-[2px] bg-green-500' : 'translate-x-1 bg-red-400 mx-[-2px]'}`}
                    ></span>

                    <span
                      className={`absolute left-2 right-0 top-0 bottom-0 flex items-center justify-start text-sm font-bold text-gray-600 transition-opacity duration-300 ${isOnline ? 'opacity-100' : 'opacity-0'}`}
                    >
                      Online
                    </span>


                    <span
                      className={`absolute left-0 right-2 top-0 bottom-0 flex items-center justify-end text-sm font-bold text-gray-600 transition-opacity duration-300 ${isOnline ? 'opacity-0' : 'opacity-100'}`}
                    >
                      Offline
                    </span>

                    {/* <span className={`absolute transform $${!isOnline ? 'translate-x-[4.2rem]' : 'translate-x-1'}  top-0 bottom-0 flex items-center justify-center text-xs font-semibold text-gray-600 transition-transform`}> {isOnline ? 'Online' : 'Offline'}</span> */}
                  </label>
                </div>
                {/* small screen offline/online toggle */}
                 <label className="inline-flex md:hidden items-center cursor-pointer">
                 <input
                   type="checkbox"
                   checked={isOnline}
                   onChange={toggleSwitch}
                   className="sr-only peer"
                 />
                 <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#C63D7F] rounded-full peer  peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all  peer-checked:bg-[#C63D7F]"></div>
                 {/* <span className="ms-3 text-sm font-medium text-gray-300 dark:text-gray-300">
                   {isOnline ? "Online" : "Offline"}
                 </span> */}
               </label>
               </>

              )}
                {(isSuperAdmin || isCustomerCare || isCustomerCareManager) && (
                <div className="cursor-pointer border border-border-alternative p-2 max-sm:p-1 focus-visible:outline-none relative">
                  <FiPhone
                    className="text-xl max-sm:text-md cursor-pointer"
                    onClick={toggleModalVisibility}
                  />
                </div>
            )}
              </>
            {/* )} */}

            <DropdownMenu>
              <DropdownMenuTrigger className="relative max-sm:px-1">
                <div
                  className={twMerge(
                    "absolute bottom-auto left-auto right-2 max-sm:right-[0.7rem] top-2 max-sm:top-[0.6rem] size-2 max-sm:size-1 rounded-full bg-primary-main outline outline-[3px] max-sm:outline-[1px] outline-offset-0 outline-white",
                    isAllNotificationRead && "hidden"
                  )}
                />
                <BiBell className="size-6 max-sm:size-5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="max-w-[24rem] min-w-[24rem] max-sm:min-w-[20rem] max-sm:max-w-[20rem] max-xsm:min-w-[18rem] max-xsm:max-w-[18rem] p-0 border-gray-200 rounded-lg"
                align="end"
                sideOffset={0}
              >
                <Notification
                  handleReadNotification={handleReadNotification}
                  notifications={notifications}
                  lastNotificationRef={lastNotificationRef}
                  loading={loading}
                  user={user}
                />
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu
              open={profileDropDownToggle}
              onOpenChange={handleToggleNavUserIcon}
            >
              <DropdownMenuTrigger className="flex items-center p-0">
                <div className="size-10 max-sm:size-9 object-cover rounded-full flex items-center justify-center bg-gray-200">
                  {user?.photo ? (
                    <Image
                      src={user.photo}
                      alt="user"
                      width={10}
                      height={10}
                      className="w-full h-full object-cover rounded-full"
                      unoptimized
                    />
                  ) : (
                    <FaUser size="50%" color="#fff" />
                  )}
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                sideOffset={0}
                className="mt-2 bg-white shadow-lg border border-gray-200 rounded-md w-50"
                onClick={handleToggleNavUserIcon}
              >
                <DropdownMenuGroup>
                  <DropdownMenuItem className="hover:bg-neutral-101 hover:rounded-md">
                    <Link
                      href="/settings"
                      className="block w-full text-left text-gray-700"
                    >
                      Profile Settings
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="my-2 border-t border-gray-200" />
                  <DropdownMenuItem
                    className="hover:bg-neutral-101 hover:rounded-md"
                    onClick={handleLogout}
                  >
                    <button className="block w-full text-left text-gray-700">
                      Log Out
                    </button>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      <div className="relative flex flex-col items-stretch lg:flex-row lg:items-start max-md:z-30">
        <div className="max-lg:hidden absolute w-[18rem] lg:border-r overflow-y-auto -top-16 md:-top-[4.54rem] z-[1] flex h-full flex-col lg:top-18 md:h-auto lg:sticky lg:h-[calc(100vh-4.5rem)]">
          <SideNav
            SetOpenEditProfile={SetOpenEditProfile}
            setOpenSupportModal={setOpenSupportModal}
          />
        </div>
        {logoutAlert && (
          <Alerts
            key={logoutAlert.key}
            variant={logoutAlert.variant}
            open={logoutAlert.open}
            setOpen={() => setLogoutAlert(initializeAlert)}
            title={logoutAlert.title}
            desc={logoutAlert.desc}
          />
        )}
        <Alerts
          key="alert-EditUser-added"
          variant="success"
          open={openSuccess}
          setOpen={setOpenSuccess}
          title="Profile updated successfully."
          desc=""
        />
        <Alerts
          key="alert-addReport-added"
          variant="success"
          open={openSuccessSupport}
          setOpen={setOpenSuccessSupport}
          title={`${supportModalTitle} submitted success.`}
          desc=""
        />
        {/* Shell Main wrapper */}
        <main className="px-7 py-3 max-sm:px-1 w-full max-md:px-2 max-lg:[100%] h-[calc(100vh-4.5rem)] overflow-auto">
        <SuperAdminOrCustomerCareGuard>
          <PersistentCallModal isVisible={isModalVisible} />
        </SuperAdminOrCustomerCareGuard>
          <Fragment key={token}>{children}</Fragment>
        </main>
      </div>
      {routeClicked && <PageLoader />}
    </>
  );
};

export default NavShell;
