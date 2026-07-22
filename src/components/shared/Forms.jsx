import React, { useState } from 'react'
import { Eye, EyeOff, Upload, FileText, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function FormLayout({ children, onSubmit, className, ...props }) {
  return (
    <form onSubmit={onSubmit} className={cn("grid grid-cols-1 gap-4 md:grid-cols-2", className)} {...props}>
      {children}
    </form>
  )
}

export const FormInput = React.forwardRef(({ 
  label, 
  error, 
  className, 
  id, 
  type = 'text', 
  ...props 
}, ref) => {
  return (
    <div className={cn("space-y-1 w-full", className)}>
      {label && <label htmlFor={id} className="text-xs font-semibold text-muted-foreground uppercase">{label}</label>}
      <input
        ref={ref}
        id={id}
        type={type}
        className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        {...props}
      />
      {error && <span className="text-[10px] font-bold text-destructive animate-in fade-in duration-100">{error}</span>}
    </div>
  )
})
FormInput.displayName = 'FormInput'

export const FormTextarea = React.forwardRef(({ 
  label, 
  error, 
  className, 
  id, 
  rows = 3, 
  ...props 
}, ref) => {
  return (
    <div className={cn("space-y-1 w-full md:col-span-2", className)}>
      {label && <label htmlFor={id} className="text-xs font-semibold text-muted-foreground uppercase">{label}</label>}
      <textarea
        ref={ref}
        id={id}
        rows={rows}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        {...props}
      />
      {error && <span className="text-[10px] font-bold text-destructive">{error}</span>}
    </div>
  )
})
FormTextarea.displayName = 'FormTextarea'

export const FormSelect = React.forwardRef(({ 
  label, 
  error, 
  className, 
  id, 
  options = [], 
  placeholder = "Select option", 
  ...props 
}, ref) => {
  return (
    <div className={cn("space-y-1 w-full", className)}>
      {label && <label htmlFor={id} className="text-xs font-semibold text-muted-foreground uppercase">{label}</label>}
      <select
        ref={ref}
        id={id}
        className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <span className="text-[10px] font-bold text-destructive">{error}</span>}
    </div>
  )
})
FormSelect.displayName = 'FormSelect'

export const PasswordInput = React.forwardRef(({ label, error, className, id, ...props }, ref) => {
  const [show, setShow] = useState(false)
  return (
    <div className={cn("space-y-1 w-full relative", className)}>
      {label && <label htmlFor={id} className="text-xs font-semibold text-muted-foreground uppercase">{label}</label>}
      <div className="relative">
        <input
          ref={ref}
          id={id}
          type={show ? 'text' : 'password'}
          className="w-full h-9 rounded-md border border-input bg-background pl-3 pr-10 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer focus:outline-none"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && <span className="text-[10px] font-bold text-destructive">{error}</span>}
    </div>
  )
})
PasswordInput.displayName = 'PasswordInput'

export const PhoneInput = React.forwardRef(({ label, error, className, id, ...props }, ref) => {
  return (
    <div className={cn("space-y-1 w-full", className)}>
      {label && <label htmlFor={id} className="text-xs font-semibold text-muted-foreground uppercase">{label}</label>}
      <div className="flex rounded-md shadow-sm">
        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm select-none">
          +1
        </span>
        <input
          ref={ref}
          id={id}
          type="tel"
          placeholder="(555) 000-0000"
          className="w-full h-9 rounded-r-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          {...props}
        />
      </div>
      {error && <span className="text-[10px] font-bold text-destructive">{error}</span>}
    </div>
  )
})
PhoneInput.displayName = 'PhoneInput'

export const CurrencyInput = React.forwardRef(({ label, error, className, id, symbol = "$", ...props }, ref) => {
  return (
    <div className={cn("space-y-1 w-full", className)}>
      {label && <label htmlFor={id} className="text-xs font-semibold text-muted-foreground uppercase">{label}</label>}
      <div className="relative rounded-md shadow-sm">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <span className="text-muted-foreground text-sm">{symbol}</span>
        </div>
        <input
          ref={ref}
          id={id}
          type="number"
          step="0.01"
          placeholder="0.00"
          className="w-full h-9 rounded-md border border-input bg-background pl-7 pr-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          {...props}
        />
      </div>
      {error && <span className="text-[10px] font-bold text-destructive">{error}</span>}
    </div>
  )
})
CurrencyInput.displayName = 'CurrencyInput'

export function FileUpload({ label, error, onFileSelect, className }) {
  const [file, setFile] = useState(null)
  
  const handleFileChange = (e) => {
    const selected = e.target.files[0]
    if (selected) {
      setFile(selected)
      if (onFileSelect) onFileSelect(selected)
    }
  }

  const clearFile = () => {
    setFile(null)
    if (onFileSelect) onFileSelect(null)
  }

  return (
    <div className={cn("space-y-2 w-full md:col-span-2", className)}>
      {label && <span className="text-xs font-semibold text-muted-foreground uppercase">{label}</span>}
      <div className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center bg-card hover:bg-muted/10 transition-colors relative">
        {file ? (
          <div className="flex items-center justify-between w-full gap-4">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-primary" />
              <div className="text-left">
                <div className="text-sm font-semibold text-foreground truncate max-w-[220px]">{file.name}</div>
                <div className="text-[10px] text-muted-foreground">{Math.round(file.size / 1024)} KB</div>
              </div>
            </div>
            <button 
              type="button" 
              onClick={clearFile}
              className="h-8 w-8 inline-flex items-center justify-center rounded-full hover:bg-muted cursor-pointer"
            >
              <X className="h-4 w-4 text-destructive" />
            </button>
          </div>
        ) : (
          <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full py-4 select-none">
            <Upload className="h-8 w-8 text-muted-foreground mb-2 group-hover:text-foreground" />
            <span className="text-sm font-semibold text-foreground">Click to upload file</span>
            <span className="text-[10px] text-muted-foreground mt-1">PDF, JPG, PNG (Max 2MB)</span>
            <input 
              type="file" 
              className="hidden" 
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png"
            />
          </label>
        )}
      </div>
      {error && <span className="text-[10px] font-bold text-destructive">{error}</span>}
    </div>
  )
}
