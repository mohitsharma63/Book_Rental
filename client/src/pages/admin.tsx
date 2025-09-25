import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { Book, Rental } from "@/lib/types";
import { BookIcon, Users, Clock, AlertTriangle, Search, Filter, Plus, TrendingUp, MessageCircle, CheckCircle, X } from "lucide-react";
import { AdminSidebar } from "@/components/admin-sidebar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CategoriesManager } from "@/components/categories-manager";
import { SliderManager } from "@/components/slider-manager";

export default function Admin() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddBookDialog, setShowAddBookDialog] = useState(false);
  const [showEditBookDialog, setShowEditBookDialog] = useState(false);
  const [editingBook, setEditingBook] = useState<any>(null);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [paymentSearchQuery, setPaymentSearchQuery] = useState("");
  const [paymentDateFilter, setPaymentDateFilter] = useState("all");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all");
  const [bookFormData, setBookFormData] = useState({
    title: "",
    author: "",
    isbn: "",
    category: "",
    description: "",
    imageUrl: "",
    pricePerWeek: "",
    totalCopies: "1",
    publishedYear: "",
    pages: "",
    publisher: "",
    language: "English",
    condition: "New",
    format: "Paperback"
  });

  const queryClient = useQueryClient();

  // API calls for dynamic data with comprehensive error handling
  const { data: books = [], isLoading: booksLoading, error: booksError } = useQuery({
    queryKey: ['admin-books'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/books');
        if (!res.ok) {
          console.warn('Books API failed:', res.status, res.statusText);
          return [];
        }
        const data = await res.json();
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.warn('Books API error:', error);
        return [];
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Fetch categories for dropdown
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) {
          console.warn('Categories API failed:', response.status, response.statusText);
          return [];
        }
        const data = await response.json();
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.warn('Categories API error:', error);
        return [];
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Mutation for adding new book
  const addBookMutation = useMutation({
    mutationFn: async (bookData: any) => {
      try {
        const response = await fetch('/api/books', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...bookData,
            pricePerWeek: bookData.pricePerWeek.toString(),
            totalCopies: parseInt(bookData.totalCopies),
            availableCopies: parseInt(bookData.totalCopies),
            publishedYear: bookData.publishedYear ? parseInt(bookData.publishedYear) : null,
            pages: bookData.pages ? parseInt(bookData.pages) : null,
            rating: "0"
          }),
        });
        if (!response.ok) {
          const errorText = await response.text();
          console.warn('Add book API failed:', response.status, errorText);
          throw new Error(errorText || 'Failed to add book');
        }
        return response.json();
      } catch (error) {
        console.error('Add book error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-books'] });
      setShowAddBookDialog(false);
      resetBookForm();
    },
    onError: (error) => {
      console.error('Failed to add book:', error);
    },
  });

  // Mutation for updating book
  const updateBookMutation = useMutation({
    mutationFn: async ({ id, bookData }: { id: string; bookData: any }) => {
      try {
        console.log('Updating book:', id, 'with data:', bookData);
        const response = await fetch(`/api/books/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...bookData,
            pricePerWeek: parseFloat(bookData.pricePerWeek),
            totalCopies: parseInt(bookData.totalCopies),
            publishedYear: bookData.publishedYear ? parseInt(bookData.publishedYear) : null,
            pages: bookData.pages ? parseInt(bookData.pages) : null,
          }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Update book API failed:', response.status, errorData);
          throw new Error(errorData.message || 'Failed to update book');
        }
        const result = await response.json();
        console.log('Book updated successfully:', result);
        return result;
      } catch (error) {
        console.error('Update book error:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('Update mutation success:', data);
      queryClient.invalidateQueries({ queryKey: ['admin-books'] });
      setShowEditBookDialog(false);
      setEditingBook(null);
      resetBookForm();
    },
    onError: (error) => {
      console.error('Failed to update book:', error);
      alert('Failed to update book: ' + error.message);
    },
  });

  // Mutation for deleting book
  const deleteBookMutation = useMutation({
    mutationFn: async (bookId: string) => {
      try {
        console.log('Deleting book with ID:', bookId);
        const response = await fetch(`/api/books/${bookId}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Delete book API failed:', response.status, errorData);
          throw new Error(errorData.message || 'Failed to delete book');
        }
        const result = await response.json();
        console.log('Book deleted successfully:', result);
        return result;
      } catch (error) {
        console.error('Delete book error:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('Delete mutation success:', data);
      queryClient.invalidateQueries({ queryKey: ['admin-books'] });
    },
    onError: (error) => {
      console.error('Failed to delete book:', error);
      alert('Failed to delete book: ' + error.message);
    },
  });

  // Mutation for suspending user
  const suspendUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      try {
        console.log('Suspending user with ID:', userId);
        const response = await fetch(`/api/users/${userId}/suspend`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ suspended: true }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Suspend user API failed:', response.status, errorData);
          throw new Error(errorData.message || 'Failed to suspend user');
        }
        const result = await response.json();
        console.log('User suspended successfully:', result);
        return result;
      } catch (error) {
        console.error('Suspend user error:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('Suspend mutation success:', data);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error) => {
      console.error('Failed to suspend user:', error);
      alert('Failed to suspend user: ' + error.message);
    },
  });

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/users');
        if (!res.ok) {
          console.warn('Users API failed:', res.status, res.statusText);
          return [];
        }
        const data = await res.json();
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.warn('Users API error:', error);
        return [];
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  const { data: rentals = [], isLoading: rentalsLoading } = useQuery({
    queryKey: ['admin-rentals'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/rentals');
        if (!res.ok) {
          console.warn('Rentals API failed:', res.status, res.statusText);
          return [];
        }
        const data = await res.json();
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.warn('Rentals API error:', error);
        return [];
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  const { data: contactMessages = [], isLoading: contactMessagesLoading } = useQuery({
    queryKey: ['contact-messages'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/contacts');
        if (!res.ok) {
          console.warn('Contact messages API failed:', res.status, res.statusText);
          return [];
        }
        const data = await res.json();
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.warn('Contact messages API error:', error);
        return [];
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  const { data: contactStats = {}, isLoading: contactStatsLoading } = useQuery({
    queryKey: ['contact-stats'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/contacts/stats');
        if (!res.ok) {
          console.warn('Contact stats API failed:', res.status, res.statusText);
          return { total: 0, unread: 0, responded: 0, avgResponseTime: '0h' };
        }
        const data = await res.json();
        return data || { total: 0, unread: 0, responded: 0, avgResponseTime: '0h' };
      } catch (error) {
        console.warn('Contact stats API error:', error);
        return { total: 0, unread: 0, responded: 0, avgResponseTime: '0h' };
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  const { data: paymentOrders = [], isLoading: paymentOrdersLoading } = useQuery({
    queryKey: ['payment-orders'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/payment-orders');
        if (!res.ok) {
          console.warn('Payment orders API failed:', res.status, res.statusText);
          return [];
        }
        const data = await res.json();
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.warn('Payment orders API error:', error);
        return [];
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Mutation for updating message status
  const updateMessageStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      try {
        const response = await fetch(`/api/contacts/${id}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status }),
        });
        if (!response.ok) {
          const errorText = await response.text();
          console.warn('Update message status API failed:', response.status, errorText);
          throw new Error(errorText || 'Failed to update message status');
        }
        return response.json();
      } catch (error) {
        console.error('Update message status error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-messages'] });
      queryClient.invalidateQueries({ queryKey: ['contact-stats'] });
    },
    onError: (error) => {
      console.error('Failed to update message status:', error);
    },
  });

  const stats = {
    totalBooks: Array.isArray(books) ? books.length : 0,
    activeUsers: Array.isArray(users) ? users.length : 0,
    activeRentals: Array.isArray(rentals) ? rentals.filter(r => r.status === "active").length : 0,
    overdue: Array.isArray(rentals) ? rentals.filter(r => r.status === "overdue").length : 0,
  };



  const rentalData = (Array.isArray(rentals) ? rentals : []).map(rental => {
    const book = books.find(b => b.id === rental.bookId);
    const user = users.find(u => u.id === rental.userId);
    return {
      ...rental,
      bookTitle: book?.title || "Unknown Book",
      userName: user ? `${user.firstName} ${user.lastName}` : "Unknown User",
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

  const resetBookForm = () => {
    setBookFormData({
      title: "",
      author: "",
      isbn: "",
      category: "",
      description: "",
      imageUrl: "",
      pricePerWeek: "",
      totalCopies: "1",
      publishedYear: "",
      pages: "",
      publisher: "",
      language: "English",
      condition: "New",
      format: "Paperback"
    });
  };

  const handleBookFormChange = (field: string, value: string) => {
    setBookFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddBook = () => {
    addBookMutation.mutate(bookFormData);
  };

  const handleEditBook = (book: any) => {
    setEditingBook(book);
    setBookFormData({
      title: book.title || "",
      author: book.author || "",
      isbn: book.isbn || "",
      category: book.category || "",
      description: book.description || "",
      imageUrl: book.imageUrl || "",
      pricePerWeek: book.pricePerWeek?.toString() || "",
      totalCopies: book.totalCopies?.toString() || "1",
      publishedYear: book.publishedYear?.toString() || "",
      pages: book.pages?.toString() || "",
      publisher: book.publisher || "",
      language: book.language || "English",
      condition: book.condition || "New",
      format: book.format || "Paperback"
    });
    setShowEditBookDialog(true);
  };

  const handleUpdateBook = () => {
    if (editingBook) {
      updateBookMutation.mutate({ id: editingBook.id, bookData: bookFormData });
    }
  };

  const handleDeleteBook = (bookId: string) => {
    if (confirm('Are you sure you want to delete this book? This action cannot be undone.')) {
      console.log('Deleting book:', bookId);
      deleteBookMutation.mutate(bookId);
    }
  };


  const handleViewUser = (userId: string) => {
    console.log('handleViewUser called with userId:', userId);
    console.log('Current showUserDialog state:', showUserDialog);
    console.log('All users:', users);

    const user = users.find(u => u.id === userId);
    console.log('Found user:', user);

    if (user) {
      console.log('Setting selectedUser and showUserDialog to true');
      setSelectedUser(user);
      setShowUserDialog(true);
      console.log('States set - user:', user, 'dialog should be true');
    } else {
      console.error('User not found:', userId, 'in users array:', users.map(u => u.id));
      alert('User not found with ID: ' + userId);
    }
  };

  const handleSuspendUser = (userId: string) => {
    if (confirm('Are you sure you want to suspend this user? They will not be able to rent books until unsuspended.')) {
      console.log('Suspending user:', userId);
      suspendUserMutation.mutate(userId);
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
    if (booksLoading || usersLoading || rentalsLoading || (activeTab === 'contact' && (contactMessagesLoading || contactStatsLoading))) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-lg font-medium">Loading data...</div>
            <div className="text-sm text-muted-foreground mt-2">
              {booksLoading && "Loading books..."}
              {usersLoading && "Loading users..."}
              {rentalsLoading && "Loading rentals..."}
              {contactMessagesLoading && "Loading contact messages..."}
            </div>
          </div>
        </div>
      );
    }

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
                <Dialog open={showAddBookDialog} onOpenChange={setShowAddBookDialog}>
                  <DialogTrigger asChild>
                    <Button data-testid="button-add-book">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Book
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add New Book</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Title *</Label>
                        <Input
                          id="title"
                          value={bookFormData.title}
                          onChange={(e) => handleBookFormChange("title", e.target.value)}
                          placeholder="Enter book title"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="author">Author *</Label>
                        <Input
                          id="author"
                          value={bookFormData.author}
                          onChange={(e) => handleBookFormChange("author", e.target.value)}
                          placeholder="Enter author name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="isbn">ISBN</Label>
                        <Input
                          id="isbn"
                          value={bookFormData.isbn}
                          onChange={(e) => handleBookFormChange("isbn", e.target.value)}
                          placeholder="Enter ISBN"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category">Category *</Label>
                        <Select value={bookFormData.category} onValueChange={(value) => handleBookFormChange("category", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categoriesLoading ? (
                              <SelectItem value="" disabled>Loading categories...</SelectItem>
                            ) : (
                              categories
                                .filter(cat => cat.isActive)
                                .map((category) => (
                                  <SelectItem key={category.id} value={category.name}>
                                    {category.name}
                                  </SelectItem>
                                ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pricePerWeek">Price per Week *</Label>
                        <Input
                          id="pricePerWeek"
                          type="number"
                          step="0.01"
                          value={bookFormData.pricePerWeek}
                          onChange={(e) => handleBookFormChange("pricePerWeek", e.target.value)}
                          placeholder="0.00"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="totalCopies">Total Copies *</Label>
                        <Input
                          id="totalCopies"
                          type="number"
                          min="1"
                          value={bookFormData.totalCopies}
                          onChange={(e) => handleBookFormChange("totalCopies", e.target.value)}
                          placeholder="1"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="publishedYear">Published Year</Label>
                        <Input
                          id="publishedYear"
                          type="number"
                          min="1000"
                          max="2024"
                          value={bookFormData.publishedYear}
                          onChange={(e) => handleBookFormChange("publishedYear", e.target.value)}
                          placeholder="2023"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pages">Pages</Label>
                        <Input
                          id="pages"
                          type="number"
                          min="1"
                          value={bookFormData.pages}
                          onChange={(e) => handleBookFormChange("pages", e.target.value)}
                          placeholder="300"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="publisher">Publisher</Label>
                        <Input
                          id="publisher"
                          value={bookFormData.publisher}
                          onChange={(e) => handleBookFormChange("publisher", e.target.value)}
                          placeholder="Enter publisher"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="language">Language</Label>
                        <Select value={bookFormData.language} onValueChange={(value) => handleBookFormChange("language", value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="English">English</SelectItem>
                            <SelectItem value="Spanish">Spanish</SelectItem>
                            <SelectItem value="French">French</SelectItem>
                            <SelectItem value="German">German</SelectItem>
                            <SelectItem value="Italian">Italian</SelectItem>
                            <SelectItem value="Portuguese">Portuguese</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="imageUrl">Book Cover Image</Label>
                        <div className="space-y-2">
                          <Input
                            id="imageFile"
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  const result = event.target?.result as string;
                                  handleBookFormChange("imageUrl", result);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                          />
                          <div className="text-sm text-muted-foreground">Or enter image URL below:</div>
                          <Input
                            id="imageUrl"
                            value={bookFormData.imageUrl}
                            onChange={(e) => handleBookFormChange("imageUrl", e.target.value)}
                            placeholder="https://example.com/book-cover.jpg"
                          />
                        </div>
                        {bookFormData.imageUrl && (
                          <div className="mt-2">
                            <img
                              src={bookFormData.imageUrl}
                              alt="Book cover preview"
                              className="w-24 h-32 object-cover rounded border"
                            />
                          </div>
                        )}
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={bookFormData.description}
                          onChange={(e) => handleBookFormChange("description", e.target.value)}
                          placeholder="Enter book description"
                          rows={3}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setShowAddBookDialog(false)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={handleAddBook}
                        disabled={!bookFormData.title || !bookFormData.author || !bookFormData.category || !bookFormData.pricePerWeek || addBookMutation.isPending}
                      >
                        {addBookMutation.isPending ? "Adding..." : "Add Book"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Edit Book Dialog */}
                <Dialog open={showEditBookDialog} onOpenChange={setShowEditBookDialog}>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Edit Book</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-title">Title *</Label>
                        <Input
                          id="edit-title"
                          value={bookFormData.title}
                          onChange={(e) => handleBookFormChange("title", e.target.value)}
                          placeholder="Enter book title"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-author">Author *</Label>
                        <Input
                          id="edit-author"
                          value={bookFormData.author}
                          onChange={(e) => handleBookFormChange("author", e.target.value)}
                          placeholder="Enter author name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-isbn">ISBN</Label>
                        <Input
                          id="edit-isbn"
                          value={bookFormData.isbn}
                          onChange={(e) => handleBookFormChange("isbn", e.target.value)}
                          placeholder="Enter ISBN"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-category">Category *</Label>
                        <Select value={bookFormData.category} onValueChange={(value) => handleBookFormChange("category", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categoriesLoading ? (
                              <SelectItem value="" disabled>Loading categories...</SelectItem>
                            ) : (
                              categories
                                .filter(cat => cat.isActive)
                                .map((category) => (
                                  <SelectItem key={category.id} value={category.name}>
                                    {category.name}
                                  </SelectItem>
                                ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-pricePerWeek">Price per Week *</Label>
                        <Input
                          id="edit-pricePerWeek"
                          type="number"
                          step="0.01"
                          value={bookFormData.pricePerWeek}
                          onChange={(e) => handleBookFormChange("pricePerWeek", e.target.value)}
                          placeholder="0.00"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-totalCopies">Total Copies *</Label>
                        <Input
                          id="edit-totalCopies"
                          type="number"
                          min="1"
                          value={bookFormData.totalCopies}
                          onChange={(e) => handleBookFormChange("totalCopies", e.target.value)}
                          placeholder="1"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-publishedYear">Published Year</Label>
                        <Input
                          id="edit-publishedYear"
                          type="number"
                          min="1000"
                          max="2024"
                          value={bookFormData.publishedYear}
                          onChange={(e) => handleBookFormChange("publishedYear", e.target.value)}
                          placeholder="2023"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-pages">Pages</Label>
                        <Input
                          id="edit-pages"
                          type="number"
                          min="1"
                          value={bookFormData.pages}
                          onChange={(e) => handleBookFormChange("pages", e.target.value)}
                          placeholder="300"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-publisher">Publisher</Label>
                        <Input
                          id="edit-publisher"
                          value={bookFormData.publisher}
                          onChange={(e) => handleBookFormChange("publisher", e.target.value)}
                          placeholder="Enter publisher"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-language">Language</Label>
                        <Select value={bookFormData.language} onValueChange={(value) => handleBookFormChange("language", value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="English">English</SelectItem>
                            <SelectItem value="Spanish">Spanish</SelectItem>
                            <SelectItem value="French">French</SelectItem>
                            <SelectItem value="German">German</SelectItem>
                            <SelectItem value="Italian">Italian</SelectItem>
                            <SelectItem value="Portuguese">Portuguese</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="edit-imageUrl">Book Cover Image</Label>
                        <div className="space-y-2">
                          <Input
                            id="edit-imageFile"
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  const result = event.target?.result as string;
                                  handleBookFormChange("imageUrl", result);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                          />
                          <div className="text-sm text-muted-foreground">Or enter image URL below:</div>
                          <Input
                            id="edit-imageUrl"
                            value={bookFormData.imageUrl}
                            onChange={(e) => handleBookFormChange("imageUrl", e.target.value)}
                            placeholder="https://example.com/book-cover.jpg"
                          />
                        </div>
                        {bookFormData.imageUrl && (
                          <div className="mt-2">
                            <img
                              src={bookFormData.imageUrl}
                              alt="Book cover preview"
                              className="w-24 h-32 object-cover rounded border"
                            />
                          </div>
                        )}
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="edit-description">Description</Label>
                        <Textarea
                          id="edit-description"
                          value={bookFormData.description}
                          onChange={(e) => handleBookFormChange("description", e.target.value)}
                          placeholder="Enter book description"
                          rows={3}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => {
                        setShowEditBookDialog(false);
                        setEditingBook(null);
                        resetBookForm();
                      }}>
                        Cancel
                      </Button>
                      <Button
                        onClick={handleUpdateBook}
                        disabled={!bookFormData.title || !bookFormData.author || !bookFormData.category || !bookFormData.pricePerWeek || updateBookMutation.isPending}
                      >
                        {updateBookMutation.isPending ? "Updating..." : "Update Book"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* User Details Dialog - This was moved outside the Card */}
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
                      {booksLoading ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">Loading books...</TableCell>
                        </TableRow>
                      ) : (Array.isArray(books) && books.length > 0) ? (
                        books.slice(0, 10).map((book) => (
                          <TableRow key={book.id} data-testid={`row-book-${book.id}`}>
                            <TableCell>
                              <div className="flex items-center">
                                <img
                                  src={book.imageUrl || '/placeholder-book.jpg'}
                                  alt={`${book.title} cover`}
                                  className="w-10 h-14 object-cover rounded mr-3"
                                  onError={(e) => {
                                    e.currentTarget.src = '/placeholder-book.jpg';
                                  }}
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
                            <TableCell>₹{book.pricePerWeek}/month</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-blue-600 hover:text-blue-800"
                                  data-testid={`button-edit-${book.id}`}
                                  onClick={() => handleEditBook(book)}
                                  disabled={updateBookMutation.isPending}
                                >
                                  {updateBookMutation.isPending && editingBook?.id === book.id ? "Updating..." : "Edit"}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-800"
                                  data-testid={`button-delete-${book.id}`}
                                  onClick={() => handleDeleteBook(book.id)}
                                  disabled={deleteBookMutation.isPending}
                                >
                                  {deleteBookMutation.isPending ? "Deleting..." : "Delete"}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            No books found. Add some books to get started.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "categories":
        return <CategoriesManager />;

      case "sliders":
        return <SliderManager />;

      case "users":
        return (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-semibold">User Management</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Debug: Dialog State = {showUserDialog ? 'OPEN' : 'CLOSED'}, Selected User = {selectedUser?.id || 'NONE'}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    console.log('Force opening dialog for first user');
                    if (users.length > 0) {
                      setSelectedUser(users[0]);
                      setShowUserDialog(true);
                    }
                  }}
                >
                  Test Dialog
                </Button>
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
                      {usersLoading ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">Loading users...</TableCell>
                        </TableRow>
                      ) : (Array.isArray(users) && users.length > 0) ? (
                        users.map((user) => (
                          <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                            <TableCell>
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mr-3">
                                  <span className="text-white text-sm font-medium">
                                    {user.firstName?.[0] || 'U'}{user.lastName?.[0] || ''}
                                  </span>
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-foreground">
                                    {user.firstName || 'Unknown'} {user.lastName || 'User'}
                                  </div>
                                  <div className="text-sm text-muted-foreground">{user.email || 'No email'}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor("Active")}>
                                Active
                              </Badge>
                            </TableCell>
                            <TableCell>{Array.isArray(rentals) ? rentals.filter(r => r.userId === user.id && r.status === 'active').length : 0}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-blue-600 hover:text-blue-800"
                                  data-testid={`button-view-user-${user.id}`}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    console.log('View button clicked for user:', user.id, user);
                                    handleViewUser(user.id);
                                  }}
                                >
                                  View
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-yellow-600 hover:text-yellow-800"
                                  data-testid={`button-suspend-user-${user.id}`}
                                  onClick={() => handleSuspendUser(user.id)}
                                  disabled={suspendUserMutation.isPending}
                                >
                                  {suspendUserMutation.isPending ? "Suspending..." : "Suspend"}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            No users found.
                          </TableCell>
                        </TableRow>
                      )}
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
                      {rentalsLoading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">Loading rentals...</TableCell>
                        </TableRow>
                      ) : (Array.isArray(rentalData) && rentalData.length > 0) ? (
                        rentalData.slice(0, 10).map((rental) => (
                          <TableRow key={rental.id} data-testid={`row-rental-${rental.id}`}>
                            <TableCell className="font-medium">#{rental.id?.toString().slice(0, 8) || 'N/A'}</TableCell>
                            <TableCell>{rental.userName || 'Unknown User'}</TableCell>
                            <TableCell>{rental.bookTitle || 'Unknown Book'}</TableCell>
                            <TableCell className={rental.status === "overdue" ? "text-red-600" : ""}>
                              {rental.dueDate ? new Date(rental.dueDate).toLocaleDateString() : 'No due date'}
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(rental.status || 'unknown')}>
                                {rental.status || 'Unknown'}
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
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            No rentals found.
                          </TableCell>
                        </TableRow>
                      )}
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
                      <p className="text-2xl font-bold" data-testid="text-revenue">₹12,456</p>
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

      case "orders":
        const filteredRentals = (Array.isArray(rentalData) ? rentalData : [])
          .filter(rental => {
            if (filterStatus === "all") return true;
            return rental.status === filterStatus;
          })
          .filter(rental => {
            if (!searchQuery) return true;
            return (
              rental.id?.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
              rental.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              rental.bookTitle?.toLowerCase().includes(searchQuery.toLowerCase())
            );
          });

        const orderStats = {
          total: Array.isArray(rentals) ? rentals.length : 0,
          active: Array.isArray(rentals) ? rentals.filter(r => r.status === "active").length : 0,
          processing: Array.isArray(rentals) ? rentals.filter(r => r.status === "processing").length : 0,
          overdue: Array.isArray(rentals) ? rentals.filter(r => r.status === "overdue").length : 0,
          completed: Array.isArray(rentals) ? rentals.filter(r => r.status === "completed").length : 0,
          totalRevenue: Array.isArray(rentals) ? rentals.reduce((sum, r) => sum + parseFloat(r.totalAmount || '0'), 0) : 0
        };

        return (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-semibold">Order Management</h3>
                <p className="text-sm text-muted-foreground">
                  Showing {filteredRentals.length} of {orderStats.total} total orders
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40" data-testid="select-order-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Orders ({orderStats.total})</SelectItem>
                    <SelectItem value="processing">Processing ({orderStats.processing})</SelectItem>
                    <SelectItem value="active">Active ({orderStats.active})</SelectItem>
                    <SelectItem value="completed">Completed ({orderStats.completed})</SelectItem>
                    <SelectItem value="overdue">Overdue ({orderStats.overdue})</SelectItem>
                  </SelectContent>
                </Select>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search orders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 w-64"
                    data-testid="input-search-orders"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                </div>
              </div>
            </div>

            {/* Orders Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">{orderStats.total}</p>
                      <p className="text-blue-100 text-sm">Total Orders</p>
                    </div>
                    <div className="p-2 bg-white/20 rounded-lg">
                      <BookIcon className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">{orderStats.active}</p>
                      <p className="text-green-100 text-sm">Active Orders</p>
                    </div>
                    <div className="p-2 bg-white/20 rounded-lg">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">{orderStats.processing}</p>
                      <p className="text-yellow-100 text-sm">Processing</p>
                    </div>
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Clock className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">{orderStats.overdue}</p>
                      <p className="text-red-100 text-sm">Overdue</p>
                    </div>
                    <div className="p-2 bg-white/20 rounded-lg">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">₹{orderStats.totalRevenue.toFixed(0)}</p>
                      <p className="text-purple-100 text-sm">Total Revenue</p>
                    </div>
                    <div className="p-2 bg-white/20 rounded-lg">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Orders Table */}
            <Card>
              <CardContent className="p-6">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Book</TableHead>
                        <TableHead>Rental Date</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rentalsLoading ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8">
                            <div className="flex items-center justify-center space-x-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                              <span>Loading orders...</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : filteredRentals.length > 0 ? (
                        filteredRentals.map((rental) => {
                          const book = books.find(b => b.id === rental.bookId);
                          const user = users.find(u => u.id === rental.userId);
                          const isOverdue = rental.status === "overdue" || (rental.dueDate && new Date(rental.dueDate) < new Date());
                          
                          return (
                            <TableRow key={rental.id} data-testid={`row-order-${rental.id}`} className="hover:bg-gray-50">
                              <TableCell className="font-medium">
                                <div className="flex flex-col">
                                  <span className="font-mono text-sm">#{rental.id?.toString().slice(-8) || 'N/A'}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {rental.createdAt ? new Date(rental.createdAt).toLocaleDateString() : ''}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                                    <span className="text-white text-xs font-medium">
                                      {user?.firstName?.[0] || 'U'}{user?.lastName?.[0] || ''}
                                    </span>
                                  </div>
                                  <div>
                                    <div className="font-medium">{rental.userName || 'Unknown User'}</div>
                                    <div className="text-sm text-muted-foreground">
                                      {user?.email || 'No email'}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-3">
                                  <img
                                    src={book?.imageUrl || '/placeholder-book.jpg'}
                                    alt="Book cover"
                                    className="w-10 h-12 object-cover rounded shadow-sm"
                                    onError={(e) => {
                                      e.currentTarget.src = '/placeholder-book.jpg';
                                    }}
                                  />
                                  <div>
                                    <div className="font-medium line-clamp-1">{book?.title || 'Unknown Book'}</div>
                                    <div className="text-sm text-muted-foreground">
                                      by {book?.author || 'Unknown Author'}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {book?.category || 'No category'}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  {rental.rentalDate ? new Date(rental.rentalDate).toLocaleDateString() : 'N/A'}
                                </div>
                              </TableCell>
                              <TableCell className={isOverdue ? "text-red-600 font-medium" : ""}>
                                <div className="text-sm">
                                  {rental.dueDate ? new Date(rental.dueDate).toLocaleDateString() : 'No due date'}
                                </div>
                                {isOverdue && (
                                  <div className="text-xs text-red-500 font-medium">
                                    {rental.dueDate ? 
                                      `${Math.ceil((new Date().getTime() - new Date(rental.dueDate).getTime()) / (1000 * 60 * 60 * 24))} days overdue` 
                                      : 'Overdue'
                                    }
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge className={`${getStatusColor(rental.status || 'unknown')} font-medium`}>
                                  {rental.status?.charAt(0).toUpperCase() + rental.status?.slice(1) || 'Unknown'}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-medium">
                                <div className="text-lg">₹{parseFloat(rental.totalAmount || '0').toFixed(2)}</div>
                                {book?.pricePerWeek && (
                                  <div className="text-xs text-muted-foreground">
                                    ₹{book.pricePerWeek}/week
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-1">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                    data-testid={`button-view-order-${rental.id}`}
                                  >
                                    View
                                  </Button>
                                  {rental.status === "overdue" ? (
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="text-red-600 hover:text-red-800 hover:bg-red-50" 
                                      data-testid={`button-remind-order-${rental.id}`}
                                    >
                                      Remind
                                    </Button>
                                  ) : rental.status === "active" ? (
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="text-green-600 hover:text-green-800 hover:bg-green-50" 
                                      data-testid={`button-complete-order-${rental.id}`}
                                    >
                                      Complete
                                    </Button>
                                  ) : (
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="text-gray-600 hover:text-gray-800 hover:bg-gray-50" 
                                      data-testid={`button-update-order-${rental.id}`}
                                    >
                                      Update
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-12">
                            <div className="flex flex-col items-center space-y-2">
                              <BookIcon className="h-8 w-8 text-muted-foreground" />
                              <div className="text-muted-foreground">
                                {filterStatus === "all" ? "No orders found" : `No ${filterStatus} orders found`}
                              </div>
                              {searchQuery && (
                                <div className="text-sm text-muted-foreground">
                                  Try adjusting your search terms
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Pagination info */}
                {filteredRentals.length > 0 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      Showing {filteredRentals.length} of {orderStats.total} orders
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Revenue: ₹{orderStats.totalRevenue.toFixed(2)}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case "payments":

        const filteredPaymentOrders = paymentOrders.filter(order => {
          // Status filter
          if (paymentStatusFilter !== "all") {
            if (paymentStatusFilter === "pending" && !['pending', 'created'].includes(order.status)) return false;
            if (paymentStatusFilter === "paid" && !['paid', 'success'].includes(order.status)) return false;
            if (paymentStatusFilter === "failed" && order.status !== 'failed') return false;
          }

          // Search filter
          if (paymentSearchQuery) {
            const searchLower = paymentSearchQuery.toLowerCase();
            if (!order.orderId?.toLowerCase().includes(searchLower) &&
                !order.customerName?.toLowerCase().includes(searchLower) &&
                !order.customerEmail?.toLowerCase().includes(searchLower) &&
                !order.customerPhone?.toLowerCase().includes(searchLower)) {
              return false;
            }
          }

          // Date filter
          if (paymentDateFilter !== "all" && order.createdAt) {
            const orderDate = new Date(order.createdAt);
            const now = new Date();
            switch (paymentDateFilter) {
              case "today":
                if (orderDate.toDateString() !== now.toDateString()) return false;
                break;
              case "week":
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                if (orderDate < weekAgo) return false;
                break;
              case "month":
                const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                if (orderDate < monthAgo) return false;
                break;
            }
          }

          // Payment method filter
          if (paymentMethodFilter !== "all" && order.paymentMethod !== paymentMethodFilter) {
            return false;
          }

          return true;
        });

        const paymentStats = {
          total: paymentOrders.length,
          pending: paymentOrders.filter(order => order.status === 'pending' || order.status === 'created').length,
          paid: paymentOrders.filter(order => order.status === 'paid' || order.status === 'success').length,
          failed: paymentOrders.filter(order => order.status === 'failed').length,
          totalAmount: paymentOrders.reduce((sum, order) => sum + parseFloat(order.amount || '0'), 0),
          filteredCount: filteredPaymentOrders.length,
          filteredAmount: filteredPaymentOrders.reduce((sum, order) => sum + parseFloat(order.amount || '0'), 0)
        };

        return (
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <h3 className="text-lg font-semibold">Payment Orders</h3>
                <p className="text-sm text-muted-foreground">
                  Showing {paymentStats.filteredCount} of {paymentStats.total} orders
                </p>
              </div>
              
              {/* Enhanced Filter Section */}
              <div className="flex flex-wrap items-center gap-3">
                <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending ({paymentStats.pending})</SelectItem>
                    <SelectItem value="paid">Paid ({paymentStats.paid})</SelectItem>
                    <SelectItem value="failed">Failed ({paymentStats.failed})</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={paymentDateFilter} onValueChange={setPaymentDateFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="netbanking">Net Banking</SelectItem>
                    <SelectItem value="wallet">Wallet</SelectItem>
                  </SelectContent>
                </Select>

                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search orders..."
                    value={paymentSearchQuery}
                    onChange={(e) => setPaymentSearchQuery(e.target.value)}
                    className="pl-10 pr-4 w-64"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                </div>

                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setPaymentStatusFilter("all");
                    setPaymentSearchQuery("");
                    setPaymentDateFilter("all");
                    setPaymentMethodFilter("all");
                  }}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Clear
                </Button>

                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            {/* Payment Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">{paymentStats.total}</p>
                      <p className="text-blue-100 text-sm">Total Orders</p>
                    </div>
                    <div className="p-2 bg-white/20 rounded-lg">
                      <BookIcon className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">{paymentStats.pending}</p>
                      <p className="text-yellow-100 text-sm">Pending</p>
                    </div>
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Clock className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">{paymentStats.paid}</p>
                      <p className="text-green-100 text-sm">Paid</p>
                    </div>
                    <div className="p-2 bg-white/20 rounded-lg">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">{paymentStats.failed}</p>
                      <p className="text-red-100 text-sm">Failed</p>
                    </div>
                    <div className="p-2 bg-white/20 rounded-lg">
                      <X className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">₹{paymentStats.totalAmount.toFixed(0)}</p>
                      <p className="text-purple-100 text-sm">Total Revenue</p>
                    </div>
                    <div className="p-2 bg-white/20 rounded-lg">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payment Orders Table */}
            <Card>
              <CardContent className="p-6">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Payment Method</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paymentOrdersLoading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            <div className="flex items-center justify-center space-x-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                              <span>Loading payment orders...</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : filteredPaymentOrders.length > 0 ? (
                        filteredPaymentOrders.map((order) => {
                          let cartItems = [];
                          try {
                            cartItems = JSON.parse(order.cartItems || '[]');
                          } catch (e) {
                            cartItems = [];
                          }

                          return (
                            <TableRow key={order.id} className="hover:bg-gray-50">
                              <TableCell className="font-medium">
                                <div className="flex flex-col">
                                  <span className="font-mono text-sm">#{order.orderId}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {order.paymentSessionId && `Session: ${order.paymentSessionId.slice(-8)}`}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{order.customerName}</div>
                                  <div className="text-sm text-muted-foreground">{order.customerEmail}</div>
                                  <div className="text-xs text-muted-foreground">{order.customerPhone}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {order.paymentMethod?.toUpperCase() || 'Unknown'}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-medium">
                                ₹{parseFloat(order.amount || '0').toFixed(2)}
                                <div className="text-xs text-muted-foreground">{order.currency}</div>
                              </TableCell>
                              <TableCell>
                                <Badge className={
                                  order.status === 'paid' || order.status === 'success' ? 'bg-green-100 text-green-800' :
                                  order.status === 'pending' || order.status === 'created' ? 'bg-yellow-100 text-yellow-800' :
                                  order.status === 'failed' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }>
                                  {order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Unknown'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {order.createdAt ? new Date(order.createdAt).toLocaleTimeString() : ''}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-1">
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
                                        View
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                      <DialogHeader>
                                        <DialogTitle>Payment Order Details</DialogTitle>
                                      </DialogHeader>
                                      <div className="space-y-4 py-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <div className="space-y-2">
                                            <Label>Order ID</Label>
                                            <div className="p-2 bg-gray-50 rounded border font-mono text-sm">
                                              {order.orderId}
                                            </div>
                                          </div>
                                          <div className="space-y-2">
                                            <Label>Payment Session ID</Label>
                                            <div className="p-2 bg-gray-50 rounded border font-mono text-xs">
                                              {order.paymentSessionId || 'N/A'}
                                            </div>
                                          </div>
                                          <div className="space-y-2">
                                            <Label>Customer Name</Label>
                                            <div className="p-2 bg-gray-50 rounded border">
                                              {order.customerName}
                                            </div>
                                          </div>
                                          <div className="space-y-2">
                                            <Label>Customer Email</Label>
                                            <div className="p-2 bg-gray-50 rounded border">
                                              {order.customerEmail}
                                            </div>
                                          </div>
                                          <div className="space-y-2">
                                            <Label>Phone</Label>
                                            <div className="p-2 bg-gray-50 rounded border">
                                              {order.customerPhone}
                                            </div>
                                          </div>
                                          <div className="space-y-2">
                                            <Label>Amount</Label>
                                            <div className="p-2 bg-gray-50 rounded border font-medium">
                                              ₹{parseFloat(order.amount || '0').toFixed(2)} {order.currency}
                                            </div>
                                          </div>
                                          <div className="space-y-2">
                                            <Label>Status</Label>
                                            <div className="p-2 bg-gray-50 rounded border">
                                              <Badge className={
                                                order.status === 'paid' || order.status === 'success' ? 'bg-green-100 text-green-800' :
                                                order.status === 'pending' || order.status === 'created' ? 'bg-yellow-100 text-yellow-800' :
                                                order.status === 'failed' ? 'bg-red-100 text-red-800' :
                                                'bg-gray-100 text-gray-800'
                                              }>
                                                {order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Unknown'}
                                              </Badge>
                                            </div>
                                          </div>
                                          <div className="space-y-2">
                                            <Label>Payment Method</Label>
                                            <div className="p-2 bg-gray-50 rounded border">
                                              {order.paymentMethod?.toUpperCase() || 'Unknown'}
                                            </div>
                                          </div>
                                        </div>

                                        <div className="space-y-2">
                                          <Label>Shipping Address</Label>
                                          <div className="p-3 bg-gray-50 rounded border">
                                            <div>{order.shippingAddress}</div>
                                            <div>{order.shippingCity}, {order.shippingState} - {order.shippingPincode}</div>
                                            {order.shippingLandmark && <div>Landmark: {order.shippingLandmark}</div>}
                                          </div>
                                        </div>

                                        {cartItems.length > 0 && (
                                          <div className="space-y-2">
                                            <Label>Cart Items</Label>
                                            <div className="p-3 bg-gray-50 rounded border space-y-2">
                                              {cartItems.map((item, index) => (
                                                <div key={index} className="flex justify-between items-center p-2 bg-white rounded border">
                                                  <div>
                                                    <div className="font-medium">{item.bookTitle || item.title}</div>
                                                    <div className="text-sm text-gray-600">Qty: {item.quantity}</div>
                                                  </div>
                                                  <div className="text-right">
                                                    <div className="font-medium">₹{item.price}</div>
                                                    {item.rentalDays && <div className="text-xs text-gray-500">{item.rentalDays} days</div>}
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}

                                        {order.transactionId && (
                                          <div className="space-y-2">
                                            <Label>Transaction ID</Label>
                                            <div className="p-2 bg-gray-50 rounded border font-mono text-sm">
                                              {order.transactionId}
                                            </div>
                                          </div>
                                        )}

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <div className="space-y-2">
                                            <Label>Created At</Label>
                                            <div className="p-2 bg-gray-50 rounded border">
                                              {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}
                                            </div>
                                          </div>
                                          <div className="space-y-2">
                                            <Label>Updated At</Label>
                                            <div className="p-2 bg-gray-50 rounded border">
                                              {order.updatedAt ? new Date(order.updatedAt).toLocaleString() : 'N/A'}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                  
                                  {/* Additional Action Buttons */}
                                  {(order.status === 'pending' || order.status === 'created') && (
                                    <>
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="text-green-600 hover:text-green-800"
                                        onClick={() => {
                                          if (confirm('Mark this payment as completed?')) {
                                            // Add mutation for updating payment status
                                            console.log('Marking payment as paid:', order.id);
                                          }
                                        }}
                                      >
                                        Mark Paid
                                      </Button>
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="text-red-600 hover:text-red-800"
                                        onClick={() => {
                                          if (confirm('Mark this payment as failed?')) {
                                            console.log('Marking payment as failed:', order.id);
                                          }
                                        }}
                                      >
                                        Mark Failed
                                      </Button>
                                    </>
                                  )}
                                  
                                  {order.status === 'failed' && (
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="text-blue-600 hover:text-blue-800"
                                      onClick={() => {
                                        console.log('Retrying payment:', order.id);
                                      }}
                                    >
                                      Retry
                                    </Button>
                                  )}
                                  
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-purple-600 hover:text-purple-800"
                                    onClick={() => {
                                      const mailtoLink = `mailto:${order.customerEmail}?subject=Regarding Your Order ${order.orderId}&body=Dear ${order.customerName},%0D%0A%0D%0ARegarding your order ${order.orderId}...`;
                                      window.open(mailtoLink);
                                    }}
                                  >
                                    Email
                                  </Button>
                                  
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-gray-600 hover:text-gray-800"
                                    onClick={() => {
                                      navigator.clipboard.writeText(order.orderId);
                                      alert('Order ID copied to clipboard');
                                    }}
                                  >
                                    Copy ID
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-12">
                            <div className="flex flex-col items-center space-y-2">
                              <BookIcon className="h-8 w-8 text-muted-foreground" />
                              <div className="text-muted-foreground">
                                {paymentSearchQuery || paymentStatusFilter !== "all" || paymentDateFilter !== "all" || paymentMethodFilter !== "all"
                                  ? "No payment orders match your filters"
                                  : "No payment orders found"
                                }
                              </div>
                              {(paymentSearchQuery || paymentStatusFilter !== "all" || paymentDateFilter !== "all" || paymentMethodFilter !== "all") && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => {
                                    setPaymentStatusFilter("all");
                                    setPaymentSearchQuery("");
                                    setPaymentDateFilter("all");
                                    setPaymentMethodFilter("all");
                                  }}
                                >
                                  Clear Filters
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                
                {filteredPaymentOrders.length > 0 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      Showing {paymentStats.filteredCount} of {paymentStats.total} payment orders
                      {paymentStatusFilter !== "all" && ` (${paymentStatusFilter})`}
                      {paymentDateFilter !== "all" && ` (${paymentDateFilter})`}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Filtered Revenue: ₹{paymentStats.filteredAmount.toFixed(2)} | 
                      Total Revenue: ₹{paymentStats.totalAmount.toFixed(2)}
                    </div>
                  </div>
                )}
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
                      <p className="text-2xl font-bold">{contactStats.total || 0}</p>
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
                      <p className="text-2xl font-bold text-orange-600">{contactStats.unread || 0}</p>
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
                      <p className="text-2xl font-bold text-green-600">{contactStats.responded || 0}</p>
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
                      <p className="text-2xl font-bold">{contactStats.avgResponseTime || '2.4h'}</p>
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
                        {contactMessagesLoading ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center">Loading messages...</TableCell>
                          </TableRow>
                        ) : contactMessages.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center">No messages found</TableCell>
                          </TableRow>
                        ) : (
                          contactMessages.map((message: any) => (
                            <TableRow key={message.id}>
                              <TableCell>
                                <Badge className={
                                  message.status === 'unread' ? 'bg-red-100 text-red-800' :
                                    message.status === 'responded' ? 'bg-green-100 text-green-800' :
                                      'bg-yellow-100 text-yellow-800'
                                }>
                                  {message.status.charAt(0).toUpperCase() + message.status.slice(1)}
                                </Badge>
                              </TableCell>
                              <TableCell>{message.name}</TableCell>
                              <TableCell>{message.email}</TableCell>
                              <TableCell>{message.subject}</TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {message.category.charAt(0).toUpperCase() + message.category.slice(1)}
                                </Badge>
                              </TableCell>
                              <TableCell>{new Date(message.createdAt).toLocaleDateString()}</TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-blue-600"
                                        onClick={() => {
                                          if (message.status === 'unread') {
                                            updateMessageStatusMutation.mutate({ id: message.id, status: 'read' });
                                          }
                                        }}
                                      >
                                        View
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                      <DialogHeader>
                                        <DialogTitle>Message Details</DialogTitle>
                                      </DialogHeader>
                                      <div className="space-y-4 py-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <div className="space-y-2">
                                            <Label className="text-sm font-medium">Name</Label>
                                            <div className="p-2 bg-gray-50 rounded border">
                                              {message.name}
                                            </div>
                                          </div>
                                          <div className="space-y-2">
                                            <Label className="text-sm font-medium">Email</Label>
                                            <div className="p-2 bg-gray-50 rounded border">
                                              {message.email}
                                            </div>
                                          </div>
                                          <div className="space-y-2">
                                            <Label className="text-sm font-medium">Phone</Label>
                                            <div className="p-2 bg-gray-50 rounded border">
                                              {message.phone || 'Not provided'}
                                            </div>
                                          </div>
                                          <div className="space-y-2">
                                            <Label className="text-sm font-medium">Category</Label>
                                            <div className="p-2 bg-gray-50 rounded border">
                                              <Badge variant="outline">
                                                {message.category.charAt(0).toUpperCase() + message.category.slice(1)}
                                              </Badge>
                                            </div>
                                          </div>
                                          <div className="space-y-2">
                                            <Label className="text-sm font-medium">Date</Label>
                                            <div className="p-2 bg-gray-50 rounded border">
                                              {new Date(message.createdAt).toLocaleString()}
                                            </div>
                                          </div>
                                          <div className="space-y-2">
                                            <Label className="text-sm font-medium">Status</Label>
                                            <div className="p-2 bg-gray-50 rounded border">
                                              <Badge className={
                                                message.status === 'unread' ? 'bg-red-100 text-red-800' :
                                                  message.status === 'responded' ? 'bg-green-100 text-green-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                              }>
                                                {message.status.charAt(0).toUpperCase() + message.status.slice(1)}
                                              </Badge>
                                            </div>
                                          </div>
                                        </div>

                                        <div className="space-y-2">
                                          <Label className="text-sm font-medium">Subject</Label>
                                          <div className="p-3 bg-gray-50 rounded border">
                                            {message.subject}
                                          </div>
                                        </div>

                                        <div className="space-y-2">
                                          <Label className="text-sm font-medium">Message</Label>
                                          <div className="p-4 bg-gray-50 rounded border min-h-[100px] whitespace-pre-wrap">
                                            {message.message}
                                          </div>
                                        </div>

                                        {message.status === 'responded' && message.response && (
                                          <div className="space-y-2 border-t pt-4">
                                            <Label className="text-sm font-medium text-green-600">Admin Response</Label>
                                            <div className="p-4 bg-green-50 rounded border whitespace-pre-wrap">
                                              {message.response}
                                            </div>
                                            {message.respondedAt && (
                                              <div className="text-xs text-gray-500">
                                                Responded on: {new Date(message.respondedAt).toLocaleString()}
                                              </div>
                                            )}
                                          </div>
                                        )}

                                        {message.status !== 'responded' && (
                                          <div className="space-y-2 border-t pt-4">
                                            <Label className="text-sm font-medium">Reply to this message</Label>
                                            <Textarea
                                              placeholder="Type your response here..."
                                              rows={4}
                                              className="resize-none"
                                            />
                                            <div className="flex justify-end">
                                              <Button
                                                onClick={() => {
                                                  updateMessageStatusMutation.mutate({ id: message.id, status: 'responded' });
                                                }}
                                                disabled={updateMessageStatusMutation.isPending}
                                              >
                                                {updateMessageStatusMutation.isPending ? "Sending..." : "Send Reply"}
                                              </Button>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                  {message.status !== 'responded' && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-green-600"
                                      onClick={() => updateMessageStatusMutation.mutate({ id: message.id, status: 'responded' })}
                                      disabled={updateMessageStatusMutation.isPending}
                                    >
                                      {message.status === 'unread' ? 'Reply' : 'Mark Replied'}
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
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

  const handleTabChange = (newTab: string) => {
    // Close all dialogs when changing tabs
    setShowUserDialog(false);
    setShowAddBookDialog(false);
    setShowEditBookDialog(false);
    setSelectedUser(null);
    setEditingBook(null);
    resetBookForm();

    // Set the new active tab
    setActiveTab(newTab);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar activeTab={activeTab} onTabChange={handleTabChange} />

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

      {/* User Details Dialog - Moved outside to prevent z-index conflicts */}
      {showUserDialog && (
        <Dialog 
          open={showUserDialog} 
          onOpenChange={(open) => {
            console.log('Dialog onOpenChange called with:', open);
            setShowUserDialog(open);
          }}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
            </DialogHeader>
            {selectedUser ? (
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">First Name</Label>
                    <div className="p-2 bg-gray-50 rounded border">
                      {selectedUser.firstName || 'N/A'}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Last Name</Label>
                    <div className="p-2 bg-gray-50 rounded border">
                      {selectedUser.lastName || 'N/A'}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Email</Label>
                    <div className="p-2 bg-gray-50 rounded border">
                      {selectedUser.email || 'N/A'}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Username</Label>
                    <div className="p-2 bg-gray-50 rounded border">
                      {selectedUser.username || 'N/A'}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Phone</Label>
                    <div className="p-2 bg-gray-50 rounded border">
                      {selectedUser.phone || 'N/A'}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Join Date</Label>
                    <div className="p-2 bg-gray-50 rounded border">
                      {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">User Type</Label>
                    <div className="p-2 bg-gray-50 rounded border">
                      <Badge className={selectedUser.isAdmin ? "bg-purple-100 text-purple-800" : "bg-green-100 text-green-800"}>
                        {selectedUser.isAdmin ? 'Admin' : 'Regular User'}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Active Rentals</Label>
                    <div className="p-2 bg-gray-50 rounded border">
                      {Array.isArray(rentals) ? rentals.filter(r => r.userId === selectedUser.id && r.status === 'active').length : 0}
                    </div>
                  </div>
                </div>

                {selectedUser.address && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Address</Label>
                    <div className="p-2 bg-gray-50 rounded border">
                      {selectedUser.address}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Recent Activity</Label>
                  <div className="p-4 bg-gray-50 rounded border">
                    <div className="text-sm text-gray-600">
                      {Array.isArray(rentals) && rentals.filter(r => r.userId === selectedUser.id).length > 0
                        ? `Total rentals: ${rentals.filter(r => r.userId === selectedUser.id).length}`
                        : 'No rental history'
                      }
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-4">
                <p className="text-center text-gray-500">No user selected</p>
                <p className="text-center text-xs text-gray-400 mt-2">
                  Debug: showUserDialog={showUserDialog.toString()}, selectedUser={selectedUser?.id || 'null'}
                </p>
              </div>
            )}
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => {
                setShowUserDialog(false);
                setSelectedUser(null);
              }}>
                Close
              </Button>
              {selectedUser && (
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleSuspendUser(selectedUser.id);
                    setShowUserDialog(false);
                    setSelectedUser(null);
                  }}
                  disabled={suspendUserMutation.isPending}
                >
                  {suspendUserMutation.isPending ? "Suspending..." : "Suspend User"}
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}