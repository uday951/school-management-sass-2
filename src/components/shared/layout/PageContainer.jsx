import React from 'react'

export default function PageContainer({ children }) {
  return (
    <div className="flex flex-col space-y-6 w-full max-w-7xl mx-auto p-4 md:p-6 animate-in fade-in duration-200">
      {children}
    </div>
  )
}
