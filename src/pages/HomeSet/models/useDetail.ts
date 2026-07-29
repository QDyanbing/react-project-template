import { create } from 'zustand';

import { getDetail } from '@/services/home';
import usePage from './usePage';

interface Store {
  loading: boolean;
  data?: API.HomeData;
}

export default create<Store>((set) => {
  const loading = false;
  const data: API.HomeData | undefined = undefined;

  const getData = async () => {
    const { uuid } = usePage.getState();
    if (!uuid) return;

    try {
      set({ loading: true });
      const res = await getDetail(uuid);
      if (!res) return;
      if (usePage.getState().uuid === uuid) {
        set({ data: res.data });
      }
    } finally {
      if (usePage.getState().uuid === uuid) {
        set({ loading: false });
      }
    }
  };

  usePage.subscribe((state) => {
    if (!state.uuid) {
      set({ loading: false, data: undefined });
    } else {
      void getData();
    }
  });

  return {
    loading,
    data,
  };
});
