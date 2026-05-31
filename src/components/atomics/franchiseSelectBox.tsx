import { useAuth } from "@/context/auth";
import { useCall } from "@/context/callContext";
import { useJune } from "@/hooks/useJune";
import { getFranchises } from "@/services/franchises";
import debounce from "lodash.debounce";
import React, {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Spinner from "./Spinner";
import { Listbox, Transition } from "@headlessui/react";
import { twMerge } from "tailwind-merge";
import { CheckIcon } from "@/assets/icons";
import Button from "./Button";

interface FranchiseSelectBoxProps {
  defaultSelected?: string;
  onChange?: (selectedOption: string) => void;
}

const FranchiseSelectBox: React.FC<FranchiseSelectBoxProps> = ({
  defaultSelected,
  onChange,
}) => {

  const [selected, setSelected] = useState<any>({franchise_name: defaultSelected});
  const [inputValue, setInputValue] = useState<string>("");
  const [inputValueChanged, setInputValueChanged] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [datas, setDatas] = useState<any[]>([]);
  const [franchiseScrollPage, setFranchiseScrollPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const listRef = useRef<HTMLDivElement>(null);

  const analytics = useJune();

  useEffect(() => {
    fetchFranchises(franchiseScrollPage, inputValue);
  }, [])
  

  useEffect(() => {
    if (inputValueChanged) {
      fetchFranchises(franchiseScrollPage, inputValue);
    }
  }, [franchiseScrollPage, inputValueChanged]);


  const fetchFranchises = async (page: number, searchQuery: string = "") => {
    try {
      const response: any = await getFranchises(page, searchQuery);
      analytics?.track("getFranchises");
      if (response.results.length < 12) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
      setDatas((prev) => [...(page !== 1 ? prev : []), ...response.results]);
    } catch (error) {
      console.error(error);
    } finally {
      setInputValueChanged(false);
    }
  };

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      if (!listRef.current || !hasMore) return;

      const { scrollTop, clientHeight, scrollHeight } = listRef.current;

      if (Math.ceil(scrollTop + clientHeight) >= scrollHeight) {
        setFranchiseScrollPage((prevPage) => prevPage + 1);
        setInputValueChanged(true);
      }
    },
    [hasMore]
  );

  const handleSelect = async (option: any) => {
    setSelected(option);
    setInputValue("");
    setIsOpen(false);
    console.log(option);
    onChange && onChange(option);
  };

  const handleDeselect = () => {
    setSelected({
      franchise_name: defaultSelected,
    });
    onChange && onChange('');
  };

  const debouncedHandleChange = useCallback(
    debounce((value: string) => {
      setInputValueChanged(true);
      setIsOpen(true);
      setFranchiseScrollPage(1);
      setDatas([]);
    }, 300),
    []
  );

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isOpen) {
      const value = event.target.value;
      setInputValue(value);
      debouncedHandleChange(value);
    }
  };

  console.log(selected, );
  return (
    <div className="flex flex-row gap-2">
      <div
        className={`text-center  relative rounded-lg border cursor-pointer   border-neutral-30 w-[16rem]`}
      >
        <div className="relative  bg-neutral-20 flex items-center rounded-lg w-[15.8rem] ">
          <input
            type="text"
            value={isOpen ? inputValue : selected?.franchise_name || ""}
            onClick={() => setIsOpen(!isOpen)}
            onChange={handleInputChange}
            className=" rounded-lg bg-neutral-20 px-2 py-2 outline-0 ring-2 ring-transparent transition-all duration-300 ease-out w-[15.8rem] "
            placeholder="Search Franchise"
            onBlur={() => setIsOpen(false)}
          />
        </div>
        <Listbox as="div" value={selected} onChange={handleSelect}>
          <Transition
            as={Fragment}
            show={isOpen}
            enter="transition duration-300 ease-out"
            enterFrom="transform scale-y-95 opacity-0"
            enterTo="transform scale-y-100 opacity-100"
            leave="transition duration-300 ease-out"
            leaveFrom="transform scale-100 opacity-100"
            leaveTo="transform scale-95 opacity-0"
            afterLeave={() => setIsOpen(false)}
          >
            <Listbox.Options
              ref={listRef}
              onScroll={handleScroll}
              className="fixed z-10 mt-1 max-w-[16rem] max-h-[300px] w-full overflow-y-scroll overflow-x-hidden rounded-md border text-sm"
            >
              {datas.map((data, dataIdx) => (
                <Listbox.Option
                  key={dataIdx}
                  className={({ active }) =>
                    `relative select-none px-4 py-2 text-neutral-60 bg-white hover:bg-primary-surface ${
                      active ? "bg-gray-100" : ""
                    }`
                  }
                  value={data}
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={`block truncate ${
                          selected ? "font-bold" : "font-normal"
                        }`}
                      >
                        {data.franchise_name}
                      </span>
                      {selected && (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      )}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </Listbox>
      </div>
      <Button
        className="!h-10"
        size="md"
        variant={selected?.franchise_name == defaultSelected ? "disabled-bg" : "primary-bg"}
        disabled={selected?.franchise_name == defaultSelected}
        onClick={handleDeselect}
      >
        Clear
      </Button>
    </div>
  );
};

export default FranchiseSelectBox;
