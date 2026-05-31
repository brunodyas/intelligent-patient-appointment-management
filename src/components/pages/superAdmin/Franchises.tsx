"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  addFrenchiseWithUser,
  deleteFrenchise,
  getFranchises,
  getFranchiseDetails,
  updateFrenchise,
} from "@/services/franchises";
import { Alerts, Button, Input, MultipleSelectBox } from "@/components/atomics";
import UI8Table from "@/components/UI8Table";
import { size } from "@/constants/constants";
import {
  EditFranchiseData,
  ListFranchisesResponse,
} from "@/interface/franchises";
import { XIcon } from "@heroicons/react/outline";
import { useAuth } from "@/context/auth";
import { useUser } from "@/hooks/user/useUser";
import UserForm from "../../templates/user/UserForm";
import { LoadingIcon } from "@/assets/icons";
import { Option } from "@/interface/manufacturers";
import { useJune } from "@/hooks/useJune";
import useUserRoles from "@/hooks/useUserRoles";
import { formatPhoneNum, formatURL } from "@/utils/formatHelper";
import { unformatPhoneNumber } from "@/utils/formatPhoneForCall";

interface UserData {
  name: string;
  email: string;
  password?: string;
  photo: string;
  user_phone: string;
  website_url: string;
  role: string;
  franchise_name: string;
  franchise_address: string;
  tech_license_plate: string;
  // price_markup: string;
  // is_manufacturer: string;
  tech_vehicle: string;
  zip_codes_covered: Option[];
  zip_codes_would_accept_outside_owned: Option[];
  shift_start_time: string;
  shift_end_time: string;
}

const DEFAULT_DATA: UserData = {
  name: "",
  email: "",
  password: "",
  photo: "",
  user_phone: "",
  website_url: "",
  role: "",
  franchise_name: "",
  // price_markup: "",
  // is_manufacturer: "",
  franchise_address: "",
  tech_license_plate: "",
  tech_vehicle: "",
  zip_codes_covered: [],
  zip_codes_would_accept_outside_owned: [],
  shift_start_time: "",
  shift_end_time: "",
};

const FILTER_OPTIONS: {
  title: string;
  label: keyof EditFranchiseData;
  button: string[];
}[] = [
    // {
    //   title: "Franchise Active",
    //   label: "franchise_active",
    //   button: ["Yes", "No"],
    // },
    // {
    //   title: "Is Manufacturer?",
    //   label: "is_manufacturer",
    //   button: ["Yes", "No"],
    // },
  ];

