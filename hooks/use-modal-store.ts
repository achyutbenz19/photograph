export type ModalStore = {
  data: any
  isOpen: boolean;
  onOpen: (data?: any) => void;
  onClose: () => void;
};

import { create } from "zustand";

export const useModal = create<ModalStore>((set) => ({
  isOpen: false,
  data: {},
  onOpen: (data = {}) => set({ isOpen: true, data }),
  onClose: () => set({ isOpen: false }),
}));
