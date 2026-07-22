import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function UnauthorizedPage() {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
      <h1 className="text-4xl font-extrabold text-destructive mb-4">403 - Access Denied</h1>
      <p className="text-muted-foreground mb-6 max-w-md">You do not have permissions to access this page. Contact your administrator if you believe this is an error.</p>
      <button
        onClick={() => navigate('/')}
        className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 cursor-pointer"
      >
        Go Home
      </button>
    </div>
  )
}
