import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { useAuth } from "@/lib/auth-context";
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
  CheckCircle,
  Search,
  MessageCircle,
  RotateCcw
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Profile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [editFormData, setEditFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: ""
  });

  const queryClient = useQueryClient();

  // Get current user ID from AuthContext
  const currentUserId = user?.id;

  // Fetch user data
  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ['user', currentUserId],
    queryFn: async () => {
      if (!currentUserId) {
        throw new Error('No user ID available');
      }
      const response = await fetch(`/api/users/${currentUserId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      const user = await response.json();

      // Transform data to match the component's expected format
      return {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: user.phone || "+91 98765 43210",
        address: user.address || "123 Book Street, Reading City, RC 12345",
        joinDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "January 15, 2024",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
        membership: user.isAdmin ? "Admin" : "Premium",

        firstName: user.firstName,
        lastName: user.lastName
      };
    },
    enabled: !!currentUserId
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async (updateData: any) => {
      const response = await fetch(`/api/users/${currentUserId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      if (!response.ok) {
        throw new Error('Failed to update user data');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', currentUserId] });
      setIsEditing(false);
    },
  });

  // Initialize form data when userData changes
  useEffect(() => {
    if (userData) {
      setEditFormData({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        email: userData.email || "",
        phone: userData.phone || "",
        address: userData.address || ""
      });
    }
  }, [userData]);

  const handleSaveChanges = () => {
    updateUserMutation.mutate(editFormData);
  };

  const handleFormChange = (field: string, value: string) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
  };

  // Show loading if user is not available or data is loading
  if (!user || userLoading || !currentUserId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <div className="text-lg font-medium">Loading your profile...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">User not found</div>
        </div>
      </div>
    );
  }

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

  const handleTrackOrder = (order: any) => {
    setSelectedOrder(order);
  };

  const handleDownloadInvoice = (order: any) => {
    const currentDate = new Date().toLocaleDateString();
    const invoiceNumber = `INV-${order.id}-${Date.now()}`;

    // Create detailed invoice content
    const invoiceContent = `
╔══════════════════════════════════════════════════════════════════╗
║                        BOOKWISE RENTALS                         ║
║                      TAX INVOICE                                 ║
╚══════════════════════════════════════════════════════════════════╝

Invoice Number: ${invoiceNumber}
Invoice Date: ${currentDate}
Order ID: ${order.id}
Order Date: ${new Date(order.date).toLocaleDateString()}
Order Status: ${order.status.toUpperCase()}

══════════════════════════════════════════════════════════════════
                        CUSTOMER DETAILS
══════════════════════════════════════════════════════════════════

Name: ${userData.name}
Email: ${userData.email}
Phone: ${userData.phone}
Address: ${userData.address}

══════════════════════════════════════════════════════════════════
                        ORDER DETAILS
══════════════════════════════════════════════════════════════════

${order.books.map((book: any, index: number) => `
Item ${index + 1}:
  Book Title: ${book.title}
  Author: ${book.author}
  Rental Period: ${book.rentalPeriod}
  Price: ${book.price}

`).join('')}

══════════════════════════════════════════════════════════════════
                        BILLING SUMMARY
══════════════════════════════════════════════════════════════════

Subtotal: ${order.totalAmount}
GST (18%): ₹${(parseFloat(order.totalAmount.replace('₹', '')) * 0.18).toFixed(2)}
Delivery Charges: ₹50
Total Amount: ₹${(parseFloat(order.totalAmount.replace('₹', '')) * 1.18 + 50).toFixed(2)}

══════════════════════════════════════════════════════════════════
                      DELIVERY INFORMATION
══════════════════════════════════════════════════════════════════

Delivery Date: ${order.deliveryDate}
${order.returnDate ? `Return Date: ${order.returnDate}` : 'Return Date: To be updated'}
Delivery Address: ${userData.address}

══════════════════════════════════════════════════════════════════
                      TERMS & CONDITIONS
══════════════════════════════════════════════════════════════════

1. Books must be returned in good condition
2. Late returns will incur additional charges
3. Lost or damaged books will be charged at full price
4. Please keep this invoice for your records

══════════════════════════════════════════════════════════════════

Thank you for choosing BookWise Rentals!
For support, contact us at support@bookwise.com

Generated on: ${currentDate}
    `;

    // Create and download file
    const blob = new Blob([invoiceContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BookWise-Invoice-${order.id.replace('ORD-', '')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    // Show success message
    alert('Invoice downloaded successfully!');
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

          </div>
        </div>


        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4 h-auto bg-transparent p-0">
            <TabsTrigger
              value="overview"
              className={`group relative overflow-hidden rounded-2xl p-4 lg:p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg data-[state=active]:bg-gradient-to-br data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 bg-white/80 backdrop-blur-sm border border-gray-200 hover:bg-white h-auto`}
            >
              <div className="flex flex-col items-center text-center space-y-2">
                <User className={`h-6 w-6 lg:h-8 lg:w-8 transition-colors ${
                  activeTab === 'overview' ? 'text-white' : 'text-purple-500'
                }`} />
                <span className="text-sm lg:text-base font-medium">Overview</span>
              </div>
              {activeTab === 'overview' && (
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-purple-600/20 rounded-2xl" />
              )}
            </TabsTrigger>

            <TabsTrigger
              value="orders"
              className={`group relative overflow-hidden rounded-2xl p-4 lg:p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg data-[state=active]:bg-gradient-to-br data-[state=active]:from-orange-500 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 bg-white/80 backdrop-blur-sm border border-gray-200 hover:bg-white h-auto`}
            >
              <div className="flex flex-col items-center text-center space-y-2">
                <Package className={`h-6 w-6 lg:h-8 lg:w-8 transition-colors ${
                  activeTab === 'orders' ? 'text-white' : 'text-orange-500'
                }`} />
                <span className="text-sm lg:text-base font-medium">Orders</span>
              </div>
              {activeTab === 'orders' && (
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-orange-600/20 rounded-2xl" />
              )}
            </TabsTrigger>

            

            <TabsTrigger
              value="wishlist"
              className={`group relative overflow-hidden rounded-2xl p-4 lg:p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg data-[state=active]:bg-gradient-to-br data-[state=active]:from-pink-500 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 bg-white/80 backdrop-blur-sm border border-gray-200 hover:bg-white h-auto`}
            >
              <div className="flex flex-col items-center text-center space-y-2">
                <Heart className={`h-6 w-6 lg:h-8 lg:w-8 transition-colors ${
                  activeTab === 'wishlist' ? 'text-white' : 'text-pink-500'
                }`} />
                <span className="text-sm lg:text-base font-medium">Wishlist</span>
              </div>
              {activeTab === 'wishlist' && (
                <div className="absolute inset-0 bg-gradient-to-r from-pink-400/20 to-pink-600/20 rounded-2xl" />
              )}
            </TabsTrigger>

            
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Personal Information */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Personal Information
                      </CardTitle>
                      <Button
                        onClick={isEditing ? handleSaveChanges : () => setIsEditing(!isEditing)}
                        disabled={updateUserMutation.isPending}
                        size="sm"
                      >
                        <Edit3 className="h-4 w-4 mr-2" />
                        {updateUserMutation.isPending
                          ? "Saving..."
                          : isEditing
                          ? "Save Changes"
                          : "Edit Profile"}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>First Name</Label>
                        {isEditing ? (
                          <Input
                            value={editFormData.firstName}
                            onChange={(e) => handleFormChange('firstName', e.target.value)}
                            className="mt-1"
                          />
                        ) : (
                          <p className="mt-1 text-sm bg-gray-50 p-2 rounded">{userData.firstName}</p>
                        )}
                      </div>
                      <div>
                        <Label>Last Name</Label>
                        {isEditing ? (
                          <Input
                            value={editFormData.lastName}
                            onChange={(e) => handleFormChange('lastName', e.target.value)}
                            className="mt-1"
                          />
                        ) : (
                          <p className="mt-1 text-sm bg-gray-50 p-2 rounded">{userData.lastName}</p>
                        )}
                      </div>
                      <div>
                        <Label>Email</Label>
                        {isEditing ? (
                          <Input
                            value={editFormData.email}
                            onChange={(e) => handleFormChange('email', e.target.value)}
                            className="mt-1"
                            type="email"
                          />
                        ) : (
                          <p className="mt-1 text-sm bg-gray-50 p-2 rounded">{userData.email}</p>
                        )}
                      </div>
                      <div>
                        <Label>Phone</Label>
                        {isEditing ? (
                          <Input
                            value={editFormData.phone}
                            onChange={(e) => handleFormChange('phone', e.target.value)}
                            className="mt-1"
                          />
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
                        <Input
                          value={editFormData.address}
                          onChange={(e) => handleFormChange('address', e.target.value)}
                          className="mt-1"
                        />
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
            <div className="space-y-6">
              {/* Enhanced Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Order History</h3>
                  <p className="text-muted-foreground mt-1">Track and manage all your book rentals</p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 px-3 py-1">
                    12 Total Orders
                  </Badge>
                  <Badge variant="secondary" className="bg-green-50 text-green-700 px-3 py-1">
                    8 Completed
                  </Badge>
                </div>
              </div>

              {/* Advanced Filters */}
              <Card className="bg-gradient-to-r from-gray-50 to-white border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search orders, books..."
                        className="pl-10 border-gray-200 focus:border-primary"
                      />
                    </div>

                    {/* Status Filter */}
                    <Select defaultValue="all">
                      <SelectTrigger className="border-gray-200 focus:border-primary">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="returned">Returned</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Date Range Filter */}
                    <Select defaultValue="all-time">
                      <SelectTrigger className="border-gray-200 focus:border-primary">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-time">All Time</SelectItem>
                        <SelectItem value="last-week">Last Week</SelectItem>
                        <SelectItem value="last-month">Last Month</SelectItem>
                        <SelectItem value="last-3-months">Last 3 Months</SelectItem>
                        <SelectItem value="last-year">Last Year</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Sort By */}
                    <Select defaultValue="newest">
                      <SelectTrigger className="border-gray-200 focus:border-primary">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="oldest">Oldest First</SelectItem>
                        <SelectItem value="amount-high">Amount: High to Low</SelectItem>
                        <SelectItem value="amount-low">Amount: Low to High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Order Cards */}
              <div className="space-y-4">
                {[
                  { id: 1, status: "Delivered", statusColor: "bg-green-100 text-green-800 border-green-200", amount: 299, date: "2024-01-22", book: "The Alchemist", author: "Paulo Coelho", progress: 100 },
                  { id: 2, status: "In Transit", statusColor: "bg-blue-100 text-blue-800 border-blue-200", amount: 199, date: "2024-01-18", book: "Atomic Habits", author: "James Clear", progress: 75 },
                  { id: 3, status: "Processing", statusColor: "bg-orange-100 text-orange-800 border-orange-200", amount: 149, date: "2024-01-15", book: "The Psychology of Money", author: "Morgan Housel", progress: 25 }
                ].map((order) => (
                  <Card key={order.id} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm bg-white">
                    <CardContent className="p-6">
                      {/* Order Header */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <h4 className="font-bold text-lg text-gray-900">ORD-2024-00{order.id}</h4>
                            <Badge className={`${order.statusColor} font-medium px-3 py-1`}>
                              {order.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Ordered on {order.date}
                          </p>
                        </div>
                        <div className="text-right mt-4 md:mt-0">
                          <p className="text-2xl font-bold text-primary">₹{order.amount}</p>
                          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 p-0 h-auto" onClick={() => handleViewDetails({
                              id: `ORD-2024-00${order.id}`,
                              date: order.date,
                              status: order.status.toLowerCase(),
                              books: [{
                                title: order.book,
                                author: order.author,
                                image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=200",
                                rentalPeriod: "2 weeks",
                                price: `₹${order.amount}`
                              }],
                              totalAmount: `₹${order.amount}`,
                              deliveryDate: order.date,
                              returnDate: order.status === "Delivered" ? "2024-02-05" : null
                            })}>
                         
                          </Button>
                        </div>
                      </div>

                      {/* Order Progress */}
                      <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">Order Progress</span>
                          <span className="text-sm font-medium text-primary">{order.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-primary to-blue-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${order.progress}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Book Details */}
                      <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl">
                        <div className="w-16 h-20 bg-gradient-to-br from-primary/20 to-blue-500/20 rounded-lg flex items-center justify-center shadow-sm">
                          <BookOpen className="h-8 w-8 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-900 text-lg">{order.book}</h5>
                          <p className="text-muted-foreground flex items-center gap-1 mt-1">
                            <User className="h-4 w-4" />
                            by {order.author}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <Badge variant="outline" className="text-xs bg-white">
                              <Clock className="h-3 w-3 mr-1" />
                              2 weeks rental
                            </Badge>
                            <span className="text-sm font-semibold text-primary">₹{order.amount}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 mt-4">
                        
                        <Button
                          variant="outline"
                          size="sm"
                          className="hover:bg-primary hover:text-white transition-colors"
                          onClick={() => handleViewDetails({
                            id: `ORD-2024-00${order.id}`,
                            date: order.date,
                            status: order.status.toLowerCase(),
                            books: [{
                              title: order.book,
                              author: order.author,
                              image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=200",
                              rentalPeriod: "2 weeks",
                              price: `₹${order.amount}`
                            }],
                            totalAmount: `₹${order.amount}`,
                            deliveryDate: order.date,
                            returnDate: order.status === "Delivered" ? "2024-02-05" : null
                          })}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                        {order.status === "Delivered" && (
                          <Button variant="outline" size="sm" className="hover:bg-green-500 hover:text-white transition-colors">
                            <RotateCcw className="h-4 w-4 mr-1" />
                            Reorder
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Load More */}
              <div className="flex justify-center mt-8">
                <Button variant="outline" size="lg" className="px-8 hover:bg-primary hover:text-white transition-colors">
                  Load More Orders
                </Button>
              </div>
            </div>
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

        {/* Order Tracking Dialog */}
       
      </div>
    </div>
  );
}