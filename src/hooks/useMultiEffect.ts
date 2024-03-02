import { useState, useEffect } from "react";

type ShouldUpdateFunction<T> = (oldState: T, newState: T) => boolean;

export const shouldUpdateDefault: ShouldUpdateFunction<unknown[]> = (
  oldState,
  newState
) => {
  if (oldState.length !== newState.length) return true;

  const depChanges = newState.reduce<number>((count, curr, index) => {
    if (curr !== oldState[index]) return count + 1;
    return count;
  }, 0);

  return depChanges == newState.length;
};

export const useMultiEffect = <const T extends Array<unknown>>(
  callback: () => void | (() => void),
  deps: T,
  shouldUpdate: ShouldUpdateFunction<T> = shouldUpdateDefault
) => {
  const [state, setState] = useState({ deps, isLoading: false });

  useEffect(() => {
    if (deps == state.deps) return;

    if (shouldUpdate(state.deps, deps)) {
      setState({ deps, isLoading: false });
      return callback();
    } else if (!state.isLoading) {
      setState({ ...state, isLoading: true });
    }
  }, [...deps, shouldUpdate]);

  return { isLoading: state.isLoading };
};
