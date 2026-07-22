import React, { useState } from 'react'
import { FileText, Image as ImageIcon, Download, Eye, ExternalLink, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Avatar({ src, name, size = 'md', className }) {
  const initials = name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U'
  return (
    <div className={cn(
      "rounded-full bg-primary/10 border border-border flex items-center justify-center font-bold text-primary shrink-0 select-none overflow-hidden",
      {
        'h-8 w-8 text-xs': size === 'sm',
        'h-10 w-10 text-sm': size === 'md',
        'h-14 w-14 text-lg': size === 'lg',
      },
      className
    )}>
      {src ? (
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        initials
      )}
    </div>
  )
}

export function AvatarGroup({ avatars = [], max = 4 }) {
  const visible = avatars.slice(0, max)
  const remainder = avatars.length - max

  return (
    <div className="flex -space-x-2 overflow-hidden">
      {visible.map((av, i) => (
        <Avatar 
          key={i} 
          src={av.src} 
          name={av.name} 
          size="sm" 
          className="ring-2 ring-background border-none" 
        />
      ))}
      {remainder > 0 && (
        <div className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0 select-none">
          +{remainder}
        </div>
      )}
    </div>
  )
}

export function ImageViewer({ src, isOpen, onClose }) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={onClose} className="fixed inset-0 bg-background/90 backdrop-blur-sm animate-in fade-in duration-200" />
      <div className="relative max-w-3xl max-h-[85vh] z-10 animate-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute -top-10 right-0 h-8 w-8 inline-flex items-center justify-center bg-card text-foreground hover:bg-muted border border-border rounded-full cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
        <img src={src} alt="Viewer zoom" className="max-h-[80vh] max-w-full rounded border border-border shadow-lg object-contain" />
      </div>
    </div>
  )
}

export function FileCard({ name, size, type, url, onPreview }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card shadow-sm gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-10 w-10 rounded bg-primary/10 text-primary flex items-center justify-center shrink-0">
          {type === 'pdf' ? <FileText className="h-5 w-5" /> : <ImageIcon className="h-5 w-5" />}
        </div>
        <div className="space-y-0.5 min-w-0">
          <div className="text-xs font-semibold text-foreground truncate max-w-[150px] sm:max-w-[200px]" title={name}>
            {name}
          </div>
          {size && <div className="text-[10px] text-muted-foreground">{size}</div>}
        </div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {onPreview && (
          <button 
            onClick={onPreview}
            className="h-8 w-8 inline-flex items-center justify-center rounded border border-border bg-card text-foreground hover:bg-muted cursor-pointer transition-colors"
            title="Preview File"
          >
            <Eye className="h-4 w-4" />
          </button>
        )}
        {url && (
          <a 
            href={url} 
            download 
            target="_blank"
            rel="noreferrer"
            className="h-8 w-8 inline-flex items-center justify-center rounded border border-border bg-card text-foreground hover:bg-muted cursor-pointer transition-colors"
            title="Download File"
          >
            <Download className="h-4 w-4" />
          </a>
        )}
      </div>
    </div>
  )
}

export function PDFPreview({ src, title = "PDF Viewer" }) {
  return (
    <div className="border border-border rounded overflow-hidden bg-muted w-full h-[500px]">
      <object data={src} type="application/pdf" className="h-full w-full">
        <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-4">
          <FileText className="h-12 w-12 text-muted-foreground" />
          <div>
            <h5 className="font-semibold text-foreground text-sm">Cannot Render PDF Preview Inline</h5>
            <p className="text-xs text-muted-foreground mt-1">Your browser does not support embedded PDF objects.</p>
          </div>
          <a 
            href={src} 
            target="_blank" 
            rel="noreferrer" 
            className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
          >
            Open in new tab <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </object>
    </div>
  )
}
