import { create } from 'zustand';

interface Store {
  uuid?: string;
  mount: (uuid?: string) => void;
  unmount: () => void;
}

export default create<Store>((set) => {
  const uuid: string | undefined = undefined;

  const mount = (currentUuid?: string) => {
    set({ uuid: currentUuid });
  };

  const unmount = () => {
    set({ uuid: undefined });
  };

  return { uuid, mount, unmount };
});
