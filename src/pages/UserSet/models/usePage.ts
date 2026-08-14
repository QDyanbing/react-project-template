import { create } from 'zustand';

interface Store {
  ready: boolean;
  uuid?: string;
  mount: (uuid?: string) => void;
  unmount: () => void;
}

export default create<Store>((set) => {
  const ready = false;
  const uuid: string | undefined = undefined;

  const mount = (uuid?: string) => {
    set({ ready: true, uuid });
  };

  const unmount = () => {
    set({ ready: false, uuid: undefined });
  };

  return { ready, uuid, mount, unmount };
});
