"use client";

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { Device, Call } from "@twilio/voice-sdk";
import { endCall, getCallerNumber, getTwilioToken, updateCall } from "@/services/phoneCall";
import { CallAction } from "@/interface/phoneCall";
import { useAuth } from "@/context/auth";
import { set } from "react-hook-form";
import { useJune } from "@/hooks/useJune";
import { USER_ROLES } from "@/constants/enums/roles";

interface CallContextType {
  device: Device | null;
  call: Call | null;
  phoneNumber: string;
  ready: boolean;
  incomingCall: Call | null;
  isMakingOutboundCall: boolean;
  pickedCall: Call | null;
  callerName: string | null;
  makeCall: (number: string) => Promise<void>;
  hangUp: () => void;
  hangUpOutGoingCall: () => void;
  acceptCall: () => void;
  rejectCall: () => void;
  setPhoneNumber: (number: string) => void;
  onNewCall: (callback: () => void) => () => void;
  holdCall: () => void;
  resumeCall: () => void;
  hangUpAll: () => void;
  activeCalls: any[];
  setCurrentCallSid: (sid: string) => void;
  currentCallSid: string | null;
  muteCall: () => void;
  unmuteCall: () => void;
  mutePickedCall: () => void;
  unmutePickedCall: () => void;
  isBusy: boolean;
  setTwilioNumberRef: (ref: React.MutableRefObject<string | null>) => void;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

export const CallProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [device, setDevice] = useState<Device | null>(null);
  const [call, setCall] = useState<Call | null>(null);
  const [pickedCall, setPickedCall] = useState<Call | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [callerName, setCallerName] = useState<string>("");
  const [ready, setReady] = useState<boolean>(false);
  const [incomingCall, setIncomingCall] = useState<Call | null>(null);
  const [signedToken, setSignedToken] = useState<string>("");
  const incomingCallAcceptedRef = useRef(false);

  // const incomingCallSound = useRef<HTMLAudioElement | null>(
  //   typeof Audio !== "undefined"
  //     ? new Audio(
  //         "https://cdn.freesound.org/previews/740/740422_2675894-lq.mp3"
  //       )
  //     : null
  // );
  const userInteractedRef = useRef<boolean>(false);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const newCallListeners = useRef<(() => void)[]>([]);
  const [hold, setHold] = useState<boolean>(false);
  const [isMakingOutboundCall, setIsMakingOutboundCall] =
    useState<boolean>(false);
  const [activeCalls, setActiveCalls] = useState<any[]>([]);
  const [currentCallSid, setCurrentCallSid] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [callSid, setCallSid] = useState("");
  const [isBusy, setIsBusy] = useState(false);

  const analytics = useJune();

  //saving device identity here
  const [identity, setIdentity] = useState("");
  const { user } = useAuth();

  const twilioNumberRef = useRef<string | null>(null);

  const setTwilioNumberRef = (ref: React.MutableRefObject<string | null>) => {
      twilioNumberRef.current = ref.current;
  };

  // Hang up all active calls
  const hangUpAll = () => {
    activeCalls.forEach(async (call) => {
      call.disconnect();
      try {
        await endCall({ call_sid: call.parameters.CallSid });
        console.log("Call ended");
      } catch (error) {
        console.error("Error ending call:", error);
      }
    });
    setActiveCalls([]);
    setCall(null);
    setHold(false);
    setIsMakingOutboundCall(false);
    setCurrentCallSid(null);
    unmuteCall();
    setIsMuted(false); // Reset mute state
  };

  // Handle user interaction for sound
  const handleUserInteraction = () => {
    userInteractedRef.current = true;
    // if (incomingCallSound.current) {
    //   const audioElement = incomingCallSound.current;
    //   audioElement.muted = true;
 
    //   audioElement
    //     .play()
    //     .then(() => {
    //       // Add an event listener for the 'ended' event
    //       audioElement.addEventListener("ended", () => {
    //         // Unmute the audio after it has finished playing
    //         audioElement.muted = false;
    //       });
    //     })
    //     .catch((error) => {
    //       console.error("Error playing sound:", error);
    //     });
    // }
    window.removeEventListener("click", handleUserInteraction);
    window.removeEventListener("keydown", handleUserInteraction);
  };

  useEffect(() => {
    // Add event listeners to track user interaction
    window.addEventListener("click", handleUserInteraction);
    window.addEventListener("keydown", handleUserInteraction);

    return () => {
      window.removeEventListener("click", handleUserInteraction);
      window.removeEventListener("keydown", handleUserInteraction);
    };
  }, []);

