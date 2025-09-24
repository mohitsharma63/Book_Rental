import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, CreditCard, MapPin, User, Package, CheckCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface CartItem {
  id: number;
  name: string;
  price: string;
  originalPrice?: string;
  image: string;
  quantity: number;
  inStock: boolean;
}

export default function CheckoutPage() {
  const [, setLocation] = useLocation();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState("");
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    paymentMethod: "cashfree",
  });
  const [userProfile, setUserProfile] = useState(null);
  const [profileDataLoaded, setProfileDataLoaded] = useState(false);

  useEffect(() => {
    // Check if user is logged in when accessing checkout
    const user = localStorage.getItem("user");
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to proceed with checkout",
        variant: "destructive",
      });
      window.location.href = "/auth/login";
      return;
    }

    // Parse user data and set profile
    try {
      const userData = JSON.parse(user);
      setUserProfile(userData);

      // Auto-fill form data if profile has information and not already loaded
      if (userData && !profileDataLoaded) {
        // Parse address to extract city, state, zipCode from profile
        let city = "";
        let state = "";
        let zipCode = "";
        let streetAddress = userData.address || "";

        // Try to extract city, state, zipCode from full address if they exist
        if (streetAddress) {
          const addressParts = streetAddress.split(',').map(part => part.trim());
          if (addressParts.length >= 3) {
            // Last part might contain state and pin code
            const lastPart = addressParts[addressParts.length - 1];
            const pinCodeMatch = lastPart.match(/\d{6}$/);
            if (pinCodeMatch) {
              zipCode = pinCodeMatch[0];
              state = lastPart.replace(/\d{6}$/, '').trim();
            } else {
              state = lastPart;
            }

            // Second last part might be city
            if (addressParts.length >= 2) {
              city = addressParts[addressParts.length - 2];
            }

            // Remove city and state from full address to get street address
            streetAddress = addressParts.slice(0, -2).join(', ');
          } else if (addressParts.length === 2) {
            // If only 2 parts, assume first is address and second is city
            city = addressParts[1];
            streetAddress = addressParts[0];
          } else if (addressParts.length === 1) {
            // If only 1 part, use it as street address
            streetAddress = addressParts[0];
          }
        }

        // Auto-fill form data with profile information
        setFormData({
          email: userData.email || "",
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          address: streetAddress,
          city: city,
          state: state,
          zipCode: zipCode,
          phone: userData.phone || "",
          paymentMethod: "cod",
        });

        setProfileDataLoaded(true);

        // Show notification that data was auto-filled
        if (userData.firstName || userData.lastName || userData.email || userData.phone || userData.address) {
          toast({
            title: "Profile Data Loaded",
            description: "Your contact information and shipping address have been filled automatically.",
          });
        }
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
    }

    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart);
      } catch (error) {
        console.error("Error parsing cart data:", error);
        setCartItems([]);
      }
    }
    setLoading(false);
  }, [profileDataLoaded]);

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      // Handle different price formats - string or number
      let price = 0;
      if (typeof item.price === 'string') {
        price = parseInt(item.price.replace(/[₹,]/g, ""));
      } else if (typeof item.price === 'number') {
        price = item.price;
      }
      return total + (price * item.quantity);
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const shipping = subtotal > 599 ? 0 : 99;
  const total = subtotal + shipping;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.email || !formData.firstName || !formData.lastName || !formData.address || !formData.city || !formData.state || !formData.zipCode) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      if (formData.paymentMethod === "cashfree") {
        // Cashfree payment flow
        const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const customerDetails = {
          customerId: userProfile?.id || `customer_${Date.now()}`,
          customerName: `${formData.firstName} ${formData.lastName}`,
          customerEmail: formData.email,
          customerPhone: formData.phone || '9999999999'
        };

        const orderData = {
          items: cartItems.map(item => ({
            productId: item.id,
            productName: item.name,
            productImage: item.image,
            quantity: item.quantity,
            price: typeof item.price === 'string' ? parseInt(item.price.replace(/[₹,]/g, "")) : item.price
          })),
          shippingAddress: `${formData.address}, ${formData.city}, ${formData.state}, ${formData.zipCode}`
        };

        // Create Cashfree order
        const response = await fetch('/api/payments/cashfree/create-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: total,
            orderId: orderId,
            currency: 'INR',
            customerDetails: customerDetails,
            orderNote: `Order for ${cartItems.length} items`,
            orderData: orderData
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to create payment order');
        }

        // Redirect to Cashfree payment page
        const paymentUrl = `https://sandbox.cashfree.com/pg/checkout/pay?payment_session_id=${result.paymentSessionId}`;
        window.location.href = paymentUrl;

      } else {
        // Cash on Delivery flow
        const newOrderId = `ORD-${Date.now()}`;

        // Create order with your existing API
        const response = await fetch('/api/create-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: total,
            currency: 'INR',
            customer_details: {
              customer_name: `${formData.firstName} ${formData.lastName}`,
              customer_email: formData.email,
              customer_phone: formData.phone || '9999999999',
            },
            shipping_details: {
              address: formData.address,
              city: formData.city,
              state: formData.state,
              pincode: formData.zipCode,
            },
            cartItems: cartItems
          })
        });

        if (!response.ok) {
          throw new Error('Failed to create order');
        }

        setOrderId(newOrderId);
        setOrderPlaced(true);

        // Clear cart
        localStorage.removeItem("cart");
        localStorage.setItem("cartCount", "0");
        window.dispatchEvent(new Event("cartUpdated"));

        toast({
          title: "Order Placed Successfully!",
          description: "You will receive a confirmation call shortly",
        });
      }
    } catch (error) {
      console.error('Order placement error:', error);
      toast({
        title: "Order Failed",
        description: error.message || "There was an error placing your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center shadow-lg">
          <CardContent className="pt-6 space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Order Confirmed!</h2>
            <p className="text-gray-600">
              Thank you for your purchase. Your order {orderId} has been confirmed.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Estimated delivery</p>
              <p className="font-semibold">3-5 business days</p>
            </div>
            <div className="space-y-3 pt-4">
              <Link href="/">
                <Button className="w-full bg-red-600 hover:bg-red-700">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <Package className="mx-auto h-24 w-24 text-gray-300 mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Add some items to your cart before checking out.</p>
            <Link href="/">
              <Button className="bg-red-600 hover:bg-red-700">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/cart" className="inline-flex items-center text-red-600 hover:text-red-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cart
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        </div>

        <form onSubmit={handlePlaceOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Checkout Form */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="address">Address *</Label>
                    <Textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="zipCode">ZIP Code *</Label>
                    <Input
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={formData.paymentMethod}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value }))}
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value="cashfree" id="cashfree" />
                      <Label htmlFor="cashfree" className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Pay Online</p>
                            <p className="text-sm text-gray-500">Credit/Debit Card, UPI, Net Banking</p>
                          </div>
                          <CreditCard className="h-5 w-5 text-gray-400" />
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value="cod" id="cod" />
                      <Label htmlFor="cod" className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Cash on Delivery</p>
                            <p className="text-sm text-gray-500">Pay when you receive your order</p>
                          </div>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-16 w-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.name}</h4>
                          <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">₹{item.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-200 mt-6 pt-6 space-y-2">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>₹{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Shipping</span>
                      <span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
                    </div>
                    <div className="flex justify-between text-lg font-semibold text-gray-900 pt-2 border-t">
                      <span>Total</span>
                      <span>₹{total.toLocaleString()}</span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full mt-6 bg-red-600 hover:bg-red-700"
                    size="lg"
                    disabled={loading}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    {loading ? 'Processing...' : 
                     formData.paymentMethod === 'cashfree' ? 
                     `Pay Online - ₹${total.toLocaleString()}` : 
                     `Place Order - ₹${total.toLocaleString()}`}
                  </Button>

                  <p className="text-xs text-gray-500 mt-4 text-center">
                    By placing your order, you agree to our Terms of Service and Privacy Policy.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}