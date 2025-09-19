
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingCart, Trash2, Plus, Minus, Tag, Clock, CreditCard, Truck, Shield, ArrowLeft } from "lucide-react";
import { useStore } from "@/lib/store-context";
import { Link } from "wouter";

export default function Cart() {
  const { cartItems, removeFromCart, updateCartQuantity } = useStore();
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [selectedDelivery, setSelectedDelivery] = useState("standard");

  const updateQuantity = (id: string, change: number) => {
    const item = cartItems.find(item => item.id === id);
    if (item) {
      updateCartQuantity(id, item.quantity + change);
    }
  };

  const removeItem = (id: string) => {
    removeFromCart(id);
  };

  const updateRentalDuration = (id: string, duration: number) => {
    console.log('Update rental duration:', id, duration);
  };

  const applyPromoCode = () => {
    if (promoCode.toLowerCase() === "bookworm10") {
      setAppliedPromo("BOOKWORM10");
    } else {
      alert("Invalid promo code");
    }
  };

  const subtotal = cartItems.reduce((sum, item) => {
    const duration = item.rentalDuration || 1;
    const durationMultiplier = duration === 1 ? 1 : duration === 2 ? 1.5 : 2;
    return sum + (item.price * durationMultiplier * item.quantity);
  }, 0);

  const deliveryFee = selectedDelivery === "express" ? 4.99 : selectedDelivery === "standard" ? 2.99 : 0;
  const promoDiscount = appliedPromo === "BOOKWORM10" ? subtotal * 0.1 : 0;
  const total = subtotal + deliveryFee - promoDiscount;

  const deliveryOptions = [
    {
      id: "pickup",
      name: "Store Pickup",
      price: 0,
      description: "Ready in 2 hours",
      icon: "🏪",
      highlight: false
    },
    {
      id: "standard",
      name: "Standard Delivery",
      price: 2.99,
      description: "2-3 business days",
      icon: "📦",
      highlight: true
    },
    {
      id: "express",
      name: "Express Delivery",
      price: 4.99,
      description: "Next business day",
      icon: "⚡",
      highlight: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/catalog">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Continue Shopping
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900" data-testid="cart-title">
                  Shopping Cart
                </h1>
                <p className="text-sm text-muted-foreground">
                  {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
                </p>
              </div>
            </div>
          </div>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 max-w-md mx-auto">
              <div className="p-4 bg-gray-50 rounded-xl mb-6 w-fit mx-auto">
                <ShoppingCart className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Your cart is empty</h3>
              <p className="text-gray-500 mb-6">
                Discover amazing books and start your reading journey today.
              </p>
              <Link href="/catalog">
                <Button size="lg" className="px-8" data-testid="browse-books">
                  Browse Books
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-8 space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id} className="overflow-hidden border-0 shadow-sm bg-white/80 backdrop-blur">
                  <CardContent className="p-6">
                    <div className="flex gap-6">
                      <div className="relative">
                        <img
                          src={item.imageUrl}
                          alt={`${item.title} cover`}
                          className="w-24 h-32 object-cover rounded-lg shadow-sm"
                        />
                        <div className="absolute -top-2 -right-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            className="h-8 w-8 p-0 bg-red-50 hover:bg-red-100 text-red-600 rounded-full"
                            data-testid={`remove-${item.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex-1 space-y-4">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">{item.title}</h3>
                          <p className="text-gray-600">{item.author}</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* Rental Duration */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                              Rental Period
                            </label>
                            <Select 
                              value={item.rentalDuration.toString()}
                              onValueChange={(value) => updateRentalDuration(item.id, parseInt(value))}
                            >
                              <SelectTrigger className="bg-gray-50 border-gray-200">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">1 Week</SelectItem>
                                <SelectItem value="2">2 Weeks (+50%)</SelectItem>
                                <SelectItem value="3">3 Weeks (+100%)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Quantity */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                              Quantity
                            </label>
                            <div className="flex items-center bg-gray-50 rounded-lg p-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateQuantity(item.id, -1)}
                                disabled={item.quantity === 1}
                                className="h-8 w-8 p-0"
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="px-4 py-2 font-medium min-w-[3rem] text-center">{item.quantity}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateQuantity(item.id, 1)}
                                className="h-8 w-8 p-0"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Price */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Price</label>
                            <div className="text-2xl font-bold text-primary">
                              ${(item.price * (item.rentalDuration === 1 ? 1 : item.rentalDuration === 2 ? 1.5 : 2) * item.quantity).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Delivery Options */}
              
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              {/* Promo Code */}
              <Card className="border-0 shadow-sm bg-white/80 backdrop-blur">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <Tag className="h-5 w-5 text-green-600" />
                    </div>
                    Promo Code
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter promo code"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="bg-gray-50 border-gray-200"
                        data-testid="promo-code-input"
                      />
                      <Button 
                        onClick={applyPromoCode}
                        variant="outline"
                        data-testid="apply-promo"
                      >
                        Apply
                      </Button>
                    </div>
                    {appliedPromo && (
                      <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium text-green-700">
                          Code "{appliedPromo}" applied successfully!
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Order Summary */}
              <Card className="border-0 shadow-sm bg-white/80 backdrop-blur sticky top-8">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span className="font-medium">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Delivery</span>
                      <span className="font-medium">{deliveryFee === 0 ? "Free" : `$${deliveryFee.toFixed(2)}`}</span>
                    </div>
                    {promoDiscount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span className="font-medium">-${promoDiscount.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span className="text-primary">${total.toFixed(2)}</span>
                  </div>

                  <Link href="/checkout">
                    <Button className="w-full py-6 text-lg font-semibold" size="lg" data-testid="checkout-button">
                      <CreditCard className="h-5 w-5 mr-2" />
                      Proceed to Checkout
                    </Button>
                  </Link>

                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500 pt-2">
                    <Clock className="h-4 w-4" />
                    <span>Items reserved for 30 minutes</span>
                  </div>
                </CardContent>
              </Card>

              {/* Security Notice */}
              <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-green-50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <Shield className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Secure Checkout</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        Your payment information is encrypted with bank-level security. 
                        We never store your credit card details.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
