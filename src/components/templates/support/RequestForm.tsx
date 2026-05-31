"use client";

import { LoadingIcon } from "@/assets/icons";
import { Input, Selectbox } from "@/components/atomics";
import Button from "@/components/atomics/Button";
import { priorityData } from "@/data";
import { Option } from "@/interface/manufacturers";
import { createRequest } from "@/services/support";
import { useState } from "react";
import { useJune } from "@/hooks/useJune";

interface FormProps {
  description: string;
  priority: string;
}

type Props = {
  setOpenSuccess: (value: boolean) => void;
  setOpenSupportModal: (value: boolean) => void;
};

export default function RequestForm({
  setOpenSuccess,
  setOpenSupportModal,
}: Props) {
  const defaultFormData = {
    description: "",
    priority: "Low",
  };
  const [formData, setFormData] = useState<FormProps>(defaultFormData);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const analytics = useJune();

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.description) newErrors.description = "Issue is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: any, name: string) => {
    setFormData({ ...formData, [name]: e.target.value });
  };

  const handlePriorityTypeChange = (value: Option) => {
    setFormData({
      ...formData,
      priority: value.name,
    });
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      setIsLoading(true);
      await createRequest(formData);
      analytics?.track("createRequest");
      setOpenSuccess(true);
      setOpenSupportModal(false);
    } catch (e) {
      throw e;
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="border rounded-xl">
      <div className="text-md font-semibold p-5 border-b">Request</div>
      <div className="p-5 min-h-[300px]">
        <div id="form_description">
          <Input
            isRequired
            id="description"
            type="textarea"
            variant="default"
            label="Please describe your request"
            placeholder="Enter Description"
            handleTextAreaChange={(e) => handleChange(e, "description")}
            value={formData.description}
          />
          {errors.description && errors.description && (
            <span className="text-red-500 text-xs">{errors.description}</span>
          )}
        </div>

        <Selectbox
          variant="default"
          label="Priority Type"
          datas={priorityData}
          selectedNow={false}
          handleChange={handlePriorityTypeChange}
          selectedData={formData.priority}
        />
      </div>
      <div className="text-md font-semibold p-5 border-t flex w-full justify-end">
        <Button
          size="md"
          disabled={isLoading}
          variant="primary-bg"
          className="!w-[82px] !h-9"
          onClick={handleSubmit}
        >
          {isLoading ? <LoadingIcon /> : "Submit"}
        </Button>
      </div>
    </div>
  );
}
