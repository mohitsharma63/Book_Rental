import { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/lib/auth-context";
import { Package, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";

export default function ReturnRequest() {
  const { rentalId } = useParams();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [rental, setRental] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [returnReason, setReturnReason] = useState("completed");
  const [returnMethod, setReturnMethod] = useState("pickup");
  const [customerNotes, setCustomerNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (rentalId && user) {
      fetchRentalDetails();
    }
  }, [rentalId, user]);

  const fetchRentalDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/rentals?userId=${user?.id}`);
      if (response.ok) {
        const rentals = await response.json();
        const currentRental = rentals.find((r: any) => r.id === rentalId);
        setRental(currentRental);
      } else {
        setError("Rental not found");
      }
    } catch (error) {
      console.error("Error fetching rental details:", error);
      setError("Failed to fetch rental details");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReturn = async () => {
    if (!rental || !user) return;

    try {
      setSubmitting(true);
      setError(null);

      const returnData = {
        rentalId: rentalId,
        userId: user.id,
        bookId: rental.bookId,
        returnReason,
        returnMethod,
        pickupAddress: returnMethod === "pickup" ? user.address : null,
        customerNotes: customerNotes || null,
      };

      const response = await fetch("/api/returns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(returnData),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          setLocation("/profile");
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to submit return request");
      }
    } catch (error) {
      console.error("Error submitting return request:", error);
      setError("Failed to submit return request");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <div className="text-lg font-medium">Loading rental details...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4 text-center">
          <CardContent className="p-8">
            <div className="p-4 bg-green-100 rounded-full w-fit mx-auto mb-6">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Return Request Submitted</h2>
            <p className="text-gray-600 mb-6">
              Your return request has been successfully submitted. We'll process it and contact you soon.
            </p>
            <Link href="/profile">
              <Button className="w-full">Back to Orders</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !rental) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <Card className="text-center">
            <CardContent className="p-8">
              <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">Error</h2>
              <p className="text-gray-600 mb-6">
                {error || "Rental not found or you don't have permission to return this item."}
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link href="/profile">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Return Request</h1>
          <p className="text-gray-600">Submit a return request for your rental</p>
        </div>

        {/* Return Form */}
        <div className="space-y-6">
          {/* Rental Details */}
          <Card>
            <CardHeader>
              <CardTitle>Rental Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <Package className="h-12 w-12 text-primary" />
                <div className="flex-1">
                  <h3 className="font-medium">Rental ID: {rental.id}</h3>
                  <p className="text-sm text-gray-600">Book ID: {rental.bookId}</p>
                  <p className="text-sm text-gray-600">
                    Rental Period: {new Date(rental.startDate).toLocaleDateString()} - {new Date(rental.endDate).toLocaleDateString()}
                  </p>
                  <Badge className="mt-2">
                    {rental.status.charAt(0).toUpperCase() + rental.status.slice(1)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Return Reason */}
          <Card>
            <CardHeader>
              <CardTitle>Return Reason</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={returnReason} onValueChange={setReturnReason}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="completed" id="completed" />
                  <Label htmlFor="completed">Rental period completed</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="early_return" id="early_return" />
                  <Label htmlFor="early_return">Early return (finished reading)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="damaged" id="damaged" />
                  <Label htmlFor="damaged">Book is damaged</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="lost" id="lost" />
                  <Label htmlFor="lost">Book is lost</Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Return Method */}
          <Card>
            <CardHeader>
              <CardTitle>Return Method</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={returnMethod} onValueChange={setReturnMethod}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pickup" id="pickup" />
                  <Label htmlFor="pickup">
                    Pickup from my address
                    <span className="block text-sm text-gray-500">We'll collect the book from your address</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="drop_off" id="drop_off" />
                  <Label htmlFor="drop_off">
                    Drop off at collection point
                    <span className="block text-sm text-gray-500">You can drop the book at our collection points</span>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Additional Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Notes (Optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Any additional information about the return..."
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {returnReason === "damaged" || returnReason === "lost" ? (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-700">
                      <AlertCircle className="h-4 w-4 inline mr-1" />
                      Additional charges may apply for damaged or lost books. Our team will contact you for assessment.
                    </p>
                  </div>
                ) : null}
                
                <Button 
                  onClick={handleSubmitReturn} 
                  disabled={submitting}
                  className="w-full"
                >
                  {submitting ? "Submitting..." : "Submit Return Request"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}