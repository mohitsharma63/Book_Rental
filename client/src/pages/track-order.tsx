
import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Package, MapPin, Clock, CheckCircle, Truck, Home, Phone, Mail, ArrowLeft } from "lucide-react";

export default function TrackOrder() {
  const { orderId } = useParams();
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [deliveryTracking, setDeliveryTracking] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch delivery details
      const deliveryResponse = await fetch(`/api/deliveries/order/${orderId}`);
      if (deliveryResponse.ok) {
        const delivery = await deliveryResponse.json();
        setOrderDetails(delivery);
        
        // Fetch tracking information
        const trackingResponse = await fetch(`/api/deliveries/${delivery.id}/tracking`);
        if (trackingResponse.ok) {
          const tracking = await trackingResponse.json();
          setDeliveryTracking(tracking);
        }
      } else {
        setError("Order not found or delivery details unavailable");
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
      setError("Failed to fetch order details");
    } finally {
      setLoading(false);
    }
  };

  const getStatusProgress = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending": return 20;
      case "picked_up": return 40;
      case "in_transit": return 70;
      case "delivered": return 100;
      default: return 0;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending": return Package;
      case "picked_up": return Truck;
      case "in_transit": return MapPin;
      case "delivered": return CheckCircle;
      default: return Clock;
    }
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

  const StatusIcon = getStatusIcon(orderDetails.status);
  const progress = getStatusProgress(orderDetails.status);

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
                    <Badge className={
                      orderDetails.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      orderDetails.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
                      orderDetails.status === 'picked_up' ? 'bg-purple-100 text-purple-800' :
                      'bg-yellow-100 text-yellow-800'
                    }>
                      {orderDetails.status.replace('_', ' ').charAt(0).toUpperCase() + orderDetails.status.replace('_', ' ').slice(1)}
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
                  {deliveryTracking.length > 0 ? (
                    deliveryTracking.map((track, index) => (
                      <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                            <CheckCircle className="h-5 w-5 text-white" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{track.description}</h4>
                            <span className="text-sm text-gray-500">
                              {new Date(track.timestamp).toLocaleString()}
                            </span>
                          </div>
                          {track.location && (
                            <p className="text-sm text-gray-600 mt-1">
                              <MapPin className="h-4 w-4 inline mr-1" />
                              {track.location}
                            </p>
                          )}
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
                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-1">Tracking Number</h4>
                  <p className="font-mono text-sm">{orderDetails.trackingNumber}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-1">Delivery Partner</h4>
                  <p className="text-sm">{orderDetails.deliveryPartner || 'BookWise Delivery'}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-1">Estimated Delivery</h4>
                  <p className="text-sm">
                    {orderDetails.estimatedDeliveryDate 
                      ? new Date(orderDetails.estimatedDeliveryDate).toLocaleDateString()
                      : 'To be updated'
                    }
                  </p>
                </div>
                {orderDetails.actualDeliveryDate && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-1">Delivered On</h4>
                    <p className="text-sm text-green-600 font-medium">
                      {new Date(orderDetails.actualDeliveryDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Delivery Address */}
            <Card>
              <CardHeader>
                <CardTitle>Delivery Address</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm">{orderDetails.deliveryAddress}</p>
                  <p className="text-sm">
                    {orderDetails.deliveryCity}, {orderDetails.deliveryState} - {orderDetails.deliveryPincode}
                  </p>
                  {orderDetails.deliveryLandmark && (
                    <p className="text-sm text-gray-600">
                      Landmark: {orderDetails.deliveryLandmark}
                    </p>
                  )}
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
                  Call Support: +91-XXX-XXX-XXXX
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Mail className="h-4 w-4 mr-2" />
                  Email: support@bookwise.com
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
