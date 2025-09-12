import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Rental, Book } from "@/lib/types";
import { Book as BookIcon, Clock, AlertTriangle, Heart, Trash2 } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("current");

  // Mock current user ID
  const currentUserId = "user1";

  const { data: rentals } = useQuery<Rental[]>({
    queryKey: ["/api/rentals", currentUserId],
    queryFn: async () => {
      const response = await fetch(`/api/rentals?userId=${currentUserId}`);
      if (!response.ok) throw new Error("Failed to fetch rentals");
      return response.json();
    },
  });

  const { data: books } = useQuery<Book[]>({
    queryKey: ["/api/books"],
  });

  const currentRentals = rentals?.filter(rental => rental.status === "active" || rental.status === "overdue") || [];
  const rentalHistory = rentals?.filter(rental => rental.status === "completed") || [];

  const stats = {
    activeRentals: currentRentals.length,
    totalRentals: rentals?.length || 0,
    dueSoon: currentRentals.filter(rental => {
      const dueDate = new Date(rental.dueDate);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return dueDate <= tomorrow;
    }).length,
    wishlist: 7, // Mock data
  };

  const getRentalBook = (bookId: string) => {
    return books?.find(book => book.id === bookId);
  };

  const getDaysUntilDue = (dueDate: Date) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const tabs = [
    { id: "current", label: "Current Rentals" },
    { id: "history", label: "Rental History" },
    { id: "wishlist", label: "Wishlist" },
    { id: "profile", label: "Profile Settings" },
  ];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold mb-2" data-testid="text-dashboard-title">My Dashboard</h2>
          <p className="text-muted-foreground">Manage your rentals and account settings</p>
        </div>
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <Link href="/catalog">
            <Button data-testid="button-browse-books">
              <BookIcon className="mr-2 h-4 w-4" />
              Browse Books
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <BookIcon className="text-blue-600 h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold" data-testid="stat-active-rentals">{stats.activeRentals}</p>
                <p className="text-muted-foreground text-sm">Active Rentals</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Clock className="text-green-600 h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold" data-testid="stat-total-rentals">{stats.totalRentals}</p>
                <p className="text-muted-foreground text-sm">Total Rentals</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <AlertTriangle className="text-yellow-600 h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold" data-testid="stat-due-soon">{stats.dueSoon}</p>
                <p className="text-muted-foreground text-sm">Due Soon</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Heart className="text-purple-600 h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold" data-testid="stat-wishlist">{stats.wishlist}</p>
                <p className="text-muted-foreground text-sm">Wishlist</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Dashboard Tabs */}
      <Card>
        <div className="border-b border-border">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant="ghost"
                className={`py-4 border-b-2 rounded-none ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setActiveTab(tab.id)}
                data-testid={`tab-${tab.id}`}
              >
                {tab.label}
              </Button>
            ))}
          </nav>
        </div>
        
        <CardContent className="p-6">
          {/* Current Rentals Tab */}
          {activeTab === "current" && (
            <div className="space-y-4">
              {currentRentals.map((rental) => {
                const book = getRentalBook(rental.bookId);
                if (!book) return null;
                
                const daysUntilDue = getDaysUntilDue(rental.dueDate);
                const isOverdue = daysUntilDue < 0;
                const isDueSoon = daysUntilDue <= 1 && daysUntilDue >= 0;
                
                return (
                  <div key={rental.id} className="flex items-center justify-between p-4 border border-border rounded-lg" data-testid={`rental-${rental.id}`}>
                    <div className="flex items-center space-x-4">
                      <img 
                        src={book.imageUrl || "/placeholder-book.jpg"} 
                        alt={`${book.title} cover`}
                        className="w-16 h-24 object-cover rounded"
                      />
                      <div>
                        <h4 className="font-semibold">{book.title}</h4>
                        <p className="text-sm text-muted-foreground">{book.author}</p>
                        <p className="text-sm text-muted-foreground">
                          Rented: {new Date(rental.rentalDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${
                        isOverdue ? "text-red-600" : isDueSoon ? "text-yellow-600" : ""
                      }`}>
                        Due: {new Date(rental.dueDate).toLocaleDateString()}
                      </p>
                      <p className={`text-xs ${
                        isOverdue ? "text-red-600" : isDueSoon ? "text-yellow-600" : "text-muted-foreground"
                      }`}>
                        {isOverdue ? "Overdue!" : isDueSoon ? "Due tomorrow!" : `${daysUntilDue} days left`}
                      </p>
                      <div className="flex space-x-2 mt-2">
                        <Button size="sm" data-testid={`button-extend-${rental.id}`}>Extend</Button>
                        <Button variant="secondary" size="sm" data-testid={`button-return-${rental.id}`}>Return</Button>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {currentRentals.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <BookIcon className="mx-auto h-12 w-12 mb-4" />
                  <p>No current rentals</p>
                </div>
              )}
            </div>
          )}
          
          {/* Rental History Tab */}
          {activeTab === "history" && (
            <div className="space-y-4">
              {rentalHistory.map((rental) => {
                const book = getRentalBook(rental.bookId);
                if (!book) return null;
                
                return (
                  <div key={rental.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <img 
                        src={book.imageUrl || "/placeholder-book.jpg"} 
                        alt={`${book.title} cover`}
                        className="w-16 h-24 object-cover rounded"
                      />
                      <div>
                        <h4 className="font-semibold">{book.title}</h4>
                        <p className="text-sm text-muted-foreground">{book.author}</p>
                        <p className="text-sm text-muted-foreground">
                          Rental Period: {new Date(rental.rentalDate).toLocaleDateString()} - {rental.returnDate ? new Date(rental.returnDate).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-green-100 text-green-800">Completed</Badge>
                      <p className="text-sm text-muted-foreground mt-1">★★★★★</p>
                    </div>
                  </div>
                );
              })}
              
              {rentalHistory.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="mx-auto h-12 w-12 mb-4" />
                  <p>No rental history</p>
                </div>
              )}
            </div>
          )}
          
          {/* Wishlist Tab */}
          {activeTab === "wishlist" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Mock wishlist items */}
              <div className="bg-background p-4 rounded-lg border border-border">
                <img 
                  src="https://images.unsplash.com/photo-1519904981063-b0cf448d479e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=280" 
                  alt="Book cover" 
                  className="w-full h-48 object-cover rounded mb-3"
                />
                <h4 className="font-semibold mb-1">The Silent Patient</h4>
                <p className="text-sm text-muted-foreground mb-2">Alex Michaelides</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-600">Available</span>
                  <div className="flex space-x-2">
                    <Button size="sm" data-testid="button-rent-wishlist">Rent</Button>
                    <Button variant="ghost" size="sm" data-testid="button-remove-wishlist">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="bg-background p-4 rounded-lg border border-border">
                <img 
                  src="https://images.unsplash.com/photo-1543002588-bfa74002ed7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=280" 
                  alt="Book cover" 
                  className="w-full h-48 object-cover rounded mb-3"
                />
                <h4 className="font-semibold mb-1">Where the Crawdads Sing</h4>
                <p className="text-sm text-muted-foreground mb-2">Delia Owens</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-yellow-600">Rented Out</span>
                  <div className="flex space-x-2">
                    <Button variant="secondary" size="sm">Notify</Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Profile Settings Tab */}
          {activeTab === "profile" && (
            <div className="max-w-2xl">
              <h3 className="text-lg font-semibold mb-6">Profile Settings</h3>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">First Name</label>
                    <Input defaultValue="John" data-testid="input-first-name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Last Name</label>
                    <Input defaultValue="Doe" data-testid="input-last-name" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <Input type="email" defaultValue="john.doe@example.com" data-testid="input-email" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Phone</label>
                  <Input type="tel" defaultValue="+1 (555) 123-4567" data-testid="input-phone" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Address</label>
                  <Textarea 
                    rows={3} 
                    defaultValue="123 Main Street, Anytown, NY 12345"
                    data-testid="textarea-address"
                  />
                </div>
                
                <div className="flex items-center space-x-4">
                  <Button type="submit" data-testid="button-save-profile">
                    Save Changes
                  </Button>
                  <Button type="button" variant="ghost">
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
