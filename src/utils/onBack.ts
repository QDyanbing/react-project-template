import { router } from "@config/router";

export default (defaultPath: string) => {
  if (router.history.canGoBack()) {
    router.history.back();
  } else {
    router.navigate({ to: defaultPath, replace: true });
  }
};
