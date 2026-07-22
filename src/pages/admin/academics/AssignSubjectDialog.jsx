import React, { useState, useEffect } from 'react'
import { DialogBase, FormSelect, Button } from '@/components/shared'

export default function AssignSubjectDialog({ 
  isOpen, 
  onClose, 
  onSubmit, 
  subject, 
  classes = [], 
  teachers = [], 
  loading = false 
}) {
  const [teacherId, setTeacherId] = useState('')
  const [selectedClasses, setSelectedClasses] = useState([])

  useEffect(() => {
    if (subject) {
      setTeacherId(subject.teacherId || '')
      setSelectedClasses(subject.assignedClasses || [])
    }
  }, [subject, isOpen])

  const handleToggleClass = (classId) => {
    setSelectedClasses(prev => 
      prev.includes(classId) 
        ? prev.filter(id => id !== classId) 
        : [...prev, classId]
    )
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      teacherId,
      assignedClasses: selectedClasses
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
      title={`Assign Subject Mappings`}
      className="max-w-md"
    >
      <div className="mb-4 pb-4 border-b border-border">
        <h4 className="text-sm font-bold text-foreground truncate">{subject?.name}</h4>
        <p className="text-xs text-muted-foreground">Code: <span className="font-semibold text-foreground bg-muted px-1.5 py-0.5 rounded">{subject?.code}</span></p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Assign Teacher */}
        <FormSelect
          label="Course Teacher"
          value={teacherId}
          onChange={(e) => setTeacherId(e.target.value)}
          options={teacherOptions}
          placeholder="Select Assigned Teacher"
          disabled={loading}
        />

        {/* Assign Classes */}
        <div className="space-y-2 select-none">
          <label className="text-xs font-semibold text-muted-foreground uppercase">Assign to Classes</label>
          <div className="border border-input rounded-md bg-background max-h-48 overflow-y-auto p-3 space-y-2.5">
            {classes.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">No classes available.</p>
            ) : (
              classes.map((cls) => {
                const isChecked = selectedClasses.includes(cls.id)
                return (
                  <label 
                    key={cls.id} 
                    className="flex items-center gap-3 text-sm text-foreground cursor-pointer hover:bg-muted/30 p-1.5 rounded transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleClass(cls.id)}
                      disabled={loading}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                    />
                    <div className="flex flex-col">
                      <span className="font-medium text-xs leading-none">{cls.name}</span>
                      <span className="text-[10px] text-muted-foreground">{cls.code} — {cls.roomNumber}</span>
                    </div>
                  </label>
                )
              })
            )}
          </div>
          <p className="text-[10px] text-muted-foreground">Select one or more classes where this subject will be taught.</p>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border select-none">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Mappings'}
          </Button>
        </div>
      </form>
    </DialogBase>
  )
}
