
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  CreditCard, 
  Truck, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  Lock,
  ArrowLeft,
  CheckCircle,
  Shield,
  Wallet
} from "lucide-react";
import { Link } from "wouter";
import { useStore } from "@/lib/store-context";

interface ShippingInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  apartment: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface PaymentInfo {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
}

export default function Checkout() {
  const { cartItems } = useStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDelivery, setSelectedDelivery] = useState("standard");
  const [selectedPayment, setSelectedPayment] = useState("cashfree");
  const [saveInfo, setSaveInfo] = useState(false);
  const [billingAddressSame, setBillingAddressSame] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    apartment: "",
    city: "",
    state: "",
    zipCode: "",
    country: "IN"
  });

  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: ""
  });

  const deliveryOptions = [
    {
      id: "pickup",
      name: "Store Pickup",
      price: 0,
      description: "Ready in 2 hours",
      time: "2 hours"
    },
    {
      id: "standard",
      name: "Standard Delivery",
      price: 99,
      description: "2-3 business days",
      time: "2-3 days"
    },
    {
      id: "express",
      name: "Express Delivery",
      price: 199,
      description: "Next business day",
      time: "1 day"
    }
  ];

  const paymentMethods = [
    { id: "cashfree", name: "Cashfree Payment Gateway", icon: "💳", description: "Cards, UPI, Net Banking, Wallets" },
    { id: "upi", name: "UPI", icon: "📱", description: "Pay directly with UPI apps" },
    { id: "card", name: "Credit/Debit Card", icon: "💳", description: "Visa, Mastercard, RuPay" },
    { id: "netbanking", name: "Net Banking", icon: "🏦", description: "All major banks supported" },
    { id: "wallet", name: "Digital Wallets", icon: "👛", description: "Paytm, PhonePe, Amazon Pay" }
  ];

  const subtotal = cartItems.reduce((sum, item) => {
    const duration = item.rentalDuration || 1;
    const durationMultiplier = duration === 1 ? 1 : duration === 2 ? 1.5 : 2;
    return sum + (item.price * durationMultiplier * item.quantity);
  }, 0);

  const deliveryFee = selectedDelivery === "express" ? 199 : selectedDelivery === "standard" ? 99 : 0;
  const tax = subtotal * 0.18; // 18% GST
  const total = subtotal + deliveryFee + tax;

  const handleShippingChange = (field: keyof ShippingInfo, value: string) => {
    setShippingInfo(prev => ({ ...prev, [field]: value }));
  };

  const handlePaymentChange = (field: keyof PaymentInfo, value: string) => {
    setPaymentInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleContinueToPayment = () => {
    // Validate shipping info
    const requiredFields = ['firstName', 'lastName', 'email', 'address', 'city', 'state', 'zipCode'];
    const isValid = requiredFields.every(field => shippingInfo[field as keyof ShippingInfo].trim() !== '');
    
    if (isValid) {
      setCurrentStep(2);
    } else {
      alert('Please fill in all required fields');
    }
  };

  const initiateCashfreePayment = async () => {
    setIsProcessingPayment(true);
    
    try {
      // Create order on backend
      const orderResponse = await fetch('/api/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: total,
          currency: 'INR',
          customerDetails: {
            customer_id: `customer_${Date.now()}`,
            customer_name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
            customer_email: shippingInfo.email,
            customer_phone: shippingInfo.phone,
          },
          orderMeta: {
            return_url: `${window.location.origin}/payment-success?order_id={order_id}`,
            notify_url: `${window.location.origin}/api/payment-webhook`,
          }
        }),
      });

      const orderData = await orderResponse.json();

      if (orderData.success) {
        // Initialize Cashfree checkout
        const cashfree = (window as any).Cashfree({
          mode: "sandbox" // Use "production" for live
        });

        cashfree.checkout({
          paymentSessionId: orderData.payment_session_id,
          returnUrl: `${window.location.origin}/payment-success`
        });
      } else {
        throw new Error(orderData.message || 'Failed to create order');
      }
    } catch (error) {
      console.error('Payment initiation failed:', error);
      alert('Payment initiation failed. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (selectedPayment === 'cashfree' || selectedPayment === 'upi' || selectedPayment === 'netbanking' || selectedPayment === 'wallet') {
      await initiateCashfreePayment();
    } else if (selectedPayment === 'card') {
      // Validate payment info for direct card payment
      const isPaymentValid = paymentInfo.cardNumber && paymentInfo.expiryDate && paymentInfo.cvv && paymentInfo.cardholderName;
      if (!isPaymentValid) {
        alert('Please fill in all payment details');
        return;
      }
      await initiateCashfreePayment();
    } else {
      // For other payment methods, proceed with Cashfree
      await initiateCashfreePayment();
    }
  };

  const steps = [
    { number: 1, title: "Shipping", active: currentStep === 1, completed: currentStep > 1 },
    { number: 2, title: "Payment", active: currentStep === 2, completed: currentStep > 2 },
    { number: 3, title: "Confirmation", active: currentStep === 3, completed: false }
  ];

  if (currentStep === 3) {
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
      {/* Cashfree Script */}
      <script src="https://sdk.cashfree.com/js/v3/cashfree.js"></script>
      
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

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  step.completed 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : step.active 
                      ? 'border-primary text-primary bg-primary/10' 
                      : 'border-gray-300 text-gray-300'
                }`}>
                  {step.completed ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <span className="font-semibold">{step.number}</span>
                  )}
                </div>
                <span className={`ml-2 font-medium ${
                  step.active ? 'text-primary' : step.completed ? 'text-green-600' : 'text-gray-400'
                }`}>
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-0.5 mx-4 ${
                    steps[index + 1].completed || steps[index + 1].active ? 'bg-primary' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-8">
            {currentStep === 1 && (
              <div className="space-y-6">
                {/* Shipping Information */}
                <Card className="border-0 shadow-sm bg-white/80 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <MapPin className="h-5 w-5 text-blue-600" />
                      </div>
                      Shipping Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          value={shippingInfo.firstName}
                          onChange={(e) => handleShippingChange('firstName', e.target.value)}
                          placeholder="John"
                          className="bg-gray-50 border-gray-200"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          value={shippingInfo.lastName}
                          onChange={(e) => handleShippingChange('lastName', e.target.value)}
                          placeholder="Doe"
                          className="bg-gray-50 border-gray-200"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={shippingInfo.email}
                          onChange={(e) => handleShippingChange('email', e.target.value)}
                          placeholder="john@example.com"
                          className="bg-gray-50 border-gray-200"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={shippingInfo.phone}
                          onChange={(e) => handleShippingChange('phone', e.target.value)}
                          placeholder="+91 98765 43210"
                          className="bg-gray-50 border-gray-200"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Street Address *</Label>
                      <Input
                        id="address"
                        value={shippingInfo.address}
                        onChange={(e) => handleShippingChange('address', e.target.value)}
                        placeholder="123 Main Street"
                        className="bg-gray-50 border-gray-200"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="apartment">Apartment, suite, etc.</Label>
                      <Input
                        id="apartment"
                        value={shippingInfo.apartment}
                        onChange={(e) => handleShippingChange('apartment', e.target.value)}
                        placeholder="Apt 4B"
                        className="bg-gray-50 border-gray-200"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          value={shippingInfo.city}
                          onChange={(e) => handleShippingChange('city', e.target.value)}
                          placeholder="Mumbai"
                          className="bg-gray-50 border-gray-200"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State *</Label>
                        <Select value={shippingInfo.state} onValueChange={(value) => handleShippingChange('state', value)}>
                          <SelectTrigger className="bg-gray-50 border-gray-200">
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MH">Maharashtra</SelectItem>
                            <SelectItem value="DL">Delhi</SelectItem>
                            <SelectItem value="KA">Karnataka</SelectItem>
                            <SelectItem value="TN">Tamil Nadu</SelectItem>
                            <SelectItem value="WB">West Bengal</SelectItem>
                            <SelectItem value="UP">Uttar Pradesh</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="zipCode">PIN Code *</Label>
                        <Input
                          id="zipCode"
                          value={shippingInfo.zipCode}
                          onChange={(e) => handleShippingChange('zipCode', e.target.value)}
                          placeholder="400001"
                          className="bg-gray-50 border-gray-200"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Delivery Options */}
                <Card className="border-0 shadow-sm bg-white/80 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 bg-orange-50 rounded-lg">
                        <Truck className="h-5 w-5 text-orange-600" />
                      </div>
                      Delivery Options
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup value={selectedDelivery} onValueChange={setSelectedDelivery} className="space-y-3">
                      {deliveryOptions.map((option) => (
                        <div key={option.id} className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all ${
                          selectedDelivery === option.id ? 'border-primary bg-primary/5' : 'border-gray-200'
                        }`}>
                          <RadioGroupItem value={option.id} id={option.id} />
                          <div className="flex-1 flex items-center justify-between">
                            <div>
                              <Label htmlFor={option.id} className="font-semibold cursor-pointer">
                                {option.name}
                              </Label>
                              <p className="text-sm text-gray-600">{option.description}</p>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-lg">
                                {option.price === 0 ? "Free" : `₹${option.price}`}
                              </div>
                              <div className="text-sm text-gray-500">{option.time}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button onClick={handleContinueToPayment} size="lg" className="px-8">
                    Continue to Payment
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
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
                    <RadioGroup value={selectedPayment} onValueChange={setSelectedPayment} className="space-y-3">
                      {paymentMethods.map((method) => (
                        <div key={method.id} className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all ${
                          selectedPayment === method.id ? 'border-primary bg-primary/5' : 'border-gray-200'
                        }`}>
                          <RadioGroupItem value={method.id} id={method.id} />
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

                {/* Billing Address */}
                <Card className="border-0 shadow-sm bg-white/80 backdrop-blur">
                  <CardHeader>
                    <CardTitle>Billing Address</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="billingAddressSame"
                        checked={billingAddressSame}
                        onCheckedChange={(checked) => setBillingAddressSame(checked === true)}
                      />
                      <Label htmlFor="billingAddressSame">
                        Same as shipping address
                      </Label>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep(1)}>
                    Back to Shipping
                  </Button>
                  <Button 
                    onClick={handlePlaceOrder} 
                    size="lg" 
                    className="px-8"
                    disabled={isProcessingPayment}
                  >
                    {isProcessingPayment ? "Processing..." : "Pay Now"}
                  </Button>
                </div>
              </div>
            )}
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
                    <span>{deliveryFee === 0 ? "Free" : `₹${deliveryFee.toFixed(2)}`}</span>
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
