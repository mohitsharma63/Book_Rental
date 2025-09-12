
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { Book, Rental } from "@/lib/types";
import { BookIcon, Users, Clock, AlertTriangle, Search, Filter, Plus, TrendingUp, MessageCircle, CheckCircle } from "lucide-react";
import { AdminSidebar } from "@/components/admin-sidebar";

export default function Admin() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Static data for admin dashboard
  const staticBooks = [
    { id: "book1", title: "The Great Gatsby", author: "F. Scott Fitzgerald", category: "Fiction", pricePerWeek: "3.99", availableCopies: 2, imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400" },
    { id: "book2", title: "Gone Girl", author: "Gillian Flynn", category: "Mystery", pricePerWeek: "4.99", availableCopies: 1, imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400" },
    { id: "book3", title: "Dune", author: "Frank Herbert", category: "Sci-Fi", pricePerWeek: "5.99", availableCopies: 2, imageUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400" },
    { id: "book4", title: "Pride and Prejudice", author: "Jane Austen", category: "Romance", pricePerWeek: "3.99", availableCopies: 1, imageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400" },
    { id: "book5", title: "To Kill a Mockingbird", author: "Harper Lee", category: "Fiction", pricePerWeek: "4.50", availableCopies: 3, imageUrl: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400" },
    { id: "book6", title: "Atomic Habits", author: "James Clear", category: "Self-Help", pricePerWeek: "6.99", availableCopies: 1, imageUrl: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400" },
    { id: "book7", title: "The Psychology of Money", author: "Morgan Housel", category: "Finance", pricePerWeek: "12.99", availableCopies: 8, imageUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400" },
    { id: "book8", title: "The Silent Patient", author: "Alex Michaelides", category: "Thriller", pricePerWeek: "11.99", availableCopies: 3, imageUrl: "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400" },
    { id: "book9", title: "Where the Crawdads Sing", author: "Delia Owens", category: "Fiction", pricePerWeek: "4.99", availableCopies: 0, imageUrl: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400" },
    { id: "book10", title: "The Seven Husbands of Evelyn Hugo", author: "Taylor Jenkins Reid", category: "Romance", pricePerWeek: "4.49", availableCopies: 1, imageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400" },
    { id: "book11", title: "Educated", author: "Tara Westover", category: "Biography", pricePerWeek: "3.49", availableCopies: 1, imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400" },
    { id: "book12", title: "The Midnight Library", author: "Matt Haig", category: "Fiction", pricePerWeek: "5.49", availableCopies: 2, imageUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400" },
    { id: "book13", title: "Think Again", author: "Adam Grant", category: "Psychology", pricePerWeek: "7.99", availableCopies: 4, imageUrl: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400" },
    { id: "book14", title: "The Thursday Murder Club", author: "Richard Osman", category: "Mystery", pricePerWeek: "6.49", availableCopies: 2, imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400" },
    { id: "book15", title: "Klara and the Sun", author: "Kazuo Ishiguro", category: "Fiction", pricePerWeek: "8.99", availableCopies: 3, imageUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400" },
  ];

  const staticRentals = [
    { id: "rental1", userId: "user1", bookId: "book1", status: "active", dueDate: "2024-12-22", rentalDate: "2024-12-15" },
    { id: "rental2", userId: "user2", bookId: "book3", status: "overdue", dueDate: "2024-12-17", rentalDate: "2024-12-10" },
    { id: "rental3", userId: "user3", bookId: "book4", status: "active", dueDate: "2024-12-25", rentalDate: "2024-12-18" },
    { id: "rental4", userId: "user1", bookId: "book6", status: "active", dueDate: "2024-12-24", rentalDate: "2024-12-17" },
    { id: "rental5", userId: "user4", bookId: "book2", status: "overdue", dueDate: "2024-12-16", rentalDate: "2024-12-09" },
    { id: "rental6", userId: "user5", bookId: "book8", status: "active", dueDate: "2024-12-26", rentalDate: "2024-12-19" },
    { id: "rental7", userId: "user2", bookId: "book10", status: "active", dueDate: "2024-12-23", rentalDate: "2024-12-16" },
    { id: "rental8", userId: "user6", bookId: "book5", status: "overdue", dueDate: "2024-12-18", rentalDate: "2024-12-11" },
    { id: "rental9", userId: "user3", bookId: "book12", status: "active", dueDate: "2024-12-27", rentalDate: "2024-12-20" },
    { id: "rental10", userId: "user7", bookId: "book14", status: "active", dueDate: "2024-12-28", rentalDate: "2024-12-21" },
  ];

  // Use static data instead of API calls
  const books = staticBooks;
  const rentals = staticRentals;

  const stats = {
    totalBooks: books.length,
    activeUsers: 456,
    activeRentals: rentals.filter(r => r.status === "active").length,
    overdue: rentals.filter(r => r.status === "overdue").length,
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

  const mockRentalData = rentals.map(rental => {
    const book = books.find(b => b.id === rental.bookId);
    const userNames = ["John Doe", "Jane Smith", "Alice Johnson", "Bob Wilson", "Sarah Davis", "Mike Brown", "Emma Taylor"];
    return {
      ...rental,
      bookTitle: book?.title || "Unknown Book",
      userName: userNames[Math.floor(Math.random() * userNames.length)],
    };
  });

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

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold" data-testid="stat-total-books">{stats.totalBooks}</p>
                <p className="text-blue-100 text-sm">Total Books</p>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <BookIcon className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold" data-testid="stat-active-users">{stats.activeUsers}</p>
                <p className="text-green-100 text-sm">Active Users</p>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold" data-testid="stat-admin-active-rentals">{stats.activeRentals}</p>
                <p className="text-yellow-100 text-sm">Active Rentals</p>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <Clock className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold" data-testid="stat-overdue">{stats.overdue}</p>
                <p className="text-red-100 text-sm">Overdue</p>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <AlertTriangle className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button className="w-full justify-start" onClick={() => setActiveTab("books")}>
                <Plus className="mr-2 h-4 w-4" />
                Add New Book
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab("users")}>
                <Users className="mr-2 h-4 w-4" />
                Manage Users
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab("rentals")}>
                <Clock className="mr-2 h-4 w-4" />
                View Rentals
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm">New user registration</span>
                <span className="text-xs text-muted-foreground">2 hours ago</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm">Book returned</span>
                <span className="text-xs text-muted-foreground">4 hours ago</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm">New book added</span>
                <span className="text-xs text-muted-foreground">1 day ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return renderDashboard();
      
      case "books":
        return (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h3 className="text-lg font-semibold">Book Inventory</h3>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search books..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 w-64"
                    data-testid="input-search-books"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                </div>
                <Button data-testid="button-add-book">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Book
                </Button>
              </div>
            </div>
            
            <Card>
              <CardContent className="p-6">
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
                      {books.slice(0, 10).map((book) => (
                        <TableRow key={book.id} data-testid={`row-book-${book.id}`}>
                          <TableCell>
                            <div className="flex items-center">
                              <img 
                                src={book.imageUrl} 
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
              </CardContent>
            </Card>
          </div>
        );

      case "users":
        return (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">User Management</h3>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search users..."
                  className="pl-10 pr-4 w-64"
                  data-testid="input-search-users"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              </div>
            </div>
            
            <Card>
              <CardContent className="p-6">
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
              </CardContent>
            </Card>
          </div>
        );

      case "rentals":
        return (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Rental Tracking</h3>
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
            
            <Card>
              <CardContent className="p-6">
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
                      {mockRentalData.slice(0, 10).map((rental) => (
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
              </CardContent>
            </Card>
          </div>
        );

      case "analytics":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Analytics & Reports</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold" data-testid="text-revenue">$12,456</p>
                      <p className="text-purple-100 text-sm">Monthly Revenue</p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-lg">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                  </div>
                  <p className="text-sm text-green-200 mt-2">↑ 15% from last month</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h4 className="font-semibold mb-2">Popular Genre</h4>
                  <p className="text-3xl font-bold text-primary" data-testid="text-popular-genre">Fiction</p>
                  <p className="text-sm text-muted-foreground">45% of all rentals</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h4 className="font-semibold mb-2">Average Rental Period</h4>
                  <p className="text-3xl font-bold text-primary" data-testid="text-avg-rental">8.5 days</p>
                  <p className="text-sm text-muted-foreground">Per book rental</p>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold mb-4">Rental Trends</h4>
                <div className="h-64">
                  <ChartContainer
                    config={{
                      rentals: {
                        label: "Rentals",
                        color: "#3b82f6",
                      },
                      returns: {
                        label: "Returns",
                        color: "#10b981",
                      },
                    }}
                    className="h-full w-full"
                  >
                    <LineChart
                      data={[
                        { month: "Jan", rentals: 65, returns: 58 },
                        { month: "Feb", rentals: 78, returns: 62 },
                        { month: "Mar", rentals: 90, returns: 75 },
                        { month: "Apr", rentals: 85, returns: 88 },
                        { month: "May", rentals: 95, returns: 82 },
                        { month: "Jun", rentals: 110, returns: 95 },
                        { month: "Jul", rentals: 125, returns: 108 },
                        { month: "Aug", rentals: 118, returns: 115 },
                        { month: "Sep", rentals: 135, returns: 122 },
                        { month: "Oct", rentals: 142, returns: 138 },
                        { month: "Nov", rentals: 155, returns: 145 },
                        { month: "Dec", rentals: 168, returns: 152 },
                      ]}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="rentals"
                        stroke="var(--color-rentals)"
                        strokeWidth={3}
                        dot={{ fill: "var(--color-rentals)", strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: "var(--color-rentals)", strokeWidth: 2 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="returns"
                        stroke="var(--color-returns)"
                        strokeWidth={3}
                        dot={{ fill: "var(--color-returns)", strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: "var(--color-returns)", strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ChartContainer>
                </div>
                <div className="flex justify-center space-x-6 mt-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">New Rentals</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Book Returns</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "contact":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Contact Messages</h3>
              <div className="flex items-center space-x-4">
                <Select>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Messages</SelectItem>
                    <SelectItem value="unread">Unread</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                    <SelectItem value="responded">Responded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">24</p>
                      <p className="text-sm text-muted-foreground">Total Messages</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <MessageCircle className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-orange-600">8</p>
                      <p className="text-sm text-muted-foreground">Unread</p>
                    </div>
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <AlertTriangle className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-green-600">12</p>
                      <p className="text-sm text-muted-foreground">Responded</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-lg">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">2.4h</p>
                      <p className="text-sm text-muted-foreground">Avg Response Time</p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <Clock className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Messages Table */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold">Recent Messages</h4>
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="Search messages..."
                        className="pl-10 pr-4 w-64"
                      />
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Status</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Subject</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>
                            <Badge className="bg-red-100 text-red-800">Unread</Badge>
                          </TableCell>
                          <TableCell>John Smith</TableCell>
                          <TableCell>john.smith@example.com</TableCell>
                          <TableCell>Book not available</TableCell>
                          <TableCell>
                            <Badge variant="outline">Support</Badge>
                          </TableCell>
                          <TableCell>Dec 20, 2024</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm" className="text-blue-600">
                                View
                              </Button>
                              <Button variant="ghost" size="sm" className="text-green-600">
                                Reply
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        
                        <TableRow>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-800">Responded</Badge>
                          </TableCell>
                          <TableCell>Sarah Johnson</TableCell>
                          <TableCell>sarah.j@example.com</TableCell>
                          <TableCell>Billing inquiry</TableCell>
                          <TableCell>
                            <Badge variant="outline">Billing</Badge>
                          </TableCell>
                          <TableCell>Dec 19, 2024</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm" className="text-blue-600">
                                View
                              </Button>
                              <Button variant="ghost" size="sm" className="text-gray-600">
                                Archive
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        
                        <TableRow>
                          <TableCell>
                            <Badge className="bg-red-100 text-red-800">Unread</Badge>
                          </TableCell>
                          <TableCell>Mike Brown</TableCell>
                          <TableCell>mike.brown@example.com</TableCell>
                          <TableCell>Partnership proposal</TableCell>
                          <TableCell>
                            <Badge variant="outline">Partnership</Badge>
                          </TableCell>
                          <TableCell>Dec 18, 2024</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm" className="text-blue-600">
                                View
                              </Button>
                              <Button variant="ghost" size="sm" className="text-green-600">
                                Reply
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        
                        <TableRow>
                          <TableCell>
                            <Badge className="bg-yellow-100 text-yellow-800">Read</Badge>
                          </TableCell>
                          <TableCell>Emma Davis</TableCell>
                          <TableCell>emma.davis@example.com</TableCell>
                          <TableCell>Feature request</TableCell>
                          <TableCell>
                            <Badge variant="outline">Feedback</Badge>
                          </TableCell>
                          <TableCell>Dec 17, 2024</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm" className="text-blue-600">
                                View
                              </Button>
                              <Button variant="ghost" size="sm" className="text-green-600">
                                Reply
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        
                        <TableRow>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-800">Responded</Badge>
                          </TableCell>
                          <TableCell>Alex Wilson</TableCell>
                          <TableCell>alex.w@example.com</TableCell>
                          <TableCell>Book recommendation</TableCell>
                          <TableCell>
                            <Badge variant="outline">General</Badge>
                          </TableCell>
                          <TableCell>Dec 16, 2024</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm" className="text-blue-600">
                                View
                              </Button>
                              <Button variant="ghost" size="sm" className="text-gray-600">
                                Archive
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Response Templates */}
            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold mb-4">Quick Response Templates</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h5 className="font-medium mb-2">Thank You Response</h5>
                    <p className="text-sm text-muted-foreground mb-3">
                      "Thank you for contacting BookWise. We've received your message and will respond within 24 hours."
                    </p>
                    <Button variant="outline" size="sm">Use Template</Button>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h5 className="font-medium mb-2">Book Availability</h5>
                    <p className="text-sm text-muted-foreground mb-3">
                      "The book you requested is currently unavailable but will be back in stock soon. We'll notify you when it's available."
                    </p>
                    <Button variant="outline" size="sm">Use Template</Button>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h5 className="font-medium mb-2">Billing Support</h5>
                    <p className="text-sm text-muted-foreground mb-3">
                      "We've reviewed your billing inquiry and will process the adjustment within 3-5 business days."
                    </p>
                    <Button variant="outline" size="sm">Use Template</Button>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h5 className="font-medium mb-2">General Support</h5>
                    <p className="text-sm text-muted-foreground mb-3">
                      "We appreciate your feedback and will forward it to our development team for consideration."
                    </p>
                    <Button variant="outline" size="sm">Use Template</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return <div>Select a tab</div>;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 lg:flex-none">
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900 truncate" data-testid="text-admin-title">
                Admin Dashboard
              </h1>
              <p className="text-xs lg:text-sm text-gray-600 mt-1 hidden sm:block">
                Manage your BookWise platform efficiently
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-gray-900">Admin User</p>
                <p className="text-xs text-gray-500">admin@bookwise.com</p>
              </div>
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">A</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-4 lg:p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
