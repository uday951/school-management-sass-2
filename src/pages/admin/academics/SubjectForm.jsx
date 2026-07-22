import React, { useState, useEffect } from 'react'
import { DialogBase, FormLayout, FormInput, FormTextarea, FormSelect, Button } from '@/components/shared'

export default function SubjectForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData = null, 
  loading = false 
}) {
  const isEditMode = !!initialData

  // Form Field States
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [department, setDepartment] = useState('')
  const [credits, setCredits] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState('active')

  // Validation States
  const [errors, setErrors] = useState({})

  // Initialize fields on load or change of initialData
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '')
      setCode(initialData.code || '')
      setDepartment(initialData.department || '')
      setCredits(initialData.credits || '')
      setDescription(initialData.description || '')
      setStatus(initialData.status || 'active')
    } else {
      setName('')
      setCode('')
      setDepartment('')
      setCredits('')
      setDescription('')
      setStatus('active')
    }
    setErrors({})
  }, [initialData, isOpen])

  const validate = () => {
    const tempErrors = {}
    if (!name.trim()) tempErrors.name = 'Subject Name is required.'
    
    if (!code.trim()) {
      tempErrors.code = 'Subject Code is required.'
    } else if (code.trim().length < 3) {
      tempErrors.code = 'Subject Code must be at least 3 characters.'
    }

    if (!department.trim()) tempErrors.department = 'Department is required.'

    const creditsNum = Number(credits)
    if (!credits.toString().trim()) {
      tempErrors.credits = 'Credits is required.'
    } else if (isNaN(creditsNum) || creditsNum < 0) {
      tempErrors.credits = 'Credits must be a positive number.'
    }

    setErrors(tempErrors)
    return Object.keys(tempErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    onSubmit({
      name,
      code,
      department,
      credits,
      description,
      status
    })
  }

  return (
    <DialogBase 
      isOpen={isOpen} 
      onClose={onClose} 
      title={isEditMode ? 'Edit Subject Setup' : 'Add Subject Setup'}
      className="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormLayout className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Subject Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            placeholder="e.g. English Literature"
            required
            disabled={loading}
          />
          <FormInput
            label="Subject Code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            error={errors.code}
            placeholder="e.g. ENG-101"
            required
            disabled={loading || isEditMode}
          />
          <FormInput
            label="Department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            error={errors.department}
            placeholder="e.g. Languages"
            required
            disabled={loading}
          />
          <FormInput
            label="Credits Value"
            type="number"
            value={credits}
            onChange={(e) => setCredits(e.target.value)}
            error={errors.credits}
            placeholder="e.g. 3"
            required
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
          
          <div className="md:col-span-2">
            <FormTextarea
              label="Description (Optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a brief course overview..."
              rows={3}
              disabled={loading}
            />
          </div>
        </FormLayout>

        <div className="flex justify-end gap-3 pt-4 border-t border-border select-none">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Processing...' : isEditMode ? 'Update Subject' : 'Create Subject'}
          </Button>
        </div>
      </form>
    </DialogBase>
  )
}
