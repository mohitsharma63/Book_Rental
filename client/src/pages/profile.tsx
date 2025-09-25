import { useState, useEffect, useMemo } from "react";
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

  // State for filters and search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');


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
        phone: user.phone ,
        address: user.address || "Mylapore,chennai,600004",
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

  // Fetch user rentals (This part seems to be replaced by payment orders logic, but keeping it for now as per original code)
  const { data: rentals = [], isLoading: rentalsLoading } = useQuery({
    queryKey: ['rentals', currentUserId],
    queryFn: async () => {
      if (!currentUserId) {
        throw new Error('No user ID available');
      }
      const response = await fetch(`/api/users/${currentUserId}/rentals`);
      if (!response.ok) {
        throw new Error('Failed to fetch user rentals');
      }
      const rentals = await response.json();

      // Transform rentals to match order format
      return rentals.map((rental: any) => ({
        id: rental.id,
        date: rental.rentalDate,
        status: rental.status === 'completed' ? 'delivered' :
                rental.status === 'overdue' ? 'overdue' : rental.status,
        books: [{
          title: rental.book?.title || 'Unknown Book',
          author: rental.book?.author || 'Unknown Author',
          image: rental.book?.imageUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=200',
          rentalPeriod: rental.dueDate ?
            `${Math.ceil((new Date(rental.dueDate).getTime() - new Date(rental.rentalDate).getTime()) / (1000 * 60 * 60 * 24 * 7))} weeks` :
            '2 weeks',
          price: `₹${rental.totalAmount}`
        }],
        totalAmount: `₹${rental.totalAmount}`,
        deliveryDate: rental.rentalDate,
        returnDate: rental.returnDate || rental.dueDate
      }));
    },
    enabled: !!currentUserId
  });

  // Fetch user's payment orders
  const { data: paymentOrders = [], isLoading: paymentOrdersLoading } = useQuery({
    queryKey: ['user-payment-orders', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const res = await fetch(`/api/payment-orders?userId=${user.id}`);
      if (!res.ok) throw new Error('Failed to fetch payment orders');
      return res.json();
    },
    enabled: !!user?.id,
  });

  // Filter and sort payment orders
  const filteredPaymentOrders = useMemo(() => {
    let filtered = paymentOrders.filter(order => {
      const matchesSearch = searchQuery === '' ||
        order.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    // Sort orders
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);

      return sortOrder === 'newest'
        ? dateB.getTime() - dateA.getTime()
        : dateA.getTime() - dateB.getTime();
    });

    return filtered;
  }, [paymentOrders, searchQuery, statusFilter, sortOrder]);


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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
      case "completed":
        return "bg-green-100 text-green-800";
      case "active":
        return "bg-blue-100 text-blue-800";
      case "returned":
        return "bg-gray-100 text-gray-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "paid":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-orange-100 text-orange-800";
      case "failed":
        return "bg-red-100 text-red-800";
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
      case "completed":
      case "paid":
        return 100;
      case "returned":
        return 100;
      default:
        return 0;
    }
  };

  const handleViewDetails = (order: any) => {
    // Transform payment order to match the expected order format for the dialog
    let transformedOrder = order;
    
    // If this is a payment order, transform it to match the rental format
    if (order.orderId && order.cartItems) {
      let cartItems = [];
      try {
        cartItems = JSON.parse(order.cartItems || '[]');
      } catch (e) {
        cartItems = [];
      }
      
      transformedOrder = {
        id: order.orderId,
        date: order.createdAt,
        status: order.status,
        totalAmount: `₹${order.amount}`,
        deliveryDate: new Date(order.createdAt).toLocaleDateString(),
        returnDate: null,
        books: cartItems.map((item: any) => ({
          title: item.bookTitle || item.title || 'Unknown Book',
          author: item.author || 'Unknown Author',
          image: item.imageUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=200',
          rentalPeriod: item.rentalPeriodLabel || `${item.rentalDuration || 4} weeks`,
          price: `₹${item.price || 0}`
        }))
      };
    }
    
    setSelectedOrder(transformedOrder);
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
                        {(userData as any).readingStreak || 0}
                      </div>
                      <p className="text-sm text-gray-600">Day Reading Streak</p>
                      <Progress value={75} className="mt-2" />
                    </div>
                    <Separator />
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Favorite Genre</span>
                        <span className="text-sm font-medium">{(userData as any).favoriteGenre || 'Not specified'}</span>
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
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Order History</h3>
                  <p className="text-sm text-muted-foreground">
                    Track and manage all your book rentals
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-blue-600 font-medium">
                      {paymentOrders.length} Total Orders
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-green-600 font-medium">
                      {paymentOrders.filter(order => order.status === 'paid' || order.status === 'completed').length} Completed
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search orders, books..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortOrder} onValueChange={setSortOrder}>
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {paymentOrdersLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredPaymentOrders.length > 0 ? (
                <div className="space-y-4">
                  {filteredPaymentOrders.map((order) => {
                    let cartItems = [];
                    try {
                      cartItems = JSON.parse(order.cartItems || '[]');
                    } catch (e) {
                      cartItems = [];
                    }

                    return (
                      <Card key={order.id} className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold">Order #{order.orderId}</h4>
                              <Badge variant={
                                order.status === 'paid' || order.status === 'completed' ? 'default' :
                                order.status === 'pending' ? 'secondary' : 'destructive'
                              }>
                                {order.status}
                              </Badge>
                              {order.paymentMethod && (
                                <Badge variant="outline">
                                  {order.paymentMethod.toUpperCase()}
                                </Badge>
                              )}
                            </div>
                            <div className="space-y-1 text-sm text-muted-foreground">
                              <p>Order Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                              <p>Amount: ₹{order.amount}</p>
                              <p>Books: {cartItems.length} item(s)</p>
                              {cartItems.length > 0 && (
                                <p>Books: {cartItems.map(item => item.bookTitle || item.title).join(', ')}</p>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewDetails(order)}
                            >
                              View Details
                            </Button>
                            {order.status === 'paid' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleTrackOrder(order)}
                              >
                                Track Order
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <Card className="p-12 text-center">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No orders found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || statusFilter !== 'all'
                      ? "No orders match your current filters"
                      : "You haven't made any book rentals yet"}
                  </p>
                  <Button>Browse Books</Button>
                </Card>
              )}
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