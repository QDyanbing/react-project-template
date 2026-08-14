import { create } from 'zustand';

interface Store {
  password?: string;
  onOpen: (password: string) => void;
  onClose: () => void;
}

export default create<Store>((set) => {
  const password = undefined;

  const onOpen = (password: string) => {
    set({ password });
  };

  const onClose = () => {
    set({ password: undefined });
  };

  return { password, onOpen, onClose };
});
