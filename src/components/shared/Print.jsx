import React from 'react'
import { cn } from '@/lib/utils'

export function PrintableTable({ columns = [], data = [], className }) {
  return (
    <div className={cn("w-full overflow-x-auto print:overflow-visible print:w-full print:block", className)}>
      <table className="w-full border-collapse border border-black text-left text-xs font-serif text-black print:text-black">
        <thead>
          <tr className="bg-slate-100 border-b border-black">
            {columns.map((col, i) => (
              <th key={i} className="border-r border-black px-3 py-2 font-bold uppercase">{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-black hover:bg-slate-55 print:hover:bg-transparent">
              {columns.map((col, colIndex) => {
                const value = typeof col.accessor === 'function' ? col.accessor(row) : row[col.accessor]
                return (
                  <td key={colIndex} className="border-r border-black px-3 py-1.5">{value}</td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function PrintableReportLayout({ title, academicYear = "2026-2027", children, className }) {
  return (
    <div className={cn(
      "w-full bg-white text-black p-8 font-serif leading-relaxed max-w-4xl mx-auto print:p-0 print:m-0 print:max-w-full",
      className
    )}>
      {/* Printable Letterhead Banner */}
      <div className="flex flex-col items-center justify-center border-b-2 border-double border-black pb-4 mb-6 text-center">
        <h2 className="text-2xl font-black uppercase tracking-wider">Metropolitan Academy of Sciences</h2>
        <p className="text-xs italic text-slate-700">12th Boulevard, Campus Center, NY | Tel: +1 415-555-0199</p>
        <div className="mt-2 inline-block border border-black px-3 py-1 text-xs font-bold uppercase">
          Academic Report: {title} | Term Year: {academicYear}
        </div>
      </div>

      {/* Main content slot */}
      <div className="w-full min-h-[400px]">{children}</div>

      {/* Printable Signatures footer */}
      <div className="mt-12 grid grid-cols-3 gap-8 text-center pt-8 border-t border-slate-300">
        <div>
          <div className="border-b border-black mx-auto w-32 h-6" />
          <span className="text-[10px] uppercase font-bold block mt-1">Class Tutor</span>
        </div>
        <div>
          <div className="border-b border-black mx-auto w-32 h-6" />
          <span className="text-[10px] uppercase font-bold block mt-1">Exam Registrar</span>
        </div>
        <div>
          <div className="border-b border-black mx-auto w-32 h-6" />
          <span className="text-[10px] uppercase font-bold block mt-1">Institutional Principal</span>
        </div>
      </div>
    </div>
  )
}

export function PrintableCertificateLayout({ title = "CERTIFICATE", recipientName, subtitle, description, issueDate }) {
  return (
    <div className="w-full bg-white text-black border-[12px] border-double border-amber-800 p-12 max-w-4xl mx-auto text-center font-serif relative flex flex-col justify-between min-h-[450px] shadow-lg print:border-amber-800 print:shadow-none">
      {/* Corner decorations */}
      <div className="absolute top-2 left-2 border-t-2 border-l-2 border-amber-800 h-6 w-6" />
      <div className="absolute top-2 right-2 border-t-2 border-r-2 border-amber-800 h-6 w-6" />
      <div className="absolute bottom-2 left-2 border-b-2 border-l-2 border-amber-800 h-6 w-6" />
      <div className="absolute bottom-2 right-2 border-b-2 border-r-2 border-amber-800 h-6 w-6" />

      <div className="space-y-4">
        <h2 className="text-3xl font-extrabold tracking-widest text-amber-900 uppercase">Certificate of Excellence</h2>
        <p className="text-xs italic text-slate-700">{subtitle || "This is proudly presented to"}</p>
        
        <div className="py-2">
          <h3 className="text-2xl font-bold border-b border-amber-800 inline-block px-12 capitalize">{recipientName}</h3>
        </div>

        <p className="text-sm text-slate-800 max-w-xl mx-auto leading-relaxed mt-4">
          {description || "For outstanding academic performance and dedicated service within the school curriculum for the academic school term."}
        </p>
      </div>

      <div className="flex justify-between items-end mt-12 px-8">
        <div className="text-left text-xs">
          <div>Date: {issueDate || new Date().toLocaleDateString()}</div>
          <span className="text-[9px] uppercase font-bold text-slate-500">Record Verification Logs</span>
        </div>
        <div className="text-center">
          <div className="border-b border-black w-28 h-5 mx-auto" />
          <span className="text-[9px] uppercase font-bold text-slate-500">Official Signature Seal</span>
        </div>
      </div>
    </div>
  )
}
