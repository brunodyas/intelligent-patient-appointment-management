"use client";
import {
  Button,
  Input,
  MultipleSelectBox,
  Selectbox,
  Alerts,
  Title
} from "@/components/atomics";
import UI8Table from "@/components/UI8Table";
import { CheckIcon, PlusIcon, XIcon } from "@/assets/icons";
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TiMinus } from "react-icons/ti";
import { useJune } from "@/hooks/useJune";

import {
  colorsData,
  featuresData,
  blindData,
  manufacturerFileTypes,
  initializeManufacturers,
} from "@/data";
import { ModalStep } from "@/types";
import {
  addProduct,
  deleteProduct,
  getProducts,
  getProduct,
  editProduct,
  listFranchises,
} from "@/services/manufacturers";
import {
  GetProductsResponse,
  Option,
  ProductForm,
} from "@/interface/manufacturers";
import { useAuth } from "@/context/auth";
import { size } from "@/constants/constants";
import PriceTableAbbrevations from "../templates/manufacturers/PriceTableAbbrevations";
import { FormatPrice } from "../templates/manufacturers/FormatPrice";;
import ProductConfiguratorForm from "../atomics/ProductConfiguratorForm";
import useUserRoles from "@/hooks/useUserRoles";

interface SelectForm {
  label: string;
  value?: null | number;
  disable?: boolean;
}

