import React, { useState } from 'react'
import { Copy, Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export function CopyButton({ text, className }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={handleCopy}
      className={cn(
        "h-8 w-8 inline-flex items-center justify-center rounded border border-border bg-card text-foreground hover:bg-muted cursor-pointer transition-colors shrink-0",
        className
      )}
      title="Copy to clipboard"
    >
      {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
    </button>
  )
}

export function Tooltip({ text, children, className }) {
  const [visible, setVisible] = useState(false)
  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div className={cn(
          "absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 rounded bg-slate-900 text-slate-100 text-[10px] font-medium whitespace-nowrap z-50 shadow-md animate-in fade-in slide-in-from-bottom-1 duration-150",
          className
        )}>
          {text}
        </div>
      )}
    </div>
  )
}

export function Popover({ trigger, children, className }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative inline-block">
      <div onClick={() => setOpen(!open)} className="cursor-pointer">{trigger}</div>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className={cn(
            "absolute left-1/2 -translate-x-1/2 mt-1.5 bg-card border border-border rounded-lg p-3 shadow-md z-40 max-w-sm w-56 animate-in fade-in duration-100",
            className
          )}>
            {children}
          </div>
        </>
      )}
    </div>
  )
}

export function Accordion({ items = [], className }) {
  const [openIndex, setOpenIndex] = useState(null)
  const toggle = (i) => setOpenIndex(openIndex === i ? null : i)

  return (
    <div className={cn("space-y-2 w-full", className)}>
      {items.map((it, i) => {
        const isOpen = openIndex === i
        return (
          <div key={i} className="border border-border rounded-md bg-card overflow-hidden">
            <button
              onClick={() => toggle(i)}
              className="flex w-full items-center justify-between p-4 font-semibold text-sm text-foreground text-left focus:outline-none cursor-pointer"
            >
              <span>{it.title}</span>
              <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform duration-200", isOpen && "rotate-180")} />
            </button>
            {isOpen && (
              <div className="p-4 pt-0 text-sm text-muted-foreground border-t border-border/50 animate-in slide-in-from-top-1 duration-100">
                {it.content}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export function Timeline({ events = [], className }) {
  return (
    <div className={cn("relative border-l border-border pl-6 space-y-6 ml-3 py-2", className)}>
      {events.map((ev, i) => (
        <div key={i} className="relative">
          <div className="absolute -left-[31px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-background bg-primary" />
          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{ev.time}</span>
            <h5 className="font-bold text-sm text-foreground">{ev.title}</h5>
            {ev.description && <p className="text-xs text-muted-foreground">{ev.description}</p>}
          </div>
        </div>
      ))}
    </div>
  )
}

export function CalendarLayout({ events = [], monthName = "Academic Month" }) {
  const days = Array.from({ length: 35 }, (_, i) => i - 3) // Mock calendar offsets
  return (
    <div className="border border-border rounded-lg bg-card overflow-hidden">
      <div className="bg-primary/5 p-4 border-b border-border flex items-center justify-between">
        <h4 className="font-bold text-foreground text-sm">{monthName}</h4>
        <span className="text-xs text-muted-foreground">Monthly Events schedule</span>
      </div>
      <div className="grid grid-cols-7 border-b border-border bg-muted/30 text-center py-2 text-xs font-bold text-muted-foreground select-none">
        <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
      </div>
      <div className="grid grid-cols-7 grid-rows-5 h-80 text-xs">
        {days.map((day, i) => {
          const isCurrentMonth = day > 0 && day <= 30
          const event = isCurrentMonth && events.find(e => e.day === day)
          return (
            <div 
              key={i} 
              className={cn(
                "border-r border-b border-border/60 p-1 flex flex-col justify-between min-h-[50px] relative hover:bg-muted/10 transition-colors",
                !isCurrentMonth && "bg-muted/10 text-muted-foreground/30"
              )}
            >
              <span className={cn("font-medium", isCurrentMonth ? "text-foreground" : "text-muted-foreground")}>
                {isCurrentMonth ? day : day <= 0 ? 30 + day : day - 30}
              </span>
              {event && (
                <div className="bg-primary text-primary-foreground p-0.5 rounded text-[9px] truncate tracking-tight font-bold select-none cursor-pointer" title={event.title}>
                  {event.title}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function ActivityList({ activities = [] }) {
  return (
    <div className="space-y-4">
      {activities.map((act, i) => (
        <div key={i} className="flex gap-3 pb-3 border-b border-border/50 last:border-none last:pb-0">
          <div className="h-8 w-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center shrink-0 text-xs font-semibold uppercase">
            {act.user?.charAt(0) || 'U'}
          </div>
          <div className="space-y-0.5 flex-1 min-w-0">
            <p className="text-xs text-foreground font-semibold truncate">
              {act.user} <span className="font-normal text-muted-foreground">{act.action}</span>
            </p>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] text-muted-foreground">{act.time}</span>
              {act.status && (
                <span className="text-[9px] font-bold text-primary uppercase">{act.status}</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
