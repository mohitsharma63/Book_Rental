import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  Clock, 
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  MessageCircle,
  Tag,
  FolderOpen,
  Image
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "books", label: "Books", icon: BookOpen },
  { id: "categories", label: "Categories", icon: Tag },
  { id: "sliders", label: "Sliders", icon: Image },
  { id: "users", label: "Users", icon: Users },
  { id: "rentals", label: "Rentals", icon: Clock },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "contact", label: "Contact Us", icon: MessageCircle },
];

function SidebarContent({ activeTab, onTabChange, onClose }: { 
  activeTab: string; 
  onTabChange: (tab: string) => void;
  onClose?: () => void;
}) {
  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">BookWise</h1>
            <p className="text-sm text-gray-600">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              className="w-full justify-start px-4 py-3 h-auto"
              onClick={() => {
                onTabChange(item.id);
                onClose?.();
              }}
            >
              <Icon className="h-5 w-5 mr-3" />
              <span className="text-base">{item.label}</span>
            </Button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <Button
          variant="ghost"
          className="w-full justify-start px-4 py-3 h-auto text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={() => {
            localStorage.removeItem("user");
            window.location.href = "/";
          }}
        >
          <LogOut className="h-5 w-5 mr-3" />
          <span className="text-base">Sign Out</span>
        </Button>
      </div>
    </div>
  );
}

export function AdminSidebar({ activeTab, onTabChange }: AdminSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Sidebar */}
      <div className="lg:hidden">
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="fixed top-4 left-4 z-50 bg-white shadow-md border"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-80">
            <SidebarContent 
              activeTab={activeTab} 
              onTabChange={onTabChange}
              onClose={() => setIsMobileOpen(false)}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className={`hidden lg:flex bg-white border-r border-gray-200 transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      } min-h-screen flex-col`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold text-gray-900">BookLoop</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2"
            >
              {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start ${isCollapsed ? 'px-2' : 'px-4'}`}
                onClick={() => onTabChange(item.id)}
              >
                <Icon className={`h-4 w-4 ${isCollapsed ? '' : 'mr-2'}`} />
                {!isCollapsed && <span>{item.label}</span>}
              </Button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <Button
            variant="ghost"
            className={`w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 ${
              isCollapsed ? 'px-2' : 'px-4'
            }`}
            onClick={() => {
              localStorage.removeItem("user");
              window.location.href = "/";
            }}
          >
            <LogOut className={`h-4 w-4 ${isCollapsed ? '' : 'mr-2'}`} />
            {!isCollapsed && <span>Sign Out</span>}
          </Button>
        </div>
      </div>
    </>
  );
}