  useEffect(() => {

    const checkBusyStatus = () => {
      const currentBusyState = device?.isBusy || false;
      setIsBusy(currentBusyState);
    };
    
    const intervalId = setInterval(checkBusyStatus, 1000); // Poll every second
    return () => clearInterval(intervalId); // Cleanup
  }, [device]);

  useEffect(() => {
    console.log("Usseffect triggered for twilio device ")
    const setupTwilioDevice = async () => {
      try {
        const response = await getTwilioToken();
        const { token, signed_be_token, identity } = response;

        if (!token) {
          console.error("Token is undefined in the response.");
          return;
        }

        setSignedToken(signed_be_token);
        setIdentity(identity);

        if (token) {
          console.log("Setting Twilio device");

          const twilioDevice = new Device(token, {
            logLevel: "debug",
            closeProtection: "true",
          });
          console.log("Twilio device set");
          twilioDevice.on("registered", () => {
            console.log("Twilio Device registered");
            setReady(true);
          });

          twilioDevice.on("error", (error: any) => {
            console.error("Twilio.Device Error:", error);
          });


          console.log("Setting up incoming call listener");
          twilioDevice.on("incoming", async (call) => {
            console.log("Incoming call detected from twilio");
            console.log("Incoming call properties:", call);
            setIncomingCall(call);
            incomingCallAcceptedRef.current = false;
            const callerNumberResponse = await getCallerNumber(call.parameters.CallSid);
            setPhoneNumber(callerNumberResponse.number);
            setCallerName(callerNumberResponse?.caller_name ?? '')

            call.on("disconnect", () => {
              setIsMakingOutboundCall(false);
              setCurrentCallSid(null);
              incomingCallAcceptedRef.current = false; 
              setCall(null);
              unmuteCall();
              setIsMuted(false);
              setPickedCall(null);
              setPhoneNumber("loading...");
              console.log("Call was disconnected");
            });
            call.on("cancel", () => {
              if (!incomingCallAcceptedRef.current) {
                setIsMakingOutboundCall(false);
                setCurrentCallSid(null);
                setCall(null);
                setIncomingCall(null);
                unmuteCall();
                setPickedCall(null);
                setIsMuted(false);
                setPhoneNumber("loading...");
                incomingCallAcceptedRef.current = false;
                console.log("Call was cancelled");
              }
            });
          });

          await twilioDevice.register();
          setDevice(twilioDevice);
        } else {
          console.error("Token not found in response:", response);
        }
      } catch (error) {
        console.error("Error fetching Twilio token:", error);
      }
    };

    // if (typeof window !== "undefined" && user?.early_access) {
    //   setupTwilioDevice();
    // }
    setupTwilioDevice();
    return () => {
      if (device) {
        console.log("Destroying Twilio device");
        device.destroy();
      }
    };
  }, [user]);

  const makeCall = async (number: string) => {
    const cleanedNumber = `+1${number.replace(/\D/g, "")}`;

    if (
      device &&
      ready &&
      cleanedNumber &&
      signedToken &&
      /^\+1\d{10}$/.test(cleanedNumber)
    ) {
      setIsMakingOutboundCall(true);
      const options = {
        params: { To: cleanedNumber, signed_be_token: signedToken, outboundNumber: twilioNumberRef.current || "" },
      };
      const conn = await device.connect(options);
      setCall(conn);

      conn.on("accept", () => {
        const callSid = conn.parameters.CallSid;
        console.log("Call SID:", callSid);
        setActiveCalls((prev) => [...prev, conn]);
        setCurrentCallSid(callSid);
        unmuteCall();
      });

      conn.on("disconnect", () => {
        setCall(null);
        setHold(false);
        setIsMakingOutboundCall(false);
        setCurrentCallSid(null);
        unmuteCall();
        setIsMuted(false);
        setPickedCall(null);
        setPhoneNumber("loading...");
        console.log("Call was disconnected");
      });
    } else {
      console.error("Twilio Device not ready or phone number is empty");
    }
  };

  const acceptCall = async () => {
    if (incomingCall) {
      try {
        incomingCall.accept();
        incomingCallAcceptedRef.current = true;
        console.log("Incoming call accepted");
        setPickedCall(incomingCall);
        const callerNumberResponse = await getCallerNumber(incomingCall.parameters.CallSid);
        setPhoneNumber(callerNumberResponse.number);
        setCallerName(callerNumberResponse?.caller_name ?? '')
        console.log(incomingCall.parameters)
        setCurrentCallSid(incomingCall.parameters.CallSid);
        setHold(false);
        setIncomingCall(null);
        unmuteCall();
        setIsMuted(false);
        
      } catch (error) {
        console.error("Error accepting incoming call:", error);
      }
    } else {
      console.error("No incoming call to accept");
    }
  };

