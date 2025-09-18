import React, { useState } from "react";
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
import { Bell, User, Settings, LogOut, ShoppingCart, Heart, Menu, MessageCircle } from "lucide-react";
import { useStore } from "@/lib/store-context";
import { useAuth } from "@/lib/auth-context";
import { ChatWidget } from "@/components/chat-widget";
import Logo from "@assets/logo-removebg-preview_1757943248494.png";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/hooks/use-notifications";

export function Header() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { cartCount, wishlistCount } = useStore();
  const { notifications, unreadCount, markAsRead } = useNotifications(); // Use the useNotifications hook

  // Use useAuth hook for login state and user data
  const { user, logout } = useAuth();
  const isLoggedIn = !!user;

  const isActive = (path: string) => location === path;

  const navigationItems = [
    { href: "/", label: "Home", testId: "nav-home" },
    { href: "/catalog", label: "Catalog", testId: "nav-catalog" },
    { href: "/about", label: "About", testId: "nav-about" },
    { href: "/contact", label: "Contact", testId: "nav-contact" },
  ];

  // Removed the local useEffect for localStorage check, as AuthContext should handle this.
  // The `user` object from AuthContext should already be populated.

  return (
    <header className="bg-card shadow-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/">
                <img
                  src={Logo}
                  alt="BookLoop"
                  className="h-20 w-auto cursor-pointer"
                  data-testid="logo"
                />
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
            {/* Action Icons - Always visible */}
            <div className="hidden sm:flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                data-testid="button-chat"
                onClick={() => setIsChatOpen(true)}
              >
                <MessageCircle className="h-5 w-5" />
              </Button>
              <Link href="/wishlist">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                  data-testid="button-wishlist"
                >
                  <Heart className="h-5 w-5" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                      {wishlistCount > 99 ? '99+' : wishlistCount}
                    </span>
                  )}
                </Button>
              </Link>
              <Link href="/cart">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                  data-testid="button-cart"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </Button>
              </Link>
              {isLoggedIn && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative"
                      data-testid="button-notifications"
                    >
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <Badge 
                          variant="destructive" 
                          className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
                        >
                          {unreadCount}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <div className="flex items-center justify-between p-2">
                      <h3 className="text-sm font-semibold">Notifications</h3>
                      {unreadCount > 0 && (
                        <Button 
                          variant="link" 
                          size="sm" 
                          className="h-auto p-0" 
                          onClick={() => {
                            notifications.forEach(notification => {
                              if (!notification.read) {
                                markAsRead(notification.id);
                              }
                            });
                          }}
                        >
                          Mark all as read
                        </Button>
                      )}
                    </div>
                    <DropdownMenuSeparator />
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <DropdownMenuItem key={notification.id} className="flex flex-col items-start py-2 cursor-pointer hover:bg-accent/50">
                          <div className="text-sm font-medium">{notification.title}</div>
                          <div className="text-xs text-muted-foreground">{notification.description}</div>
                          <div className="text-xs text-muted-foreground mt-1">{notification.timestamp}</div>
                        </DropdownMenuItem>
                      ))
                    ) : (
                      <DropdownMenuItem disabled className="text-center text-muted-foreground py-4">No new notifications</DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

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

            {/* Profile Menu - Show only when logged in */}
            {isLoggedIn && user && (
              <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center space-x-2 px-2 sm:px-3"
                  data-testid="button-profile-menu"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=32&h=32"} />
                    <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <span
                    className="text-sm font-medium hidden lg:inline"
                    data-testid="text-username"
                  >
                    {user.name}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user.name}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />

                {/* Mobile-only menu items */}
                <div className="sm:hidden">
                  <DropdownMenuItem 
                    className="cursor-pointer"
                    onClick={() => setIsChatOpen(true)}
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Chat with Us
                  </DropdownMenuItem>
                  <Link href="/wishlist">
                    <DropdownMenuItem className="cursor-pointer">
                      <Heart className="mr-2 h-4 w-4" />
                      Wishlist
                      {wishlistCount > 0 && (
                        <span className="ml-auto bg-primary text-primary-foreground text-xs rounded-full px-2 py-1">
                          {wishlistCount}
                        </span>
                      )}
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/cart">
                    <DropdownMenuItem className="cursor-pointer">
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Cart
                      {cartCount > 0 && (
                        <span className="ml-auto bg-primary text-primary-foreground text-xs rounded-full px-2 py-1">
                          {cartCount}
                        </span>
                      )}
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/notifications">
                    <DropdownMenuItem className="cursor-pointer">
                      <Bell className="mr-2 h-4 w-4" />
                      Notifications
                      {unreadCount > 0 && (
                        <Badge 
                          variant="destructive" 
                          className="ml-auto h-5 w-5 p-0 text-xs flex items-center justify-center"
                        >
                          {unreadCount}
                        </Badge>
                      )}
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                </div>

                <Link href={user.role === "admin" ? "/admin" : "/profile"}>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    data-testid="menu-profile"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                </Link>

                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer text-red-600 focus:text-red-600"
                  onClick={() => {
                    logout(); // Use logout from AuthContext
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
                  {isLoggedIn && user && (
                    <div className="flex items-center space-x-2 pb-4 border-b">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=32&h=32"} />
                        <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
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

                  <div className="pt-4 border-t space-y-2">
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        setIsOpen(false);
                        setIsChatOpen(true);
                      }}
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Chat with Us
                    </Button>
                    <Link href="/wishlist">
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => setIsOpen(false)}
                      >
                        <Heart className="mr-2 h-4 w-4" />
                        Wishlist
                        {wishlistCount > 0 && (
                          <span className="ml-auto bg-primary text-primary-foreground text-xs rounded-full px-2 py-1">
                            {wishlistCount}
                          </span>
                        )}
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
                        {cartCount > 0 && (
                          <span className="ml-auto bg-primary text-primary-foreground text-xs rounded-full px-2 py-1">
                            {cartCount}
                          </span>
                        )}
                      </Button>
                    </Link>
                    {isLoggedIn && (
                      <>
                        <Link href="/notifications">
                          <Button variant="ghost" className="w-full justify-start">
                            <Bell className="mr-2 h-4 w-4" />
                            Notifications
                            {unreadCount > 0 && (
                              <Badge 
                                variant="destructive" 
                                className="ml-auto h-5 w-5 p-0 text-xs flex items-center justify-center"
                              >
                                {unreadCount}
                              </Badge>
                            )}
                          </Button>
                        </Link>
                        <Link href={user.role === "admin" ? "/admin" : "/profile"}>
                          <Button
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => setIsOpen(false)}
                          >
                            <User className="mr-2 h-4 w-4" />
                            Profile
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
                            logout(); // Use logout from AuthContext
                            setIsOpen(false);
                          }}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Sign Out
                        </Button>
                      </>
                    )}
                  </div>

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
      <ChatWidget 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
      />
    </header>
  );
}