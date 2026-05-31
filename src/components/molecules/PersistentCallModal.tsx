"use client";

import React, { useRef, useEffect, useState } from "react";
import { useCall } from "@/context/callContext";
import Draggable from "react-draggable";
import formatPhoneForCall from "@/utils/formatPhoneForCall";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDeleteLeft,
  faLocationArrow,
  faMicrophone,
  faMicrophoneSlash,
  faPhone,
  faPhoneSlash,
} from "@fortawesome/free-solid-svg-icons";
import { FaUser } from "react-icons/fa";
import { useJune } from "@/hooks/useJune";
import { getActiveUsers } from "@/services/user";
import { twMerge } from "tailwind-merge";
import { updateCall } from "@/services/phoneCall";
import { CallAction } from "@/interface/phoneCall";
// import "./index.css";
interface PersistentCallModalProps {
  isVisible: boolean;
}

const PersistentCallModal: React.FC<PersistentCallModalProps> = ({
  isVisible,
}) => {
  const {
    call,
    pickedCall,
    callerName,
    phoneNumber,
    ready,
    incomingCall,
    makeCall,
    hangUp,
    acceptCall,
    rejectCall,
    setPhoneNumber,
    isMakingOutboundCall,
    currentCallSid,
    holdCall,
    resumeCall,
    activeCalls,
    hangUpAll,
    muteCall,
    unmuteCall,
    hangUpOutGoingCall,
    mutePickedCall,
    unmutePickedCall,
  } = useCall();

  const nodeRef = useRef<HTMLDivElement>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [hold, setHold] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [activeUsers, setActiveUsers] = useState<any>([]);
  const [selectedAgent, setSelectedAgent] = useState(""); // State for selected agent
  const [activeAgentsOpen, setActiveAgentsOpen] = useState(false);
  const [bounds, setBounds] = useState({
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  });
  const analytics = useJune();

  const modalStyle: React.CSSProperties = {
    transition: "opacity 0.3s ease-in-out",
    opacity: isVisible ? 1 : 0, // Control opacity directly with `isVisible`
    pointerEvents: isVisible ? "all" : "none",
  };

  //   console.log("Attempting to make a call with:", phoneNumber);
  //   if (phoneNumber && phoneNumber.length === 10) {
  //   makeCall(phoneNumber);
  // }

  const updateBounds = () => {
    if (!nodeRef.current) return;

    const modalWidth = nodeRef.current.offsetWidth;
    const modalHeight = nodeRef.current.clientHeight;

    setBounds({
      left: 0,
      top: 0,
      right: window.innerWidth - modalWidth,
      bottom: window.innerHeight - modalHeight,
    });
  };

  const getActiveAgents = async () => {
    try {
      const activeUsers = await getActiveUsers();
      setActiveUsers(activeUsers.online_users);
      await analytics?.track("getActiveAgents");
    } catch (e) {
      console.error("Error fetching active agents:", e);
    }
  };

  useEffect(() => {
    updateBounds();
    window.addEventListener("resize", updateBounds);
    getActiveAgents();
    return () => window.removeEventListener("resize", updateBounds);
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (call || incomingCall || pickedCall) {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timer);
      setCallDuration(0);
    }
    
    return () => clearInterval(timer);
  }, [call, incomingCall, pickedCall]);

  const formatDuration = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  const handleDial = (num: string) => {
    const cleanedNumber = (phoneNumber + num).replace(/\D/g, "");
    if (cleanedNumber.length <= 10) {
      setPhoneNumber(cleanedNumber);
    }
  };

  const handleBackspace = () => {
    setPhoneNumber(phoneNumber.slice(0, -1));
  };

  const [isHoldloading, setHoldLoading] = useState(false);


  const toggleHold = async () => {
    if (isHoldloading) return; 
  
    setHoldLoading(true);
  
    if (hold) {
      await resumeCall();
    } else {
      await holdCall();
    }
    setHold(!hold);
    setTimeout(() => {
      setHoldLoading(false);
    }, 1000);
  };

  const toggleHoldPickedCall = async () => {
    if (isHoldloading) return; 
  
    setHoldLoading(true);
    if (hold) {
      resumeCall();
    } else {
      holdCall();
    }
    setHold(!hold);
    setTimeout(() => {
      setHoldLoading(false);
    }, 1000);
  };

  const toggleMute = () => {
    if (isMuted) {
      unmuteCall();
    } else {
      muteCall();
    }
    setIsMuted(!isMuted);
  };

  const toggleMutePickedCall = () => {
    if (isMuted) {
      unmutePickedCall();
    } else {
      mutePickedCall();
    }
    setIsMuted(!isMuted);
  };

  const dialPadKeys = [
    { num: "1", letters: "" },
    { num: "2", letters: "ABC" },
    { num: "3", letters: "DEF" },
    { num: "4", letters: "GHI" },
    { num: "5", letters: "JKL" },
    { num: "6", letters: "MNO" },
    { num: "7", letters: "PQRS" },
    { num: "8", letters: "TUV" },
    { num: "9", letters: "WXYZ" },
    { num: "*", letters: "" },
    { num: "0", letters: "+" },
    { num: "#", letters: "" },
  ];

  const handleAgentChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAgent(event.target.value);
  };

  const handleCallTransfer = async () => {
    if (selectedAgent && currentCallSid) {
      await analytics?.track("transferCall");
      await updateCall({
        call_sid: currentCallSid,
        action: CallAction.Transfer,
        new_agent_identity: selectedAgent,
      });
      console.log("Transfering call to:", selectedAgent);
    }
  }

  const handleActiveAgentsClick = () => {
    
    console.log("Click Called", activeAgentsOpen);
    if(!activeAgentsOpen) {
      getActiveAgents();
      setActiveAgentsOpen(true);
    } else {
      setActiveAgentsOpen(false);
    }
  };

  function handleActiveAgentsBlur (){
    console.log("Click Blur Called");
    setActiveAgentsOpen(false);
  };

  const handleKeyDown = (event: any) => {
    if (/^[0-9]$/.test(event.key)) {
      handleDial(event.key);
    } else if (event.key === 'Backspace') {
      handleBackspace();
    }
  };

  return (
    <Draggable nodeRef={nodeRef} bounds={bounds} cancel=".no-drag">
      <div
        ref={nodeRef}
        style={modalStyle}
        className="fixed z-50 p-6  bg-white border-2 border-gray-300 rounded-lg shadow-2xl w-72 text-center"
      >
        {!call && !incomingCall && !pickedCall && (
          <div>
            <div className="py-2 text-xl border-b border-neutral-300 mb-4">
              {/* {phoneNumber ? (
                `+1 ${formatPhoneForCall(phoneNumber)}`
              ) : (
                <span className="text-body-lg font-normal text-neutral-50 transition-all duration-300">
                  Enter phone number
                </span>
              )} */}

              <input
                className={`!placeholder:text-center w-full bg-transparent font-normal text-xl focus-visible:outline-none ${
                  phoneNumber ? "text-center" : "text-left pl-[26px]"
                }`}
                maxLength={10}
                value={phoneNumber && `+1 ${formatPhoneForCall(phoneNumber)}`}
                placeholder="Enter phone number"
                onKeyDown={(e) => handleKeyDown(e)}
                autoFocus
              />
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              {dialPadKeys.map((key) => (
                <button
                  key={key.num}
                  onClick={() => handleDial(key.num)}
                  className="no-drag flex flex-col items-center justify-center w-16 h-16 rounded-full bg-neutral-300 text-black hover:bg-neutral-400 transition"
                >
                  <span className="text-xl">{key.num}</span>
                  <span className="text-[10px] tracking-wider">
                    {key.letters.split("").join(" ")}
                  </span>
                </button>
              ))}
              <div className="col-start-2 col-span-1 flex justify-center">
                <button
                  onClick={() =>
                    phoneNumber &&
                    phoneNumber.length === 10 &&
                    makeCall(phoneNumber)
                  }
                  disabled={
                    !(ready && phoneNumber && phoneNumber.length === 10)
                  }
                  className={`no-drag w-16 h-16 rounded-full transition ${
                    ready && phoneNumber && phoneNumber.length === 10
                      ? "bg-primary-main text-white hover:bg-primary-hover"
                      : "bg-neutral-400 text-neutral-500 "
                  }`}
                >
                  <FontAwesomeIcon
                    icon={faPhone}
                    className={`text-xl ${
                      ready && phoneNumber && phoneNumber.length === 10
                        ? "text-white"
                        : "text-primary-main"
                    }`}
                  />
                </button>
              </div>
              <div className="col-start-3 col-span-1 flex justify-center">
                <button
                  onClick={handleBackspace}
                  className="no-drag w-16 h-16 rounded-full text-black hover:bg-neutral-300 transition"
                >
                  <FontAwesomeIcon icon={faDeleteLeft} className="text-xl" />
                </button>
              </div>
            </div>
          </div>
        )}

        {call && (
          <>
            <div className="mb-4 flex items-center justify-between text-center">
              <select
                value={selectedAgent}
                onChange={handleAgentChange}
                onClick={handleActiveAgentsClick}
                onBlur={handleActiveAgentsBlur}
                style={{ display: "flex", whiteSpace: "pre-wrap" }}
                className="p-2 border relative  rounded-lg  bg-white !mt-[0.35rem] px-2  ring-2 ring-transparent placeholder:text-neutral-50 focus:border-primary-main focus:outline-none focus:ring-primary-surface/50 w-44"
              >
                <option value="" disabled>
                  Transfer To
                </option>
                {activeUsers?.length &&
                  activeUsers?.map((activeUser: any) => (
                    <option
                      key={activeUser.identity}
                      value={activeUser.identity}
                      className="hover:bg-[#fff1f7] "
                    >
                      {activeUser.name}
                    </option>
                  ))}
              </select>

              <div className="col-start-3 col-span-1 flex justify-center">
                <button
                  onClick={handleCallTransfer}
                  className={twMerge(
                    "flex items-center justify-center w-10 h-10 rounded-full transition no-drag",
                    !selectedAgent
                      ? "bg-neutral-300 hover:bg-neutral-400 text-black"
                      : "bg-primary-main hover:bg-primary-hover text-white"
                  )}
                  disabled={!selectedAgent}
                >
                  <FontAwesomeIcon icon={faLocationArrow} className="text-xl" />
                </button>
              </div>
            </div>
            <div className="p-1">
              <p className="text-lg font-medium">{phoneNumber}</p>
              {/* <p className="text-sm animate-pulse">Calling...</p> */}
              <p className="text-lg mb-4">{formatDuration(callDuration)}</p>
              <div className="text-[205px] text-[#e71e8d85] p-3 text-center pb-5">
                <FaUser />
              </div>
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={hangUpOutGoingCall}
                  className="flex items-center justify-center w-16 h-16 rounded-full bg-primary-main hover:bg-primary-hover text-white transition"
                >
                  <FontAwesomeIcon icon={faPhoneSlash} className="text-xl" />
                </button>
                <button
                  onClick={toggleHold}
                  disabled={isHoldloading}
                  className={`flex items-center justify-center w-16 h-16 rounded-full transition ${" bg-neutral-300 hover:bg-neutral-400 text-black"}`}
                >
                  {hold ? "Resume" : "Hold"}
                </button>
                <button
                  onClick={toggleMute}
                  className={`flex items-center justify-center w-16 h-16 rounded-full transition ${
                    isMuted
                      ? "bg-red-500 text-white"
                      : "bg-neutral-300 hover:bg-neutral-400 text-black"
                  }`}
                >
                  <FontAwesomeIcon
                    icon={isMuted ? faMicrophoneSlash : faMicrophone}
                    className="text-xl"
                  />
                </button>
              </div>
            </div>
          </>
        )}

        {pickedCall && (
          <>
            <div className="mb-4 flex items-center justify-between text-center">
              <select
                value={selectedAgent}
                onChange={handleAgentChange}
                onClick={handleActiveAgentsClick}
                onBlur={handleActiveAgentsBlur}
                style={{ display: "flex", whiteSpace: "pre-wrap" }}
                className="p-2 border relative  rounded-lg  bg-white !mt-[0.35rem] px-2   ring-2 ring-transparent placeholder:text-neutral-50 focus:border-primary-main focus:outline-none focus:ring-primary-surface/50 w-44"
              >
                <option value="" disabled>
                  Transfer To
                </option>
                {activeUsers?.length &&
                  activeUsers?.map((activeUser: any) => (
                    <option
                      key={activeUser.identity}
                      value={activeUser.identity}
                      className="hover:bg-[#fff1f7] "
                    >
                      {activeUser.name}
                    </option>
                  ))}
              </select>

              <div className="col-start-3 col-span-1 flex justify-center">
                <button
                  onClick={handleCallTransfer}
                  className={twMerge(
                    "flex items-center justify-center w-10 h-10 rounded-full transition ",
                    !selectedAgent
                      ? "bg-neutral-300 hover:bg-neutral-400 text-black"
                      : "bg-primary-main hover:bg-primary-hover text-white"
                  )}
                  disabled={!selectedAgent}
                >
                  <FontAwesomeIcon icon={faLocationArrow} className="text-xl" />
                </button>
              </div>
            </div>
            <div className="p-1">
              {phoneNumber ? (
                <>
                  {callerName ? <p className="text-lg font-medium">{callerName}</p> : <></>}
                  <p className="text-lg font-medium">
                    {phoneNumber.includes("+")
                      ? phoneNumber
                      : `+${phoneNumber}`}
                  </p>
                </>
              ) : (
                <p className="text-lg font-medium">No Caller Number</p>
              )}
              <p className="text-lg mb-4">{formatDuration(callDuration)}</p>
              <div className="text-[205px] text-[#e71e8d85] p-3 text-center pb-5">
                <FaUser />
              </div>
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={hangUp}
                  className="flex items-center justify-center w-16 h-16 rounded-full bg-primary-main hover:bg-primary-hover text-white transition"
                >
                  <FontAwesomeIcon icon={faPhoneSlash} className="text-xl" />
                </button>
                <button
                  onClick={toggleHoldPickedCall}
                  disabled={isHoldloading}
                  className={`flex items-center justify-center w-16 h-16 rounded-full transition ${" bg-neutral-300 hover:bg-neutral-400 text-black"}`}
                >
                  {hold ? "Resume" : "Hold"}
                </button>
                <button
                  onClick={toggleMutePickedCall}
                  className={`flex items-center justify-center w-16 h-16 rounded-full transition ${
                    isMuted
                      ? "bg-red-500 text-white"
                      : "bg-neutral-300 hover:bg-neutral-400 text-black"
                  }`}
                >
                  <FontAwesomeIcon
                    icon={isMuted ? faMicrophoneSlash : faMicrophone}
                    className="text-xl"
                  />
                </button>
              </div>
            </div>
          </>
        )}
        {incomingCall && !pickedCall && (
          <>
            <div>
              <p className="text-lg mb-4">Incoming call...</p>
              {callerName ? <p className="text-lg font-medium" >{callerName}</p> : <></>}
              <p className="text-lg font-medium">{phoneNumber}</p>
              <div className="text-[205px] text-[#e71e8d85] p-3 text-center pb-8">
                <FaUser />
              </div>
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={acceptCall}
                  className="flex items-center justify-center w-full gap-2 h-16 rounded-full bg-primary-main text-white hover:bg-primary-hover transition"
                >
                  <FontAwesomeIcon icon={faPhone} className="text-xl" /> Accept
                </button>
                <button
                  onClick={rejectCall}
                  className="flex items-center justify-center w-full gap-2 h-16 rounded-full bg-neutral-300 hover:bg-neutral-400 text-blacktransition"
                >
                  <FontAwesomeIcon icon={faPhoneSlash} className="text-xl" />{" "}
                  Reject
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </Draggable>
  );
};

export default PersistentCallModal;
