"use client";

import { CheckIcon, DeleteIcon, LoadingIcon } from "@/assets/icons";
import { Button } from "@/components/atomics";
import { Modal } from "@/components/molecules";
import { useEffect, useMemo, useState } from "react";
import ConfigQuestion from "./ConfigQuestion";
import { AudioRecorder, useAudioRecorder } from "react-audio-voice-recorder";
import { createConfig } from "@/services/config";
import { questionsData } from "@/constants/enums/config";
import { CreateConfigResponse } from "@/interface/config";
// import FilterForm from "../FilterForm";
import { useJune } from "@/hooks/useJune";

type Props = {
  setOpenAddConfig: (value: boolean) => void;
  openAddConfig: boolean;
  questions?: string;
  jobId?: number;
  setOpenGenerateConfig: (value: boolean) => void;
  setConfigId: (value: number) => void;
};

const DEFAULT_DATA = {
  config_name: "",
  blind_width_in: "",
  blind_height_in: "",
  filter_questions_answers: [],
};

const AddConfigModal = ({
  openAddConfig,
  setOpenAddConfig,
  questions,
  jobId,
  setOpenGenerateConfig,
  setConfigId,
}: Props) => {
  const [formData, setFormData] = useState(DEFAULT_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<number>(1);
  const [audioURL, setAudioURL] = useState<string>("");
  const [audioFile, setAudioFile] = useState<File>();
  const analytics = useJune();
  const recorderControls = useAudioRecorder(
    {
      noiseSuppression: true,
      echoCancellation: true,
    },
    (err) =>
      console.log(
        "Permission denied. Please allow the website to use your microphone."
      )
  );

  const isRecording = recorderControls.isRecording;

  const startRecording = () => {
    recorderControls.startRecording();
  };

  const stopRecording = () => {
    recorderControls.stopRecording();
  };

  const deleteRecording = () => {
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
      setAudioURL("");
    }
  };

  useEffect(() => {
    if (!openAddConfig) {
      setStep(1);
      setFormData(DEFAULT_DATA);
    }
  }, [openAddConfig]);

  const isRequiredFilled = (): boolean => {
    return (
      formData.config_name.length === 0 ||
      formData.blind_width_in.length === 0 ||
      formData.blind_height_in.length === 0
    );
  };
  const modalSteps = [
    {
      stepName: "Config Filter",
      description: "",
      canSkip: false,
      page: (<></>)
    },
    {
      stepName: "Questions",
      description: "",
      canSkip: false,
      page: <ConfigQuestion setFormData={setFormData} questions={questions} />,
    },
  ];

  const onChangeStep = (value: number) => {
    setStep(value);
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      if (audioFile) {
        const response = await createConfig({
          ...formData,
          linked_job: jobId,
          appointment_recording: audioFile,
        });
        setConfigId(response.id);
      } else {
        const response = await createConfig({
          ...formData,
          linked_job: jobId,
        });
        setConfigId(response.id);
      }
      analytics?.track("createConfig");
    } catch (e) {
      setIsLoading(false);
      throw e;
    } finally {
      setIsLoading(false);
      setOpenAddConfig(false);
      setOpenGenerateConfig(true);
    }
  };

  const disabled = useMemo(() => {
    switch (step) {
      case 1:
        return false;
      default:
        break;
    }
  }, [step]);

  return (
    <Modal
      variant="primary"
      className="border-2 border-primary-border"
      title="Filter"
      open={openAddConfig}
      setOpen={setOpenAddConfig}
    >
      <div className="relative space-y-6 p-6">
        <main className="my-10 flex flex-col items-center justify-center gap-10">
          <nav className="relative w-fit">
            <div className="absolute left-1/2 top-5 -z-10 h-0.5 w-11/12 -translate-x-1/2 bg-neutral-40"></div>
            <section className="flex items-start justify-center gap-20 max-md:gap-12 max-smx:gap-8 max-sm:gap-5 max-xsm:gap-2">
              {modalSteps.map((value, key) => (
                <div className="flex flex-col items-center gap-2" key={key}>
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-full border ${
                      step > key
                        ? "border-primary-main bg-primary-main"
                        : "border-neutral-50 bg-neutral-50"
                    } text-xl sm:text-body-xl font-semibold text-white`}
                  >
                    {step > 0 && step <= key + 1 && key + 1}

                    {step > key + 1 && (
                      <CheckIcon className="h-6 w-6 text-white" />
                    )}
                  </span>

                  <h5 className="text-xs font-semibold text-neutral-50">
                    {value.stepName}
                  </h5>
                </div>
              ))}
            </section>
          </nav>
          <header className="space-y-2 text-center">
            <h3 className="text-xl sm:text-body-xl font-semibold">
              {modalSteps[step - 1].stepName}
            </h3>
            <p className="text-xs sm:text-sm text-neutral-50">
              {modalSteps[step - 1].description}
            </p>
          </header>
          {modalSteps[step - 1].page}
        </main>

        <footer className="gap-3">
          <div className="">
            <div className="w-full flex my-4">
              <label className="text-sm font-semibold text-neutral-100 max-sm:text-xs my-auto">
                Record Appointment
              </label>
              <div className="flex gap-3 ml-4">
                {!audioURL && (
                  <Button
                    onClick={isRecording ? stopRecording : startRecording}
                    size="md"
                    variant={isRecording ? "tab-selected" : "tab-unselect"}
                    className="!rounded-lg !h-10"
                  >
                    <div className="h-4 w-4 rounded-full bg-red-600" />
                    {isRecording ? "Stop Recording" : "Record"}
                  </Button>
                )}
              </div>
            </div>
            {audioURL && (
              <div className="flex">
                <audio controls>
                  <source src={audioURL} type="audio/wav" />
                </audio>
                <button onClick={deleteRecording} className="ml-4">
                  <DeleteIcon className="w-8 h-8 flex-shrink-0 text-black hover:text-[#FF5630]" />
                </button>
              </div>
            )}
            <AudioRecorder
              onRecordingComplete={(blob) => {
                setAudioURL(URL.createObjectURL(blob));
                setAudioFile(
                  new File([blob], "recording.mp3", { type: blob.type })
                );
              }}
              recorderControls={recorderControls}
              showVisualizer={true}
              classes={{
                AudioRecorderStartSaveClass: "hidden",
                AudioRecorderPauseResumeClass: "hidden",
                AudioRecorderDiscardClass: "hidden",
                AudioRecorderStatusClass: "w-full",
              }}
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button
              className="!h-10"
              size="md"
              variant="primary-nude"
              onClick={() => {
                if (step === 1) {
                  setOpenAddConfig(false);
                } else {
                  onChangeStep(step - 1);
                }
              }}
            >
              {step === 1 ? "Cancel" : "Previous"}
            </Button>

            <Button
              className="w-24 !h-10"
              size="md"
              variant="primary-bg"
              onClick={async () => {
                if (step === modalSteps.length) {
                  await handleSubmit();
                } else {
                  onChangeStep(step + 1);
                }
              }}
              disabled={isRequiredFilled()}
            >
              {isLoading ? (
                <LoadingIcon />
              ) : step === modalSteps.length ? (
                "Submit"
              ) : modalSteps[step - 1]?.canSkip ? (
                "Skip"
              ) : (
                "Next"
              )}
            </Button>
          </div>
        </footer>
      </div>
    </Modal>
  );
};

export default AddConfigModal;
