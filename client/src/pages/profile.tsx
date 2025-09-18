
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  BookOpen,
  Clock,
  Package,
  Star,
  Edit3,
  Eye,
  Download,
  Heart,
  ShoppingCart,
  CreditCard,
  Settings,
  Bell,
  Shield,
  TrendingUp,
  Award,
  Target,
  Truck,
  CheckCircle
} from "lucide-react";

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showOrderDialog, setShowOrderDialog] = useState(false);

  // Static user data
  const userData = {
    id: "user_123",
    name: "Navin Kumar",
    email: "navin@gmail.com",
    phone: "+91 98765 43210",
    address: "123 Book Street, Reading City, RC 12345",
    joinDate: "January 15, 2024",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
    membership: "Premium",
    totalRentals: 47,
    activeRentals: 3,
    favoriteGenre: "Science Fiction",
    totalSpent: "₹12,450",
    readingStreak: 23
  };

  // Static order data
  const orders = [
    {
      id: "ORD-2024-001",
      date: "2024-01-20",
      status: "delivered",
      books: [
        {
          title: "The Alchemist",
          author: "Paulo Coelho",
          image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=200",
          rentalPeriod: "2 weeks",
          price: "₹299"
        }
      ],
      totalAmount: "₹299",
      deliveryDate: "2024-01-22",
      returnDate: "2024-02-05"
    },
    {
      id: "ORD-2024-002",
      date: "2024-01-15",
      status: "active",
      books: [
        {
          title: "Dune",
          author: "Frank Herbert",
          image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=200",
          rentalPeriod: "3 weeks",
          price: "₹450"
        },
        {
          title: "1984",
          author: "George Orwell",
          image: "https://images.unsplash.com/photo-1495640388908-05fa85288e61?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=200",
          rentalPeriod: "2 weeks",
          price: "₹350"
        }
      ],
      totalAmount: "₹800",
      deliveryDate: "2024-01-17",
      returnDate: "2024-02-07"
    },
    {
      id: "ORD-2024-003",
      date: "2024-01-10",
      status: "returned",
      books: [
        {
          title: "The Great Gatsby",
          author: "F. Scott Fitzgerald",
          image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=200",
          rentalPeriod: "1 week",
          price: "₹199"
        }
      ],
      totalAmount: "₹199",
      deliveryDate: "2024-01-12",
      returnDate: "2024-01-19"
    }
  ];

  // Static reading history
  const readingHistory = [
    {
      id: 1,
      title: "The Midnight Library",
      author: "Matt Haig",
      completedDate: "2024-01-18",
      rating: 5,
      review: "Absolutely loved this book! Life-changing perspective."
    },
    {
      id: 2,
      title: "Atomic Habits",
      author: "James Clear",
      completedDate: "2024-01-10",
      rating: 4,
      review: "Great insights on building good habits."
    },
    {
      id: 3,
      title: "The Silent Patient",
      author: "Alex Michaelides",
      completedDate: "2024-01-05",
      rating: 5,
      review: "Mind-blowing thriller with an unexpected twist!"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "active":
        return "bg-blue-100 text-blue-800";
      case "returned":
        return "bg-gray-100 text-gray-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getOrderProgress = (status: string) => {
    switch (status.toLowerCase()) {
      case "processing":
        return 25;
      case "shipped":
        return 75;
      case "delivered":
        return 100;
      case "active":
        return 100;
      case "returned":
        return 100;
      default:
        return 0;
    }
  };

  const handleViewDetails = (order: any) => {
    setSelectedOrder(order);
    setShowOrderDialog(true);
  };

  const handleDownloadInvoice = (order: any) => {
    // Create invoice content
    const invoiceContent = `
BOOK RENTAL INVOICE
==================

Order ID: ${order.id}
Order Date: ${new Date(order.date).toLocaleDateString()}
Status: ${order.status.toUpperCase()}

Customer Information:
Name: ${userData.name}
Email: ${userData.email}
Phone: ${userData.phone}

Billing Address:
${userData.address}

Order Details:
${order.books.map((book: any, index: number) => `
${index + 1}. ${book.title}
   Author: ${book.author}
   Rental Period: ${book.rentalPeriod}
   Price: ${book.price}
`).join('')}

Total Amount: ${order.totalAmount}
Delivery Date: ${order.deliveryDate}
${order.returnDate ? `Return Date: ${order.returnDate}` : ''}

Thank you for choosing our book rental service!
    `;

    // Create and download file
    const blob = new Blob([invoiceContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${order.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-6">
              <Avatar className="w-20 h-20 border-4 border-white shadow-lg">
                <AvatarImage src={userData.avatar} alt={userData.name} />
                <AvatarFallback className="text-2xl font-semibold">
                  {userData.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{userData.name}</h1>
                <p className="text-gray-600 flex items-center gap-2 mt-1">
                  <Mail className="h-4 w-4" />
                  {userData.email}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                    {userData.membership} Member
                  </Badge>
                  <span className="text-sm text-gray-500">
                    Member since {userData.joinDate}
                  </span>
                </div>
              </div>
            </div>
            <Button
              onClick={() => setIsEditing(!isEditing)}
              className="lg:self-start"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              {isEditing ? "Save Changes" : "Edit Profile"}
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{userData.totalRentals}</p>
                  <p className="text-blue-100 text-sm">Total Rentals</p>
                </div>
                <BookOpen className="h-8 w-8 text-white/80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{userData.activeRentals}</p>
                  <p className="text-green-100 text-sm">Active Rentals</p>
                </div>
                <Clock className="h-8 w-8 text-white/80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{userData.totalSpent}</p>
                  <p className="text-purple-100 text-sm">Total Spent</p>
                </div>
                <CreditCard className="h-8 w-8 text-white/80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{userData.readingStreak}</p>
                  <p className="text-orange-100 text-sm">Day Streak</p>
                </div>
                <Award className="h-8 w-8 text-white/80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full lg:w-auto grid-cols-2 lg:grid-cols-5 bg-white/60 backdrop-blur-sm">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Orders</span>
            </TabsTrigger>
            <TabsTrigger value="reading" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Reading</span>
            </TabsTrigger>
            <TabsTrigger value="wishlist" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">Wishlist</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Personal Information */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>Full Name</Label>
                        {isEditing ? (
                          <Input defaultValue={userData.name} className="mt-1" />
                        ) : (
                          <p className="mt-1 text-sm bg-gray-50 p-2 rounded">{userData.name}</p>
                        )}
                      </div>
                      <div>
                        <Label>Email</Label>
                        {isEditing ? (
                          <Input defaultValue={userData.email} className="mt-1" />
                        ) : (
                          <p className="mt-1 text-sm bg-gray-50 p-2 rounded">{userData.email}</p>
                        )}
                      </div>
                      <div>
                        <Label>Phone</Label>
                        {isEditing ? (
                          <Input defaultValue={userData.phone} className="mt-1" />
                        ) : (
                          <p className="mt-1 text-sm bg-gray-50 p-2 rounded">{userData.phone}</p>
                        )}
                      </div>
                      <div>
                        <Label>Membership</Label>
                        <p className="mt-1 text-sm bg-gray-50 p-2 rounded">{userData.membership}</p>
                      </div>
                    </div>
                    <div>
                      <Label>Address</Label>
                      {isEditing ? (
                        <Input defaultValue={userData.address} className="mt-1" />
                      ) : (
                        <p className="mt-1 text-sm bg-gray-50 p-2 rounded">{userData.address}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Reading Stats */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Reading Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary mb-2">
                        {userData.readingStreak}
                      </div>
                      <p className="text-sm text-gray-600">Day Reading Streak</p>
                      <Progress value={75} className="mt-2" />
                    </div>
                    <Separator />
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Favorite Genre</span>
                        <span className="text-sm font-medium">{userData.favoriteGenre}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Books This Month</span>
                        <span className="text-sm font-medium">5</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Average Rating</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">4.8</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {orders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-6 bg-white shadow-sm">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                        <div className="flex items-center gap-4">
                          <div>
                            <h3 className="font-semibold text-lg">{order.id}</h3>
                            <p className="text-sm text-gray-600">
                              Ordered on {new Date(order.date).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-xl">{order.totalAmount}</p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-2"
                            onClick={() => handleViewDetails(order)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                      </div>

                      {/* Order Progress */}
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span>Order Progress</span>
                          <span>{getOrderProgress(order.status)}%</span>
                        </div>
                        <Progress value={getOrderProgress(order.status)} />
                      </div>

                      {/* Books in Order */}
                      <div className="space-y-3">
                        {order.books.map((book, index) => (
                          <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                            <img
                              src={book.image}
                              alt={book.title}
                              className="w-12 h-16 object-cover rounded"
                            />
                            <div className="flex-1">
                              <h4 className="font-medium">{book.title}</h4>
                              <p className="text-sm text-gray-600">by {book.author}</p>
                              <p className="text-sm text-gray-500">Rental: {book.rentalPeriod}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{book.price}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Order Timeline */}
                      <div className="mt-4 pt-4 border-t">
                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>Delivered: {order.deliveryDate}</span>
                          </div>
                          {order.returnDate && (
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-gray-400" />
                              <span>Return by: {order.returnDate}</span>
                            </div>
                          )}
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDownloadInvoice(order)}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Invoice
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reading History Tab */}
          <TabsContent value="reading" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Reading History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {readingHistory.map((book) => (
                    <div key={book.id} className="flex items-start gap-4 p-4 border rounded-lg">
                      <BookOpen className="h-8 w-8 text-primary mt-1" />
                      <div className="flex-1">
                        <h3 className="font-semibold">{book.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">by {book.author}</p>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < book.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-500">
                            Completed on {new Date(book.completedDate).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 italic">"{book.review}"</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Wishlist Tab */}
          <TabsContent value="wishlist" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  My Wishlist
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Your wishlist is empty</h3>
                  <p className="text-gray-600 mb-4">
                    Start adding books you'd like to read later
                  </p>
                  <Button>Browse Books</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Order Updates</h4>
                      <p className="text-sm text-gray-600">Get notified about your orders</p>
                    </div>
                    <input type="checkbox" defaultChecked className="toggle" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">New Releases</h4>
                      <p className="text-sm text-gray-600">Latest book recommendations</p>
                    </div>
                    <input type="checkbox" defaultChecked className="toggle" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Return Reminders</h4>
                      <p className="text-sm text-gray-600">Reminders for book returns</p>
                    </div>
                    <input type="checkbox" defaultChecked className="toggle" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Privacy & Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    Change Password
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Download My Data
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-red-600">
                    Delete Account
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Order Details Dialog */}
        <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Details - {selectedOrder?.id}
              </DialogTitle>
            </DialogHeader>
            
            {selectedOrder && (
              <div className="space-y-6 py-4">
                {/* Order Summary */}
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Order Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Order ID:</span>
                        <span className="font-medium">{selectedOrder.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Order Date:</span>
                        <span className="font-medium">{new Date(selectedOrder.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <Badge className={getStatusColor(selectedOrder.status)}>
                          {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Amount:</span>
                        <span className="font-semibold text-lg">{selectedOrder.totalAmount}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Delivery Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Delivery Date:</span>
                        <span className="font-medium">{selectedOrder.deliveryDate}</span>
                      </div>
                      {selectedOrder.returnDate && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Return Date:</span>
                          <span className="font-medium">{selectedOrder.returnDate}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Shipping Address:</span>
                        <span className="font-medium text-right">{userData.address}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Order Progress */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Order Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Order Status</span>
                        <span>{getOrderProgress(selectedOrder.status)}% Complete</span>
                      </div>
                      <Progress value={getOrderProgress(selectedOrder.status)} className="h-2" />
                      
                      {/* Progress Steps */}
                      <div className="flex justify-between text-xs text-gray-600 mt-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            getOrderProgress(selectedOrder.status) >= 25 ? 'bg-green-500 text-white' : 'bg-gray-200'
                          }`}>
                            <Package className="h-4 w-4" />
                          </div>
                          <span className="mt-1">Processing</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            getOrderProgress(selectedOrder.status) >= 75 ? 'bg-green-500 text-white' : 'bg-gray-200'
                          }`}>
                            <Truck className="h-4 w-4" />
                          </div>
                          <span className="mt-1">Shipped</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            getOrderProgress(selectedOrder.status) >= 100 ? 'bg-green-500 text-white' : 'bg-gray-200'
                          }`}>
                            <CheckCircle className="h-4 w-4" />
                          </div>
                          <span className="mt-1">Delivered</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Books in Order */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Books in this Order</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedOrder.books.map((book: any, index: number) => (
                        <div key={index} className="flex items-center gap-4 p-4 border rounded-lg bg-gray-50">
                          <img
                            src={book.image}
                            alt={book.title}
                            className="w-16 h-20 object-cover rounded shadow-sm"
                          />
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg">{book.title}</h4>
                            <p className="text-gray-600 mb-1">by {book.author}</p>
                            <p className="text-sm text-gray-500">Rental Period: {book.rentalPeriod}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-xl">{book.price}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button 
                    onClick={() => handleDownloadInvoice(selectedOrder)}
                    className="flex-1"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Invoice
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setShowOrderDialog(false)}
                    className="flex-1"
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
