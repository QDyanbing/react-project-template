import { getDetail } from '@/services/user';
import { create } from 'zustand';
import usePage from './usePage';

interface Store {
  loading: boolean;
  data?: API.User;
}

export default create<Store>((set) => {
  const loading = false;
  const data: API.User | undefined = undefined;

  const getData = async () => {
    const { uuid } = usePage.getState();
    if (!uuid) return;

    try {
      set({ loading: true });
      const result = await getDetail(uuid);
      if (!result || usePage.getState().uuid !== uuid) return;

      set({ data: result.data });
    } finally {
      if (usePage.getState().uuid === uuid) set({ loading: false });
    }
  };

  usePage.subscribe(({ uuid }) => {
    if (uuid) {
      getData();
    } else {
      set({ loading: false, data: undefined });
    }
  });

  return { loading, data };
});
