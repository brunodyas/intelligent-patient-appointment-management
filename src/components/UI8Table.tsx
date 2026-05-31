"use client";

import React, { ReactNode, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Dropdown, Modal, Sheet } from "./molecules";
import {
  FunnelIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  SortAscendingIcon,
} from "../assets/icons";

import { formatData } from "@/utils/formatHelper";
import { useRouteChange } from "@/hooks/useRouteChange";
import PageLoader from "./atomics/PageLoader";
import { Button, Checkbox, Pagination, Title } from "./atomics";
import { twMerge } from "tailwind-merge";
import { formatPhoneNumber } from "@/utils/formatPhoneForCall";

interface TableConfig {
  tableName: string;
  columns: {
    [key: string]: {
      style?: string;
      path: string;
      header: string;
      type: string;
      render?: (value: any) => ReactNode;
      [key: string]: any;
      isPhoneNumber?: boolean
    };
  };
  page?: number;
  totalPages?: number;
  handlePageChange?: (page: number) => void;
  modals?: {
    title: string;
    className: string;
    open: boolean;
    type?: string;
    setOpen: (isOpen: boolean) => void;
    modalChild: ReactNode;
  }[];
  alerts?: ReactNode[];
  isAction?: boolean;
  actionsColumn?: (item: any) => ReactNode[];
  addAction?: () => void;
  updatedColumn?: (item: any) => ReactNode[];
  hasNavigation?: boolean;
  isPagination?: boolean;
  disableAddButton?: boolean;
  hideAddButton?: boolean;
  pageUrl?: string;
  types?: string[];
  setFilter?: (filter: any) => void;
  filter?: {
    [key: string]: boolean | string;
  };
  search?: string;
  className?: string;
  handleSearchChange?: (searchValue: string) => void;
  sortAndFilter?: boolean
}

interface DynamicTableProps {
  data: any[];
  config: TableConfig;
}

