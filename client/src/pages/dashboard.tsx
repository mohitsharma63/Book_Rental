
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  Book as BookIcon, 
  Clock, 
  AlertTriangle, 
  Heart, 
  Trash2, 
  History,
  Settings,
  User,
  Calendar,
  Star,
  ShoppingCart,
  BookOpen,
  Award,
  TrendingUp,
  Menu,
  X,
  ChevronRight
} from "lucide-react";
import { Link } from "wouter";

// Static data for demonstration
const staticRentals = [
  {
    id: "rental1",
    bookId: "book1",
    userId: "user1",
    status: "active",
    rentalDate: "2024-01-15",
    dueDate: "2024-02-15",
    returnDate: null,
    rating: null,
    review: null
  },
  {
    id: "rental2",
    bookId: "book2",
    userId: "user1",
    status: "overdue",
    rentalDate: "2024-01-01",
    dueDate: "2024-01-31",
    returnDate: null,
    rating: null,
    review: null
  },
  {
    id: "rental3",
    bookId: "book3",
    userId: "user1",
    status: "active",
    rentalDate: "2024-01-20",
    dueDate: "2024-02-20",
    returnDate: null,
    rating: null,
    review: null
  },
  {
    id: "rental4",
    bookId: "book4",
    userId: "user1",
    status: "completed",
    rentalDate: "2023-12-01",
    dueDate: "2023-12-31",
    returnDate: "2023-12-25",
    rating: 5,
    review: "Excellent read!"
  },
  {
    id: "rental5",
    bookId: "book5",
    userId: "user1",
    status: "completed",
    rentalDate: "2023-11-01",
    dueDate: "2023-11-30",
    returnDate: "2023-11-28",
    rating: 4,
    review: "Great book, loved the story"
  },
  {
    id: "rental6",
    bookId: "book6",
    userId: "user1",
    status: "completed",
    rentalDate: "2023-10-01",
    dueDate: "2023-10-30",
    returnDate: "2023-10-25",
    rating: 5,
    review: "Amazing writing style"
  },
  {
    id: "rental7",
    bookId: "book7",
    userId: "user1",
    status: "completed",
    rentalDate: "2023-09-01",
    dueDate: "2023-09-30",
    returnDate: "2023-09-28",
    rating: 3,
    review: "It was okay"
  }
];

const staticBooks = [
  {
    id: "book1",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    isbn: "9780743273565",
    genre: "Fiction",
    publishedYear: 1925,
    availableCopies: 3,
    totalCopies: 5,
    imageUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=280"
  },
  {
    id: "book2",
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    isbn: "9780061120084",
    genre: "Fiction",
    publishedYear: 1960,
    availableCopies: 0,
    totalCopies: 4,
    imageUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=280"
  },
  {
    id: "book3",
    title: "1984",
    author: "George Orwell",
    isbn: "9780451524935",
    genre: "Dystopian Fiction",
    publishedYear: 1949,
    availableCopies: 2,
    totalCopies: 3,
    imageUrl: "https://images.unsplash.com/photo-1495640388908-05fa85288e61?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=280"
  },
  {
    id: "book4",
    title: "Pride and Prejudice",
    author: "Jane Austen",
    isbn: "9780141439518",
    genre: "Romance",
    publishedYear: 1813,
    availableCopies: 5,
    totalCopies: 6,
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=280"
  },
  {
    id: "book5",
    title: "The Catcher in the Rye",
    author: "J.D. Salinger",
    isbn: "9780316769174",
    genre: "Coming-of-age Fiction",
    publishedYear: 1951,
    availableCopies: 1,
    totalCopies: 2,
    imageUrl: "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=280"
  },
  {
    id: "book6",
    title: "The Silent Patient",
    author: "Alex Michaelides",
    isbn: "9781250301697",
    genre: "Thriller",
    publishedYear: 2019,
    availableCopies: 2,
    totalCopies: 3,
    imageUrl: "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=280"
  },
  {
    id: "book7",
    title: "Where the Crawdads Sing",
    author: "Delia Owens",
    isbn: "9780735219090",
    genre: "Fiction",
    publishedYear: 2018,
    availableCopies: 1,
    totalCopies: 2,
    imageUrl: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=280"
  }
];

