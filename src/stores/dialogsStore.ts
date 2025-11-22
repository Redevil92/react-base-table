import { create } from "zustand";
import type DialogItem from "../components/BaseTable/models/DialogItem";

interface DialogsState {
  openedDialogs: DialogItem[]; // IDs of opened dialogs
  actions: {
    // Actions
    openDialog: (
      position: { x: number; y: number },
      title: string,
      dialogImplementation: React.ReactNode
    ) => void;
    closeDialog: (dialogId: string) => void;
  };
}

export const useDialogsStore = create<DialogsState>((set, get) => ({
  openedDialogs: [],
  actions: {
    openDialog: (position, title, dialogImplementation) => {
      // open only one dialog of each type at a time
      const isDialogAlreadyOpened = get().openedDialogs.some(
        (dialog) => dialog.title === title
      );
      if (isDialogAlreadyOpened) {
        return;
      }

      const newDialog: DialogItem = {
        id: `dialog-${Date.now()}-${get().openedDialogs.length}`,
        title,
        position,
        dialogImplementation,
      };
      set({
        openedDialogs: [...get().openedDialogs, newDialog],
      });
    },

    closeDialog: (dialogId) => {
      set({
        openedDialogs: get().openedDialogs.filter(
          (dialog) => dialog.id !== dialogId
        ),
      });
    },
  },
}));

export const useOpenedDialogs = () => {
  return useDialogsStore((state) => state.openedDialogs);
};

export const useDialogsActions = () => {
  return useDialogsStore((state) => state.actions);
};
