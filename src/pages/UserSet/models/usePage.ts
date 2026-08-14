import { create } from 'zustand';

interface Store {
  ready: boolean;
  userId?: string;
  mount: (userId?: string) => void;
  unmount: () => void;
}

export default create<Store>((set) => {
  const ready = false;
  const userId: string | undefined = undefined;

  const mount = (userId?: string) => {
    set({ ready: true, userId });
  };

  const unmount = () => {
    set({ ready: false, userId: undefined });
  };

  return { ready, userId, mount, unmount };
});
