import React, { useState, useEffect } from 'react'
import axiosClient from '@/config/axiosClient'
import { 
  PageHeader, 
  PageContainer, 
  SimpleCard, 
  StatCard, 
  Button, 
  ReusableTable, 
  FormInput, 
  FormSelect, 
  FormTextarea,
  SuccessDialog,
  StatusChip,
  Badge
} from '@/components/shared'
import { 
  Bus, 
  User, 
  MapPin, 
  Calendar, 
  Plus, 
  Settings, 
  DollarSign, 
  Gauge, 
  Wrench, 
  Check, 
  X,
  FileText
} from 'lucide-react'

export default function Transport() {
  const [activeTab, setActiveTab] = useState('dashboard')
  
  // Data Lists
  const [stats, setStats] = useState({ totalVehicles: 0, activeVehicles: 0, totalDrivers: 0, assignedStudents: 0, todayTrips: 0, fuelCost: 0, maintenanceAlerts: [] })
  const [vehicles, setVehicles] = useState([])
  const [drivers, setDrivers] = useState([])
  const [routes, setRoutes] = useState([])
  const [stops, setStops] = useState([])
  const [allocations, setAllocations] = useState([])
  const [fuelLogs, setFuelLogs] = useState([])
  const [maintenances, setMaintenances] = useState([])
  const [fees, setFees] = useState([])
  const [students, setStudents] = useState([])

  // UI States
  const [loading, setLoading] = useState(false)
  const [successOpen, setSuccessOpen] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Creation Forms States
  const [vehicleForm, setVehicleForm] = useState({ vehicleNo: '', registrationNo: '', type: 'bus', capacity: '', manufacturer: '', model: '', insuranceNo: '', insuranceExpiry: '', rcDetails: '', status: 'active' })
  const [driverForm, setDriverForm] = useState({ name: '', licenseNo: '', licenseExpiry: '', phone: '', address: '', emergencyContact: '', assignedVehicle: '', status: 'active' })
  const [routeForm, setRouteForm] = useState({ routeName: '', routeCode: '', distance: '', estimatedTime: '', assignedVehicle: '', assignedDriver: '' })
  const [stopForm, setStopForm] = useState({ routeId: '', stopName: '', pickupTime: '', dropTime: '', sequenceOrder: '' })
  const [allocForm, setAllocForm] = useState({ studentId: '', routeId: '', pickupStopId: '', dropStopId: '', academicYear: '2026-2027' })
  const [fuelForm, setFuelForm] = useState({ vehicleId: '', fuelQuantity: '', price: '', odometerReading: '', fuelStation: '' })
  const [maintForm, setMaintForm] = useState({ vehicleId: '', serviceDate: '', repairDetails: '', insuranceRenewal: false, fitnessCertificate: false, cost: '', vendor: '' })
  const [feeForm, setFeeForm] = useState({ studentId: '', monthlyFee: '', quarterlyFee: '', yearlyFee: '', dueDate: '' })

  // Fetch functions
  const fetchDashboardStats = async () => {
    try {
      const res = await axiosClient.get('/transport/dashboard-stats')
      if (res.data.success) setStats(res.data.data)
    } catch (err) { console.error(err) }
  }

  const fetchVehicles = async () => {
    try {
      const res = await axiosClient.get('/transport/vehicles')
      if (res.data.success) setVehicles(res.data.data)
    } catch (err) { console.error(err) }
  }

  const fetchDrivers = async () => {
    try {
      const res = await axiosClient.get('/transport/drivers')
      if (res.data.success) setDrivers(res.data.data)
    } catch (err) { console.error(err) }
  }

  const fetchRoutes = async () => {
    try {
      const res = await axiosClient.get('/transport/routes')
      if (res.data.success) setRoutes(res.data.data)
    } catch (err) { console.error(err) }
  }

  const fetchStops = async () => {
    try {
      const res = await axiosClient.get('/transport/stops')
      if (res.data.success) setStops(res.data.data)
    } catch (err) { console.error(err) }
  }

  const fetchAllocations = async () => {
    try {
      const res = await axiosClient.get('/transport/allocations')
      if (res.data.success) setAllocations(res.data.data)
    } catch (err) { console.error(err) }
  }

  const fetchFuelLogs = async () => {
    try {
      const res = await axiosClient.get('/transport/fuel-logs')
      if (res.data.success) setFuelLogs(res.data.data)
    } catch (err) { console.error(err) }
  }

  const fetchMaintenances = async () => {
    try {
      const res = await axiosClient.get('/transport/maintenances')
      if (res.data.success) setMaintenances(res.data.data)
    } catch (err) { console.error(err) }
  }

  const fetchFees = async () => {
    try {
      const res = await axiosClient.get('/transport/fees')
      if (res.data.success) setFees(res.data.data)
    } catch (err) { console.error(err) }
  }

  const fetchStudents = async () => {
    try {
      const res = await axiosClient.get('/students')
      if (res.data.success) setStudents(res.data.data.students || res.data.data)
    } catch (err) { console.error(err) }
  }

  useEffect(() => {
    if (activeTab === 'dashboard') fetchDashboardStats()
    if (activeTab === 'vehicles') fetchVehicles()
    if (activeTab === 'drivers') { fetchVehicles(); fetchDrivers(); }
    if (activeTab === 'routes') { fetchVehicles(); fetchDrivers(); fetchRoutes(); }
    if (activeTab === 'stops') { fetchRoutes(); fetchStops(); }
    if (activeTab === 'allocations') { fetchStudents(); fetchRoutes(); fetchStops(); fetchAllocations(); }
    if (activeTab === 'fuel') { fetchVehicles(); fetchFuelLogs(); }
    if (activeTab === 'maintenance') { fetchVehicles(); fetchMaintenances(); }
    if (activeTab === 'fees') { fetchStudents(); fetchFees(); }
  }, [activeTab])

  // Submissions
  const handleCreateVehicle = async (e) => {
    e.preventDefault()
    try {
      const res = await axiosClient.post('/transport/vehicles', vehicleForm)
      if (res.data.success) {
        setSuccessMsg('Vehicle registered successfully.')
        setSuccessOpen(true)
        setVehicleForm({ vehicleNo: '', registrationNo: '', type: 'bus', capacity: '', manufacturer: '', model: '', insuranceNo: '', insuranceExpiry: '', rcDetails: '', status: 'active' })
        fetchVehicles()
      }
    } catch (err) { console.error(err) }
  }

  const handleCreateDriver = async (e) => {
    e.preventDefault()
    try {
      const res = await axiosClient.post('/transport/drivers', driverForm)
      if (res.data.success) {
        setSuccessMsg('Driver profile created successfully.')
        setSuccessOpen(true)
        setDriverForm({ name: '', licenseNo: '', licenseExpiry: '', phone: '', address: '', emergencyContact: '', assignedVehicle: '', status: 'active' })
        fetchDrivers()
      }
    } catch (err) { console.error(err) }
  }

  const handleCreateRoute = async (e) => {
    e.preventDefault()
    try {
      const res = await axiosClient.post('/transport/routes', routeForm)
      if (res.data.success) {
        setSuccessMsg('Travel Route created successfully.')
        setSuccessOpen(true)
        setRouteForm({ routeName: '', routeCode: '', distance: '', estimatedTime: '', assignedVehicle: '', assignedDriver: '' })
        fetchRoutes()
      }
    } catch (err) { console.error(err) }
  }

  const handleCreateStop = async (e) => {
    e.preventDefault()
    try {
      const res = await axiosClient.post('/transport/stops', stopForm)
      if (res.data.success) {
        setSuccessMsg('Route Stop sequence registered.')
        setSuccessOpen(true)
        setStopForm({ routeId: '', stopName: '', pickupTime: '', dropTime: '', sequenceOrder: '' })
        fetchStops()
      }
    } catch (err) { console.error(err) }
  }

  const handleCreateAllocation = async (e) => {
    e.preventDefault()
    try {
      const res = await axiosClient.post('/transport/allocations', allocForm)
      if (res.data.success) {
        setSuccessMsg('Student allocated to transport route successfully.')
        setSuccessOpen(true)
        setAllocForm({ studentId: '', routeId: '', pickupStopId: '', dropStopId: '', academicYear: '2026-2027' })
        fetchAllocations()
      }
    } catch (err) { console.error(err) }
  }

  const handleCreateFuelLog = async (e) => {
    e.preventDefault()
    try {
      const res = await axiosClient.post('/transport/fuel-logs', fuelForm)
      if (res.data.success) {
        setSuccessMsg('Fuel entry log saved successfully.')
        setSuccessOpen(true)
        setFuelForm({ vehicleId: '', fuelQuantity: '', price: '', odometerReading: '', fuelStation: '' })
        fetchFuelLogs()
      }
    } catch (err) { console.error(err) }
  }

  const handleCreateMaint = async (e) => {
    e.preventDefault()
    try {
      const res = await axiosClient.post('/transport/maintenances', maintForm)
      if (res.data.success) {
        setSuccessMsg('Vehicle maintenance service log saved.')
        setSuccessOpen(true)
        setMaintForm({ vehicleId: '', serviceDate: '', repairDetails: '', insuranceRenewal: false, fitnessCertificate: false, cost: '', vendor: '' })
        fetchMaintenances()
      }
    } catch (err) { console.error(err) }
  }

  const handleCreateFee = async (e) => {
    e.preventDefault()
    try {
      const res = await axiosClient.post('/transport/fees', feeForm)
      if (res.data.success) {
        setSuccessMsg('Transport Fee configuration saved.')
        setSuccessOpen(true)
        setFeeForm({ studentId: '', monthlyFee: '', quarterlyFee: '', yearlyFee: '', dueDate: '' })
        fetchFees()
      }
    } catch (err) { console.error(err) }
  }

  // Deletes
  const handleDeleteVehicle = async (id) => {
    if (!window.confirm('Delete vehicle?')) return
    try {
      await axiosClient.delete(`/transport/vehicles/${id}`)
      fetchVehicles()
    } catch (err) { console.error(err) }
  }

  const handleDeleteDriver = async (id) => {
    if (!window.confirm('Delete driver?')) return
    try {
      await axiosClient.delete(`/transport/drivers/${id}`)
      fetchDrivers()
    } catch (err) { console.error(err) }
  }

  const handleDeleteRoute = async (id) => {
    if (!window.confirm('Delete route?')) return
    try {
      await axiosClient.delete(`/transport/routes/${id}`)
      fetchRoutes()
    } catch (err) { console.error(err) }
  }

  const handleDeleteAllocation = async (id) => {
    if (!window.confirm('Remove allocation?')) return
    try {
      await axiosClient.delete(`/transport/allocations/${id}`)
      fetchAllocations()
    } catch (err) { console.error(err) }
  }

  // Columns mapping
  const vehicleColumns = [
    { header: 'Vehicle No', accessor: 'vehicleNo' },
    { header: 'Type', accessor: (row) => <Badge className="uppercase">{row.type}</Badge> },
    { header: 'Capacity', accessor: (row) => `${row.capacity} Seats` },
    { header: 'Model', accessor: (row) => `${row.manufacturer} ${row.model}` },
    { header: 'Insurance Expiry', accessor: (row) => new Date(row.insuranceExpiry).toLocaleDateString() },
    {
      header: 'Status',
      accessor: (row) => <StatusChip status={row.status} />
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <Button variant="destructive" size="sm" onClick={() => handleDeleteVehicle(row._id)}>Delete</Button>
      )
    }
  ]

  const driverColumns = [
    { header: 'Driver Name', accessor: 'name' },
    { header: 'License No', accessor: 'licenseNo' },
    { header: 'Phone', accessor: 'phone' },
    { header: 'Assigned Vehicle', accessor: (row) => row.assignedVehicle?.vehicleNo || 'N/A' },
    {
      header: 'Status',
      accessor: (row) => <StatusChip status={row.status} />
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <Button variant="destructive" size="sm" onClick={() => handleDeleteDriver(row._id)}>Delete</Button>
      )
    }
  ]

  const routeColumns = [
    { header: 'Route Name', accessor: 'routeName' },
    { header: 'Code', accessor: 'routeCode' },
    { header: 'Distance (KM)', accessor: (row) => `${row.distance} KM` },
    { header: 'Est. Time', accessor: 'estimatedTime' },
    { header: 'Vehicle', accessor: (row) => row.assignedVehicle?.vehicleNo || 'N/A' },
    { header: 'Driver', accessor: (row) => row.assignedDriver?.name || 'N/A' },
    {
      header: 'Actions',
      accessor: (row) => (
        <Button variant="destructive" size="sm" onClick={() => handleDeleteRoute(row._id)}>Delete</Button>
      )
    }
  ]

  const stopColumns = [
    { header: 'Route ID', accessor: (row) => row.routeId?.routeName || 'N/A' },
    { header: 'Stop Name', accessor: 'stopName' },
    { header: 'Pickup', accessor: 'pickupTime' },
    { header: 'Drop', accessor: 'dropTime' },
    { header: 'Order', accessor: 'sequenceOrder' }
  ]

  const allocColumns = [
    { header: 'Student', accessor: (row) => row.studentId ? `${row.studentId.firstName} ${row.studentId.lastName}`.trim() : 'Unknown' },
    { header: 'Class', accessor: (row) => `${row.studentId?.class || 'N/A'}-${row.studentId?.section || 'N/A'}` },
    { header: 'Route', accessor: (row) => row.routeId?.routeName || 'N/A' },
    { header: 'Pickup Stop', accessor: (row) => row.pickupStopId?.stopName || 'N/A' },
    { header: 'Drop Stop', accessor: (row) => row.dropStopId?.stopName || 'N/A' },
    {
      header: 'Actions',
      accessor: (row) => (
        <Button variant="destructive" size="sm" onClick={() => handleDeleteAllocation(row._id)}>Remove</Button>
      )
    }
  ]

  const fuelColumns = [
    { header: 'Vehicle No', accessor: (row) => row.vehicleId?.vehicleNo || 'N/A' },
    { header: 'Date', accessor: (row) => new Date(row.logDate).toLocaleDateString() },
    { header: 'Quantity (L)', accessor: (row) => `${row.fuelQuantity} L` },
    { header: 'Cost', accessor: (row) => `$${row.price * row.fuelQuantity}` },
    { header: 'Odometer', accessor: 'odometerReading' }
  ]

  const maintColumns = [
    { header: 'Vehicle No', accessor: (row) => row.vehicleId?.vehicleNo || 'N/A' },
    { header: 'Service Date', accessor: (row) => new Date(row.serviceDate).toLocaleDateString() },
    { header: 'Details', accessor: 'repairDetails' },
    { header: 'Cost', accessor: (row) => `$${row.cost}` },
    { header: 'Vendor', accessor: 'vendor' }
  ]

  const feeColumns = [
    { header: 'Student Name', accessor: (row) => row.studentId ? `${row.studentId.firstName} ${row.studentId.lastName}`.trim() : 'Unknown' },
    { header: 'Monthly Fee', accessor: (row) => `$${row.monthlyFee}` },
    { header: 'Yearly Fee', accessor: (row) => `$${row.yearlyFee}` },
    { header: 'Due Date', accessor: (row) => new Date(row.dueDate).toLocaleDateString() },
    {
      header: 'Status',
      accessor: (row) => <StatusChip status={row.status} />
    }
  ]

  return (
    <PageContainer>
      <PageHeader 
        title="Transport Fleet Dashboard"
        subtitle="Manage school buses, routing paths, stops sequence, student allocation, and fuel maintenance tracking."
      />

      {/* Navigation tabs */}
      <div className="flex border-b border-border select-none overflow-x-auto gap-1 mb-6 pb-1">
        {[
          { id: 'dashboard', label: 'Dashboard Overview', icon: Gauge },
          { id: 'vehicles', label: 'Vehicles fleet', icon: Bus },
          { id: 'drivers', label: 'Drivers directory', icon: User },
          { id: 'routes', label: 'Route management', icon: MapPin },
          { id: 'stops', label: 'Route Stops', icon: MapPin },
          { id: 'allocations', label: 'Student Allocations', icon: User },
          { id: 'fuel', label: 'Fuel Logs', icon: Settings },
          { id: 'maintenance', label: 'Maintenance Log', icon: Wrench },
          { id: 'fees', label: 'Transport Billing', icon: DollarSign }
        ].map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-md border-b-2 transition-all shrink-0 cursor-pointer ${
                activeTab === tab.id 
                  ? 'border-primary bg-primary/5 text-primary' 
                  : 'border-transparent text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Panels */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard title="Total Fleet Vehicles" value={stats.totalVehicles} icon={Bus} />
            <StatCard title="Active Drivers" value={stats.totalDrivers} icon={User} />
            <StatCard title="Allocated Students" value={stats.assignedStudents} icon={User} />
            <StatCard title="Trips Scheduled Today" value={stats.todayTrips} icon={MapPin} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <SimpleCard title="Maintenance and Insurance Alerts">
                {stats.maintenanceAlerts && stats.maintenanceAlerts.length > 0 ? (
                  <div className="overflow-x-auto rounded-md border border-border">
                    <table className="w-full text-left text-sm text-foreground">
                      <thead>
                        <tr className="border-b border-border bg-muted/40 font-semibold text-muted-foreground">
                          <th className="px-4 py-3">Vehicle No</th>
                          <th className="px-4 py-3">Alert Details</th>
                          <th className="px-4 py-3">Expiry Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.maintenanceAlerts.map((alert, idx) => (
                          <tr key={idx} className="border-b border-border">
                            <td className="px-4 py-3 font-semibold">{alert.vehicleNo}</td>
                            <td className="px-4 py-3 text-destructive font-semibold">{alert.alertType}</td>
                            <td className="px-4 py-3">{new Date(alert.expiryDate).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground text-xs font-semibold">
                    No active maintenance or insurance alerts found.
                  </div>
                )}
              </SimpleCard>
            </div>
            <div className="md:col-span-1">
              <SimpleCard title="Accumulated Fleet Costs">
                <div className="space-y-4 text-sm font-semibold select-none leading-relaxed">
                  <div className="flex justify-between border-b border-border pb-2">
                    <span className="text-muted-foreground">Fuel Cost (This Month)</span>
                    <span className="text-destructive">${stats.fuelCost}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estimated Service Cost</span>
                    <span>{stats?.estimatedServiceCost ? '$' + stats.estimatedServiceCost : 'N/A'}</span>
                  </div>
                </div>
              </SimpleCard>
            </div>
          </div>
        </div>
      )}

      {/* Vehicles Tab */}
      {activeTab === 'vehicles' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
          <div className="md:col-span-1">
            <SimpleCard title="Add Fleet Vehicle">
              <form onSubmit={handleCreateVehicle} className="space-y-4">
                <FormInput 
                  label="Vehicle Plate Number" 
                  placeholder="e.g. MH-12-AB-1234"
                  value={vehicleForm.vehicleNo}
                  onChange={(e) => setVehicleForm(prev => ({ ...prev, vehicleNo: e.target.value }))}
                  required
                />
                <FormInput 
                  label="Registration Number" 
                  placeholder="e.g. REG-776655"
                  value={vehicleForm.registrationNo}
                  onChange={(e) => setVehicleForm(prev => ({ ...prev, registrationNo: e.target.value }))}
                  required
                />
                <FormSelect 
                  label="Vehicle Type" 
                  value={vehicleForm.type}
                  onChange={(e) => setVehicleForm(prev => ({ ...prev, type: e.target.value }))}
                  options={[
                    { value: 'bus', label: 'School Bus' },
                    { value: 'mini_bus', label: 'Mini Bus' },
                    { value: 'van', label: 'Transit Van' },
                    { value: 'other', label: 'Other Type' }
                  ]}
                  required
                />
                <FormInput 
                  label="Seat Capacity" 
                  type="number"
                  value={vehicleForm.capacity}
                  onChange={(e) => setVehicleForm(prev => ({ ...prev, capacity: e.target.value }))}
                  required
                />
                <FormInput 
                  label="Manufacturer" 
                  placeholder="e.g. Tata, Mahindra"
                  value={vehicleForm.manufacturer}
                  onChange={(e) => setVehicleForm(prev => ({ ...prev, manufacturer: e.target.value }))}
                  required
                />
                <FormInput 
                  label="Vehicle Model" 
                  placeholder="e.g. Starbus 2026"
                  value={vehicleForm.model}
                  onChange={(e) => setVehicleForm(prev => ({ ...prev, model: e.target.value }))}
                  required
                />
                <FormInput 
                  label="Insurance policy number" 
                  value={vehicleForm.insuranceNo}
                  onChange={(e) => setVehicleForm(prev => ({ ...prev, insuranceNo: e.target.value }))}
                  required
                />
                <FormInput 
                  label="Insurance Expiry Date" 
                  type="date"
                  value={vehicleForm.insuranceExpiry}
                  onChange={(e) => setVehicleForm(prev => ({ ...prev, insuranceExpiry: e.target.value }))}
                  required
                />
                <Button type="submit" className="w-full flex items-center justify-center gap-1"><Plus className="h-4 w-4" /> Save Vehicle</Button>
              </form>
            </SimpleCard>
          </div>
          <div className="md:col-span-2">
            <SimpleCard title="Registered Fleet Vehicles">
              <ReusableTable columns={vehicleColumns} data={vehicles} />
            </SimpleCard>
          </div>
        </div>
      )}

      {/* Drivers Tab */}
      {activeTab === 'drivers' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
          <div className="md:col-span-1">
            <SimpleCard title="Add Fleet Driver">
              <form onSubmit={handleCreateDriver} className="space-y-4">
                <FormInput 
                  label="Driver Full Name" 
                  value={driverForm.name}
                  onChange={(e) => setDriverForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
                <FormInput 
                  label="License Number" 
                  value={driverForm.licenseNo}
                  onChange={(e) => setDriverForm(prev => ({ ...prev, licenseNo: e.target.value }))}
                  required
                />
                <FormInput 
                  label="License Expiry Date" 
                  type="date"
                  value={driverForm.licenseExpiry}
                  onChange={(e) => setDriverForm(prev => ({ ...prev, licenseExpiry: e.target.value }))}
                  required
                />
                <FormInput 
                  label="Phone Number" 
                  value={driverForm.phone}
                  onChange={(e) => setDriverForm(prev => ({ ...prev, phone: e.target.value }))}
                  required
                />
                <FormSelect 
                  label="Assign Fleet Vehicle" 
                  value={driverForm.assignedVehicle}
                  onChange={(e) => setDriverForm(prev => ({ ...prev, assignedVehicle: e.target.value }))}
                  options={vehicles.map(v => ({ value: v._id, label: `${v.vehicleNo} - ${v.manufacturer}` }))}
                />
                <Button type="submit" className="w-full flex items-center justify-center gap-1"><Plus className="h-4 w-4" /> Save Driver</Button>
              </form>
            </SimpleCard>
          </div>
          <div className="md:col-span-2">
            <SimpleCard title="Drivers Directory">
              <ReusableTable columns={driverColumns} data={drivers} />
            </SimpleCard>
          </div>
        </div>
      )}

      {/* Routes Tab */}
      {activeTab === 'routes' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
          <div className="md:col-span-1">
            <SimpleCard title="Create Route Path">
              <form onSubmit={handleCreateRoute} className="space-y-4">
                <FormInput 
                  label="Route Name" 
                  placeholder="e.g. Sector 5 Express"
                  value={routeForm.routeName}
                  onChange={(e) => setRouteForm(prev => ({ ...prev, routeName: e.target.value }))}
                  required
                />
                <FormInput 
                  label="Route Code" 
                  placeholder="e.g. R-101"
                  value={routeForm.routeCode}
                  onChange={(e) => setRouteForm(prev => ({ ...prev, routeCode: e.target.value }))}
                  required
                />
                <FormInput 
                  label="Distance (KM)" 
                  type="number"
                  value={routeForm.distance}
                  onChange={(e) => setRouteForm(prev => ({ ...prev, distance: e.target.value }))}
                  required
                />
                <FormInput 
                  label="Estimated Time" 
                  placeholder="e.g. 45 mins"
                  value={routeForm.estimatedTime}
                  onChange={(e) => setRouteForm(prev => ({ ...prev, estimatedTime: e.target.value }))}
                  required
                />
                <FormSelect 
                  label="Assigned Vehicle" 
                  value={routeForm.assignedVehicle}
                  onChange={(e) => setRouteForm(prev => ({ ...prev, assignedVehicle: e.target.value }))}
                  options={vehicles.map(v => ({ value: v._id, label: v.vehicleNo }))}
                />
                <FormSelect 
                  label="Assigned Driver" 
                  value={routeForm.assignedDriver}
                  onChange={(e) => setRouteForm(prev => ({ ...prev, assignedDriver: e.target.value }))}
                  options={drivers.map(d => ({ value: d._id, label: d.name }))}
                />
                <Button type="submit" className="w-full flex items-center justify-center gap-1"><Plus className="h-4 w-4" /> Save Route</Button>
              </form>
            </SimpleCard>
          </div>
          <div className="md:col-span-2">
            <SimpleCard title="Routes Directory">
              <ReusableTable columns={routeColumns} data={routes} />
            </SimpleCard>
          </div>
        </div>
      )}

      {/* Stops Tab */}
      {activeTab === 'stops' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
          <div className="md:col-span-1">
            <SimpleCard title="Add Stop Point">
              <form onSubmit={handleCreateStop} className="space-y-4">
                <FormSelect 
                  label="Travel Route" 
                  value={stopForm.routeId}
                  onChange={(e) => setStopForm(prev => ({ ...prev, routeId: e.target.value }))}
                  options={routes.map(r => ({ value: r._id, label: r.routeName }))}
                  required
                />
                <FormInput 
                  label="Stop Name" 
                  value={stopForm.stopName}
                  onChange={(e) => setStopForm(prev => ({ ...prev, stopName: e.target.value }))}
                  required
                />
                <FormInput 
                  label="Pickup Time" 
                  placeholder="e.g. 07:30 AM"
                  value={stopForm.pickupTime}
                  onChange={(e) => setStopForm(prev => ({ ...prev, pickupTime: e.target.value }))}
                  required
                />
                <FormInput 
                  label="Drop Time" 
                  placeholder="e.g. 02:30 PM"
                  value={stopForm.dropTime}
                  onChange={(e) => setStopForm(prev => ({ ...prev, dropTime: e.target.value }))}
                  required
                />
                <FormInput 
                  label="Sequence Order" 
                  type="number"
                  placeholder="e.g. 1"
                  value={stopForm.sequenceOrder}
                  onChange={(e) => setStopForm(prev => ({ ...prev, sequenceOrder: e.target.value }))}
                  required
                />
                <Button type="submit" className="w-full flex items-center justify-center gap-1"><Plus className="h-4 w-4" /> Save Stop</Button>
              </form>
            </SimpleCard>
          </div>
          <div className="md:col-span-2">
            <SimpleCard title="Route Stops Sequences">
              <ReusableTable columns={stopColumns} data={stops} />
            </SimpleCard>
          </div>
        </div>
      )}

      {/* Student Allocation Tab */}
      {activeTab === 'allocations' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
          <div className="md:col-span-1">
            <SimpleCard title="Allocate Transport">
              <form onSubmit={handleCreateAllocation} className="space-y-4">
                <FormSelect 
                  label="Student" 
                  value={allocForm.studentId}
                  onChange={(e) => setAllocForm(prev => ({ ...prev, studentId: e.target.value }))}
                  options={students.map(s => ({ value: s.id || s._id, label: s.name }))}
                  required
                />
                <FormSelect 
                  label="Travel Route" 
                  value={allocForm.routeId}
                  onChange={(e) => setAllocForm(prev => ({ ...prev, routeId: e.target.value }))}
                  options={routes.map(r => ({ value: r._id, label: r.routeName }))}
                  required
                />
                <FormSelect 
                  label="Pickup Stop" 
                  value={allocForm.pickupStopId}
                  onChange={(e) => setAllocForm(prev => ({ ...prev, pickupStopId: e.target.value }))}
                  options={stops.filter(s => s.routeId?._id === allocForm.routeId || s.routeId === allocForm.routeId).map(s => ({ value: s._id, label: s.stopName }))}
                  required
                />
                <FormSelect 
                  label="Drop Stop" 
                  value={allocForm.dropStopId}
                  onChange={(e) => setAllocForm(prev => ({ ...prev, dropStopId: e.target.value }))}
                  options={stops.filter(s => s.routeId?._id === allocForm.routeId || s.routeId === allocForm.routeId).map(s => ({ value: s._id, label: s.stopName }))}
                  required
                />
                <Button type="submit" className="w-full flex items-center justify-center gap-1"><Plus className="h-4 w-4" /> Save Allocation</Button>
              </form>
            </SimpleCard>
          </div>
          <div className="md:col-span-2">
            <SimpleCard title="Transport Student Allocations">
              <ReusableTable columns={allocColumns} data={allocations} />
            </SimpleCard>
          </div>
        </div>
      )}

      {/* Fuel Logs Tab */}
      {activeTab === 'fuel' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
          <div className="md:col-span-1">
            <SimpleCard title="Log Fuel Purchase">
              <form onSubmit={handleCreateFuelLog} className="space-y-4">
                <FormSelect 
                  label="Vehicle" 
                  value={fuelForm.vehicleId}
                  onChange={(e) => setFuelForm(prev => ({ ...prev, vehicleId: e.target.value }))}
                  options={vehicles.map(v => ({ value: v._id, label: v.vehicleNo }))}
                  required
                />
                <FormInput 
                  label="Fuel Quantity (Liters)" 
                  type="number"
                  value={fuelForm.fuelQuantity}
                  onChange={(e) => setFuelForm(prev => ({ ...prev, fuelQuantity: e.target.value }))}
                  required
                />
                <FormInput 
                  label="Price (Per Liter)" 
                  type="number"
                  value={fuelForm.price}
                  onChange={(e) => setFuelForm(prev => ({ ...prev, price: e.target.value }))}
                  required
                />
                <FormInput 
                  label="Current Odometer Reading" 
                  type="number"
                  value={fuelForm.odometerReading}
                  onChange={(e) => setFuelForm(prev => ({ ...prev, odometerReading: e.target.value }))}
                  required
                />
                <FormInput 
                  label="Fuel Station Name" 
                  value={fuelForm.fuelStation}
                  onChange={(e) => setFuelForm(prev => ({ ...prev, fuelStation: e.target.value }))}
                />
                <Button type="submit" className="w-full flex items-center justify-center gap-1"><Plus className="h-4 w-4" /> Log Fuel</Button>
              </form>
            </SimpleCard>
          </div>
          <div className="md:col-span-2">
            <SimpleCard title="Fuel Logs Directory">
              <ReusableTable columns={fuelColumns} data={fuelLogs} />
            </SimpleCard>
          </div>
        </div>
      )}

      {/* Vehicle Maintenance Tab */}
      {activeTab === 'maintenance' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
          <div className="md:col-span-1">
            <SimpleCard title="Record Service Log">
              <form onSubmit={handleCreateMaint} className="space-y-4">
                <FormSelect 
                  label="Vehicle" 
                  value={maintForm.vehicleId}
                  onChange={(e) => setMaintForm(prev => ({ ...prev, vehicleId: e.target.value }))}
                  options={vehicles.map(v => ({ value: v._id, label: v.vehicleNo }))}
                  required
                />
                <FormInput 
                  label="Service Date" 
                  type="date"
                  value={maintForm.serviceDate}
                  onChange={(e) => setMaintForm(prev => ({ ...prev, serviceDate: e.target.value }))}
                  required
                />
                <FormTextarea 
                  label="Repair Details" 
                  value={maintForm.repairDetails}
                  onChange={(e) => setMaintForm(prev => ({ ...prev, repairDetails: e.target.value }))}
                  required
                />
                <FormInput 
                  label="Cost ($)" 
                  type="number"
                  value={maintForm.cost}
                  onChange={(e) => setMaintForm(prev => ({ ...prev, cost: e.target.value }))}
                  required
                />
                <FormInput 
                  label="Vendor / Garage" 
                  value={maintForm.vendor}
                  onChange={(e) => setMaintForm(prev => ({ ...prev, vendor: e.target.value }))}
                />
                <Button type="submit" className="w-full flex items-center justify-center gap-1"><Plus className="h-4 w-4" /> Save Maintenance</Button>
              </form>
            </SimpleCard>
          </div>
          <div className="md:col-span-2">
            <SimpleCard title="Vehicles Maintenance History">
              <ReusableTable columns={maintColumns} data={maintenances} />
            </SimpleCard>
          </div>
        </div>
      )}

      {/* Transport Fees Tab */}
      {activeTab === 'fees' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
          <div className="md:col-span-1">
            <SimpleCard title="Configure Pricing rule">
              <form onSubmit={handleCreateFee} className="space-y-4">
                <FormSelect 
                  label="Student" 
                  value={feeForm.studentId}
                  onChange={(e) => setFeeForm(prev => ({ ...prev, studentId: e.target.value }))}
                  options={students.map(s => ({ value: s.id || s._id, label: s.name }))}
                  required
                />
                <FormInput 
                  label="Monthly Fee ($)" 
                  type="number"
                  value={feeForm.monthlyFee}
                  onChange={(e) => setFeeForm(prev => ({ ...prev, monthlyFee: e.target.value }))}
                />
                <FormInput 
                  label="Yearly Fee ($)" 
                  type="number"
                  value={feeForm.yearlyFee}
                  onChange={(e) => setFeeForm(prev => ({ ...prev, yearlyFee: e.target.value }))}
                />
                <FormInput 
                  label="Payment Due Date" 
                  type="date"
                  value={feeForm.dueDate}
                  onChange={(e) => setFeeForm(prev => ({ ...prev, dueDate: e.target.value }))}
                  required
                />
                <Button type="submit" className="w-full flex items-center justify-center gap-1"><Plus className="h-4 w-4" /> Save Pricing</Button>
              </form>
            </SimpleCard>
          </div>
          <div className="md:col-span-2">
            <SimpleCard title="Transport Fees pricing ledger">
              <ReusableTable columns={feeColumns} data={fees} />
            </SimpleCard>
          </div>
        </div>
      )}

      <SuccessDialog open={successOpen} onClose={() => setSuccessOpen(false)} message={successMsg} />
    </PageContainer>
  )
}
