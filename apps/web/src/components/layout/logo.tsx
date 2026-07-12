import React from 'react'

export function Logo() {
  return (
    <div className="flex items-center gap-2.5 select-none">
      <div className="w-7 h-7 rounded bg-brand-600 flex items-center justify-center shadow-[0_0_12px_rgba(37,99,235,0.4)] overflow-hidden">
        {/* Added a subtle internal geometric shape to make the square feel more like a real logo mark */}
        <div className="w-3 h-3 bg-white rounded-sm rotate-45" />
      </div>
      <div className="text-xl font-bold tracking-tight">
        <span className="text-brand-500">Auto</span>
        <span className="text-white">state</span>
      </div>
    </div>
  )
}
