import { MagnifyingGlassIcon } from '@/assets/icons';
import { FaAngleUp, FaAngleDown } from "react-icons/fa6";

import { Button } from '@/components/atomics';
import { useEffect, useState } from 'react';

type Props = {
  transcript: string;
  audioSource: string;
}

const ConfigRecording = ({ transcript, audioSource }: Props) => {
  const charsPerPage = 1000;
  const numPages = Math.ceil(transcript.length / charsPerPage);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<number[]>([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
  const startIndex = (currentPage - 1) * charsPerPage;
  const endIndex = startIndex + charsPerPage;

  const handleNext = () => {
    if (currentPage < numPages) setCurrentPage(currentPage + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleSearchChange = (event:  React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  useEffect(() => {
    if(searchTerm.trim().length) executeSearch()
  }, [searchTerm])

  const executeSearch = () => {
    const newSearchResults = [];
    let position = transcript.toLowerCase().indexOf(searchTerm.toLowerCase());
    while (position !== -1) {
      newSearchResults.push(position);
      position = transcript.toLowerCase().indexOf(searchTerm.toLowerCase(), position + 1);
    }

    setSearchResults(newSearchResults);
    setCurrentSearchIndex(0);
    if (newSearchResults.length > 0) {
      setCurrentPage(Math.floor(newSearchResults[0] / charsPerPage) + 1);
    }
  };

  const goToNextSearchResult = () => {
    if (currentSearchIndex < searchResults.length - 1) {
      const newIndex = currentSearchIndex + 1;
      setCurrentSearchIndex(newIndex);
      setCurrentPage(Math.floor(searchResults[newIndex] / charsPerPage) + 1);
    }
  };

  const goToPrevSearchResult = () => {
    if (currentSearchIndex > 0) {
      const newIndex = currentSearchIndex - 1;
      setCurrentSearchIndex(newIndex);
      setCurrentPage(Math.floor(searchResults[newIndex] / charsPerPage) + 1);
    }
  };

  const getHighlightedText = (text: string, searchTerm: string, currentSearchIndex: number) => {
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);

    return (
      <span>
        {parts.map((part, index) => {
          const isMatch = part.toLowerCase() === searchTerm.toLowerCase();
          const style = isMatch ? {backgroundColor: index === currentSearchIndex * 2 ? 'orange' : 'yellow', fontWeight: "bold"} : {};
          return (
            <span key={index} style={style}>
                {part}
            </span>
          );
        })}
      </span>
    );
  };

  const textToDisplay = transcript.slice(startIndex, endIndex);

  return (
    <div className="mt-3 text-sm text-neutral-500">
      <div className="flex justify-between mb-4 items-center">
        <audio controls>
          <source src={audioSource} type="audio/wav" />
        </audio>
        <div className="relative w-72 2xl:w-96 smx:flex hidden mb-2 shrink-0">
          <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-50" />
          <input
            className="w-full !text-sm rounded-lg border-2 border-transparent bg-background-lightest px-3.5 py-[5px] pl-11 outline-0 ring-2 ring-transparent transition-all duration-300 ease-out focus:border-primary-main disabled:bg-neutral-20 hover:border-2 hover:border-[#33333326]"
            placeholder="Search"
            onChange={handleSearchChange}
            value={searchTerm}
          />

          <div className="flex gap-2 items-center absolute right-0 top-1/2 transform -translate-y-1/2">
            <Button
              variant="primary-nude"
              size="sm"
              onClick={goToNextSearchResult}
              disabled={currentSearchIndex === searchResults.length - 1}
              className={!searchTerm.trim().length ? "hidden" : ""}
            >
              <FaAngleUp className="shrink-0" />
            </Button>
              <div className={!searchTerm.trim().length ? "hidden" : "font-semibold"}>
                {currentSearchIndex + 1}/{searchResults.length}
              </div>
            <Button
              variant="primary-nude"
              size="sm"
              onClick={goToPrevSearchResult}
              disabled={currentSearchIndex === 0}
              className={!searchTerm.trim().length ? "hidden" : ""}
            >
              <FaAngleDown className="shrink-0" />
            </Button>
          </div>
        </div>
      </div>
      &quot;{getHighlightedText(textToDisplay, searchTerm, currentSearchIndex)}&quot;
      {numPages > 1 && (
        <div className="flex justify-between items-center mt-2 px-[5rem]">
          <Button
            variant={`${currentPage === 1 ? "default-nude" : "primary-nude"}`} 
            onClick={handlePrev} 
            disabled={currentPage === 1}
          >
            Prev
          </Button>
          <div className="font-semibold">Page {currentPage} of {numPages}</div>
          <Button
            variant={`${currentPage === numPages ? "default-nude" : "primary-nude"}`} 
            onClick={handleNext} 
            disabled={currentPage === numPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default ConfigRecording;
