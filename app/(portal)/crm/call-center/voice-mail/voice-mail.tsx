"use client";
import React, { useEffect, useState } from "react";
import {
    VoiceMailsResults,
} from "@/interface/phoneCall";
import {  getVoiceMails } from "@/services/phoneCall";

import { useSelectCallCenter } from "@/context/callCenter";
import Ui6Table from "@/components/UI6Table";
import useFirstRender from "@/hooks/useFirstRender";
import { FranchiseProps } from "../page";

const VoiceMailPage: React.FC<FranchiseProps> = ({ franchiseKey,reFetch, handleRefetch }) => {
  const staticData = [
    {
      caller_number: "+123456789",
      twilio_number: "+198765432",
      Voice_mail:
        "",
    },
    {
      caller_number: "+987654321",
      twilio_number: "+112345678",
      Voice_mail:
        "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    },
    {
      caller_number: "+1122334455",
      twilio_number: "+198234567",
      Voice_mail:
        "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    },
  ];
  const { callVoicemail, setCallVoicemail } = useSelectCallCenter();
  const {firstRender, reset} = useFirstRender()
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [count, setCount] = useState(0);
  const [search, setSearch] = useState("");
  const [typeCheckbox, setTypeCheckbox] = useState<string>("");
  const [cancelSearch, setCancelSearch] = useState("");
  const [dateSearch, setDateSearch] = useState<string>("");
  const [isSort, setIsSort] = useState(false);

  const baseURL = "http://localhost:8000/voicemails/";

  const fetchVoiceMails = async (pageNumber: number | undefined) => {
    try {
      let pageForApi = pageNumber ? pageNumber : page;
      setLoading(true);
      const response = await getVoiceMails(pageForApi, dateSearch, search, isSort, franchiseKey);
      console.log(response);
      let callResults = response.results as VoiceMailsResults[];

      if (Array.isArray(callResults)) {
        setCallVoicemail(callResults);
        const totalRecords = response.count;
        setCount(totalRecords);
        setTotalPages(Math.ceil(totalRecords / 50));
      } else {
        console.error("Unexpected response format", callResults);
      }
    } catch (error) {
      console.error("Failed to fetch call history data", error);
    } finally {
      setLoading(false);
    }
  };
  


  useEffect(() => {
    !firstRender.current && fetchVoiceMails(undefined);
    reset();
  }, [page, isSort, reFetch]);

  useEffect(() => {
    setPage(1);
    fetchVoiceMails(1);
  }, [typeCheckbox, search, cancelSearch, dateSearch, franchiseKey]);


  const handleDateSearch = (date: string) => {
    setDateSearch(date);
  }

  const tableConfig = {
    tableName: "Voicemails",
    page,
    setPage,
    totalPages,
    count,
    typeCheckbox,
    setTypeCheckbox,
    search,
    setSearch,
    cancelSearch,
    setCancelSearch,
    isSort,
    setIsSort,
    handleDateSearch,
    handlePageChange: (newPage: number) => {
      setPage(newPage);
    },
    columns: {
      Caller_Number: {
        path: "caller_number",
        header: "Caller Number",
        type: "text",
        isPhoneNumber: true
      },
      Twilio_Number: {
        path: "twilio_number",
        header: "Recipient Number",
        type: "text",
        isPhoneNumber: true
      },
      franchise_name: {
        path: "franchise_name",
        header: "Franchise",
        type: "text",
      },
      date: {
        path: "created_at",
        header: "Date",
        type: "date",
        render: (value: string) => new Date(value).toLocaleDateString(),
      },
      time: {
        path: "created_at",
        header: "Time",
        type: "time",
        render: (value: string) => new Date(value).toLocaleTimeString(),
      },
      Voice_Mail: {
        path: "recording_stored_url",
        header: "Voice Mails",
        type: "custom",
        render: (voicemailFileName: string) => (
          <audio controls>
            <source src={voicemailFileName} type="audio/mpeg" />
          </audio>
        ),
      },
    },
  };

  return (
    <div className="voice-mail-page">
      <Ui6Table data={callVoicemail} config={tableConfig} />
    </div>
  );
};

export default VoiceMailPage;
