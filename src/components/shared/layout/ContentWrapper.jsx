import React from 'react'

export default function ContentWrapper({ children }) {
  return (
    <div className="flex-1 w-full bg-background min-h-screen">
      {children}
    </div>
  )
}
