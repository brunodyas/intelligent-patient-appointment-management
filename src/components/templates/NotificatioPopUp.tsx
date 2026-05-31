import React from 'react'
import { RxCross2 } from "react-icons/rx";
import { ImArrowUp, ImArrowDown } from 'react-icons/im';
import { IoEllipsisVertical, IoMenu } from "react-icons/io5";
import { PiSlidersHorizontalBold } from 'react-icons/pi';
import { FiLock } from 'react-icons/fi';

interface Props {

    browserType: any;
    setOpenNotificationPopUp: React.Dispatch<React.SetStateAction<boolean>>
    isMobile: Boolean | null;
}

export default function NotificatioPopUp(props: Props) {
    const { browserType, setOpenNotificationPopUp, isMobile } = props;

    const ChromePopup = () => (
        <>
            <div className="relative top-[72px] -right-1/2 -translate-x-1/2 py-2 sm:py-3 px-5 text-black bg-white h-fit rounded-lg w-[90%] max-w-[700px] sm:w-[90%] md:w-[70%]">
                <button className="absolute top-0 right-0 p-2.5" onClick={() => setOpenNotificationPopUp(false)}>
                    <RxCross2 className="text-xl" />
                </button>
                <div className="relative bg-primary pb-4 pt-5 sm:pt-6 flex flex-col gap-2 sm:gap-3 md:gap-4 items-center text-center sm:px-2 mx-auto">
                    <p>You have blocked notifications. If you wish to enable them, please follow this steps.</p>
                    <div className='md:space-y-4 sm:space-y-3 space-y-2 w-fit mx-auto text-left'>
                        <p>1. Click the icon <PiSlidersHorizontalBold className="text-xl md:text-2xl inline-block mx-1" /> in the address bar (next to the URL).</p>
                        <p>2. Select &quot;Site Settings&quot; from the dropdown.</p>
                        <p>3. Under &quot;Permissions&quot;, find &quot;Notifications&quot; and set it to &quot;Allow&quot;.</p>
                    </div>
                </div>
            </div>

        </>
    );

    const SafariPopup = () => (
        <>
            <div className="relative top-[72px] -right-1/2 -translate-x-1/2 py-2 sm:py-3 px-5 text-black bg-white h-fit rounded-lg w-[90%] max-w-[700px] sm:w-[70%]">
                <button className="absolute top-0 right-0 p-2.5" onClick={() => setOpenNotificationPopUp(false)}>
                    <RxCross2 className="text-xl" />
                </button>
                <div className="relative bg-primary pb-4 pt-5 sm:pt-6 flex flex-col gap-2 sm:gap-3 md:gap-4 items-center text-center sm:px-2 mx-auto">
                    <p>You have blocked notifications. If you wish to enable them, please follow this steps.</p>
                    <div className='md:space-y-4 sm:space-y-3 space-y-2 w-fit mx-auto text-left'>
                        <p>1. Open Safari and click on &quot;Safari&quot; in the top menu.</p>
                        <p>2. Select &quot;Preferences&quot;, then go to the &quot;Websites&quot; tab.</p>
                        <p>3. Scroll down to &quot;Notifications&quot; on the left sidebar.</p>
                        <p>4. Find this website and set notifications to &quot;Allow&quot;.`</p>
                    </div>
                </div>
            </div>

        </>
    );

    const FirefoxPopup = () => (
        <>
            <ImArrowUp className="text-3xl absolute top-[0px] left-[290px] text-white z-10 animate-bounce" />
            <div className="relative top-[72px] -right-1/2 -translate-x-1/2 py-2 sm:py-3 px-5 text-black bg-white h-fit rounded-lg w-[90%] max-w-[700px] sm:w-[90%] md:w-[70%]">
                <button className="absolute top-0 right-0 p-2.5" onClick={() => setOpenNotificationPopUp(false)}>
                    <RxCross2 className="text-xl" />
                </button>
                <div className="relative bg-primary pb-4 pt-5 sm:pt-6 flex flex-col gap-2 sm:gap-3 md:gap-4 items-center text-center sm:px-2 mx-auto">
                    <p>You have blocked notifications. If you wish to enable them, please follow this steps.</p>
                    <div className='md:space-y-4 sm:space-y-3 space-y-2 w-fit mx-auto text-left'>
                        <p>1. Click the icon <PiSlidersHorizontalBold className="text-xl md:text-2xl inline-block mx-1" /> in the address bar.</p>
                        <p>2. Under Permission section remove the website from blocked list</p>
                        <p>2. Click &quot;More Information&quot; from the dropdown.</p>
                        <p>3. Go to the &quot;Permissions&quot; tab and locate &quot;Notifications&quot;.</p>
                        <p>4. Uncheck &quot;Use Default&quot; and select &quot;Allow&quot;.</p>
                    </div>
                </div>
            </div>

        </>
    );

    const FirefoxIos = () => (
        <>
            <div className="relative top-[72px] -right-1/2 -translate-x-1/2 py-2 sm:py-3 px-5 text-black bg-white h-fit rounded-lg w-[90%] max-w-[700px] sm:w-[70%]">
                <button className="absolute top-0 right-0 p-2.5" onClick={() => setOpenNotificationPopUp(false)}>
                    <RxCross2 className="text-xl" />
                </button>
                <div className="relative bg-primary pb-4 pt-5 sm:pt-6 flex flex-col gap-2 sm:gap-3 md:gap-4 items-center text-center sm:px-2 mx-auto">
                    <p>You have blocked notifications. If you wish to enable them, please follow this steps.</p>
                    <div className='md:space-y-4 sm:space-y-3 space-y-2 w-fit mx-auto text-left'>
                        <p>1. Click on the three horizontal lines <IoMenu className="text-xl md:text-2xl inline-block mx-1" /> in the upper right corner to open the menu.</p>
                        <p> 2. Select &quot;Preferences&quot; (or &quot;Settings&quot;).</p>
                        <p>3. In the left sidebar, click on &quot;Privacy & Security&quot;.</p>
                        <p>4. Scroll down to the &quot;Permissions&quot; section.</p>
                        <p>5. Next to &quot;Notifications&quot;, click on &quot;Settings&quot;.</p>
                        <p>6. Look for the website for which you want to unblock notifications.</p>
                        <p>7. Change the setting from &quot;Block&quot; to &quot;Allow.&quot;;</p>
                    </div>

                </div>
            </div>
        </>
    );

    const ChromeIosPopup = () => (
        <>
            <div className="relative top-[72px] -right-1/2 -translate-x-1/2 py-2 sm:py-3 px-5 text-black bg-white h-fit rounded-lg w-[90%] max-w-[700px] sm:w-[70%]">
                <button className="absolute top-0 right-0 p-2.5" onClick={() => setOpenNotificationPopUp(false)}>
                    <RxCross2 className="text-xl" />
                </button>
                <div className="relative bg-primary pb-4 pt-5 sm:pt-6 flex flex-col gap-2 sm:gap-3 md:gap-4 items-center text-center sm:px-2 mx-auto">
                    <p>You have blocked notifications. If you wish to enable them, please follow this steps.</p>
                    <div className='md:space-y-4 sm:space-y-3 space-y-2 w-fit mx-auto text-left'>
                        <p>1. Click the padlock icon <FiLock className="text-xl md:text-2xl inline-block mx-1" /> in the address bar (next to the URL).</p>
                        <p>2. Select &quot;Site Settings&quot; from the dropdown.</p>
                        <p>3. Under &quot;Permissions&quot;, find &quot;Notifications&quot; and set it to &quot;Allow&quot;.</p>
                    </div>
                </div>
            </div>
        </>
    );

    const ChromeMobilePopup = () => (
        <>
            <div className="relative top-[72px] -right-1/2 -translate-x-1/2 py-2 sm:py-3 px-5 text-black bg-white h-fit rounded-lg w-[90%] max-w-[700px] sm:w-[90%] md:w-[70%]">
                <button className="absolute top-0 right-0 p-2.5" onClick={() => setOpenNotificationPopUp(false)}>
                    <RxCross2 className="text-xl" />
                </button>
                <div className="relative bg-primary pb-4 pt-5 sm:pt-6 flex flex-col gap-2 sm:gap-3 md:gap-4 items-center text-center sm:px-2 mx-auto">
                    <p>You have blocked notifications. If you wish to enable them, please follow this steps.</p>
                    <div className='md:space-y-4 sm:space-y-3 space-y-2 w-fit mx-auto'>
                        <p>1. Click the icon <PiSlidersHorizontalBold className="text-xl md:text-2xl inline-block mx-1" /> in the address bar (next to the URL).</p>
                        <p>2. Select &quot;Permissions&quot; from the dropdown.</p>
                        <p>3. Under &quot;Permissions&quot;, find &quot;Notifications&quot; and set it to &quot;Allow&quot;.</p>
                    </div>
                </div>
            </div>

        </>
    );

    const FirefoxMobilePopup = () => (
        <>
            <ImArrowUp className="text-3xl absolute top-[0px] left-[290px] text-white z-10 animate-bounce" />
            <div className="relative top-[72px] -right-1/2 -translate-x-1/2 py-2 sm:py-3 px-5 text-black bg-white h-fit rounded-lg w-[90%] max-w-[700px] sm:w-[90%] md:w-[70%]">
                <button className="absolute top-0 right-0 p-2.5" onClick={() => setOpenNotificationPopUp(false)}>
                    <RxCross2 className="text-xl" />
                </button>
                <div className="relative bg-primary pb-4 pt-5 sm:pt-6 flex flex-col gap-2 sm:gap-3 md:gap-4 items-center text-center sm:px-2 mx-auto">
                    <p>You have blocked notifications. If you wish to enable them, please follow this steps.</p>
                    <div className='md:space-y-4 sm:space-y-3 space-y-2 w-fit mx-auto text-left'>
                        <p>1. Click the padlock icon <FiLock className="text-xl md:text-2xl inline-block mx-1" /> in the address bar.</p>
                        <p>2. Under Notification section remove the website from &quot;blocked&quot;</p>
                    </div>
                </div>
            </div>

        </>
    );

    const SafariMobilePopup = () => (
        <>
            <div className="relative top-[72px] -right-1/2 -translate-x-1/2 py-2 sm:py-3 px-5 text-black bg-white h-fit rounded-lg w-[90%] max-w-[700px] sm:w-[70%]">
                <button className="absolute top-0 right-0 p-2.5" onClick={() => setOpenNotificationPopUp(false)}>
                    <RxCross2 className="text-xl" />
                </button>
                <div className="relative bg-primary pb-4 pt-5 sm:pt-6 flex flex-col gap-2 sm:gap-3 md:gap-4 items-center text-center sm:px-2 mx-auto">
                    <p>You have blocked notifications. If you wish to enable them, please follow this steps.</p>
                    <div className='md:space-y-4 sm:space-y-3 space-y-2 w-fit mx-auto text-left'>
                        <p>1. Open Safari on your mobile device.</p>
                        <p>2. Visit the website you want to allow notifications for.</p>
                        <p>3. If prompted, tap &quot;Allow&quot; to receive notifications.</p>
                        <p>4. If you don&apos;t see a prompt, go to the &quot;Settings&quot; app on your device.</p>
                        <p>5. Scroll down and tap &quot;Safari&quot;.</p>
                        <p>6. Scroll down to &quot;Settings for Websites&quot; and tap &quot;Notifications&quot;.</p>
                        <p>7. Find the website in the list and change the setting to &quot;Allow&quot;.</p>
                    </div>
                </div>
            </div>

        </>
    );

    const ChromeIosMobilePopup = () => (
        <>
            <div className="relative top-[72px] -right-1/2 -translate-x-1/2 py-2 sm:py-3 px-5 text-black bg-white h-fit rounded-lg w-[90%] max-w-[700px] sm:w-[70%]">
                <button className="absolute top-0 right-0 p-2.5" onClick={() => setOpenNotificationPopUp(false)}>
                    <RxCross2 className="text-xl" />
                </button>
                <div className="relative bg-primary pb-4 pt-5 sm:pt-6 flex flex-col gap-2 sm:gap-3 md:gap-4 items-center text-center sm:px-2 mx-auto">
                    <p>You have blocked notifications. If you wish to enable them, please follow this steps.</p>
                    <div className='md:space-y-4 sm:space-y-3 space-y-2 w-fit mx-auto text-left'>
                        <p>1. Tap the three dots <IoEllipsisVertical className="text-xl md:text-2xl inline-block mx-1" /> in the bottom right corner.</p>
                        <p>2. Select &quot;Settings&quot; from the menu.</p>
                        <p>3. Scroll down and tap &quot;Content Settings&quot;.</p>
                        <p>4. Tap &quot;Notifications&quot;.</p>
                        <p>5. Find the website in the list and change the setting to &quot;Allow&quot;.</p>
                    </div>
                </div>
            </div>
        </>
    );

    const FirefoxIosMobile = () => (
        <>
            <div className="relative top-[72px] -right-1/2 -translate-x-1/2 py-2 sm:py-3 px-5 text-black bg-white h-fit rounded-lg w-[90%] max-w-[700px] sm:w-[70%]">
                <button className="absolute top-0 right-0 p-2.5" onClick={() => setOpenNotificationPopUp(false)}>
                    <RxCross2 className="text-xl" />
                </button>
                <div className="relative bg-primary pb-4 pt-5 sm:pt-6 flex flex-col gap-2 sm:gap-3 md:gap-4 items-center text-center sm:px-2 mx-auto">
                    <p>You have blocked notifications. If you wish to enable them, please follow this steps.</p>
                    <div className='md:space-y-4 sm:space-y-3 space-y-2 w-fit mx-auto text-left'>
                        <p>1.Tap the three horizontal lines <IoMenu className="text-xl md:text-2xl inline-block mx-1" /> in the bottom right corne
                        </p>
                        <p>2. Select &quot;Settings&quot; from the menu.</p>
                        <p>3. Scroll down to the &quot;Privacy&quot; section.</p>
                        <p>4. Tap on &quot;Notifications&quot;.</p>
                        <p>5. Find the website in the list and change the setting to &quot;Allow&quot;.</p>
                    </div>
                </div>
            </div>
        </>
    );

    return (
        <>
            {!isMobile && browserType == "Chrome" && <ChromePopup />}
            {!isMobile && browserType == "Safari" && <SafariPopup />}
            {!isMobile && browserType == "Firefox" && <FirefoxPopup />}
            {!isMobile && browserType == "FirefoxiOS" && <FirefoxIos />}
            {!isMobile && browserType == "ChromeiOS" && <ChromeIosPopup />}
            {isMobile && browserType == "Chrome" && <ChromeMobilePopup />}
            {isMobile && browserType == "Safari" && <SafariMobilePopup />}
            {isMobile && browserType == "Firefox" && <FirefoxMobilePopup />}
            {isMobile && browserType == "FirefoxiOS" && <FirefoxIosMobile />}
            {isMobile && browserType == "ChromeiOS" && <ChromeIosMobilePopup />}
            {browserType == "" || browserType == "other" && <></>}
        </>
    );
}


