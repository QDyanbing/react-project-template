import { useMemoizedFn } from "ahooks";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { type SetStateAction, useMemo, useState } from "react";

type UrlState = Record<string, string | string[]>;

type UrlValue<T> = T extends readonly unknown[] ? string[] : string;

type State<S extends object> = Partial<{
  [K in keyof S]: UrlValue<Required<S>[K]>;
}>;

interface Options {
  navigateMode?: "push" | "replace";
}

const normalizeValue = (value: unknown) => {
  if (typeof value === "string") return value;
  if (value === null) return "";
  if (typeof value === "object") return JSON.stringify(value) ?? String(value);

  return String(value);
};

const normalizeSearch = (search: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(search)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => [
        key,
        Array.isArray(value)
          ? value.map((item) => normalizeValue(item))
          : normalizeValue(value),
      ]),
  ) as UrlState;

export default <S extends object = UrlState>(
  initialState?: State<S> | (() => State<S>),
  options: Options = {},
) => {
  const navigate = useNavigate();
  const search = useSearch({ strict: false });
  const { navigateMode = "push" } = options;
  const [defaultState] = useState<State<S>>(() => {
    if (typeof initialState === "function") return initialState();
    return initialState ?? {};
  });
  const state = useMemo<State<S>>(
    () => ({ ...defaultState, ...normalizeSearch(search) }),
    [defaultState, search],
  );

  const setState = useMemoizedFn((action: SetStateAction<State<S>>) => {
    navigate({
      to: ".",
      replace: navigateMode === "replace",
      search: (currentState: Record<string, unknown>) => {
        const currentQuery = {
          ...defaultState,
          ...normalizeSearch(currentState),
        } as State<S>;
        const nextState =
          typeof action === "function" ? action(currentQuery) : action;

        return {
          ...currentState,
          ...nextState,
        };
      },
    });
  });

  return [state, setState] as const;
};
