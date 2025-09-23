
import * as React from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

interface CustomAlertProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  message: string
  confirmText?: string
  onConfirm?: () => void
}

export function CustomAlert({ 
  open, 
  onOpenChange, 
  title, 
  message, 
  confirmText = "OK",
  onConfirm 
}: CustomAlertProps) {
  if (!open) return null

  const handleConfirm = () => {
    onConfirm?.()
    onOpenChange(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />
      
      {/* Alert Dialog */}
      <div className="relative bg-white rounded-lg shadow-xl p-6 mx-4 max-w-sm w-full animate-in fade-in zoom-in duration-300">
        {/* Close Button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Content */}
        <div className="text-center space-y-4">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900">
              {title}
            </h3>
          )}
          
          <p className="text-gray-600 text-sm leading-relaxed">
            {message}
          </p>

          {/* Confirm Button */}
          <button
            onClick={handleConfirm}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors duration-200"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

// Success Alert Variant
export function SuccessAlert({ 
  open, 
  onOpenChange, 
  message, 
  confirmText = "OK" 
}: Omit<CustomAlertProps, 'title'>) {
  return (
    <CustomAlert
      open={open}
      onOpenChange={onOpenChange}
      title="localhost:5000 says"
      message={message}
      confirmText={confirmText}
    />
  )
}
