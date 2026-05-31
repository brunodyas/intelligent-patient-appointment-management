"use client";
import { useEffect, useState } from 'react'
import { useParams } from "next/navigation";
import {
    Selectbox,
    Title
} from "@/components/atomics";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@relume_io/relume-ui";
import { XIcon } from "@/assets/icons";
import {
    ProductConfigForm
} from "@/interface/manufacturers";
import {
    get_options,
    get_product_types,
    get_products,
    get_styles,
    get_vendors,
    validate,
} from "@/services/productConfig";
import { ConfigValue, ListOption } from "@/interface/productConfig";
import ProductCollapseField from "./ProductCollapseField";
import AtomicButton from "@/components/atomics/Button";
import {
    createConfig,
} from "@/services/config";
import { Input } from "@/components/atomics";
import Spinner from "@/components/atomics/Spinner";

const ProductConfiguratorForm = ({ openModalProduct, setOpenModalProduct, setFetchData }: { openModalProduct: boolean; setOpenModalProduct: React.Dispatch<React.SetStateAction<boolean>>; setFetchData?: React.Dispatch<React.SetStateAction<boolean>> }) => {

    const DEFAULT_VALUE = { name: "Select Option", id: null, disabled: true };
    
    const { jobId } = useParams<{ jobId: string }>() ?? {jobId: ''};

    const [configName, setConfigName] = useState("");
    const [isFormValidated, setIsFormValidated] = useState(false);
    const [isProductConfiguratorLoading, setIsProductConfiguratorLoading] =
        useState(false);
    const [formFieldData, setFormFieldData] = useState<any>();
    const [configSelectedValue, setConfigSelectedValue] = useState({
        product_type: null,
        vendor: null,
        product: null,
        style: null,
    });
    const [productConfigFormData, setProductConfigFormData] =
        useState<ProductConfigForm>({
            product_type: [],
            vendor: [],
            product: [],
            style: [],
        });
    const [pricingAccordian, setPricingAccordion] = useState<boolean>(false);
    const [selectedProductConfigFormData, setSelectedProductConfigFormData] =
        useState<any>({
            product_type: null,
            vendor: null,
            product: null,
            style: null,
        });

    useEffect(() => {
        if (openModalProduct) {
            clearAllStates();
            getProductType();
        }
    }, [openModalProduct])

    const clearAllStates = () => {
        setFormFieldData({});
        setConfigSelectedValue({
            product_type: null,
            vendor: null,
            product: null,
            style: null,
        });
        setProductConfigFormData({
            product_type: [],
            vendor: [],
            product: [],
            style: [],
        });
        setConfigName("")
    };

    const configValueSelect = (key: string, id: number | null, value: string) => {
        setConfigSelectedValue((e) => {
            return { ...e, [key]: id };
        });
        setSelectedProductConfigFormData((e: any) => {
            return { ...e, [key]: value };
        });
    };

    const getProductType = async () => {
        try {
            setIsFormValidated(false);
            setIsProductConfiguratorLoading(true);
            const productType: ListOption[] | any = await get_product_types();
            productType?.unshift(DEFAULT_VALUE);
            setProductConfigFormData((e) => {
                return { ...e, product_type: productType };
            });
        } catch (error) {
            console.error("err", error);
        } finally {
            setIsProductConfiguratorLoading(false);
        }
    };

    const getVendor = async (data: ConfigValue) => {
        try {
            setIsFormValidated(false);
            setIsProductConfiguratorLoading(true);
            const vendors: ListOption[] | any = await get_vendors(data);
            vendors?.unshift(DEFAULT_VALUE);
            return vendors;
        } catch (error) {
            console.error("err", error);
        } finally {
            setIsProductConfiguratorLoading(false);
        }
    };

    const getConfigProduct = async (data: ConfigValue) => {
        try {
            setIsFormValidated(false);
            setIsProductConfiguratorLoading(true);
            const products: ListOption[] | any = await get_products(data);
            products?.unshift(DEFAULT_VALUE);
            return products;
        } catch (error) {
            console.error("err", error);
        } finally {
            setIsProductConfiguratorLoading(false);
        }
    };

    const getStyles = async (data: ConfigValue) => {
        try {
            setIsFormValidated(false);
            setIsProductConfiguratorLoading(true);
            const styles: ListOption[] | any = await get_styles(data);
            styles?.unshift(DEFAULT_VALUE);
            return styles;
        } catch (error) {
            console.error("err", error);
        } finally {
            setIsProductConfiguratorLoading(false);
        }
    };

    const getOptions = async (data: ConfigValue) => {
        try {
            setIsFormValidated(false);
            setIsProductConfiguratorLoading(true);
            const formOptions = await get_options(data);
            return formOptions;
        } catch (error) {
            console.error("err", error);
        } finally {
            setIsProductConfiguratorLoading(false);
        }
    };

    const handleSelectValue = (field: string, value: any) => {
        switch (field) {
            case "product_type":
                handleSelectProductType(value);
                break;
            case "vendor":
                handleSelectVendor(value);
                break;
            case "product":
                handleSelectProduct(value);
                break;
            case "style":
                handleSelectStyle(value);
                break;
        }
    };

    const handleSelectProductType = async (selected: ListOption) => {
        if (selected?.id) {
            configValueSelect("product_type", selected?.id, selected?.name);
            const vendorOptions = await getVendor({ product_type: selected?.id });
            setFormFieldData({});
            setProductConfigFormData((e) => {
                return { ...e, vendor: vendorOptions, product: [], style: [] };
            });
        } else {
            configValueSelect("product_type", null, '');
            setProductConfigFormData((e) => {
                return { ...e, vendor: [], product: [], style: [] };
            });
            setFormFieldData({});
        }
    };

    const handleSelectVendor = async (selected: ListOption) => {
        if (selected?.id) {
            configValueSelect("vendor", selected?.id, selected?.name);
            const productOptions = await getConfigProduct({
                product_type: configSelectedValue?.product_type,
                vendor: selected?.id,
            });
            setFormFieldData({});
            setProductConfigFormData((e) => {
                return { ...e, product: productOptions, style: [] };
            });
        } else {
            configValueSelect("vendor", null, '');
            setProductConfigFormData((e) => {
                return { ...e, product: [], style: [] };
            });
            setFormFieldData({});
        }
    };

    const handleSelectProduct = async (selected: ListOption) => {
        if (selected?.id) {
            configValueSelect("product", selected?.id, selected?.name);
            const styleOptions = await getStyles({
                product_type: configSelectedValue?.product_type,
                vendor: configSelectedValue?.vendor,
                product: selected?.id,
            });
            setFormFieldData({});
            setProductConfigFormData((e) => {
                return { ...e, style: styleOptions };
            });
        } else {
            configValueSelect("product", null, '');
            setProductConfigFormData((e) => {
                return { ...e, style: [] };
            });
            setFormFieldData({});
        }
    };

    const handleSelectStyle = async (selected: ListOption) => {
        if (selected?.id) {
            configValueSelect("style", selected?.id, selected?.name);
            setPricingAccordion(false);
            const styleOptions: any = await getOptions({
                style_id: selected?.id,
            });
            setFormFieldData(styleOptions?.json);
        } else {
            setFormFieldData({});
            configValueSelect("style", null, '');
        }
    };

    const callValidate = async (data: ConfigValue) => {
        try {
            setIsFormValidated(false);
            setIsProductConfiguratorLoading(true);
            const formOptions = await validate(data);
            return formOptions;
        } catch (error) {
            console.error("err", error);
        } finally {
            setIsProductConfiguratorLoading(false);
        }
    };

    const handleValidate = async (key: string, value: string | number | null) => {
        const prevJsonData = formFieldData?.pricing
            ? formFieldData
            : formFieldData?.groups;
        try {
            if (value) {
                setIsFormValidated(false);
                setIsProductConfiguratorLoading(true);
                const payload = {
                    style_id: configSelectedValue?.style,
                    key,
                    value,
                    json_data: { json: prevJsonData },
                };

                const validateResponse: any = await callValidate(payload);
                if (validateResponse && validateResponse?.groups) {
                    setIsFormValidated(true);
                    setIsProductConfiguratorLoading(false);
                    setFormFieldData(validateResponse);
                }
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleSubmitProductConfig = async (e: any) => {
        e.preventDefault();
        try {
            setIsProductConfiguratorLoading(true);
            const payload = {
                config_name: configName,
                linked_job: jobId,
                product_type: configSelectedValue?.product_type,
                vendor: configSelectedValue?.vendor,
                product: configSelectedValue?.product,
                style: configSelectedValue?.style,
                chosen_config: {
                    style_id: configSelectedValue?.style,
                    json_data: { json: formFieldData },
                },
            };
            await createConfig(payload);
            setOpenModalProduct(false);
            if (setFetchData) {
                setFetchData((e: any) => !e);
            }


        } catch (error) {
            console.error("err", error);
        } finally {
            setIsProductConfiguratorLoading(false);
            setOpenModalProduct(false);
        }
    };
    return (
        <>
            <div className={`w-full bg-white flex-col px-4 sm:px-5 smx:px-6 md:px-7 lg:px-8 py-6`}>
                <main className="!mb-7 !mt-4 flex flex-col items-center justify-center">
                    <nav className="w-full flex items-center justify-between mb-3 smx:mb-7">
                        <Title size='sm' variant={"primary"} className="flex justift-start max-[360px]:!w-[70%]">
                            Create New Product Configuration
                        </Title>
                        <button onClick={() => setOpenModalProduct(false)} aria-label='Close' className="absolute right-4 min-[480px]:right-5 min-[640px]:right-6 md:right-7 top-[42px]">
                            <XIcon className='h-6 w-6 text-neutral-50' />
                        </button>

                    </nav>
                    {isProductConfiguratorLoading ? (
                        <div className="bg-white sticky top-0 flex z-10 py-2  items-center justify-end">
                            <Spinner />
                        </div>
                    ) : null}
                    <form onSubmit={handleSubmitProductConfig} className='w-full'>
                        <nav className="relative w-fit">
                            <div className="absolute left-1/2 top-5 -z-10 h-0.5 w-10/12 max-md:w-9/12 max-sm:w-8/12 -translate-x-1/2 bg-neutral-40"></div>
                        </nav>
                        <div className="w-full mb-7  mt-4">
                            <div className="grid w-full grid-cols-1 gap-6">
                                <Input
                                    id="config_name"
                                    variant="default"
                                    value={configName}
                                    label="Config Name"
                                    placeholder="Enter Config Name"
                                    handleChange={(e) => {
                                        setConfigName(e.target.value);
                                    }}
                                    defaultValue={configName}
                                    isRequired={true}
                                />
                                {Object.keys(productConfigFormData).map((modalField, index) => {
                                    const typedField = modalField as keyof ProductConfigForm;
                                    const label = modalField
                                        .replace("_", " ")
                                        .replace(/\b\w/g, (char) => char.toUpperCase());
                                    return (
                                        <Selectbox
                                            key={index}
                                            label={label}
                                            isDisabled={!productConfigFormData?.[typedField]?.length}
                                            datas={
                                                productConfigFormData?.[typedField]?.length
                                                    ? productConfigFormData[typedField]
                                                    : [DEFAULT_VALUE]
                                            }
                                            selectedNow={true}
                                            handleChange={(selected: any) => {
                                                handleSelectValue(typedField, selected);
                                            }}
                                        />
                                    );
                                })}
                            </div>
                            {formFieldData?.groups?.length && (
                                <div className="w-full">
                                    {formFieldData?.groups
                                        ?.sort((a: any, b: any) => a?.sequence - b?.sequence)
                                        .map((group: any, index: number) => {
                                            const isGroupVisible = group?.options?.filter(
                                                (option: any) => option.is_visible
                                            );
                                            return isGroupVisible?.length ? (
                                                <div key={`${group.name}-${configSelectedValue?.style}`} className="grid grid-cols-1 gap-6 mt-[22px]">
                                                    {group?.options?.length &&
                                                        group?.options
                                                            ?.sort(
                                                                (a: any, b: any) =>
                                                                    a?.sequence - b?.sequence
                                                            )
                                                            .map((field: any, index: number) => (
                                                                <ProductCollapseField
                                                                    inputField={field}
                                                                    key={index}
                                                                    handleValidate={handleValidate}
                                                                />
                                                            ))}
                                                </div>
                                            ) : null;
                                        })}
                                </div>
                            )}
                            {formFieldData?.pricing && (
                                <div key={`pricing-${configSelectedValue?.style}`} className="mt-5">
                                    <h5 className={'text-sm font-semibold text-neutral-100'}>
                                        Pricing
                                    </h5>
                                    <Accordion
                                        className="rounded-lg shadow-[0_2px_10px] shadow-black/5 mt-2"
                                        type="single"
                                        defaultValue={pricingAccordian ? "item-1" : ""}
                                        collapsible
                                        onValueChange={(value) => {
                                            if (value === "item-1") {
                                                setPricingAccordion(true);
                                            } else {
                                                setPricingAccordion(false)
                                            }
                                        }}
                                    >
                                        <AccordionItem value="item-1" className="accordian !border-none">
                                            <AccordionTrigger className="accordian-btn gap-2 !bg-background-primaryLight py-3 px-4 data-[state=open]:rounded-t-lg data-[state=closed]:rounded-lg ">
                                                <div className="flex items-center w-full justify-between gap-2">
                                                    <div className="flex items-center">
                                                        <span className="font-medium">MSRP:</span>
                                                        <span className="underline text-xs min-[400px]:text-sm min-[520px]:text-base text-[#858585] font-medium cursor-pointer pl-2 w-fit text-left"
                                                        >
                                                            {`${pricingAccordian ? "Hide" : "Show"} Price Breakdown`}
                                                        </span>
                                                    </div>
                                                    <span className="text-nowrap">
                                                        {`$ ${formFieldData?.pricing?.total_price[0]?.value}`}
                                                    </span>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="pt-2 px-3 pb-3 border-2 border-[#E5E7EB] rounded-b-md">
                                                {formFieldData?.pricing?.price_lines.map((data: any, index: number) => {
                                                    return (
                                                        <div key={index} className="flex justify-between py-1.5 text-sm">
                                                            <div>{data.name}</div>
                                                            <div>{data.value ? `$ ${data.value}` : "-"}</div>
                                                        </div>

                                                    )
                                                })}
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                </div>)
                            }
                        </div>
                        <footer className="flex justify-end gap-3">
                            <AtomicButton
                                size="md"
                                type="submit"
                                variant={isFormValidated ? "primary-bg" : "disabled-bg"}
                                disabled={!isFormValidated || isProductConfiguratorLoading}
                            >
                                Submit
                            </AtomicButton>
                        </footer>
                    </form>

                </main>
            </div>
        </>

    )
}

export default ProductConfiguratorForm