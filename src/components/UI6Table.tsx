import React, {  useCallback } from "react";
import {  PlusIcon, SortAscendingIcon } from "../assets/icons";
import { formatData } from "@/utils/formatHelper";
import { useRouteChange } from "@/hooks/useRouteChange";
import PageLoader from "./atomics/PageLoader";
import { Button,  Pagination, Title } from "./atomics";
import debounce from "lodash.debounce";
import { ClearDatePicker } from "./atomics/DatePicker/ClearDatePicker";
import moment from "moment";
import { getFranchise } from "@/utils/getFranchise";
import { formatPhoneNumber } from "@/utils/formatPhoneForCall";


//table configuration
interface TableConfig {
  tableName: string;
  columns: {
    [key: string]: {
      path: string;
      header: string;
      type: string;
      render?: (value: any, index?: any) => React.ReactNode;
      isPhoneNumber?: boolean
    };
  };
  page?: number;
  setPage?: (page: number) => void;
  totalPages?: number;
  handlePageChange?: (page: number) => void;
  actionsColumn?: (item: any) => React.ReactNode[];
  addAction?: () => void;
  updatedColumn?: (item: any) => React.ReactNode[];
  hasNavigation?: boolean;
  types?: string[];
  typeCheckbox?: string;
  setTypeCheckbox: (value: string) => void;
  search: string;
  setSearch: (value: string) => void;
  cancelSearch: string;
  setCancelSearch: (value: string) => void;
  setIsSort: (value: boolean) => void;
  isSort: boolean;
  handleDateSearch: (value: string) => void;
}

interface DynamicTableProps {
  data: any[];
  config: TableConfig;
  typeCheckbox?: string;
}

const statuses = [
  "complete",
  "cancelled",
  "incoming_call",
  "outbound_call",
  "transferred",
  "waiting",
];

const Ui6Table: React.FC<DynamicTableProps> = ({ data, config }) => {
  const {
    page,
    setPage,
    totalPages,
    handlePageChange,
    tableName,
    columns,
    actionsColumn,
    updatedColumn,
    hasNavigation,
    typeCheckbox,
    setTypeCheckbox,
    search,
    setSearch,
    cancelSearch,
    setCancelSearch,
    handleDateSearch,
    setIsSort,
    isSort,
  } = config;
  const { franchise } = getFranchise();
  const [currentTime, setCurrentTime] = React.useState<any>(
    moment().tz(franchise?.franchise_timezone)
  );

  const { routeClicked, setRouteClicked } = useRouteChange();
  const [phoneNumber, setPhoneNumber] = React.useState<string>("");
  const [searchPerformed, setSearchPerformed] = React.useState<boolean>(false);
  const [errorMessage, setErrorMessage] = React.useState<string>("");



  const handleSearch = useCallback(
    debounce((value: string, setPage: Function | undefined, setSearch: Function, setSearchPerformed: Function) => {
      if (setPage) {
        setPage(1);
      }
      setSearch(value);
      setSearchPerformed(true);
    }, 500),
    []
  );

    const onSearchChange = (value: string) => {
    setPhoneNumber(value);

    handleSearch(value, setPage, setSearch, setSearchPerformed);
};

  const handleSort = () => {
    setIsSort(!isSort)
  }

  const handleDateChange = (selectedDate: any) => {
    const { year, month, day } = selectedDate;
    
    const newDate = moment.utc({ year, month: month - 1, day });
  
    setCurrentTime(newDate);
    const formattedDate = newDate.format('YYYY-MM-DD');
    handleDateSearch(formattedDate);
  };

  const handleClearCalendar = () => {
    handleDateSearch("");
    setCurrentTime(moment().tz(franchise?.franchise_timezone));
  };



  const handleOnClickRow = (item: any) => {
    const id = item.id;
    // setRouteClicked(true);
  };

  return (
    <div className="relative space-y-6 max-sm:px-2">
      <section className="relative space-y-6 rounded-lg-10 bg-white p-10 max-sm:px-2 !mt-0">
        <nav className="space-y-6">
          <Title size="lg" variant="primary">
            {tableName}
          </Title>

          <section className="flex items-center justify-between max-md:flex-col max-md:items-start max-md:gap-3 max-md:justify-start ">
            <div className="flex flex-row gap-3">
              <div className="relative w-72 2xl:w-96 max-sm:w-full">
                <PlusIcon className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-80" />

                <input
                  type="text"
                  className="w-full border border-transparent bg-neutral-20 px-3.5 py-2.5 pl-10 outline-0 ring-2 ring-transparent transition-all duration-300 ease-out focus-within:ring-primary-surface focus:border-primary-main rounded-xl"
                  placeholder="Search by phone number"
                  value={phoneNumber}
                  onChange={(e) => {
                    const value = e.target.value;
                      onSearchChange(value);                    
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
            <Button className="!h-10"
        size="md" variant={isSort ? "primary-bg" : "default-bg"} onClick={handleSort}>
                Sort
                <SortAscendingIcon
                  className={`h-4 w-4 stroke-neutral-100 stroke-[4px] ${isSort && "rotate-180 stroke-white"
                    }`}
                />
              </Button>
              
            </div>
          </section>
        </nav>

        {errorMessage && (
          <div className="mb-4 p-4 bg-[#c63d7f3b] text-black border rounded-lg">
            {errorMessage}
          </div>
        )}

        {data?.length ? (
          <div className="mb-6 justify-between">
            <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-15 text-body-sm font-semibold uppercase">
                <tr>
                  {Object.keys(columns).map((key) => (
                    <th
                      className="whitespace-nowrap px-3 py-4 text-left text-neutral-50 first:pl-5 last:pr-5"
                      key={key}
                    >
                      <span className="text-body-sm font-semibold">
                        {columns[key].header}
                      </span>
                    </th>
                  ))}

                  {updatedColumn && updatedColumn.length && (
                    <th className="whitespace-nowrap px-3 py-4 text-left text-neutral-50 first:pl-5 last:pr-5">
                      <span className="text-body-sm font-semibold">Status</span>
                    </th>
                  )}

                  {actionsColumn && actionsColumn.length && (
                    <th className="whitespace-nowrap px-3 py-4 text-left text-neutral-50 first:pl-5 last:pr-5">
                      <span className="text-body-sm font-semibold">Actions</span>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-20 pt-4 text-sm">
                {data.map((item: any, index: number) => (
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
                      
                      return (
                        <td
                          className="whitespace-nowrap px-3 py-5 text-left first:pl-5 last:pr-5"
                          key={key}
                        >
                          <span className="text-body-base font-medium text-neutral-80">
                            {columnValue !== null && columnValue !== undefined
                              ? columns[key].render
                                ? columns[key].render(columnValue, index)
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
      {routeClicked && <PageLoader />}
    </div>
  );
};

export default Ui6Table;
