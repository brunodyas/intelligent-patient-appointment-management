"use client";
import { Alerts, Button, Title } from "@/components/atomics";

import { MagnifyingGlassIcon, PlusIcon, SortAscendingIcon } from "@/assets/icons";
import { CRMConfig } from "@/interface/config";
import formatDate, { formatDateForFranchiseUser } from "@/utils/formatDate";
import Route from "@/components/atomics/Route";
import { useState } from "react";
import { Modal } from "@/components/molecules";
import { deleteConfigById } from "@/services/config";
import { useJune } from "@/hooks/useJune";
import { sendQuote } from "@/services/jobs";

type Props = {
  isSort:boolean,
  setIsSort:(value: boolean) => void;
  search?:string,
  handleSearchChange?: (searchValue: string) => void;
  setOpenAddConfig: (value: boolean) => void;
  productConfigs: CRMConfig[];
  configId?: number;
  setOpenModalProduct: React.Dispatch<React.SetStateAction<boolean>>;
  setConfigId: (id: number) => void;
  setProductConfigs: (value: any) => void;
  setOpenGenerateConfig: (isOpen: boolean) => void;
  invoice_steps_not_started?: boolean;
  jobId: string;
};

const ProductConfigTable = ({
  search,
  handleSearchChange,
  isSort,
  setIsSort,
  setOpenAddConfig,
  productConfigs,
  setConfigId,
  setOpenModalProduct,
  setProductConfigs,
  setOpenGenerateConfig,
  configId,
  invoice_steps_not_started,
  jobId,
}: Props) => {
  const [openDelete, setOpenDelete] = useState(false);
  const [openDeleteAlert, setOpenDeleteAlert] = useState(false);
  const analytics = useJune();


  const handleSort = () => {
    setIsSort(!isSort);
  };

  const handleDelete = async () => {
    if (configId) {
      try {
        await deleteConfigById(configId);
        analytics?.track("deleteConfigById");
        setOpenDelete(false);
        setOpenDeleteAlert(true);
        setProductConfigs(productConfigs.filter((config) => config.id !== configId));
      } catch (e) {
        throw e;
      }
    }
  };


  return (
    <div className="relative px-4 max-smx:p-0">
      <Modal
        variant="primary"
        open={openDelete}
        setOpen={setOpenDelete}
        className=""
        title="Delete Blind Configuration"
      >
        <main className="mb-10 mt-4">
          <p className="text-sm text-neutral-80">
            Are you sure you want to delete this configuration? Deleted
            cofigurations can&apos;t be recovered.
          </p>
        </main>
        <footer className="flex w-full justify-end gap-3">
          <Button
            className="!h-10"
            size="md"
            variant="default-nude"
            onClick={() => setOpenDelete(false)}
          >
            Cancel
          </Button>
          <Button
            className="!h-10"
            size="md"
            variant="error-bg"
            onClick={() => {
              handleDelete();
            }}
          >
            Submit
          </Button>
        </footer>
      </Modal>
      <Alerts
        key="alert-config-deleted"
        variant="success"
        open={openDeleteAlert}
        setOpen={setOpenDeleteAlert}
        title="Product configuration has been deleted"
        desc="Your product configuration has been successfully deleted. Review the details in the table."
      />
      <h1 className="text-xl sm:text-body-xl font-semibold"></h1>
      <section className="flex flex-col gap-6">
        <nav className="space-y-6 w-full">
          <section className="flex max-[1172px]:items-start items-cetner justify-between max-[1172px]:flex-col flex-row gap-5 gap-5">
            <Title size="xl" variant="success">
              Product Configurator
            </Title>
            <div className="flex flex-row gap-3 max-[615px]:flex-col max-sm:w-full">
              <div className="relative w-72 2xl:w-96 max-sm:w-full">
                <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-50" />
                <input
                  className="w-full rounded-lg border border-transparent bg-neutral-20 px-3.5 py-2.5 pl-11  outline-0 ring-2 ring-transparent transition-all duration-300 ease-out focus-within:ring-primary-surface focus:border-primary-main"
                  placeholder="Search"  onChange={(e) => handleSearchChange && handleSearchChange(e.target.value)}
                  value={search || ""}
                />
              </div>
                <Button
                      className="!h-[45px]"
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
              {invoice_steps_not_started && (
                <Button
                  size="md"
                  variant="primary-bg"
                  onClick={(e: any) => {
                    e.stopPropagation();
                    setOpenModalProduct(true);
                  }}
                >
                  <PlusIcon className="h-4 w-4 stroke-[10px]" />
                  Add Product Configuration
                </Button>
              )}
            </div>
          </section>
        </nav>
        <div className="mb-6 overflow-x-auto">
          <table className="w-full table-auto">
            <tbody className="divide-y divide-neutral-20 pt-4">
              {productConfigs.map(
                ({ config_name, id, linked_job, createdAt }) => (
                  <tr key={id} className="rounded-lg">
                    <td className="px-5 py-2 rounded-lg text-left font-light hover:bg-gray-100 ease-in-out duration-300 transition-all group hover:cursor-pointer flex items-center">
                      <Route route={`${linked_job}/${id}`} linkClassName="">
                        <div className="font-semibold">{config_name}</div>
                        <div className="text-xs">
                          {formatDateForFranchiseUser(createdAt)}
                        </div>
                      </Route>
                      <div className="flex gap-2">
                        {invoice_steps_not_started && (
                          <Button
                            className="!h-9 !w-9"
                            size="md"
                            variant="default-bg"
                            onClick={(e: any) => {
                              setConfigId(id);
                              e.stopPropagation();
                              setOpenDelete(true);
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
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
          
        </div>
      </section>
    </div>
  );
};

export default ProductConfigTable;
