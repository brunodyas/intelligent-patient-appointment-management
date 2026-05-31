import * as React from "react";
import { usePopover, DismissButton, Overlay } from "@react-aria/overlays";
import { createPortal } from "react-dom";

export function Popover(props) {
  let ref = React.useRef(null);
  let { state, children, triggerRef, className } = props;

  let { popoverProps, underlayProps } = usePopover(
    {
      ...props,
      popoverRef: ref
    },
    state
  );

  // Get the parent element of the trigger to use as the portal target
  let parentElement = triggerRef.current.parentElement;

  return createPortal(
    state.isOpen && (
      <>
        <div {...underlayProps} className="fixed inset-0" />
        <div
          {...popoverProps}
          ref={ref}
          className={`absolute-top bg-white border border-gray-300 rounded-md shadow-lg mt-2 sm:p-4 p-2 z-10 ${className} `}
        >
          <DismissButton onDismiss={state.close} />
          {children}
          <DismissButton onDismiss={state.close} />
        </div>
      </>
    ),
    parentElement
  );
}