const staticWishlist = [
  {
    id: "wish1",
    bookId: "book8",
    title: "The Seven Husbands of Evelyn Hugo",
    author: "Taylor Jenkins Reid",
    imageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=280",
    available: true,
    dateAdded: "2024-01-10"
  },
  {
    id: "wish2",
    bookId: "book9",
    title: "Educated",
    author: "Tara Westover",
    imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=280",
    available: true,
    dateAdded: "2024-01-05"
  }
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Mock current user ID
  const currentUserId = "user1";

  // Use static data instead of API calls
  const rentals = staticRentals;
  const books = staticBooks;

  const currentRentals = rentals?.filter(rental => rental.status === "active" || rental.status === "overdue") || [];
  const rentalHistory = rentals?.filter(rental => rental.status === "completed") || [];
  const allHistory = [...currentRentals, ...rentalHistory].sort((a, b) => 
    new Date(b.rentalDate).getTime() - new Date(a.rentalDate).getTime()
  );

  const stats = {
    activeRentals: currentRentals.length,
    totalRentals: rentals?.length || 0,
    completedRentals: rentalHistory.length,
    dueSoon: currentRentals.filter(rental => {
      const dueDate = new Date(rental.dueDate);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return dueDate <= tomorrow;
    }).length,
    wishlist: staticWishlist.length,
    averageRating: rentalHistory.reduce((sum, rental) => sum + (rental.rating || 0), 0) / rentalHistory.filter(r => r.rating).length || 0,
    favoriteGenre: "Fiction"
  };

  const getRentalBook = (bookId: string) => {
    return books?.find(book => book.id === bookId);
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const sidebarItems = [
    { 
      id: "overview", 
      label: "Overview", 
      icon: TrendingUp,
      description: "Statistics and summary"
    },
    { 
      id: "current", 
      label: "Current Rentals", 
      icon: BookIcon,
      count: stats.activeRentals,
      description: "Currently borrowed books"
    },
    { 
      id: "history", 
      label: "Complete History", 
      icon: History,
      count: stats.totalRentals,
      description: "All rental records"
    },
    { 
      id: "completed", 
      label: "Completed Rentals", 
      icon: BookOpen,
      count: stats.completedRentals,
      description: "Books you've finished"
    },
    { 
      id: "wishlist", 
      label: "Wishlist", 
      icon: Heart,
      count: stats.wishlist,
      description: "Books you want to read"
    },
    { 
      id: "reviews", 
      label: "My Reviews", 
      icon: Star,
      count: rentalHistory.filter(r => r.review).length,
      description: "Your book reviews"
    },
    { 
      id: "profile", 
      label: "Profile Settings", 
      icon: Settings,
      description: "Account management"
    },
  ];

  const SidebarContent = ({ onClose }: { onClose?: () => void }) => (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-6 border-b border-gray-200/50 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5"></div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900" data-testid="text-menu-title">My Library</h2>
              <p className="text-sm text-gray-600">Reading journey & insights</p>
            </div>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose} className="lg:hidden hover:bg-white/50 rounded-lg">
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      {/* User Profile Section */}
      <div className="p-6 border-b border-gray-200/50 bg-gradient-to-r from-gray-50 to-gray-100/50">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <User className="h-7 w-7 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-gray-900 text-base truncate">John Doe</p>
            <p className="text-sm text-gray-600 truncate">john.doe@example.com</p>
            <div className="flex items-center mt-2 bg-gradient-to-r from-yellow-50 to-orange-50 px-2 py-1 rounded-lg border border-yellow-200/50">
              <Award className="h-4 w-4 text-amber-500 mr-2 flex-shrink-0" />
              <span className="text-xs font-medium text-amber-700">Book Enthusiast</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-3 lg:p-4 overflow-y-auto">
        <ul className="space-y-1 lg:space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => {
                    setActiveTab(item.id);
                    onClose?.();
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all duration-300 transform hover:scale-[1.02] ${
                    activeTab === item.id
                      ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200/50 shadow-md"
                      : "text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:shadow-sm"
                  }`}
                  data-testid={`tab-${item.id}`}
                >
                  <div className="flex items-center space-x-2 lg:space-x-3 min-w-0 flex-1">
                    <Icon className={`h-4 w-4 lg:h-5 lg:w-5 flex-shrink-0 ${
                      activeTab === item.id ? "text-blue-600" : "text-gray-500"
                    }`} />
                    <div className="min-w-0 flex-1">
                      <span className="font-medium text-sm lg:text-base block truncate">{item.label}</span>
                      <p className="text-xs text-gray-500 hidden lg:block truncate">{item.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 flex-shrink-0">
                    {item.count !== undefined && (
                      <Badge 
                        className={`text-xs ${
                          activeTab === item.id 
                            ? "bg-blue-100 text-blue-700" 
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {item.count}
                      </Badge>
                    )}
                    <ChevronRight className="h-3 w-3 text-gray-400 lg:hidden" />
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Quick Actions */}
      <div className="p-6 border-t border-gray-200/50 bg-gradient-to-r from-gray-50/50 to-white space-y-3">
        <Link href="/catalog">
          <Button className="w-full text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]" size="sm" data-testid="button-browse-books">
            <BookIcon className="mr-2 h-4 w-4" />
            Browse Books
          </Button>
        </Link>
        <Link href="/cart">
          <Button variant="outline" className="w-full text-sm font-medium border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 transform hover:scale-[1.02]" size="sm" data-testid="button-view-cart">
            <ShoppingCart className="mr-2 h-4 w-4" />
            View Cart
          </Button>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white/95 backdrop-blur-md border-b border-gray-200/50 px-4 py-3 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center justify-between">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100">
                <Menu className="h-5 w-5" />
                <span className="text-sm font-medium">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-full max-w-[320px] sm:max-w-[380px]">
              <SidebarContent onClose={() => setSidebarOpen(false)} />
            </SheetContent>
          </Sheet>
          <div className="flex-1 text-center">
            <h1 className="text-lg font-bold text-gray-900 truncate">
              {sidebarItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
            </h1>
          </div>
          <div className="w-[72px] flex justify-end">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-80 bg-white shadow-lg border-r border-gray-200">
          <SidebarContent />
        </div>

        {/* Main Content */}
        <div className="flex-1 p-3 sm:p-4 lg:p-8 overflow-x-hidden">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6 lg:space-y-8">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold mb-2">Welcome back, John!</h1>
                <p className="text-gray-600 text-sm lg:text-base">Here's a summary of your reading journey</p>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                <Card className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white shadow-xl border-0 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-3xl font-bold mb-1" data-testid="stat-active-rentals">{stats.activeRentals}</p>
                        <p className="text-blue-100 text-sm font-medium">Currently Reading</p>
                      </div>
                      <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                        <BookIcon className="h-8 w-8" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-emerald-500 via-green-600 to-green-700 text-white shadow-xl border-0 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-3xl font-bold mb-1" data-testid="stat-total-books">{stats.completedRentals}</p>
                        <p className="text-green-100 text-sm font-medium">Books Completed</p>
                      </div>
                      <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                        <BookOpen className="h-8 w-8" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-purple-500 via-violet-600 to-purple-700 text-white shadow-xl border-0 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-3xl font-bold mb-1" data-testid="stat-avg-rating">{stats.averageRating.toFixed(1)}</p>
                        <p className="text-purple-100 text-sm font-medium">Average Rating</p>
                      </div>
                      <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                        <Star className="h-8 w-8" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-orange-500 via-amber-600 to-orange-700 text-white shadow-xl border-0 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-3xl font-bold mb-1" data-testid="stat-wishlist">{stats.wishlist}</p>
                        <p className="text-orange-100 text-sm font-medium">Wishlist Items</p>
                      </div>
                      <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                        <Heart className="h-8 w-8" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card>
                <CardContent className="p-4 lg:p-6">
                  <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                  <div className="space-y-3 lg:space-y-4">
                    {allHistory.slice(0, 5).map((rental) => {
                      const book = getRentalBook(rental.bookId);
                      if (!book) return null;
                      
                      return (
                        <div key={rental.id} className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 p-2 sm:p-3 bg-gray-50 rounded-lg">
                          <img 
                            src={book.imageUrl} 
                            alt={book.title}
                            className="w-8 h-12 sm:w-10 sm:h-14 lg:w-12 lg:h-16 object-cover rounded flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-xs sm:text-sm lg:text-base truncate">{book.title}</h4>
                            <p className="text-xs lg:text-sm text-gray-600 truncate">{book.author}</p>
                            <p className="text-xs text-gray-500 leading-relaxed">
                              {rental.status === "completed" ? "Completed" : "Currently reading"} • 
                              {new Date(rental.rentalDate).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge className={`text-xs flex-shrink-0 px-2 py-1 ${
                            rental.status === "completed" ? "bg-green-100 text-green-800" :
                            rental.status === "overdue" ? "bg-red-100 text-red-800" :
                            "bg-blue-100 text-blue-800"
                          }`}>
                            {rental.status}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Current Rentals Tab */}
          {activeTab === "current" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h3 className="text-xl lg:text-2xl font-semibold">Current Rentals</h3>
                <Badge className="bg-blue-100 text-blue-800">
                  {currentRentals.length} Active
                </Badge>
              </div>
              
              <div className="space-y-4">
                {currentRentals.map((rental) => {
                  const book = getRentalBook(rental.bookId);
                  if (!book) return null;
                  
                  const daysUntilDue = getDaysUntilDue(rental.dueDate);
                  const isOverdue = daysUntilDue < 0;
                  const isDueSoon = daysUntilDue <= 1 && daysUntilDue >= 0;
                  
                  return (
                    <Card key={rental.id} className="overflow-hidden">
                      <CardContent className="p-4 lg:p-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                          <div className="flex items-start space-x-3 lg:space-x-4 flex-1 min-w-0">
                            <img 
                              src={book.imageUrl || "/placeholder-book.jpg"} 
                              alt={`${book.title} cover`}
                              className="w-12 h-18 lg:w-16 lg:h-24 object-cover rounded shadow-sm flex-shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <h4 className="font-semibold text-base lg:text-lg truncate">{book.title}</h4>
                              <p className="text-sm text-muted-foreground truncate">{book.author}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <Calendar className="h-3 w-3 lg:h-4 lg:w-4 text-gray-400 flex-shrink-0" />
                                <p className="text-xs lg:text-sm text-muted-foreground">
                                  Rented: {new Date(rental.rentalDate).toLocaleDateString()}
                                </p>
                              </div>
                              <Badge 
                                className={`mt-2 text-xs ${
                                  rental.status === "overdue" 
                                    ? "bg-red-100 text-red-800" 
                                    : "bg-green-100 text-green-800"
                                }`}
                              >
                                {rental.status === "overdue" ? "Overdue" : "Active"}
                              </Badge>
                            </div>
                          </div>
                          <div className="w-full sm:w-auto sm:text-right">
                            <p className={`text-sm font-medium mb-1 ${
                              isOverdue ? "text-red-600" : isDueSoon ? "text-yellow-600" : "text-gray-700"
                            }`}>
                              Due: {new Date(rental.dueDate).toLocaleDateString()}
                            </p>
                            <p className={`text-xs mb-3 ${
                              isOverdue ? "text-red-600" : isDueSoon ? "text-yellow-600" : "text-muted-foreground"
                            }`}>
                              {isOverdue 
                                ? `${Math.abs(daysUntilDue)} days overdue!` 
                                : isDueSoon 
                                ? "Due tomorrow!" 
                                : `${daysUntilDue} days left`}
                            </p>
                            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                              <Button size="sm" variant="outline" className="text-xs" data-testid={`button-extend-${rental.id}`}>
                                Extend
                              </Button>
                              <Button size="sm" className="text-xs" data-testid={`button-return-${rental.id}`}>
                                Return
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              
              {currentRentals.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <BookIcon className="mx-auto h-12 w-12 lg:h-16 lg:w-16 mb-4 text-gray-300" />
                  <h3 className="text-base lg:text-lg font-medium mb-2">No current rentals</h3>
                  <p className="text-sm">Browse our catalog to start renting books!</p>
                  <Link href="/catalog">
                    <Button className="mt-4">Browse Catalog</Button>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Complete History Tab */}
          {activeTab === "history" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h3 className="text-xl lg:text-2xl font-semibold">Complete History</h3>
                <Badge className="bg-gray-100 text-gray-800">
                  {allHistory.length} Total Records
                </Badge>
              </div>
              
              <div className="space-y-4">
                {allHistory.map((rental) => {
                  const book = getRentalBook(rental.bookId);
                  if (!book) return null;
                  
                  return (
                    <Card key={rental.id} className="overflow-hidden">
                      <CardContent className="p-4 lg:p-6">
                        <div className="flex flex-col sm:flex-row items-start gap-4">
                          <div className="flex items-start space-x-3 lg:space-x-4 flex-1 min-w-0">
                            <img 
                              src={book.imageUrl || "/placeholder-book.jpg"} 
                              alt={`${book.title} cover`}
                              className="w-12 h-18 lg:w-16 lg:h-24 object-cover rounded shadow-sm flex-shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <h4 className="font-semibold text-base lg:text-lg truncate">{book.title}</h4>
                              <p className="text-sm text-muted-foreground truncate">{book.author}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <Calendar className="h-3 w-3 lg:h-4 lg:w-4 text-gray-400 flex-shrink-0" />
                                <p className="text-xs lg:text-sm text-muted-foreground">
                                  {new Date(rental.rentalDate).toLocaleDateString()} - 
                                  {rental.returnDate ? new Date(rental.returnDate).toLocaleDateString() : 'In Progress'}
                                </p>
                              </div>
                              <div className="flex flex-wrap items-center gap-2 mt-2">
                                <Badge className={`text-xs ${
                                  rental.status === "completed" ? "bg-green-100 text-green-800" :
                                  rental.status === "overdue" ? "bg-red-100 text-red-800" :
                                  "bg-blue-100 text-blue-800"
                                }`}>
                                  {rental.status}
                                </Badge>
                                <Badge variant="outline" className="text-xs">{book.genre}</Badge>
                              </div>
                            </div>
                          </div>
                          <div className="w-full sm:w-auto">
                            {rental.rating && (
                              <div className="flex items-center text-sm text-yellow-500 mb-2">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={`h-3 w-3 lg:h-4 lg:w-4 ${i < rental.rating ? 'fill-current' : ''}`} />
                                ))}
                                <span className="ml-1 text-gray-600 text-xs">({rental.rating}/5)</span>
                              </div>
                            )}
                            {rental.review && (
                              <p className="text-xs text-muted-foreground max-w-48">
                                "{rental.review}"
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Completed Rentals Tab */}
          {activeTab === "completed" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h3 className="text-xl lg:text-2xl font-semibold">Completed Rentals</h3>
                <Badge className="bg-green-100 text-green-800">
                  {rentalHistory.length} Completed
                </Badge>
              </div>
              
              <div className="space-y-4">
                {rentalHistory.map((rental) => {
                  const book = getRentalBook(rental.bookId);
                  if (!book) return null;
                  
                  return (
                    <Card key={rental.id} className="overflow-hidden">
                      <CardContent className="p-4 lg:p-6">
                        <div className="flex flex-col sm:flex-row items-start gap-4">
                          <div className="flex items-start space-x-3 lg:space-x-4 flex-1 min-w-0">
                            <img 
                              src={book.imageUrl || "/placeholder-book.jpg"} 
                              alt={`${book.title} cover`}
                              className="w-12 h-18 lg:w-16 lg:h-24 object-cover rounded shadow-sm flex-shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <h4 className="font-semibold text-base lg:text-lg truncate">{book.title}</h4>
                              <p className="text-sm text-muted-foreground truncate">{book.author}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <Calendar className="h-3 w-3 lg:h-4 lg:w-4 text-gray-400 flex-shrink-0" />
                                <p className="text-xs lg:text-sm text-muted-foreground">
                                  {new Date(rental.rentalDate).toLocaleDateString()} - {rental.returnDate ? new Date(rental.returnDate).toLocaleDateString() : 'N/A'}
                                </p>
                              </div>
                              <Badge className="bg-green-100 text-green-800 mt-2 text-xs">Completed</Badge>
                            </div>
                          </div>
                          <div className="w-full sm:w-auto">
                            {rental.rating && (
                              <div className="flex items-center text-sm text-yellow-500 mb-2">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={`h-3 w-3 lg:h-4 lg:w-4 ${i < rental.rating ? 'fill-current' : ''}`} />
                                ))}
                                <span className="ml-1 text-gray-600 text-xs">({rental.rating}/5)</span>
                              </div>
                            )}
                            {rental.review && (
                              <p className="text-xs text-muted-foreground max-w-48">
                                "{rental.review}"
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              
              {rentalHistory.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Clock className="mx-auto h-12 w-12 lg:h-16 lg:w-16 mb-4 text-gray-300" />
                  <h3 className="text-base lg:text-lg font-medium mb-2">No completed rentals yet</h3>
                  <p className="text-sm">Your finished books will appear here.</p>
                </div>
              )}
            </div>
          )}
          
          {/* Wishlist Tab */}
          {activeTab === "wishlist" && (
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h3 className="text-xl lg:text-2xl font-semibold">My Wishlist</h3>
                <Badge className="bg-purple-100 text-purple-800">
                  {staticWishlist.length} Items
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {staticWishlist.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <img 
                        src={item.imageUrl} 
                        alt={`${item.title} cover`} 
                        className="w-full h-40 lg:h-48 object-cover rounded mb-3 shadow-sm"
                      />
                      <h4 className="font-semibold mb-1 truncate">{item.title}</h4>
                      <p className="text-sm text-muted-foreground mb-2 truncate">{item.author}</p>
                      <p className="text-xs text-gray-500 mb-3">Added {new Date(item.dateAdded).toLocaleDateString()}</p>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <Badge className={`text-xs ${
                          item.available 
                            ? "bg-green-100 text-green-800" 
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {item.available ? "Available" : "Rented Out"}
                        </Badge>
                        <div className="flex space-x-2">
                          {item.available ? (
                            <Button size="sm" className="text-xs" data-testid={`button-rent-wishlist-${item.id}`}>
                              Rent
                            </Button>
                          ) : (
                            <Button variant="secondary" size="sm" className="text-xs" data-testid={`button-notify-${item.id}`}>
                              Notify
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" data-testid={`button-remove-wishlist-${item.id}`}>
                            <Trash2 className="h-3 w-3 lg:h-4 lg:w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {staticWishlist.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Heart className="mx-auto h-12 w-12 lg:h-16 lg:w-16 mb-4 text-gray-300" />
                  <h3 className="text-base lg:text-lg font-medium mb-2">Your wishlist is empty</h3>
                  <p className="text-sm">Add books to your wishlist to keep track of what you want to read!</p>
                  <Link href="/catalog">
                    <Button className="mt-4">Browse Catalog</Button>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === "reviews" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h3 className="text-xl lg:text-2xl font-semibold">My Reviews</h3>
                <Badge className="bg-yellow-100 text-yellow-800">
                  {rentalHistory.filter(r => r.review).length} Reviews
                </Badge>
              </div>
              
              <div className="space-y-4">
                {rentalHistory.filter(r => r.review).map((rental) => {
                  const book = getRentalBook(rental.bookId);
                  if (!book) return null;
                  
                  return (
                    <Card key={rental.id} className="overflow-hidden">
                      <CardContent className="p-4 lg:p-6">
                        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                          <img 
                            src={book.imageUrl} 
                            alt={book.title}
                            className="w-16 h-24 lg:w-20 lg:h-28 object-cover rounded mx-auto sm:mx-0 flex-shrink-0"
                          />
                          <div className="flex-1 text-center sm:text-left">
                            <h4 className="font-semibold text-base lg:text-lg">{book.title}</h4>
                            <p className="text-sm text-gray-600">{book.author}</p>
                            <div className="flex items-center justify-center sm:justify-start mt-2 mb-3">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`h-3 w-3 lg:h-4 lg:w-4 text-yellow-500 ${i < rental.rating ? 'fill-current' : ''}`} />
                              ))}
                              <span className="ml-2 text-sm text-gray-600">({rental.rating}/5)</span>
                              <span className="ml-auto text-xs text-gray-500 hidden sm:inline">
                                {rental.returnDate ? new Date(rental.returnDate).toLocaleDateString() : ''}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 italic">"{rental.review}"</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              
              {rentalHistory.filter(r => r.review).length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Star className="mx-auto h-12 w-12 lg:h-16 lg:w-16 mb-4 text-gray-300" />
                  <h3 className="text-base lg:text-lg font-medium mb-2">No reviews yet</h3>
                  <p className="text-sm">Start rating and reviewing books you've read!</p>
                </div>
              )}
            </div>
          )}
          
          {/* Profile Settings Tab */}
          {activeTab === "profile" && (
            <div className="max-w-2xl mx-auto">
              <h3 className="text-xl lg:text-2xl font-semibold mb-6">Profile Settings</h3>
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
                
                <div>
                  <label className="block text-sm font-medium mb-2">Reading Preferences</label>
                  <Textarea 
                    rows={2} 
                    placeholder="Tell us about your favorite genres, authors, or reading habits..."
                    data-testid="textarea-preferences"
                  />
                </div>
                
                <div className="border-t pt-6">
                  <h4 className="font-medium mb-4">Account Information</h4>
                  <div className="text-sm text-gray-600 space-y-2">
                    <p><strong>Member Since:</strong> January 15, 2024</p>
                    <p><strong>Account Status:</strong> <Badge className="bg-green-100 text-green-800">Active</Badge></p>
                    <p><strong>Total Books Read:</strong> {stats.completedRentals}</p>
                    <p><strong>Average Rating Given:</strong> {stats.averageRating.toFixed(1)}/5</p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
                  <Button type="submit" className="w-full sm:w-auto" data-testid="button-save-profile">
                    Save Changes
                  </Button>
                  <Button type="button" variant="ghost" className="w-full sm:w-auto">
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
