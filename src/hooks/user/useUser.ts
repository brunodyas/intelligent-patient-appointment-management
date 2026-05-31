import { ChangeEvent, useState } from "react";

export const useUser = () => {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<any>();
  const [blob, setBlob] = useState<any>();

  const handleChangeFile = (files: File[]) => {
    const currentFile = files && files[0];
    if(!currentFile) return;
    setFile(URL.createObjectURL(currentFile));
    setBlob(currentFile);
  };

  const setDefault = (photo: string) => {
    if (photo) {
      setFile(photo);
    }
  };

  const onChangeStep = (value: number) => {
    setStep(value);
  };

  const reset = () => { 
    setStep(1);
    setFile(null);
    setBlob(null);
  }

  return {
    step,
    file,
    blob,
    setFile,
    handleChangeFile,
    onChangeStep,
    setDefault,
    reset
  };
};
