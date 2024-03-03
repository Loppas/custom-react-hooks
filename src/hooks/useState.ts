import { useCallback, useMemo, useState } from "react";

export type StateIntializer<T> = T | (() => T);

export type HistoricStateOptions = {
  maxEntries?: number;
};

const defaultOptions = {
  maxEntries: 10,
} satisfies HistoricStateOptions;

export const useHistoricState = <const T>(
  initial: StateIntializer<T>,
  _options?: HistoricStateOptions
) => {
  const options = useMemo(
    () => ({ ...defaultOptions, ..._options }),
    [_options]
  );

  const initialState = useMemo(
    () => [initial instanceof Function ? initial() : initial],
    [initial]
  );

  const [history, setHistory] = useState(initialState);

  const setState = useCallback(
    (newState: T) => {
      let updatedHistory = [...history, newState];

      if (updatedHistory.length > options.maxEntries)
        updatedHistory = updatedHistory.slice(1);

      setHistory(updatedHistory);
    },
    [history, options.maxEntries]
  );

  const undoState = useCallback(() => {
    const cursorIndex = history.length - 1;

    if (cursorIndex > 0) {
      setState(history[cursorIndex]);
    }
  }, [history, setState]);

  const redoState = useCallback(() => {
    const cursorIndex = history.length - 2;

    if (cursorIndex > 0) {
      setState(history[cursorIndex]);
    }
  }, [history, setState]);

  return {
    history,
    state: history[-1],
    setState,
    undoState,
    redoState,
  };
};

export const useTransactionalState = <const T>(initial: StateIntializer<T>) => {
  const { state, setState, undoState, redoState } = useHistoricState(initial);
  const {
    state: tState,
    setState: setTState,
    undoState: undoTState,
    redoState: redoTState,
  } = useHistoricState(state);
  const [transactionMode, setTransactionMode] = useState(false);

  const begin = useCallback(() => {
    if (!transactionMode) {
      setTransactionMode(true);
      setTState(state);
    }
  }, [transactionMode, setTransactionMode, setTState, state]);

  const commit = useCallback(() => {
    if (transactionMode) {
      setTransactionMode(false);
      setState(tState);
    }
  }, [transactionMode, setTransactionMode, setState, tState]);

  const rollback = useCallback(() => {
    if (transactionMode) {
      setTransactionMode(false);
    }
  }, [transactionMode, setTransactionMode]);

  if (transactionMode)
    return {
      state: tState,
      setState: setTState,
      undoState: undoTState,
      redoState: redoTState,
      begin,
      commit,
      rollback,
    };

  return {
    state,
    setState,
    undoState,
    redoState,
    begin,
    commit,
    rollback,
  };
};
