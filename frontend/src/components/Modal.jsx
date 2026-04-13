import React, { useEffect } from "react";
import { createPortal } from "react-dom";

const Modal = ({ open, title, onClose, children, actions }) => {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-textp/40 backdrop-blur-[2px] animate-fadeIn"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="relative w-full md:w-[540px] max-w-[640px] bg-ivory md:rounded-2xl rounded-t-2xl shadow-[0_-8px_32px_rgba(0,0,0,0.12)] animate-slideUp md:animate-slideFade mx-0 md:mx-4">
        {/* Handle bar (mobile) */}
        <div className="md:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-parchment-dark rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-3 pb-3 border-b border-parchment-dark/40">
          <h3 className="font-serif text-burgundy text-base font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-parchment hover:bg-parchment-dark flex items-center justify-center text-texts hover:text-textp transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 max-h-[65vh] overflow-y-auto">
          {children}
        </div>

        {/* Actions */}
        {actions && (
          <div className="px-5 py-4 border-t border-parchment-dark/40 flex justify-end gap-2 bg-parchment/40">
            {actions}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default Modal;
