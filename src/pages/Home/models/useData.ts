import { getSearch } from "@/services/home";
import { create } from "zustand";
import usePage from "./usePage";

interface Store {
  loading: boolean;
  data: API.HomeData[];
  total: number;
  onRefresh: () => void;
}

export default create<Store>((set) => {
  const loading: boolean = false;
  const data: API.HomeData[] = [];
  const total: number = 0;

  const getData = async () => {
    try {
      const { ready, params } = usePage.getState();
      if (!ready) return;
      set({ loading: true });
      const result = await getSearch(params);
      if (!result) return;

      const { data } = result;
      if (usePage.getState().ready) {
        set({ data: data.list, total: data.total });
      }
    } finally {
      set({ loading: false });
    }
  };

  usePage.subscribe((state) => {
    if (!state.ready) {
      set({ data: [], loading: false, total: 0 });
    } else {
      getData();
    }
  });

  return {
    loading,
    data,
    total,
    onRefresh: getData,
  };
});
