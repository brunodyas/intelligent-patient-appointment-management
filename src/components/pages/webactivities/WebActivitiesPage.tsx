"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import UI8Table from "@/components/UI8Table";
import { size } from "@/constants/constants";
import { getWebActivities } from "@/services/webactivities";
import { ListWebActivitiesResponse } from "@/interface/webactivities";

const WebActivitiesPage = () => {
    const timeoutRef = useRef<any>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("")
    const [webactivitiesTableData, setWebActivitiesTableData] =
        useState<ListWebActivitiesResponse>({
            results: [],
            count: 0,
            previous: 1,
            next: 1,
        });

    const fetchWebActivities = async (searchValue?: string) => {
        try {
            const response = await getWebActivities(+page, searchValue);
            setWebActivitiesTableData(response);
            setTotalPages(Math.ceil(response?.count / size));
        } catch (e: any) {
            if (e?.response?.data?.detail === "Invalid page." && page > 1)
                setPage(page - 1);
            console.error("Error fetching call list:", e);
        }
    };

    useEffect(() => {
        if (page > 1) setPage(1)
    }, [search])

    useEffect(() => {
        fetchWebActivities(search);
    }, [page]);


    const handleSearchChange = useCallback((searchValue: string) => {
        if (timeoutRef) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
            fetchWebActivities(searchValue)
        }, 2000);
        setSearch(searchValue)
    }, [])

    const tableConfig = {
        tableName: "Web Activities",
        page,
        totalPages,
        handleSearchChange,
        search,
        handlePageChange: (page: number) => {
            setPage(page);
        },
        columns: {
            first_name: {
                path: "first_name",
                header: "First Name",
                type: "string",
                style: "webActivityCell"
            },
            last_name: { path: "last_name", header: "Last Name", type: "string", style: "webActivityCell" },
            url: {
                path: "landing_page_url", header: "Landing Page URL", type: "string", render: (value: string) => (
                    <a
                        href={value}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-primary-main underline"
                    >
                        {value}
                    </a>
                ),

            },
            created: { path: "created", header: "Created", type: "date", style: "ActivityCreatedCell" }
        },
        pageUrl: "/crm/web-activities",
        hideAddButton: true,
        hasNavigation: true,
    };
    return (
        <div className="web-activity-table">
            {webactivitiesTableData && (
                <UI8Table
                    data={webactivitiesTableData?.results as any}
                    config={tableConfig}
                />
            )}
        </div>
    );
};

export default WebActivitiesPage;
