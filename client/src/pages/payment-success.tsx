import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Package, ArrowRight } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useStore } from "@/lib/store-context";
import { useQuery } from "@tanstack/react-query";

export default function PaymentSuccess() {
  const [location] = useLocation();
  const { clearCart } = useStore();

  const searchParams = new URLSearchParams(location.search);
  const orderId = searchParams.get('oid') ||
                 searchParams.get('order_id') ||
                 searchParams.get('orderId') ||
                 searchParams.get('cf_order_id');

  const { data: orderDetails, isLoading, error } = useQuery({
    queryKey: ['paymentOrder', orderId],
    queryFn: async () => {
      if (!orderId) return null;

      // First verify payment with Cashfree
      const verifyResponse = await fetch('/api/payments/cashfree/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId })
      });

      const verifyResult = await verifyResponse.json();
      console.log('Payment verification result:', verifyResult);

      // Then get order details
      const response = await fetch(`/api/payment-orders/${orderId}`);
      if (!response.ok) throw new Error('Failed to fetch order details');
      const orderData = await response.json();

      return { ...orderData, paymentVerified: verifyResult.verified };
    },
    enabled: !!orderId,
  });

  // Parse customer data and cart items from order details
  let customerData = null;
  let cartItems = [];

  if (orderDetails) {
    customerData = {
      firstName: orderDetails.customerName?.split(' ')[0] || '',
      lastName: orderDetails.customerName?.split(' ').slice(1).join(' ') || '',
      email: orderDetails.customerEmail,
      phone: orderDetails.customerPhone,
      address: orderDetails.shippingAddress,
      city: orderDetails.shippingCity,
      state: orderDetails.shippingState,
      pincode: orderDetails.shippingPincode,
      landmark: orderDetails.shippingLandmark || ''
    };

    try {
      if (orderDetails.cartItems) {
        cartItems = JSON.parse(orderDetails.cartItems);
      }
    } catch (error) {
      console.error('Error parsing cart items:', error);
    }
  }

  useEffect(() => {
    if (orderDetails && orderDetails.status === 'paid') {
      clearCart();
    }
  }, [orderDetails, clearCart]);


  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Processing your payment...</p>
        </div>
      </div>
    );
  }

  if (error || !orderId || !orderDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4 text-center">
          <CardContent className="p-8">
            <div className="p-4 bg-red-100 rounded-full w-fit mx-auto mb-6">
              <Package className="h-12 w-12 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Order Not Found</h2>
            <p className="text-gray-600 mb-6">
              {error ? `Error: ${error.message}` : 'We couldn\'t find the order details. Please contact support if you need assistance.'}
            </p>
            <Link href="/catalog">
              <Button className="w-full">Continue Shopping</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isPaymentSuccessful = orderDetails.status === 'paid' || orderDetails.status === 'success';

  return (
    <div className={`min-h-screen bg-gradient-to-br ${isPaymentSuccessful ? 'from-slate-50 to-green-50' : 'from-slate-50 to-red-50'} flex items-center justify-center`}>
      <Card className="max-w-lg w-full mx-4">
        <CardContent className="p-8 text-center">
          <div className={`p-4 ${isPaymentSuccessful ? 'bg-green-100' : 'bg-red-100'} rounded-full w-fit mx-auto mb-6`}>
            {isPaymentSuccessful ? (
              <CheckCircle className="h-12 w-12 text-green-600" />
            ) : (
              <Package className="h-12 w-12 text-red-600" />
            )}
          </div>

          <h2 className="text-2xl font-bold mb-4">
            {isPaymentSuccessful ? 'Payment Successful!' : 'Payment Failed'}
          </h2>

          <p className="text-gray-600 mb-6">
            {isPaymentSuccessful
              ? 'Thank you for your order. You will receive a confirmation email shortly.'
              : 'There was an issue processing your payment. Please try again or contact support.'
            }
          </p>

          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold mb-2">Order Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Order ID:</span>
                <span className="font-mono text-xs">{orderDetails.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span>Amount:</span>
                <span>₹{orderDetails.amount ? parseFloat(orderDetails.amount.toString()).toFixed(2) : '0.00'}</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className={`font-semibold ${isPaymentSuccessful ? 'text-green-600' : 'text-red-600'}`}>
                  {orderDetails.status.toUpperCase()}
                </span>
              </div>
              {orderDetails.transactionId && (
                <div className="flex justify-between">
                  <span>Transaction ID:</span>
                  <span className="font-mono text-xs">{orderDetails.transactionId}</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {isPaymentSuccessful ? (
              <>
                <Link href="/catalog">
                  <Button className="w-full">
                    Continue Shopping
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button variant="outline" className="w-full">
                    View My Orders
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/cart">
                  <Button className="w-full">
                    Try Again
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline" className="w-full">
                    Contact Support
                  </Button>
                </Link>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}