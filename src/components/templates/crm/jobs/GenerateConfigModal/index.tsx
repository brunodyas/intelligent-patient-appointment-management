"use client";

import { Modal } from "@/components/molecules";
import {
  BlindInterface,
  CRMConfigByIdResponse,
  SelectedBlindPayload,
} from "@/interface/config";
import { CRMJob } from "@/interface/jobs";
import {
  createChosenConfig,
  filterBlindsFeatures,
  getConfigById,
} from "@/services/config";
import { configPurpose } from "@/utils/configPurpose";
import { useEffect, useMemo, useState } from "react";
import Blind from "./Blind";
import { Alerts, Button } from "@/components/atomics";
import { LoadingIcon } from "@/assets/icons";
import AddonColorPickerModal from "./AddonColorPickerModal";
import { useJune } from "@/hooks/useJune";

type Props = {
  open: boolean;
  setOpen: (isOpen: boolean) => void;
  configId: number;
  job: CRMJob;
};

const GenerateConfigModal = ({ open, setOpen, configId, job }: Props) => {
  const [config, setConfig] = useState<CRMConfigByIdResponse>();
  const [blinds, setBlinds] = useState<BlindInterface[]>();
  const [selectedBlind, setSelectedBlind] = useState<SelectedBlindPayload>();
  const [isLoading, setIsLoading] = useState(false);
  const [openAlertSuccess, setOpenAlertSuccess] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const analytics = useJune();

  const data = useMemo(() => {
    if (config) {
      const { blind_height_in, blind_width_in } = config;

      setSelectedBlind((prevSelectedBlind) => ({
        ...prevSelectedBlind,
        blind_width_in: parseInt(blind_width_in),
        blind_height_in: parseInt(blind_height_in),
      }));

      const purpose = configPurpose(config, job);
      return {
        purpose,
        blind_width_in,
        blind_height_in,
      };
    }
  }, [config, job]);

  useEffect(() => {
    const fetchConfigData = async () => {
      setIsGenerating(true);
      if (!config) {
        try {
          const response = await getConfigById(configId);
          analytics?.track("getConfigById");
          setConfig(response);
        } catch (e) {
          throw e;
        }
      }
    };

    const filter = async () => {
      if (data) {
        try {
          const response = await filterBlindsFeatures(data);
          analytics?.track("filterBlindsFeatures");
          setBlinds(response);
        } catch (e) {
          throw e;
        }
        setIsGenerating(false);
      }
    };
    fetchConfigData();
    filter();
  }, [configId, data]);

  const handleSubmit = async () => {
    if (config && selectedBlind) {
      setIsLoading(true);
      try {
        await createChosenConfig(config.id, selectedBlind);
        analytics?.track("createChosenConfig");
        setBlinds([]);
        setSelectedBlind(undefined);
        setIsLoading(false);
        setOpen(false);
        setOpenAlertSuccess(true);
      } catch (e) {
        throw e;
      }
    }
  };

  return (
    <>
      <Alerts
        key="alert-config-generated"
        variant="success"
        open={openAlertSuccess}
        setOpen={setOpenAlertSuccess}
        title="Product configuration has been generated"
        desc="Your product configuration has been successfully generated. Review the details in the table."
      />
      <Modal
        variant="primary"
        open={open}
        setOpen={setOpen}
        className="h-[85vh]"
        title="Generate Blind Configuration"
      >
        <div
          className={`${
            isGenerating && "w-full h-5/6 flex justify-center items-center"
          }`}
        >
          {isGenerating ? (
            <div className="flex flex-col gap-2 items-center justify-center">
              <LoadingIcon
                fill="#C63D7F"
                className="size-[2rem] flex justify-center items-center"
              />
              <p>
                Crafting your optimized blind configuration. This might take a
                moment...
              </p>
            </div>
          ) : (
            <>
              <div className="text-center">
                <h1 className="text-xl sm:text-body-xl font-semibold mt-[2rem]">
                  Compatible Blind{blinds?.length ? "s" : ""}
                </h1>
                <p className="text-xs sm:text-sm text-neutral-50 text-center ">
                  Customize for enhanced compatibility
                </p>
              </div>
              <div className="mt-4 flex gap-10 justify-center">
                {blinds &&
                  blinds.map((blind, index) => (
                    <Blind
                      key={index}
                      blindItem={blind}
                      selectedBlind={selectedBlind}
                      setSelectedBlind={setSelectedBlind}
                    />
                  ))}
              </div>
              <footer className="flex justify-end gap-3 mt-4">
                <Button
                  className="!h-10"
                  variant="primary-outline"
                  onClick={() => {
                    setSelectedBlind(undefined);
                    setOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="!h-10"
                  variant="primary-bg"
                  disabled={
                    selectedBlind === undefined ||
                    selectedBlind.blind === undefined
                  }
                  onClick={async () => {
                    await handleSubmit();
                  }}
                >
                  {isLoading ? <LoadingIcon /> : "Submit"}
                </Button>
              </footer>
            </>
          )}
        </div>
      </Modal>
    </>
  );
};

export default GenerateConfigModal;
