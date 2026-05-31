"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CRMJob, InvoiceInterface } from "@/interface/jobs";
import { getJobsById, updateJobById } from "@/services/jobs";
import { useParams, useRouter } from "next/navigation";
import {
  IoChatbubbleOutline,
  IoCallOutline,
  IoPencilOutline,
  IoReturnDownBackOutline,
  IoPersonOutline,
} from "react-icons/io5";

import { Button } from "@headlessui/react";
import { PIPELINES } from "@/constants/enums/enums";
import { formatDateForFranchiseUser } from "@/utils/formatDate";
import Activities from "@/components/pages/Activity";
import DocumentsTable from "@/components/pages/DocumentsTable";
import ProductConfigTable from "@/components/templates/crm/jobs/ProductConfigTable";
import { routes } from "@/constants/routes";
import { FaUser } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@relume_io/relume-ui";
import { Sheet } from "@/components/molecules";
import ViewTechInfo from "@/components/organisms/ViewTechInfo";
import Route from "@/components/atomics/Route";
import { useTechLocation } from "@/context/techLocationContext";
import MapView from "@/components/pages/MapView";
import { MarkerInterface } from "@/interface/mapBox";
import { useRouteChange } from "@/hooks/useRouteChange";
import {
  generateFirstInvoice,
  generateFullInvoiceForRepairsPipeline,
  generateSecondInvoice,
  getConfigs,
} from "@/services/config";
import { CRMConfig } from "@/interface/config";
import GenerateConfigModal from "@/components/templates/crm/jobs/GenerateConfigModal";
import InvoiceTable from "@/components/templates/crm/jobs/InvoiceTable";
import { paymentStatus } from "@/utils/paymentStatus";
import AddJobModal from "@/components/templates/crm/jobs/AddJobModal";
import Image from "next/image";
import RepairsInvoice from "@/components/templates/crm/jobs/RepairsInvoice";
import { useJune } from "@/hooks/useJune";
import ProductConfiguratorForm from "@/components/atomics/ProductConfiguratorForm";
import RestrictedPage from "@/components/templates/crm/jobs/RestrictedPage";
import PageLoader from "@/components/atomics/PageLoader";

const statuses: string[] = [
  "🕛 Pending",
  "🚚 Active",
  "❌ Failed",
  "✅ Completed",
  "❌ Cancelled",
];

const pipeline = {
  CONSULTATION: "CONSULTATION",
  REPAIRS: "REPAIRS",
};

