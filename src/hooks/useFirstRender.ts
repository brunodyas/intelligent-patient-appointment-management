import { useRef } from 'react';

const useFirstRender = () => {
  const firstRender = useRef(true);
  const reset = () => {
    firstRender.current = false;
  };
  return { firstRender, reset };
};

export default useFirstRender;
