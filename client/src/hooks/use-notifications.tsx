
import { useState, useCallback } from 'react'

export interface Notification {
  id: string
  title: string
  description: string
  timestamp: string
  read?: boolean
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: "New Book Available",
      description: "Check out the latest mystery novel",
      timestamp: "2 minutes ago",
      read: false
    },
    {
      id: '2',
      title: "Return Reminder", 
      description: "Your book is due tomorrow",
      timestamp: "1 hour ago",
      read: false
    }
  ])

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const newNotification = {
      ...notification,
      id: Date.now().toString()
    }
    setNotifications(prev => [newNotification, ...prev])
  }, [])

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    )
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    clearAll
  }
}
