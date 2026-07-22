import React from 'react'
import { useAuthStore } from '@/store'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const { login } = useAuthStore()
  const navigate = useNavigate()
  
  const handleMockLogin = (role) => {
    login('mock_token', { name: `Mock ${role}`, role })
    if (role === 'school_admin' || role === 'super_admin') {
      navigate('/admin/dashboard')
    } else if (role === 'teacher') {
      navigate('/teacher/dashboard')
    } else {
      navigate('/parent/dashboard')
    }
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-card rounded-lg shadow-md max-w-sm w-full mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-foreground text-center">School ERP Portal Login</h1>
      <div className="space-y-3 w-full">
        <button
          onClick={() => handleMockLogin('school_admin')}
          className="w-full py-2 bg-primary text-primary-foreground rounded hover:bg-primary/95 transition-colors cursor-pointer"
        >
          Login as Admin
        </button>
        <button
          onClick={() => handleMockLogin('teacher')}
          className="w-full py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/95 transition-colors cursor-pointer"
        >
          Login as Teacher
        </button>
        <button
          onClick={() => handleMockLogin('parent')}
          className="w-full py-2 bg-accent text-accent-foreground border border-border rounded hover:bg-accent/95 transition-colors cursor-pointer"
        >
          Login as Parent
        </button>
      </div>
    </div>
  )
}
