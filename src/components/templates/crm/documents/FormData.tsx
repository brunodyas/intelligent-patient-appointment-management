import { CheckIcon, UploadSimpleIcon } from "@/assets/icons";
import { Button } from "@/components/atomics";
import { useDocument } from "@/hooks/crm/useDocument";
import { addDocument } from "@/services/documents";
import { useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import ListJobView from "../jobs/ListView";
import Spinner from "@/components/atomics/Spinner";
import { useJune } from "@/hooks/useJune";

type Props = {
  hideModal: () => void;
  refetch: () => void;
  openSuccess: boolean;
  setOpenSuccess: (val: boolean) => void;
};

const DocumentFormData = ({ hideModal, refetch, setOpenSuccess }: Props) => {
  const { step, file, handleChangeFile, onChangeStep } = useDocument();
  const [selectedJob, setSelectedJob] = useState<any>();
  const [loading, setLoading] = useState(false);
  const analytics = useJune();

  const { getRootProps } = useDropzone({
    onDrop: (files) => handleChangeFile(files),
  });

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const response = await addDocument({
        linked_job: selectedJob?.id,
        file: file,
      });
      analytics?.track("addDocument");
      if (response) {
        refetch();
        hideModal();
        setOpenSuccess(true);
        setLoading(false);
      }
    } catch (e) {
      throw e;
    }
  };

  const modalSteps = [
    {
      stepName: "Upload File",
      description: "",
      canSkip: false,
      page: (
        <div className="grid w-full grid-cols-1 gap-6">
          <div
            {...getRootProps({ className: "dropzone" })}
            className="relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-netral-30 bg-netral-15 py-14"
          >
            <UploadSimpleIcon className="mb-5 h-8 w-8 text-netral-50" />

            <Button size="sm" variant="primary-bg" className="mb-2">
              Choose File
            </Button>
            <h5 className="text-xs text-netral-50">
              {file ? file.name : "or drop file to upload"}
            </h5>
          </div>
        </div>
      ),
    },
    {
      stepName: "Link Job",
      description:
        'You can create or select a job below, or click "Skip" in the bottom right to proceed without linking a job',
      canSkip: false,
      page: (
        <div className="grid w-full max-h-[380px] overflow-auto grid-cols-1 gap-6">
          <ListJobView
            setSelectedJob={setSelectedJob}
            selectedJob={selectedJob}
            isSelectJob={true}
          />
        </div>
      ),
    },
  ];

  const disabled = useMemo(() => {
    switch (step) {
      case 1:
        return !file.base64;
      default:
        break;
    }
  }, [step, file]);

  return (
    <div className="relative space-y-6 p-6">
      <main className="my-10 flex flex-col items-center justify-center gap-10">
        <nav className="relative w-fit">
          <div className="absolute left-1/2 top-5 -z-10 h-0.5 w-10/12 -translate-x-1/2 bg-neutral-40"></div>
          <section className="flex items-center justify-center gap-20">
            {modalSteps.map((value, key) => (
              <div className="flex flex-col items-center gap-2" key={key}>
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-full border ${step > key
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

      <footer className="flex justify-end gap-3">
        <Button
          className="!h-10"
          size="md"
          variant="primary-nude"
          disabled={loading}
          onClick={() => {
            if (step === 1) {
              hideModal();
            } else {
              onChangeStep(step - 1);
            }
          }}
        >
          {step === 1 ? "Cancel" : "Previous"}
        </Button>

        <Button
          size="md"
          className={`!min-w-24 !h-10 ${loading && "!p-2"}`}
          variant="primary-bg"
          onClick={() => {
            if (step === modalSteps.length) {
              handleSubmit();
            } else {
              onChangeStep(step + 1);
            }
          }}
          disabled={disabled || loading}
        >
          {step === modalSteps.length ? (
            loading ? (
              <>
                <Spinner />
              </>
            ) : (
              "Submit"
            )
          ) : modalSteps[step - 1]?.canSkip ? (
            "Skip"
          ) : (
            "Next"
          )}
        </Button>
      </footer>
    </div>
  );
};
export default DocumentFormData;
