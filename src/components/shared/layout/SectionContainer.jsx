import React from 'react'

export default function SectionContainer({ children, title }) {
  return (
    <section className="bg-card text-card-foreground p-6 rounded-lg border border-border shadow-sm">
      {title && <h2 className="text-lg font-semibold mb-4 text-foreground">{title}</h2>}
      {children}
    </section>
  )
}
