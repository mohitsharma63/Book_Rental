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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface CartItem {
  id: string;
  title: string;
  author: string;
  price: number;
  imageUrl: string;
  quantity: number;
  rentalDuration: number;
}

export default function CheckoutPage() {
  const [, setLocation] = useLocation();
  const [location] = useLocation();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [deliveryChargeLoading, setDeliveryChargeLoading] = useState(false);
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
    shipping: 0, // Initialize shipping to 0
  });
  const [userProfile, setUserProfile] = useState(null);
  const [profileDataLoaded, setProfileDataLoaded] = useState(false);
  const [availableCities, setAvailableCities] = useState<Array<{ city: string; state: string }>>([]);
  const [availablePinCodes, setAvailablePinCodes] = useState<string[]>([]);

  // Added to get user info from localStorage
  const user = localStorage.getItem("user");
  const parsedUser = user ? JSON.parse(user) : null;


  useEffect(() => {
    // Fetch available cities
    const fetchCities = async () => {
      try {
        const response = await fetch('/api/locations/cities');
        const cities = await response.json();
        setAvailableCities(cities);
      } catch (error) {
        console.error("Failed to fetch cities:", error);
      }
    };
    fetchCities();
  }, []);

  useEffect(() => {
    const initCheckout = async () => {
      // Check URL parameters for payment processing
      const searchParams = new URLSearchParams(location.search);
      const paymentStatus = searchParams.get('payment');
      const orderIdParam = searchParams.get('orderId');

      if (paymentStatus === 'processing' && orderIdParam) {
        verifyPayment(orderIdParam);
        return;
      }

      // Check if user is logged in when accessing checkout
      if (!parsedUser) {
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
        setUserProfile(parsedUser);

        // Auto-fill form data if profile has information and not already loaded
        if (parsedUser && !profileDataLoaded) {
          // Parse address to extract city, state, zipCode from profile
          let city = "";
          let state = "";
          let zipCode = "";
          let streetAddress = parsedUser.address || "";

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
            email: parsedUser.email || "",
            firstName: parsedUser.firstName || "",
            lastName: parsedUser.lastName || "",
            address: streetAddress,
            city: city,
            state: state,
            zipCode: zipCode,
            phone: parsedUser.phone || "",
            paymentMethod: "cashfree",
            shipping: 0, // Default shipping
          });

          setProfileDataLoaded(true);

          // Show notification that data was auto-filled
          if (parsedUser.firstName || parsedUser.lastName || parsedUser.email || parsedUser.phone || parsedUser.address) {
            toast({
              title: "Profile Data Loaded",
              description: "Your contact information and shipping address have been filled automatically.",
            });
          }

          // Fetch delivery charge if zipCode is available
          if (zipCode) {
            await fetchDeliveryCharge(zipCode);
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
    };

    initCheckout();
  }, [profileDataLoaded, location]);

  const verifyPayment = async (orderIdParam: string) => {
    try {
      const response = await fetch('/api/payments/cashfree/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: orderIdParam }),
      });

      const result = await response.json();

      if (response.ok && result.verified) {
        // Payment successful, create the order
        const pendingOrder = sessionStorage.getItem('pendingOrder');
        if (pendingOrder) {
          const orderData = JSON.parse(pendingOrder);
          setOrderId(orderData.orderId);
          setOrderPlaced(true);

          // Clear cart and session
          localStorage.removeItem("cart");
          sessionStorage.removeItem('pendingOrder');
          localStorage.setItem("cartCount", "0");
          window.dispatchEvent(new Event("cartUpdated"));

          toast({
            title: "Payment Successful!",
            description: "Your order has been confirmed",
          });
        }
      } else {
        // Payment failed
        toast({
          title: "Payment Failed",
          description: "Your payment could not be processed. Please try again.",
          variant: "destructive",
        });

        // Restore cart from session
        const pendingOrder = sessionStorage.getItem('pendingOrder');
        if (pendingOrder) {
          const orderData = JSON.parse(pendingOrder);
          setCartItems(orderData.cartItems);
        }
        sessionStorage.removeItem('pendingOrder');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      toast({
        title: "Verification Error",
        description: "Could not verify payment status. Please contact support.",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const getCurrentUser = () => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const baseMonthlyPrice = parseFloat(item.price?.toString() || "0");
      let totalPrice;

      if ((item.rentalDuration || 4) === 4) {
        totalPrice = baseMonthlyPrice;
      } else if ((item.rentalDuration || 4) === 8) {
        totalPrice = baseMonthlyPrice * 1.8; // 2 months with 10% discount
      } else {
        totalPrice = baseMonthlyPrice;
      }

      return total + (totalPrice * item.quantity);
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const shipping = formData.shipping; // Use shipping from formData
  const total = subtotal + shipping;

  const handleCityChange = async (cityName: string) => {
    try {
      // Fetch city details to get state and PIN codes
      const response = await fetch(`/api/locations/city/${encodeURIComponent(cityName)}`);
      const data = await response.json();

      if (data.state && data.pinCodes) {
        setFormData(prev => ({
          ...prev,
          city: cityName,
          state: data.state,
          zipCode: '' // Clear ZIP code when city changes
        }));
        setAvailablePinCodes(data.pinCodes);

        toast({
          title: "City Selected",
          description: `${cityName}, ${data.state} - Select a PIN code`,
        });
      }
    } catch (error) {
      console.error("Failed to fetch city details:", error);
      toast({
        title: "Error",
        description: "Failed to load city details",
        variant: "destructive"
      });
    }
  };

  const handlePinCodeChange = async (pinCode: string) => {
    setFormData(prev => ({
      ...prev,
      zipCode: pinCode
    }));

    // Fetch delivery charge
    await fetchDeliveryCharge(pinCode);
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Fetch delivery charge when pincode is entered manually (6 digits)
    if (name === 'zipCode' && value.length === 6) {
      await fetchDeliveryCharge(value);

      // Try to auto-detect city and state from PIN code
      try {
        const response = await fetch(`/api/locations/pincode/${value}`);
        const data = await response.json();
        if (data.city && data.state) {
          setFormData(prev => ({
            ...prev,
            city: data.city,
            state: data.state
          }));
        }
      } catch (error) {
        // Ignore error, user can manually select city
      }
    }
  };

  const fetchDeliveryCharge = async (pincode: string) => {
    try {
      setDeliveryChargeLoading(true);

      // Calculate total weight (assuming 0.5kg per book)
      const totalWeight = cartItems.reduce((total, item) =>
        total + (0.5 * item.quantity), 0
      );

      const response = await fetch('/api/shiprocket/check-serviceability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deliveryPincode: pincode,
          weight: totalWeight,
          cod: formData.paymentMethod === 'cod' ? 1 : 0
        })
      });

      const data = await response.json();

      if (data.serviceable) {
        const deliveryCharge = data.freight_charge || 0;

        setFormData(prev => ({
          ...prev,
          shipping: deliveryCharge
        }));

        if (deliveryCharge > 0) {
          toast({
            title: "Delivery Charge Updated",
            description: `₹${deliveryCharge} delivery charge applied for pincode ${pincode}`,
          });
        } else {
          toast({
            title: "Free Delivery",
            description: `Free delivery available for pincode ${pincode}`,
          });
        }
      } else {
        toast({
          title: "Delivery Not Available",
          description: `Sorry, delivery is not available for pincode ${pincode}`,
          variant: "destructive"
        });
        setFormData(prev => ({ ...prev, shipping: 0 }));
      }
    } catch (error) {
      console.error("Error fetching delivery charge:", error);
      toast({
        title: "Error",
        description: "Failed to fetch delivery charge. Please try again.",
        variant: "destructive"
      });
      setFormData(prev => ({ ...prev, shipping: 0 }));
    } finally {
      setDeliveryChargeLoading(false);
    }
  };

  const processCashfreePayment = async () => {
    try {
      const user = getCurrentUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to continue with payment",
          variant: "destructive",
        });
        return false;
      }

      // Validate form data
      if (!formData.email || !formData.firstName || !formData.lastName) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return false;
      }

      // Validate phone number if provided
      if (formData.phone && formData.phone.trim()) {
        const phoneRegex = /^(\+91|91)?[6-9]\d{9}$/;
        const cleanPhone = formData.phone.replace(/[\s-()]/g, '');
        if (!phoneRegex.test(cleanPhone)) {
          toast({
            title: "Invalid Phone Number",
            description: "Please enter a valid 10-digit Indian mobile number starting with 6-9",
            variant: "destructive",
          });
          return false;
        }
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        toast({
          title: "Invalid Email",
          description: "Please enter a valid email address",
          variant: "destructive",
        });
        return false;
      }

      // Generate unique order ID
      const orderId = `ORD-${Date.now()}-${user.id}`;

      // Create Cashfree order
      const response = await fetch('/api/payments/cashfree/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-info': JSON.stringify({
            id: user.id,
            email: user.email,
            role: user.role || 'user',
            isAdmin: user.isAdmin || false
          })
        },
        body: JSON.stringify({
          amount: total,
          orderId: orderId,
          currency: 'INR',
          customerDetails: {
            customerId: String(user.id),
            customerName: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
            customerEmail: formData.email.trim(),
            customerPhone: formData.phone?.trim() || '9999999999',
          },
          orderNote: 'Book Rental Purchase',
          orderData: {
            userId: user.id,
            totalAmount: total,
            shippingAddress: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}`,
            items: cartItems.map(item => ({
              bookId: item.id,
              bookTitle: item.title,
              bookImage: item.imageUrl,
              quantity: item.quantity,
              price: item.price,
              rentalDays: item.rentalDuration * 7 // Convert weeks to days
            }))
          }
        }),
      });

      const orderData = await response.json();

      if (!response.ok) {
        console.error('Cashfree API error:', orderData);

        let errorMessage = "Payment processing failed";

        if (orderData.configError) {
          errorMessage = "Cashfree is not configured. Please use Cash on Delivery.";
        } else if (orderData.cashfreeError) {
          errorMessage = orderData.error || "Cashfree service error. Please try again.";
        } else {
          errorMessage = orderData.error || `Payment setup failed (${response.status})`;
        }

        toast({
          title: "Payment Error",
          description: errorMessage,
          variant: "destructive",
        });
        return false;
      }

      if (!orderData.paymentSessionId) {
        console.error("Missing payment session ID:", orderData);
        toast({
          title: "Configuration Error",
          description: "Invalid payment session. Please try Cash on Delivery.",
          variant: "destructive",
        });
        return false;
      }

      // Store order data in session storage for after payment
      sessionStorage.setItem('pendingOrder', JSON.stringify({
        orderId: orderData.orderId,
        paymentSessionId: orderData.paymentSessionId,
        customerData: formData,
        cartItems: cartItems,
        totalAmount: total
      }));

      // Load Cashfree SDK and redirect to payment
      return new Promise((resolve) => {
        const existingScript = document.querySelector('script[src="https://sdk.cashfree.com/js/v3/cashfree.js"]');
        if (existingScript) {
          existingScript.remove();
        }

        const script = document.createElement('script');
        script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
        script.onload = () => {
          try {
            const cashfree = (window as any).Cashfree({
              mode: orderData.environment || 'sandbox'
            });

            console.log("Initiating Cashfree checkout with session ID:", orderData.paymentSessionId);
            console.log("Using environment mode:", orderData.environment || 'sandbox');

            cashfree.checkout({
              paymentSessionId: orderData.paymentSessionId,
              returnUrl: `${window.location.origin}/checkout?payment=processing&orderId=${orderData.orderId}`,
            });

            resolve(true);
          } catch (checkoutError) {
            console.error("Cashfree checkout error:", checkoutError);
            toast({
              title: "Payment Error",
              description: "Failed to initialize payment. Please try again.",
              variant: "destructive",
            });
            resolve(false);
          }
        };
        script.onerror = () => {
          console.error("Failed to load Cashfree SDK");
          toast({
            title: "Payment Error",
            description: "Failed to load payment system. Please try again.",
            variant: "destructive",
          });
          resolve(false);
        };
        document.head.appendChild(script);
      });
    } catch (error) {
      console.error('Cashfree payment error:', error);
      toast({
        title: "Payment Error",
        description: error instanceof Error ? error.message : "Payment processing failed",
        variant: "destructive",
      });
      return false;
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    const user = getCurrentUser();
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to place an order",
        variant: "destructive",
      });
      return;
    }

    // Basic validation
    if (!formData.email || !formData.firstName || !formData.lastName || !formData.address || !formData.city || !formData.state || !formData.zipCode) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Validate phone number if provided
    if (formData.phone && formData.phone.trim()) {
      const phoneRegex = /^(\+91|91)?[6-9]\d{9}$/;
      const cleanPhone = formData.phone.replace(/[\s-()]/g, '');
      if (!phoneRegex.test(cleanPhone)) {
        toast({
          title: "Invalid Phone Number",
          description: "Please enter a valid 10-digit Indian mobile number starting with 6-9",
          variant: "destructive",
        });
        return;
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    // Validate pincode is exactly 6 digits
    if (!/^\d{6}$/.test(formData.zipCode)) {
      toast({
        title: "Invalid ZIP Code",
        description: "Please enter a valid 6-digit ZIP code",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // Process payment based on selected method
      if (formData.paymentMethod === 'cashfree') {
        toast({
          title: "Processing Payment",
          description: "Redirecting to Cashfree...",
        });
        await processCashfreePayment();
        // For Cashfree, the order will be created after payment verification
        return;
      } else {
        // Create order with COD
        const orderResponse = await fetch('/api/create-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-info': JSON.stringify({
              id: user.id,
              email: user.email,
              role: user.role || 'user',
              isAdmin: user.isAdmin || false
            })
          },
          body: JSON.stringify({
            amount: total,
            currency: 'INR',
            customer_details: {
              customer_id: String(user.id),
              customer_name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
              customer_email: formData.email.trim(),
              customer_phone: formData.phone?.trim() || '9999999999',
            },
            shipping_details: {
              address: formData.address,
              city: formData.city,
              state: formData.state,
              pincode: formData.zipCode,
            },
            delivery_charge: shipping, // Include calculated delivery charge
            cartItems: cartItems
          }),
        });

        if (orderResponse.ok) {
          const newOrderId = `ORD-${Date.now()}`;
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
        } else {
          throw new Error('Failed to create order');
        }
      }
    } catch (error) {
      console.error('Order placement error:', error);
      toast({
        title: "Order Failed",
        description: error instanceof Error ? error.message : "There was an error placing your order. Please try again.",
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
              <Link href="/catalog">
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
                      <Select value={formData.city} onValueChange={handleCityChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select city" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableCities.map((cityData) => (
                            <SelectItem key={cityData.city} value={cityData.city}>
                              {cityData.city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        name="state"
                        value={formData.state}
                        readOnly
                        className="bg-gray-50"
                        placeholder="Auto-filled from city"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="zipCode">ZIP Code *</Label>
                    {availablePinCodes.length > 0 ? (
                      <Select value={formData.zipCode} onValueChange={handlePinCodeChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select PIN code" />
                        </SelectTrigger>
                        <SelectContent>
                          {availablePinCodes.map((pin) => (
                            <SelectItem key={pin} value={pin}>
                              {pin}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        id="zipCode"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        maxLength={6}
                        placeholder="Select a city first or enter 6-digit pincode"
                        required
                      />
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {availablePinCodes.length > 0
                        ? 'Select from available PIN codes for selected city'
                        : 'Delivery charge will be calculated based on pincode'}
                    </p>
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
                    onValueChange={async (value) => {
                      setFormData(prev => ({ ...prev, paymentMethod: value }));
                      // Recalculate delivery charge if pincode is already entered
                      if (formData.zipCode && formData.zipCode.length === 6) {
                        await fetchDeliveryCharge(formData.zipCode);
                      }
                    }}
                    className="space-y-3"
                  >
                    <Label
                      htmlFor="cashfree"
                      className={`flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        formData.paymentMethod === 'cashfree'
                          ? 'border-green-600 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300 '
                      }`}
                    >
                      <div className="relative flex items-center justify-center mt-1">
                        <RadioGroupItem value="cashfree" id="cashfree" className="sr-only" />
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          formData.paymentMethod === 'cashfree'
                            ? 'border-green-600 bg-green-600'
                            : 'border-gray-300'
                        }`}>
                          {formData.paymentMethod === 'cashfree' && (
                            <div className="w-2 h-2 rounded-full bg-white"></div>
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-gray-900">Pay Online</p>
                          <CreditCard className="h-5 w-5 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-600">Credit/Debit Card, UPI, Net Banking</p>
                      </div>
                    </Label>

                    <Label
                      htmlFor="cod"
                      className={`flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        formData.paymentMethod === 'cod'
                          ? 'border-green-600 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300 '
                      }`}
                    >
                      <div className="relative flex items-center justify-center mt-1">
                        <RadioGroupItem value="cod" id="cod" className="sr-only" />
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          formData.paymentMethod === 'cod'
                            ? 'border-green-600 bg-green-600'
                            : 'border-gray-300'
                        }`}>
                          {formData.paymentMethod === 'cod' && (
                            <div className="w-2 h-2 rounded-full bg-white"></div>
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 mb-1">Cash on Delivery</p>
                        <p className="text-sm text-gray-600">Pay when you receive your order</p>
                      </div>
                    </Label>
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <Card className="mobile-order-summary">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="h-16 w-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.title}</h4>
                        <p className="text-sm text-gray-600">by {item.author}</p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">₹{(() => {
                          const baseMonthlyPrice = parseFloat(item.price?.toString() || "0");
                          let totalPrice;

                          if ((item.rentalDuration || 4) === 4) {
                            totalPrice = baseMonthlyPrice;
                          } else if ((item.rentalDuration || 4) === 8) {
                            totalPrice = baseMonthlyPrice * 1.8; // 2 months with 10% discount
                          } else {
                            totalPrice = baseMonthlyPrice;
                          }

                          return (totalPrice * item.quantity).toFixed(2);
                        })()}</p>
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
                    <span>
                      {deliveryChargeLoading ? (
                        <span className="text-sm">Calculating...</span>
                      ) : shipping === 0 ? (
                        'Free'
                      ) : (
                        `₹${shipping}`
                      )}
                    </span>
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
                  disabled={loading || deliveryChargeLoading} // Disable button if loading or calculating delivery
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  {loading ? 'Processing...' : deliveryChargeLoading ? 'Calculating...' :
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
        </form>
      </div>
    </div>
  );
}