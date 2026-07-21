declare namespace API {
  interface HomeParams {
    keyword?: string;
    pageNum: number;
    pageSize: number;
  }

  interface HomeData {
    id: number;
    name: string;
    owner: string;
    status: "进行中" | "已完成";
    updatedAt: string;
  }

  interface HomeResult {
    list: HomeData[];
    total: number;
  }
}