const JobDetails = () => {

  const { jobId } = useParams<{ jobId: string }>() ?? {jobId: ''};
  const router = useRouter();
  const { setRouteClicked } = useRouteChange();
  const [statusState, setStatusState] = useState<string>();
  const [stageState, setStageState] = useState<string>();
  const [showProductConfig, setShowProductConfig] = useState(false);
  const [showActivitiesAndDocs, setShowActivitiesAndDocs] = useState(false);
  const [openModalProduct, setOpenModalProduct] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [fetchData, setFetchData] = useState<boolean>(false);
  const [showRestrictedPage, setShowRestrictedPage] = useState<boolean>(false);
  const [job, setJob] = useState<CRMJob>();
  const [productConfigs, setProductConfigs] = useState<CRMConfig[]>();
  const [viewTechInfoOpen, setViewTechInfoOpen] = useState(false);
  const [openEditJob, setOpenEditJob] = useState(false);
  const [openAddConfig, setOpenAddConfig] = useState(false);
  const { techLocations } = useTechLocation(); // Get the tech's location from context
  const [markers, setMarkers] = useState<MarkerInterface[]>([]); // State to manage markers
  const [openGenerateConfig, setOpenGenerateConfig] = useState(false);
  const [configId, setConfigId] = useState<number>();
  const [isSort,setIsSort] = useState<boolean>(false);
  const [search, setSearch] = useState("")
  const timeoutRef = useRef<any>(null);
  const analytics = useJune();

  useEffect(() => {
    const updateJob = async () => {
      if (job) {
        if (statusState != job.status) {
          try {
            await updateJobById(job.id.toString(), {
              pipeline: job.pipeline?.toUpperCase(),
              status: statusState,
            });
            analytics?.track("updateJobById");
          } catch (e) {
            throw e;
          }
        }
        if (stageState != job.stage) {
          try {
            await updateJobById(job.id.toString(), {
              pipeline: job.pipeline?.toUpperCase(),
              stage: stageState?.toUpperCase(),
            });
            analytics?.track("updateJobById");
          } catch (e) {
            throw e;
          }
        }
      }
    };
    updateJob();
  }, [stageState, statusState]);

  const fetchJobData = async () => {
    try {
      setShowRestrictedPage(false);
      const response = await getJobsById(jobId);
      analytics?.track("getJobsById");
      if (response.id) {
        setJob(response);
        setStatusState(response.status.toUpperCase());
        setStageState(response.stage.toUpperCase());
      }
    } catch (e) {
      setShowRestrictedPage(true);
      throw e;
    } finally {
      setIsLoading(false)
    };
  }
  const fetchProductConfigData = async (searchValue?:string) => {
    try {
      const response = await getConfigs(jobId,isSort,searchValue);
      setProductConfigs(response);
    } catch (e) {
      throw e;
    }
  };

  useEffect(()=> {
    fetchJobData();
  },[jobId,openModalProduct])
  
  useEffect(() => {
    fetchProductConfigData(search);
  }, [jobId, isSort,openModalProduct]);

  const handleSearchChange = useCallback((searchValue: string) => {
    if (timeoutRef) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      fetchProductConfigData(searchValue)
    }, 2000);
    setSearch(searchValue)
  }, [])

  useEffect(() => {
    if (job) {
      const newMarkers: MarkerInterface[] = [];
      if (job?.linked_contact.customer_address_coordinates) {
        const [latitude, longitude] =
          job?.linked_contact.customer_address_coordinates
            ?.split(",")
            ?.map(Number) || [];

        // Validate coordinates
        if (!isNaN(latitude) && !isNaN(longitude)) {
          newMarkers.push({
            id: job.id,
            name: job?.linked_contact.customer_address,
            created_at: `${job?.pipeline}: ${formatDateForFranchiseUser(
              job.consultation_date
            )}`,
            longitude: longitude,
            latitude: latitude,
          });
        }
      }

      const techLocation = techLocations.find(
        (location) => location.tech_id === job?.assigned_Driver?.id
      );

      if (
        techLocation &&
        job?.assigned_Driver &&
        !isNaN(techLocation.latitude) &&
        !isNaN(techLocation.longitude)
      ) {
        newMarkers.push({
          id: job.assigned_Driver.id,
          name: job.assigned_Driver.name ?? "Technician",
          created_at: `Tech Location`,
          longitude: techLocation.longitude,
          latitude: techLocation.latitude,
          isTechnician: true,
        });
      }

      setMarkers(newMarkers);
    }
  }, [job, techLocations]);

  const stages: string[] =
    job?.pipeline === PIPELINES.CONSULTATION
      ? ["New", "Consultation", "Ordered", "Installation"]
      : ["New", "Diagnose", "In Progress", "Completed"];

  const jobInfoFull = {
    "Job Name": job?.job_name,
    "Total Invoice Amount": "$" + job?.total_invoice_amount.toString() + ".00",
    Status: job?.status,
    Email: job?.linked_contact.customer_email,
    Pipeline: job?.pipeline,
    "Appointment Date": formatDateForFranchiseUser(
      job?.consultation_date as any
    ),
    "Linked Customer": job?.linked_contact.contact_name,
    Stage: job?.stage,
    Owner: job?.added_by?.name,
    Address: job?.linked_contact?.customer_address,
    Description: job?.customer_description,
  };

  const invoices = useMemo(() => {
    //dont show invoices if status is not started
    let downPayment: InvoiceInterface;
    let finalPayment: InvoiceInterface;

    if (job) {
      const amount = job?.pipeline.includes(pipeline.REPAIRS)
        ? job.total_invoice_amount.toFixed(2)
        : `$${(job.total_invoice_amount / 2).toFixed(2)}`;
      const { downPaymentStatus, finalPaymentStatus } = paymentStatus(job);

      downPayment = {
        id: job.first_invoice_id ? job.first_invoice_id : "----",
        amount,
        status: downPaymentStatus,
      };

      finalPayment = {
        id: job.second_invoice_id ? job.second_invoice_id : "----",
        amount,
        status: finalPaymentStatus,
      };
      return { downPayment, finalPayment };
    }
  }, [job]);

  const jobInfo = {
    Type: job?.pipeline,
    "Appointment Date": formatDateForFranchiseUser(
      job?.consultation_date as any
    ),
    Description: job?.customer_description,
  };

  const handleBackButton = () => {
    router.back();
    setRouteClicked(true);
  };

  const handleGenerateFirstInvoice = async () => {
    if (job) {
      try {
        await generateFirstInvoice(job.id);
        analytics?.track("generateFirstInvoice");
        fetchJobData();
      } catch (e) {
        throw e;
      }
    }
  };

  const handleInvoiceForRepairs = async () => {
    if (job) {
      try {
        await generateFullInvoiceForRepairsPipeline(job.id);
        analytics?.track("generateFullInvoiceForRepairsPipeline");
        fetchJobData();
      } catch (e) {
        throw e;
      }
    }
  };
  const handleGenerateSecondInvoice = async () => {
    if (job) {
      try {
        await generateSecondInvoice(job.id);
        analytics?.track("generateSecondInvoice");
        fetchJobData();
      } catch (e) {
        throw e;
      }
    }
  };

  return (
    <>
      {isLoading ? <PageLoader />
        : showRestrictedPage ? <RestrictedPage /> : (
          <>
            <div className={`${openModalProduct ? 'flex' : 'hidden'} relative`}>
              <ProductConfiguratorForm openModalProduct={openModalProduct} setOpenModalProduct={setOpenModalProduct} setFetchData={setFetchData} />
            </div>


            <div className={`${openModalProduct ? 'hidden' : 'flex flex-col'}`}>
              {configId && job && (
                <GenerateConfigModal
                  open={openGenerateConfig}
                  setOpen={setOpenGenerateConfig}
                  configId={configId}
                  job={job}
                />
              )}

              <section className="bg-primary-main text-neutral-white m-0 rounded-md">
                <div className="px-[5%] py-4">
                  <div className="container font-semibold">
                    <div className="flex items-center gap-2 mb-3 mt-4 smx:flex hidden">
                      <Breadcrumb>
                        <BreadcrumbList>
                          <BreadcrumbItem>
                            <Route
                              route={routes.crmJobs}
                              linkClassName="text-brand-lightest text-sm font-normal hover:cursor-pointer"
                            >
                              {job &&
                                `${job?.pipeline.charAt(0).toUpperCase() +
                                job?.pipeline.slice(1).toLowerCase()
                                }s`}
                            </Route>
                          </BreadcrumbItem>
                          <BreadcrumbSeparator className="text-neutral-white" />
                          <BreadcrumbItem>
                            <BreadcrumbLink className="text-neutral-white font-semibold text-sm cursor-auto">
                              {job?.job_name}
                            </BreadcrumbLink>
                          </BreadcrumbItem>
                        </BreadcrumbList>
                      </Breadcrumb>
                    </div>

                    <div className="my-4">
                      <p className="text-xs uppercase tracking-tighter">
                        {job?.pipeline}
                      </p>
                      <p className="text-xl">{job?.linked_contact.contact_name}</p>
                      <p className="text-sm text-[#f4d8e5]">{"test"}</p>
                    </div>

                    <div className="my-4">
                      <p className="text-md mb-1">Status</p>
                      <div className="flex gap-4 flex-wrap">
                        {statuses.map((status) => {
                          const cleanStatus = status
                            .replace(/[^a-zA-Z0-9]/g, "")
                            .toUpperCase();
                          return (
                            <div
                              className={`text-nowrap rounded-full text-sm border py-2 px-4 hover:bg-primary-hover/50 transition hover:ease-in-out duration-150 hover:cursor-pointer ${statusState === cleanStatus && "bg-primary-selected"
                                }`}
                              onClick={() => setStatusState(cleanStatus)}
                              key={status}
                            >
                              {status}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="my-4">
                      <p className="text-md mb-1">Stage</p>
                      <div className="flex gap-4 flex-wrap">
                        {stages.map((stage) => (
                          <div
                            className={`text-nowrap rounded-full text-sm border py-2 px-4 hover:bg-primary-hover/50 transition hover:ease-in-out duration-150 hover:cursor-pointer ${stageState?.replace("_", " ") === stage.toUpperCase() &&
                              "bg-primary-selected"
                              }`}
                            onClick={async () => setStageState(stage.toUpperCase())}
                            key={stage}
                          >
                            {stage}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="my-4 flex justify-center gap-4 pt-3 flex-wrap">
                      <Button
                        onClick={handleBackButton}
                        className="bg-[#ca4b88] w-1/3 max-sm:w-full max-sm:px-3 px-10 py-2 rounded-lg hover:bg-white/20 flex items-center justify-center"
                      >
                        <IoReturnDownBackOutline className="mr-2" />
                        Back
                      </Button>

                      {job?.linked_contact.customer_phone && (
                        <Button className="bg-[#ca4b88] w-1/3 max-sm:w-full max-sm:px-3 px-10 py-2 rounded-lg hover:bg-white/20 flex items-center justify-center">
                          <IoCallOutline className="mr-2" />
                          Call Customer
                        </Button>
                      )}

                      <Button
                        className="bg-[#ca4b88] w-1/3 px-10 py-2 max-sm:w-full max-sm:px-3 rounded-lg hover:bg-white/20 flex items-center justify-center"
                        onClick={() => setOpenEditJob(true)}
                      >
                        <IoPencilOutline className="mr-2" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              </section>
              {openEditJob && (
                <AddJobModal
                  setOpenAddJob={setOpenEditJob}
                  openAddJob={openEditJob}
                  jobToEdit={job}
                  setIsSubmit={(val) => {
                    val && fetchJobData();
                  }}
                />
              )}
              <div className="py-4">
                <div className="container w-full">
                  <div className="border rounded-md px-6 py-5 max-sm:p-3">
                    <p className="font-semibold text-md sm:text-lg">
                      Full Job Information
                    </p>
                    <div className="grid gap-4 grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1 py-5 text-sm">
                      {Object.entries(jobInfoFull).map(([key, value]) => (
                        <div key={key} className="flex flex-col">
                          <p className="text-gray-600">{key}</p>
                          <p className={key === "Email" ? "text-pink-500" : ""}>
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="py-4">
                <div className="container">
                  <div
                    className={`border rounded-md px-6 py-5 max-sm:p-3 ${!job?.assigned_Driver && "flex justify-between"
                      }`}
                  >
                    <p className="font-semibold text-md sm:text-lg">
                      Vehicle Information
                    </p>
                    {job?.assigned_Driver ? (
                      <div className="flex justify-between sm:pt-2 max-sm:p-0 sm:pr-6 flex-wrap gap-2">
                        <div>
                          <p className="text-[#333333b3] text-sm">Vehicle</p>
                          <p className="text-sm">{job.assigned_Driver.tech_vehicle}</p>
                        </div>
                        <div>
                          <p className="text-[#333333b3] text-sm">License Plate</p>
                          <p className="text-sm">
                            {job.assigned_Driver.tech_license_plate}
                          </p>
                        </div>
                        <div className="w-full">
                          <div className="flex items-center justify-start flex-wrap gap-4 max-sm:gap-2">
                            <div className="w-30 h-30 max-sm:w-14 max-sm:h-14 rounded-md overflow-hidden">
                              {job.assigned_Driver.photo ? (
                                <div className="w-full h-full rounded-full flex items-center justify-center bg-gray-200">
                                  <Image
                                    src={job.assigned_Driver.photo}
                                    width={10}
                                    height={10}
                                    alt="Profile Picture"
                                    className="h-full w-full rounded-full object-cover"
                                    unoptimized
                                  />
                                </div>
                              ) : (
                                <div className="w-full h-full rounded-full flex items-center justify-center bg-gray-200">
                                  <FaUser size="50%" color="gray" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-pink-600 text-xs uppercase font-semibold">
                                Tech
                              </p>
                              <p className="text-xl max-sm:text-md font-semibold">
                                {job.assigned_Driver.name}
                              </p>
                            </div>
                          </div>
                          <div className="flex justify-center gap-5 max-sm:gap-2 py-5">
                            <Button className="flex flex-col text-xs text-primary-main items-center justify-center bg-[#fbf1f6] w-1/2 rounded-lg font-semibold hover:bg-primary-main/20 transition duration-100 sm:p-4 max-sm:p-2 !h-[60px]">
                              <IoCallOutline className="flex-shrink-0 size-4" />
                              Call Tech
                            </Button>

                            <Button
                              className="flex flex-col text-xs text-primary-main items-center justify-center bg-[#fbf1f6] w-1/2 rounded-lg font-semibold hover:bg-primary-main/20 transition duration-100 sm:p-4 max-sm:p-2 !h-[60px]"
                              onClick={() => setViewTechInfoOpen(true)}
                            >
                              <IoPersonOutline className="flex-shrink-0 size-4" />
                              View Tech&apos;s Info
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-primary-main uppercase text-xs font-semibold p-2">
                        Please assign a tech to this job
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="py-4">
                <div className="container">
                  <div className="flex border rounded-md px-6 py-5 max-sm:p-3 max-lg:flex-col">
                    <div className="w-1/3 max-lg:w-full ">
                      <p className="font-semibold text-md sm:text-lg">
                        Job Information
                      </p>

                      <div>
                        {job?.linked_contact.customer_address && (
                          <div className="my-3">
                            <p className="text-sm font-semibold">
                              {job.linked_contact.customer_address}
                            </p>
                            <p className="text-xs text-gray-500">Address</p>
                          </div>
                        )}

                        <div className="text-sm">
                          {Object.entries(jobInfo).map(([key, value]) => (
                            <div
                              key={key}
                              className="flex gap-10 justify-between my-1 border-b py-2 w-full"
                            >
                              <p className="text-gray-600 break-words">{key}</p>
                              <p className="break-words text-right">{value}</p>
                            </div>
                          ))}

                          {job?.questions_for_technician_to_ask && (
                            <div className="px-5 py-3 max-sm:p-3 break-words m-2 max-sm:my-2 max-sm:mx-0 bg-[#efefef] rounded-md text-sm flex items-start">
                              <IoChatbubbleOutline className="mr-2 mt-1 w-5 h-5 flex-shrink-0 " />
                              <div>
                                <ReactMarkdown>
                                  {job.questions_for_technician_to_ask}
                                </ReactMarkdown>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="w-2/3 text-center flex justify-center p-4 max-smx:px-0 max-lg:w-full">
                      <MapView
                        markers={markers}
                        style={{ flex: 1, minHeight: "50vh", maxHeight: "100vh" }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="py-4">
                <div className="container">
                  <Accordion
                    className="rounded-lg shadow-[0_2px_10px] shadow-black/5 mb-2"
                    type="single"
                    collapsible
                    value={showProductConfig ? "item-1" : ""}
                    onValueChange={(value: any) => {
                      if (value === "item-1") {
                        setShowProductConfig(true);
                      } else {
                        setShowProductConfig(false)
                      }
                    }}
                  >
                    <AccordionItem value="item-1" className="accordian !border-none">
                      <AccordionTrigger
                        className="accordian-btn gap-2 bg-primary-highlight py-3 px-4 data-[state=open]:rounded-t-lg data-[state=closed]:rounded-lg text-black text-sm"
                      >
                        {showProductConfig ? "Hide" : "Show"} Product Config
                      </AccordionTrigger>
                      <AccordionContent className="pt-2 px-3 pb-3 border-2 border-[#E5E7EB] rounded-b-md">
                        {showProductConfig && productConfigs && (
                          <div className="max-smx:px-0">
                            <ProductConfigTable
                              setOpenAddConfig={setOpenAddConfig}
                              productConfigs={productConfigs}
                              jobId={jobId}
                              setConfigId={setConfigId}
                              setOpenModalProduct={setOpenModalProduct}
                              setProductConfigs={setProductConfigs}
                              setOpenGenerateConfig={setOpenGenerateConfig}
                              configId={configId}
                              invoice_steps_not_started={job?.invoice_steps_not_started}
                              search={search}
                              handleSearchChange={handleSearchChange}
                              setIsSort={setIsSort}
                              isSort={isSort}
                            />
                            {job &&
                              job?.pipeline.includes(pipeline.CONSULTATION) &&
                              invoices?.downPayment &&
                              invoices?.finalPayment && (
                                <InvoiceTable
                                  jobId={jobId}
                                  fetchJobData={fetchJobData}
                                  downPayment={invoices.downPayment}
                                  finalPayment={invoices.finalPayment}
                                  invoiceStepsStarted={!job.invoice_steps_not_started}
                                  firstInvoicePaid={job.first_invoice_paid}
                                  canGenerateFinalPayment={job.can_generate_final_payment}
                                  handleGenerateFirstInvoice={handleGenerateFirstInvoice}
                                  handleGenerateSecondInvoice={handleGenerateSecondInvoice}
                                  configNotChosen={productConfigs?.some(
                                    (config) => config.chosen_config === null
                                  )}
                                />
                              )}
                            {job &&
                              job?.pipeline.includes(pipeline.REPAIRS) &&
                              invoices?.finalPayment && (
                                <RepairsInvoice
                                  jobId={jobId}
                                  fetchJobData={fetchJobData}
                                  finalPayment={invoices.finalPayment}
                                  canGenerateFinalPayment={job.can_generate_final_payment}
                                  handleInvoiceForRepairs={handleInvoiceForRepairs}
                                  configNotChosen={productConfigs?.some(
                                    (config) => config.chosen_config === null
                                  )}
                                />
                              )}
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </div>
              <div className="container"></div>
              <div className="container">
                <Accordion
                  className="rounded-lg shadow-[0_2px_10px] shadow-black/5 mb-2"
                  type="single"
                  collapsible
                >
                  <AccordionItem value="item-1" className="accordian !border-none">
                    <AccordionTrigger
                      className="accordian-btn gap-2 bg-primary-highlight py-3 px-4 data-[state=open]:rounded-t-lg data-[state=closed]:rounded-lg text-black text-sm"
                      onClick={() =>
                        setShowActivitiesAndDocs(
                          (prevShowActivityAndDocs) => !prevShowActivityAndDocs
                        )
                      }
                    >
                      {showActivitiesAndDocs ? "Hide" : "Show"} Documents and Activities
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 px-3 pb-3 border-2 border-[#E5E7EB] rounded-b-md">
                      {showActivitiesAndDocs && (
                        <div className="py-4">
                          <div className="container">
                            <div className="border rounded-md px-6">
                              <Activities filterType="job" filterId={jobId} />
                            </div>
                          </div>
                        </div>
                      )}
                      {showActivitiesAndDocs && (
                        <div className="py-4">
                          <div className="container">
                            <div className="border rounded-md px-6 max-smx:px-0">
                              <DocumentsTable filterType="job" filterId={jobId} />
                            </div>
                          </div>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
              {job?.assigned_Driver && (
                <Sheet
                  className="max-w-4xl !p-0 rounded-t-xl smx:!rounded-xl !overflow-hidden top-auto !w-full !max-w-full smx:!w-[420px] min-[1540px]:!w-[610px] min-[1540px]:!max-w-[610px] smx:!max-w-[420px] !h-[calc(100vh-179px)] smx:!h-[calc(100%-16px)] smx:!my-auto smx:!mr-2 max-smx:data-[state=closed]:!slide-out-to-bottom max-smx:data-[state=open]:!slide-in-from-bottom"
                  open={viewTechInfoOpen}
                  setOpen={setViewTechInfoOpen}
                >
                  <ViewTechInfo
                    assigned_Driver={job.assigned_Driver}
                    setOpenEditJob={setOpenEditJob}
                  />
                </Sheet>
              )}
            </div></>)}



    </>


  );
};
export default JobDetails;
