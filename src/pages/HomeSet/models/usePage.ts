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

  const mount = (currentUuid?: string) => {
    set({ ready: true, uuid: currentUuid });
  };

  const unmount = () => {
    set({ ready: false, uuid: undefined });
  };

  return { ready, uuid, mount, unmount };
});
