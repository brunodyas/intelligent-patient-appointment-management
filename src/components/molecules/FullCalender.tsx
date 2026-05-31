import React, { ReactNode, useState } from 'react';
import moment from 'moment';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Modal } from '@/components/molecules';  // Adjust the import path as necessary
import { DateSelectArg } from '../templates/crm/activities/CalendarPage';

interface CalendarConfig {
    title: string;
    calssName: string;
    open: boolean;
    setOpen: (isOpen: boolean) => void;
    modalChild: ReactNode;
}

interface CalendarProps {
    calendarConfig: CalendarConfig[] | any;
    events: any;
    EventCustomeEventView?: any
    eventFormat?: (event: any) => any
    handleEventClick: (eventInfo: any) => void
    openCalendarModal: boolean;
    onDateClick: (arg: DateSelectArg) => void;
    onDateRangeChange: (start_date: string, end_date: string) => void;
}

const Calendar: React.FC<CalendarProps> = ({
    calendarConfig,
    events,
    EventCustomeEventView,
    eventFormat,
    openCalendarModal,
    handleEventClick,
    onDateClick,
    onDateRangeChange
}) => {
    const [showTodayButton] = useState(true);

    const handleDatesSet = (arg: { start: Date; end: Date; startStr: string; endStr: string }) => {
        const start_date = moment(arg.start).format('MM-DD-YYYY');
        const end_date = moment(arg.end).format('MM-DD-YYYY');
        onDateRangeChange(start_date, end_date);
    };

    return (
        <div className='activity-calendar mt-10 mx-10 max-xxl:m-0 max-xxl:pt-4'>
            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                dateClick={onDateClick}
                events={eventFormat ? events.map(eventFormat) : events}
                eventClick={handleEventClick}
                datesSet={handleDatesSet}
                viewClassNames={''}
                
                eventContent={
                    EventCustomeEventView
                        ? (eventInfo) => <EventCustomeEventView event={eventInfo.event} />
                        : undefined
                }
                headerToolbar={{
                    start: 'title',
                    right: `${showTodayButton ? 'today,' : ''}prev,next,dayGridMonth,timeGridWeek,timeGridDay`
                }}
                dayMaxEventRows={2}
                eventTimeFormat={{ hour: '2-digit', minute: '2-digit', meridiem: 'short' }}
            />
            {openCalendarModal &&
                calendarConfig.map((modalConfig: any, index: any) => (
                    <Modal
                        key={index}
                        variant="primary"
                        className={modalConfig.className}
                        title={modalConfig.title}
                        open={modalConfig.open}
                        setOpen={modalConfig.setOpen}
                    >
                        {modalConfig.modalChild}
                    </Modal>
                ))
            }
        </div>
    );
};

export default Calendar;
