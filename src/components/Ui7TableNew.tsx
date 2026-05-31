import React, { ReactNode, useCallback } from "react";
import { Dropdown, Modal, Sheet } from "./molecules";
import {
  FunnelIcon,
  PlusIcon,
  SortAscendingIcon,
} from "../assets/icons";
import { formatData } from "@/utils/formatHelper";
import { useRouteChange } from "@/hooks/useRouteChange";
import PageLoader from "./atomics/PageLoader";
import { Button, Checkbox, Pagination, Title } from "./atomics";
import debounce from "lodash.debounce";
import { getFranchise } from "@/utils/getFranchise";
import moment from "moment";
import { ClearDatePicker } from "./atomics/DatePicker/ClearDatePicker";
import { routes } from "@/constants/routes";
import { useRouter } from "next/navigation";
import { twMerge } from "tailwind-merge";
import { formatPhoneNumber } from "@/utils/formatPhoneForCall";

//table confiugurtiones
interface TableConfig {
  tableName: string;
  columns: {
    [key: string]: {
      path: string;
      header: string;
      type: string;
      style?: string;
      render?: (value: any) => React.ReactNode;
      [key: string]: any;
      isPhoneNumber?: boolean;
    };
  };
  page?: number;
  setPage?: (page: number) => void;
  totalPages?: number;
  handlePageChange?: (page: number) => void;
  actionsColumn?: (item: any, index: number) => React.ReactNode[];
  addAction?: () => void;
  updatedColumn?: (item: any) => React.ReactNode[];
  hasNavigation?: boolean;
  types?: string[];
  typeCheckbox?: string[];
  setTypeCheckbox: (value: string[]) => void;
  pageUrl?:string;
  search: string;
  setSearch: (value: string) => void;
  cancelSearch: string;
  setCencelSearch: (value: string) => void;
  inititalStatus?: string[];
  setIsSort: (value: boolean) => void;
  isSort: boolean;
  noFilter?: boolean;
  handleDateSearch: (value: string) => void;
  modals?: {
    title: string;
    className: string;
    open: boolean;
    type?: string;
    setOpen: (isOpen: boolean) => void;
    modalChild: ReactNode;
  }[];
}

interface DynamicTableProps {
  data: any[];
  config: TableConfig;
  typeCheckbox?: string;
}

const statuses = [
  "Completed",
  "Cancelled",
  "Incoming Call",
  "Outbound Call",
  "Transferred",
  "On Hold",
  "In Progress",
  "Waiting for Agent",
  "Connected to Agent",
  "Callback Requested",
  "Callee No Answer",
  "Voicemail Left",
  "Callee Answered",
  "Callback Initiated",
  "Ended by Agent",
];

