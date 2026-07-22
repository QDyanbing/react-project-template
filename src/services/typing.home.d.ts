declare namespace API {
  interface HomeSetParams {
    name: string;
    description?: string;
  }

  interface HomeParams {
    keyword?: string;
    pageNum: number;
    pageSize: number;
  }

  interface HomeData {
    uuid: string;
    name: string;
    description?: string;
  }
}