const ManufacturersPage = () => {
  const { user } = useAuth();
  const { isSuperAdmin: isSuper, isCustomerCare, isCustomerCareManager } = useUserRoles();

  const isSuperAdmin = isSuper || isCustomerCare || isCustomerCareManager;

  const [openModalAddProduct, setOpenModalAddProduct] = useState(false);
  const [openModalProduct, setOpenModalProduct] = useState(false);
  const [activeState, setActiveState] = useState(1);
  const [openModalDelete, setOpenModalDelete] = useState(false);
  const [productIdToDelete, setProductIdToDelete] = useState<number | null>(
    null
  );
  const [openAlertsDelete, setOpenAlertsDelete] = useState(false);
  const [fetchData, setFetchData] = useState(true);
  const [openSuccess, setOpenSuccess] = useState(false);
  const [isEdit, setIsEdit] = useState(0);
  const [modalHeading, setModalHeading] = useState("");
  const [addProductFormData, setAddProductFormData] = useState<ProductForm>(
    initializeManufacturers
  );
  const [dataFranchises, setDataFranchises] = useState<any>();
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [file, setFile] = useState<File | undefined>();
  const [editFile, setEditFile] = useState("");
  const [manufacturersTableData, setManufacturersTableData] =
    useState<GetProductsResponse>();
  const [prices, setPrices] = useState([
    ["", ""],
    ["", ""],
  ]);
  const [addonsShowFields, setAddonsShowFields] = useState<Option[]>([
    { name: "Select Field", disabled: true },
    { name: "addon_color", hide: true },
  ]);
  const [isPricingModalView, setIsPricingModalView] = useState(false);
  const [openAddPriceModal, setOpenAddPriceModal] = useState(false);
  const [search, setSearch] = useState("")
  const [hasMore, setHasMore] = useState(true);
  const [paginationPage, setPaginationPage] = useState(1);
  const timeoutRef = useRef<any>(null);
  const analytics = useJune();

  useEffect(() => {
    fetchData && fetchManufacturers();
  }, [fetchData]);

  useEffect(() => {
    if (openModalAddProduct && !isEdit) {
      setAddProductFormData(initializeManufacturers);
      setPrices([
        ["", ""],
        ["", ""],
      ]);
      setFile(undefined);
    }
  }, [openModalAddProduct, isEdit]);

  useEffect(() => {
    const fetchData = async (page: number) => {
      try {
        if (isSuperAdmin) {
          const response: any = await listFranchises(page);
          analytics?.track("listFranchises");
          if (!response.next) {
            setHasMore(false);
          } else {
            setHasMore(true);
          }
          setDataFranchises((prev: any) => [...(page !== 1 ? prev : []), ...response.results]);
        }
      } catch (e) {
        throw e;
      }
    };
    fetchData(paginationPage);
  }, [isSuperAdmin, paginationPage]);

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {

      if (!hasMore) return;

      const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;

      if (Math.ceil(scrollTop + clientHeight) >= scrollHeight) {
        setPaginationPage((prevPage) => prevPage + 1);
      }
    },
    [hasMore]);


  const isPriceAdded = useMemo(
    () =>
      prices.some((price, index) => {
        if (index !== 0) {
          const p = price.some((p, pIndex) => {
            if (pIndex !== 0) {
              return +p > 0;
            }
          });
          return p;
        }
      }),
    [prices]
  );

  const handleModelOpen = () => {
    setOpenModalProduct(true);
  };

  const checkNameAndPrice = useMemo(() => {
    return (
      addProductFormData.name &&
      isPriceAdded &&
      addProductFormData.blind_type?.name &&
      (isSuperAdmin ? addProductFormData?.franchise?.value !== null : true)
    );
  }, [addProductFormData]);

  const fetchManufacturers = async (searchValue?: string) => {
    try {
      const response = await getProducts(+page, searchValue);
      analytics?.track("getProducts");
      setManufacturersTableData(response);
      setTotalPages(Math.ceil(response.count / size));
      setFetchData(false);
    } catch (e) {
      throw e;
    }
  };

  const handleSearchChange = useCallback((searchValue: string) => {
    if (timeoutRef) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      fetchManufacturers(searchValue)
    }, 2000);
    setSearch(searchValue)
  }, [])

  const franchises = useMemo(() => {
    let franchises: SelectForm[] = [{ label: "Select Franchise", value: null }];
    dataFranchises &&
      dataFranchises.map((item: any) => {
        franchises.push({ label: item.franchise_name, value: item.id });
      });
    return franchises;
  }, [dataFranchises]);



  function convertArrayToObject(arr: (number | string)[][]) {
    const result = [];

    const widths = arr[0].slice(1);
    const heights = arr.slice(1).map((row) => row[0]);

    for (let i = 1; i < arr.length; i++) {
      for (let j = 1; j < arr[i].length; j++) {
        const height = heights[i - 1];
        const width = widths[j - 1];
        const price = arr[i][j];

        if (height && width) {
          result.push({
            width: Number(width),
            height: Number(height),
            price: price ? Number(price) : null,
          });
        }
      }
    }
    return result;
  }

  const handleSubmit = async () => {
    try {
      const body = {
        ...addProductFormData,
        addons:
          addProductFormData?.addons?.map((item) => ({
            ...item,
            addon_color: item.addon_color
              .map((item) => item.name)
              .filter((item) => item),
          })) || [],

        blind_type: addProductFormData?.blind_type?.name || "",
        color:
          addProductFormData?.color?.map((item: Option) => item?.name) || [],
        features:
          addProductFormData?.features?.map((item: Option) => item?.name) || [],
        price_table: convertArrayToObject(prices),
      };
      const formData = new FormData();
      formData.append("name", body.name);
      formData.append("color", JSON.stringify(body.color));
      formData.append("features", JSON.stringify(body.features));
      if (isSuperAdmin) {
        formData.append("franchise_id", JSON.stringify(body.franchise?.value));
      }
      formData.append("model_number", body.model_number);
      formData.append("blind_type", body.blind_type);
      formData.append("addons", JSON.stringify(body.addons));
      formData.append("price_table", JSON.stringify(body.price_table));
      if (file) {
        formData.append("product_guide", file);
      }

      isEdit ? await editProduct(formData, isEdit) : await addProduct(formData);
      analytics?.track(isEdit ? "editProduct" : "addProduct");

      setOpenModalAddProduct(false);
      setActiveState(1);
      setOpenSuccess(true);
      setModalHeading(isEdit ? "edited" : "added");
      setAddProductFormData(initializeManufacturers);
      setPrices([
        ["", ""],
        ["", ""],
      ]);
      setFile(undefined);
      setFetchData(true);
      setEditFile("");
    } catch (e) {
      console.error(e);
    }
  };

  const handleEditButton = async (id: number) => {
    try {
      const response = await getProduct(id);
      analytics?.track("getProduct");
      setAddProductFormData({
        name: response.name,
        color: response?.color.map((color) => ({
          name: color,
        })),
        features: response?.features.map((feature) => ({
          name: feature,
        })),
        price_table: response?.price_table,
        model_number: response?.model_number,
        blind_type: { name: response.blind_type },
        addons: response.addons.map((addon) => ({
          ...addon,
          addon_color: addon.addon_color.map((value) => ({ name: value })),
        })),
      });
      if (response?.product_guide) {
        setEditFile("File already exists");
      }
      const formattedPrices = FormatPrice(response?.price_table);
      setPrices(formattedPrices);
      setOpenModalAddProduct(true);
      setIsEdit(response?.id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteProduct(id);
      analytics?.track("deleteProduct");
      setProductIdToDelete(null);
      setOpenModalDelete(false);
      setOpenAlertsDelete(true);
      setFetchData(true);
    } catch (e) {
      console.error(e);
    }
  };

  const handleFileChange = (file: File | null) => {
    setFile(file!);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setAddProductFormData((prevState) => ({
      ...prevState,
      [name]:
        name != "price_per_sq_ft"
          ? value
          : formattedPriceUptoTwoDecimals(value),
    }));
  };

  const handleBlindTypeChange = (value: Option) => {
    setAddProductFormData((prevForm) => ({
      ...prevForm,
      blind_type: value,
    }));
  };

  const handleFranchiseChange = (value: any) => {
    setAddProductFormData((prevForm) => ({
      ...prevForm,
      franchise: value,
    }));
  };

  const handleColorChange = (value: Option[]) => {
    setAddProductFormData((prevState) => ({
      ...prevState,
      color: value,
    }));
  };

  const handleFeaturesChange = (value: Option[]) => {
    setAddProductFormData((prevState) => ({
      ...prevState,
      features: value,
    }));
  };

  const formattedPriceUptoTwoDecimals = (input: string) => {
    const cleanedInput = input.replace(/[^0-9.]/g, "");
    const parts = cleanedInput.split(".");

    if (parts.length > 2) {
      return parts.slice(0, 2).join(".") + "." + parts.slice(2, 3);
    } else if (parts.length === 2 && parts[1].length > 2) {
      return parts[0] + "." + parts[1].slice(0, 2);
    }

    const digitsOnly = cleanedInput.replace(/\D/g, "");
    if (digitsOnly.length > 8) {
      return digitsOnly.slice(0, 8);
    }

    return cleanedInput;
  };

  const handleAddonsChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const { name, value } = event.target;
    setAddProductFormData((prevState) => {
      const newAddons = prevState.addons.map((addon, i) => {
        if (i === index) {
          return {
            ...addon,
            [name]:
              name != "price" ? value : formattedPriceUptoTwoDecimals(value),
          };
        }
        return addon;
      });
      return { ...prevState, addons: newAddons };
    });
  };
  const handleAddonsColorChange = (value: Option[], index: number) => {
    setAddProductFormData((prevState) => {
      const newAddons = prevState.addons.map((addon, i) => {
        if (i === index) {
          return {
            ...addon,
            addon_color: value,
          };
        }
        return addon;
      });
      return { ...prevState, addons: newAddons };
    });
  };
  const handleAddonsAdd = () => {
    setAddProductFormData((prevState) => ({
      ...prevState,
      addons: [
        ...prevState.addons,
        { name: "", price: "", description: "", addon_color: [{ name: "" }] },
      ],
    }));
  };

  const handleAddonsDelete = (index: number) => {
    setAddProductFormData((prevState) => {
      const newAddons = prevState.addons.filter((addon, i) => i !== index);
      return { ...prevState, addons: newAddons };
    });
  };
  const handleAddRow = () => {
    setPrices([...prices, Array(prices[0].length).fill("")]);
  };

  const handleAddColumn = () => {
    setPrices(prices.map((row) => [...row, ""]));
  };

  const handleRemoveLastRow = () => {
    if (prices.length > 1) {
      setPrices(prices.slice(0, -1));
    }
  };

  const handleRemoveLastColumn = () => {
    if (prices[0].length > 1) {
      setPrices(prices.map((row) => row.slice(0, -1)));
    }
  };

  const handleChangePrices = (
    event: React.ChangeEvent<HTMLInputElement>,
    widthIndex: number,
    heightIndex: number
  ) => {
    const newPrices = prices.map((row, rIdx) =>
      row.map((col, cIdx) =>
        rIdx === widthIndex && cIdx === heightIndex
          ? +event.target.value
            ? event.target.value
            : ""
          : col
      )
    );
    setPrices(newPrices);
  };

  const toggleAddonsFields = (value: Option) => {
    setAddonsShowFields((prev) =>
      prev.map((item, index) => {
        if (item.name === value.name && index) {
          return { ...item, hide: !item.hide };
        }
        return item;
      })
    );
  };
  const modalSteps: ModalStep[] = [
    {
      stepName: "Add Blind",
      description: "Please enter the blind details below",
      canSkip: false,
      page: (
        <div className="grid w-full grid-cols-2 gap-6 max-sm:grid-cols-1 items-end">
          <Input
            id="name"
            type="text"
            variant="text"
            label="Product Name"
            placeholder="Enter product name"
            handleChange={handleChange}
            value={addProductFormData.name}
            isRequired
          />
          <Button
            className="!h-12"
            variant="primary-outline"
            onClick={() => {
              setOpenAddPriceModal(true);
            }}
            size="lg"
          >
            {isEdit ? "Edit" : "Create"} Pricing Table *
          </Button>
          <Selectbox
            variant="default"
            label="Blind Type"
            datas={blindData}
            selectedNow={false}
            handleChange={handleBlindTypeChange}
            isRequired
            selectedData={addProductFormData.blind_type}
          />
          {isSuperAdmin && (
            <div id="form_franchise_id" className="flex flex-col gap-2">
              <Selectbox
                label="Franchise"
                datas={franchises}
                selectedNow={true}
                selectedData={addProductFormData?.franchise}
                isRequired
                handleChange={handleFranchiseChange}
                onScroll={handleScroll}
              />
            </div>
          )}
          <Input
            id="product_guide"
            type="file"
            variant="default"
            label="Product Guide"
            placeholder=""
            fileTypes={manufacturerFileTypes}
            handleFileChange={handleFileChange}
            selectedFileType={file?.name.split(".").pop()?.toUpperCase()}
            selectedFileName={file?.name}
            editFile={isEdit ? editFile : undefined}
            setEditFile={isEdit ? setEditFile : undefined}
          />
          <MultipleSelectBox
            label="Colors"
            datas={colorsData}
            variant="default"
            handleChange={handleColorChange}
            selectedData={addProductFormData.color}
          />

          <MultipleSelectBox
            variant="default"
            label="Features"
            datas={featuresData}
            handleChange={handleFeaturesChange}
            selectedData={addProductFormData.features}
          />
          <Input
            type="text"
            id="model_number"
            variant="text"
            label="Model Number"
            placeholder="Enter model number"
            handleChange={handleChange}
            value={addProductFormData.model_number}
          />
        </div>
      ),
    },
    {
      stepName: "Add-ons",
      description: "Add-ons description",
      canSkip: false,
      page: (
        <>
          {addProductFormData?.addons?.length ? (
            <div className="grid w-full grid-cols-4 gap-6 items-end max-lg:grid-cols-2 max-sm:grid-cols-1">
              <Selectbox
                variant="default"
                label="Toggle Input Fields"
                datas={addonsShowFields}
                selectedNow={true}
                handleChange={toggleAddonsFields}
              />
            </div>
          ) : null}
          {addProductFormData.addons.map((addon, index) => (
            <div
              key={index}
              className="grid w-full grid-cols-4 gap-6 items-end max-lg:grid-cols-2 max-sm:grid-cols-1"
            >
              <Input
                id="name"
                type="text"
                variant="text"
                label="Name"
                placeholder="Enter name"
                handleChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleAddonsChange(e, index)
                }
                value={addon.name}
              // isRequired
              />
              <Input
                id="price"
                variant="currency"
                label="Price"
                placeholder="Enter price"
                handleChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleAddonsChange(e, index)
                }
                value={addon.price}
                type="number"
              // isRequired
              />
              <Input
                id="description"
                variant="text"
                type="text"
                label="Description"
                placeholder="Enter description"
                handleChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleAddonsChange(e, index)
                }
                value={addon.description}
              // isRequired
              />

              {addonsShowFields.find(
                (i) => i.name === "addon_color" && !i.hide
              ) ? (
                <MultipleSelectBox
                  label="Colors"
                  datas={colorsData}
                  variant="default"
                  handleChange={(value: Option[]) =>
                    handleAddonsColorChange(value, index)
                  }
                  selectedData={addon.addon_color}
                />
              ) : null}
              <div className="grid w-full grid-cols-2 gap-2">
                <Button
                  className="!h-12"
                  variant="default-bg"
                  onClick={handleAddonsAdd}
                  size="md"
                >
                  Add
                </Button>
                {index > 0 && (
                  <Button
                    className="!h-12"
                    variant="primary-bg"
                    size="md"
                    onClick={() => handleAddonsDelete(index)}
                  >
                    Delete
                  </Button>
                )}
              </div>
            </div>
          ))}
        </>
      ),
    },
    {
      stepName: "Confirmation",
      description: "Confirmation description",
      canSkip: false,
      page: (
        <>
          <div className="w-full">
            <p className="self-start text-neutral-50">Product Information</p>
            <div className="grid w-full md:grid-cols-2 gap-6 max-md:grid-cols-1 items-end">
              <Input
                id="name"
                type="text"
                variant="text"
                label="Product Name"
                placeholder="Enter product name"
                value={addProductFormData.name}
                disabled
              />
              <Button
                className="!h-12"
                variant="primary-bg"
                onClick={() => {
                  setOpenAddPriceModal(true);
                  setIsPricingModalView(true);
                }}
                size="lg"
              >
                View Pricing Table
              </Button>
              <Input
                id="blind_type"
                type="text"
                variant="text"
                label="Blind Type"
                placeholder="Blind Type"
                value={addProductFormData.blind_type.name}
                disabled
              />
              <Input
                id="product_guide"
                type="file"
                variant="default"
                label="Product Guide"
                placeholder=""
                fileTypes={manufacturerFileTypes}
                handleFileChange={handleFileChange}
                selectedFileType={file?.name.split(".").pop()?.toUpperCase()}
                selectedFileName={file?.name}
                editFile={isEdit ? editFile : undefined}
                setEditFile={isEdit ? setEditFile : undefined}
                disabled
              />
              <Input
                id="color"
                type="text"
                variant="text"
                label="Colors"
                placeholder="Enter color"
                value={addProductFormData?.color
                  ?.map((item) => item.name)
                  .join(", ")}
                disabled
              />
              <Input
                id="features"
                type="text"
                variant="text"
                label="Features"
                placeholder="Enter features"
                value={addProductFormData?.features
                  ?.map((item) => item.name)
                  .join(", ")}
                disabled
              />
              <Input
                id="model_number"
                type="text"
                variant="text"
                label="Model Number"
                placeholder="Enter model number"
                value={addProductFormData.model_number}
                disabled
              />
            </div>
          </div>
          <div className="w-full">
            {addProductFormData.addons.map((addon, index) => (
              <Fragment key={index}>
                <p className={`self-start text-neutral-50  ${index && "pt-5"}`}>
                  Add-on {index + 1}
                </p>
                <div className="grid w-full md:grid-cols-3 gap-6 max-md:grid-cols-1">
                  <Input
                    id={`name-${index}`}
                    type="text"
                    variant="text"
                    label="Name"
                    placeholder="Enter name"
                    value={addon.name}
                    disabled
                  />
                  <Input
                    id={`price-${index}`}
                    type="number"
                    variant="currency"
                    label="Price"
                    placeholder="Enter price"
                    value={addon.price}
                    disabled
                  />
                  <Input
                    id={`description-${index}`}
                    type="text"
                    variant="text"
                    label="Description"
                    placeholder="Enter description"
                    value={addon.description}
                    disabled
                  />
                  <Input
                    id="color"
                    type="text"
                    variant="text"
                    label="Colors"
                    placeholder="Enter color"
                    value={addon?.addon_color
                      ?.map((item) => item.name)
                      .join(", ")}
                    disabled
                  />
                </div>
              </Fragment>
            ))}
          </div>
        </>
      ),
    },
  ];

  const tableConfig = {
    tableName: "Manufacturer Products",
    pageUrl: "/manufacturers",
    search,
    handleSearchChange,
    page,
    totalPages,
    handlePageChange: (page: number) => {
      setPage(page);
      setFetchData(true);
    },
    columns: {
      name: { path: "name", header: "Name", type: "string" },
      colors: {
        path: "color",
        header: "Colors",
        type: "array",
        render: (colors: string[]) => colors.join(", "),
      },
      features: {
        path: "features",
        header: "Features",
        type: "array",
        render: (features: string[]) => features.join(", "),
      },
      created_at: { path: "createdAt", header: "Created At", type: "date" },
      addedBy: { path: "added_by.name", header: "Added By", type: "string" },
      model_number: {
        path: "model_number",
        header: "Model Number",
        type: "string",
      },
      blind_type: { path: "blind_type", header: "Blind Type", type: "string" },
      addons: {
        path: "addons",
        header: "Add-ons",
        type: "array",
        render: (
          addons: { name: string; price: string; description: string }[]
        ) => (
          <ul>
            {addons.map((addon, index) => (
              <li key={index}>
                <strong>{addon.name}</strong>: ${addon.price}
              </li>
            ))}
          </ul>
        ),
      },
    },
    hasNavigation: true,
    actionsColumn: (item: any) => [
      <Button
        key={`select-contact-${item.id}`}
        size="md"
        variant="default-bg"
        className="mr-4 !w-11"
        onClick={(e: any) => {
          e.stopPropagation();
          handleEditButton(item.id);
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
            d="M5.79289 13.4999H3C2.86739 13.4999 2.74021 13.4472 2.64645 13.3535C2.55268 13.2597 2.5 13.1325 2.5 12.9999V10.207C2.5 10.1414 2.51293 10.0764 2.53806 10.0157C2.56319 9.95503 2.60002 9.89991 2.64645 9.85348L10.1464 2.35348C10.2402 2.25971 10.3674 2.20703 10.5 2.20703C10.6326 2.20703 10.7598 2.25971 10.8536 2.35348L13.6464 5.14637C13.7402 5.24014 13.7929 5.36732 13.7929 5.49992C13.7929 5.63253 13.7402 5.75971 13.6464 5.85348L6.14645 13.3535C6.10002 13.3999 6.0449 13.4367 5.98424 13.4619C5.92357 13.487 5.85855 13.4999 5.79289 13.4999Z"
            stroke="#3B4453"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M8.5 4L12 7.5"
            stroke="#3B4453"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M5.96848 13.4675L2.53223 10.0312"
            stroke="#3B4453"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Button>,
      <Button
        className="!w-11"
        key={`delete-product-${item.id}`}
        size="md"
        variant="default-bg"
        onClick={(e: any) => {
          e.stopPropagation();
          setOpenModalDelete(true);
          setProductIdToDelete(item.id);
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
      </Button>,
    ],
    addAction: () => {
      setOpenModalAddProduct(true);
      setIsEdit(0);
    },
    modals: [
      {
        title: isEdit ? "Edit Product" : "Add Product",
        className: `max-w-4xl ${openAddPriceModal ? "hidden" : ""}`,
        open: openModalAddProduct,
        setOpen: (val: any) => {
          setOpenModalAddProduct(val);
        },
        modalChild: (
          <>
            <main className="my-10 flex flex-col items-center justify-center gap-10">
              <nav className="relative w-fit">
                <div className="absolute left-1/2 top-5 -z-10 h-0.5 w-10/12 max-md:w-9/12 max-sm:w-8/12 -translate-x-1/2 bg-neutral-40"></div>
                <section className="flex items-center justify-center gap-20 max-md:gap-12 max-sm:gap-4">
                  {modalSteps.map((step, key) => (
                    <div className="flex flex-col items-center gap-2" key={key}>
                      <span
                        className={`flex h-10 w-10 items-center justify-center rounded-full border ${activeState > key
                          ? "border-primary-border bg-primary-main"
                          : "border-neutral-50 bg-neutral-50"
                          } text-xl sm:text-body-xl font-semibold text-white`}
                      >
                        {activeState > 0 && activeState <= key + 1 && key + 1}

                        {activeState > key + 1 && (
                          <CheckIcon className="h-6 w-6 text-white" />
                        )}
                      </span>

                      <h5 className="text-xs font-semibold text-neutral-50 max-sm:text-[10px] text-nowrap">
                        {step.stepName}
                      </h5>
                    </div>
                  ))}
                </section>
              </nav>

              <header className="space-y-2 text-center">
                <h3 className="text-xl sm:text-body-xl font-semibold">
                  {modalSteps[activeState - 1].stepName}
                </h3>
                <p className="text-xs sm:text-sm text-neutral-50">
                  {modalSteps[activeState - 1].description}
                </p>
              </header>
              {modalSteps[activeState - 1].page}
            </main>

            <footer className="flex justify-end gap-3">
              <Button
                className="!h-10"
                size="md"
                variant="primary-nude"
                onClick={() => {
                  if (activeState === 1) {
                    setOpenModalAddProduct(false);
                  } else {
                    setActiveState(activeState - 1);
                  }
                }}
              >
                {activeState === 1 ? "Cancel" : "Previous"}
              </Button>
              {activeState === modalSteps.length ? (
                <Button
                  className="!h-10"
                  size="md"
                  variant="primary-bg"
                  onClick={async () => {
                    if (activeState < modalSteps.length) {
                      if (openModalAddProduct === false) {
                        setActiveState(1);
                      } else {
                        setActiveState(activeState + 1);
                      }
                    } else {
                      await handleSubmit();
                    }
                  }}
                >
                  Submit
                </Button>
              ) : modalSteps[activeState - 1]?.canSkip ? (
                // && !checkAddons
                <Button
                  className="!h-10"
                  size="md"
                  variant="primary-bg"
                  onClick={async () => {
                    if (activeState < modalSteps.length) {
                      if (openModalAddProduct === false) {
                        setActiveState(1);
                      } else {
                        setActiveState(activeState + 1);
                      }
                    }
                  }}
                >
                  Skip
                </Button>
              ) : (
                <Button
                  className="!h-10"
                  size="md"
                  variant={
                    activeState == 1 && !checkNameAndPrice
                      ? "disabled-bg"
                      : "primary-bg"
                  }
                  onClick={async () => {
                    if (activeState < modalSteps.length) {
                      if (openModalAddProduct === false) {
                        setActiveState(1);
                      } else {
                        setActiveState(activeState + 1);
                      }
                    }
                  }}
                  disabled={activeState == 1 ? !checkNameAndPrice : false}
                >
                  Next
                </Button>
              )}
              { }
            </footer>
          </>
        ),
      },
      {
        title: "Delete Product",
        className: "max-w-lg",
        open: openModalDelete,
        setOpen: setOpenModalDelete,
        modalChild: (
          <>
            <main className="mb-10 mt-4">
              <p className="text-sm text-neutral-80">
                Are you sure you want to delete this product? Deleted Products
                cannot be recovered
              </p>
            </main>
            <footer className="flex w-full justify-end gap-3">
              <Button
                className="!h-10"
                size="md"
                variant="default-nude"
                onClick={() => {
                  setOpenModalDelete(false);
                  setProductIdToDelete(null);
                }}
              >
                Cancel
              </Button>
              <Button
                className="!h-10"
                size="md"
                variant="error-bg"
                onClick={() => {
                  if (productIdToDelete !== null) {
                    handleDelete(productIdToDelete);
                  }
                }}
              >
                Submit
              </Button>
            </footer>
          </>
        ),
      },
      {
        title: isPricingModalView
          ? "View Pricing Table"
          : isEdit
            ? "Edit Pricing table"
            : "Create Pricing Table",
        className: "max-w-4xl",
        open: openAddPriceModal,
        setOpen: (val: any) => {
          setOpenAddPriceModal(val);
          setOpenModalAddProduct(true);
          setIsPricingModalView(false);
        },
        modalChild: (
          <div className="flex flex-col">
            <div className="flex py-7 gap-5 items-center flex-wrap">
              <PriceTableAbbrevations />
            </div>
            <div className="overflow-x-auto mt-4 mb-6">
              <div className="grid w-fit border border-gray-200 rounded-xl">
                {prices.map((row, rowIndex) => (
                  <div
                    key={rowIndex}
                    className={` items-center justify-items-center`}
                    style={{
                      display: "grid",
                      gridTemplateColumns: `repeat(${row.length}, minmax(150px, 150px))`,
                    }}
                  >
                    {row.map((col, colIndex) => {
                      const isLastRow = rowIndex === prices.length - 1;
                      const isHeightAndWidthExists =
                        prices[0][colIndex] && prices[rowIndex][0];
                      const isSecondRow = rowIndex === 1 && colIndex === 0;
                      const isSecondCol = rowIndex === 0 && colIndex === 1;
                      const isFirstRow =
                        rowIndex === 0 && row.length - 1 === colIndex;
                      return (
                        <Fragment key={colIndex}>
                          {rowIndex === 0 && colIndex === 0 ? (
                            <div
                              className={`w-full bg-gray-50 border-b-2 border-r-2 border-b-gray-200 border-r-gray-200 rounded-tl-xl h-full`}
                            ></div>
                          ) : rowIndex === 0 || colIndex === 0 ? (
                            <div
                              className={`p-4 bg-[#c63d7f1a] ${isLastRow
                                ? `rounded-bl-xl`
                                : isFirstRow
                                  ? "rounded-tr-xl"
                                  : ""
                                }`}
                            >
                              <Input
                                id={`input-${rowIndex}-${colIndex}`}
                                type="number"
                                variant="number"
                                label=""
                                className="p-2 "
                                placeholder={
                                  isSecondCol || isSecondRow ? "e.g 5 in" : ""
                                }
                                handleChange={(e) => {
                                  const value = e.target.value;
                                  const isValid = /^\d+$/.test(value);

                                  if (isValid || !value) {
                                    handleChangePrices(e, rowIndex, colIndex);
                                  }
                                }}
                                disabled={isPricingModalView}
                                value={col}
                              />
                            </div>
                          ) : (
                            <div className="p-4">
                              <Input
                                id={`input-${rowIndex}-${colIndex}`}
                                type="number"
                                variant="number"
                                label=""
                                placeholder={
                                  !isHeightAndWidthExists ? "" : `$20`
                                }
                                handleChange={(e) => {
                                  const value = e.target.value;
                                  const isValid = /^\d+$/.test(value);

                                  if (isValid || !value) {
                                    handleChangePrices(e, rowIndex, colIndex);
                                  }
                                }}
                                disabled={
                                  !isHeightAndWidthExists || isPricingModalView
                                }
                                value={col}
                              />
                            </div>
                          )}
                        </Fragment>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
            {!isPricingModalView && (
              <div className="flex justify-between py-5 flex-wrap gap-4">
                <div className="flex justify-start gap-5">
                  {prices[0].length > 2 && (
                    <Button
                      className="!h-11"
                      variant="primary-outline"
                      onClick={handleRemoveLastColumn}
                      size="md"
                    >
                      <TiMinus className="w-4 stroke-[1px]" />
                      Remove Column
                    </Button>
                  )}
                  {prices.length > 2 && (
                    <Button
                      className="!h-11"
                      variant="primary-bg"
                      onClick={handleRemoveLastRow}
                      size="md"
                    >
                      <TiMinus className="w-4 stroke-[1px]" />
                      Remove Row
                    </Button>
                  )}
                </div>
                <div className="flex justify-end gap-5">
                  <Button
                    variant="primary-outline"
                    onClick={handleAddColumn}
                    size="md"
                  >
                    <PlusIcon className="w-4 stroke-[10px]" />
                    Add Column
                  </Button>
                  <Button variant="primary-bg" onClick={handleAddRow} size="md">
                    <PlusIcon className="w-4 stroke-[10px]" />
                    Add Row
                  </Button>
                </div>
              </div>
            )}
            <Button
              variant={isPriceAdded ? "primary-bg" : "disabled-bg"}
              onClick={() => {
                setOpenAddPriceModal(false);
                setOpenModalAddProduct(true);
                setIsPricingModalView(false);
              }}
              size="md"
              className="float-end w-max self-end !h-10"
            >
              Next
            </Button>
          </div>
        ),
      },
    ],
    alerts: [
      <Alerts
        key="alert-Product-added"
        variant="success"
        open={openSuccess}
        setOpen={setOpenSuccess}
        title={`Product has been ${modalHeading}`}
        desc={`Product has been ${modalHeading}, You can manage this company or add additional information as needed.`}
      />,
      <Alerts
        key="alert-Products-deleted"
        variant="success"
        open={openAlertsDelete}
        setOpen={setOpenAlertsDelete}
        title="Product has been deleted"
        desc="Product has been deleted. Please review any adjustments to your manufacturers records as necessary."
      />,
    ],
  };

  return (
    <div>
      <div className={`${openModalProduct ? 'flex' : 'hidden'} relative`}>
        <button onClick={() => setOpenModalProduct(false)} aria-label='Close' className="absolute right-4 min-[480px]:right-5 min-[640px]:right-6 md:right-7 top-[42px]">
          <XIcon className='h-6 w-6 text-neutral-50' />
        </button>
        <ProductConfiguratorForm openModalProduct={openModalProduct} setOpenModalProduct={setOpenModalProduct} />
      </div>
      <div className={`${openModalProduct ? 'hidden' : 'flex flex-col'}`}>
        <Button
          size="md"
          variant="primary-bg"
          className="w-fit"
          onClick={() => {
            handleModelOpen();
          }}
        >
          <PlusIcon className="h-4 w-4 stroke-[10px]" />
          Add Product Configuration
        </Button>
        <UI8Table
          data={
            manufacturersTableData ? (manufacturersTableData.results as any) : []
          }
          config={tableConfig}
        />
      </div>
    </div>
  );
};
export default ManufacturersPage;
