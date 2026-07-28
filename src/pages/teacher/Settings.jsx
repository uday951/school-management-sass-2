import React, { useState, useEffect } from 'react'
import axiosClient from '@/config/axiosClient'
import {
  PageContainer,
  PageHeader,
  SimpleCard,
  Button
} from '@/components/shared'
import { User, Shield, Key, Check, Info } from 'lucide-react'

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile')
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    city: '',
    state: '',
    address: ''
  })
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  const fetchProfile = async () => {
    setLoading(true)
    try {
      const res = await axiosClient.get('/teacher/profile')
      if (res.data.success) {
        setProfile(res.data.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setProfile(prev => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswords(prev => ({ ...prev, [name]: value }))
  }

  const saveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    try {
      const res = await axiosClient.put('/teacher/profile', profile)
      if (res.data.success) {
        setProfile(res.data.data)
        setMessage({ type: 'success', text: 'Profile contact details updated successfully.' })
      }
    } catch (err) {
      console.error(err)
      setMessage({ type: 'error', text: 'Failed to update contact details.' })
    } finally {
      setSaving(false)
    }
  }

  const changePassword = async (e) => {
    e.preventDefault()
    if (passwords.newPassword !== passwords.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' })
      return
    }
    setSaving(true)
    setMessage(null)
    try {
      const res = await axiosClient.put('/teacher/change-password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      })
      if (res.data.success) {
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' })
        setMessage({ type: 'success', text: 'Security credentials updated successfully.' })
      }
    } catch (err) {
      console.error(err)
      setMessage({ type: 'error', text: 'Failed to change password.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageContainer>
      <PageHeader
        title="Settings & Credentials"
        subtitle="Manage professional contact folders and portal security passwords."
        actions={
          <div className="flex gap-2">
            <button
              onClick={() => { setActiveTab('profile'); setMessage(null); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${activeTab === 'profile' ? 'bg-primary text-primary-foreground shadow-sm' : 'border border-input bg-card text-foreground hover:bg-muted'}`}
            >
              <User className="h-4 w-4" /> Personal Info
            </button>
            <button
              onClick={() => { setActiveTab('security'); setMessage(null); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${activeTab === 'security' ? 'bg-primary text-primary-foreground shadow-sm' : 'border border-input bg-card text-foreground hover:bg-muted'}`}
            >
              <Shield className="h-4 w-4" /> Security Settings
            </button>
          </div>
        }
      />

      {message && (
        <div className={`p-4 rounded-xl border text-xs font-semibold mb-6 flex items-center gap-2 ${message.type === 'success' ? 'bg-emerald-500/5 border-emerald-200 text-emerald-800' : 'bg-rose-500/5 border-rose-200 text-rose-800'}`}>
          {message.type === 'success' ? <Check className="h-4 w-4 text-emerald-600" /> : <Info className="h-4 w-4 text-rose-600" />}
          <span>{message.text}</span>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          <div className="h-10 bg-muted rounded animate-pulse" />
          <div className="h-10 bg-muted rounded animate-pulse" />
        </div>
      ) : activeTab === 'profile' ? (
        <form onSubmit={saveProfile}>
          <SimpleCard title="Edit Contact Dossier Details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold leading-relaxed">
              <div>
                <label className="block text-muted-foreground mb-1 font-bold">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={profile.firstName || ''}
                  onChange={handleProfileChange}
                  required
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-muted-foreground mb-1 font-bold">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={profile.lastName || ''}
                  onChange={handleProfileChange}
                  required
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-muted-foreground mb-1 font-bold">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={profile.email || ''}
                  disabled
                  className="w-full px-3 py-2 bg-muted border border-border rounded-xl text-muted-foreground cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-muted-foreground mb-1 font-bold">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={profile.phone || ''}
                  onChange={handleProfileChange}
                  required
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-muted-foreground mb-1 font-bold">City</label>
                <input
                  type="text"
                  name="city"
                  value={profile.city || ''}
                  onChange={handleProfileChange}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-muted-foreground mb-1 font-bold">State</label>
                <input
                  type="text"
                  name="state"
                  value={profile.state || ''}
                  onChange={handleProfileChange}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-muted-foreground mb-1 font-bold">Residential Address</label>
                <input
                  type="text"
                  name="address"
                  value={profile.address || ''}
                  onChange={handleProfileChange}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground rounded-xl cursor-pointer font-bold disabled:opacity-50 transition"
              >
                {saving ? 'Saving...' : 'Save Dossier'}
              </button>
            </div>
          </SimpleCard>
        </form>
      ) : (
        <form onSubmit={changePassword}>
          <SimpleCard title="Change Security Password Credentials">
            <div className="grid grid-cols-1 gap-4 max-w-sm text-xs font-semibold leading-relaxed">
              <div>
                <label className="block text-muted-foreground mb-1 font-bold">Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwords.currentPassword}
                  onChange={handlePasswordChange}
                  required
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-muted-foreground mb-1 font-bold flex items-center gap-1"><Key className="h-3.5 w-3.5" /> New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwords.newPassword}
                  onChange={handlePasswordChange}
                  required
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-muted-foreground mb-1 font-bold">Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwords.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground rounded-xl cursor-pointer font-bold disabled:opacity-50 transition"
              >
                {saving ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </SimpleCard>
        </form>
      )}
    </PageContainer>
  )
}
