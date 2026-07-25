import React, { useState, useEffect, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { 
  Package, 
  Layers, 
  Box, 
  Warehouse, 
  Truck, 
  ShoppingBag, 
  UserCheck, 
  Wrench, 
  History, 
  PieChart, 
  BarChart3, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Printer, 
  Check, 
  AlertTriangle, 
  Clock, 
  RotateCcw,
  DollarSign,
  Building2,
  FileText
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { 
  Button, 
  LoadingButton,
  FormLayout as AppForm, 
  FormInput as AppInput, 
  FormSelect, 
  FormTextarea,
  ReusableTable as AppTable, 
  TablePagination as Pagination,
  FormDialog as AppDialog, 
  DeleteDialog,
  StatusChip as StatusBadge,
  Alert,
  SuccessDialog
} from '@/components/shared'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'

// --- INITIAL FORM STATES ---

const initialCategoryForm = { categoryName: '', description: '', status: 'active' }
const initialAssetForm = { assetName: '', assetCode: '', category: 'Electronics', serialNumber: '', purchaseDate: new Date().toISOString().split('T')[0], purchaseCost: 0, vendor: '', location: 'Main Store', status: 'available' }
const initialVendorForm = { vendorName: '', contactPerson: '', phone: '', email: '', address: '', taxId: '' }
const initialPOForm = { poNumber: '', vendor: '', orderDate: new Date().toISOString().split('T')[0], deliveryDate: '', itemName: '', quantity: 1, unitCost: 0, status: 'pending' }
const initialStockForm = { itemName: '', category: 'General Supplies', quantity: 10, minimumStock: 5, unit: 'pcs' }
const initialAllocationForm = { assetCode: '', assetName: '', allocatedTo: '', allocatedType: 'Staff', allocationDate: new Date().toISOString().split('T')[0], expectedReturnDate: '', remarks: '' }
const initialMaintenanceForm = { assetCode: '', assetName: '', maintenanceType: 'Routine Servicing', scheduledDate: new Date().toISOString().split('T')[0], vendor: '', cost: 0, notes: '' }

export default function Inventory() {
  const location = useLocation()
  const navigate = useNavigate()

  // Extract active sub-tab from URL pathname
  const activeTab = useMemo(() => {
    const path = location.pathname
    if (path.includes('/dashboard')) return 'dashboard'
    if (path.includes('/categories')) return 'categories'
    if (path.includes('/assets')) return 'assets'
    if (path.includes('/stock')) return 'stock'
    if (path.includes('/vendors')) return 'vendors'
    if (path.includes('/purchase-orders')) return 'purchase-orders'
    if (path.includes('/allocations')) return 'allocations'
    if (path.includes('/maintenance')) return 'maintenance'
    if (path.includes('/history')) return 'history'
    if (path.includes('/reports')) return 'reports'
    return 'assets'
  }, [location.pathname])

  // --- REAL DATA STATES (NO MOCK DATA) ---
  const [categories, setCategories] = useState([])
  const [assets, setAssets] = useState([])
  const [stockItems, setStockItems] = useState([])
  const [vendors, setVendors] = useState([])
  const [purchaseOrders, setPurchaseOrders] = useState([])
  const [allocations, setAllocations] = useState([])
  const [maintenanceLogs, setMaintenanceLogs] = useState([])
  const [dashboardMetrics, setDashboardMetrics] = useState({ totalAssets: 0, availableAssets: 0, allocatedAssets: 0, lowStockItems: 0, pendingMaintenance: 0 })

  // FETCH LIVE DATA FROM BACKEND API
  useEffect(() => {
    const fetchInventoryData = async () => {
      try {
        const [resDash, resCat, resAss, resStk, resVen, resPO, resAlc, resMnt] = await Promise.all([
          fetch(`${API_BASE}/inventory/dashboard`),
          fetch(`${API_BASE}/asset-categories`),
          fetch(`${API_BASE}/assets`),
          fetch(`${API_BASE}/stock`),
          fetch(`${API_BASE}/vendors`),
          fetch(`${API_BASE}/purchase-orders`),
          fetch(`${API_BASE}/asset-allocation`),
          fetch(`${API_BASE}/maintenance`)
        ])

        const [jDash, jCat, jAss, jStk, jVen, jPO, jAlc, jMnt] = await Promise.all([
          resDash.json(), resCat.json(), resAss.json(), resStk.json(), resVen.json(),
          resPO.json(), resAlc.json(), resMnt.json()
        ])

        if (jDash.success && jDash.data?.summary) setDashboardMetrics(jDash.data.summary)
        if (jCat.success && Array.isArray(jCat.data)) setCategories(jCat.data)
        if (jAss.success && Array.isArray(jAss.data)) setAssets(jAss.data)
        if (jStk.success && Array.isArray(jStk.data)) setStockItems(jStk.data)
        if (jVen.success && Array.isArray(jVen.data)) setVendors(jVen.data)
        if (jPO.success && Array.isArray(jPO.data)) setPurchaseOrders(jPO.data)
        if (jAlc.success && Array.isArray(jAlc.data)) setAllocations(jAlc.data)
        if (jMnt.success && Array.isArray(jMnt.data)) setMaintenanceLogs(jMnt.data)
      } catch (_err) {
        // Quiet network handle
      }
    }
    fetchInventoryData()
  }, [])

  // UI COMMON STATES
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogType, setDialogType] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [activeItem, setActiveItem] = useState(null)

  const [categoryForm, setCategoryForm] = useState(initialCategoryForm)
  const [assetForm, setAssetForm] = useState(initialAssetForm)
  const [vendorForm, setVendorForm] = useState(initialVendorForm)
  const [poForm, setPoForm] = useState(initialPOForm)
  const [stockForm, setStockForm] = useState(initialStockForm)
  const [allocationForm, setAllocationForm] = useState(initialAllocationForm)
  const [maintenanceForm, setMaintenanceForm] = useState(initialMaintenanceForm)

  const [formError, setFormError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)

  const [showSuccess, setShowSuccess] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  const handlePrint = () => {
    window.print()
  }

  // --- SUBMIT HANDLERS WITH BACKEND CONNECTIVITY ---

  const handleSaveCategory = async (e) => {
    e.preventDefault()
    if (!categoryForm.categoryName) {
      setFormError('Category Name is required.')
      return
    }
    setFormError('')
    setIsSaving(true)

    try {
      if (isEditing && activeItem?._id) {
        const res = await fetch(`${API_BASE}/asset-categories/${activeItem._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(categoryForm)
        })
        const json = await res.json()
        if (json.success) setCategories(categories.map(c => c._id === activeItem._id ? json.data : c))
      } else {
        const res = await fetch(`${API_BASE}/asset-categories`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(categoryForm)
        })
        const json = await res.json()
        if (json.success) setCategories([...categories, json.data])
      }
      setSuccessMsg('Asset Category saved successfully.')
      setShowSuccess(true)
      setDialogOpen(false)
    } catch (_err) {
      setFormError('Failed to save category.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveAsset = async (e) => {
    e.preventDefault()
    if (!assetForm.assetName || !assetForm.assetCode || !assetForm.category || !assetForm.purchaseDate) {
      setFormError('Asset Name, Asset Code, Category, and Purchase Date are required.')
      return
    }
    setFormError('')
    setIsSaving(true)

    try {
      if (isEditing && activeItem?._id) {
        const res = await fetch(`${API_BASE}/assets/${activeItem._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(assetForm)
        })
        const json = await res.json()
        if (json.success) setAssets(assets.map(a => a._id === activeItem._id ? json.data : a))
        else setFormError(json.message || 'Error updating asset.')
      } else {
        const res = await fetch(`${API_BASE}/assets`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(assetForm)
        })
        const json = await res.json()
        if (json.success) setAssets([...assets, json.data])
        else setFormError(json.message || 'Error adding asset.')
      }
      if (!formError) {
        setSuccessMsg('Asset record updated in inventory.')
        setShowSuccess(true)
        setDialogOpen(false)
      }
    } catch (_err) {
      setFormError('Failed to save asset record.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveVendor = async (e) => {
    e.preventDefault()
    if (!vendorForm.vendorName) {
      setFormError('Vendor Name is required.')
      return
    }
    setFormError('')
    setIsSaving(true)

    try {
      const res = await fetch(`${API_BASE}/vendors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vendorForm)
      })
      const json = await res.json()
      if (json.success) setVendors([...vendors, json.data])

      setSuccessMsg('Vendor saved successfully.')
      setShowSuccess(true)
      setDialogOpen(false)
    } catch (_err) {
      setFormError('Error saving vendor.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSavePO = async (e) => {
    e.preventDefault()
    if (!poForm.poNumber || !poForm.vendor || !poForm.orderDate) {
      setFormError('PO Number, Vendor Name, and Order Date are required.')
      return
    }
    setFormError('')
    setIsSaving(true)

    try {
      const items = [{ itemName: poForm.itemName || 'Supplies', quantity: poForm.quantity || 1, unitCost: poForm.unitCost || 0 }]
      const totalAmount = (poForm.quantity || 1) * (poForm.unitCost || 0)

      const res = await fetch(`${API_BASE}/purchase-orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...poForm, items, totalAmount })
      })
      const json = await res.json()
      if (json.success) {
        setPurchaseOrders([...purchaseOrders, json.data])
        setSuccessMsg('Purchase Order created successfully.')
        setShowSuccess(true)
        setDialogOpen(false)
      } else {
        setFormError(json.message || 'Error creating purchase order.')
      }
    } catch (_err) {
      setFormError('Failed to create purchase order.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveStock = async (e) => {
    e.preventDefault()
    if (!stockForm.itemName || !stockForm.category) {
      setFormError('Item Name and Category are required.')
      return
    }
    setFormError('')
    setIsSaving(true)

    try {
      const res = await fetch(`${API_BASE}/stock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stockForm)
      })
      const json = await res.json()
      if (json.success) setStockItems([...stockItems, json.data])

      setSuccessMsg('Stock inventory record saved.')
      setShowSuccess(true)
      setDialogOpen(false)
    } catch (_err) {
      setFormError('Error saving stock item.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveAllocation = async (e) => {
    e.preventDefault()
    if (!allocationForm.assetCode || !allocationForm.allocatedTo) {
      setFormError('Asset Code and Allocated To are required.')
      return
    }
    setFormError('')
    setIsSaving(true)

    try {
      const res = await fetch(`${API_BASE}/asset-allocation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(allocationForm)
      })
      const json = await res.json()
      if (json.success) {
        setAllocations([...allocations, json.data])
        // Refresh assets
        const aRes = await fetch(`${API_BASE}/assets`)
        const aJson = await aRes.json()
        if (aJson.success) setAssets(aJson.data)

        setSuccessMsg(`Asset '${allocationForm.assetCode}' allocated to ${allocationForm.allocatedTo}.`)
        setShowSuccess(true)
        setDialogOpen(false)
      } else {
        setFormError(json.message || 'Failed to allocate asset.')
      }
    } catch (_err) {
      setFormError('Error allocating asset.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleReturnAllocation = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/asset-allocation/${id}/return`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actualReturnDate: new Date().toISOString().split('T')[0] })
      })
      const json = await res.json()
      if (json.success) {
        setAllocations(allocations.map(a => a._id === id ? json.data : a))
        const aRes = await fetch(`${API_BASE}/assets`)
        const aJson = await aRes.json()
        if (aJson.success) setAssets(aJson.data)

        setSuccessMsg('Asset returned to main store inventory.')
        setShowSuccess(true)
      }
    } catch (_err) {
      // Quiet
    }
  }

  const handleSaveMaintenance = async (e) => {
    e.preventDefault()
    if (!maintenanceForm.assetCode || !maintenanceForm.scheduledDate) {
      setFormError('Asset Code and Scheduled Date are required.')
      return
    }
    setFormError('')
    setIsSaving(true)

    try {
      const res = await fetch(`${API_BASE}/maintenance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(maintenanceForm)
      })
      const json = await res.json()
      if (json.success) {
        setMaintenanceLogs([...maintenanceLogs, json.data])
        const aRes = await fetch(`${API_BASE}/assets`)
        const aJson = await aRes.json()
        if (aJson.success) setAssets(aJson.data)

        setSuccessMsg('Maintenance log scheduled.')
        setShowSuccess(true)
        setDialogOpen(false)
      } else {
        setFormError(json.message || 'Error scheduling maintenance.')
      }
    } catch (_err) {
      setFormError('Failed to record maintenance log.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return
    setIsSaving(true)
    const { type, id } = itemToDelete

    try {
      if (type === 'category') {
        await fetch(`${API_BASE}/asset-categories/${id}`, { method: 'DELETE' })
        setCategories(categories.filter(c => c._id !== id))
      } else if (type === 'asset') {
        await fetch(`${API_BASE}/assets/${id}`, { method: 'DELETE' })
        setAssets(assets.filter(a => a._id !== id))
      } else if (type === 'vendor') {
        await fetch(`${API_BASE}/vendors/${id}`, { method: 'DELETE' })
        setVendors(vendors.filter(v => v._id !== id))
      } else if (type === 'po') {
        await fetch(`${API_BASE}/purchase-orders/${id}`, { method: 'DELETE' })
        setPurchaseOrders(purchaseOrders.filter(p => p._id !== id))
      } else if (type === 'stock') {
        await fetch(`${API_BASE}/stock/${id}`, { method: 'DELETE' })
        setStockItems(stockItems.filter(s => s._id !== id))
      } else if (type === 'maintenance') {
        await fetch(`${API_BASE}/maintenance/${id}`, { method: 'DELETE' })
        setMaintenanceLogs(maintenanceLogs.filter(m => m._id !== id))
      }
      setSuccessMsg('Record removed from inventory.')
      setShowSuccess(true)
    } catch (_err) {
      // Fallback
    } finally {
      setIsSaving(false)
      setDeleteDialogOpen(false)
      setItemToDelete(null)
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 p-4 md:p-6 animate-in fade-in duration-200">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border pb-5 mb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            Inventory & Asset Management
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage school hardware assets, consumables, vendor relations, purchase orders, asset allocations, and maintenance logs.</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handlePrint} className="flex items-center gap-1.5">
            <Printer className="h-4 w-4" />
            Print Report
          </Button>
        </div>
      </div>

      {/* Sub-navigation Tabs */}
      <div className="flex border-b border-border overflow-x-auto">
        {[
          { key: 'dashboard', label: 'Dashboard', icon: BarChart3 },
          { key: 'categories', label: 'Asset Categories', icon: Layers },
          { key: 'assets', label: 'Assets Directory', icon: Box },
          { key: 'stock', label: 'Stock Management', icon: Warehouse },
          { key: 'vendors', label: 'Vendors', icon: Truck },
          { key: 'purchase-orders', label: 'Purchase Orders', icon: ShoppingBag },
          { key: 'allocations', label: 'Asset Allocation', icon: UserCheck },
          { key: 'maintenance', label: 'Maintenance Logs', icon: Wrench },
          { key: 'history', label: 'Asset History', icon: History },
          { key: 'reports', label: 'Inventory Reports', icon: PieChart }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => navigate(`/admin/inventory/${tab.key}`)}
            className={cn(
              "px-4 py-2.5 border-b-2 text-sm font-semibold transition-colors cursor-pointer select-none flex items-center gap-2 whitespace-nowrap",
              activeTab === tab.key 
                ? "border-primary text-primary bg-primary/5" 
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* --- TAB 1: INVENTORY DASHBOARD --- */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-card p-5 rounded-lg border border-border shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase">Total Hardware Assets</span>
                <h3 className="text-2xl font-bold text-foreground mt-1">{dashboardMetrics.totalAssets || assets.length}</h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Box className="h-5 w-5" />
              </div>
            </div>

            <div className="bg-card p-5 rounded-lg border border-border shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase">Available In Store</span>
                <h3 className="text-2xl font-bold text-emerald-600 mt-1">{dashboardMetrics.availableAssets || assets.filter(a=>a.status==='available').length}</h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <Check className="h-5 w-5" />
              </div>
            </div>

            <div className="bg-card p-5 rounded-lg border border-border shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase">Allocated Assets</span>
                <h3 className="text-2xl font-bold text-blue-600 mt-1">{dashboardMetrics.allocatedAssets || assets.filter(a=>a.status==='allocated').length}</h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600">
                <UserCheck className="h-5 w-5" />
              </div>
            </div>

            <div className="bg-card p-5 rounded-lg border border-border shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase">Low Stock Alerts</span>
                <h3 className="text-2xl font-bold text-rose-600 mt-1">{dashboardMetrics.lowStockItems || stockItems.filter(s=>s.availableQuantity<=s.minimumStock).length}</h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: ASSET CATEGORIES --- */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-card p-4 rounded-lg border border-border shadow-sm">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              Asset Categories
            </h3>
            <Button onClick={() => {
              setCategoryForm(initialCategoryForm)
              setIsEditing(false)
              setDialogType('category')
              setDialogOpen(true)
            }} className="flex items-center gap-1.5">
              <Plus className="h-4 w-4" />
              Add Category
            </Button>
          </div>

          <div className="bg-card p-4 rounded-lg border border-border shadow-sm">
            <AppTable
              columns={[
                { header: 'Category Name', accessor: 'categoryName' },
                { header: 'Description', accessor: 'description' },
                { header: 'Status', accessor: row => <StatusBadge status={row.status} /> },
                {
                  header: 'Actions',
                  accessor: row => (
                    <button
                      onClick={() => {
                        setItemToDelete({ type: 'category', id: row._id, name: row.categoryName })
                        setDeleteDialogOpen(true)
                      }}
                      className="h-7 w-7 inline-flex items-center justify-center rounded border border-border hover:bg-destructive/10 text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )
                }
              ]}
              data={categories}
            />
          </div>
        </div>
      )}

      {/* --- TAB 3: ASSETS DIRECTORY --- */}
      {activeTab === 'assets' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-card p-4 rounded-lg border border-border shadow-sm">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Box className="h-5 w-5 text-primary" />
              Hardware & Equipment Assets
            </h3>
            <Button onClick={() => {
              setAssetForm(initialAssetForm)
              setIsEditing(false)
              setDialogType('asset')
              setDialogOpen(true)
            }} className="flex items-center gap-1.5">
              <Plus className="h-4 w-4" />
              Add Asset
            </Button>
          </div>

          <div className="bg-card p-4 rounded-lg border border-border shadow-sm">
            <AppTable
              columns={[
                { header: 'Asset Code', accessor: 'assetCode' },
                { header: 'Asset Name', accessor: 'assetName' },
                { header: 'Category', accessor: 'category' },
                { header: 'Purchase Cost', accessor: row => <span className="font-bold text-emerald-600">${row.purchaseCost}</span> },
                { header: 'Location', accessor: 'location' },
                { header: 'Status', accessor: row => <StatusBadge status={row.status} /> },
                {
                  header: 'Actions',
                  accessor: row => (
                    <button
                      onClick={() => {
                        setItemToDelete({ type: 'asset', id: row._id, name: `${row.assetName} (${row.assetCode})` })
                        setDeleteDialogOpen(true)
                      }}
                      className="h-7 w-7 inline-flex items-center justify-center rounded border border-border hover:bg-destructive/10 text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )
                }
              ]}
              data={assets}
            />
          </div>
        </div>
      )}

      {/* --- TAB 4: STOCK MANAGEMENT --- */}
      {activeTab === 'stock' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-card p-4 rounded-lg border border-border shadow-sm">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Warehouse className="h-5 w-5 text-primary" />
              Consumables & Stock Inventory
            </h3>
            <Button onClick={() => {
              setStockForm(initialStockForm)
              setIsEditing(false)
              setDialogType('stock')
              setDialogOpen(true)
            }} className="flex items-center gap-1.5">
              <Plus className="h-4 w-4" />
              Add Stock Item
            </Button>
          </div>

          <div className="bg-card p-4 rounded-lg border border-border shadow-sm">
            <AppTable
              columns={[
                { header: 'Item Name', accessor: 'itemName' },
                { header: 'Category', accessor: 'category' },
                { header: 'Total Quantity', accessor: 'quantity' },
                { header: 'Min Stock Threshold', accessor: 'minimumStock' },
                { header: 'Available Quantity', accessor: row => <span className={cn("font-bold", row.availableQuantity <= row.minimumStock ? "text-rose-600" : "text-emerald-600")}>{row.availableQuantity} {row.unit}</span> },
                {
                  header: 'Actions',
                  accessor: row => (
                    <button
                      onClick={() => {
                        setItemToDelete({ type: 'stock', id: row._id, name: row.itemName })
                        setDeleteDialogOpen(true)
                      }}
                      className="h-7 w-7 inline-flex items-center justify-center rounded border border-border hover:bg-destructive/10 text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )
                }
              ]}
              data={stockItems}
            />
          </div>
        </div>
      )}

      {/* --- TAB 5: VENDORS --- */}
      {activeTab === 'vendors' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-card p-4 rounded-lg border border-border shadow-sm">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              Vendors & Suppliers
            </h3>
            <Button onClick={() => {
              setVendorForm(initialVendorForm)
              setIsEditing(false)
              setDialogType('vendor')
              setDialogOpen(true)
            }} className="flex items-center gap-1.5">
              <Plus className="h-4 w-4" />
              Add Vendor
            </Button>
          </div>

          <div className="bg-card p-4 rounded-lg border border-border shadow-sm">
            <AppTable
              columns={[
                { header: 'Vendor Name', accessor: 'vendorName' },
                { header: 'Contact Person', accessor: 'contactPerson' },
                { header: 'Phone', accessor: 'phone' },
                { header: 'Email', accessor: 'email' },
                { header: 'GST/Tax ID', accessor: 'taxId' },
                {
                  header: 'Actions',
                  accessor: row => (
                    <button
                      onClick={() => {
                        setItemToDelete({ type: 'vendor', id: row._id, name: row.vendorName })
                        setDeleteDialogOpen(true)
                      }}
                      className="h-7 w-7 inline-flex items-center justify-center rounded border border-border hover:bg-destructive/10 text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )
                }
              ]}
              data={vendors}
            />
          </div>
        </div>
      )}

      {/* --- TAB 6: PURCHASE ORDERS --- */}
      {activeTab === 'purchase-orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-card p-4 rounded-lg border border-border shadow-sm">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary" />
              Purchase Orders & Requisitions
            </h3>
            <Button onClick={() => {
              setPoForm(initialPOForm)
              setIsEditing(false)
              setDialogType('po')
              setDialogOpen(true)
            }} className="flex items-center gap-1.5">
              <Plus className="h-4 w-4" />
              Create Purchase Order
            </Button>
          </div>

          <div className="bg-card p-4 rounded-lg border border-border shadow-sm">
            <AppTable
              columns={[
                { header: 'PO Number', accessor: 'poNumber' },
                { header: 'Vendor', accessor: 'vendor' },
                { header: 'Order Date', accessor: 'orderDate' },
                { header: 'Total Amount', accessor: row => <span className="font-bold text-emerald-600">${row.totalAmount}</span> },
                { header: 'Status', accessor: row => <StatusBadge status={row.status} /> },
                {
                  header: 'Actions',
                  accessor: row => (
                    <button
                      onClick={() => {
                        setItemToDelete({ type: 'po', id: row._id, name: row.poNumber })
                        setDeleteDialogOpen(true)
                      }}
                      className="h-7 w-7 inline-flex items-center justify-center rounded border border-border hover:bg-destructive/10 text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )
                }
              ]}
              data={purchaseOrders}
            />
          </div>
        </div>
      )}

      {/* --- TAB 7: ASSET ALLOCATION --- */}
      {activeTab === 'allocations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-card p-4 rounded-lg border border-border shadow-sm">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-primary" />
              Asset Allocations & Custody
            </h3>
            <Button onClick={() => {
              setAllocationForm(initialAllocationForm)
              setIsEditing(false)
              setDialogType('allocation')
              setDialogOpen(true)
            }} className="flex items-center gap-1.5">
              <Plus className="h-4 w-4" />
              Allocate Asset
            </Button>
          </div>

          <div className="bg-card p-4 rounded-lg border border-border shadow-sm">
            <AppTable
              columns={[
                { header: 'Asset Code', accessor: 'assetCode' },
                { header: 'Asset Name', accessor: 'assetName' },
                { header: 'Allocated To', accessor: 'allocatedTo' },
                { header: 'Allocation Date', accessor: 'allocationDate' },
                { header: 'Status', accessor: row => <StatusBadge status={row.status} /> },
                {
                  header: 'Actions',
                  accessor: row => (
                    row.status === 'active' ? (
                      <button
                        onClick={() => handleReturnAllocation(row._id)}
                        className="px-2 py-1 text-xs font-medium rounded border border-border bg-emerald-50 text-emerald-700 hover:bg-emerald-100 flex items-center gap-1"
                      >
                        <RotateCcw className="h-3 w-3" /> Return Asset
                      </button>
                    ) : (
                      <span className="text-xs text-muted-foreground">Returned</span>
                    )
                  )
                }
              ]}
              data={allocations}
            />
          </div>
        </div>
      )}

      {/* --- TAB 8: MAINTENANCE LOGS --- */}
      {activeTab === 'maintenance' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-card p-4 rounded-lg border border-border shadow-sm">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Wrench className="h-5 w-5 text-primary" />
              Maintenance & Repair Services
            </h3>
            <Button onClick={() => {
              setMaintenanceForm(initialMaintenanceForm)
              setIsEditing(false)
              setDialogType('maintenance')
              setDialogOpen(true)
            }} className="flex items-center gap-1.5">
              <Plus className="h-4 w-4" />
              Schedule Maintenance
            </Button>
          </div>

          <div className="bg-card p-4 rounded-lg border border-border shadow-sm">
            <AppTable
              columns={[
                { header: 'Asset Code', accessor: 'assetCode' },
                { header: 'Asset Name', accessor: 'assetName' },
                { header: 'Service Type', accessor: 'maintenanceType' },
                { header: 'Scheduled Date', accessor: 'scheduledDate' },
                { header: 'Cost', accessor: row => <span className="font-bold text-rose-600">${row.cost}</span> },
                { header: 'Status', accessor: row => <StatusBadge status={row.status} /> },
                {
                  header: 'Actions',
                  accessor: row => (
                    <button
                      onClick={() => {
                        setItemToDelete({ type: 'maintenance', id: row._id, name: `${row.assetName} maintenance` })
                        setDeleteDialogOpen(true)
                      }}
                      className="h-7 w-7 inline-flex items-center justify-center rounded border border-border hover:bg-destructive/10 text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )
                }
              ]}
              data={maintenanceLogs}
            />
          </div>
        </div>
      )}

      {/* --- TAB 9: ASSET HISTORY --- */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-card p-4 rounded-lg border border-border shadow-sm">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              Audit History & Transaction Logs
            </h3>
          </div>

          <div className="bg-card p-4 rounded-lg border border-border shadow-sm">
            <AppTable
              columns={[
                { header: 'Asset Code', accessor: 'assetCode' },
                { header: 'Asset Name', accessor: 'assetName' },
                { header: 'Custodian/Location', accessor: row => row.allocatedTo || row.location || 'Store' },
                { header: 'Date Logged', accessor: row => row.allocationDate || row.purchaseDate || '—' },
                { header: 'Current Status', accessor: row => <StatusBadge status={row.status} /> }
              ]}
              data={[...assets, ...allocations]}
            />
          </div>
        </div>
      )}

      {/* --- TAB 10: REPORTS --- */}
      {activeTab === 'reports' && (
        <div className="bg-card p-6 rounded-lg border border-border shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <PieChart className="h-5 w-5 text-primary" />
                Inventory Valuation & Audit Reports
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">Comprehensive audit breakdown of hardware assets, stock inventory, vendor purchases, and servicing costs.</p>
            </div>
            <Button variant="outline" onClick={handlePrint} className="flex items-center gap-1.5">
              <Printer className="h-4 w-4" />
              Export PDF Report
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-border rounded-lg bg-muted/20 space-y-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Total Hardware Asset Valuation</span>
              <p className="text-2xl font-bold text-foreground">${assets.reduce((a,c)=>a+(c.purchaseCost||0),0)}</p>
            </div>

            <div className="p-4 border border-border rounded-lg bg-muted/20 space-y-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Total Stock Line Items</span>
              <p className="text-2xl font-bold text-primary">{stockItems.length} Products</p>
            </div>

            <div className="p-4 border border-border rounded-lg bg-muted/20 space-y-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Total Servicing Costs</span>
              <p className="text-2xl font-bold text-rose-600">${maintenanceLogs.reduce((a,c)=>a+(c.cost||0),0)}</p>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL DIALOGS --- */}

      {/* CATEGORY DIALOG */}
      {dialogType === 'category' && (
        <AppDialog isOpen={dialogOpen} onClose={() => setDialogOpen(false)} title="Asset Category">
          <AppForm onSubmit={handleSaveCategory} className="gap-4 mt-2">
            {formError && <Alert variant="danger">{formError}</Alert>}
            <AppInput label="Category Name" value={categoryForm.categoryName} onChange={e => setCategoryForm({ ...categoryForm, categoryName: e.target.value })} className="md:col-span-2" />
            <FormTextarea label="Description" value={categoryForm.description} onChange={e => setCategoryForm({ ...categoryForm, description: e.target.value })} rows={2} className="md:col-span-2" />
            <div className="flex justify-end gap-2 md:col-span-2 border-t border-border pt-4 mt-2">
              <Button variant="outline" type="button" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <LoadingButton type="submit" loading={isSaving}>Save Category</LoadingButton>
            </div>
          </AppForm>
        </AppDialog>
      )}

      {/* ASSET DIALOG */}
      {dialogType === 'asset' && (
        <AppDialog isOpen={dialogOpen} onClose={() => setDialogOpen(false)} title="Hardware Asset Entry">
          <AppForm onSubmit={handleSaveAsset} className="gap-4 mt-2">
            {formError && <Alert variant="danger">{formError}</Alert>}
            <AppInput label="Asset Code" value={assetForm.assetCode} onChange={e => setAssetForm({ ...assetForm, assetCode: e.target.value })} />
            <AppInput label="Asset Name" value={assetForm.assetName} onChange={e => setAssetForm({ ...assetForm, assetName: e.target.value })} />
            <AppInput label="Category" value={assetForm.category} onChange={e => setAssetForm({ ...assetForm, category: e.target.value })} />
            <AppInput label="Purchase Cost ($)" type="number" value={assetForm.purchaseCost} onChange={e => setAssetForm({ ...assetForm, purchaseCost: parseFloat(e.target.value) || 0 })} />
            <AppInput label="Purchase Date" type="date" value={assetForm.purchaseDate} onChange={e => setAssetForm({ ...assetForm, purchaseDate: e.target.value })} />
            <AppInput label="Store Location" value={assetForm.location} onChange={e => setAssetForm({ ...assetForm, location: e.target.value })} />
            <div className="flex justify-end gap-2 md:col-span-2 border-t border-border pt-4 mt-2">
              <Button variant="outline" type="button" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <LoadingButton type="submit" loading={isSaving}>Save Asset</LoadingButton>
            </div>
          </AppForm>
        </AppDialog>
      )}

      {/* VENDOR DIALOG */}
      {dialogType === 'vendor' && (
        <AppDialog isOpen={dialogOpen} onClose={() => setDialogOpen(false)} title="Vendor Registry">
          <AppForm onSubmit={handleSaveVendor} className="gap-4 mt-2">
            {formError && <Alert variant="danger">{formError}</Alert>}
            <AppInput label="Vendor Name" value={vendorForm.vendorName} onChange={e => setVendorForm({ ...vendorForm, vendorName: e.target.value })} className="md:col-span-2" />
            <AppInput label="Contact Person" value={vendorForm.contactPerson} onChange={e => setVendorForm({ ...vendorForm, contactPerson: e.target.value })} />
            <AppInput label="Phone" value={vendorForm.phone} onChange={e => setVendorForm({ ...vendorForm, phone: e.target.value })} />
            <AppInput label="Email" type="email" value={vendorForm.email} onChange={e => setVendorForm({ ...vendorForm, email: e.target.value })} />
            <AppInput label="GST / Tax ID" value={vendorForm.taxId} onChange={e => setVendorForm({ ...vendorForm, taxId: e.target.value })} />
            <div className="flex justify-end gap-2 md:col-span-2 border-t border-border pt-4 mt-2">
              <Button variant="outline" type="button" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <LoadingButton type="submit" loading={isSaving}>Save Vendor</LoadingButton>
            </div>
          </AppForm>
        </AppDialog>
      )}

      {/* PO DIALOG */}
      {dialogType === 'po' && (
        <AppDialog isOpen={dialogOpen} onClose={() => setDialogOpen(false)} title="Create Purchase Order">
          <AppForm onSubmit={handleSavePO} className="gap-4 mt-2">
            {formError && <Alert variant="danger">{formError}</Alert>}
            <AppInput label="PO Number" value={poForm.poNumber} onChange={e => setPoForm({ ...poForm, poNumber: e.target.value })} />
            <AppInput label="Vendor Name" value={poForm.vendor} onChange={e => setPoForm({ ...poForm, vendor: e.target.value })} />
            <AppInput label="Order Date" type="date" value={poForm.orderDate} onChange={e => setPoForm({ ...poForm, orderDate: e.target.value })} />
            <AppInput label="Item Description" value={poForm.itemName} onChange={e => setPoForm({ ...poForm, itemName: e.target.value })} />
            <AppInput label="Quantity" type="number" value={poForm.quantity} onChange={e => setPoForm({ ...poForm, quantity: parseInt(e.target.value, 10) || 1 })} />
            <AppInput label="Unit Cost ($)" type="number" value={poForm.unitCost} onChange={e => setPoForm({ ...poForm, unitCost: parseFloat(e.target.value) || 0 })} />
            <div className="flex justify-end gap-2 md:col-span-2 border-t border-border pt-4 mt-2">
              <Button variant="outline" type="button" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <LoadingButton type="submit" loading={isSaving}>Create PO</LoadingButton>
            </div>
          </AppForm>
        </AppDialog>
      )}

      {/* STOCK DIALOG */}
      {dialogType === 'stock' && (
        <AppDialog isOpen={dialogOpen} onClose={() => setDialogOpen(false)} title="Stock Consumable Item">
          <AppForm onSubmit={handleSaveStock} className="gap-4 mt-2">
            {formError && <Alert variant="danger">{formError}</Alert>}
            <AppInput label="Item Name" value={stockForm.itemName} onChange={e => setStockForm({ ...stockForm, itemName: e.target.value })} className="md:col-span-2" />
            <AppInput label="Category" value={stockForm.category} onChange={e => setStockForm({ ...stockForm, category: e.target.value })} />
            <AppInput label="Quantity" type="number" value={stockForm.quantity} onChange={e => setStockForm({ ...stockForm, quantity: parseInt(e.target.value, 10) || 0 })} />
            <AppInput label="Min Stock Alert Threshold" type="number" value={stockForm.minimumStock} onChange={e => setStockForm({ ...stockForm, minimumStock: parseInt(e.target.value, 10) || 0 })} />
            <AppInput label="Unit (e.g. pcs, boxes)" value={stockForm.unit} onChange={e => setStockForm({ ...stockForm, unit: e.target.value })} />
            <div className="flex justify-end gap-2 md:col-span-2 border-t border-border pt-4 mt-2">
              <Button variant="outline" type="button" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <LoadingButton type="submit" loading={isSaving}>Save Stock Item</LoadingButton>
            </div>
          </AppForm>
        </AppDialog>
      )}

      {/* ALLOCATION DIALOG */}
      {dialogType === 'allocation' && (
        <AppDialog isOpen={dialogOpen} onClose={() => setDialogOpen(false)} title="Allocate Asset Custody">
          <AppForm onSubmit={handleSaveAllocation} className="gap-4 mt-2">
            {formError && <Alert variant="danger">{formError}</Alert>}

            {assets.length > 0 && (
              <FormSelect
                label="Select Available Hardware Asset"
                value={allocationForm.assetCode}
                onChange={e => {
                  const selected = assets.find(a => a.assetCode === e.target.value)
                  if (selected) {
                    setAllocationForm({ ...allocationForm, assetCode: selected.assetCode, assetName: selected.assetName })
                  }
                }}
                options={[
                  { value: '', label: 'Select Asset...' },
                  ...assets.filter(a => a.status === 'available').map(a => ({
                    value: a.assetCode,
                    label: `${a.assetName} (${a.assetCode})`
                  }))
                ]}
                className="md:col-span-2"
              />
            )}

            <AppInput label="Asset Code" value={allocationForm.assetCode} onChange={e => setAllocationForm({ ...allocationForm, assetCode: e.target.value })} />
            <AppInput label="Allocated Custodian/Staff" value={allocationForm.allocatedTo} onChange={e => setAllocationForm({ ...allocationForm, allocatedTo: e.target.value })} />
            <FormSelect label="Recipient Type" value={allocationForm.allocatedType} onChange={e => setAllocationForm({ ...allocationForm, allocatedType: e.target.value })} options={[
              { value: 'Teacher', label: 'Teacher' },
              { value: 'Staff', label: 'Staff' },
              { value: 'Department', label: 'Department' }
            ]} />
            <AppInput label="Allocation Date" type="date" value={allocationForm.allocationDate} onChange={e => setAllocationForm({ ...allocationForm, allocationDate: e.target.value })} />
            <div className="flex justify-end gap-2 md:col-span-2 border-t border-border pt-4 mt-2">
              <Button variant="outline" type="button" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <LoadingButton type="submit" loading={isSaving}>Allocate Asset</LoadingButton>
            </div>
          </AppForm>
        </AppDialog>
      )}

      {/* MAINTENANCE DIALOG */}
      {dialogType === 'maintenance' && (
        <AppDialog isOpen={dialogOpen} onClose={() => setDialogOpen(false)} title="Schedule Servicing / Maintenance">
          <AppForm onSubmit={handleSaveMaintenance} className="gap-4 mt-2">
            {formError && <Alert variant="danger">{formError}</Alert>}
            <AppInput label="Asset Code" value={maintenanceForm.assetCode} onChange={e => setMaintenanceForm({ ...maintenanceForm, assetCode: e.target.value })} />
            <AppInput label="Service Type" value={maintenanceForm.maintenanceType} onChange={e => setMaintenanceForm({ ...maintenanceForm, maintenanceType: e.target.value })} />
            <AppInput label="Scheduled Date" type="date" value={maintenanceForm.scheduledDate} onChange={e => setMaintenanceForm({ ...maintenanceForm, scheduledDate: e.target.value })} />
            <AppInput label="Vendor / Service Center" value={maintenanceForm.vendor} onChange={e => setMaintenanceForm({ ...maintenanceForm, vendor: e.target.value })} />
            <AppInput label="Servicing Cost ($)" type="number" value={maintenanceForm.cost} onChange={e => setMaintenanceForm({ ...maintenanceForm, cost: parseFloat(e.target.value) || 0 })} className="md:col-span-2" />
            <div className="flex justify-end gap-2 md:col-span-2 border-t border-border pt-4 mt-2">
              <Button variant="outline" type="button" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <LoadingButton type="submit" loading={isSaving}>Schedule Servicing</LoadingButton>
            </div>
          </AppForm>
        </AppDialog>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      <DeleteDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName={itemToDelete?.name || 'this item'}
        loading={isSaving}
      />

      {/* SUCCESS NOTIFICATION DIALOG */}
      <SuccessDialog
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Inventory Audit Updated"
        message={successMsg}
      />

    </div>
  )
}