const FranchisesPage = () => {
  const { isSuperAdmin: isSuper, isCustomerCareManager } = useUserRoles();
  const isSuperAdmin = isSuper || isCustomerCareManager;

  // Model State
  const [openModalAddFrenchise, setOpenModalAddFrenchise] = useState(false);
  const [openModalDelete, setOpenModalDelete] = useState(false);
  const [openModalEdit, setOpenModalEdit] = useState(false);
  // Alert State
  const [openSuccess, setOpenSuccess] = useState(false);
  const [openError, setOpenError] = useState(false);
  const [openDeleteAlerts, setOpenDeleteAlerts] = useState(false);
  const [openErrorDeleteAlerts,setErrorOpenDeleteAlerts] = useState(false);
  const [openEditAlerts, setOpenEditAlerts] = useState(false);
  const [openErrorEdit, setOpenErrorEdit] = useState(false);
  const [responseErrors, setResponseError] = useState<string[]>([]);
  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  // Form State
  const [isLoading, setIsLoading] = useState(false);
  const [newFranchise, setNewFranchise] = useState(DEFAULT_DATA);
  const [selectedFranchiseId, setSelectedFranchiseId] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [editErrors, setEditErrors] = useState<{ [key: string]: string }>({});
  const [filter, setFilter] = useState({ isSort: false });
  const [search, setSearch] = useState("")
  const timeoutRef = useRef<any>(null);
  const [editedFrenchiseData, setEditedFrenchiseData] =
    useState<EditFranchiseData>({
      email: "",
      franchise_name: "",
      website_url: "",
      franchise_active: "",
      // is_manufacturer: "",
      // price_markup: "",
      franchise_address: "",
      zip_codes_covered: [],
      zip_codes_would_accept_outside_owned: [],
    });
  const [franchisesTableData, setfranchisesTableData] =
    useState<ListFranchisesResponse>({
      results: [],
      count: 0,
      previous: 1,
      next: 1,
    });

  // Custom Hooks
  const { user } = useAuth();
  const { file, blob, reset, handleChangeFile, setFile } = useUser();
  const analytics = useJune();



  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    let firstErrorFieldId: string | null = null;

    if (!newFranchise.name) {
      newErrors.name = "Name is required";
      if (!firstErrorFieldId) firstErrorFieldId = "form_name";
    }
    if (!newFranchise.user_phone) {
      newErrors.user_phone = "Phone number is required";
      if (!firstErrorFieldId) firstErrorFieldId = "form_user_phone";
    }
    if (!newFranchise.email) {
      newErrors.email = "Email is required";
      if (!firstErrorFieldId) firstErrorFieldId = "form_email";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newFranchise.email)) {
        newErrors.email = "Invalid email format";
        if (!firstErrorFieldId) firstErrorFieldId = "form_email";
      }
    }
    if (!newFranchise?.password) {
      newErrors.password = "Password is required";
      if (!firstErrorFieldId) firstErrorFieldId = "form_password";
    } else {
      const passwordRegex =
        /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^])[A-Za-z\d@$!%*?&#^]{8,}$/;
      if (!passwordRegex.test(newFranchise?.password)) {
        newErrors.password =
          "Password must be at least 8 characters, contain at least one capital letter, one symbol, and one number";
        if (!firstErrorFieldId) firstErrorFieldId = "form_password";
      }
    }

    const phoneRegex = /^\d{10}$/;

    if (newFranchise.user_phone && !phoneRegex.test(unformatPhoneNumber(newFranchise.user_phone))) {
      newErrors.user_phone = "Phone number must be exactly 10 digits.";
      if (!firstErrorFieldId) firstErrorFieldId = "form_user_phone";
    }
    if (!newFranchise.role) {
      newErrors.role = "Role is required";
      if (!firstErrorFieldId) firstErrorFieldId = "form_role";
    }

    if (newFranchise.role == "Tech") {
      if (!newFranchise.shift_start_time) {
        newErrors.shift_start_time = "Shift start time is required";
        if (!firstErrorFieldId) firstErrorFieldId = "form_shift_start_time";
      }
      if (!newFranchise.shift_end_time) {
        newErrors.shift_end_time = "Shift end time is required";
        if (!firstErrorFieldId) firstErrorFieldId = "form_shift_end_time";
      }

      if (!newFranchise.tech_license_plate) {
        newErrors.tech_license_plate = "License plate is required for technicians";
        if (!firstErrorFieldId) firstErrorFieldId = "form_tech_license_plate";
      }
      
      if (!newFranchise.tech_vehicle) {
        newErrors.tech_vehicle = "Vehicle is required for technicians";
        if (!firstErrorFieldId) firstErrorFieldId = "form_tech_vehicle";
      }
    }
    
    if (newFranchise.tech_license_plate?.length > 20) {
      newErrors.tech_license_plate =
        "License plate must be 20 characters or fewer";
      if (!firstErrorFieldId) firstErrorFieldId = "form_tech_license_plate";
    }
  
    if (newFranchise.franchise_name === "" && isSuperAdmin) {
      newErrors.franchise_name = "Franchise name is required";
      if (!firstErrorFieldId) firstErrorFieldId = "form_franchise_name";
    }
    if (!newFranchise.franchise_address && isSuperAdmin) {
      newErrors.franchise_address = "Franchise address is required";
      if (!firstErrorFieldId) firstErrorFieldId = "form_franchise_address";
    }
    // if (!newFranchise.website_url && isSuperAdmin) {
    //   newErrors.website_url = "Website url is required";
    //   if (!firstErrorFieldId) firstErrorFieldId = "form_website_url";
    // }
    if (!newFranchise.zip_codes_covered.length && isSuperAdmin) {
      newErrors.zip_codes_covered = "Zip codes is required";
      if (!firstErrorFieldId) firstErrorFieldId = "form_zip_codes_covered";
    }
    // if (!newFranchise.zip_codes_would_accept_outside_owned.length && isSuperAdmin) {
    //   newErrors.zip_codes_would_accept_outside_owned = "Out-of-Territory Zip Codes is required";
    //   if (!firstErrorFieldId) firstErrorFieldId = "form_secondry_zip_codes_covere";
    // }
    // if (newFranchise.price_markup !== "") {
    //   const priceMarkup = newFranchise.price_markup;
    //   const priceMarkupRegex = /^\d{1,3}(\.\d{0,2})?$/;
    //   if (!priceMarkupRegex.test(priceMarkup)) {
    //     newErrors.price_markup =
    //       "Price markup must be up to 3 digits before and up to 2 digits after a decimal point";
    //     if (!firstErrorFieldId) firstErrorFieldId = "form_price_markup";
    //   }
    // }
    if (firstErrorFieldId) {
      const element: any = document.getElementById(firstErrorFieldId);
      element?.scrollIntoView({ behavior: "smooth" });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const editValidate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!editedFrenchiseData.email) {
      newErrors.email = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editedFrenchiseData.email)) {
        newErrors.email = "Invalid email format";
      }
    }
    if (editedFrenchiseData.franchise_name === "") {
      newErrors.franchise_name = "Franchise name is required";
    }
    if (editedFrenchiseData.franchise_address === "") {
      newErrors.franchise_address = "Franchise address is required";
    }
    // if (editedFrenchiseData.website_url.trim() === "") {
    //   newErrors.website_url = "Website Url is required";
    // }

    if (!editedFrenchiseData?.zip_codes_covered.length && isSuperAdmin) {
      newErrors.zip_codes_covered = "Franchise Zip codes is required";
    }

    // if (editedFrenchiseData.price_markup !== "") {
    //   const priceMarkup = editedFrenchiseData.price_markup;
    //   const priceMarkupRegex = /^\d{1,3}(\.\d{0,2})?$/;

    //   if (!priceMarkupRegex.test(priceMarkup)) {
    //     newErrors.price_markup =
    //       "Price markup must be up to 3 digits before and up to 2 digits after a decimal point";
    //   }
    // }
    setEditErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      setIsLoading(true);
      await addFrenchiseWithUser({
        ...newFranchise,
        user_phone: unformatPhoneNumber(newFranchise.user_phone),
        zip_codes_covered: newFranchise.zip_codes_covered?.map(
          (zipcode) => zipcode?.name
        ),
        zip_codes_would_accept_outside_owned:
          newFranchise.zip_codes_would_accept_outside_owned?.map(
            (zipcode) => zipcode?.name
          ),
        ...(blob && { photo: blob }),
      });
      analytics?.track("addFrenchiseWithUser");

      setOpenSuccess(true);
    } catch (error: any) {
      let errorMessages = [];

      for (const field in error.response.data) {
        errorMessages.push(...error.response.data[field]);

      }
      setResponseError(errorMessages);
      setOpenError(true);
      throw error;
    } finally {
      setIsLoading(false);
      setNewFranchise(DEFAULT_DATA);
      setOpenModalAddFrenchise(false);
      reset();
    }
  };

  const handleEditChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setEditedFrenchiseData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleChangeSelect = (name: string, value: string) => {
    setEditedFrenchiseData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const getFranchise = async (id: string) => {
    const franchiseDetails = await getFranchiseDetails(id);
    analytics?.track("getFranchiseDetails");
    const {
      added_by: { email },
      franchise_name,
      franchise_active,
      // is_manufacturer,
      // price_markup,
      franchise_address,
      website_url,
      zip_codes_covered,
      zip_codes_would_accept_outside_owned,
    } = franchiseDetails?.results[0];

    const zips = typeof zip_codes_covered === "string" 
                  ? JSON.parse(zip_codes_covered)
                  : zip_codes_covered
                  
    const outsideZips = typeof zip_codes_would_accept_outside_owned === "string" 
                          ? JSON.parse(zip_codes_would_accept_outside_owned)
                          : zip_codes_would_accept_outside_owned
                            
    setEditedFrenchiseData({
      email,
      franchise_name,
      franchise_active: franchise_active ? "Yes" : "No",
      // is_manufacturer: is_manufacturer ? "Yes" : "No",
      // price_markup,
      franchise_address: franchise_address ? franchise_address : "",
      website_url,
      zip_codes_covered: zip_codes_covered?.length
        ? zips.map((data: any) => {
          return { name: data };
        })
        : [],
      zip_codes_would_accept_outside_owned:
        zip_codes_would_accept_outside_owned?.length
          ? outsideZips?.map((data: any) => {
            return { name: data };
          })
          : [],
    });
    setEditErrors({});
    setOpenModalEdit(true);
  };

  const handleDeleteFranchise = async () => {
    try {
      setIsLoading(true);
      await deleteFrenchise(selectedFranchiseId);
      analytics?.track("deleteFrenchise");
      setOpenDeleteAlerts(true);
    } catch (error) {
      console.error("error", error);
      setErrorOpenDeleteAlerts(true);
    } finally {
      setIsLoading(false);
      setOpenModalDelete(false);
      setSelectedFranchiseId("");
    }
  };

  const handleEditFranchise = async () => {
    if (!editValidate()) return;
    
    const transformedData = {
      ...editedFrenchiseData,
      ...(editedFrenchiseData?.website_url 
          ? {website_url: formatURL(editedFrenchiseData?.website_url)} 
          : {}
        ),
      zip_codes_covered: editedFrenchiseData?.zip_codes_covered?.map(
        (zipcode) => zipcode.name
      ),
      zip_codes_would_accept_outside_owned:
        editedFrenchiseData?.zip_codes_would_accept_outside_owned?.map(
          (zipcode) => zipcode.name
        ),
      // is_manufacturer: editedFrenchiseData?.is_manufacturer === "Yes",
      franchise_active: editedFrenchiseData?.franchise_active === "Yes",
    };

    try {
      setIsLoading(true);
      await updateFrenchise({
        id: selectedFranchiseId,
        editData: transformedData,
      });
      analytics?.track("updateFrenchise");
      setOpenEditAlerts(true);
    } catch (error: any) {
      let errorMessages = [];

      for (const field in error.response.data) {
        errorMessages.push(...error.response.data[field]);

      }
      setResponseError(errorMessages);
      setOpenErrorEdit(true);
      console.error("Error updating franchise:", error);
      throw error;
    } finally {
      setIsLoading(false);
      setOpenModalEdit(false);
      setSelectedFranchiseId("");
    }
  };


  const fetchCompanies = useCallback(async (searchValue?: string, filter?: {isSort: boolean}) => {
    try {
      const response = await getFranchises(+page, searchValue, filter);
      analytics?.track("getFranchises");
      setfranchisesTableData(response);
      setTotalPages(Math.ceil(response?.count / size));
    } catch (e: any) {
      if (e?.response?.data?.detail === "Invalid page." && page > 1)
        setPage(page - 1);
      console.error("Error fetching call list:", e);
    }
  }, [page, openSuccess, openDeleteAlerts]);

  useEffect(() => {
    fetchCompanies(search);
  }, [page]);

  useEffect(() => {
    if (openDeleteAlerts) {
      fetchCompanies(search);
    }
    if (openEditAlerts) {
      fetchCompanies(search);
    }
    if (openSuccess) {
      fetchCompanies(search);
    }
  }, [openDeleteAlerts, openEditAlerts, openSuccess])

  const handleSearchChange = useCallback((searchValue: string) => {
    if (timeoutRef) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      fetchCompanies(searchValue)
    }, 2000);
    setSearch(searchValue)
  }, [])

  const modalStep = {
    stepName: "Add Franchise",
    description: "Please enter the franchise details below",
    canSkip: false,
    page: (
      <>
        <div className="grid w-full grid-cols-1 gap-6">
          <div>
            <Input
              id="email"
              variant="email"
              label="Email"
              placeholder="Enter Email"
              handleChange={handleEditChange}
              value={editedFrenchiseData.email}
              isRequired={true}
            />
            {editErrors.email && editErrors.email && (
              <span className="text-red-500 text-xs">{editErrors.email}</span>
            )}
          </div>
          <div>
            <Input
              id="franchise_name"
              variant="default"
              label="Franchise name"
              placeholder="Enter Name"
              handleChange={handleEditChange}
              value={editedFrenchiseData.franchise_name}
              isRequired={true}
            />
            {editErrors.franchise_name && editErrors.franchise_name && (
              <span className="text-red-500 text-xs">
                {editErrors.franchise_name}
              </span>
            )}
          </div>
          <div>
            <Input
              type="address"
              id="franchise_address"
              variant="default"
              label="Franchise Address"
              placeholder="Enter Franchise Address"
              handleChange={handleEditChange}
              defaultValue={editedFrenchiseData.franchise_address}
              isRequired={true}
              disabled={false}
            />
            {editErrors.franchise_address && editErrors.franchise_address && (
              <span className="text-red-500 text-xs">
                {editErrors.franchise_address}
              </span>
            )}
          </div>
          <div>
            <Input
              id="website_url"
              variant="default"
              label="Website Url"
              placeholder="Enter Website Url"
              handleChange={handleEditChange}
              value={editedFrenchiseData.website_url}
            />
            {editErrors.website_url && editErrors.website_url && (
              <span className="text-red-500 text-xs">{editErrors.website_url}</span>
            )}
          </div>
          {isSuperAdmin && (
            <div>
              <MultipleSelectBox
                label="Franchise Zip Codes"
                variant="default"
                isRequired={true}
                handleChange={(e: any) =>
                  handleEditChange({
                    target: {
                      name: "zip_codes_covered",
                      value: e,
                    },
                  } as React.ChangeEvent<HTMLInputElement>)
                }
                selectedData={editedFrenchiseData?.zip_codes_covered}
              />
              {editErrors.zip_codes_covered && editErrors.zip_codes_covered && (
                <span className="text-red-500 text-xs">
                  {editErrors.zip_codes_covered}
                </span>
              )}
            </div>
          )}
          <div>
            <MultipleSelectBox
              label="Out-of-Territory Zip Codes"
              variant="default"
              handleChange={(e: any) =>
                handleEditChange({
                  target: {
                    name: "zip_codes_would_accept_outside_owned",
                    value: e,
                  },
                } as React.ChangeEvent<HTMLInputElement>)
              }
              selectedData={
                editedFrenchiseData?.zip_codes_would_accept_outside_owned
              }
            />
            {editErrors.zip_codes_would_accept_outside_owned &&
              editErrors.zip_codes_would_accept_outside_owned && (
                <span className="text-red-500 text-xs">
                  {editErrors.zip_codes_would_accept_outside_owned}
                </span>
              )}
          </div>
          {/* <div>
            <Input
              id="price_markup"
              variant="input"
              label="Price Mark Up"
              placeholder=""
              handleChange={handleEditChange}
              value={editedFrenchiseData.price_markup}
            />
            {editErrors.price_markup && editErrors.price_markup && (
              <span className="text-red-500 text-xs">
                {editErrors.price_markup}
              </span>
            )}
          </div> */}
        </div>
        {FILTER_OPTIONS.map((item, index) => (
          <div className="w-full flex-col" key={index}>
            <label className="text-sm font-semibold text-neutral-100 max-sm:text-xs">
              {item.title}
            </label>
            <div className="flex gap-3 mt-2">
              {item.button.map((button, index) => (
                <Button
                  key={index}
                  onClick={() => handleChangeSelect(item.label, button)}
                  size="md"
                  variant={
                    editedFrenchiseData[item.label] === button
                      ? "tab-selected"
                      : "tab-unselect"
                  }
                  className="!rounded-[999px]"
                >
                  {button}
                </Button>
              ))}
            </div>
          </div>
        ))}
      </>
    ),
  };


  const tableConfig = {
    tableName: "Franchises",
    page,
    totalPages,
    search,
    filter,
    handleSearchChange,
    handlePageChange: (page: number) => {
      setPage(page);
    },
    setFilter: (value: {isSort: boolean}) => {
      setFilter(prevState => ({ isSort: !prevState.isSort }));
      fetchCompanies(search, value);
    },
    columns: {
      name: {
        path: "franchise_name",
        header: "Franchise name",
        type: "string",
      },
      email: { path: "added_by.email", header: "Email", type: "string" },
      createdAt: { path: "createdAt", header: "Created At", type: "dateTime" },
    },
    hideAddButton: !isSuperAdmin,
    hasNavigation: true,
    ...(isSuperAdmin && {
      actionsColumn: (item: any) => [
        <Button
          key={`select-contact-${item.id}`}
          size="md"
          variant="default-bg"
          className="mr-4 !w-11"
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            getFranchise(item?.id);
            setSelectedFranchiseId(item?.id);
            
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
          key={`add-contact-${item.id}`}
          size="md"
          variant="default-bg"
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            setSelectedFranchiseId(item.id);
            setOpenModalDelete(true);
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
      modals: [
        {
          title: "Add Franchise",
          className: "max-w-4xl",
          open: openModalAddFrenchise,
          setOpen: setOpenModalAddFrenchise,
          type: "sheet",
          modalChild: (
            <form className="flex flex-col justify-between h-[calc(100vh-178px)] sm:h-[calc(100vh-77px)] relative rounded-lg border">
              <main className="flex flex-col items-center h-[calc(100%-77px)] rounded-lg">
                <div className="w-10 h-[3px] bg-[#e0e0e0] smx:hidden flex top-2 left-1/2 -translate-x-1/2 absolute"></div>
                <header
                  className={`space-y-2 flex items-center justify-between w-full p-4 smx:p-2 rounded-lg border border-transparent`}
                >
                  <div className="w-7 h-7 smx:w-10 smx:h-10"></div>
                  <h3 className="text-md font-semibold text-text-black !mt-0">
                    New Franchise
                  </h3>
                  <button
                    aria-label="Close"
                    type="reset"
                    className="smx:hover:bg-[#33333326] smx:bg-transparent bg-background-lightest w-9 h-9 smx:w-10 smx:h-10 !mt-0 flex justify-center items-center rounded-lg smx:rounded-lg duration-500"
                    onClick={() => {
                      setOpenModalAddFrenchise(false);
                    }}
                  >
                    <XIcon className="smx:h-6 smx:w-6 h-5 w-5 text-neutral-200" />
                  </button>
                </header>
                <div className="flex w-full flex-col gap-[25px] px-5 pt-4 overflow-auto h-[calc(100%-60px)] smx:h-[calc(100%-56px)] pb-[43px]">
                  <UserForm
                    formType="superAdminPanel"
                    formData={newFranchise}
                    errors={errors}
                    setFormData={setNewFranchise}
                    handleChangeFile={handleChangeFile}
                    file={file}
                    userRole={user?.role || ""}
                  />
                </div>
              </main>

              <footer className="flex justify-start gap-4 px-6 py-5 border-t border-border-light">
                <Button
                  size="md"
                  variant="default-bg"
                  className="px-4 !h-10 smx:!text-sm !text-md w-full smx:w-fit order-1 flex smx:order-2 !rounded-lg cursor-pointer hover:!bg-[#F5F5F5] !border-[#33333326] bg-transparent text-text-black"
                  onClick={() => {
                    setOpenModalAddFrenchise(false);
                  }}
                >
                  Cancel
                </Button>

                <Button
                  size="md"
                  variant="primary-bg"
                  disabled={isLoading}
                  className="px-4 py-[8.5px] smx:w-fit smx:!text-sm !text-md !rounded-lg order-2 flex smx:order-1 !w-[82px] !h-[40px]"
                  onClick={async (e) => {
                    await handleSubmit();
                  }}
                >
                  {isLoading ? <LoadingIcon /> : "Submit"}
                </Button>
              </footer>
            </form>
          ),
        },
        {
          title: "Delete Franchise",
          className: "max-w-lg",
          open: openModalDelete,
          setOpen: setOpenModalDelete,
          modalChild: (
            <>
              <main className="mb-10 mt-4">
                <p className="text-sm text-neutral-80">
                  Are you sure you want to delete this franchise? Deleted
                  franchise cannot be recovered.
                </p>
              </main>
              <footer className="flex w-full justify-end gap-3">
                <Button
                  className="!h-10"
                  size="md"
                  variant="default-nude"
                  onClick={() => {
                    setOpenModalDelete(false);
                    setSelectedFranchiseId("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="md"
                  variant="error-bg"
                  disabled={isLoading}
                  onClick={() => {
                    handleDeleteFranchise();
                  }}
                  className="!w-[74px] !h-10"
                >
                  {isLoading ? <LoadingIcon /> : "Submit"}
                </Button>
              </footer>
            </>
          ),
        },
        {
          title: "Edit Franchise",
          className: "max-w-4xl",
          open: openModalEdit,
          setOpen: setOpenModalEdit,
          modalChild: (
            <>
              <main className="my-10 flex flex-col items-center justify-center gap-6">
                {modalStep.page}
              </main>

              <footer className="flex justify-end gap-3 mt-4">
                <Button
                  size="md"
                  variant="primary-bg"
                  disabled={isLoading}
                  onClick={async () => {
                    handleEditFranchise();
                  }}
                  className="!w-[74px] !h-10"
                >
                  {isLoading ? <LoadingIcon /> : "Submit"}
                </Button>
              </footer>
            </>
          ),
        },
      ],
      addAction: () => {
        setErrors({});
        setNewFranchise(DEFAULT_DATA);
        setOpenModalAddFrenchise(true);
      },
      alerts: [
        <Alerts
          key="alert-franchise-added"
          variant="success"
          open={openSuccess}
          setOpen={setOpenSuccess}
          title="Franchise has been added"
          desc="Franchise has been added, You can manage this franchise or add additional information as needed."
        />,
        <Alerts
          key="alert-franchise-added-error"
          variant="error"
          open={openError}
          setOpen={setOpenError}
          title="Franchise has not been added"
          desc={responseErrors}
        />,
        <Alerts
          key="alert-franchise-deleted"
          variant="success"
          open={openDeleteAlerts}
          setOpen={setOpenDeleteAlerts}
          title="Franchise has been deleted"
          desc="Franchise has been deleted. Please review any adjustments to your records as necessary."
        />,
        <Alerts
          key="alert-franchise-edited-error"
          variant="error"
          open={openErrorEdit}
          setOpen={setOpenErrorEdit}
          title="Franchise has not been edited"
          desc={responseErrors}
        />,
        <Alerts
          key="alert-franchise-edited"
          variant="success"
          open={openEditAlerts}
          setOpen={setOpenEditAlerts}
          title="Franchise has been edited"
          desc="Franchise has been edited. Please review any adjustments to your records as necessary."
        />,
      ],
    }),
  };
  return (
    franchisesTableData && (
      <UI8Table
        data={franchisesTableData?.results as any}
        config={tableConfig}
      />
    )
  );
};

export default FranchisesPage;
