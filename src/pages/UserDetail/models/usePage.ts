import { create } from 'zustand';

interface Store {
  userId?: string;
  mount: (userId?: string) => void;
  unmount: () => void;
}

export default create<Store>((set) => {
  const userId: string | undefined = undefined;

  const mount = (userId?: string) => {
    set({ userId });
  };

  const unmount = () => {
    set({ userId: undefined });
  };

  return { userId, mount, unmount };
});
