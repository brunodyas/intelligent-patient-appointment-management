"use client";
import React, { useState } from "react";

interface Tab {
  tabName: string;
  content: React.ReactNode;
}

interface TabConfig {
  tabs: Tab[];
}

interface DynamicTabProps {
  config: TabConfig;
  handletabChange?: (tabName: string) => void;
}

export const UI7Tabs: React.FC<DynamicTabProps> = ({ config, handletabChange }) => {
  const { tabs } = config;
  const [activeTab, setActiveTab] = useState(tabs[0]?.tabName);
   const handleActiveTab = (tabName: string) => {
    setActiveTab(tabName);
    handletabChange && handletabChange(tabName);
   }

  return (
    <div className="">
      {/* Tab Headers */}
      <div className="relative right-0 w-full lg:w-2/2 md:w-2/3 xl:w-1/2">
        <ul
          className="relative flex flex-wrap  py-1.5 list-none rounded-lg bg-[#F4F5F6] border-[#C63D7F]"
          role="list"
        >
          {tabs.map((tab) => (
            <li key={tab.tabName} className="z-30 flex-auto text-center ">
              <a
                className={`z-30 flex items-center justify-center  py-2 text-sm mb-0 transition-all ease-in-out border-0 rounded-lg cursor-pointer ${
                  activeTab === tab.tabName
                    ? "text-white bg-[#C63D7F]"
                    : "text-slate-800 bg-inherit border-x border=[#C63D7F]"
                }`}
                role="tab"
                aria-selected={activeTab === tab.tabName}
                onClick={() => handleActiveTab(tab.tabName)}
              >
                {tab.tabName}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Tab Content */}
      <div className="">
        {tabs.map((tab) =>
          activeTab === tab.tabName ? (
            <div key={tab.tabName}>
              <div>{tab.content}</div>
            </div>
          ) : (
            <div key={tab.tabName} className="hidden">
              <div>{tab.content}</div>
            </div>
          )
        )}
      </div>
    </div>
  );
};
