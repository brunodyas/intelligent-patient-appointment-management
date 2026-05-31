"use client";
import { TbBrandMessenger } from "react-icons/tb";
import { GoDatabase } from "react-icons/go";
import {
  IoStatsChartOutline,
  IoDocumentsOutline,
  IoHammerOutline,
} from "react-icons/io5";
import { CgBriefcase } from "react-icons/cg";
import {
  MdOutlineCalendarMonth,
  MdOutlineAdminPanelSettings,
} from "react-icons/md";
import { RiTruckLine, RiContactsBookLine } from "react-icons/ri";
import { FaRegBuilding } from "react-icons/fa";
import { VscVmConnect } from "react-icons/vsc";
import { AiOutlineCar } from "react-icons/ai";
import { FiClock } from "react-icons/fi";
import { LuUsers } from "react-icons/lu";
import { BiCog, BiHelpCircle } from "react-icons/bi";
import { PiPhoneBold } from "react-icons/pi";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@relume_io/relume-ui";
import { useAuth } from "@/context/auth";
import { RxChevronDown } from "react-icons/rx";
import { routes } from "@/constants/routes";
import Route from "./atomics/Route";
import Link from "next/link";
import CrmViewBox from "./atomics/CrmViewBox";
import { twMerge } from "tailwind-merge";
import { ENVS } from "@/constants/pageGuards";
import { useMemo } from "react";
import useUserRoles from "@/hooks/useUserRoles";


type NavItem = {
  name: string;
  items?: NavItem[];
  icon?: React.ReactNode;
  route: string;
};

interface SideNavProps {
  SetOpenEditProfile: (val: boolean) => void;
  setOpenSupportModal: (val: boolean) => void;
}

