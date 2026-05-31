"use client";
import React from "react";
import Image from "next/image";
import privacylogo from '../../../public/logo/bloomin-logo.webp'
import { useRouter } from "next/navigation";
import { routes } from "@/constants/routes";


const Page = () => {

  const router = useRouter();

  return (
    <>
      <div className="py-5">
        <Image
          onClick={() => router.push(routes.signIn)}
          className="mx-auto cursor-pointer"
          src={privacylogo}
          alt="privacy policy logo"
          width="200"
          height="200"
        />
      </div>
      <section>
        <div className="h-[440px] relative bg-[url('/image/privacypolicy.jpg')] bg-cover bg-no-repeat bg-center">
          <div className="rounded-3xl p-14 w-[90%] lg:w-[55%] m-5 lg:m-0 absolute bg-[#ffffffe0] top-[18%]">
            <h2 className="mb-5 text-5xl lg:text-7xl font-medium">Privacy Policy</h2>
            <p className="text-sm lg:text-md uppercase text-primary-main">
              We bring the store to you
            </p>
          </div>
        </div>
      </section>
      <section className="!max-w-[1480px]  mx-auto py-[50px] p-[20px]">
       <div className="p-5 lg:p-0 text-center lg:text-left">
       <div className="my-[18px]">
          <p className="body-lg text-[#3b4453] font-normal list-disc">
            We recognize that you may be concerned about our use and disclosure
            of your personal information. Your privacy is very important to us,
            and the following will inform you of the information that we,
            Bloomin&apos; Blinds, may collect from you, and how it is used. By using
            our website, www.bloominblinds.com, you are accepting the practices
            described in this policy.
          </p>
        </div>
        <div className="my-[18px]">
          <p className="text-xl font-bold text-black mb-[18px] ">
            Information Collection
          </p>
          <ul className="p-0 lg:pl-20 body-lg text-[#3b4453] font-normal">
            <li style={{ listStyleType: "circle" }} className="mt-[18px]">
              <p>
                We may collect non-personal information, such as a domain name
                and IP Address. The domain name and IP address reveals nothing
                personal about you other than the IP address from which you have
                accessed our site. We may also collect information about the
                type of Internet browser you are using, operating system, what
                brought you to our Website, as well as which of our Web pages
                you have accessed.
              </p>
            </li>
            <li style={{ listStyleType: "circle" }} className="mt-[18px]">
              <p>
                Additionally, if you communicate with us regarding our Website
                or our services, we will collect any information that you
                provide to us in any such communication.
              </p>
            </li>
            <li style={{ listStyleType: "circle" }} className="mt-[18px]">
              <p>
                We may contact you via email in the future to tell you about
                specials, new products or services, or changes to this privacy
                policy.
              </p>
            </li>
          </ul>
        </div>
        <div className="my-[18px]">
          <p className="text-xl font-bold text-black mb-[18px] ">
            Information Use
          </p>
          <ul className="p-0 lg:pl-20 body-lg text-[#3b4453] font-normal">
            <li style={{ listStyleType: "circle" }} className="mt-[18px]">
              <p>
                We use the collected information primarily for our own internal
                purposes, such as providing, maintaining, evaluating, and
                improving our services and Website, fulfilling requests for
                information, and providing customer support.
              </p>
            </li>
          </ul>
        </div>
        <div className="my-[18px]">
          <p className="text-xl font-bold text-black mb-[18px] ">Security</p>
          <ul className="p-0 lg:pl-20 body-lg text-[#3b4453] font-normal">
            <li style={{ listStyleType: "circle" }} className="mt-[18px]">
              <p>
                We follow generally accepted industry standards to protect the
                information submitted to us, both during transmission and once
                we receive it.
              </p>
            </li>
            <li style={{ listStyleType: "circle" }} className="mt-[18px]">
              <p>
                If we collect sensitive information (such as credit card data),
                that information is encrypted and transmitted to us in a secure
                way. You can verify this by looking for a closed lock icon at
                the bottom of your web browser, or looking for &quot;https&quot; at the
                beginning of the address of the web page.
              </p>
            </li>
            <li style={{ listStyleType: "circle" }} className="mt-[18px]">
              <p>
                While we use encryption to protect sensitive information
                transmitted online, we also protect your information offline.
                Only employees who need the information to perform a specific
                job (for example, billing or customer service) are granted
                access to personally identifiable information. The
                computers/servers in which we store personally identifiable
                information are kept in a secure environment.
              </p>
            </li>
          </ul>
        </div>
        <div className="my-[18px]">
          <p className="text-xl font-bold text-black mb-[18px] ">Cookies</p>
          <ul className="p-0 lg:pl-20 body-lg text-[#3b4453] font-normal">
            <li style={{ listStyleType: "circle" }} className="mt-[18px]">
              <p>
                We use &quot;cookies&quot; on this site. A cookie is a piece of data
                stored on a site visitor&apos;s hard drive to help us improve your
                access to our site and identify repeat visitors to our site. For
                instance, when we use a cookie to identify you, you would not
                have to log in a password more than once, thereby saving time
                while on our site. Cookies can also enable us to track and
                target the interests of our users to enhance the experience on
                our site. Usage of a cookie is in no way linked to any
                personally identifiable information on our site.
              </p>
            </li>
          </ul>
        </div>
        <div className="my-[18px]">
          <p className="text-xl font-bold text-black mb-[18px] ">Sharing</p>
          <ul className="p-0 lg:pl-20 body-lg text-[#3b4453] font-normal">
            <li style={{ listStyleType: "circle" }} className="mt-[18px]">
              <p>
                We will not sell or otherwise provide the information we collect
                to outside third parties for the purpose of direct or indirect
                mass email marketing.
              </p>
            </li>
            <li style={{ listStyleType: "circle" }} className="mt-[18px]">
              <p>
                We will disclose personal information and/or an IP address, when
                required by law or in the good-faith belief that such action is
                necessary to:
                <ul className="pl-6 lg:pl-10">
                  <li className="list-disc mt-2">
                    <p>
                      Cooperate with the investigations of purported unlawful
                      activities and conform to the edicts of the law or comply
                      with legal process served on our company
                    </p>
                  </li>
                  <li className="list-disc mt-2">
                    <p>
                      Protect and defend the rights or property of our Website
                      and related properties
                    </p>
                  </li>
                  <li className="list-disc mt-2">
                    <p>
                      Identify persons who may be violating the law, the rights
                      of third parties, or otherwise misusing our Website or its
                      related properties
                    </p>
                  </li>
                </ul>
              </p>
            </li>
            <li style={{ listStyleType: "circle" }} className="mt-[18px]">
              <p>
                Please keep in mind that whenever you voluntarily disclose
                personal information online - for example through e-mail,
                discussion boards, or elsewhere - that information can be
                collected and used by others. In short, if you post personal
                information online that is accessible to the public, you may
                receive unsolicited messages from other parties in return.
              </p>
            </li>
            <li style={{ listStyleType: "circle" }} className="mt-[18px]">
              <p>
                Ultimately, you are solely responsible for maintaining the
                secrecy of your personal information. Please be careful and
                responsible whenever you are online.
              </p>
            </li>
          </ul>
        </div>
        <div className="my-[18px]">
          <p className="text-xl font-bold text-black mb-[18px] ">Links</p>
          <ul className="p-0 lg:pl-20 body-lg text-[#3b4453] font-normal">
            <li style={{ listStyleType: "circle" }} className="mt-[18px]">
              <p>
                This Website may contain links to other sites. Please be aware
                that we are not responsible for the content or privacy practices
                of such other sites. We encourage our users to be aware when
                they leave our site and to read the privacy statements of any
                other site that collects personally identifiable information.
              </p>
            </li>
          </ul>
        </div>
        <div className="my-[18px]">
          <p className="text-xl font-bold text-black mb-[18px] ">
            Surveys & Contests
          </p>
          <ul className="p-0 lg:pl-20 body-lg text-[#3b4453] font-normal">
            <li style={{ listStyleType: "circle" }} className="mt-[18px]">
              <p>
                From time-to-time our site may request information via surveys
                or contests. Participation in these surveys or contests is
                completely voluntary and you may choose whether or not to
                participate and therefore disclose this information. Information
                requested may include contact information (such as name and
                shipping address), and demographic information (such as zip
                code, age). Contact information will be used to notify the
                winners and award prizes. Survey information will be used for
                purposes of monitoring or improving the use and satisfaction of
                this site.
              </p>
            </li>
          </ul>
        </div>
        <div className="my-[18px]">
          <p className="text-xl font-bold text-black mb-[18px] ">CCPA</p>
          <ul className="p-0 lg:pl-20 body-lg text-[#3b4453] font-normal">
            <li style={{ listStyleType: "circle" }} className="mt-[18px]">
              <p>
                If you are a resident of California, and would like to submit a
                request to Bloomin&apos; Blinds under the California Consumer Privacy
                Act (CCPA), please fill out the request form here.
              </p>
            </li>
            <li style={{ listStyleType: "circle" }} className="mt-[18px]">
              <p>
                Privacy Practices: For information about our data practices, the
                general categories of information we collect, and how we handle
                personal information of California residents, please visit our
                privacy policy.
              </p>
            </li>
            <li style={{ listStyleType: "circle" }} className="mt-[18px]">
              <p>
                Agents: If you are an authorized agent submitting a request
                under the CCPA on behalf of a California resident, please send
                your request with authorization attached to .
              </p>
            </li>
            <li style={{ listStyleType: "circle" }} className="mt-[18px]">
              <p>
                Verification: We will only use the information provided in this
                webform for the purpose of verifying your identity and the
                personal information that is relevant to your request. We will
                retain a record of your request for 24 months, but will not use
                your information for any other purpose than to respond to your
                request.
              </p>
            </li>
            <li style={{ listStyleType: "circle" }} className="mt-[18px]">
              <p>
                If you have questions about this webform, or if you do not wish
                to use this webform to submit your request, please contact us at
                (855) 457-1022.
              </p>
            </li>
          </ul>
        </div>
        <div className="my-[18px]">
          <p className="text-xl font-bold text-black mb-[18px] ">Consent</p>
          <ul className="p-0 lg:pl-20 body-lg text-[#3b4453] font-normal">
            <li style={{ listStyleType: "circle" }} className="mt-[18px]">
              <p>
                By using this Website, you consent to the collection and use of
                information as specified above. If we make changes to our
                Privacy Policy, we will post those changes on this page. Please
                review this page frequently to remain up-to-date with the
                information we collect, how we use it, and under what
                circumstances we disclose it. You must review the new Privacy
                Policy carefully to make sure you understand our practices and
                procedures.
              </p>
            </li>
          </ul>
        </div>
        <div className="my-[18px]">
          <p className="text-[18px] font-bold text-[#3b4453] mb-[18px]">
            If you feel that we are not abiding by this privacy policy, you
            should contact us immediately via telephone at (855) 457-1022 or via
            mail Attn: Privacy Officer, 5360 Legacy Drive, Suite 155, Plano, TX
            75024.
          </p>
        </div>
       </div>
      </section>
    </>
  );
};

export default Page;
