import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Book, Rental } from "@/lib/types";
import { BookIcon, Users, Clock, AlertTriangle, Search, Filter, Plus } from "lucide-react";

export default function Admin() {
  const [activeTab, setActiveTab] = useState("books");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const { data: books } = useQuery<Book[]>({
    queryKey: ["/api/books"],
  });

  const { data: rentals } = useQuery<Rental[]>({
    queryKey: ["/api/rentals"],
  });

  const stats = {
    totalBooks: books?.length || 0,
    activeUsers: 456, // Mock data
    activeRentals: rentals?.filter(r => r.status === "active").length || 0,
    overdue: rentals?.filter(r => r.status === "overdue").length || 0,
  };

  const mockUsers = [
    {
      id: "user1",
      name: "John Doe",
      email: "john.doe@example.com",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=32&h=32",
      status: "Active",
      activeRentals: 3,
      joinDate: "Jan 15, 2024",
    },
    {
      id: "user2",
      name: "Jane Smith",
      email: "jane.smith@example.com",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616c9e92e4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=32&h=32",
      status: "Active",
      activeRentals: 1,
      joinDate: "Feb 3, 2024",
    },
  ];

  const mockRentalData = rentals?.map(rental => {
    const book = books?.find(b => b.id === rental.bookId);
    return {
      ...rental,
      bookTitle: book?.title || "Unknown Book",
      userName: "John Doe", // Mock data
    };
  }) || [];

  const tabs = [
    { id: "books", label: "Book Management" },
    { id: "users", label: "User Management" },
    { id: "rentals", label: "Rental Tracking" },
    { id: "analytics", label: "Analytics" },
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "available":
        return "bg-green-100 text-green-800";
      case "rented":
        return "bg-yellow-100 text-yellow-800";
      case "active":
        return "bg-green-100 text-green-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold mb-2" data-testid="text-admin-title">Admin Dashboard</h2>
          <p className="text-muted-foreground">Manage books, users, and rental operations</p>
        </div>
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <Button data-testid="button-add-book">
            <Plus className="mr-2 h-4 w-4" />
            Add New Book
          </Button>
        </div>
      </div>
      
      {/* Admin Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <BookIcon className="text-blue-600 h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold" data-testid="stat-total-books">{stats.totalBooks}</p>
                <p className="text-muted-foreground text-sm">Total Books</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="text-green-600 h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold" data-testid="stat-active-users">{stats.activeUsers}</p>
                <p className="text-muted-foreground text-sm">Active Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="text-yellow-600 h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold" data-testid="stat-admin-active-rentals">{stats.activeRentals}</p>
                <p className="text-muted-foreground text-sm">Active Rentals</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertTriangle className="text-red-600 h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold" data-testid="stat-overdue">{stats.overdue}</p>
                <p className="text-muted-foreground text-sm">Overdue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Admin Tabs */}
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
                data-testid={`admin-tab-${tab.id}`}
              >
                {tab.label}
              </Button>
            ))}
          </nav>
        </div>
        
        <CardContent className="p-6">
          {/* Book Management Tab */}
          {activeTab === "books" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Book Inventory</h3>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Search books..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4"
                      data-testid="input-search-books"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  </div>
                  <Button data-testid="button-filter-books">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Book</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {books?.slice(0, 5).map((book) => (
                      <TableRow key={book.id} data-testid={`row-book-${book.id}`}>
                        <TableCell>
                          <div className="flex items-center">
                            <img 
                              src={book.imageUrl || "/placeholder-book.jpg"} 
                              alt={`${book.title} cover`}
                              className="w-10 h-14 object-cover rounded mr-3"
                            />
                            <div>
                              <div className="text-sm font-medium text-foreground">{book.title}</div>
                              <div className="text-sm text-muted-foreground">{book.author}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{book.category}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(book.availableCopies > 0 ? "Available" : "Rented")}>
                            {book.availableCopies > 0 ? "Available" : "Rented"}
                          </Badge>
                        </TableCell>
                        <TableCell>${book.pricePerWeek}/week</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800" data-testid={`button-edit-${book.id}`}>
                              Edit
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800" data-testid={`button-delete-${book.id}`}>
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
          
          {/* User Management Tab */}
          {activeTab === "users" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">User Management</h3>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Search users..."
                      className="pl-10 pr-4"
                      data-testid="input-search-users"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Active Rentals</TableHead>
                      <TableHead>Join Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockUsers.map((user) => (
                      <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                        <TableCell>
                          <div className="flex items-center">
                            <img 
                              src={user.avatar} 
                              alt={`${user.name} avatar`}
                              className="w-8 h-8 rounded-full mr-3"
                            />
                            <div>
                              <div className="text-sm font-medium text-foreground">{user.name}</div>
                              <div className="text-sm text-muted-foreground">{user.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(user.status)}>
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.activeRentals}</TableCell>
                        <TableCell className="text-muted-foreground">{user.joinDate}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800" data-testid={`button-view-user-${user.id}`}>
                              View
                            </Button>
                            <Button variant="ghost" size="sm" className="text-yellow-600 hover:text-yellow-800" data-testid={`button-suspend-user-${user.id}`}>
                              Suspend
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
          
          {/* Rental Tracking Tab */}
          {activeTab === "rentals" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Rental Tracking</h3>
                <div className="flex items-center space-x-4">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40" data-testid="select-rental-filter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Rentals</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rental ID</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Book</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockRentalData.slice(0, 5).map((rental) => (
                      <TableRow key={rental.id} data-testid={`row-rental-${rental.id}`}>
                        <TableCell className="font-medium">#{rental.id.slice(0, 8)}</TableCell>
                        <TableCell>{rental.userName}</TableCell>
                        <TableCell>{rental.bookTitle}</TableCell>
                        <TableCell className={rental.status === "overdue" ? "text-red-600" : ""}>
                          {new Date(rental.dueDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(rental.status)}>
                            {rental.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            {rental.status === "overdue" ? (
                              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800" data-testid={`button-remind-${rental.id}`}>
                                Send Reminder
                              </Button>
                            ) : (
                              <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800" data-testid={`button-extend-rental-${rental.id}`}>
                                Extend
                              </Button>
                            )}
                            <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-800" data-testid={`button-return-rental-${rental.id}`}>
                              Return
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
          
          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <div>
              <h3 className="text-lg font-semibold mb-6">Analytics & Reports</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-background p-6 rounded-lg border border-border">
                  <h4 className="font-semibold mb-2">Monthly Revenue</h4>
                  <p className="text-3xl font-bold text-primary" data-testid="text-revenue">$12,456</p>
                  <p className="text-sm text-green-600">↑ 15% from last month</p>
                </div>
                
                <div className="bg-background p-6 rounded-lg border border-border">
                  <h4 className="font-semibold mb-2">Popular Genre</h4>
                  <p className="text-3xl font-bold text-primary" data-testid="text-popular-genre">Fiction</p>
                  <p className="text-sm text-muted-foreground">45% of all rentals</p>
                </div>
                
                <div className="bg-background p-6 rounded-lg border border-border">
                  <h4 className="font-semibold mb-2">Average Rental Period</h4>
                  <p className="text-3xl font-bold text-primary" data-testid="text-avg-rental">8.5 days</p>
                  <p className="text-sm text-muted-foreground">Per book rental</p>
                </div>
              </div>
              
              <div className="bg-background p-6 rounded-lg border border-border">
                <h4 className="font-semibold mb-4">Rental Trends</h4>
                <div className="h-64 bg-muted rounded flex items-center justify-center">
                  <p className="text-muted-foreground">Chart visualization would go here</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
