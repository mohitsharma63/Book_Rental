
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Package, ArrowRight } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useStore } from "@/lib/store-context";

export default function PaymentSuccess() {
  const [location] = useLocation();
  const { clearCart } = useStore();
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Extract order_id from URL params
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const orderId = urlParams.get('order_id');

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/payment-orders/${orderId}`);
        if (response.ok) {
          const order = await response.json();
          setOrderDetails(order);
          
          // Clear cart on successful payment
          if (order.status === 'paid') {
            clearCart();
          }
        }
      } catch (error) {
        console.error('Error fetching order details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, clearCart]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Processing your payment...</p>
        </div>
      </div>
    );
  }

  if (!orderId || !orderDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4 text-center">
          <CardContent className="p-8">
            <div className="p-4 bg-red-100 rounded-full w-fit mx-auto mb-6">
              <Package className="h-12 w-12 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Order Not Found</h2>
            <p className="text-gray-600 mb-6">
              We couldn't find the order details. Please contact support if you need assistance.
            </p>
            <Link href="/catalog">
              <Button className="w-full">Continue Shopping</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isPaymentSuccessful = orderDetails.status === 'paid';

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
                <span>₹{parseFloat(orderDetails.amount).toFixed(2)}</span>
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
