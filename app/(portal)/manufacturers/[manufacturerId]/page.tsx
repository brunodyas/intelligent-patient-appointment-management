"use client";

import React, { useEffect, useState, FC, Fragment } from "react";
import { useParams, useRouter } from "next/navigation";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@relume_io/relume-ui";
import { MdOutlineFileDownload } from "react-icons/md";
import { getProduct } from "@/services/manufacturers";
import { AddproductsResponse } from "@/interface/manufacturers";
import { Button } from "@/components/atomics";
import formatDate from "@/utils/formatDate";
import { routes } from "@/constants/routes";
import Route from "@/components/atomics/Route";
import PriceTableAbbrevations from "@/components/templates/manufacturers/PriceTableAbbrevations";
import { FormatPrice } from "@/components/templates/manufacturers/FormatPrice";
import { useJune } from "@/hooks/useJune";

const ManufacturerDetails: FC = () => {
  const router = useRouter();
  const { manufacturerId } = useParams<{ manufacturerId: string }>() ?? {manufacturerId: ''};

  const [manufacturer, setManufacturer] = useState<AddproductsResponse | null>(
    null
  );
  const [prices, setPrices] = useState<string[][]>([]);
  const analytics = useJune();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getProduct(+manufacturerId);
        analytics?.track("getProduct");
        setManufacturer(response);
        const formattedPrices = FormatPrice(response?.price_table);
        setPrices(formattedPrices);
      } catch (e) {
        console.error(e);
      }
    };

    fetchData();
  }, [manufacturerId]);

  const detailFields = [
    { fieldName: "Product Name", fieldValue: manufacturer?.name?.toString() },
    { fieldName: "Colors", fieldValue: manufacturer?.color?.join(", ") },
    { fieldName: "Features", fieldValue: manufacturer?.features?.join(", ") },
    {
      fieldName: "Model Number",
      fieldValue: manufacturer?.model_number?.toString(),
    },
    {
      fieldName: "Blind Type",
      fieldValue: manufacturer?.blind_type?.toString(),
    },
    {
      fieldName: "Added By",
      fieldValue: manufacturer?.added_by?.name?.toString(),
    },
    {
      fieldName: "Created At",
      fieldValue: manufacturer && formatDate(manufacturer?.createdAt),
    },
  ].filter(({ fieldValue }) => fieldValue);

  const renderDetailFields = (
    fields: { fieldName: string; fieldValue?: string | null }[],
    isAddon: boolean
  ) =>
    fields.map(({ fieldName, fieldValue }) => (
      <div className={`flex ${isAddon ? "py-1" : "py-4"}`} key={fieldName}>
        <p className="text-[#333333b3] mr-5 flex-shrink-0 text-sm">
          {fieldName}
        </p>
        <p className="w-3/4 break-words text-sm">{fieldValue}</p>
      </div>
    ));

  const categories = [
    {
      name: "Product Information",
      page: (
        <div className="border rounded-md w-3/4 max-md:w-full max-md:px-2 px-6 m-auto shadow-small">
          <p className="mt-5 mx-5 max-sm:mx-2 font-semibold text-lg sm:text-xl">
            Product Information
          </p>
          {!manufacturer && (
            <p className="text-center pb-3">No Product Information</p>
          )}
          <div className="grid gap-4 grid-cols-2 py-5 px-8 max-sm:px-3 max-md:grid-cols-1">
            {manufacturer ? (
              <Fragment>
                {renderDetailFields(detailFields, false)}
                {manufacturer?.product_guide ? (
                  <Button
                    variant="primary-outline"
                    onClick={() => {
                      window.open(manufacturer?.product_guide || "", "_blank");
                    }}
                    size="md"
                  >
                    <MdOutlineFileDownload size={22} />
                    Product Guide
                  </Button>
                ) : (
                  <></>
                )}
              </Fragment>
            ) : (
              <></>
            )}
          </div>
        </div>
      ),
    },
    {
      name: "Add-ons",
      page: (
        <div className="border rounded-md w-3/4 max-md:w-full max-md:px-2 px-6 m-auto shadow-small">
          <p className="mt-5 mx-5 max-sm:mx-2 font-semibold text-lg sm:text-xl">
            Add-ons
          </p>
          {!manufacturer?.addons?.length && (
            <p className="text-center pb-3">No Addons</p>
          )}
          <div className="grid gap-4 grid-cols-2 py-5 px-8 max-sm:px-3 max-md:grid-cols-1">
            {manufacturer?.addons?.length ? (
              manufacturer?.addons.map((addon, index) => (
                <div key={index}>
                  <p className="text-neutral-50 text-medium">
                    Add-on {index + 1}
                  </p>
                  {renderDetailFields(
                    [
                      { fieldName: "Name", fieldValue: addon.name },
                      { fieldName: "Price", fieldValue: addon.price },
                      {
                        fieldName: "Description",
                        fieldValue: addon.description,
                      },
                      {
                        fieldName: "Colors",
                        fieldValue: addon?.addon_color
                          ?.map((item) => item)
                          .join(", "),
                      },
                    ],
                    true
                  )}
                </div>
              ))
            ) : (
              <></>
            )}
          </div>
        </div>
      ),
    },
    {
      name: "Price Table",
      page: (
        <div className="border rounded-md w-3/4 max-md:w-full max-md:px-2 px-6 m-auto shadow-small overflow-auto max-h-[65vh]">
          <div className="mx-5 max-sm:mx-2 pb-5">
            <p className="my-5 font-semibold text-lg">Price table</p>
            <div className="flex flex-wrap gap-4 pb-5">
              <PriceTableAbbrevations />
            </div>
            {prices.length ? (
              <div className="border border-primary-main rounded-lg shadow overflow-auto w-max">
                <table className="text-center ">
                  <thead className="text-primary-main bg-[#c63d7f1a]">
                    <tr>
                      {prices[0]?.map((width, index) => (
                        <th
                          key={index}
                          className="min-w-24 min-h-14 max-w-24  font-medium py-2 first:bg-gray-100 hover:bg-gray-100"
                        >
                          {width} {index && width ? "in" : ""}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {prices.slice(1)?.map((priceValues, index) => (
                      <tr key={index}>
                        {priceValues?.map((price, index) => (
                          <td
                            key={index}
                            className={`min-w-24 min-h-14  max-w-24  py-2 first:bg-[#c63d7f1a] first:text-primary-main first:font-medium hover:bg-gray-100`}
                          >
                            {index && price ? "$" : ""}
                            {price} {!index && price ? "in" : ""}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center">No Price Table</p>
            )}
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="h-screen w-full justify-center pt-10 max-md:px-3">
      <div className="flex justify-between">
        <div className="flex items-center gap-2 mb-3 mt-4 smx:flex ">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <Route
                  route={routes.manufacturers}
                  linkClassName="text-primary-main font-medium hover:cursor-pointer"
                >
                  Manufacturers
                </Route>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-primary-main" />
              <BreadcrumbItem>
                <BreadcrumbLink className="text-primary-main font-semibold cursor-auto">
                  {manufacturer?.name}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <Button
          size="md"
          variant="primary-bg"
          onClick={() => router.push(routes.manufacturers)}
        >
          <Route route={routes.manufacturers} linkClassName="">
            Back
          </Route>
        </Button>
      </div>

      <div className="w-full">
        <TabGroup className="w-full">
          <TabList className="flex flex-wrap gap-4 justify-center">
            {categories.map(({ name }) => (
              <Tab
                key={name}
                className="text-primary-main rounded-lg py-1 px-3 text-sm/6 font-semibold focus:outline-none data-[selected]:bg-primary-surface data-[hover]:bg-primary-highlight data-[selected]:data-[hover]:bg-primary-surface data-[focus]:outline-primary-main data-[focus]:outline-black !h-10"
              >
                {name}
              </Tab>
            ))}
          </TabList>
          <TabPanels className="mt-3">
            {categories.map(({ name, page }) => (
              <TabPanel key={name} className="rounded-xl bg-white/5 p-3">
                {page}
              </TabPanel>
            ))}
          </TabPanels>
        </TabGroup>
      </div>
    </div>
  );
};

export default ManufacturerDetails;
