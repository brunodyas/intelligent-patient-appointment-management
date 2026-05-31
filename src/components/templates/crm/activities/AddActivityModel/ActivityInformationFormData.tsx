import React, { useState } from 'react'
import { Input } from "@/components/atomics";
import FormSelect from "@/components/atomics/FormSelect";
import moment from 'moment';
import { DateFormat } from '@/interface/activities';
import { activitiesTypes } from '@/constants/constants';


type Props = {
    setAddActivityFormData: (val: any) => void;
    addActivityFormData: Record<string, any>;
    isCalender?: Boolean
};

const ACTIVITY_TYPES_OPTIONS = [
    { label: "Call", value: "Call" },
    { label: "Deadline", value: "Deadline" },
    { label: "Email", value: "Email" },
    { label: "Meeting", value: "Meeting" },
    { label: "Task", value: "Task" }
]

const MEETING_TYPES_OPTIONS = [
    { label: 'Select Meeting Type', value: '' },
    { label: 'In Person', value: 'In Person' },
    { label: 'Virtual', value: 'Virtual' }
];

export const ActivityInformationFormData = ({ addActivityFormData, setAddActivityFormData, isCalender }: Props) => {
    // const [stageOptions, setStageOption] = useState<string>('');
    // const [meetingType, setMeetingType] = useState<string>('');

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setAddActivityFormData((prevState: any) => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleDateChange = (date: DateFormat) => {
        const { year, month, day } = date;

        const newDate = moment(`${year}-${month}-${day}`, "YYYY-M-D").format("YYYY-MM-DD");

        setAddActivityFormData((prevState: any) => ({
            ...prevState,
            due_date: newDate
        }));
    };

    const handleTimeChange = (time: string) => {
        setAddActivityFormData((prevState: any) => ({
            ...prevState,
            start_time: time
        }));
    }

    const handleChangeSelect = (name: string, selectedOption: string) => {
        if (name === "activity_type") {
            if (selectedOption !== "Meeting" && addActivityFormData.meeting_type !== null) {
                setAddActivityFormData((prevState: Record<any, any>) => ({
                    ...prevState,
                    activity_type: selectedOption,
                    meeting_type: null,
                    meeting_location: null,
                    meeting_link: null
                }))
            }
        };
        if (name === 'meeting_type') {
            setAddActivityFormData((prevState: Record<any, any>) => ({
                ...prevState,
                meeting_type: selectedOption,
            }))
        };

        setAddActivityFormData((prevState: any) => ({
            ...prevState,
            [name]: selectedOption
        }));
    }
    console.log("meeeting Type:", addActivityFormData)
    return (
        <div className="grid w-full grid-cols-2 min-[535px]:gap-6 gap-4">
            <Input
                id='activity_name'
                variant='default'
                label='Title'
                placeholder='Enter title'
                handleChange={handleChange}
                value={addActivityFormData.activity_name}
                isRequired
            />
            <Input
                id='due_date'
                type={'date'}
                variant='default'
                label='Activity Date'
                value={addActivityFormData.due_date}
                placeholder='Enter date '
                handleDateChange={handleDateChange}
            />
            <Input
                id='duration'
                variant='default'
                label='Duration (In Minutes)'
                type='number'
                placeholder='Enter duration'
                handleChange={handleChange}
                value={addActivityFormData.duration}
                isRequired
            />
            <Input
                id='start_time'
                type='time'
                variant='default'
                label='Activity Time'
                value={addActivityFormData.start_time}
                placeholder='Enter start time'
                handleTimeChange={handleTimeChange}
            />
            <FormSelect
                onChange={handleChangeSelect}
                name="activity_type"
                label="Activity Type"
                datas={ACTIVITY_TYPES_OPTIONS}
                selectedNow={false}
                defaultSelected={addActivityFormData.activity_type}
            />
            {addActivityFormData.activity_type === "Meeting" && (
                <>
                    <FormSelect
                        onChange={handleChangeSelect}
                        name="meeting_type"
                        label="Meeting Type"
                        datas={MEETING_TYPES_OPTIONS}
                        selectedNow={false}
                        defaultSelected={addActivityFormData.meeting_type}
                    />
                    {addActivityFormData.meeting_type === "Virtual" && (
                        <Input
                            id='meeting_link'
                            variant='default'
                            label='Meeting Link'
                            placeholder='Enter meeting link'
                            handleChange={handleChange}
                            value={addActivityFormData.meeting_link}
                        />
                    )}
                    {addActivityFormData.meeting_type === "In Person" && (
                        <Input
                            id='meeting_location'
                            variant='default'
                            label='Meeting Location'
                            placeholder='Enter meeting location'
                            handleChange={handleChange}
                            value={addActivityFormData.meeting_location}
                        />
                    )}
                </>
            )}
        </div>
    )
}
