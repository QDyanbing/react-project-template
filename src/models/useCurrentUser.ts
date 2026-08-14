import { getCurrent } from '@/services/account';
import { create } from 'zustand';

interface Store {
  loading: boolean;
  data?: API.Account;
  onRefresh: () => Promise<API.Account | undefined>;
  mount: () => Promise<API.Account | undefined>;
  unmount: () => void;
}

export default create<Store>((set, get) => {
  let ready = false;
  const loading = false;
  const data: API.Account | undefined = undefined;

  const getData = async () => {
    if (!ready) return undefined;

    try {
      set({ loading: true });
      const result = await getCurrent();
      if (!result) return undefined;

      const { data } = result;
      if (!ready) return undefined;

      set({ data });
      return data;
    } finally {
      if (ready) set({ loading: false });
    }
  };

  const mount = () => {
    ready = true;
    const { data } = get();

    return data ? Promise.resolve(data) : getData();
  };

  const unmount = () => {
    ready = false;
    set({ loading: false, data: undefined });
  };

  return {
    loading,
    data,
    onRefresh: getData,
    mount,
    unmount,
  };
});
