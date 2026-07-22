import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store'

export const RoleGuard = ({ allowedRoles }) => {
  const { user } = useAuthStore()
  
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />
  }
  
  return <Outlet />
}
