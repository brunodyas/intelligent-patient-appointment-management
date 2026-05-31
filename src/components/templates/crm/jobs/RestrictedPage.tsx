import React from 'react'
import { routes } from "@/constants/routes";
import { RxCross2 } from 'react-icons/rx';
import { useRouter } from "next/navigation";
import { BsShieldLock } from 'react-icons/bs';

const RestrictedPage = () => {

    const router = useRouter();
    return (
        <div className='flex flex-col justify-center items-center h-[calc(100vh-96px)] lg:w-[calc(100vw-284px)] md:w-[calc(100vw-56px)] w-[calc(100vw-16px)] relative'>
            <button className="absolute top-0 right-1 p-2.5">
                <RxCross2 className="text-xl" onClick={() => { router.push(routes.crmJobs); }} />
            </button>
            <BsShieldLock className='sm:mb-3 mb-2 sm:text-[60px] text-[48px] text-primary-main' />
            <h1 className='mb-2 sm:text-xl text-lg font-medium text-center'>You do not have permission to access this job</h1>
        </div>
    )
}

export default RestrictedPage