  const rejectCall = () => {
    if (incomingCall) {
      incomingCall.reject();
      console.log("Incoming call rejected");
      setIncomingCall(null);
      incomingCallAcceptedRef.current = false;
    }
  };

  const hangUp = () => {
    if (pickedCall) {
      pickedCall.disconnect();
      setPickedCall(null);
      setPhoneNumber("loading...");
      console.log("Call hung up");
      setCall(null);
      setCurrentCallSid(null);
    }
  };

  const hangUpOutGoingCall = () => {
    if (call) {
      call.disconnect();
      setPickedCall(null);
      setPhoneNumber("loading...");
      console.log("Call hung up");
      setCall(null);
      setCurrentCallSid(null);
    }
  };

  // Update holdCall to send a 'hold' action
  const holdCall = async () => {
    if (currentCallSid) {
        try {
            console.log("Placing call on hold, Call SID:", currentCallSid);
            await updateCall({
                call_sid: currentCallSid,
                action: CallAction.Hold,  // Use 'hold' action
            });
            setHold(true);
            console.log("Call on hold");
        } catch (error) {
            console.error("Error holding call:", error);
        }
    } else {
        console.error("Call Sid Not found");
    }
  };

  // Update resumeCall to send an 'unhold' action
  const resumeCall = async () => {
    if (currentCallSid) {
        try {
            console.log("Resuming call, Call SID:", currentCallSid);
            await updateCall({
                call_sid: currentCallSid,
                action: CallAction.Resume,  // Use 'unhold' action
            });
            setHold(false);
            console.log("Call resumed from hold");
        } catch (error) {
            console.error("Error resuming call:", error);
        }
    } else {
        console.error("Call Sid Not found");
    }
  };

  const muteCall = () => {
    if (call) {
      try {
        call.mute();
        setIsMuted(true);
        console.log("Call muted");
      } catch (error) {
        console.error("Error muting the call:", error);
      }
    } else {
      console.error("No active call to mute");
    }
  };

  const unmuteCall = () => {
    if (call) {
      try {
        call.mute(false);
        setIsMuted(false);
        console.log("Call unmuted");
      } catch (error) {
        console.error("Error unmuting the call:", error);
      }
    } else {
      console.error("No active call to unmute");
    }
  };

  const mutePickedCall = () => {
    if (pickedCall) {
      try {
        pickedCall.mute();
        setIsMuted(true);
        console.log("Call muted");
      } catch (error) {
        console.error("Error muting the call:", error);
      }
    } else {
      console.error("No active call to mute");
    }
  };

  const unmutePickedCall = () => {
    if (pickedCall) {
      try {
        pickedCall.mute(false);
        setIsMuted(false);
        console.log("Call unmuted");
      } catch (error) {
        console.error("Error unmuting the call:", error);
      }
    } else {
      console.error("No active call to unmute");
    }
  };


  const muteTab = () => {
    const mediaElements = document.querySelectorAll('audio, video');
    mediaElements.forEach((mediaElement) => {
      (mediaElement as HTMLMediaElement).muted = true;
    });
  
    if (typeof AudioContext !== 'undefined') {
      const audioCtx = new AudioContext();
      audioCtx.suspend(); 
    }
  
    setIsMuted(true);  
  };

  const unMuteTab = () => {
    const mediaElements = document.querySelectorAll('audio, video');
    mediaElements.forEach((mediaElement) => {
      (mediaElement as HTMLMediaElement).muted = false;
    });
  
    if (typeof AudioContext !== 'undefined') {
      const audioCtx = new AudioContext();
      audioCtx.resume();
    }
  
    setIsMuted(false);  
  };

  const onNewCall = useCallback((callback: () => void) => {
    newCallListeners.current.push(callback);
    return () => {
      newCallListeners.current = newCallListeners.current.filter(
        (cb) => cb !== callback
      );
    };
  }, []);

  return (
    <CallContext.Provider
      value={{
        isBusy,
        mutePickedCall,
        unmutePickedCall,
        hangUpOutGoingCall,
        device,
        callerName,
        call,
        phoneNumber,
        ready,
        incomingCall,
        isMakingOutboundCall,
        makeCall,
        hangUp,
        pickedCall,
        acceptCall,
        rejectCall,
        setPhoneNumber,
        onNewCall,
        holdCall,
        resumeCall,
        hangUpAll,
        activeCalls,
        setCurrentCallSid,
        currentCallSid,
        muteCall,
        unmuteCall,
        setTwilioNumberRef,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => {
  const context = useContext(CallContext);
  if (context === undefined) {
    throw new Error("useCall must be used within a CallProvider");
  }
  return context;
};