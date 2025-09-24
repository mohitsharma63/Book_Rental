import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft,
  CheckCircle,
  Shield,
  Wallet
} from "lucide-react";
import { Link } from "wouter";
import { useStore } from "@/lib/store-context";
import { useToast } from "@/hooks/use-toast";

export default function Checkout() {
  const { cartItems, clearCart } = useStore();
  const { toast } = useToast();
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    landmark: ''
  });

  const paymentMethods = [
    { id: "cashfree", name: "Cashfree Payment Gateway", icon: "💳", description: "Cards, UPI, Net Banking, Wallets" }
  ];

  const subtotal = cartItems.reduce((sum, item) => {
    const duration = item.rentalDuration || 1;
    const durationMultiplier = duration === 1 ? 1 : duration === 2 ? 1.5 : 2;
    return sum + (item.price * durationMultiplier * item.quantity);
  }, 0);

  const deliveryFee = 99; // Standard delivery
  const tax = subtotal * 0.18; // 18% GST
  const total = subtotal + deliveryFee + tax;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handlePlaceOrder = async () => {
    if (!formData.firstName || !formData.email || !formData.phone || !formData.address || !formData.city || !formData.state || !formData.pincode) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Validate PIN code format
    if (!/^\d{6}$/.test(formData.pincode)) {
      toast({
        title: "Invalid PIN Code",
        description: "Please enter a valid 6-digit PIN code.",
        variant: "destructive",
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    const customerName = `${formData.firstName}${formData.lastName ? ' ' + formData.lastName : ''}`;
    const shippingAddress = `${formData.address}\n${formData.city}, ${formData.state} - ${formData.pincode}${formData.landmark ? '\nNear ' + formData.landmark : ''}`;

    try {
        setIsProcessingPayment(true);

        const orderData = {
          order_id: `order_${Date.now()}`, // Generate a unique order ID
          amount: parseFloat(total.toFixed(2)),
          currency: "INR",
          customer_details: {
            customer_id: `customer_${Date.now()}`,
            customer_name: customerName,
            customer_email: formData.email,
            customer_phone: formData.phone,
          },
          shipping_details: {
            name: customerName,
            phone: formData.phone,
            email: formData.email,
            address: shippingAddress,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
            landmark: formData.landmark || ''
          },
          cartItems: cartItems,
          orderMeta: {
            return_url: `${window.location.origin}/payment-success?order_id={order_id}`,
            notify_url: `${window.location.origin}/api/payment-webhook`,
          }
        };

        console.log("Creating order with data:", orderData);

        const response = await fetch('/api/create-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(orderData),
        });

        const result = await response.json();
        console.log("Order creation response:", result);

        if (!response.ok) {
          throw new Error(result.message || `Server error: ${response.status}`);
        }

        if (result.success && result.payment_url) {
          // Redirect to Cashfree payment page
          console.log('Redirecting to payment URL:', result.payment_url);
          window.location.href = result.payment_url;
        } else {
          throw new Error(result.message || 'Failed to create payment session');
        }
      } catch (error) {
        console.error('Payment initiation failed:', error);
        toast({
          title: "Payment Failed",
          description: error instanceof Error ? error.message : 'Failed to initiate payment. Please try again.',
          variant: "destructive",
        });
      } finally {
        setIsProcessingPayment(false);
      }
  };

  if (orderCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4 text-center">
          <CardContent className="p-8">
            <div className="p-4 bg-green-100 rounded-full w-fit mx-auto mb-6">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Order Confirmed!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for your order. You will receive an email confirmation shortly.
            </p>
            <div className="space-y-3">
              <Link href="/catalog">
                <Button className="w-full">Continue Shopping</Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" className="w-full">View Orders</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">


      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/cart">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Cart
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Checkout</h1>
          <div></div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-8">
            <div className="space-y-6">
              {/* Shipping Information */}
              <Card className="border-0 shadow-sm bg-white/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Shield className="h-5 w-5 text-blue-600" />
                    </div>
                    Shipping Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <input
                        id="firstName"
                        type="text"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Enter your first name"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <input
                        id="lastName"
                        type="text"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Enter your last name"
                        value={formData.lastName}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <input
                      id="email"
                      type="email"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter your email address"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <input
                      id="phone"
                      type="tel"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Complete Address *</Label>
                    <textarea
                      id="address"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent min-h-[100px] resize-none"
                      placeholder="House/Flat No, Building Name, Street, Area"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <input
                        id="city"
                        type="text"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Enter city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State *</Label>
                      <input
                        id="state"
                        type="text"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Enter state"
                        value={formData.state}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pincode">PIN Code *</Label>
                      <input
                        id="pincode"
                        type="text"
                        pattern="[0-9]{6}"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Enter PIN code"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="landmark">Landmark (Optional)</Label>
                    <input
                      id="landmark"
                      type="text"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Near landmark for easy delivery"
                      value={formData.landmark}
                      onChange={handleInputChange}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card className="border-0 shadow-sm bg-white/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <Wallet className="h-5 w-5 text-green-600" />
                    </div>
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value="cashfree" className="space-y-3">
                    {paymentMethods.map((method) => (
                      <div key={method.id} className="flex items-center space-x-3 p-4 rounded-lg border-2 border-primary bg-primary/5">
                        <RadioGroupItem value={method.id} id={method.id} checked />
                        <span className="text-2xl">{method.icon}</span>
                        <div className="flex-1">
                          <Label htmlFor={method.id} className="font-semibold cursor-pointer block">
                            {method.name}
                          </Label>
                          <p className="text-sm text-gray-600">{method.description}</p>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Cashfree Benefits */}
              <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-green-50">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    Secure Payment with Cashfree
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="text-sm">256-bit SSL Encryption</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="text-sm">PCI DSS Compliant</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="text-sm">100+ Payment Methods</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="text-sm">Instant Refunds</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button 
                  onClick={handlePlaceOrder} 
                  size="lg" 
                  className="px-8"
                  disabled={isProcessingPayment}
                >
                  {isProcessingPayment 
                    ? "Processing Payment..." 
                    : `Pay ₹${total.toFixed(2)}`}
                </Button>
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-4">
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur sticky top-8">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Items */}
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-16 h-20 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{item.title}</h4>
                        <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                        <p className="text-sm font-semibold text-primary">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Totals */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Delivery</span>
                    <span>₹{deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>GST (18%)</span>
                    <span>₹{tax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">₹{total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Security Notice */}
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-green-900 text-sm">Secure Payment</h4>
                      <p className="text-xs text-green-700">
                        Powered by Cashfree - Your payment information is encrypted and secure.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Accepted Payment Methods */}
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 text-sm mb-2">We Accept</h4>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="px-2 py-1 bg-white rounded">Visa</span>
                    <span className="px-2 py-1 bg-white rounded">Mastercard</span>
                    <span className="px-2 py-1 bg-white rounded">RuPay</span>
                    <span className="px-2 py-1 bg-white rounded">UPI</span>
                    <span className="px-2 py-1 bg-white rounded">NetBanking</span>
                    <span className="px-2 py-1 bg-white rounded">Wallets</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}