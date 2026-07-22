import React from 'react'
import { Outlet } from 'react-router-dom'

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-in fade-in duration-300">
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded bg-primary text-primary-foreground text-2xl font-bold mb-3">
            S
          </div>
          <h2 className="text-3xl font-extrabold text-foreground">School ERP</h2>
          <p className="text-sm text-muted-foreground mt-1">Enterprise School Administration Portal</p>
        </div>
        <Outlet />
      </div>
    </div>
  )
}
