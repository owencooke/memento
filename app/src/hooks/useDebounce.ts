import { useState, useEffect } from "react";
import { debounce } from "lodash";

export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = debounce(setDebouncedValue, delay);
    handler(value);
    return () => handler.cancel();
  }, [value, delay]);

  return debouncedValue;
}
