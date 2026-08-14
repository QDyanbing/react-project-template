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
    const { ready, userId } = usePage.getState();
    if (!ready || !userId) return;

    try {
      set({ loading: true });
      const result = await getDetail(userId);
      if (!result || usePage.getState().userId !== userId) return;

      set({ data: result.data });
    } finally {
      if (usePage.getState().userId === userId) set({ loading: false });
    }
  };

  usePage.subscribe(({ ready, userId }) => {
    if (ready && userId) {
      getData();
    } else {
      set({ loading: false, data: undefined });
    }
  });

  return { loading, data };
});
