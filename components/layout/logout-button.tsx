'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { LogOut, X, AlertTriangle } from 'lucide-react'
import { signOut } from '@/app/actions'

export function LogoutButton({ email, username }: { email?: string; username?: string }) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [mounted, setMounted] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
        setShowConfirm(false)
      }
    }
    if (showConfirm) {
      document.addEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = ''
    }
  }, [showConfirm])

  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setShowConfirm(false)
    }
    if (showConfirm) {
      document.addEventListener('keydown', handleEsc)
    }
    return () => document.removeEventListener('keydown', handleEsc)
  }, [showConfirm])

  const modal = showConfirm && mounted
    ? createPortal(
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            ref={dialogRef}
            style={{
              width: '90vw',
              maxWidth: '384px',
              borderRadius: '1.5rem',
              border: '1px solid #e2e8f0',
              backgroundColor: '#fff',
              padding: '1.5rem',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            }}
          >
            <button
              onClick={() => setShowConfirm(false)}
              className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              style={{ position: 'absolute', right: '1rem', top: '1rem' }}
              aria-label="Tutup"
            >
              <X className="h-4 w-4" />
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
                <AlertTriangle className="h-7 w-7 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Keluar dari akun?</h3>
              <p className="mt-2 text-sm text-slate-500">
                Anda akan keluar dari <span className="font-medium text-slate-700">{email}</span>. Yakin ingin melanjutkan?
              </p>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Batal
              </button>
              <form action={signOut} className="flex-1">
                <button
                  type="submit"
                  className="w-full rounded-2xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-600"
                >
                  Ya, Keluar
                </button>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )
    : null

  return (
    <>
      <div className="flex items-center gap-3">
        <span className="hidden text-sm font-medium text-slate-700 sm:block truncate max-w-[180px]">
          {username || email}
        </span>
        <button
          onClick={() => setShowConfirm(true)}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-all hover:bg-red-50 hover:text-red-600 hover:border-red-200 hover:shadow-sm"
          title="Keluar"
          aria-label="Keluar"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
      {modal}
    </>
  )
}
