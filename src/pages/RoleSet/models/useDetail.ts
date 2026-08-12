import { getDetail } from '@/services/role';
import { create } from 'zustand';
import usePage from './usePage';

interface Store {
  loading: boolean;
  data?: API.Role;
}

export default create<Store>((set) => {
  const loading = false;
  const data: API.Role | undefined = undefined;

  const getData = async () => {
    const { ready, uuid } = usePage.getState();
    if (!ready || !uuid) return;

    try {
      set({ loading: true });
      const result = await getDetail(uuid);
      if (!result || usePage.getState().uuid !== uuid) return;

      set({ data: result.data });
    } finally {
      if (usePage.getState().uuid === uuid) set({ loading: false });
    }
  };

  usePage.subscribe(({ ready, uuid }) => {
    if (ready && uuid) {
      getData();
    } else {
      set({ loading: false, data: undefined });
    }
  });

  return { loading, data };
});
