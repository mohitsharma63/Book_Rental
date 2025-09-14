import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingCart, Trash2, Plus, Minus, Tag, Clock, CreditCard, Truck } from "lucide-react";
import { useStore } from "@/lib/store-context";

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
    // For now, we'll handle this locally since it's not in the context yet
    // You can extend the context to include this functionality
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
    const duration = item.rentalPeriod || item.rentalDuration || 1;
    const durationMultiplier = duration === 1 ? 1 : duration === 2 ? 1.5 : 2;
    return sum + ((item.price || item.pricePerWeek || 0) * durationMultiplier * item.quantity);
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
      icon: "🏪"
    },
    {
      id: "standard",
      name: "Standard Delivery",
      price: 2.99,
      description: "2-3 business days",
      icon: "📦"
    },
    {
      id: "express",
      name: "Express Delivery",
      price: 4.99,
      description: "Next business day",
      icon: "⚡"
    }
  ];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <ShoppingCart className="h-8 w-8" />
        <h1 className="text-3xl font-bold" data-testid="cart-title">
          Shopping Cart
        </h1>
        <Badge variant="secondary" className="ml-2">
          {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
        </Badge>
      </div>

      {cartItems.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingCart className="mx-auto h-16 w-16 mb-6 text-muted-foreground" />
          <h3 className="text-2xl font-semibold mb-4">Your cart is empty</h3>
          <p className="text-muted-foreground mb-6">
            Looks like you haven't added any books to your cart yet.
          </p>
          <Button size="lg" data-testid="browse-books">
            Browse Books
          </Button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <img
                      src={item.imageUrl}
                      alt={`${item.title} cover`}
                      className="w-20 h-28 object-cover rounded"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold">{item.title}</h3>
                          <p className="text-sm text-muted-foreground">{item.author}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          data-testid={`remove-${item.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        {/* Rental Duration */}
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Rental Duration
                          </label>
                          <Select 
                            value={(item.rentalPeriod || item.rentalDuration || 1).toString()}
                            onValueChange={(value) => updateRentalDuration(item.id, parseInt(value))}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1 Week (+$0)</SelectItem>
                              <SelectItem value="2">2 Weeks (+50%)</SelectItem>
                              <SelectItem value="3">3 Weeks (+100%)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Quantity */}
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Quantity
                          </label>
                          <div className="flex items-center border rounded-md">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateQuantity(item.id, -1)}
                              disabled={item.quantity === 1}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="px-4 py-2 font-medium">{item.quantity}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateQuantity(item.id, 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Price</div>
                          <div className="font-semibold">
                            ${((item.price || item.pricePerWeek || 0) * ((item.rentalPeriod || item.rentalDuration || 1) === 1 ? 1 : (item.rentalPeriod || item.rentalDuration || 1) === 2 ? 1.5 : 2) * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Delivery Options */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Delivery Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {deliveryOptions.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={option.id}
                      checked={selectedDelivery === option.id}
                      onCheckedChange={() => setSelectedDelivery(option.id)}
                      data-testid={`delivery-${option.id}`}
                    />
                    <label htmlFor={option.id} className="flex-1 cursor-pointer">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{option.icon}</span>
                          <div>
                            <div className="font-medium">{option.name}</div>
                            <div className="text-sm text-muted-foreground">{option.description}</div>
                          </div>
                        </div>
                        <div className="font-medium">
                          {option.price === 0 ? "Free" : `$${option.price}`}
                        </div>
                      </div>
                    </label>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Promo Code */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Promo Code
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    data-testid="promo-code-input"
                  />
                  <Button 
                    onClick={applyPromoCode}
                    data-testid="apply-promo"
                  >
                    Apply
                  </Button>
                </div>
                {appliedPromo && (
                  <div className="mt-2 text-sm text-green-600">
                    ✓ Promo code "{appliedPromo}" applied!
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span>{deliveryFee === 0 ? "Free" : `$${deliveryFee.toFixed(2)}`}</span>
                </div>
                {promoDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Promo Discount</span>
                    <span>-${promoDiscount.toFixed(2)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>

                <Button className="w-full" size="lg" data-testid="checkout-button">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Proceed to Checkout
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Items in cart are reserved for 30 minutes
                </div>
              </CardContent>
            </Card>

            {/* Security Notice */}
            <div className="bg-muted p-4 rounded-lg text-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="font-medium">Secure Checkout</span>
              </div>
              <p className="text-muted-foreground">
                Your payment information is encrypted and secure. 
                We never store your credit card details.
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}