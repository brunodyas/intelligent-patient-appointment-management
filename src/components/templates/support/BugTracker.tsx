"use client";

import { LoadingIcon } from "@/assets/icons";
import { Input, Selectbox } from "@/components/atomics";
import Button from "@/components/atomics/Button";
import { priorityData } from "@/data";
import { Option } from "@/interface/manufacturers";
import { createBugTracker } from "@/services/support";
import { useState } from "react";
import { useJune } from "@/hooks/useJune";

interface FormProps {
  description: string;
  screenshot_link: string;
  priority: string;
}

type Props = {
  setOpenSuccess: (value: boolean) => void;
  setOpenSupportModal: (value: boolean) => void;
};

export default function BugTracker({
  setOpenSuccess,
  setOpenSupportModal,
}: Props) {
  const defaultFormData = {
    description: "",
    screenshot_link: "",
    priority: "Low",
  };
  const [formData, setFormData] = useState<FormProps>(defaultFormData);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const analytics = useJune();

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.description) newErrors.description = "Issue is required";
    if (!formData.screenshot_link)
      newErrors.screenshot_link =
        "Screenshot link or recording link is required";
    if (formData.screenshot_link) {
      const screenshotLinkRegex = new RegExp(
        "^(http|https|ftp)://([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&amp;%$-]+)*@)*((25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]).(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0).(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0).(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])|localhost|([a-zA-Z0-9-]+.)*[a-zA-Z0-9-]+.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(/($|[a-zA-Z0-9.,?'\\+&amp;%$#=~_-]+))*$"
      );
      if (!screenshotLinkRegex.test(formData.screenshot_link)) {
        newErrors.screenshot_link = "Invalid link format";
      }
    }
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
      await createBugTracker(formData);
      analytics?.track("createBugTracker");
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
      <div className="text-md font-semibold p-5 border-b">Report a Bug</div>
      <div className="p-5">
        <div id="form_description">
          <Input
            isRequired
            id="description"
            type="textarea"
            variant="default"
            label="Please describe your issue"
            placeholder="Enter Description"
            handleTextAreaChange={(e) => handleChange(e, "description")}
            value={formData.description}
          />
          {errors.description && errors.description && (
            <span className="text-red-500 text-xs">{errors.description}</span>
          )}
        </div>

        <div id="form_screenshot_link" className="mb-1">
          <Input
            isRequired
            id="screenshot_link"
            variant="default"
            label="Screenshot link or recording link"
            placeholder="Enter Link"
            handleChange={(e) => handleChange(e, "screenshot_link")}
            value={formData.screenshot_link}
          />
          {errors.screenshot_link && errors.screenshot_link && (
            <span className="text-red-500 text-xs">
              {errors.screenshot_link}
            </span>
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
          className="!w-[82px] !h-10"
          onClick={handleSubmit}
        >
          {isLoading ? <LoadingIcon /> : "Submit"}
        </Button>
      </div>
    </div>
  );
}
