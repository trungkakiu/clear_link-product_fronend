import create from "zustand";

export const useModalStore = create((set) => ({
  isOpen: false,
  setIsOpen: (v) => set({ isOpen: v }),

  hasOtpBlock: false,
  setOtpBlock: (v) => set({ hasOtpBlock: v }),
}));
