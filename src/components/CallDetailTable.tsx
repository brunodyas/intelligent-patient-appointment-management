"use client";
import React from "react";
import { formatData } from "@/utils/formatHelper";
import { useRouteChange } from "@/hooks/useRouteChange";
import PageLoader from "./atomics/PageLoader";
import { Title } from "./atomics";
import { getFranchise } from "@/utils/getFranchise";

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
}

interface DynamicTableProps {
  data: any[];
  config: TableConfig;
  typeCheckbox?: string;
}

const CallDetailTableNew: React.FC<DynamicTableProps> = ({ data, config }) => {
  const { tableName, columns } = config;
  const { franchise } = getFranchise();

  const { routeClicked, setRouteClicked } = useRouteChange();

  // const router = useRouter();

  const handleOnClickRow = (item: any) => {
    const id = item.id;
    // router.push(`${routes.crmCallHistory}/${id}`);
    // setRouteClicked(true);
  };

  return (
    <div className="relative space-y-6 max-sm:px-2">
      <h1 className="text-heading-sm font-semibold"></h1>

      <section className="relative space-y-6 rounded-lg-10 bg-white p-10 max-sm:px-2 !mt-0">
        <nav className="space-y-6">
          <Title size="lg" variant="primary">
            {tableName}
          </Title>
        </nav>

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
                      <span className="text-body-sm font-semibold ">
                        {columns[key].header}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-20 pt-4 text-sm">
                {data?.map((item: any, index: number) => (
                  <tr
                    className="hover:bg-gray-100 ease-in-out duration-300 transition-all group cursor-pointer"
                    key={index}
                    onClick={() => handleOnClickRow(item)}
                  >
                    {Object.keys(columns).map((key) => {
                      const column = columns[key];
                      const columnValue = column.path
                        .split(".")
                        .reduce((o, i) => (o ? o[i] : null), item);

                        console.log(item[column.path]);

                      return (
                        <td
                          className="whitespace-nowrap px-3 py-5 text-left first:pl-5 last:pr-5"
                          key={key}
                        >
                          <span className="text-body-base font-medium text-neutral-80">
                            {columnValue !== null &&
                            columnValue !== undefined ? (
                              column.type === "audio" ? (
                                columnValue ? (
                                  <audio controls>
                                    <source
                                      src={item[column.path]}
                                      type="audio/mpeg"
                                    />
                                    Your browser does not support the audio
                                    element.
                                  </audio>
                                ) : (
                                  <p>No audio available</p>
                                )
                              ) : (
                                formatData(columnValue, column.type, item)
                              )
                            ) : (
                              "--"
                            )}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="h-96 flex items-center justify-center text-neutral-40">
            No {tableName} records available
          </div>
        )}
      </section>
      {routeClicked && <PageLoader />}
    </div>
  );
};

export default CallDetailTableNew;
