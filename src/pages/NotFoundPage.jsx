import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
      <h1 className="text-4xl font-extrabold text-foreground mb-4">404 - Page Not Found</h1>
      <p className="text-muted-foreground mb-6 max-w-md">The page you are looking for does not exist or has been moved to another location.</p>
      <button
        onClick={() => navigate('/')}
        className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 cursor-pointer"
      >
        Go Home
      </button>
    </div>
  )
}
