import { getOptions } from '@/services/role';
import { create } from 'zustand';
import usePage from './usePage';

interface Store {
  loading: boolean;
  data: API.Role[];
}

export default create<Store>((set) => {
  const loading = false;
  const data: API.Role[] = [];

  const getData = async () => {
    if (!usePage.getState().ready) return;

    try {
      set({ loading: true });
      const result = await getOptions();
      if (!result || !usePage.getState().ready) return;

      set({ data: result.data });
    } finally {
      if (usePage.getState().ready) set({ loading: false });
    }
  };

  usePage.subscribe(({ ready }) => {
    if (ready) {
      getData();
    } else {
      set({ loading: false, data: [] });
    }
  });

  return { loading, data };
});
