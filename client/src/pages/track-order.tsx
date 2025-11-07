
import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Package, MapPin, Clock, CheckCircle, Truck, Phone, Mail, ArrowLeft, Calendar } from "lucide-react";

export default function TrackOrder() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1]);
  const orderId = searchParams.get('orderId');
  
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [trackingData, setTrackingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    } else {
      setError("No order ID provided");
      setLoading(false);
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch payment order details
      const orderResponse = await fetch(`/api/payment-orders/${orderId}`);
      if (!orderResponse.ok) {
        throw new Error("Order not found");
      }
      const order = await orderResponse.json();
      setOrderDetails(order);
      
      // Fetch Shiprocket tracking if available
      if (order.shiprocketOrderId) {
        try {
          const trackingResponse = await fetch(`/api/shiprocket/track/${order.shiprocketOrderId}`);
          if (trackingResponse.ok) {
            const tracking = await trackingResponse.json();
            setTrackingData(tracking);
          }
        } catch (trackingError) {
          console.log("Tracking data not available yet");
        }
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
      setError((error as Error).message || "Failed to fetch order details");
    } finally {
      setLoading(false);
    }
  };

  const getStatusProgress = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    if (normalizedStatus.includes('delivered')) return 100;
    if (normalizedStatus.includes('out for delivery')) return 90;
    if (normalizedStatus.includes('in transit') || normalizedStatus.includes('shipped')) return 75;
    if (normalizedStatus.includes('picked') || normalizedStatus.includes('pickup')) return 60;
    if (normalizedStatus.includes('processing') || normalizedStatus.includes('manifested')) return 50;
    if (normalizedStatus.includes('pending') || normalizedStatus.includes('created')) return 25;
    return 25;
  };

  const getStatusIcon = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    if (normalizedStatus.includes('delivered')) return CheckCircle;
    if (normalizedStatus.includes('shipped') || normalizedStatus.includes('transit')) return Truck;
    if (normalizedStatus.includes('picked') || normalizedStatus.includes('pickup')) return Package;
    return Clock;
  };

  const getStatusColor = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    if (normalizedStatus.includes('delivered')) return 'bg-green-100 text-green-800';
    if (normalizedStatus.includes('shipped') || normalizedStatus.includes('transit')) return 'bg-purple-100 text-purple-800';
    if (normalizedStatus.includes('picked') || normalizedStatus.includes('processing')) return 'bg-blue-100 text-blue-800';
    if (normalizedStatus.includes('pending') || normalizedStatus.includes('created')) return 'bg-orange-100 text-orange-800';
    return 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <div className="text-lg font-medium">Loading tracking information...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !orderDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Card className="text-center">
            <CardContent className="p-8">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">Tracking Information Not Available</h2>
              <p className="text-gray-600 mb-6">
                {error || "We couldn't find tracking information for this order."}
              </p>
              <Link href="/profile">
                <Button>Back to Orders</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const shipmentData = trackingData?.tracking_data?.shipment_track?.[0];
  const currentStatus = shipmentData?.current_status || orderDetails.status;
  const StatusIcon = getStatusIcon(currentStatus);
  const progress = getStatusProgress(currentStatus);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link href="/profile">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Track Your Order</h1>
          <p className="text-gray-600">Order ID: {orderId}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Tracking Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <StatusIcon className="h-6 w-6 mr-2 text-primary" />
                  Current Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge className={getStatusColor(currentStatus)}>
                      {currentStatus.replace(/_/g, ' ').toUpperCase()}
                    </Badge>
                    <span className="text-sm text-gray-600">{progress}% Complete</span>
                  </div>
                  <Progress value={progress} className="h-3" />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Order Confirmed</span>
                    <span>Delivered</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tracking Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Tracking Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {shipmentData?.shipment_track_activities && shipmentData.shipment_track_activities.length > 0 ? (
                    shipmentData.shipment_track_activities.map((activity: any, index: number) => (
                      <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                            <CheckCircle className="h-5 w-5 text-white" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{activity.activity}</h4>
                            <span className="text-sm text-gray-500">
                              {new Date(activity.date).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            <MapPin className="h-4 w-4 inline mr-1" />
                            {activity.location}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">{activity.status}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>Tracking information will be updated soon</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            {/* Delivery Details */}
            <Card>
              <CardHeader>
                <CardTitle>Delivery Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {shipmentData?.awb_code && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-1">AWB Number</h4>
                    <p className="font-mono text-sm">{shipmentData.awb_code}</p>
                  </div>
                )}
                {shipmentData?.courier_name && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-1">Courier Partner</h4>
                    <p className="text-sm">{shipmentData.courier_name}</p>
                  </div>
                )}
                {shipmentData?.edd && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-1">Estimated Delivery</h4>
                    <p className="text-sm flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(shipmentData.edd).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {shipmentData?.delivered_date && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-1">Delivered On</h4>
                    <p className="text-sm text-green-600 font-medium flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      {new Date(shipmentData.delivered_date).toLocaleDateString()}
                    </p>
                  </div>
                )}
                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-1">Order Amount</h4>
                  <p className="text-lg font-semibold text-primary">₹{orderDetails.amount}</p>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Address */}
            <Card>
              <CardHeader>
                <CardTitle>Delivery Address</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm font-medium">{orderDetails.customerName}</p>
                  <p className="text-sm">{orderDetails.shippingAddress}</p>
                  <p className="text-sm">
                    {orderDetails.shippingCity}, {orderDetails.shippingState} - {orderDetails.shippingPincode}
                  </p>
                  {orderDetails.shippingLandmark && (
                    <p className="text-sm text-gray-600">
                      Landmark: {orderDetails.shippingLandmark}
                    </p>
                  )}
                  <p className="text-sm text-gray-600 flex items-center mt-2">
                    <Phone className="h-4 w-4 mr-1" />
                    {orderDetails.customerPhone}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Contact Support */}
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Phone className="h-4 w-4 mr-2" />
                  Call Support
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Mail className="h-4 w-4 mr-2" />
                  Email Support
                </Button>
                <Link href="/contact">
                  <Button variant="outline" className="w-full">
                    Contact Form
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
