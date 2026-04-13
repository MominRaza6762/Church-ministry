import { useEffect, useRef } from "react";
import { useLogStore } from "../store/logStore.js";

export const useAutoSave = (date, section, value) => {
  const autoSave = useLogStore(s => s.autoSave);
  const prev = useRef(undefined);

  useEffect(() => {
    const serialized = JSON.stringify(value ?? {});
    if (prev.current === undefined) {
      prev.current = serialized;
      return;
    }
    if (serialized !== prev.current) {
      prev.current = serialized;
      autoSave(date, section, value);
    }
  }); // intentionally no deps — runs after every render but only saves on change
};