const SideNav = ({ SetOpenEditProfile, setOpenSupportModal }: SideNavProps) => {
  const { user } = useAuth();
  const { isSuperAdmin, isTech, isCustomerCare, isAdmin: ifAdmin, isCustomerCareManager } = useUserRoles();
  const hasEarlyAccess = user?.early_access;

  const { isAdmin, isProduction } = useMemo(() => {
    const isAdmin = isSuperAdmin || isCustomerCare || isCustomerCareManager;
    const isProduction = process.env.NODE_ENV === 'production';

    return { isAdmin, isProduction };
  }, [isSuperAdmin, isCustomerCare, isCustomerCareManager,  process.env.NODE_ENV]);

  const hiddenCRM = [

    ...(hasEarlyAccess
      ? [
        {
          name: "Insights",
          route: routes.crmInsights,
          icon: <IoStatsChartOutline />,
        },
      ]
      : []),
  ]

  const hidden = [
    ...(isTech
      ? []
      : [

        ...(hasEarlyAccess
          ? [
            {
              name: "Order Status",
              route: routes.orderStatus,
              icon: <FiClock />,
            },
          ]
          : []),

        ...(hasEarlyAccess
          ? [
            {
              name: "Manufacturers",
              route: routes.manufacturers,
              icon: <IoHammerOutline />,
            },
          ]
          : []),
      ]),

  ]

  const navItems: NavItem[] = [
    ...(isAdmin || ifAdmin ?
      [
        {
          name: "",
          route: "#",
          icon: "",
        },
      ]
      : []
    ),
    ...(isAdmin
      ? [
        {
          name: "Super Admin Panel",
          route: routes.superAdminPanel,
          icon: <MdOutlineAdminPanelSettings />,
        },
      ]
      : []),
    {
      name: "Feed",
      route: routes.feed,
      icon: <TbBrandMessenger />,
    },

    {
      name: "CRM",
      icon: <GoDatabase />,
      items: [
        ...(hasEarlyAccess
          ? [
            {
              name: "Jobs",
              route: routes.crmJobs,
              icon: <CgBriefcase />,
            },
          ]
          : []),
        ...(isTech
          ? []
          : [
            ...(hasEarlyAccess
              ? [
                {
                  name: "Calendar",
                  route: routes.crmActivities,
                  icon: <MdOutlineCalendarMonth />,
                },
              ]
              : []),
            ...(hasEarlyAccess
              ? [
                {
                  name: "Documents",
                  route: routes.crmDocuments,
                  icon: <IoDocumentsOutline />,
                },
              ]
              : []),
            ...(hasEarlyAccess
              ? [
                {
                  name: "Customers",
                  route: routes.crmContacts,
                  icon: <RiContactsBookLine />,
                },
              ]
              : []),
            ...(hasEarlyAccess
              ? [
                {
                  name: "Companies",
                  route: routes.crmCompanies,
                  icon: <FaRegBuilding />,
                },
              ]
              : []),
            {
              name: "Call Center",
              route: routes.crmCallHistory,
              icon: <PiPhoneBold />,
            },
            {
              name: " Web Activities",
              route: routes.crmWebActivities,
              icon: <VscVmConnect />,
            },

            ...(hasEarlyAccess
              ? [
                ...(!isProduction ? hiddenCRM : [])
              ]
              : []),

          ]),

      ].filter(Boolean),
      route: "#",
    },

    ...(isTech
      ? [
        ...(hasEarlyAccess
        ? [
          {
            name: "Tech",
            route: routes.tech,
            icon: <AiOutlineCar />,
          },
        ]
        : []),
      ]
      : []),
    ...(isTech
      ? []
      : [
        ...(hasEarlyAccess
          ? [
            {
              name: "Schedule",
              route: routes.dispatch,
              icon: <RiTruckLine />,
            },
          ]
          : []),

      ]),
    ...(isTech
      ? []
      : [
        {
          name: "Users",
          route: routes.users,
          icon: <LuUsers />,
        },
      ]),

    ...(!isProduction ? hidden : [])
  ];

  return (
    <nav className="absolute left-0 right-auto top-0 float-right h-full w-full  md:w-full lg:w-full  lg:relative lg:inset-auto lg:max-w-[auto]">
      <div
        // className="absolute flex size-full flex-col gap-4 border-r lg:gap-6 lg:border-none lg:py-0"
        className="relative flex size-full flex-col gap-4 border-r lg:gap-6 lg:border-none lg:py-0"
      >
        <div className="flex size-full flex-col overflow-auto px-[15px] py-8">
          {navItems
            .filter((navItem) => !navItem.items || navItem.items.length > 0) // Filter out navItems with empty items
            .map((navItem, index: number) =>
              navItem.items?.length ? (
                <Accordion type="single" key={navItem.name} collapsible>
                  <AccordionItem value="item-1" className="border-none">
                    <AccordionTrigger
                      className="p-2 font-normal "
                      icon={
                        <RxChevronDown className="shrink-0 text-text-primary transition-transform duration-300" />
                      }
                    >
                      <p className="flex items-center gap-3 w-full">
                        {navItem.icon}
                        {navItem.name}
                      </p>
                    </AccordionTrigger>
                    {navItem.items.map((item) => (
                      <AccordionContent
                        className="flex items-center gap-x-2 p-2 ml-[1rem] text-center hover:bg-neutral-101 hover:rounded-md"
                        key={item.name}
                      >
                        <Route
                          route={item.route}
                          linkClassName="flex w-full items-center gap-3"
                        >
                          {item.icon}
                          <p>{item.name}</p>
                        </Route>
                      </AccordionContent>
                    ))}
                  </AccordionItem>
                </Accordion>
              ) : (
                <Route
                  key={navItem.name}
                  route={navItem.route}
                  linkClassName={twMerge(
                    "flex items-center gap-x-2 p-2 text-center hover:bg-neutral-101 hover:rounded-md",
                    isAdmin &&
                    !index &&
                    "bg-[rgba(245,247,249,1.00)] mb-2 rounded-lg"
                  )}
                >
                  <span className={"flex items-center gap-3 w-full"}>
                    {navItem.icon}
                    <p className="text-start">{navItem.name}</p>
                  </span>
                </Route>
              )
            )}
        </div>
        {/* support and settings */}
        <div className="flex flex-col items-center">
          <div className="flex flex-row">
            <div
              onClick={() => setOpenSupportModal(true)}
              className="flex items-center gap-x-2 p-2 text-center hover:bg-neutral-101 hover:rounded-md cursor-pointer"
            >
              <span className="flex w-full items-center gap-3">
                <BiHelpCircle className="size-6 shrink-0" />
                <p>Support</p>
              </span>
            </div>
            <Link
              href="/settings"
              className="flex items-center gap-x-2 p-2 text-center hover:bg-neutral-101 hover:rounded-md"
            >
              <span className="flex w-full items-center gap-3">
                <BiCog className="size-6 shrink-0" />
                <p>Settings</p>
              </span>
            </Link>

          </div>
        </div>
      </div>
    </nav>
  );
};

export default SideNav;