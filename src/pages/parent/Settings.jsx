import React, { useState, useEffect } from 'react'
import axiosClient from '@/config/axiosClient'
import {
  PageContainer,
  PageHeader,
  SimpleCard,
  Button,
  SkeletonLoader
} from '@/components/shared'
import { User, Shield, Key, Check, Info } from 'lucide-react'

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile')
  const [profile, setProfile] = useState({
    name: '',
    phone: '',
    altPhone: '',
    address: '',
    city: '',
    state: '',
    occupation: '',
    avatarUrl: ''
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
      const res = await axiosClient.get('/portal/my-profile')
      if (res.data.success) {
        setProfile(res.data.data)
      }
    } catch (err) {
      console.error('Error fetching parent profile:', err)
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
      const res = await axiosClient.put('/portal/my-profile', profile)
      if (res.data.success) {
        setProfile(res.data.data)
        setMessage({ type: 'success', text: 'Profile updated successfully.' })
      }
    } catch (err) {
      console.error(err)
      setMessage({ type: 'error', text: 'Failed to update profile.' })
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
      const res = await axiosClient.put('/portal/change-password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      })
      if (res.data.success) {
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' })
        setMessage({ type: 'success', text: 'Password updated successfully.' })
      }
    } catch (err) {
      console.error(err)
      setMessage({ type: 'error', text: 'Failed to update password.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageContainer>
      <PageHeader
        title="Portal & Security Settings"
        subtitle="Manage contact records, address registries, notification filters, and sign-in credentials."
        actions={
          <div className="flex gap-2">
            <Button
              variant={activeTab === 'profile' ? 'primary' : 'outline'}
              className="flex items-center gap-1.5"
              onClick={() => { setActiveTab('profile'); setMessage(null); }}
            >
              <User className="h-4 w-4" /> Personal Info
            </Button>
            <Button
              variant={activeTab === 'security' ? 'primary' : 'outline'}
              className="flex items-center gap-1.5"
              onClick={() => { setActiveTab('security'); setMessage(null); }}
            >
              <Shield className="h-4 w-4" /> Security Settings
            </Button>
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
        <SkeletonLoader count={4} className="h-14 mb-4" />
      ) : activeTab === 'profile' ? (
        /* Edit Profile Details */
        <form onSubmit={saveProfile}>
          <SimpleCard title="Edit Contact Dossier Details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold leading-relaxed">
              <div>
                <label className="block text-muted-foreground mb-1 font-bold">Parent Name</label>
                <input
                  type="text"
                  name="name"
                  value={profile.name || ''}
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
                <label className="block text-muted-foreground mb-1 font-bold">Primary Phone</label>
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
                <label className="block text-muted-foreground mb-1 font-bold">Secondary Phone</label>
                <input
                  type="text"
                  name="altPhone"
                  value={profile.altPhone || ''}
                  onChange={handleProfileChange}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-muted-foreground mb-1 font-bold">Occupation</label>
                <input
                  type="text"
                  name="occupation"
                  value={profile.occupation || ''}
                  onChange={handleProfileChange}
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
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Dossier'}
              </Button>
            </div>
          </SimpleCard>
        </form>
      ) : (
        /* Security/Password change */
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
              <Button type="submit" disabled={saving}>
                {saving ? 'Updating...' : 'Update Password'}
              </Button>
            </div>
          </SimpleCard>
        </form>
      )}
    </PageContainer>
  )
}
