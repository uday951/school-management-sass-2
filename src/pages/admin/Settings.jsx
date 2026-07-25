import React, { useState, useEffect } from 'react'
import axiosClient from '@/config/axiosClient'
import { 
  PageHeader, 
  PageContainer, 
  SimpleCard, 
  StatCard, 
  Button, 
  FormInput, 
  FormSelect, 
  Badge, 
  StatusChip,
  ReusableTable
} from '@/components/shared'
import { 
  Shield, 
  Users, 
  UserCheck, 
  Activity, 
  Folder, 
  Briefcase, 
  Calendar, 
  Database, 
  Settings as SettingsIcon, 
  Bell, 
  Lock, 
  Key, 
  Plus, 
  Trash2, 
  RotateCcw,
  CheckCircle,
  FileText
} from 'lucide-react'

export default function Settings() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  // ─── STATE HOARDS ──────────────────────────────────────────────────────────
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    onlineUsers: 0,
    roles: 0,
    departments: 0,
    loginStatistics: { total: 0, failed: 0 },
    failedLoginAttempts: 0,
    recentActivities: []
  })

  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [permissions, setPermissions] = useState([])
  const [departments, setDepartments] = useState([])
  const [designations, setDesignations] = useState([])
  const [systemSettings, setSystemSettings] = useState({ schoolName: '', timezone: '', language: '', currency: '', fileUploadLimit: 5 })
  const [notificationSettings, setNotificationSettings] = useState({ emailEnabled: true, smsEnabled: true, pushEnabled: true, reminderDays: 3 })
  const [securityPolicy, setSecurityPolicy] = useState({ sessionTimeout: 30, maxLoginAttempts: 5, accountLockDuration: 15 })
  const [backupHistory, setBackupHistory] = useState([])

  // Modal / Form States
  const [showUserModal, setShowUserModal] = useState(false)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [showDeptModal, setShowDeptModal] = useState(false)
  const [showDesigModal, setShowDesigModal] = useState(false)

  // Form Fields
  const [userForm, setUserForm] = useState({ name: '', email: '', role: 'teacher', username: '', mobile: '', department: '', designation: '' })
  const [roleForm, setRoleForm] = useState({ name: '', description: '' })
  const [deptForm, setDeptForm] = useState({ name: '', code: '', description: '' })
  const [desigForm, setDesigForm] = useState({ name: '', description: '' })

  const modulesList = [
    'Dashboard', 'Students', 'Teachers', 'Parents', 'Attendance', 
    'Academic', 'Exams', 'Fees', 'Finance', 'Payroll', 
    'Transport', 'Library', 'Communication', 'Inventory', 'Reports', 'Settings'
  ]

  // ─── DATA FETCHING ─────────────────────────────────────────────────────────
  const fetchDashboardStats = async () => {
    try {
      const res = await axiosClient.get('/administration/dashboard-stats')
      if (res.data.success) setDashboardStats(res.data.data)
    } catch (err) { console.error(err) }
  }

  const fetchUsers = async () => {
    try {
      const res = await axiosClient.get('/administration/users')
      if (res.data.success) setUsers(res.data.data)
    } catch (err) { console.error(err) }
  }

  const fetchRoles = async () => {
    try {
      const res = await axiosClient.get('/administration/roles')
      if (res.data.success) setRoles(res.data.data)
    } catch (err) { console.error(err) }
  }

  const fetchPermissions = async () => {
    try {
      const res = await axiosClient.get('/administration/permissions')
      if (res.data.success) setPermissions(res.data.data)
    } catch (err) { console.error(err) }
  }

  const fetchDepartments = async () => {
    try {
      const res = await axiosClient.get('/administration/departments')
      if (res.data.success) setDepartments(res.data.data)
    } catch (err) { console.error(err) }
  }

  const fetchDesignations = async () => {
    try {
      const res = await axiosClient.get('/administration/designations')
      if (res.data.success) setDesignations(res.data.data)
    } catch (err) { console.error(err) }
  }

  const fetchSystemSettings = async () => {
    try {
      const res = await axiosClient.get('/administration/system-settings')
      if (res.data.success) setSystemSettings(res.data.data)
    } catch (err) { console.error(err) }
  }

  const fetchNotificationSettings = async () => {
    try {
      const res = await axiosClient.get('/administration/notification-settings')
      if (res.data.success) setNotificationSettings(res.data.data)
    } catch (err) { console.error(err) }
  }

  const fetchSecurityPolicy = async () => {
    try {
      const res = await axiosClient.get('/administration/security-policy')
      if (res.data.success) setSecurityPolicy(res.data.data)
    } catch (err) { console.error(err) }
  }

  const fetchBackupHistory = async () => {
    try {
      const res = await axiosClient.get('/administration/backup')
      if (res.data.success) setBackupHistory(res.data.data)
    } catch (err) { console.error(err) }
  }

  const triggerToast = (msg) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 4000)
  }

  useEffect(() => {
    if (activeTab === 'dashboard') fetchDashboardStats()
    if (activeTab === 'users') { fetchUsers(); fetchDepartments(); fetchDesignations() }
    if (activeTab === 'roles') fetchRoles()
    if (activeTab === 'permissions') { fetchPermissions(); fetchRoles() }
    if (activeTab === 'departments') fetchDepartments()
    if (activeTab === 'designations') fetchDesignations()
    if (activeTab === 'system') fetchSystemSettings()
    if (activeTab === 'notification') fetchNotificationSettings()
    if (activeTab === 'security') fetchSecurityPolicy()
    if (activeTab === 'backup') fetchBackupHistory()
  }, [activeTab])

  // ─── ACTION HANDLERS ───────────────────────────────────────────────────────
  const handleCreateUser = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const res = await axiosClient.post('/administration/users', userForm)
      if (res.data.success) {
        triggerToast('User account created successfully!')
        setShowUserModal(false)
        fetchUsers()
      }
    } catch (err) {
      console.error(err)
    } finally { setLoading(false) }
  }

  const handleCreateRole = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const res = await axiosClient.post('/administration/roles', roleForm)
      if (res.data.success) {
        triggerToast('Custom role created successfully!')
        setShowRoleModal(false)
        fetchRoles()
      }
    } catch (err) {
      console.error(err)
    } finally { setLoading(false) }
  }

  const handleCreateDept = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const res = await axiosClient.post('/administration/departments', deptForm)
      if (res.data.success) {
        triggerToast('Administrative department created!')
        setShowDeptModal(false)
        fetchDepartments()
      }
    } catch (err) {
      console.error(err)
    } finally { setLoading(false) }
  }

  const handleCreateDesig = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const res = await axiosClient.post('/administration/designations', desigForm)
      if (res.data.success) {
        triggerToast('Employee designation configuration created!')
        setShowDesigModal(false)
        fetchDesignations()
      }
    } catch (err) {
      console.error(err)
    } finally { setLoading(false) }
  }

  const handleUpdateSystemSettings = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const res = await axiosClient.put('/administration/system-settings', systemSettings)
      if (res.data.success) triggerToast('Global brand and system settings parameters saved!')
    } catch (err) {
      console.error(err)
    } finally { setLoading(false) }
  }

  const handleUpdateNotificationSettings = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const res = await axiosClient.put('/administration/notification-settings', notificationSettings)
      if (res.data.success) triggerToast('Notification channels setup saved successfully!')
    } catch (err) {
      console.error(err)
    } finally { setLoading(false) }
  }

  const handleUpdateSecurityPolicy = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const res = await axiosClient.put('/administration/security-policy', securityPolicy)
      if (res.data.success) triggerToast('Security policies and JWT timeout configurations saved!')
    } catch (err) {
      console.error(err)
    } finally { setLoading(false) }
  }

  const handleTriggerBackup = async () => {
    try {
      setLoading(true)
      const res = await axiosClient.post('/administration/backup')
      if (res.data.success) {
        triggerToast('System database backup ZIP archive generated!')
        fetchBackupHistory()
      }
    } catch (err) {
      console.error(err)
    } finally { setLoading(false) }
  }

  const handleRestoreBackup = async (fileName) => {
    if (window.confirm(`Are you sure you want to restore the system database from ${fileName}?`)) {
      try {
        setLoading(true)
        const res = await axiosClient.post('/administration/restore', { fileName })
        if (res.data.success) triggerToast('Database restoration successfully completed!')
      } catch (err) {
        console.error(err)
      } finally { setLoading(false) }
    }
  }

  const handleUserStatusAction = async (id, action) => {
    try {
      await axiosClient.post(`/administration/users/${id}/${action}`)
      triggerToast(`Account action: ${action} completed successfully!`)
      fetchUsers()
    } catch (err) { console.error(err) }
  }

  const handleDeleteUser = async (id) => {
    if (window.confirm('Soft delete this user account?')) {
      try {
        await axiosClient.delete(`/administration/users/${id}`)
        triggerToast('User deactivated and archived.')
        fetchUsers()
      } catch (err) { console.error(err) }
    }
  }

  const handlePermissionToggle = async (roleName, moduleName, action, currentVal) => {
    try {
      const actions = { [action]: !currentVal }
      await axiosClient.post('/administration/permissions', { role: roleName, moduleName, actions })
      fetchPermissions()
    } catch (err) { console.error(err) }
  }

  return (
    <PageContainer>
      <PageHeader 
        title="ERP Administration & System Settings"
        subtitle="Manage user directories, configure dynamic RBAC permission matrices, audit departments/designations, adjust security lock policies, and execute database backup routines."
      />

      {successMsg && (
        <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 p-4 rounded-lg text-sm font-semibold flex items-center gap-2 mb-6 animate-fadeIn">
          <CheckCircle className="h-4 w-4" /> {successMsg}
        </div>
      )}

      {/* Tabs Header */}
      <div className="flex border-b border-border select-none overflow-x-auto gap-1 mb-6 pb-1">
        {[
          { id: 'dashboard', label: 'Admin Dashboard', icon: Shield },
          { id: 'users', label: 'Users Directory', icon: Users },
          { id: 'roles', label: 'Roles', icon: UserCheck },
          { id: 'permissions', label: 'Permissions Matrix', icon: Key },
          { id: 'departments', label: 'Departments', icon: Folder },
          { id: 'designations', label: 'Designations', icon: Briefcase },
          { id: 'system', label: 'System Settings', icon: SettingsIcon },
          { id: 'notification', label: 'Notifications', icon: Bell },
          { id: 'backup', label: 'Backup & Restore', icon: Database },
          { id: 'security', label: 'Security Policies', icon: Lock }
        ].map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-t-lg transition-colors border-b-2 ${
                activeTab === tab.id 
                  ? 'border-primary text-primary bg-primary/5' 
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* ─── TAB CONTENT PANELS ───────────────────────────────────────────────── */}

      {/* 1. Dashboard Overview */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6 animate-fadeIn select-none">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard title="Total Users" value={`${dashboardStats.totalUsers}`} icon={Users} />
            <StatCard title="Active Accounts" value={`${dashboardStats.activeUsers}`} icon={UserCheck} />
            <StatCard title="Online Sessions" value={`${dashboardStats.onlineUsers}`} icon={Activity} />
            <StatCard title="Administrative Units" value={`${dashboardStats.departments}`} icon={Folder} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <SimpleCard title="Administrative Log History">
                <div className="space-y-4">
                  {dashboardStats.recentActivities && dashboardStats.recentActivities.map(act => (
                    <div key={act.id} className="flex justify-between items-center p-3 border border-border rounded-lg bg-card text-xs font-semibold">
                      <span className="text-foreground">{act.desc}</span>
                      <span className="text-muted-foreground text-[10px] uppercase font-bold">{new Date(act.time).toLocaleTimeString()}</span>
                    </div>
                  ))}
                </div>
              </SimpleCard>
            </div>

            <div className="lg:col-span-1">
              <SimpleCard title="Failed Login Policies alert">
                <div className="space-y-4 text-xs font-semibold">
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">Locked Accounts count</span>
                    <span className="text-rose-500 font-bold">{dashboardStats.failedLoginAttempts}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-muted-foreground">Online verification sessions</span>
                    <span className="text-emerald-500 font-bold">Stable</span>
                  </div>
                </div>
              </SimpleCard>
            </div>
          </div>
        </div>
      )}

      {/* 2. Users Directory */}
      {activeTab === 'users' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex justify-between items-center select-none">
            <h2 className="text-base font-bold text-foreground">User Directory Register</h2>
            <Button size="sm" onClick={() => setShowUserModal(true)} className="flex items-center gap-1.5"><Plus className="h-4 w-4" /> Create User</Button>
          </div>
          <ReusableTable 
            columns={[
              { header: 'Full Name', accessor: 'name' },
              { header: 'Email Address', accessor: 'email' },
              { header: 'Username', accessor: (row) => row.username || 'N/A' },
              { header: 'Role', accessor: (row) => <Badge>{row.role.toUpperCase()}</Badge> },
              { header: 'Department', accessor: (row) => row.department || 'N/A' },
              { header: 'Status', accessor: (row) => <StatusChip status={row.status} /> },
              { header: 'Account Actions', accessor: (row) => (
                <div className="flex gap-1.5 select-none">
                  {row.status === 'locked' ? (
                    <Button size="sm" variant="outline" onClick={() => handleUserStatusAction(row._id, 'unlock')}>Unlock</Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => handleUserStatusAction(row._id, 'lock')}>Lock</Button>
                  )}
                  {row.status === 'active' ? (
                    <Button size="sm" variant="outline" onClick={() => handleUserStatusAction(row._id, 'deactivate')}>Disable</Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => handleUserStatusAction(row._id, 'activate')}>Activate</Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => {
                    const pass = window.prompt('Enter new password:')
                    if (pass) handleUserStatusAction(row._id, `reset-password?password=${pass}`)
                  }}>Reset Pass</Button>
                  <Button variant="danger" size="sm" onClick={() => handleDeleteUser(row._id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              )}
            ]}
            data={Array.isArray(users) ? users : []}
          />
        </div>
      )}

      {/* 3. Roles */}
      {activeTab === 'roles' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex justify-between items-center select-none">
            <h2 className="text-base font-bold text-foreground">User Roles Directory</h2>
            <Button size="sm" onClick={() => setShowRoleModal(true)} className="flex items-center gap-1.5"><Plus className="h-4 w-4" /> Add Custom Role</Button>
          </div>
          <ReusableTable 
            columns={[
              { header: 'Role Key Name', accessor: 'name' },
              { header: 'Description', accessor: 'description' },
              { header: 'Type Classification', accessor: (row) => row.isCustom ? <Badge variant="outline">CUSTOM</Badge> : <Badge>SYSTEM DEFAULT</Badge> },
              { header: 'Actions', accessor: (row) => (
                row.isCustom ? <Button variant="danger" size="sm" onClick={() => {
                  axiosClient.delete(`/administration/roles/${row._id}`).then(() => {
                    triggerToast('Custom role deleted.')
                    fetchRoles()
                  })
                }}><Trash2 className="h-3.5 w-3.5" /></Button> : <span>Locked</span>
              )}
            ]}
            data={Array.isArray(roles) ? roles : []}
          />
        </div>
      )}

      {/* 4. Permissions Matrix */}
      {activeTab === 'permissions' && (
        <div className="space-y-4 animate-fadeIn overflow-x-auto select-none">
          <h2 className="text-base font-bold text-foreground mb-2">Dynamic RBAC Permission Matrix</h2>
          <table className="w-full text-left text-xs font-semibold border-collapse border border-border bg-card">
            <thead>
              <tr className="bg-muted border-b border-border">
                <th className="px-4 py-3">ERP Modules</th>
                {roles.map(r => (
                  <th key={r.name} className="px-4 py-3 uppercase text-center">{r.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {modulesList.map(moduleName => (
                <tr key={moduleName} className="border-b border-border last:border-none hover:bg-muted/30">
                  <td className="px-4 py-3 font-bold text-foreground">{moduleName}</td>
                  {roles.map(r => {
                    const perm = permissions.find(p => p.role === r.name && p.module === moduleName)
                    const canRead = perm?.actions?.read ?? true
                    return (
                      <td key={r.name} className="px-4 py-3 text-center">
                        <label className="inline-flex items-center gap-1 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={canRead}
                            onChange={() => handlePermissionToggle(r.name, moduleName, 'read', canRead)}
                            className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5"
                          />
                          <span>Access</span>
                        </label>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 5. Departments */}
      {activeTab === 'departments' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex justify-between items-center select-none">
            <h2 className="text-base font-bold text-foreground">Administrative Departments</h2>
            <Button size="sm" onClick={() => setShowDeptModal(true)} className="flex items-center gap-1.5"><Plus className="h-4 w-4" /> Add Department</Button>
          </div>
          <ReusableTable 
            columns={[
              { header: 'Department Name', accessor: 'name' },
              { header: 'Code ID', accessor: 'code' },
              { header: 'Description', accessor: 'description' },
              { header: 'Actions', accessor: (row) => (
                <Button variant="danger" size="sm" onClick={() => {
                  axiosClient.delete(`/administration/departments/${row._id}`).then(() => {
                    triggerToast('Department deleted.')
                    fetchDepartments()
                  })
                }}><Trash2 className="h-3.5 w-3.5" /></Button>
              )}
            ]}
            data={Array.isArray(departments) ? departments : []}
          />
        </div>
      )}

      {/* 6. Designations */}
      {activeTab === 'designations' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex justify-between items-center select-none">
            <h2 className="text-base font-bold text-foreground">Employee Designations</h2>
            <Button size="sm" onClick={() => setShowDesigModal(true)} className="flex items-center gap-1.5"><Plus className="h-4 w-4" /> Add Designation</Button>
          </div>
          <ReusableTable 
            columns={[
              { header: 'Designation Title', accessor: 'name' },
              { header: 'Description Details', accessor: 'description' },
              { header: 'Actions', accessor: (row) => (
                <Button variant="danger" size="sm" onClick={() => {
                  axiosClient.delete(`/administration/designations/${row._id}`).then(() => {
                    triggerToast('Designation deleted.')
                    fetchDesignations()
                  })
                }}><Trash2 className="h-3.5 w-3.5" /></Button>
              )}
            ]}
            data={Array.isArray(designations) ? designations : []}
          />
        </div>
      )}

      {/* 7. System Settings */}
      {activeTab === 'system' && (
        <div className="space-y-6 animate-fadeIn max-w-2xl select-none">
          <SimpleCard title="School Profile Branding & Localization Settings">
            <form onSubmit={handleUpdateSystemSettings} className="space-y-4">
              <FormInput 
                label="Institution/School Name"
                value={systemSettings.schoolName}
                onChange={(e) => setSystemSettings(prev => ({ ...prev, schoolName: e.target.value }))}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <FormSelect 
                  label="Local System Timezone"
                  value={systemSettings.timezone}
                  onChange={(e) => setSystemSettings(prev => ({ ...prev, timezone: e.target.value }))}
                  options={[
                    { value: 'GMT', label: 'GMT (UTC)' },
                    { value: 'EST', label: 'Eastern Standard Time (EST)' },
                    { value: 'IST', label: 'India Standard Time (IST)' }
                  ]}
                />
                <FormSelect 
                  label="Localization Language"
                  value={systemSettings.language}
                  onChange={(e) => setSystemSettings(prev => ({ ...prev, language: e.target.value }))}
                  options={[
                    { value: 'en', label: 'English' },
                    { value: 'es', label: 'Español' },
                    { value: 'fr', label: 'Français' }
                  ]}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormSelect 
                  label="Primary Currency representation"
                  value={systemSettings.currency}
                  onChange={(e) => setSystemSettings(prev => ({ ...prev, currency: e.target.value }))}
                  options={[
                    { value: 'USD', label: 'USD ($)' },
                    { value: 'EUR', label: 'EUR (€)' },
                    { value: 'INR', label: 'INR (₹)' }
                  ]}
                />
                <FormInput 
                  label="File Attachment Upload Limit (MB)"
                  type="number"
                  value={systemSettings.fileUploadLimit}
                  onChange={(e) => setSystemSettings(prev => ({ ...prev, fileUploadLimit: Number(e.target.value) }))}
                  required
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">{loading ? 'Saving Settings...' : 'Save Parameters configuration'}</Button>
            </form>
          </SimpleCard>
        </div>
      )}

      {/* 8. Notification Settings */}
      {activeTab === 'notification' && (
        <div className="space-y-6 animate-fadeIn max-w-lg select-none">
          <SimpleCard title="Broadcast Notifications Channel Preferences">
            <form onSubmit={handleUpdateNotificationSettings} className="space-y-4 text-xs font-semibold">
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={notificationSettings.emailEnabled}
                    onChange={(e) => setNotificationSettings(prev => ({ ...prev, emailEnabled: e.target.checked }))}
                    className="rounded border-border text-primary focus:ring-primary h-4.5 w-4.5"
                  />
                  <div>
                    <span className="block text-sm font-bold text-foreground">Email Notifications Channel</span>
                    <span className="text-muted-foreground font-normal">Dispatches emails to parents/teachers on exam & invoice schedules.</span>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer pt-2 border-t border-border">
                  <input 
                    type="checkbox" 
                    checked={notificationSettings.smsEnabled}
                    onChange={(e) => setNotificationSettings(prev => ({ ...prev, smsEnabled: e.target.checked }))}
                    className="rounded border-border text-primary focus:ring-primary h-4.5 w-4.5"
                  />
                  <div>
                    <span className="block text-sm font-bold text-foreground">SMS Notifications Channel</span>
                    <span className="text-muted-foreground font-normal">Sends text notifications on student absences and late arrival alerts.</span>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer pt-2 border-t border-border">
                  <input 
                    type="checkbox" 
                    checked={notificationSettings.pushEnabled}
                    onChange={(e) => setNotificationSettings(prev => ({ ...prev, pushEnabled: e.target.checked }))}
                    className="rounded border-border text-primary focus:ring-primary h-4.5 w-4.5"
                  />
                  <div>
                    <span className="block text-sm font-bold text-foreground">Push Alerts Notifications Channel</span>
                    <span className="text-muted-foreground font-normal">Dispatches mobile/browser alerts on calendar schedules and events.</span>
                  </div>
                </label>
              </div>
              <FormInput 
                label="Overdue Due Invoices Reminder Lead Days"
                type="number"
                value={notificationSettings.reminderDays}
                onChange={(e) => setNotificationSettings(prev => ({ ...prev, reminderDays: Number(e.target.value) }))}
                required
              />
              <Button type="submit" disabled={loading} className="w-full">{loading ? 'Saving Preferences...' : 'Save Preferences'}</Button>
            </form>
          </SimpleCard>
        </div>
      )}

      {/* 9. Backup & Restore */}
      {activeTab === 'backup' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex justify-between items-center select-none">
            <h2 className="text-base font-bold text-foreground">System Database Backup logs</h2>
            <Button size="sm" onClick={handleTriggerBackup} className="flex items-center gap-1.5"><Database className="h-4 w-4" /> Run Manual Backup</Button>
          </div>
          <ReusableTable 
            columns={[
              { header: 'ZIP File Name Archive', accessor: 'fileName' },
              { header: 'Archive Size', accessor: (row) => `${row.size} KB` },
              { header: 'Backup Status', accessor: (row) => <StatusChip status={row.status} /> },
              { header: 'Timestamp', accessor: (row) => new Date(row.date).toLocaleString() },
              { header: 'Restore Database', accessor: (row) => (
                <Button size="sm" variant="outline" onClick={() => handleRestoreBackup(row.fileName)} className="flex items-center gap-1.5"><RotateCcw className="h-3.5 w-3.5" /> Restore</Button>
              )}
            ]}
            data={Array.isArray(backupHistory) ? backupHistory : []}
          />
        </div>
      )}

      {/* 10. Security Policies */}
      {activeTab === 'security' && (
        <div className="space-y-6 animate-fadeIn max-w-lg select-none">
          <SimpleCard title="Lockout & Password security configuration Policies">
            <form onSubmit={handleUpdateSecurityPolicy} className="space-y-4">
              <FormInput 
                label="Maximum login failed Attempts before locking"
                type="number"
                value={securityPolicy.maxLoginAttempts}
                onChange={(e) => setSecurityPolicy(prev => ({ ...prev, maxLoginAttempts: Number(e.target.value) }))}
                required
              />
              <FormInput 
                label="Account locking Duration policy (Minutes)"
                type="number"
                value={securityPolicy.accountLockDuration}
                onChange={(e) => setSecurityPolicy(prev => ({ ...prev, accountLockDuration: Number(e.target.value) }))}
                required
              />
              <FormInput 
                label="Session idle Timeout policy (Minutes)"
                type="number"
                value={securityPolicy.sessionTimeout}
                onChange={(e) => setSecurityPolicy(prev => ({ ...prev, sessionTimeout: Number(e.target.value) }))}
                required
              />
              <Button type="submit" disabled={loading} className="w-full">{loading ? 'Saving Policies...' : 'Save lock policies'}</Button>
            </form>
          </SimpleCard>
        </div>
      )}

      {/* ─── MODAL DIALOGS / POPUPS ───────────────────────────────────────────── */}

      {/* Create User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn select-none">
          <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-base font-bold text-foreground mb-4">Create User Account Directory</h3>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <FormInput 
                label="Full Name" 
                placeholder="e.g. John Doe"
                value={userForm.name} 
                onChange={(e) => setUserForm(prev => ({ ...prev, name: e.target.value }))}
                required
              />
              <FormInput 
                label="Email Address" 
                type="email"
                placeholder="e.g. john.doe@school.com"
                value={userForm.email} 
                onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <FormInput 
                  label="Username" 
                  placeholder="e.g. johndoe"
                  value={userForm.username} 
                  onChange={(e) => setUserForm(prev => ({ ...prev, username: e.target.value }))}
                />
                <FormInput 
                  label="Mobile Number" 
                  placeholder="e.g. 9876543210"
                  value={userForm.mobile} 
                  onChange={(e) => setUserForm(prev => ({ ...prev, mobile: e.target.value }))}
                />
              </div>
              <FormSelect 
                label="Select Role Profile"
                value={userForm.role}
                onChange={(e) => setUserForm(prev => ({ ...prev, role: e.target.value }))}
                options={[
                  { value: 'super_admin', label: 'Super Admin' },
                  { value: 'school_admin', label: 'School Admin' },
                  { value: 'teacher', label: 'Teacher' },
                  { value: 'parent', label: 'Parent' }
                ]}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormSelect 
                  label="Department"
                  value={userForm.department}
                  onChange={(e) => setUserForm(prev => ({ ...prev, department: e.target.value }))}
                  options={departments.map(d => ({ value: d.name, label: d.name }))}
                />
                <FormSelect 
                  label="Designation"
                  value={userForm.designation}
                  onChange={(e) => setUserForm(prev => ({ ...prev, designation: e.target.value }))}
                  options={designations.map(d => ({ value: d.name, label: d.name }))}
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <Button type="button" variant="outline" onClick={() => setShowUserModal(false)}>Cancel</Button>
                <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Account'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Custom Role Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn select-none">
          <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-base font-bold text-foreground mb-4">Add Custom User Role</h3>
            <form onSubmit={handleCreateRole} className="space-y-4">
              <FormInput 
                label="Role key Name" 
                placeholder="e.g. Principal Assistant"
                value={roleForm.name} 
                onChange={(e) => setRoleForm(prev => ({ ...prev, name: e.target.value }))}
                required
              />
              <FormInput 
                label="Role Description" 
                placeholder="e.g. Handles administrative school routines..."
                value={roleForm.description} 
                onChange={(e) => setRoleForm(prev => ({ ...prev, description: e.target.value }))}
              />
              <div className="flex gap-2 justify-end pt-2">
                <Button type="button" variant="outline" onClick={() => setShowRoleModal(false)}>Cancel</Button>
                <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Add Custom Role'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Department Modal */}
      {showDeptModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn select-none">
          <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-base font-bold text-foreground mb-4">Add Department</h3>
            <form onSubmit={handleCreateDept} className="space-y-4">
              <FormInput 
                label="Department Name" 
                placeholder="e.g. Human Resources"
                value={deptForm.name} 
                onChange={(e) => setDeptForm(prev => ({ ...prev, name: e.target.value }))}
                required
              />
              <FormInput 
                label="Department Code ID" 
                placeholder="e.g. DEPT-HR"
                value={deptForm.code} 
                onChange={(e) => setDeptForm(prev => ({ ...prev, code: e.target.value }))}
                required
              />
              <FormInput 
                label="Description" 
                placeholder="e.g. Handles faculty salaries and profiles..."
                value={deptForm.description} 
                onChange={(e) => setDeptForm(prev => ({ ...prev, description: e.target.value }))}
              />
              <div className="flex gap-2 justify-end pt-2">
                <Button type="button" variant="outline" onClick={() => setShowDeptModal(false)}>Cancel</Button>
                <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Department'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Designation Modal */}
      {showDesigModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn select-none">
          <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-base font-bold text-foreground mb-4">Add Employee Designation</h3>
            <form onSubmit={handleCreateDesig} className="space-y-4">
              <FormInput 
                label="Designation Title" 
                placeholder="e.g. Senior Faculty Clerk"
                value={desigForm.name} 
                onChange={(e) => setDesigForm(prev => ({ ...prev, name: e.target.value }))}
                required
              />
              <FormInput 
                label="Description Details" 
                placeholder="e.g. Administers student profile details..."
                value={desigForm.description} 
                onChange={(e) => setDesigForm(prev => ({ ...prev, description: e.target.value }))}
              />
              <div className="flex gap-2 justify-end pt-2">
                <Button type="button" variant="outline" onClick={() => setShowDesigModal(false)}>Cancel</Button>
                <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Designation'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </PageContainer>
  )
}
