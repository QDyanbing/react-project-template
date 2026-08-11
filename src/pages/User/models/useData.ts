import { create } from 'zustand';

import { getSearch } from '@/services/user';
import usePage from './usePage';

interface Store {
  loading: boolean;
  data: API.User[];
  total: number;
  onRefresh: () => void;
}

export default create<Store>((set) => {
  const loading = false;
  const data: API.User[] = [];
  const total = 0;

  const getData = async () => {
    const { ready, params } = usePage.getState();
    if (!ready) return;

    try {
      set({ loading: true });
      const result = await getSearch(params);
      if (!result || !usePage.getState().ready) return;

      set({ data: result.data.list, total: result.data.total });
    } finally {
      if (usePage.getState().ready) set({ loading: false });
    }
  };

  usePage.subscribe((state) => {
    if (state.ready) {
      getData();
    } else {
      set({ loading: false, data: [], total: 0 });
    }
  });

  return { loading, data, total, onRefresh: getData };
});
