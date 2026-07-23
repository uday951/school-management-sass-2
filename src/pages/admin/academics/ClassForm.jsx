import React, { useState, useEffect } from 'react'
import { DialogBase, FormLayout, FormInput, FormSelect, Button } from '@/components/shared'

export default function ClassForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData = null, 
  teachers = [], 
  loading = false 
}) {
  const isEditMode = !!initialData

  // Form Field States
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [capacity, setCapacity] = useState('')
  const [roomNumber, setRoomNumber] = useState('')
  const [teacherId, setTeacherId] = useState('')
  const [status, setStatus] = useState('active')

  // Validation States
  const [errors, setErrors] = useState({})

  // Initialize fields on load or change of initialData
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '')
      setCode(initialData.code || '')
      setCapacity(initialData.capacity || '')
      setRoomNumber(initialData.roomNumber || '')
      setTeacherId(initialData.teacherId || '')
      setStatus(initialData.status || 'active')
    } else {
      setName('')
      setCode('')
      setCapacity('')
      setRoomNumber('')
      setTeacherId('')
      setStatus('active')
    }
    setErrors({})
  }, [initialData, isOpen])

  const validate = () => {
    const tempErrors = {}
    if (!name.trim()) tempErrors.name = 'Class Name is required.'
    
    if (!code.trim()) {
      tempErrors.code = 'Class Code is required.'
    }

    const capacityNum = Number(capacity)
    if (!capacity.toString().trim()) {
      tempErrors.capacity = 'Capacity is required.'
    } else if (isNaN(capacityNum) || capacityNum <= 0) {
      tempErrors.capacity = 'Capacity must be a positive integer.'
    }

    if (!roomNumber.trim()) tempErrors.roomNumber = 'Room Number is required.'

    setErrors(tempErrors)
    return Object.keys(tempErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    onSubmit({
      name,
      code,
      capacity,
      roomNumber,
      teacherId,
      status
    })
  }

  const teacherOptions = teachers.map(t => ({
    value: t.id,
    label: `${t.name} (${t.department})`
  }))

  return (
    <DialogBase 
      isOpen={isOpen} 
      onClose={onClose} 
      title={isEditMode ? 'Edit Class Register' : 'Add Class Register'}
      className="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormLayout className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Class Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            placeholder="e.g. Grade 10-A"
            required
            disabled={loading}
          />
          <FormInput
            label="Class Code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            error={errors.code}
            placeholder="e.g. G10A"
            required
            disabled={loading || isEditMode} // Disable editing code as it is a unique key
          />
          <FormInput
            label="Capacity Limit"
            type="number"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            error={errors.capacity}
            placeholder="e.g. 35"
            required
            disabled={loading}
          />
          <FormInput
            label="Room Number"
            value={roomNumber}
            onChange={(e) => setRoomNumber(e.target.value)}
            error={errors.roomNumber}
            placeholder="e.g. Room 104"
            required
            disabled={loading}
          />
          <FormSelect
            label="Class Teacher"
            value={teacherId}
            onChange={(e) => setTeacherId(e.target.value)}
            options={teacherOptions}
            placeholder="Select Class Teacher"
            disabled={loading}
          />
          <FormSelect
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' }
            ]}
            placeholder=""
            disabled={loading}
          />
        </FormLayout>

        <div className="flex justify-end gap-3 pt-4 border-t border-border select-none">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Processing...' : isEditMode ? 'Update Class' : 'Create Class'}
          </Button>
        </div>
      </form>
    </DialogBase>
  )
}
