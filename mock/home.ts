import { setTimeout as delay } from "node:timers/promises";
import type { MockContext, MockResponse, MockRoute } from "../plugins/mock";

const homeListSeeds = [
  ["用户中心", "管理用户基础信息和账号状态"],
  ["权限管理", "管理角色、权限和数据范围"],
  ["数据看板", "展示核心业务数据"],
  ["消息中心", "管理站内消息和通知"],
  ["订单管理", "管理订单和交易记录"],
  ["内容管理", "管理站点内容和发布流程"],
  ["资产管理", "管理企业资产信息"],
  ["审批中心", "管理审批流程和审批记录"],
  ["运营平台", "支持日常运营工作"],
  ["报表中心", "生成和管理业务报表"],
  ["客户管理", "管理客户资料和跟进记录"],
  ["配置中心", "管理系统级配置"],
] as const;

let homeList: API.HomeData[] = homeListSeeds.map(
  ([name, description], index) => ({
    uuid: `00000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
    name,
    description,
  }),
);

function createSuccess<T>(
  data: T,
  status = 200,
): MockResponse<API.SuccessResult<T>> {
  return { body: { success: true, data }, status };
}

function createNotFound(): MockResponse<API.ErrorResult> {
  return {
    body: {
      success: false,
      errorCode: "404",
      errorMessage: "项目不存在",
    },
    status: 404,
  };
}

function createDuplicate(): MockResponse<API.ErrorResult> {
  return {
    body: {
      success: false,
      errorType: "WARNING",
      errorMessage: "项目名称已存在",
    },
  };
}

function hasDuplicateName(name: string, uuid?: string) {
  const normalizedName = name.trim().toLowerCase();

  return homeList.some(
    (item) =>
      item.uuid !== uuid && item.name.trim().toLowerCase() === normalizedName,
  );
}

export default [
  {
    method: "POST",
    path: `/api/home`,
    handler: async ({ body }: MockContext<API.HomeSetParams>) => {
      await delay(300);
      if (hasDuplicateName(body.name)) return createDuplicate();

      homeList = [{ uuid: crypto.randomUUID(), ...body }, ...homeList];

      return createSuccess(true, 201);
    },
  },
  {
    method: "PUT",
    path: `/api/home/:uuid`,
    handler: async ({ body, params }: MockContext<API.HomeSetParams>) => {
      const { uuid } = params;
      const current = homeList.find((item) => item.uuid === uuid);
      await delay(300);

      if (!current) return createNotFound();
      if (hasDuplicateName(body.name, uuid)) return createDuplicate();

      homeList = homeList.map((item) =>
        item.uuid === uuid ? { uuid, ...body } : item,
      );

      return createSuccess(true);
    },
  },
  {
    method: "DELETE",
    path: `/api/home/:uuid`,
    handler: async ({ params }: MockContext) => {
      const { uuid } = params;
      const current = homeList.find((item) => item.uuid === uuid);
      await delay(300);

      if (!current) return createNotFound();

      homeList = homeList.filter((item) => item.uuid !== uuid);

      return createSuccess(true);
    },
  },
  {
    method: "GET",
    path: `/api/home`,
    handler: async ({ url }: MockContext) => {
      const keyword = url.searchParams.get("keyword")?.trim().toLowerCase();
      const pageNum = Number(url.searchParams.get("pageNum"));
      const pageSize = Number(url.searchParams.get("pageSize"));
      const filteredList = keyword
        ? homeList.filter(({ name, description }) =>
            `${name}${description ?? ""}`.toLowerCase().includes(keyword),
          )
        : homeList;
      const start = (pageNum - 1) * pageSize;
      await delay(300);

      return createSuccess({
        list: filteredList.slice(start, start + pageSize),
        total: filteredList.length,
      });
    },
  },
  {
    method: "GET",
    path: `/api/home/:uuid`,
    handler: async ({ params }: MockContext) => {
      const detail = homeList.find((item) => item.uuid === params.uuid);
      await delay(300);

      return detail ? createSuccess(detail) : createNotFound();
    },
  },
] satisfies MockRoute[];
