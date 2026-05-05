"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ConfirmDeleteProps {
  title: string;
  message?: string;
  children: React.ReactNode;
  onConfirm: () => void;
}

export function ConfirmDelete({ title, message = "Aksi ini tidak dapat dibatalkan.", children, onConfirm }: ConfirmDeleteProps) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleConfirm = () => {
    onConfirm();
    setOpen(false);
  };

  const modal = open ? createPortal(
    (
      <div 
        className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      >
        <div 
          className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg text-slate-900">Hapus {title}?</h3>
            <button 
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="text-sm text-slate-600 mb-6">{message}</p>
          <div className="flex justify-end gap-3 pt-2">
            <Button 
              variant="ghost" 
              onClick={() => setOpen(false)}
              className="h-10 px-4"
            >
              Batalkan
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirm}
              className="h-10 px-4"
            >
              Hapus
            </Button>
          </div>
        </div>
      </div>
    ),
    document.body
  ) : null;

  return (
    <>
      <span onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(true); }}>
        {children}
      </span>
      {modal}
    </>
  );
}
