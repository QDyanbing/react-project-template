import { create } from 'zustand';

import { DEFAULT_PAGE_SIZE } from '@/utils/pagination';

interface Store {
  ready: boolean;
  params: Omit<API.UserParams, 'status'> & {
    status?: { value: API.User['status']; label: string };
  };
  onSearch: (keyword?: string) => void;
  onStatusChange: (status?: Store['params']['status']) => void;
  onPaginationChange: (pageNum: number, pageSize: number) => void;
  mount: () => void;
  unmount: () => void;
}

export default create<Store>((set) => {
  const ready = false;
  const params: Store['params'] = { pageNum: 1, pageSize: DEFAULT_PAGE_SIZE };

  const onSearch = (keyword?: string) => {
    set(({ params }) => ({ params: { ...params, keyword, pageNum: 1 } }));
  };

  const onStatusChange = (status?: Store['params']['status']) => {
    set(({ params }) => ({ params: { ...params, status, pageNum: 1 } }));
  };

  const onPaginationChange = (pageNum: number, pageSize: number) => {
    set(({ params }) => ({ params: { ...params, pageNum, pageSize } }));
  };

  const mount = () => {
    set({ ready: true });
  };

  const unmount = () => {
    set({ ready: false });
  };

  return { ready, params, onSearch, onStatusChange, onPaginationChange, mount, unmount };
});
