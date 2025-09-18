
import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, X } from "lucide-react"
import { useNotifications } from "@/hooks/use-notifications"

interface NotificationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NotificationDialog({ open, onOpenChange }: NotificationDialogProps) {
  const { notifications, unreadCount, markAsRead, clearAll } = useNotifications()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
              {unreadCount > 0 && (
                <Badge variant="destructive" className="rounded-full">
                  {unreadCount}
                </Badge>
              )}
            </div>
            {notifications.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAll}
                className="text-xs"
              >
                Clear All
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="overflow-y-auto max-h-[60vh]">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                    notification.read 
                      ? 'bg-gray-50 border-gray-200' 
                      : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                  }`}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm mb-1">
                        {notification.title}
                      </h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        {notification.description}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {notification.timestamp}
                      </span>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
