import React from "react";
import { Dropdown } from "./molecules";
import { FunnelIcon, MagnifyingGlassIcon, PlusIcon } from "../assets/icons";
import { formatData } from "@/utils/formatHelper";
import { useRouteChange } from "@/hooks/useRouteChange";
import PageLoader from "./atomics/PageLoader";
import { Button, Checkbox, Pagination, Title } from "./atomics";

//table configuration
interface TableConfig {
  tableName: string;
  columns: {
    [key: string]: {
      path: string;
      header: string;
      type: string;
      render?: (value: any) => React.ReactNode;
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

const Ui5Table: React.FC<DynamicTableProps> = ({ data, config }) => {
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
  } = config;

  const { routeClicked, setRouteClicked } = useRouteChange();
  const [phoneNumber, setPhoneNumber] = React.useState<string>("");
  const [openFilterDropdown, setOpenFilterDropdown] =
    React.useState<boolean>(false);
  const [searchPerformed, setSearchPerformed] = React.useState<boolean>(false);
  const [errorMessage, setErrorMessage] = React.useState<string>("");

  const handleClear = () => {
    setTypeCheckbox("");
    setOpenFilterDropdown(false);
  };

  const handleCheckboxChange = (type: string) => {
    setTypeCheckbox(typeCheckbox === type ? "" : type);
  };

  const handleFilter = () => {
    setOpenFilterDropdown(false);
  };

  const handleSearch = () => {
    if (phoneNumber.length === 11) {
      setSearch(phoneNumber);
      setSearchPerformed(true);
      setErrorMessage("");
      if (setPage) {
        setPage(1);
      }
    } else {
      setErrorMessage("Phone number must be exactly 11 digits.");
      setTimeout(() => {
        setErrorMessage("");
      }, 5000);
    }
  };

  const handleCancelSearch = () => {
    setSearch("");
    setCancelSearch("");
    setSearchPerformed(false);
    setPhoneNumber("loading...");
    if (setPage) {
      setPage(1);
    }
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
                    if (/^\d*$/.test(value) && value.length <= 11) {
                      setPhoneNumber(value);
                    }
                  }}
                />
              </div>

              {searchPerformed ? (
                <Button
                  size="md"
                  variant="primary-bg"
                  onClick={handleCancelSearch}
                >
                  <PlusIcon className="h-5 w-5 text-neutral-10 rotate-45" />
                </Button>
              ) : (
                <Button size="md" variant="primary-bg" onClick={handleSearch}>
                  <MagnifyingGlassIcon className="h-5 w-5 text-neutral-10" />
                </Button>
              )}
            </div>

            <div className="flex flex-row gap-3 max-sm:flex-col max-sm:justify-start max-sm:w-full">
              <Dropdown
                buttonChildren={
                  <Button size="md" variant="default-bg">
                    Filter
                    <FunnelIcon className="h-5 w-5 stroke-neutral-100 stroke-[3px]" />
                  </Button>
                }
                setOpen={setOpenFilterDropdown}
                open={openFilterDropdown}
                className="p-0 mt-4"
              >
                <div className="flex flex-col gap-4 p-4">
                  {statuses.map((status) => (
                    <div
                      key={status}
                      className="flex items-center gap-2 cursor-pointer"
                      onClick={() => handleCheckboxChange(status)}
                    >
                      <Checkbox
                        active={typeCheckbox === status}
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
                    size="md"
                    variant="primary-nude"
                  >
                    Clear All
                  </Button>

                  <Button size="md" variant="primary-bg" onClick={handleFilter}>
                    Done
                  </Button>
                </footer>
              </Dropdown>
            </div>
          </section>
        </nav>

        {errorMessage && (
          <div className="mb-4 p-4 bg-[#c63d7f3b] text-black border rounded-lg">
            {errorMessage}
          </div>
        )}

        {data?.length ? (
          <div className="mb-6 overflow-x-auto justify-between">
            <table className="w-full table-auto justify-between">
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
                      <span className="text-body-sm font-semibold">
                        Actions
                      </span>
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
                  >
                    {Object.keys(columns).map((key) => {
                      const columnValue = columns[key].path
                        .split(".")
                        .reduce((o, i) => (o ? o[i] : null), item);

                      return (
                        <td
                          className="whitespace-nowrap px-3 py-5 text-left first:pl-5 last:pr-5"
                          key={key}
                        >
                          <span className="text-body-base font-medium text-neutral-80">
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
                  </tr>
                ))}
              </tbody>
            </table>

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
            No Voicemails
          </div>
        )}
      </section>
      {routeClicked && <PageLoader />}
    </div>
  );
};

export default Ui5Table;
