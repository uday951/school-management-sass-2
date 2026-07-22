import React from 'react'

export default function SkeletonLoader({ className }) {
  return (
    <div className={`animate-pulse rounded bg-muted/65 ${className}`} />
  )
}
