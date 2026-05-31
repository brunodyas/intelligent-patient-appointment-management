import { useEffect, useState } from 'react';
import Picker from 'react-mobile-picker';

const padNumber = (num: number) => num.toString().padStart(2, '0');

const selections: any = {
    hours: Array.from({ length: 12 }, (_, i) => padNumber(i+1)),
    minutes: Array.from({ length: 60 }, (_, i) => padNumber(i)),
    unit: ['AM', 'PM']
};

interface Props {
    id: string;
    variant: string;
    placeholder?: string;
    value?: any;
    onChange: (time: string) => void;
}

const TimePicker = ({ id, variant, placeholder, value, onChange }: Props) => {
    const [pickerValue, setPickerValue] = useState({
        hours: '--',
        minutes: '--',
        unit: '--'
    });
    const [isPickerOpen, setIsPickerOpen] = useState(false);

    useEffect(() => {
        if (value) {
            const [hours, minutes] = value.split(':').map(Number);

            let formattedHours = hours % 12;
            formattedHours = formattedHours === 0 ? 12 : formattedHours; // Convert '0' hours to '12' for 12-hour format
            
            const unit = hours >= 12 ? 'PM' : 'AM';
            
            setPickerValue({
                hours: formattedHours.toString().padStart(2, '0') || '--',
                minutes: minutes.toString().padStart(2, '0') || '--',
                unit: unit,
            });
        }
    }, [value]);

    const convertTo24HourFormat = (hours: string, minutes: string, unit: string) => {
        let convertedHours = parseInt(hours, 10);
    
        if (unit === 'AM' && convertedHours === 12) {
            convertedHours = 0; // 12 AM is 00:00 in 24-hour format
        } else if (unit === 'PM' && convertedHours !== 12) {
            convertedHours += 12; // Convert PM to 24-hour format, except for 12 PM
        }
    
        return {
            hoursIn24: convertedHours.toString().padStart(2, '0'),
            minutesIn24: minutes.toString().padStart(2, '0'),
        };
    }

    const handleFocus = () => {
        setIsPickerOpen(true);
    };

    const handleBlur = () => {
        setTimeout(() => {
            setIsPickerOpen(false);
        }, 200);
    };
    
    const handleChange = (value: { hours: string; minutes: string; unit: string }) => {
        let { hours, minutes, unit } = value;
    
        // Case 1: If unit is selected and hours and minutes are "--"
        if ((unit === 'AM' || unit === 'PM') && (hours === '--' && minutes === '--')) {
            hours = '12';
            minutes = '00';
        }
    
        // Case 2: If minutes are selected and hours and unit are "--"
        if (minutes !== '--' && (hours === '--' && unit === '--')) {
            hours = '12';
            unit = 'AM';
        }
    
        // Case 3: If hours are selected and minutes and unit are "--"
        if (hours !== '--' && (minutes === '--' && unit === '--')) {
            minutes = '00';
            unit = 'AM';
        }
    
        // Convert the adjusted time to 24-hour format
        const { hoursIn24, minutesIn24 } = convertTo24HourFormat(hours, minutes, unit);
    
        // Update the state with the adjusted values
        setPickerValue({ hours, minutes, unit });
    
        // Call the onChange function with the 24-hour formatted time
        onChange(`${hoursIn24 === '--' ? '00' : hoursIn24}:${minutesIn24 === '--' ? '00' : minutesIn24}`);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Prevent updating the input directly
    };

    return (
        <>
            <input
                id={id}
                name={id}
                className={`relative z-0 w-full rounded-lg border p-3 text-sm font-normal text-neutral-80 shadow-1 outline-none ring-[2.5px] ring-transparent transition-all duration-300 ease-out placeholder:text-neutral-50 2xl:p-3.5 ${
                    (variant === 'default' &&
                        'border-neutral-30 focus:border-primary-main focus:ring-primary-surface disabled:bg-neutral-20 disabled:overflow-x-scroll') ||
                    (variant === 'default-error' &&
                        'border-error-border/50 focus:border-error-main focus:ring-error-surface') ||
                    (variant === 'phone' &&
                        'border-neutral-30 pl-24 focus:border-primary-main focus:ring-primary-surface disabled:bg-neutral-20 2xl:pl-[102px]') ||
                    (variant === 'phone-error' &&
                        'border-error-border/50 pl-24 focus:border-error-border focus:ring-error-surface 2xl:pl-[102px]') ||
                    (variant === 'currency' &&
                        'border-neutral-30 pl-16 focus:border-primary-main focus:ring-primary-surface disabled:bg-neutral-20 2xl:pl-16') ||
                    (variant === 'discount' &&
                        'border-neutral-30 pl-16 focus:border-primary-main focus:ring-primary-surface disabled:bg-neutral-20 2xl:pl-16') ||
                    (variant === 'logo' &&
                        'border-neutral-30 pl-28 focus:border-primary-main focus:ring-primary-surface disabled:bg-neutral-20 2xl:pl-28') ||
                    (variant === 'logo-error' &&
                        'border-error-border/50 pl-28 focus:border-error-border focus:ring-error-surface 2xl:pl-28') ||
                    (variant === 'text' &&
                        'border-neutral-30  focus:border-primary-main focus:ring-primary-surface disabled:bg-neutral-20 ')
                }`}
                placeholder={placeholder ?? 'Please add your placeholder'}
                value={`${pickerValue.hours}:${pickerValue.minutes} ${pickerValue.unit}`}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onChange={handleInputChange}
            />

            {isPickerOpen && (
                <div className="!bg-white border border-gray-300 rounded-md !shadow-lg z-10 max-w-[150px] absolute">
                    <Picker
                        value={pickerValue}
                        onChange={handleChange}
                        wheelMode={'normal'}
                        height={100}
                        itemHeight={40}
                        className="!w-[150px] absolute"
                    >
                        {Object.keys(selections).map(name => (
                            <Picker.Column key={name} name={name}>
                                {selections[name].map((option: any) => (
                                    <Picker.Item key={option} value={option} className="text-base">
                                        {option}
                                    </Picker.Item>
                                ))}
                            </Picker.Column>
                        ))}
                    </Picker>
                </div>
            )}
        </>
    );
};

export default TimePicker;
