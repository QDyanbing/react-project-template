import { getSearch } from '@/services/role';
import { create } from 'zustand';
import usePage from './usePage';

interface Store {
  loading: boolean;
  data: API.Role[];
  total: number;
  onRefresh: () => void;
}

export default create<Store>((set) => {
  const loading = false;
  const data: API.Role[] = [];
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

  usePage.subscribe(({ ready }) => {
    if (ready) {
      getData();
    } else {
      set({ loading: false, data: [], total: 0 });
    }
  });

  return { loading, data, total, onRefresh: getData };
});
