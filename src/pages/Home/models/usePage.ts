import { create } from "zustand";
import DEFAULT_PAGE_SIZE from "@/utils/pageSize";

interface Store {
  ready: boolean;
  params: API.HomeParams;
  onSearch: (keyword?: string) => void;
  onPaginationChange: (pageNum: number, pageSize: number) => void;
  mount: () => void;
  unmount: () => void;
}

export default create<Store>((set) => {
  const ready: boolean = false;
  const params: API.HomeParams = { pageNum: 1, pageSize: DEFAULT_PAGE_SIZE };

  const onSearch = (keyword?: string) => {
    set(({ params }) => ({
      params: { ...params, keyword, pageNum: 1 },
    }));
  };

  const onPaginationChange = (pageNum: number, pageSize: number) => {
    set(({ params }) => ({
      params: { ...params, pageNum, pageSize },
    }));
  };

  const mount = () => {
    set({ ready: true });
  };

  const unmount = () => {
    set({ ready: false });
  };

  return {
    ready,
    params,
    onSearch,
    onPaginationChange,
    mount,
    unmount,
  };
});