const Ui7TableNew: React.FC<DynamicTableProps> = ({ data, config }) => {
  const {
    page,
    setPage,
    totalPages,
    modals,
    handlePageChange,
    tableName,
    columns,
    noFilter,
    actionsColumn,
    updatedColumn,
    hasNavigation,
    typeCheckbox,
    pageUrl,
    setTypeCheckbox,
    search,
    setSearch,
    cancelSearch,
    inititalStatus,
    setCencelSearch,
    setIsSort,
    handleDateSearch,
    isSort,
  } = config;
  const { franchise } = getFranchise();

  const { routeClicked, setRouteClicked } = useRouteChange();
  const [phoneNumber, setPhoneNumber] = React.useState<string>("");
  const [openFilterDropdown, setOpenFilterDropdown] =
    React.useState<boolean>(false);
  const [searchPerformed, setSearchPerformed] = React.useState<boolean>(false);

  const [errorMessage, setErrorMessage] = React.useState<string>("");
  const [currentTime, setCurrentTime] = React.useState<any>(
    moment().tz(franchise?.franchise_timezone)
  );

  const handleClear = () => {
    setTypeCheckbox(inititalStatus || []);
    setOpenFilterDropdown(false);
  };

  const handleCheckboxChange = (type: string) => {
    const shallowTypes = [...(typeCheckbox || [])];
    if (typeCheckbox?.includes(type)) {
      setTypeCheckbox(shallowTypes.filter((t) => t != type));
    } else {
      setTypeCheckbox([...shallowTypes, type]);
    }
  };

  const handleFilter = () => {
    setOpenFilterDropdown(false);
  };

  const handleDateChange = (selectedDate: any) => {
    const { year, month, day } = selectedDate;

    const newDate = moment.utc({ year, month: month - 1, day });

    setCurrentTime(newDate);
    const formattedDate = newDate.format("YYYY-MM-DD");
    handleDateSearch(formattedDate);
  };

  const handleClearCalendar = () => {
    handleDateSearch("");
    setCurrentTime(moment().tz(franchise?.franchise_timezone).utc());
  };

  const handleSearch = useCallback(
    debounce(
      (
        value: string,
        setPage: Function | undefined,
        setSearch: Function,
        setSearchPerformed: Function
      ) => {
        if (setPage) {
          setPage(1);
        }
        setSearch(value);
        setSearchPerformed(true);
      },
      500
    ),
    []
  );

  const onSearchChange = (value: string) => {
    setPhoneNumber(value);

    handleSearch(value, setPage, setSearch, setSearchPerformed);

  };



  const handleSort = () => {
    setIsSort(!isSort);
  };

  const router = useRouter();

  const handleOnClickRow = (item: any) => {
    const id = item.id;
    if(pageUrl){
      router.push(`${pageUrl}/${id}`)
    }else {
    router.push(`${routes.crmCallHistory}/${id}`);
    }
    setRouteClicked(true);
  };


  return (
    <div className="relative space-y-6 max-sm:px-2">
      <h1 className="text-heading-sm font-semibold"></h1>

      <section className="relative space-y-6 rounded-lg-10 bg-white p-10 max-sm:px-2 !mt-0">
        {/* Navigation */}
        <nav className="space-y-6">
          <Title size="lg" variant="primary">
            {tableName}
          </Title>

          <section className="flex items-center justify-between max-md:flex-col max-md:items-start max-md:gap-3 max-md:justify-start ">
            <div className="flex flex-row gap-3">
              <div className="relative w-72 2xl:w-96 max-sm:w-full">
                <PlusIcon className="absolute left-3.5 top-1/2 h-5 w-5  -translate-y-1/2 text-neutral-80" />

                <input
                  type="text"
                  className="w-full border border-transparent bg-neutral-20 px-3.5 py-2.5 pl-10 outline-0 ring-2 ring-transparent transition-all duration-300 ease-out focus-within:ring-primary-surface focus:border-primary-main rounded-xl"
                  placeholder="Search"
                  value={phoneNumber}
                  onChange={(e) => {
                    const value = e.target.value;
                    // if (/^\d*$/.test(value) && value.length <= 11) {
                    onSearchChange(value);
                    // }
                  }}
                />
              </div>
              
            </div>
            <div className="flex flex-row gap-3 items-end max-sm:flex-col max-sm:justify-start max-sm:w-full">
              <ClearDatePicker
                selected={currentTime.format("YYYY-MM-DD")}
                handleDateChange={handleDateChange}
                handleClearCalendar={handleClearCalendar}
                placement="bottom start"
              />
              <Button
                className="!h-10"
                size="md"
                variant={isSort ? "primary-bg" : "default-bg"}
                onClick={handleSort}
              >
                Sort
                <SortAscendingIcon
                  className={`h-4 w-4 stroke-neutral-100 stroke-[4px] ${
                    isSort && "rotate-180 text-white stroke-white"
                  }`}
                />
              </Button>
              {!noFilter && (
                <Dropdown
                  buttonChildren={
                    <Button className="!h-10" size="md" variant="default-bg">
                      Filter
                      <FunnelIcon className="h-5 w-5 stroke-neutral-100 stroke-[3px] " />
                    </Button>
                  }
                  setOpen={setOpenFilterDropdown}
                  open={openFilterDropdown}
                  className="p-0 mt-4"
                >
                  <div className="flex flex-col gap-4 p-4 max-h-[180px] overflow-y-auto">
                    {inititalStatus?.map((status) => (
                      <div
                        key={status}
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => handleCheckboxChange(status)}
                      >
                        <Checkbox
                          active={typeCheckbox?.includes(status)}
                          setActive={() => handleCheckboxChange(status)}
                        />
                        <p className="text-sm capitalize">
                          {status.replace(/_/g, " ")}
                        </p>
                      </div>
                    ))}
                  </div>
                  <footer className="flex justify-end gap-3 border-t border-neutral-lightest p-4">
                    <Button
                      onClick={handleClear}
                      className="!h-10"
                      size="md"
                      variant="primary-nude"
                    >
                      Clear All
                    </Button>

                    <Button
                      className="!h-10"
                      size="md"
                      variant="primary-bg"
                      onClick={handleFilter}
                    >
                      Done
                    </Button>
                  </footer>
                </Dropdown>
              )}
            </div>
          </section>
        </nav>

        {errorMessage && (
          <div className="mb-4 p-4 bg-[#c63d7f3b] text-black border  rounded-lg">
            {errorMessage}
          </div>
        )}

        {data?.length ? (
          <div className="mb-6 justify-between">
         <div className="overflow-x-auto">
         <table className="w-full  ">
              <thead className="bg-neutral-15 text-body-sm font-semibold uppercase">
                <tr>
                  {Object.keys(columns).map((key) => (
                    <th
                      className="whitespace-nowrap px-3 py-4 text-left text-neutral-50 first:pl-5 last:pr-5"
                      key={key}
                    >
                      <span className="text-body-sm font-semibold ">
                        {columns[key].header}
                      </span>
                    </th>
                  ))}

                  {updatedColumn && updatedColumn.length && (
                    <th className="whitespace-nowrap px-3 py-4 text-left text-neutral-50 first:pl-5 last:pr-5 ">
                      <span className="text-body-sm font-semibold">Status</span>
                    </th>
                  )}

                  {actionsColumn && actionsColumn.length && (
                    <th className="whitespace-nowrap px-3 py-4 text-left text-neutral-50 first:pl-5 last:pr-5">
                      <span className="text-body-sm font-semibold">
                        Actions
                      </span>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-20 pt-4 text-sm">
                {data?.map((item: any, index: number) => (
                  <tr
                    className={
                      hasNavigation
                        ? "hover:bg-gray-100 ease-in-out duration-300 transition-all group cursor-pointer"
                        : "cursor-pointer"
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
                      return (
                        <td
                          className="whitespace-nowrap px-3 py-5 text-left first:pl-5 last:pr-5"
                          key={key}
                        >
                          <span 
                          className={twMerge("text-body-base font-medium text-neutral-80",
                            columns[key].style && columns[key].style,
                              columns[key][columnValue] && columns[key][columnValue])}>
                            {columnValue !== null && columnValue !== undefined
                              ? columns[key].render
                                ? columns[key].render(columnValue)
                                : formatData(
                                    columnValue,
                                    columns[key].type,
                                    item
                                  )
                              : "--"}
                          </span>
                        </td>
                      );
                    })}
                     {actionsColumn && actionsColumn.length && (
                      <td className="whitespace-nowrap px-3 py-5 text-left first:pl-5 last:pr-5">
                        <div className="flex">{actionsColumn(item, index)}</div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
         </div>

            {data?.length ? (
              <Pagination
                currentPage={page || 1}
                totalPages={totalPages || 1}
                onPageChange={(page) =>
                  handlePageChange && handlePageChange(page)
                }
              />
            ) : (
              <PageLoader />
            )}
          </div>
        ) : (
          <div className="h-96 flex items-center justify-center text-neutral-40">
            No {tableName} available
          </div>
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
      {routeClicked && <PageLoader />}
    </div>
  );
};

export default Ui7TableNew;
