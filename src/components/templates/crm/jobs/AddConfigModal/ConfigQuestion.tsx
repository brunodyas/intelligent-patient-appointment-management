"use client";

import Input from "@/components/atomics/Input";
import { IoChatbubbleOutline } from "react-icons/io5";
import ReactMarkdown from "react-markdown";

type Props = {
  setFormData: (val: any) => void;
  questions?: string;
};

const ConfigQuestion = ({ setFormData, questions }: Props) => {
  const handleChangeTextArea = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFormData((prevState: any) => ({
      ...prevState,
      [name]: value,
    }));
  };

  return (
    <div className="w-full">
      {questions && 
      <div className=" bg-gray-100 rounded-lg flex mb-4">
        <div className="p-6 flex">
          <div className="px-2">
            <IoChatbubbleOutline className="mt-3 w-8 h-8 flex-shrink-0" />
          </div>
          <div className="shadow-md mx-auto">
            <ReactMarkdown>{questions}</ReactMarkdown>
          </div>
        </div>
      </div>
      }
      <Input
        id="technician_notes"
        type="textarea"
        variant="default"
        label="Notes"
        placeholder="Enter Notes"
        handleTextAreaChange={handleChangeTextArea}
      />
    </div>
  );
};

export default ConfigQuestion;