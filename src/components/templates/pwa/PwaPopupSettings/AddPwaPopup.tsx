import React from 'react';
import { HiDotsVertical } from 'react-icons/hi';
import { RxCross2 } from "react-icons/rx";
import { MdAddToHomeScreen, MdOutlineInstallMobile } from 'react-icons/md';
import { ImArrowUp, ImArrowDown } from 'react-icons/im';
import { GoShare } from "react-icons/go";
import { IoAddCircleOutline } from "react-icons/io5";
import { HiOutlineBars3 } from "react-icons/hi2";
import { LuShare } from "react-icons/lu";
import { FaRegSquarePlus } from "react-icons/fa6";
import { Button } from '@/components/atomics';

interface Props {
    closePrompt: () => void;
    doNotShowAgain: () => void;
    browserType: 'safari' | 'chrome' | 'firefox' | 'other' | 'firefoxIos' | 'chromeIos' | 'samsung' | '';
}


export default function AddToMobileChrome(props: Props) {
    const { closePrompt, doNotShowAgain, browserType } = props;

    const ChromePopup = () => (
        <>
            <ImArrowUp className="text-3xl absolute top-[10px] right-[10px] text-black z-10 animate-bounce" />
            <div className="relative top-full -translate-y-full -right-1/2 -translate-x-1/2 py-2 sm:py-3 px-5 text-black bg-white h-fit rounded-lg w-[90%] sm:w-[70%]">
                <button className="absolute top-0 right-0 p-2.5" onClick={closePrompt}>
                    <RxCross2 className="text-xl" />
                </button>
                <div className="relative bg-primary pb-4 pt-5 flex flex-col gap-2 sm:gap-3 md:gap-4 items-center text-center sm:px-2 mx-auto">
                    <p className="text-sm sm:text-base md:text-lg">For the best experience, we recommend installing the Bloomscale to your home screen!</p>
                    <div className="flex items-center text-sm sm:text-base md:text-lg">
                        <p>Please see above arrow and click on this
                            <HiDotsVertical className="text-xl md:text-2xl lg:text-4xl inline-block mx-1" />
                            icon</p>
                    </div>
                    <div className="flex flex-col gap-2 items-center text-sm sm:text-base md:text-lg w-full">
                        <p>Scroll down and then click:</p>
                        <div className="border border-black bg-zinc-50 flex justify-between items-center text-sm sm:text-base w-fit px-4 py-[7.5px] sm:py-2 rounded-lg text-zinc-900 gap-2 mb-1">
                            <MdAddToHomeScreen className="text-lg sm:text-xl" />
                            Add to Home Screen
                        </div>
                    </div>
                    <Button variant='primary-bg' className="border-2 py-[9px] px-4 rounded-lg text-sm" onClick={doNotShowAgain}>Don&apos;t show again</Button>
                </div>
            </div>
        </>
    );

    const SafariPopup = () => (
        <>
            <ImArrowDown className="text-3xl absolute bottom-2.5 left-1/2 translate-x-[-50%] text-white z-10 animate-bounce" />
            <div className="relative top-[95%] -translate-y-full -right-1/2 -translate-x-1/2 py-2 sm:py-3 px-5 text-black bg-white h-fit rounded-lg w-[90%] sm:w-[70%]">
                <button className="absolute top-0 right-0 p-2.5" onClick={closePrompt}>
                    <RxCross2 className="text-xl" />
                </button>
                <div className="relative bg-primary pb-4 pt-5 flex flex-col gap-2 sm:gap-3 items-center text-center sm:px-2 mx-auto">
                    <p className="text-sm sm:text-base md:text-lg">For the best experience, we recommend installing the Bloomscale app to your home screen!</p>
                    <div className="flex gap-2 items-center text-sm sm:text-base md:text-lg">
                        <p>Please see below arrow and click the
                            <GoShare className="text-2xl sm:text-3xl -mt-1 inline-block mx-1" />
                            icon </p>
                    </div>
                    <div className="flex flex-col gap-2 items-center text-sm sm:text-base md:text-lg w-full">
                        <p>Scroll down and then tap:</p>
                        <div className="bg-zinc-50 flex justify-between items-center text-sm sm:text-base w-fit px-4 py-[7.5px] sm:py-2 rounded-lg text-zinc-900 gap-2">
                            <p>Add to Home Screen</p>
                            <FaRegSquarePlus className="text-lg sm:text-xl" />
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 items-center text-lg w-full px-4">
                        <p className='text-sm sm:text-base md:text-lg'>Tap to Add on Home Screen:</p>
                        <div className='border border-black flex gap-1 items-center text-zinc-900 w-fit text-sm sm:text-base px-4 py-[7.5px] sm:py-2 bg-zinc-50 rounded-lg mb-1'>
                            <IoAddCircleOutline className='text-lg sm:text-xl' /><p>Add</p>
                        </div>
                    </div>
                    <Button variant='primary-bg' className="border-2 py-[9px] px-4 rounded-lg text-sm" onClick={doNotShowAgain}>Don&apos;t show again</Button>
                </div>
            </div>
        </>
    );

    const FirefoxPopup = () => (
        <>
            <ImArrowUp className="text-3xl absolute top-[10px] right-[10px] text-black z-10 animate-bounce" />
            <div className="relative top-full -translate-y-full -right-1/2 -translate-x-1/2 py-2 sm:py-3 px-5 text-black bg-white h-fit rounded-lg w-[90%] sm:w-[70%]">
                <button className="absolute top-0 right-0 p-3" onClick={closePrompt}>
                    <RxCross2 className="text-2xl" />
                </button>
                <div className="relative bg-primary pb-4 pt-8 h-full flex flex-col gap-2 sm:gap-3 items-center text-center sm:px-2 mx-auto">
                    <p className="text-sm sm:text-base md:text-lg">For the best experience, we recommend installing the Bloomscale app to your home screen!</p>
                    <div className="flex gap-2 items-center text-sm sm:text-base md:text-lg">
                        <p>Please see above arrow and click on this
                            <HiDotsVertical className="text-xl md:text-2xl lg:text-4xl inline-block mx-1" />
                            icon</p>
                    </div>
                    <div className="flex flex-col gap-2 items-center text-sm sm:text-base md:text-lg w-full">
                        <p>Then tap:</p>
                        <div className="border border-black bg-zinc-50 flex justify-between items-center w-fit px-4 py-[7.5px] sm:py-2 gap-2 rounded-lg text-zinc-900 mb-1">
                            <MdOutlineInstallMobile className="text-lg sm:text-xl" />
                            Add to Home screen
                        </div>
                    </div>
                    <Button variant='primary-bg' className="border-2 py-[9px] px-4 rounded-lg text-sm" onClick={doNotShowAgain}>Don&apos;t show again</Button>
                </div>
            </div>
        </>
    );

    const FirefoxIos = () => (
        <>
            <ImArrowDown className="text-3xl absolute bottom-2.5 right-4 text-black z-10 animate-bounce" />
            <div className="relative top-[95%] -translate-y-full -right-1/2 -translate-x-1/2 py-2 sm:py-3 px-5 text-black bg-white h-fit rounded-lg w-[90%] sm:w-[70%]">
                <button className="absolute top-0 right-0 p-3" onClick={closePrompt}>
                    <RxCross2 className="text-xl" />
                </button>
                <div className="relative bg-primary pb-4 pt-6 flex flex-col sm:gap-3 gap-2 items-center text-center sm:px-2 mx-auto">
                    <p className="text-sm sm:text-base md:text-lg">For the best experience, we recommend installing the Bloomscale app to your home screen!</p>
                    <div className="flex gap-2 items-center text-sm sm:text-base md:text-lg">
                        <p>Please see below arrow and click the <HiOutlineBars3 className="text-2xl sm:text-3xl -mt-0.5 inline-block" /> icon </p>
                    </div>
                    <div className="flex gap-2 items-center text-sm sm:text-base md:text-lg">
                        <p>Scroll down and then click <LuShare className="text-xl sm:text-2xl -mt-1 inline-block" /> button </p>
                    </div>
                    <div className="flex flex-col gap-1 items-center text-sm sm:text-base md:text-lg w-full">
                        <p>After that, press the following option:</p>
                        <div className="bg-zinc-50 flex justify-between items-center w-fit px-4 py-[7.5px] sm:py-2 gap-2 rounded-lg text-zinc-900">
                            <p>Add to Home Screen</p>
                            <FaRegSquarePlus className="text-lg sm:text-xl" />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1 items-center text-sm sm:text-base md:text-lg w-full">
                        <p>Tap to Add on Home Screen:</p>
                        <div className='border border-black flex gap-1 items-center text-zinc-900 w-fit px-4 py-[7.5px] sm:py-2 bg-zinc-50 rounded-lg mb-1'>
                            <IoAddCircleOutline className='text-lg sm:text-xl' /><p>Add</p>
                        </div>
                    </div>
                    <Button variant='primary-bg' className="border-2 py-[9px] px-4 rounded-lg text-sm" onClick={doNotShowAgain}>Don&apos;t show again</Button>
                </div>
            </div>
        </>
    );

    const ChromeIosPopup = () => (
        <>
            <ImArrowUp className="text-3xl absolute top-[10px] right-[10px] text-black z-10 animate-bounce" />
            <div className="relative top-full -translate-y-full -right-1/2 -translate-x-1/2 py-2 sm:py-3 px-5 text-black bg-white h-fit rounded-lg w-[90%] sm:w-[70%]">
                <button className="absolute top-0 right-0 p-3" onClick={closePrompt}>
                    <RxCross2 className="text-xl" />
                </button>
                <div className="relative bg-primary pb-4 pt-5 sm:pt-6 flex flex-col gap-2 sm:gap-3 md:gap-4 items-center text-center sm:px-2 mx-auto">
                    <p className="text-sm sm:text-base md:text-lg">For the best experience, we recommend installing the Bloomscale app to your home screen!</p>
                    <div className="flex gap-2 items-center text-sm sm:text-base md:text-lg">
                        <p>Please see above arrow and click on this
                            <GoShare className="text-xl md:text-2xl lg:text-4xl inline-block mx-1" />
                            icon</p>
                    </div>
                    <div className="flex flex-col gap-1 items-center text-sm sm:text-base md:text-lg w-full px-4">
                        <p>Scroll down and then click:</p>
                        <div className="bg-zinc-50 flex justify-between items-center w-fit px-4 py-[7.5px] sm:py-2 gap-2 rounded-lg text-zinc-900">
                            <p>Add to Home Screen</p>
                            <FaRegSquarePlus className="text-lg sm:text-xl" />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1 items-center text-sm sm:text-base md:text-lg w-full px-4">
                        <p>Tap to Add on Home Screen:</p>
                        <div className='border border-black flex gap-1 items-center text-zinc-900 w-fit px-4 py-[7.5px] sm:py-2 bg-zinc-50 rounded-lg mb-1'>
                            <IoAddCircleOutline className='text-lg sm:text-xl' /><p>Add</p>
                        </div>
                    </div>
                    <Button variant='primary-bg' className="border-2 py-[9px] px-4 rounded-lg text-sm" onClick={doNotShowAgain}>Don&apos;t show again</Button>
                </div>
            </div>
        </>
    );

    return (
        <>
            {browserType == "chrome" && <ChromePopup />}
            {browserType == "safari" && <SafariPopup />}
            {browserType == "firefox" && <FirefoxPopup />}
            {browserType == "firefoxIos" && <FirefoxIos />}
            {browserType == "chromeIos" && <ChromeIosPopup />}
            {browserType == "" || browserType == "other" && <></>}
        </>
    );
}


