"use client"

import React, { useMemo, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Event, SlotInterface } from './AppointmentsSchedule';
import moment from 'moment';
import { DateSelectArg } from '../../crm/activities/CalendarPage';
import { Button } from '@/components/atomics';
import { Modal } from '@/components/molecules';

interface Props {
  availableSlots: SlotInterface[]
  setSelectedAppointment: (appointment: Event) => void;
  selectedAppointment?: Event
  setDateRange: (range: {start: string, end: string}) => void
}

interface EventInterface { 
  start:string; 
  end: string;
  display: string
  groupId: string
  backgroundColor: string
}

const EventCustomEventView = (eventData: any) => {
  const { event } = eventData;
  const isWithoutTime = event?.startStr === moment(event?.startStr).format('YYYY-MM-DD');
  const startStr = moment(event?.startStr).format('hh:mm A');
  const endStr = moment(event?.endStr).format('hh:mm A');

  return event._def.groupId !== "available-events" ? (
    <div>
      <div>
        {!isWithoutTime && <span className="event-time">{startStr}-{endStr}</span>}&nbsp;&nbsp;
        <div className="font-semibold">{event?.title}</div>
      </div>
      <div>
        {event?.extendedProps?.activityType && (
          <b>Activity Type: {event?.extendedProps?.activityType}</b>
        )}
      </div>
    </div>
  ) : null;
}

const AppointmentCalendar: React.FC<Props> = ({ availableSlots, setSelectedAppointment, selectedAppointment, setDateRange }) => {
  const [openError, setOpenError] = useState(false)

  const handleEventClick = (eventInfo: any) => {
    const eventId = eventInfo.event.id;
    console.log(`${eventId} + clicked`)
  }

  const selectAllow = ({start, end}: any) => {
    const dateKey = start.toISOString().substring(0, 10);

    if (availableSlotsDict[dateKey]) {
      return availableSlotsDict[dateKey].some(range => {
        const startTime = `${dateKey}T${range.start_time}:00`;
        const endTime = `${dateKey}T${range.end_time}:00`;
        return start >= new Date(startTime) && end <= new Date(endTime);
      });
    }
    return false;
  }

  const onTimeClicked = (arg: DateSelectArg) => {
    const start =  arg.dateStr.slice(0,19)
    
    const endDate = new Date(start);
    endDate.setHours(endDate.getHours() + 2);

    const offset = endDate.getTimezoneOffset() * 60000;
    const end = new Date(endDate.getTime() - offset).toISOString().slice(0, 19);
    
    if(selectAllow({start: new Date(start), end: new Date(end)})) {
      const startTime = arg.dateStr;
      const endDate = new Date(startTime);
      endDate.setHours(endDate.getHours() + 2);
      const endTime = endDate.toLocaleString('sv-SE', { timeZoneName: 'short' }).slice(0, 19).replace(" ", "T");

      setSelectedAppointment((
        {
          title: "Technician Appointment",
          start: startTime.slice(0, 19),
          end: endTime
        }
      ));
    } else {
      setOpenError(true)
    }
  }

  const availableSlotsDict = useMemo(() => {
    let dict: {[key:string]: { start_time: string; end_time: string }[]} = {};  
    availableSlots.forEach(({ date, available_ranges }) => dict[date] = available_ranges)
    return dict
  }, [availableSlots])

  const availableEvents = useMemo(() => {
    let events: EventInterface[] = []

    availableSlots.forEach(({ date, available_ranges }) => {
      const rangeEvents = available_ranges.map(({ start_time, end_time }) => ({
        start: `${date}T${start_time}`,
        end: `${date}T${end_time}`,
        display: "inverse-background",
        groupId: "available-events",
        // backgroundColor: "#c63d7fde"
        backgroundColor: "transparent",
        className: "unavailable-slot"
      }))

      events = [...events, ...rangeEvents]
    })
    return events
    
  }, [availableSlots])

  const handleDatesSet = (arg: { start: Date; end: Date; startStr: string; endStr: string }) => {
    const start = moment(arg.start).format('YYYY-MM-DD');
    const end = moment(arg.end).format('YYYY-MM-DD');
    setDateRange({start, end});
  }

  return (
    <div className="appointment-calendar mr-10 max-xxl:m-0 max-xxl:pt-4">
      <FullCalendar 
        plugins={[timeGridPlugin, interactionPlugin]}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'timeGridDay,timeGridWeek'
        }}
        datesSet={handleDatesSet}
        slotMinTime="08:00:00"
        slotMaxTime="19:00:00"
        selectable={true}
        dateClick={onTimeClicked}
        initialView="timeGridWeek"
        events={selectedAppointment ? [...availableEvents, selectedAppointment] : availableEvents}
        eventClick={handleEventClick}
        eventTimeFormat={{ hour: '2-digit', minute: '2-digit', meridiem: 'short' }}
        eventContent={
          EventCustomEventView
            ? (eventInfo) => <EventCustomEventView event={eventInfo.event} />
            : undefined
          }
        allDaySlot={false}
        selectAllow={selectAllow}
      />
      <Modal
        variant='primary'
        open={openError}
        title='Appointment Time Unavailable'
        className='max-w-lg border-2 border-primary-border'
        setOpen={setOpenError}
      >
        <main className='mb-10 mt-4'>
          <p className='text-body-base text-neutral-80'>
            The selected time cannot accommodate the required 2-hour appointment duration. The time immediately following your selection is unavailable. Please select a different time that allows for the full 2-hour appointment.
          </p>
        </main>

        <footer className='flex w-full justify-end gap-3'>
          <Button
            size='md'
            variant='primary-outline'
            onClick={() => {
              setOpenError(false)
            }}
          >
            Close
          </Button>
        </footer>
      </Modal>
    </div>
  );
};

export default AppointmentCalendar;
