"use client"
import React, { useState, useEffect } from 'react';
// import { setCookie, getCookie } from 'cookies-next';
import nookies, { parseCookies, setCookie } from 'nookies'
import dynamic from 'next/dynamic';

const AddPwaPopup = dynamic(() => import('./PwaPopupSettings/AddPwaPopup'), { ssr: false, loading: () => <PageLoader /> });

import useUserAgent from '../../../hooks/usePwa';
import PageLoader from '@/components/atomics/PageLoader';

type AddToHomeScreenPromptType = 'safari' | 'chrome' | 'firefox' | 'other' | 'firefoxIos' | 'chromeIos' | 'samsung' | '';
const COOKIE_NAME = 'addToHomeScreenPrompt';

export default function AddToHomeScreen() {
    const [displayPrompt, setDisplayPrompt] = useState<AddToHomeScreenPromptType>('');
    const { userAgent, isMobile, isStandalone, isIOS } = useUserAgent();

    const closePrompt = () => {
        setDisplayPrompt('');
    };

    const doNotShowAgain = () => {
        const date = new Date();
        date.setFullYear(date.getFullYear() + 1);
        setCookie(null, COOKIE_NAME, 'dontShow', { expires: date });
        setDisplayPrompt('');
    };

    useEffect(() => {
        const cookies = parseCookies();
        const addToHomeScreenPromptCookie = cookies[COOKIE_NAME];

        if (addToHomeScreenPromptCookie !== 'dontShow') {
            // Only show prompt if user is on mobile and app is not installed
            if (isMobile && !isStandalone) {
                if (userAgent === 'Safari') {
                    setDisplayPrompt('safari');
                } else if (userAgent === 'Chrome') {
                    setDisplayPrompt('chrome');
                } else if (userAgent === 'Firefox') {
                    setDisplayPrompt('firefox');
                } else if (userAgent === 'FirefoxiOS') {
                    setDisplayPrompt('firefoxIos');
                } else if (userAgent === 'ChromeiOS') {
                    setDisplayPrompt('chromeIos');
                } else {
                    setDisplayPrompt('other');
                }
            }
        } else {
        }
    }, [userAgent, isMobile, isStandalone, isIOS]);

    return (
        <>
            {
                displayPrompt !== ''
                    ?
                    <>
                        <div
                            className="fixed top-0 left-0 right-0 bottom-0 bg-black/70 z-50"
                            onClick={closePrompt}
                        >
                            <AddPwaPopup browserType={displayPrompt} closePrompt={closePrompt} doNotShowAgain={doNotShowAgain} />
                        </div>
                    </>
                    :
                    <></>
            }
        </>
    );
}