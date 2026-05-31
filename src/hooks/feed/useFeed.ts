import { ChangeEvent, useState } from "react";

export const useFeed = () => {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<any>({ base64: null, name: null });
  const [blob, setBlob] = useState<any>();
  const [fileName, setFileName] = useState<any>();
  
  const handleChangeFile = (files: File[]) => {
    const currentFile = files && files[0];
    if(!currentFile) return;
    setFile(URL.createObjectURL(currentFile));
    setFileName(currentFile.name);
    setBlob(currentFile);
  };

  const setDefault = (photo: string, name?: string) => {
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
    setFileName(null);
  }

  return {
    step,
    file,
    blob,
    fileName,
    reset,
    handleChangeFile,
    onChangeStep,
  };
};
