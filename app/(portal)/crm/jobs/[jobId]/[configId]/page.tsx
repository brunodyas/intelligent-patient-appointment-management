"use client";

import ProductCollapseField from "@/components/atomics/ProductCollapseField";
import Route from "@/components/atomics/Route";
import ChosenConfig from "@/components/templates/crm/jobs/ChosenCofig";
import ConfigRecording from "@/components/templates/crm/jobs/ConfigRecording";
import { routes } from "@/constants/routes";
import { CRMConfigByIdResponse } from "@/interface/config";
import { getConfigById } from "@/services/config";
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
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useJune } from "@/hooks/useJune";

const ConfigDetails = () => {
  const router = useRouter();
  const { configId } = useParams<{ configId: string }>() ?? {configId: ''};
  const [pricingAccordian, setPricingAccordion] = useState<boolean>(false);

  const [config, setConfig] = useState<any>();
  const analytics = useJune();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getConfigById(parseInt(configId));
        setConfig(response);
      } catch (e) {
        throw e;
      }
    };
    fetchData();
  }, [configId]);

  const configInfo = {
    "Config Name": config?.config_name || "--",
    "Product Type": config?.product_type?.name || "--",
    "Vendor": config?.vendor?.name || "--",
    "Product": config?.product?.name || "--",
    "Style": config?.style?.name || "--",
  };

  return (
    <div key={configId}>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem
            className="text-neutral-500 hover:cursor-pointer bg-none border-0"
            onClick={() => {
              router.back();
            }}
          >
            Job
          </BreadcrumbItem>
          <BreadcrumbSeparator className="text-[#707070]" />
          <BreadcrumbItem>
            <BreadcrumbLink className="text-neutral-black font-medium cursor-auto">
              {config?.config_name}
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="py-4">
        <div className="container w-full">
          <div className="border rounded-md px-6 py-5 max-sm:p-3">
            <p className="font-semibold text-md sm:text-lg">
              Config Information
            </p>
            <div className="grid gap-4 grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1 py-5 text-sm">
              {Object.entries(configInfo).map(([key, value]) => (
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
      {config?.chosen_config?.json_data?.json?.groups?.length && (
        <div className="w-full">
          {config?.chosen_config?.json_data?.json?.groups
            ?.sort((a: any, b: any) => a?.sequence - b?.sequence)
            .map((group: any, index: number) => {
              const isGroupVisible = group?.options?.filter(
                (option: any) => option.is_visible
              );
              return isGroupVisible?.length ? (
                <div
                  key={`${group.name}-${config?.id}`}
                  className="grid grid-cols-1 gap-6 mt-[22px]"
                >
                  {group?.options?.length &&
                    group?.options
                      ?.sort((a: any, b: any) => a?.sequence - b?.sequence)
                      .map((field: any, index: number) => (
                        <ProductCollapseField
                          inputField={field}
                          key={index}
                          handleValidate={() => { }}
                          isView={true}
                        />
                      ))}
                </div>
              ) : null;
            })}
        </div>
      )}
      {config?.chosen_config?.json_data?.json?.pricing && (
        <div key={`pricing`} className="mt-5">
          <h5 className={"text-sm font-semibold text-neutral-100"}>Pricing</h5>
          <Accordion
            className="rounded-lg shadow-[0_2px_10px] shadow-black/5 mt-2"
            type="single"
            defaultValue={pricingAccordian ? "item-1" : ""}
            collapsible
            onValueChange={(value) => {
              if (value === "item-1") {
                setPricingAccordion(true);
              } else {
                setPricingAccordion(false);
              }
            }}
          >
            <AccordionItem value="item-1" className="accordian !border-none">
              <AccordionTrigger className="accordian-btn gap-2 !bg-background-primaryLight py-3 px-4 data-[state=open]:rounded-t-lg data-[state=closed]:rounded-lg ">
                <div className="flex items-center w-full justify-between gap-2">
                  <div className="flex items-center">
                    <span className="font-medium">MSRP:</span>
                    <span className="underline text-xs min-[400px]:text-sm min-[520px]:text-base text-[#858585] font-medium cursor-pointer pl-2 w-fit text-left">
                      {`${pricingAccordian ? "Hide" : "Show"} Price Breakdown`}
                    </span>
                  </div>
                  <span className="text-nowrap">
                    {`$ ${config?.chosen_config?.json_data?.json?.pricing?.total_price[0]?.value}`}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-2 px-3 pb-3 border-2 border-[#E5E7EB] rounded-b-md">
                {config?.chosen_config?.json_data?.json?.pricing?.price_lines.map(
                  (data: any, index: number) => {
                    return (
                      <div
                        key={index}
                        className="flex justify-between py-1.5 text-sm"
                      >
                        <div>{data.name}</div>
                        <div>{data.value ? `$ ${data.value}` : "-"}</div>
                      </div>
                    );
                  }
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}
    </div>
  );
};

export default ConfigDetails;
