import { addDocument } from "@/services/documents";
import { ChangeEvent, useState } from "react";
import { useJune } from "@/hooks/useJune";

export const useDocument = () => {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<{
    base64: string | null;
    name: string | null;
  }>({ base64: null, name: null });
  const analytics = useJune();

  const handleChangeFile = (files: File[]) => {
    const currentFile = files && files[0];

    if (currentFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result?.toString().split(",")[1] || null;
        setFile({
          base64: base64String,
          name: currentFile.name,
        });
      };
      reader.readAsDataURL(currentFile);
    }
  };

  const onChangeStep = (value: number) => {
    setStep(value);
  };

  const handleSubmitFile = async () => {
    if (file) {
      try {
        addDocument({
          file_name: file?.name,
          linked_job: 2,
          file: file?.base64,
        });
        analytics?.track("addDocument");
      } catch (e) {
        throw e;
      }
    }
  };

  return {
    step,
    file,
    handleChangeFile,
    onChangeStep,
    handleSubmitFile,
  };
};
