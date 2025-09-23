
import { useState, useCallback } from 'react'

interface AlertOptions {
  title?: string
  message: string
  confirmText?: string
  onConfirm?: () => void
}

export function useCustomAlert() {
  const [alert, setAlert] = useState<(AlertOptions & { open: boolean }) | null>(null)

  const showAlert = useCallback((options: AlertOptions) => {
    setAlert({ ...options, open: true })
  }, [])

  const hideAlert = useCallback(() => {
    setAlert(prev => prev ? { ...prev, open: false } : null)
  }, [])

  const showSuccessAlert = useCallback((message: string, confirmText = "OK") => {
    showAlert({
      title: "localhost:5000 says",
      message,
      confirmText
    })
  }, [showAlert])

  return {
    alert,
    showAlert,
    hideAlert,
    showSuccessAlert
  }
}
