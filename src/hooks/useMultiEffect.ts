import { useState, useEffect } from "react";

type ShouldUpdateFunction<T> = (oldState: T[], newState: T[]) => boolean;

export const shouldUpdateDefault: ShouldUpdateFunction<unknown> = (
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

export const useMultiEffect = <const T>(
  callback: () => void,
  deps: T[],
  shouldUpdate: ShouldUpdateFunction<T> = shouldUpdateDefault
) => {
  const [depState, setDepState] = useState(deps);

  useEffect(() => {
    if (shouldUpdate(depState, deps)) {
      setDepState(deps);
      callback();
    }
  }, [...deps, shouldUpdate]);
};