const UI8Table: React.FC<DynamicTableProps> = ({ data, config }) => {
  const {
    page,
    totalPages,
    handlePageChange,
    tableName,
    columns,
    addAction,
    modals,
    alerts,
    actionsColumn,
    updatedColumn,
    hasNavigation,
    disableAddButton,
    isPagination = true,
    hideAddButton,
    pageUrl,
    types,
    setFilter,
    filter,
    isAction = false,
    search,
    className,
    sortAndFilter = true,
    handleSearchChange
  } = config;
  const router = useRouter();
  const pathname = usePathname();

  const { routeClicked, setRouteClicked } = useRouteChange();

  const [openDropdown, setOpenDropdown] = useState<boolean>(false);
  const [typeCheckbox, setTypeCheckbox] = useState<string>("");

  const handleType = (type: string) => {
    setTypeCheckbox(type);
  };

  const handleSort = () => {
    setFilter &&
      setFilter({
        ...filter,
        isSort: !filter?.isSort,
      });
  };
  const handleFilteration = () => {
    setOpenDropdown(false);
    if (setFilter) {
      setFilter(
        typeCheckbox
          ? {
            ...filter,
            [typeCheckbox]: filter && !filter[typeCheckbox],
          }
          : {
            ...filter,
            completed: false,
          }
      );
      setTypeCheckbox(typeCheckbox);
    } else {
      setTypeCheckbox("");
    }
  };

  const handleOnClickRow = (item: any) => {
    const id = item.id;
    if (hasNavigation && id) {
      if (pageUrl) {
        if (pageUrl == '/settings/') {
          localStorage.setItem('blockedNumberDetail', JSON.stringify(item))
        }
        router.push(`${pageUrl}/${id}`);
      } else {
        const isCrm = pathname?.includes("crm");
        const isSuperAdminPanel = pathname?.includes("super-admin-panel");

        let basePath =
          pageUrl ||
          (isCrm ? "/crm" : isSuperAdminPanel ? "/super-admin-panel" : "");

        const path = isSuperAdminPanel
          ? `${basePath}/${id}`
          : `${basePath}/${tableName.toLowerCase()}/${id}`;

        router.push(path);
      }
      setRouteClicked(true);
    }
  };

  return (
    <div className="relative space-y-6 max-sm:px-2">
      <h1 className="text-xl sm:text-body-xl font-semibold"></h1>

      <section className={`relative space-y-6 rounded-lg-10 bg-white p-10 max-sm:px-2 !mt-0 ${className}`}>
        {/* Navigation */}
        <nav className="space-y-6">
          <Title size="sm" variant="primary">
            {tableName}
          </Title>

          {/* render react node buttons if buttons props exist but for now hard code */}
          <section className="flex items-center justify-between max-md:flex-col max-md:items-start max-md:gap-3 max-md:justify-start ">
            <div className="relative w-72 2xl:w-96 max-sm:w-full">
              <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-50" />
              <input
                className="w-full border border-transparent bg-neutral-20 px-3.5 !h-11 pl-11  outline-0 ring-2 ring-transparent transition-all duration-300 ease-out focus-within:ring-primary-surface focus:border-primary-main rounded-xl"
                placeholder="Search"
                onChange={(e) => handleSearchChange && handleSearchChange(e.target.value)}
                value={search || ""}
              />
            </div>

            <div className="flex flex-row gap-3 max-sm:flex-col max-sm:justify-start max-sm:w-full">
              {sortAndFilter && (
                <>
                  <Button
                      className="!h-10"
                      size="md"
                      variant={filter?.isSort ? "primary-bg" : "default-bg"}
                      onClick={handleSort}
                    >
                      Sort
                      <SortAscendingIcon
                        className={`h-4 w-4 stroke-neutral-100 stroke-[4px] ${
                          filter?.isSort && "rotate-180 text-white stroke-white"
                        }`}
                      />
                    </Button>

                  {!types ? (
                    <Button size="md" variant="default-bg">
                      Filter
                      <FunnelIcon className="h-4 w-4 stroke-neutral-100 stroke-[4px]" />
                    </Button>
                  ) : (
                    <Dropdown
                      buttonChildren={
                        <Button size="md" variant="default-bg">
                          Filter
                          <FunnelIcon className="h-4 w-4 stroke-neutral-100 stroke-[4px]" />
                        </Button>
                      }
                      setOpen={setOpenDropdown}
                      open={openDropdown}
                      className="p-0 mt-4"
                    >
                      <div className="flex flex-col gap-4 p-4">
                        <Title variant="primary" size="lg">
                          Type
                        </Title>
                        {types?.map((type) => {
                          const formattedType = type.replace(/-/g, " ");
                          return (
                            <div
                              key={type}
                              className="flex justify-between cursor-pointer"
                              onClick={() => handleType(type)}
                            >
                              <p className="text-sm capitalize">{formattedType}</p>
                              <Checkbox
                                active={typeCheckbox === type}
                                setActive={() => { }}
                              />
                            </div>
                          );
                        })}
                      </div>
                      <footer className="flex justify-end gap-3 border-t border-neutral-lightest p-4">
                        <Button
                          onClick={() => setTypeCheckbox("")}
                          size="md"
                          variant="primary-nude"
                        >
                          Clear All
                        </Button>

                        <Button
                          onClick={handleFilteration}
                          size="md"
                          variant="primary-bg"
                        >
                          Done
                        </Button>
                      </footer>
                    </Dropdown>
                  )}
                </>
              )}
              {!hideAddButton && (
                <Button
                  size="md"
                  variant="primary-bg"
                  onClick={addAction}
                  disabled={disableAddButton}
                >
                  <PlusIcon className="h-4 w-4 stroke-[10px]" />
                  Add
                </Button>
              )}
            </div>
          </section>
        </nav>

        {data?.length ? (
          <div className="mb-6 overflow-x-auto">
            <table className="w-full table-auto">
              <thead className="bg-neutral-15 text-xs font-semibold uppercase">
                <tr>
                  {Object.keys(columns).map((key) => (
                    <th
                      className="whitespace-nowrap px-3 py-4 text-left text-neutral-50 first:pl-5 last:pr-5"
                      key={key}
                    >
                      <span className="text-xs font-semibold">
                        {columns[key].header}
                      </span>
                    </th>
                  ))}

                  {updatedColumn && updatedColumn.length && (
                    <th className="whitespace-nowrap px-3 py-4 text-left text-neutral-50 first:pl-5 last:pr-5">
                      <span className="text-xs font-semibold">Status</span>
                    </th>
                  )}

                  {actionsColumn && actionsColumn.length && (
                    <th className="whitespace-nowrap px-3 py-4 text-left text-neutral-50 first:pl-5 last:pr-5">
                      <span className="text-xs font-semibold">
                        Actions
                      </span>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-20 pt-4 text-sm">
                {data?.map((item, index) => (
                  <tr
                    className={
                      hasNavigation
                        ? "hover:bg-gray-100 ease-in-out duration-300 transition-all group hover:cursor-pointer"
                        : ""
                    }
                    key={index}
                    onClick={() => handleOnClickRow(item)}
                  >
                    {Object.keys(columns).map((key) => {
                      let columnValue = columns[key].path
                        .split(".")
                        .reduce((o, i) => (o ? o[i] : null), item);
                      
                      if (columnValue && columns[key].isPhoneNumber) {
                        columnValue = formatPhoneNumber(columnValue, true) 
                      }

                      const updatedColumnValue = typeof columnValue == "boolean" ? columnValue ? "Yes" : "No" : columnValue;

                      return (
                        <td
                          className="whitespace-nowrap px-3 py-5 text-left first:pl-5 last:pr-5"
                          key={key}
                        >
                          <span
                            className={twMerge(
                              "text-sm font-medium text-neutral-80",
                              columns[key].style && columns[key].style,
                              columns[key][columnValue] && columns[key][columnValue]
                            )}
                          >
                            {columnValue !== null && columnValue !== undefined
                              ? columns[key].render
                                ? columns[key].render(columnValue)
                                : formatData(
                                  updatedColumnValue,
                                  columns[key].type,
                                  item
                                )
                              : "--"}
                          </span>
                        </td>
                      );
                    })}
                    {updatedColumn && updatedColumn.length && (
                      <td className="whitespace-nowrap px-3 py-5 text-left first:pl-5 last:pr-5">
                        <div className="flex">{updatedColumn(item)}</div>
                      </td>
                    )}
                    {actionsColumn && actionsColumn.length && (
                      <td className="whitespace-nowrap px-3 py-5 text-left first:pl-5 last:pr-5">
                        <div className="flex">{actionsColumn(item)}</div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <h1 className="font-semibold text-center">No {tableName}</h1>
        )}
        {data?.length && isPagination ? (
          <Pagination
            currentPage={page || 1}
            totalPages={totalPages || 1}
            onPageChange={(page) => handlePageChange && handlePageChange(page)}
          />
        ) : (
          <></>
        )}
      </section>

      {modals &&
        modals.length &&
        modals.map((modal, key) =>
          modal?.type === "sheet" ? (
            <Sheet
              key={key}
              className={`${modal.className} !p-0 rounded-t-xl smx:!rounded-xl !overflow-hidden top-auto !w-full !max-w-full smx:!w-[420px] min-[1540px]:!w-[610px] min-[1540px]:!max-w-[610px] smx:!max-w-[420px] !h-[calc(100vh-179px)] smx:!h-[calc(100%-77px)] smx:!my-auto smx:!mr-2 max-smx:data-[state=closed]:!slide-out-to-bottom max-smx:data-[state=open]:!slide-in-from-bottom`}
              open={modal.open}
              setOpen={modal.setOpen}
            >
              {modal.modalChild}
            </Sheet>
          ) : (
            <Modal
              key={key}
              variant="primary"
              className={`${modal.className} `}
              title={modal.title}
              open={modal.open}
              setOpen={modal.setOpen}
            >
              {modal.modalChild}
            </Modal>
          )
        )}

      {alerts && alerts.length > 0 ? alerts : <></>}
      {routeClicked && <PageLoader />}
    </div>
  );
};

export default UI8Table;
