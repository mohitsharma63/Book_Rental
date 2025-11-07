import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { Link } from "wouter";

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
        joinDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Oct 2, 2025",
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

  // Fetch all books for dynamic image and data display
  const { data: books = [], isLoading: booksLoading } = useQuery({
    queryKey: ['all-books'],
    queryFn: async () => {
      const res = await fetch('/api/books'); // Assuming you have an endpoint to fetch all books
      if (!res.ok) throw new Error('Failed to fetch books');
      return res.json();
    },
    enabled: !!user?.id,
  });


  // Fetch Shiprocket tracking data for orders
  const { data: trackingData = {} } = useQuery({
    queryKey: ['/api/shiprocket/tracking', paymentOrders.map(o => o.shiprocketOrderId).filter(Boolean)],
    queryFn: async () => {
      const trackingMap: Record<string, any> = {};

      for (const order of paymentOrders) {
        if (order.shiprocketOrderId) {
          try {
            const response = await fetch(`/api/shiprocket/track/${order.shiprocketOrderId}`);
            if (response.ok) {
              const data = await response.json();
              trackingMap[order.shiprocketOrderId] = data;
            }
          } catch (error) {
            console.error('Failed to fetch tracking for order:', order.shiprocketOrderId);
          }
        }
      }

      return trackingMap;
    },
    enabled: paymentOrders.length > 0 && paymentOrders.some(o => o.shiprocketOrderId),
    refetchInterval: 30000, // Refresh every 30 seconds
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
  if (!user || userLoading || !currentUserId || booksLoading) {
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

  const getShiprocketStatus = (orderId: string, order: any) => {
    if (!order.shiprocketOrderId) {
      return {
        status: order.status,
        trackingNumber: null,
        courierName: null,
        estimatedDelivery: null,
        currentLocation: null,
      };
    }

    const tracking = trackingData[order.shiprocketOrderId];
    if (!tracking?.tracking_data?.shipment_track?.[0]) {
      return {
        status: order.status,
        trackingNumber: order.shiprocketOrderId,
        courierName: null,
        estimatedDelivery: null,
        currentLocation: null,
      };
    }

    const shipment = tracking.tracking_data.shipment_track[0];
    return {
      status: shipment.current_status || order.status,
      trackingNumber: shipment.awb_code || order.shiprocketOrderId,
      courierName: shipment.courier_name,
      estimatedDelivery: shipment.edd,
      currentLocation: shipment.origin,
      deliveredDate: shipment.delivered_date,
    };
  };

  const getOrderProgress = (status: string) => {
    const normalizedStatus = status.toLowerCase();

    // Shiprocket status mapping
    if (normalizedStatus.includes('delivered')) return 100;
    if (normalizedStatus.includes('out for delivery')) return 90;
    if (normalizedStatus.includes('in transit') || normalizedStatus.includes('shipped')) return 75;
    if (normalizedStatus.includes('picked') || normalizedStatus.includes('pickup')) return 60;
    if (normalizedStatus.includes('processing') || normalizedStatus.includes('manifested')) return 50;
    if (normalizedStatus.includes('pending') || normalizedStatus.includes('created')) return 25;
    if (normalizedStatus.includes('cancelled')) return 0;

    return 25;
  };

  const getStatusColor = (status: string) => {
    const normalizedStatus = status.toLowerCase();

    if (normalizedStatus.includes('delivered')) return 'bg-green-500';
    if (normalizedStatus.includes('out for delivery')) return 'bg-green-400';
    if (normalizedStatus.includes('in transit') || normalizedStatus.includes('shipped')) return 'bg-purple-500';
    if (normalizedStatus.includes('picked') || normalizedStatus.includes('pickup')) return 'bg-blue-500';
    if (normalizedStatus.includes('processing') || normalizedStatus.includes('manifested')) return 'bg-blue-400';
    if (normalizedStatus.includes('pending') || normalizedStatus.includes('created')) return 'bg-yellow-500';
    if (normalizedStatus.includes('cancelled')) return 'bg-red-500';

    return 'bg-gray-500';
  };

  const getStatusColorBadge = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    switch (true) {
      case normalizedStatus.includes("delivered"):
      case normalizedStatus.includes("completed"):
        return "bg-green-100 text-green-800";
      case normalizedStatus.includes("shipped"):
      case normalizedStatus.includes("in transit"):
      case normalizedStatus.includes("out for delivery"):
        return "bg-purple-100 text-purple-800";
      case normalizedStatus.includes("processing"):
      case normalizedStatus.includes("manifested"):
      case normalizedStatus.includes("picked"):
      case normalizedStatus.includes("pickup"):
        return "bg-blue-100 text-blue-800";
      case normalizedStatus.includes("pending"):
      case normalizedStatus.includes("created"):
        return "bg-orange-100 text-orange-800";
      case normalizedStatus.includes("cancelled"):
      case normalizedStatus.includes("failed"):
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };




  const handleTrackOrder = (order: any) => {
    setSelectedOrder(order);
    setShowOrderDialog(true); // Assuming tracking also opens a dialog or similar view
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
                    const items = typeof order.cartItems === 'string'
                      ? JSON.parse(order.cartItems)
                      : order.cartItems;

                    const shiprocketStatus = getShiprocketStatus(order.orderId, order);
                    const displayStatus = shiprocketStatus.status;
                    const progress = getOrderProgress(displayStatus);

                    return (
                      <Card key={order.id} className="overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <CardTitle className="text-lg">Order #{order.orderId}</CardTitle>
                              <CardDescription>
                                Order Date: {new Date(order.createdAt).toLocaleDateString()}
                              </CardDescription>
                              <CardDescription>
                                Amount: ₹{order.amount}
                              </CardDescription>
                              <div className="mt-2">
                                <span className="text-sm text-gray-600">Books: {items?.length || 0} item(s)</span>
                                {items && items.length > 0 && (
                                  <div className="mt-2 flex gap-2 overflow-x-auto pb-2">
                                    {items.map((item: any, idx: number) => (
                                      <div key={idx} className="flex-shrink-0">
                                        <img
                                          src={item.bookImage || item.imageUrl || 'https://via.placeholder.com/60x80?text=Book'}
                                          alt={item.bookTitle || 'Book'}
                                          className="w-12 h-16 object-cover rounded border-2 border-white shadow-sm"
                                          onError={(e) => {
                                            e.currentTarget.src = 'https://via.placeholder.com/60x80?text=Book';
                                          }}
                                        />
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                              {shiprocketStatus.trackingNumber && (
                                <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                                  <Truck className="h-4 w-4" />
                                  <span>AWB: {shiprocketStatus.trackingNumber}</span>
                                </div>
                              )}
                              {shiprocketStatus.courierName && (
                                <div className="text-sm text-gray-600">
                                  Courier: {shiprocketStatus.courierName}
                                </div>
                              )}
                            </div>
                            <div className="text-right space-y-2">
                              <Badge className={getStatusColorBadge(displayStatus)}>
                                {displayStatus.toUpperCase()}
                              </Badge>
                              <div>
                                <Link href={`/track-order?orderId=${order.orderId}`}>
                                  <Button variant="outline" size="sm" className="w-full">
                                    <Truck className="h-4 w-4 mr-2" />
                                    Track Order
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                          <div className="space-y-4">
                            <div>
                              <div className="flex justify-between text-sm mb-2">
                                <span className="font-medium">Order Progress</span>
                                <span className="text-gray-600">{progress}% Complete</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                  className={`h-2.5 rounded-full transition-all duration-500 ${getStatusColor(displayStatus)}`}
                                  style={{ width: `${progress}%` }}
                                ></div>
                              </div>
                              <div className="flex justify-between text-xs text-gray-500 mt-2">
                                <span>Processing</span>
                                <span>Shipped</span>
                                <span>Delivered</span>
                              </div>
                            </div>

                            {shiprocketStatus.currentLocation && (
                              <div className="text-sm text-gray-600 flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>Current Location: {shiprocketStatus.currentLocation}</span>
                              </div>
                            )}

                            <div className="flex gap-2">
                              <Link href={`/track-order?orderId=${order.orderId}`}>
                                <Button variant="outline" size="sm" className="w-full">
                                  Track Order
                                </Button>
                              </Link>
                             
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <Link href="/catalog">
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
                </Link>
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
                        <Badge className={getStatusColorBadge(selectedOrder.status)}>
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
                      {selectedOrder.books.map((book: any, index: number) => {
                        // For payment orders, use bookTitle and bookImage from cart items
                        const title = book.bookTitle || book.title || 'Unknown Book';
                        const author = book.author || 'Unknown Author';
                        const rentalPeriod = book.rentalPeriod || `${book.rentalDays || 28} days`;
                        const price = book.price ? `₹${book.price}` : (book.price || '₹0');
                        const quantity = book.quantity || 1;
                        
                        // Handle both base64 data URLs and regular image URLs
                        const imageUrl = book.bookImage || book.imageUrl || book.image || 'https://via.placeholder.com/150x200?text=No+Image';
                        
                        return (
                          <div key={index} className="flex items-center gap-4 p-4 border rounded-lg bg-gray-50">
                            <div className="w-16 h-20 flex-shrink-0">
                              <img
                                src={imageUrl}
                                alt={title}
                                className="w-full h-full object-cover rounded shadow-sm"
                                onError={(e) => {
                                  e.currentTarget.src = 'https://via.placeholder.com/150x200?text=No+Image';
                                }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-lg truncate">{title}</h4>
                              <p className="text-gray-600 mb-1 truncate">by {author}</p>
                              <p className="text-sm text-gray-500">Rental Period: {rentalPeriod}</p>
                              {quantity > 1 && (
                                <p className="text-sm text-gray-500">Quantity: {quantity}</p>
                              )}
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="font-semibold text-xl">{price}</p>
                            </div>
                          </div>
                        );
                      })}
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