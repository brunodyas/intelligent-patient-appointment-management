"use client";

import { determineFranchise, getAppointmentsTimes } from "@/services/jobs";
import React, { useCallback, useEffect, useState } from "react";
import AppointmentCalendar from "./AppointmentCalendar";
import moment from "moment";
import { LoadingIcon } from "@/assets/icons";
import { useJune } from "@/hooks/useJune";
import { NewJob } from "@/interface/jobs";

type Props = {
  setForm: (job: any) => void;
  formData: NewJob;
  address: string;
  step: number;
  setStep: (step: number) => void;
  setFoundFranchise: (value: boolean) => void;
};

export interface Event {
  title: string;
  end: string;
  start: string;
}

export interface SlotInterface {
  date: string;
  available_ranges: {
    start_time: string;
    end_time: string;
  }[];
}

interface AppointmentTimesInterface {
  available_slots: SlotInterface[];
}

const today = moment();
const AppointmentsSchedule = ({ setFoundFranchise, address, formData, setForm, step, setStep }: Props) => {
  const [appointmentTimes, setAppointmentTimes] = useState<AppointmentTimesInterface>();
  const [selectedAppointment, setSelectedAppointment] = useState<Event>();
  const [isLoadingFranchise, setIsLoadingFranchise] = useState(true);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);
  const [franchise, setFranchise] = useState<number>();
  const [dateRange, setDateRange] = useState({
    start: today.startOf("week").format("YYYY-MM-DD").toString(),
    end: today.endOf("week").format("YYYY-MM-DD").toString(),
  });
  const analytics = useJune();

  const fetchFranchise = useCallback(async () => {
    try {
      const franchiseResponse = await determineFranchise({ address });
      analytics?.track("determineFranchise");
      setFranchise(franchiseResponse.franchise_id);
      setFoundFranchise(true)
    } catch (e) {
      console.error(e)
      setFoundFranchise(false)
    } finally {
      setIsLoadingFranchise(false)
    }
  }, [address])

  const fetchAppointmentTimes = useCallback(async () => {
    try {
      setIsLoadingAppointments(true)
      const appointmentsResponse = await getAppointmentsTimes({
        franchise_id: franchise,
        start_date: dateRange.start,
        end_date: dateRange.end,
        appointment_type: formData.pipeline,
      });
      analytics?.track("getAppointmentsTimes");
      setAppointmentTimes(appointmentsResponse);
    } catch (e) {
      throw e;
    } finally {
      setIsLoadingAppointments(false)
    }   
  }, [franchise, dateRange]);

  useEffect(() => {
    if (step === 3 && formData.consultation_date && formData.start_time) { //resets data and time if previously selected
      const {consultation_date, start_time, ...restOfForm } = formData
      setForm(restOfForm)
    }
    fetchFranchise();
  }, []);

  useEffect(() => {
       if (!isLoadingFranchise) {
      if (franchise) {
        fetchAppointmentTimes();
      } else {
        setStep(step+1)
      }
    }
  }, [isLoadingFranchise]);

  useEffect(() => {
    if (selectedAppointment) {
      const [consultation_date, start_time] = selectedAppointment.start.split("T");
      setForm((prevForm: any) => ({
        ...prevForm,
        consultation_date,
        start_time,
      }));
    }
  }, [selectedAppointment]);

  return (
    <div className="w-4/5 m-auto">
      <div className="w-full md:w-3/4 p-4 m-auto">
        {isLoadingFranchise || isLoadingAppointments ? (
          <div className="flex flex-col gap-2 items-center justify-center h-72">
            <LoadingIcon
              fill="#C63D7F"
              className="size-[2rem] flex justify-center items-center"
            />
          </div>
        ) : franchise && appointmentTimes 
        ? (
          <AppointmentCalendar
            availableSlots={appointmentTimes.available_slots}
            selectedAppointment={selectedAppointment}
            setSelectedAppointment={setSelectedAppointment}
            setDateRange={setDateRange}
          />
        ) : (
          <div className="flex flex-col h-56 items-center justify-center p-6">
            <p className="text-center text-gray-700 text-md mb-4">
              We couldn&apos;t find a franchise in your area, but we can still
              save your information for future jobs.
            </p>
          </div>
        )
        }
      </div>
    </div>
  );
};

export default AppointmentsSchedule;
