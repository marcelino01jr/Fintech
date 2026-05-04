"use client";

import * as React from "react";

type Toast = {
  id: string;
  title: string;
  description?: string;
};

const listeners: Array<(toasts: Toast[]) => void> = [];
let memoryToasts: Toast[] = [];

function dispatch(toasts: Toast[]) {
  memoryToasts = toasts;
  listeners.forEach((listener) => listener(memoryToasts));
}

export function toast(toast: Omit<Toast, "id">) {
  const id = crypto.randomUUID();
  dispatch([{ ...toast, id }, ...memoryToasts].slice(0, 3));
  setTimeout(() => dispatch(memoryToasts.filter((item) => item.id !== id)), 3000);
}

export function useToast() {
  const [toasts, setToasts] = React.useState<Toast[]>(memoryToasts);

  React.useEffect(() => {
    listeners.push(setToasts);
    return () => {
      const index = listeners.indexOf(setToasts);
      if (index > -1) listeners.splice(index, 1);
    };
  }, []);

  return { toasts };
}
