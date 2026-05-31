"use client";
import React, {
  Fragment,
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, XIcon } from "@/assets/icons";
import { getFranchises } from "@/services/franchises";
import debounce from "lodash.debounce";
import { signInByFranchise } from "@/services/auth";
import { parseCookies, setCookie } from "nookies";
import { JWT } from "@/constants/enums/enums";
import { DateTime } from "luxon";
import { Modal } from "../molecules";
import { Alerts, Button } from "@/components/atomics";
import { useAuth } from "@/context/auth";
import Spinner from "./Spinner";
import { twMerge } from "tailwind-merge";
import { useJune } from "@/hooks/useJune";
import { useCall } from "@/context/callContext";
import { formatPhoneNumber } from "@/utils/formatPhoneForCall";
import useUserRoles from "@/hooks/useUserRoles";

const CrmViewBox: React.FC<any> = () => {
  const { user, setToken } = useAuth();
  const [selected, setSelected] = useState<any>();
  const [tempSelected, setTempSelected] = useState<any>();

  const [inputValue, setInputValue] = useState<string>("");
  const [inputValueChanged, setInputValueChanged] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [datas, setDatas] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const listRef = useRef<HTMLDivElement>(null);
  const [franchiseTime, setFranchiseTime] = useState<string>("");
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [timeZone, setTimeZone] = useState<string>("");
  const [isloading, setIsloading] = useState(false);
  const analytics = useJune();
  const { setTwilioNumberRef } = useCall();
  const twilioNumberRef = useRef<string | null>(null);
  const { isSuperAdmin, isCustomerCare, isCustomerCareManager } = useUserRoles();

  useEffect(() => {
    if (selected?.twilio_number) {
      twilioNumberRef.current = selected.twilio_number;
    }
  }, [selected]);

  // Pass the ref to the CallProvider
  useEffect(() => {
    setTwilioNumberRef(twilioNumberRef);
  }, [setTwilioNumberRef]);

  useEffect(() => {
    if (inputValueChanged) {
      fetchFranchises(page, inputValue);
    }
  }, [page, inputValueChanged]);

  useEffect(() => {
    const updateTimes = () => {
      const cookies = parseCookies();
      const cookieValue = cookies[JWT];

      let currentDateTime: any = DateTime.now();

      if (cookieValue) {
        const { franchise_timezone } = JSON.parse(cookieValue);
        if (franchise_timezone) {
          currentDateTime = DateTime.now().setZone(franchise_timezone); // Use the franchise's timezone
        }
      }

      setFranchiseTime(currentDateTime.toLocaleString(DateTime.TIME_SIMPLE));
    };

    updateTimes();
    const intervalId = setInterval(updateTimes, 60000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    fetchFranchises(page, inputValue);
    const updateTimes = () => {
      const cookies = parseCookies();
      const cookieValue = cookies[JWT];

      let currentDateTime: any = DateTime.now();
      let timeZone = DateTime.local().zoneName;
      let selected = {
        ...user,
        franchise_name: user?.franchise?.franchise_name,
      };

      if (cookieValue) {
        const { franchise_timezone } = JSON.parse(cookieValue);
        if (franchise_timezone) {
          const franchiseItem = localStorage.getItem("franchise");
          selected = franchiseItem ? JSON.parse(franchiseItem) : null;
          timeZone = franchise_timezone;
          currentDateTime = DateTime.now().setZone(franchise_timezone);
        }
      }
      setSelected({
        ...selected,
        twilio_number: user?.franchise?.primary_number?.twilio_number,
      });
      setTempSelected({
        ...selected,
        twilio_number: user?.franchise?.primary_number?.twilio_number,
      });
      setTimeZone(timeZone);
      setFranchiseTime(currentDateTime.toLocaleString(DateTime.TIME_SIMPLE));
    };
    updateTimes();
  }, [user]);

  const isCurrentUser = useMemo(
    () => user && tempSelected?.email == user?.email,
    [tempSelected, user]
  );
  const isCurrentFranchise = useMemo(
    () => selected && tempSelected?.id == selected?.id,
    [tempSelected, selected]
  );

  const initializeAlert = {
    open: false,
    variant: "success",
    title: "",
    desc: "",
    key: "",
  };
  const [alert, setAlert] = useState<any>(initializeAlert);

  const fetchFranchises = async (page: number, searchQuery: string = "") => {
    try {
      const response: any = await getFranchises(page, searchQuery);
      analytics?.track("getFranchises");
      if (response.results.length < 12) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
      setDatas((prev) => [...(page !== 1 ? prev : []), ...response.results]);
    } catch (error: any) {

      console.error(error);
    } finally {
      setInputValueChanged(false);
    }
  };

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      if (!listRef.current || !hasMore) return;

      const { scrollTop, clientHeight, scrollHeight } = listRef.current;

      if (Math.ceil(scrollTop + clientHeight) >= scrollHeight) {
        setPage((prevPage) => prevPage + 1);
        setInputValueChanged(true);
      }
    },
    [hasMore]
  );

  const handleSelect = async (option: any) => {
    setTempSelected(option);
    setInputValue("");
    setIsOpen(false);
  };

  const handleSave = async () => {
    if (tempSelected?.id != selected?.id) {
      setIsloading(true);
      try {
        const { franchise_token, franchise_timezone, twilio_number }: any =
          await signInByFranchise({
            id: tempSelected.id,
            franchise_id: tempSelected.id,
          });
        analytics?.track("signInByFranchise");
        const currentDateTime = DateTime.now().setZone(franchise_timezone);
        setFranchiseTime(currentDateTime.toLocaleString(DateTime.TIME_SIMPLE));
        setTimeZone(franchise_timezone);
        setSelected({ ...tempSelected, twilio_number: twilio_number });
        localStorage.setItem("franchise", JSON.stringify(tempSelected));
        const cookies = parseCookies();
        let cookieValue = cookies[JWT];
        const { token, creationTime } = JSON.parse(cookieValue);

        if (franchise_token && token && creationTime && franchise_timezone) {
          setToken && setToken(franchise_token);
          const cookieValue = JSON.stringify({
            creationTime,
            token,
            franchise_token,
            franchise_timezone,
          });
          setCookie(null, JWT, cookieValue, {
            maxAge: 60 * 60 * 24 * 30,
            path: "/",
            samesite: "strict",
            secure: process.env.NODE_ENV === "production",
          });
        }
      } catch (error: any) {
        const errorMessage = error?.response?.data?.error || 'Error occured while logging in with franchise';
        setAlert({
          open: true,
          variant: "error",
          title: "Franchise Loggin Error",
          desc: errorMessage,
          key: "error",
        })
        console.error(error);
      } finally {
        setIsloading(false);
      }
    }
  };

  const handleDeselect = () => {
    setSelected({
      ...user,
      franchise_name: user?.franchise?.franchise_name,
      twilio_number: user?.franchise?.primary_number?.twilio_number,
    });
    setTempSelected({
      ...user,
      franchise_name: user?.franchise?.franchise_name,
      twilio_number: user?.franchise?.primary_number?.twilio_number,
    });
    setTimeZone(DateTime.local().zoneName);
    setFranchiseTime(DateTime.now().toLocaleString(DateTime.TIME_SIMPLE));
    localStorage.removeItem("franchise");
    const cookies = parseCookies();
    let cookieValue = cookies[JWT];
    const { token, creationTime } = JSON.parse(cookieValue);

    if (token && creationTime) {
      const cookieValue = JSON.stringify({
        creationTime,
        token,
      });
      setCookie(null, JWT, cookieValue, {
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
        samesite: "strict",
        secure: process.env.NODE_ENV === "production",
      });
    }
    if (selected?.id != user?.id) {
      setToken && setToken(token);
    }
  };

  const debouncedHandleChange = useCallback(
    debounce((value: string) => {
      setInputValueChanged(true);
      setIsOpen(true);
      setPage(1);
      setDatas([]);
    }, 300),
    []
  );

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isOpen) {
      const value = event.target.value;
      setInputValue(value);
      debouncedHandleChange(value);
    }
  };


  return (
    <Fragment>
      {alert && (
        <Alerts
          key={alert.key}
          variant={alert.variant}
          open={alert.open}
          setOpen={() => setAlert(initializeAlert)}
          title={alert.title}
          desc={alert.desc}
        />
      )}
      <div
        className={`relative w-full space-y-1.5 `}
        onClick={() => {
          isSuperAdmin || isCustomerCare || isCustomerCareManager ?
            setOpenDeleteModal(true) : ""
        }}
      >
        <span className="text-sm text-start flex gap-1">
          <span className="truncate text-start text-primary-main text-sm">
            {selected?.franchise_name ?? "Location NA"}
          </span>
        </span>

        <p className="text-start flex gap-1 items-center truncate">
          <span className="text-primary-main text-xs">{franchiseTime}</span>
          <small className="text-xs">
            <i>({timeZone})</i>
          </small>
        </p>
        <p className="text-start flex gap-1 items-center truncate">
          <span className=" text-xs">Outbound: </span>
          <small className="text-xs text-primary-main">
              {selected?.twilio_number && formatPhoneNumber(selected.twilio_number, true)}
          </small>
        </p>
      </div>
      <Modal
        title="Select Franchise"
        className="sm:!translate-x-0  sm:!translate-y-0 min-h-40 lg:left-1 lg:!w-[13rem] min-[1100px]:!w-[13.4rem] xl:!w-[13.8rem] xxl:!w-[14.3rem] max-sm:!w-[14rem] !top-[4.6rem] sm:!left-3 sm:w-[17.8rem] max-lg:[15.5rem]"
        contentSpacing="!px-2 !py-3"
        open={openDeleteModal}
        setOpen={setOpenDeleteModal}
        variant="primary"
      >
        <div className="pt-3 overflow-hidden flex flex-col min-h-[120px]">
          <div
            className={`text-center w-max relative rounded-lg border cursor-pointer   border-neutral-30 max-w-[12.9rem] lg:max-w-[11.7rem]`}
          >
            <div className="relative w-max bg-neutral-20 flex items-center rounded-lg max-w-[12.9rem] lg:max-w-[11.7rem]">
              <input
                type="text"
                value={isOpen ? inputValue : tempSelected?.franchise_name || ""}
                onClick={() => setIsOpen(!isOpen)}
                onChange={handleInputChange}
                className="w-max rounded-lg bg-neutral-20 p-2 outline-0 ring-2 ring-transparent transition-all duration-300 ease-out max-w-[11.2rem] lg:max-w-[10rem]"
                placeholder="Search Franchise"
                onBlur={() => setIsOpen(false)}
              />
              <Spinner
                className={twMerge("pe-1", isloading ? "visible" : "invisible")}
              />
            </div>
            <Listbox as="div" value={tempSelected} onChange={handleSelect}>
              <Transition
                as={Fragment}
                show={isOpen}
                enter="transition duration-300 ease-out"
                enterFrom="transform scale-y-95 opacity-0"
                enterTo="transform scale-y-100 opacity-100"
                leave="transition duration-300 ease-out"
                leaveFrom="transform scale-100 opacity-100"
                leaveTo="transform scale-95 opacity-0"
                afterLeave={() => setIsOpen(false)}
              >
                <Listbox.Options
                  ref={listRef}
                  onScroll={handleScroll}
                  className="fixed z-10 mt-1 max-w-[12.5rem] lg:max-w-[11.7rem] max-h-[300px] w-full overflow-y-scroll overflow-x-hidden rounded-md border text-sm"
                >
                  {datas.map((data, dataIdx) => (
                    <Listbox.Option
                      key={dataIdx}
                      className={({ active }) =>
                        `relative select-none px-4 py-2 text-neutral-60 bg-white hover:bg-primary-surface ${active ? "bg-gray-100" : ""
                        }`
                      }
                      value={data}
                    >
                      {({ selected }) => (
                        <>
                          <span
                            className={`block truncate ${selected ? "font-bold" : "font-normal"
                              }`}
                          >
                            {data.franchise_name}
                          </span>
                          {selected && (
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                              <CheckIcon
                                className="h-5 w-5"
                                aria-hidden="true"
                              />
                            </span>
                          )}
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </Listbox>
          </div>
          <footer className="flex justify-end gap-3 mt-auto">
            <Button
              className="!h-10"
              size="md"
              variant={
                isCurrentUser || isloading ? "disabled-bg" : "primary-bg"
              }
              disabled={isCurrentUser || isloading}
              onClick={handleDeselect}
            >
              Reset
            </Button>
            <Button
              className="!h-10"
              size="md"
              variant={
                isCurrentUser || isCurrentFranchise || isloading
                  ? "disabled-bg"
                  : "primary-bg"
              }
              disabled={isCurrentUser || isCurrentFranchise || isloading}
              onClick={handleSave}
            >
              Save
            </Button>
          </footer>
        </div>
      </Modal>
    </Fragment>
  );
};

export default CrmViewBox;
