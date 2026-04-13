import { useEffect } from "react";
import { useLogStore } from "../store/logStore.js";
import { toYYYYMMDD } from "../utils/dateUtils.js";

export const useDailyLog = (dateInput) => {
  const date = dateInput ? toYYYYMMDD(dateInput) : toYYYYMMDD(new Date());
  const fetchLog = useLogStore(s => s.fetchLog);
  const log = useLogStore(s => s.log);
  const loading = useLogStore(s => s.loading);
  const error = useLogStore(s => s.error);

  useEffect(() => {
    fetchLog(date);
  }, [date]); // eslint-disable-line react-hooks/exhaustive-deps

  return { date, log, loading, error };
};
