import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Bell, User, Settings, LayoutDashboard, LogOut, ShoppingCart, Heart, Menu } from "lucide-react";
import { useState, useEffect } from "react";

export function Header() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  
  // Login state management
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState({
    name: "",
    email: "",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=32&h=32"
  });

  // Check localStorage for user data on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        if (userData.isLoggedIn) {
          setIsLoggedIn(true);
          setCurrentUser({
            name: userData.name,
            email: userData.email,
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=32&h=32"
          });
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, [location]); // Re-check when location changes

  const isActive = (path: string) => location === path;

  const navigationItems = [
    { href: "/", label: "Home", testId: "nav-home" },
    { href: "/catalog", label: "Catalog", testId: "nav-catalog" },
    { href: "/about", label: "About", testId: "nav-about" },
    { href: "/contact", label: "Contact", testId: "nav-contact" },
  ];

  return (
    <header className="bg-card shadow-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/">
                <h1
                  className="text-xl sm:text-2xl font-bold text-primary cursor-pointer"
                  data-testid="logo"
                >
                  BookWise
                </h1>
              </Link>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navigationItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    className={`${
                      isActive(item.href)
                        ? "nav-active"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    data-testid={item.testId}
                  >
                    {item.label}
                  </Button>
                </Link>
              ))}
            </div>
          </nav>

          {/* Right Side - Icons and Profile */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Auth Buttons - Show when not logged in */}
            {!isLoggedIn && (
              <div className="hidden sm:flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
            
            {/* Action Icons - Show when logged in */}
            {isLoggedIn && (
              <div className="hidden sm:flex items-center space-x-2">
                <Link href="/wishlist">
                  <Button
                    variant="ghost"
                    size="icon"
                    data-testid="button-wishlist"
                  >
                    <Heart className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/cart">
                  <Button
                    variant="ghost"
                    size="icon"
                    data-testid="button-cart"
                  >
                    <ShoppingCart className="h-5 w-5" />
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  data-testid="button-notifications"
                >
                  <Bell className="h-5 w-5" />
                </Button>
              </div>
            )}

            {/* Profile Menu - Show only when logged in */}
            {isLoggedIn && (
              <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center space-x-2 px-2 sm:px-3"
                  data-testid="button-profile-menu"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={currentUser.avatar} />
                    <AvatarFallback>{currentUser.name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <span
                    className="text-sm font-medium hidden lg:inline"
                    data-testid="text-username"
                  >
                    {currentUser.name}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{currentUser.name}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {currentUser.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                
                {/* Mobile-only menu items */}
                <div className="sm:hidden">
                  <Link href="/wishlist">
                    <DropdownMenuItem className="cursor-pointer">
                      <Heart className="mr-2 h-4 w-4" />
                      Wishlist
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/cart">
                    <DropdownMenuItem className="cursor-pointer">
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Cart
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem className="cursor-pointer">
                    <Bell className="mr-2 h-4 w-4" />
                    Notifications
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </div>
                
                <Link href={JSON.parse(localStorage.getItem("user") || "{}").role === "admin" ? "/admin" : "/dashboard"}>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    data-testid="menu-dashboard"
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer text-red-600 focus:text-red-600"
                  onClick={() => {
                    localStorage.removeItem("user");
                    setIsLoggedIn(false);
                    setCurrentUser({
                      name: "",
                      email: "",
                      avatar: ""
                    });
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            )}

            {/* Mobile Menu Button */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  data-testid="mobile-menu-trigger"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col space-y-4 mt-6">
                  {isLoggedIn && (
                    <div className="flex items-center space-x-2 pb-4 border-b">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={currentUser.avatar} />
                        <AvatarFallback>{currentUser.name?.charAt(0) || "U"}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{currentUser.name}</p>
                        <p className="text-sm text-muted-foreground">{currentUser.email}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Navigation Links */}
                  {navigationItems.map((item) => (
                    <Link key={item.href} href={item.href}>
                      <Button
                        variant="ghost"
                        className={`w-full justify-start ${
                          isActive(item.href) ? "bg-primary/10 text-primary" : ""
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        {item.label}
                      </Button>
                    </Link>
                  ))}
                  
                  {isLoggedIn && (
                    <div className="pt-4 border-t space-y-2">
                      <Link href="/wishlist">
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => setIsOpen(false)}
                        >
                          <Heart className="mr-2 h-4 w-4" />
                          Wishlist
                        </Button>
                      </Link>
                      <Link href="/cart">
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => setIsOpen(false)}
                        >
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          Cart
                        </Button>
                      </Link>
                      <Button variant="ghost" className="w-full justify-start">
                        <Bell className="mr-2 h-4 w-4" />
                        Notifications
                      </Button>
                      <Link href={JSON.parse(localStorage.getItem("user") || "{}").role === "admin" ? "/admin" : "/dashboard"}>
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => setIsOpen(false)}
                        >
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          Dashboard
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start"
                        onClick={() => setIsOpen(false)}
                      >
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start"
                        onClick={() => setIsOpen(false)}
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-50"
                        onClick={() => {
                          localStorage.removeItem("user");
                          setIsLoggedIn(false);
                          setCurrentUser({
                            name: "",
                            email: "",
                            avatar: ""
                          });
                          setIsOpen(false);
                        }}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </Button>
                    </div>
                  )}
                  
                  {!isLoggedIn && (
                    <div className="pt-4 border-t space-y-2">
                      <Link href="/login">
                        <Button
                          className="w-full"
                          onClick={() => setIsOpen(false)}
                        >
                          Sign In
                        </Button>
                      </Link>
                      <Link href="/signup">
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => setIsOpen(false)}
                        >
                          Sign Up
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
