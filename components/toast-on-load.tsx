"use client";

import { useEffect } from "react";
import { toast } from "@/components/ui/use-toast";

export function ToastOnLoad({ title, description }: { title: string; description?: string }) {
  useEffect(() => {
    toast({ title, description });
  }, [title, description]);

  return null;
}
