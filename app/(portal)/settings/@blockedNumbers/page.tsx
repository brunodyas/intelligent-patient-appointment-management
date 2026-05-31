"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Alerts, Button, Input, } from "@/components/atomics";
import UI8Table from "@/components/UI8Table";
import { size } from "@/constants/constants";
import { LoadingIcon } from "@/assets/icons";
import { useJune } from "@/hooks/useJune";
import { addBlocked, deleteBlocked, getBlockedNumbers } from "@/services/blockedNumbers";
import { BlockedData, ListBlockedResponse } from "@/interface/blockedNumbers";
import { formatPhoneNum } from "@/utils/formatHelper";
import { formatPhoneNumber, unformatPhoneNumber } from "@/utils/formatPhoneForCall";

const BlockedNumbersPage = () => {

    const [blockedNumbersTableData, setBlockedNumbersTableData] = useState<ListBlockedResponse>({
        results: [],
        count: 0,
        previous: 1,
        next: 1,
    });
    // Model State
    const [openModalAddBlocked, setOpenModalAddBlocked] = useState(false);
    const [openModalDelete, setOpenModalDelete] = useState(false);
    // Alert State
    const [openSuccess, setOpenSuccess] = useState(false);
    const [openError, setOpenError] = useState(false);
    const [openDeleteAlerts, setOpenDeleteAlerts] = useState(false);
    const [responseErrors, setResponseError] = useState<string[]>([]);
    // Pagination State
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    // Form State
    const [isLoading, setIsLoading] = useState(false);
    const [selectedBlockedId, setSelectedBlockedId] = useState("");
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [search, setSearch] = useState("")
    const timeoutRef = useRef<any>(null);

    const [filter, setFilter] = useState({
        isSort: true,
    })


    const [newRedirectData, setnewBlockedData] =
        useState<BlockedData>({
            number: "",
        });

    const analytics = useJune();

    const fetchBlockedNumbers = async ({ searchValue, orderQuery }: { searchValue?: string, orderQuery?: "asc" | "desc" } = {}) => {
        try {
            const response = await getBlockedNumbers({ page: +page, searchQuery: searchValue, orderQuery });
            setBlockedNumbersTableData(response);
            setTotalPages(Math.ceil(response?.count / size));
        } catch (e: any) {
            if (e?.response?.data?.detail === "Invalid page." && page > 1)
                setPage(page - 1);
            console.error("Error fetching call list:", e);
        }
    };

    const handleDeleteBlockedNumbers = async () => {
        try {
            setIsLoading(true);
            await deleteBlocked(selectedBlockedId);
            analytics?.track("deleteBlocked");
            setOpenDeleteAlerts(true);
        } catch (error) {
            console.error("error", error);
        } finally {
            setIsLoading(false);
            setOpenModalDelete(false);
            setSelectedBlockedId("");
        }
    };

    const handleSearchChange = useCallback((searchValue: string) => {
        if (timeoutRef) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
            fetchBlockedNumbers({ searchValue })
        }, 2000);
        setSearch(searchValue)
    }, []);

    useEffect(() => {
        fetchBlockedNumbers({ orderQuery: filter.isSort ? "asc" : "desc" })
    }, [filter])

    useEffect(() => {
        fetchBlockedNumbers({ searchValue: search });
    }, [page]);

    useEffect(() => {
        if (openDeleteAlerts) {
            fetchBlockedNumbers({ searchValue: search });
        }
        if (openSuccess) {
            fetchBlockedNumbers({ searchValue: search });
        }
    }, [openDeleteAlerts, openSuccess])

    const validate = (data: any, setErrorState: any) => {
        const newErrors: { [key: string]: string } = {};
        if (!data.number || data.number.length < 1) {
            newErrors.number = "A phone number is required";
        }

        setErrorState(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate(newRedirectData, setErrors)) return;
        try {
            setIsLoading(true);
            await addBlocked({
                ...newRedirectData,
                number: formatPhoneNum(unformatPhoneNumber(newRedirectData.number))
            });
            analytics?.track("addBlocked");
            setOpenSuccess(true);
            fetchBlockedNumbers({ searchValue: search })
        } catch (e: any) {
            let errorMessages = [];

            if (e.response && e.response.data) {
                const responseData = e.response.data;

                // Check if it's a general error message
                if (responseData.error) {
                    errorMessages.push(responseData.error);
                } else {
                    // Otherwise, assume it's an object with field errors
                    for (const field in responseData) {
                        if (Array.isArray(responseData[field])) {
                            errorMessages.push(...responseData[field]);
                        } else if (typeof responseData[field] === 'string') {
                            errorMessages.push(responseData[field]);
                        }
                    }
                }
            }

            setResponseError(errorMessages);
            setOpenError(true);
            console.error("Error updating Redirects:", e);
            throw e;
        } finally {
            setnewBlockedData({
                number: ""
            })
            setIsLoading(false);
            setOpenModalAddBlocked(false);
        }
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setnewBlockedData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const tableConfig = {
        tableName: "Blocked Numbers",
        page,
        totalPages,
        search,
        pageUrl: '/settings/',
        handleSearchChange,
        className: "!py-0 !px-1",
        handlePageChange: (page: number) => {
            setPage(page);
        },
        filter,
        setFilter,
        columns: {
            number: {
                path: "number",
                header: "Number",
                type: "string",
                isPhoneNumber: true
            },
            added_by: {
                path: "added_by.name",
                header: "Added By",
                type: "string"
            },
            created_at: {
                path: "created_at",
                header: "Created At",
                type: "date"
            },
            notes: {
                path: "notes",
                header: "Notes",
                type: "string",
            }
        },
        hideAddButton: false,
        hasNavigation: true,
        actionsColumn: (item: any) => [
            <Button
                className="!w-11"
                key={`add-blocked-${item.id}`}
                size="md"
                variant="default-bg"
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    setSelectedBlockedId(item.id);
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
                title: "Add Blocked",
                className: "max-w-4xl",
                open: openModalAddBlocked,
                setOpen: setOpenModalAddBlocked,
                modalChild: (
                    <>
                        <main className="my-10 flex flex-col items-center justify-center gap-10 flex-grow">
                            <div className="grid w-full grid-cols-1 gap-6">
                                <div>
                                    <Input
                                        id="number"
                                        label="Number"
                                        placeholder="Enter phone number"
                                        handleChange={handleChange}
                                        variant="phone"
                                        value={newRedirectData.number}
                                    />
                                    {errors.number && errors.number && (
                                        <span className="text-red-500 text-xs">{errors.number}</span>
                                    )}
                                </div>
                                <div>
                                    <Input
                                        id="notes"
                                        variant="text"
                                        type="textarea"
                                        label="Notes"
                                        placeholder="Enter Notes (Optional)"
                                        handleTextAreaChange={handleChange}
                                        value={newRedirectData.notes}
                                    />
                                </div>

                            </div>
                        </main>

                        <footer className="flex w-full justify-end gap-3 pr-px">
                            <Button
                                className="!h-10"
                                size="md"
                                variant="primary-nude"
                                onClick={() => {
                                    setOpenModalAddBlocked(false);
                                    setSelectedBlockedId("");
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
                title: "Delete Blocked",
                className: "max-w-lg",
                open: openModalDelete,
                setOpen: setOpenModalDelete,
                modalChild: (
                    <>
                        <main className="mb-10 mt-4">
                            <p className="text-sm text-neutral-80">
                                Are you sure you want to remove this number?
                            </p>
                        </main>
                        <footer className="flex w-full justify-end gap-3">
                            <Button
                                className="!h-10"
                                size="md"
                                variant="default-nude"
                                onClick={() => {
                                    setOpenModalDelete(false);
                                    setSelectedBlockedId("");
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                size="md"
                                variant="error-bg"
                                disabled={isLoading}
                                onClick={() => {
                                    handleDeleteBlockedNumbers();
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
            setOpenModalAddBlocked(true);
        },
        alerts: [
            <Alerts
                key="alert-blocked-added"
                variant="success"
                open={openSuccess}
                setOpen={setOpenSuccess}
                title="Blocked Number has been added"
                desc="Blocked Number has been added You can manage this blocked or add additional information as needed."
            />,
            <Alerts
                key="alert-blocked-added-error"
                variant="error"
                open={openError}
                setOpen={setOpenError}
                title="Blocked Number has not been added"
                desc={responseErrors}
            />,
            <Alerts
                key="alert-blocked-deleted"
                variant="success"
                open={openDeleteAlerts}
                setOpen={setOpenDeleteAlerts}
                title="Blocked Number has been deleted"
                desc="Blocked Number has been deleted. Please review any adjustments to your records as necessary."
            />
        ],

    };
    return (
        <div>
            {blockedNumbersTableData && (
                <UI8Table
                    data={blockedNumbersTableData?.results as any}
                    config={tableConfig}
                />
            )}
        </div>

    );
};

export default BlockedNumbersPage;
