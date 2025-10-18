import { useState, useEffect, Dispatch, SetStateAction } from 'react';

function getStorageValue<T>(key: string, defaultValue: T): T {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(key);
    if (saved !== null) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse local storage value", e);
        return defaultValue;
      }
    }
  }
  return defaultValue;
}

// FIX: Imported Dispatch and SetStateAction to resolve "Cannot find namespace 'React'" error.
export function useLocalStorage<T>(key: string, defaultValue: T): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    return getStorageValue(key, defaultValue);
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error("Failed to set local storage value", e);
    }
  }, [key, value]);

  return [value, setValue];
}
