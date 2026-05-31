"use client"
import {
    Sheet as RelumeSheet,
    SheetPortal,
    SheetContent,
} from "@relume_io/relume-ui";

interface Sheet {
    children: React.ReactNode
    className: string
    open: boolean
    setOpen: (value: boolean) => void
};

const Sheet: React.FC<Sheet> = ({ children, setOpen, open,className }) => {
    return (
        <RelumeSheet open={open} onOpenChange={setOpen}>
            <SheetPortal>
                <SheetContent className={className}>
                    {children}
                </SheetContent>
            </SheetPortal>
        </RelumeSheet>
    )
}

export default Sheet;