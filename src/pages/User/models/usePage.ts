import { create } from 'zustand';

import { DEFAULT_PAGE_SIZE } from '@/utils/pagination';

interface Store {
  ready: boolean;
  params: API.UserParams;
  onSearch: (keyword?: string) => void;
  onStatusChange: (status?: API.UserParams['status']) => void;
  onPaginationChange: (pageNum: number, pageSize: number) => void;
  mount: () => void;
  unmount: () => void;
}

export default create<Store>((set) => {
  const ready = false;
  const params: API.UserParams = { pageNum: 1, pageSize: DEFAULT_PAGE_SIZE };

  const onSearch = (keyword?: string) => {
    set(({ params }) => ({ params: { ...params, keyword, pageNum: 1 } }));
  };

  const onStatusChange = (status?: API.UserParams['status']) => {
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
