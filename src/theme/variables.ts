import type { CSSProperties } from "react";

type CSSVariables = CSSProperties &
  Record<`--${string}`, string | number>;

const variables: CSSVariables = {
  "--layout-header-height": "56px",
  "--layout-sider-width": "220px",
};

export default variables;
