import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell } from "lucide-react";

export function Header() {
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  return (
    <header className="bg-card shadow-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/">
                <h1 className="text-2xl font-bold text-primary cursor-pointer" data-testid="logo">
                  BookWise
                </h1>
              </Link>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link href="/">
                <Button
                  variant="ghost"
                  className={`${
                    isActive("/") 
                      ? "nav-active" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  data-testid="nav-home"
                >
                  Home
                </Button>
              </Link>
              <Link href="/catalog">
                <Button
                  variant="ghost"
                  className={`${
                    isActive("/catalog") 
                      ? "nav-active" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  data-testid="nav-catalog"
                >
                  Catalog
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button
                  variant="ghost"
                  className={`${
                    isActive("/dashboard") 
                      ? "nav-active" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  data-testid="nav-dashboard"
                >
                  Dashboard
                </Button>
              </Link>
              <Link href="/admin">
                <Button
                  variant="ghost"
                  className={`${
                    isActive("/admin") 
                      ? "nav-active" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  data-testid="nav-admin"
                >
                  Admin
                </Button>
              </Link>
            </div>
          </nav>
          
          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" data-testid="button-notifications">
              <Bell className="h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-2">
              <Avatar>
                <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=32&h=32" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium" data-testid="text-username">John Doe</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
