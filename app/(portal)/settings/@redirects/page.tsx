"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alerts, Button, Input, MultipleSelectBox, Selectbox } from "@/components/atomics";
import UI8Table from "@/components/UI8Table";
import { size } from "@/constants/constants";
import { LoadingIcon } from "@/assets/icons";
import { useJune } from "@/hooks/useJune";
import useUserRoles from "@/hooks/useUserRoles";
import { addRedirect, deleteRedirects, getRedirects, getRedirectsById, updateRedirects } from "@/services/redirects";
import { ListRedirectResponse, RedirectsData } from "@/interface/redirects";
import { getFranchises, updateFranchisePrimaryNumber, updateFrenchise } from "@/services/franchises";
import PageLoader from "@/components/atomics/PageLoader";
import Spinner from "@/components/atomics/Spinner";
import { unformatPhoneNumber } from "@/utils/formatPhoneForCall";
import { formatPhoneNum } from "@/utils/formatHelper";

interface SelectForm {
    label: string;
    value?: null | number;
    disable?: boolean;
}
const RedirectsPage = () => {
    const { isSuperAdmin, isCustomerCare, isCustomerCareManager } = useUserRoles();

    const [redirectsTableData, setRedirectsTableData] = useState<ListRedirectResponse>({
        results: [],
        count: 0,
        previous: 1,
        next: 1,
    });
    // Model State
    const [openModalAddRedirect, setOpenModalAddRedirect] = useState(false);
    const [openModalDelete, setOpenModalDelete] = useState(false);
    const [openModalEdit, setOpenModalEdit] = useState(false);
    // Alert State
    const [openSuccess, setOpenSuccess] = useState(false);
    const [openError, setOpenError] = useState(false);
    const [openDeleteAlerts, setOpenDeleteAlerts] = useState(false);
    const [openEditAlerts, setOpenEditAlerts] = useState(false);
    const [openErrorEdit, setOpenErrorEdit] = useState(false);
    const [responseErrors, setResponseError] = useState<string[]>([]);
    // Pagination State
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [paginationPage, setPaginationPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    // Form State
    const [isLoading, setIsLoading] = useState(false);
    const [selectedRedirectId, setSelectedRedirectId] = useState("");
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [editErrors, setEditErrors] = useState<{ [key: string]: string }>({});
    const [search, setSearch] = useState("")
    const [prmaryNumberApiBusy, setPrmaryNumberApiBusy] = useState<any>(null);
    const timeoutRef = useRef<any>(null);
    const [dataFranchises, setDataFranchises] = useState<any>();
    const [editRedirectData, seteditRedirectData] =
        useState<RedirectsData>({
            twilio_number: "",
            number_type: "",
            redirect_number: "",
            notification_emails: [],
        });

    const [newRedirectData, setnewRedirectData] =
        useState<RedirectsData>({
            twilio_number: "",
            number_type: "",
            redirect_number: "",
            notification_emails: [],
            uses_call_center: true
        });

    const twilio_number_types = [
        {
            value: "tracking",
            label: "Tracking Number"
        },
        {
            value: "van",
            label: "Van Number"
        },
        {
            value: "web",
            label: "Web Number"
        },
        {
            value: "other",
            label: "Other"
        }
    ]

    const analytics = useJune();

    const fetchRedirects = async (searchValue?: string) => {
        try {
            const response = await getRedirects(+page, searchValue);
            const editResults = response.results.map((e: any) => {
                return {
                    ...e, notification_emails: e.notification_emails?.join(', ')
                }
            });
            response.results = editResults;
            setRedirectsTableData(response);
            setTotalPages(Math.ceil(response?.count / size));
        } catch (e: any) {
            if (e?.response?.data?.detail === "Invalid page." && page > 1)
                setPage(page - 1);
            console.error("Error fetching call list:", e);
        }
    };

    const handleDeleteRedirects = async () => {
        try {
            setIsLoading(true);
            await deleteRedirects(selectedRedirectId);
            analytics?.track("deleteRedirects");
            setOpenDeleteAlerts(true);
        } catch (error) {
            console.error("error", error);
        } finally {
            setIsLoading(false);
            setOpenModalDelete(false);
            setSelectedRedirectId("");
        }
    };

    const handleSearchChange = useCallback((searchValue: string) => {
        if (timeoutRef) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
            fetchRedirects(searchValue)
        }, 2000);
        setSearch(searchValue)
    }, []);

    const getRedirect = async (id: string) => {
        try {
            const response = await getRedirectsById(id);
            const { twilio_number, number_type, redirect_number, notification_emails, franchise, uses_call_center } = response;
            seteditRedirectData({
                twilio_number,
                number_type,
                redirect_number,
                notification_emails,
                franchise,
                uses_call_center
            });
            setOpenModalEdit(true)
        } catch (error: any) {
            console.error("Error fetching call list:", error);
        }
    }

    useEffect(() => {
        fetchRedirects(search);
    }, [page]);

    useEffect(() => {
        if (openDeleteAlerts) {
            fetchRedirects(search);
        }
        if (openEditAlerts) {
            fetchRedirects(search);
        }
        if (openSuccess) {
            fetchRedirects(search);
        }
    }, [openDeleteAlerts, openEditAlerts, openSuccess])

    useEffect(() => {
        if (isSuperAdmin || isCustomerCare || isCustomerCareManager) {
            fetchFranchises(paginationPage);
        }
    }, [paginationPage, isSuperAdmin, isCustomerCare, isCustomerCareManager]);

    const handleScroll = useCallback(
        (e: React.UIEvent<HTMLDivElement>) => {

            if (!hasMore) return;

            const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;

            if (Math.ceil(scrollTop + clientHeight) >= scrollHeight) {
                setPaginationPage((prevPage) => prevPage + 1);
            }
        },
        [hasMore]
    );

    const franchises = useMemo(() => {
        let franchises: SelectForm[] = [
            { label: "Select Franchise", disable: true },
        ];
        dataFranchises &&
            dataFranchises.map((item: any) => {
                franchises.push({ label: item.franchise_name, value: item.id });
            });
        return franchises;
    }, [dataFranchises]);

    const fetchFranchises = async (page: number) => {
        try {
            const response: any = await getFranchises(page);
            analytics?.track("getFranchises");
            if (response.results.length < 12) {
                setHasMore(false);
            } else {
                setHasMore(true);
            }
            setDataFranchises((prev: any) => [...(page !== 1 ? prev : []), ...response.results]);
        } catch (error) {
            console.error(error);
        }
    };

    const validate = (data: any, setErrorState: any) => {
        const newErrors: { [key: string]: string } = {};
        if (!data.twilio_number || data.twilio_number.length < 1) {
            newErrors.twilio_number = "Twilio number is required";
        } else if (data.twilio_number.length > 20) {
            newErrors.twilio_number = "Twilio number cannot exceed 20 characters";
        }

        if (!data.number_type) {
            newErrors.number_type = "Number Type is required"
        }

        if (!data.redirect_number || data.redirect_number.length < 1) {
            newErrors.redirect_number = "Redirect number is required";
        } else if (data.redirect_number.length > 20) {
            newErrors.redirect_number = "Redirect number cannot exceed 20 characters";
        }
        if (data.uses_call_center) {
            delete newErrors.redirect_number
        }

        if (!data.franchise) {
            newErrors.franchise = "Franchise is required";
        }

        setErrorState(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate(newRedirectData, setErrors)) return;
        try {
            setIsLoading(true);
            await addRedirect({ 
                ...newRedirectData,
                twilio_number: formatPhoneNum(unformatPhoneNumber(newRedirectData.twilio_number)),
                redirect_number: newRedirectData.uses_call_center 
                    ? null 
                    : formatPhoneNum(unformatPhoneNumber(newRedirectData.redirect_number as string)) 
            });
            analytics?.track("addRedirect");
            setOpenSuccess(true);
            fetchRedirects(search)
        } catch (e: any) {
            let errorMessages = [];

            for (const field in e.response.data) {
                errorMessages.push(...e.response.data[field]);
            }
            setResponseError(errorMessages);
            setOpenErrorEdit(true);
            console.error("Error updating Redirects:", e);
            throw e;
        } finally {
            setnewRedirectData({
                twilio_number: "",
                number_type: "",
                redirect_number: "",
                notification_emails: [],
                franchise: undefined,
            })
            setIsLoading(false);
            setOpenModalAddRedirect(false);
        }
    };

    const handleEditFranchise = async () => {
        if (!validate(editRedirectData, setEditErrors)) return;
        try {
            setIsLoading(true);
            await updateRedirects({
                id: selectedRedirectId,
                editData: { 
                    ...editRedirectData,
                    twilio_number: formatPhoneNum(unformatPhoneNumber(editRedirectData.twilio_number)),
                    redirect_number: editRedirectData.uses_call_center
                        ? null 
                        : formatPhoneNum(unformatPhoneNumber(editRedirectData.redirect_number as string)), 
                    franchise: typeof editRedirectData.franchise === 'object' ? editRedirectData.franchise.id : editRedirectData.franchise
                }
            });
            analytics?.track("updateRedirects");
            setOpenEditAlerts(true);
            fetchRedirects(search)
        } catch (error: any) {
            let errorMessages = [];

            for (const field in error?.response?.data) {
                errorMessages.push(...error.response.data[field]);
            }
            setResponseError(errorMessages);
            setOpenErrorEdit(true);
            console.error("Error updating Redirects:", error);
            throw error;
        } finally {
            setIsLoading(false);
            setOpenModalEdit(false);
            setSelectedRedirectId("");
            seteditRedirectData({
                twilio_number: "",
                number_type: "",
                redirect_number: "",
                notification_emails: [],
                franchise: undefined
            })
        }
    };

    const handleEditChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        seteditRedirectData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleToggleEditChange = (name: string, value: any) => {
        seteditRedirectData((prevState) => ({
            ...prevState,
            [name]: value,
            redirect_number: ""
        }));
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setnewRedirectData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleToggleChange = (name: string, value: any) => {
        setnewRedirectData((prevState) => ({
            ...prevState,
            [name]: value,
            redirect_number: ""
        }));
    };
    const updateprimaryNumberForFranchise = async (redirectNumber: any) => {
      console.log("updateprimaryNumberForFranchise");
      try {
        setPrmaryNumberApiBusy(redirectNumber.id);
        const updatedPrimaryNumberResponse = await updateFranchisePrimaryNumber({
          id: redirectNumber.franchise.id,
          editData: {
            id: redirectNumber.franchise.id,
            primary_number: redirectNumber.id,
          },
        });
        if (updatedPrimaryNumberResponse) {
            let updatedPrimaryNumberResults = redirectsTableData.results.map(
              (e: any) => {
                if (e.id === redirectNumber.id) {
                  return {
                    ...e,
                    franchise: {
                      ...e.franchise,
                      primary_number_id: redirectNumber.id,
                    },
                  };
                } else if (
                  e.id === e.franchise.primary_number_id &&
                  e.franchise.id == redirectNumber.franchise.id
                ) {
                  return {
                    ...e,
                    franchise: {
                      ...e.franchise,
                      primary_number_id: redirectNumber.id,
                    },
                  };
                } else {
                  return {
                    ...e,
                  };
                }
              }
            );
            updatedPrimaryNumberResults = {
                ...redirectsTableData,
                results: updatedPrimaryNumberResults
            }
            setRedirectsTableData(updatedPrimaryNumberResults);
        }
      } catch (error) {
        console.error("Error updating primary number for franchise:", error);
      } finally {
        setPrmaryNumberApiBusy(null);
      }
    };

    const tableConfig = {
        tableName: "Call Center Numbers",
        page,
        totalPages,
        search,
        pageUrl: '/settings/',
        handleSearchChange,
        className: "!py-0 !px-1",
        handlePageChange: (page: number) => {
            setPage(page);
        },
        sortAndFilter: false,
        columns: {
            twilio_number: {
                path: "twilio_number",
                header: "Twilio Number",
                type: "string",
                isPhoneNumber: true
            },
            number_type: {
                path: "number_type",
                header: 'Number Type',
                type: "string"
            },
            uses_call_center: { path: "uses_call_center", header: "Use Call Center", type: "boolean" },
            redirect_number: { path: "redirect_number", header: "Redirect Number", type: "string", isPhoneNumber: true },
            notification_emails: { path: "notification_emails", header: "Notification Emails", type: "string" },
            franchise: { path: "franchise.franchise_name", header: "Franchise", type: "string" },
        },
        hideAddButton: false,
        hasNavigation: true,
        actionsColumn: (item: any) => [
            <Button
            key={`set-primary-contact-${item.id}`}
            size="md"
            variant={item?.franchise?.primary_number_id === item.id ? "disabled-bg" : "primary-bg"}
            disabled={item?.franchise?.primary_number_id === item.id || prmaryNumberApiBusy === item.id}
            className="mr-4"
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation();
                updateprimaryNumberForFranchise(item);
            }}            
            >
                {prmaryNumberApiBusy === item.id ? <Spinner className="#fff" /> : <></>}
                Set Primary Number
            </Button>,
            <Button
                key={`select-contact-${item.id}`}
                size="md"
                variant="default-bg"
                className="mr-4 !w-11"
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    getRedirect(item?.id);
                    setSelectedRedirectId(item?.id);
                }}
            >
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M5.79289 13.4999H3C2.86739 13.4999 2.74021 13.4472 2.64645 13.3535C2.55268 13.2597 2.5 13.1325 2.5 12.9999V10.207C2.5 10.1414 2.51293 10.0764 2.53806 10.0157C2.56319 9.95503 2.60002 9.89991 2.64645 9.85348L10.1464 2.35348C10.2402 2.25971 10.3674 2.20703 10.5 2.20703C10.6326 2.20703 10.7598 2.25971 10.8536 2.35348L13.6464 5.14637C13.7402 5.24014 13.7929 5.36732 13.7929 5.49992C13.7929 5.63253 13.7402 5.75971 13.6464 5.85348L6.14645 13.3535C6.10002 13.3999 6.0449 13.4367 5.98424 13.4619C5.92357 13.487 5.85855 13.4999 5.79289 13.4999Z"
                        stroke="#3B4453"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M8.5 4L12 7.5"
                        stroke="#3B4453"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M5.96848 13.4675L2.53223 10.0312"
                        stroke="#3B4453"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </Button>,
            <Button
                className="!w-11"
                key={`add-redirect-${item.id}`}
                size="md"
                variant="default-bg"
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    setSelectedRedirectId(item.id);
                    setOpenModalDelete(true);
                }}
            >
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M13.5 3.5L2.5 3.50001"
                        stroke="#FF5630"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M6.5 6.5V10.5"
                        stroke="#FF5630"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M9.5 6.5V10.5"
                        stroke="#FF5630"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M12.5 3.5V13C12.5 13.1326 12.4473 13.2598 12.3536 13.3536C12.2598 13.4473 12.1326 13.5 12 13.5H4C3.86739 13.5 3.74021 13.4473 3.64645 13.3536C3.55268 13.2598 3.5 13.1326 3.5 13V3.5"
                        stroke="#FF5630"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M10.5 3.5V2.5C10.5 2.23478 10.3946 1.98043 10.2071 1.79289C10.0196 1.60536 9.76522 1.5 9.5 1.5H6.5C6.23478 1.5 5.98043 1.60536 5.79289 1.79289C5.60536 1.98043 5.5 2.23478 5.5 2.5V3.5"
                        stroke="#FF5630"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </Button>,
        ],
        modals: [
            {
                title: "Add Redirect",
                className: "max-w-4xl",
                open: openModalAddRedirect,
                setOpen: setOpenModalAddRedirect,
                modalChild: (
                    <>
                        <main className="my-10 flex flex-col items-center justify-center gap-10 flex-grow">
                            <div className="grid w-full grid-cols-1 gap-6">
                                <div>
                                    <Input
                                        id="twilio_number"
                                        variant="phone"
                                        label="Twilio Number"
                                        placeholder="Enter Twilio Number"
                                        handleChange={handleChange}
                                        value={newRedirectData.twilio_number}
                                    />
                                    {errors.twilio_number && errors.twilio_number && (
                                        <span className="text-red-500 text-xs">{errors.twilio_number}</span>
                                    )}
                                </div>
                                <div>
                                    <Selectbox
                                        label="Number Type"
                                        variant="default"
                                        datas={twilio_number_types}
                                        selectedNow={true}
                                        handleChange={(selected: any) => {
                                            handleChange({
                                                target: {
                                                    name: "number_type",
                                                    value: selected.value,
                                                },
                                            } as React.ChangeEvent<HTMLInputElement>)
                                        }}
                                        selectedData={twilio_number_types.find((type) => type.value == newRedirectData.number_type)}
                                    />
                                    {errors.number_type && errors.number_type && (
                                        <span className="text-red-500 text-xs">{errors.number_type}</span>
                                    )}
                                </div>
                                <div className="w-full flex-col">
                                    <label className="text-sm font-semibold text-neutral-100 max-sm:text-xs">
                                        Use Call Center?
                                    </label>
                                    <div className="flex gap-3 mt-2">
                                        <Button
                                            size="md"
                                            onClick={() => handleToggleChange("uses_call_center", true)}
                                            variant={
                                                newRedirectData.uses_call_center
                                                    ? "tab-selected"
                                                    : "tab-unselect"
                                            }
                                            className="!rounded-[999px]"
                                        >
                                            Yes
                                        </Button>
                                        <Button
                                            size="md"
                                            onClick={() => handleToggleChange("uses_call_center", false)}
                                            variant={
                                                !newRedirectData.uses_call_center
                                                    ? "tab-selected"
                                                    : "tab-unselect"
                                            }
                                            className="!rounded-[999px]"
                                        >
                                            No
                                        </Button>
                                    </div>
                                </div>
                                {!newRedirectData.uses_call_center ? <div>
                                    <Input
                                        id="redirect_number"
                                        variant="phone"
                                        label="Redirect Number"
                                        placeholder="Enter Redirect Number"
                                        handleChange={handleChange}
                                        value={newRedirectData.redirect_number}
                                    />
                                    {errors.redirect_number && errors.redirect_number && (
                                        <span className="text-red-500 text-xs">
                                            {errors.redirect_number}
                                        </span>
                                    )}
                                </div> : null}
                                <div>
                                    <MultipleSelectBox
                                        label="Notification Emails"
                                        variant="default"
                                        handleChange={(e: any) =>
                                            handleChange({
                                                target: {
                                                    name: "notification_emails",
                                                    value: e.map((a: any) => a.name),
                                                },
                                            } as React.ChangeEvent<HTMLInputElement>)
                                        }
                                        selectedData={newRedirectData?.notification_emails}
                                    />
                                    {errors.notification_emails && errors.notification_emails && (
                                        <span className="text-red-500 text-xs">{errors.notification_emails}</span>
                                    )}
                                </div>
                                <div>
                                    <Selectbox
                                        label="Franchise"
                                        datas={franchises}
                                        selectedNow={true}
                                        onScroll={handleScroll}
                                        handleChange={(selected: any) => {
                                            handleChange({
                                                target: {
                                                    name: "franchise",
                                                    value: selected.value,
                                                },
                                            } as React.ChangeEvent<HTMLInputElement>)
                                        }}
                                    />
                                    {errors.franchise && errors.franchise && (
                                        <span className="text-red-500 text-xs">{errors.franchise}</span>
                                    )}
                                </div>
                            </div>
                        </main>

                        <footer className="flex w-full justify-end gap-3 pr-px">
                            <Button
                                className="!h-10"
                                size="md"
                                variant="primary-nude"
                                onClick={() => {
                                    setOpenModalAddRedirect(false);
                                    setSelectedRedirectId("");
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                size="md"
                                variant="primary-bg"
                                disabled={isLoading}
                                onClick={() => {
                                    handleSubmit();
                                }}
                                className="!w-[74px] !h-10"
                            >
                                {isLoading ? <LoadingIcon /> : "Submit"}
                            </Button>
                        </footer>
                    </>
                ),
            },
            {
                title: "Delete Redirects",
                className: "max-w-lg",
                open: openModalDelete,
                setOpen: setOpenModalDelete,
                modalChild: (
                    <>
                        <main className="mb-10 mt-4">
                            <p className="text-sm text-neutral-80">
                                Are you sure you want to delete this redirect? Deleted
                                redirect cannot be recovered.
                            </p>
                        </main>
                        <footer className="flex w-full justify-end gap-3">
                            <Button
                                className="!h-10"
                                size="md"
                                variant="default-nude"
                                onClick={() => {
                                    setOpenModalDelete(false);
                                    setSelectedRedirectId("");
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                size="md"
                                variant="error-bg"
                                disabled={isLoading}
                                onClick={() => {
                                    handleDeleteRedirects();
                                }}
                                className="!w-[74px] !h-10"
                            >
                                {isLoading ? <LoadingIcon /> : "Submit"}
                            </Button>
                        </footer>
                    </>
                ),
            },
            {
                title: "Edit Redirects",
                className: "max-w-4xl",
                open: openModalEdit,
                setOpen: setOpenModalEdit,
                modalChild: (
                    <>
                        <main className="my-10 flex flex-col items-center justify-center gap-6">
                            <div className="grid w-full grid-cols-1 gap-6">
                                <div>
                                    <Input
                                        id="twilio_number"
                                        variant="phone"
                                        label="Twilio Number"
                                        placeholder="Enter Twilio Number"
                                        handleChange={handleEditChange}
                                        value={editRedirectData.twilio_number}
                                    />
                                    {editErrors.twilio_number && editErrors.twilio_number && (
                                        <span className="text-red-500 text-xs">{editErrors.twilio_number}</span>
                                    )}
                                </div>
                                <div>
                                    <Selectbox
                                        label="Number Type"
                                        datas={twilio_number_types}
                                        selectedNow={true}
                                        handleChange={(selected: any) => {
                                            handleEditChange({
                                                target: {
                                                    name: "number_type",
                                                    value: selected.value,
                                                },
                                            } as React.ChangeEvent<HTMLInputElement>)
                                        }}
                                        selectedData={twilio_number_types.find((type) => type.value == editRedirectData.number_type) ?? twilio_number_types[twilio_number_types.length - 1]}
                                    />
                                    {errors.number_type && errors.number_type && (
                                        <span className="text-red-500 text-xs">{errors.number_type}</span>
                                    )}
                                </div>
                                <div className="w-full flex-col">
                                    <label className="text-sm font-semibold text-neutral-100 max-sm:text-xs">
                                        Use Call Center?
                                    </label>
                                    <div className="flex gap-3 mt-2">
                                        <Button
                                            size="md"
                                            onClick={() => handleToggleEditChange("uses_call_center", true)}
                                            variant={
                                                editRedirectData.uses_call_center
                                                    ? "tab-selected"
                                                    : "tab-unselect"
                                            }
                                            className="!rounded-[999px]"
                                        >
                                            Yes
                                        </Button>
                                        <Button
                                            size="md"
                                            onClick={() => handleToggleEditChange("uses_call_center", false)}
                                            variant={
                                                !editRedirectData.uses_call_center
                                                    ? "tab-selected"
                                                    : "tab-unselect"
                                            }
                                            className="!rounded-[999px]"
                                        >
                                            No
                                        </Button>
                                    </div>
                                </div>
                                {!editRedirectData.uses_call_center && (
                                    <div>
                                        <Input
                                            id="redirect_number"
                                            variant="phone"
                                            label="Redirect Number"
                                            placeholder="Enter Redirect Number"
                                            handleChange={handleEditChange}
                                            value={editRedirectData.redirect_number}
                                        />
                                        {editErrors.redirect_number && editErrors.redirect_number && (
                                            <span className="text-red-500 text-xs">
                                                {editErrors.redirect_number}
                                            </span>
                                        )}
                                    </div>
                                )}
                                <div>
                                    <MultipleSelectBox
                                        label="Notification Emails"
                                        variant="default"
                                        handleChange={(e: any) =>
                                            handleEditChange({
                                                target: {
                                                    name: "notification_emails",
                                                    value: e.map((a: any) => a.name),
                                                },
                                            } as React.ChangeEvent<HTMLInputElement>)
                                        }
                                        selectedData={editRedirectData?.notification_emails.map((e: any) => { return { name: e } })}
                                    />
                                    {editErrors.notification_emails && editErrors.notification_emails && (
                                        <span className="text-red-500 text-xs">{editErrors.notification_emails}</span>
                                    )}
                                </div>
                                <div>
                                    <Selectbox
                                        label="Franchise"
                                        datas={franchises}
                                        selectedNow={true}
                                        onScroll={handleScroll}
                                        selectedData={
                                            {
                                                name: typeof editRedirectData.franchise === 'object'
                                                    ? editRedirectData.franchise.franchise_name
                                                    : editRedirectData.franchise
                                            }
                                        }
                                        handleChange={(selected: any) => {
                                            handleEditChange({
                                                target: {
                                                    name: "franchise",
                                                    value: selected.value,
                                                },
                                            } as React.ChangeEvent<HTMLInputElement>)
                                        }}
                                    />
                                    {editErrors.franchise && (
                                        <span className="text-red-500 text-xs">{editErrors.franchise}</span>
                                    )}
                                </div>
                            </div>
                        </main>

                        <footer className="flex justify-end gap-3 mt-4">
                            <Button
                                size="md"
                                variant="primary-bg"
                                disabled={isLoading}
                                onClick={async () => {
                                    handleEditFranchise();
                                }}
                                className="!w-[74px] !h-10"
                            >
                                {isLoading ? <LoadingIcon /> : "Submit"}
                            </Button>
                        </footer>
                    </>
                ),
            },
        ],
        addAction: () => {
            setErrors({});
            setOpenModalAddRedirect(true);
        },
        alerts: [
            <Alerts
                key="alert-redirect-added"
                variant="success"
                open={openSuccess}
                setOpen={setOpenSuccess}
                title="Redirect has been added"
                desc="Redirect has been added, You can manage this redirect or add additional information as needed."
            />,
            <Alerts
                key="alert-redirect-added-error"
                variant="error"
                open={openError}
                setOpen={setOpenError}
                title="Redirect has not been added"
                desc={responseErrors}
            />,
            <Alerts
                key="alert-redirect-deleted"
                variant="success"
                open={openDeleteAlerts}
                setOpen={setOpenDeleteAlerts}
                title="Redirect has been deleted"
                desc="Redirect has been deleted. Please review any adjustments to your records as necessary."
            />,
            <Alerts
                key="alert-redirect-edited-error"
                variant="error"
                open={openErrorEdit}
                setOpen={setOpenErrorEdit}
                title="Redirect has not been edited"
                desc={responseErrors}
            />,
            <Alerts
                key="alert-redirect-edited"
                variant="success"
                open={openEditAlerts}
                setOpen={setOpenEditAlerts}
                title="Redirect has been edited"
                desc="Redirect has been edited. Please review any adjustments to your records as necessary."
            />,
        ],

    };
    return (
        <div>
            {redirectsTableData && (
                <UI8Table
                    data={redirectsTableData?.results as any}
                    config={tableConfig}
                />
            )}
        </div>

    );
};

export default RedirectsPage;
