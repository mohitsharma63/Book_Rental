import { useState } from "react";
import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  Star, 
  Heart, 
  Share2, 
  Calendar, 
  User, 
  BookOpen, 
  Clock,
  MapPin,
  ShoppingCart,
  ArrowLeft,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { Link } from "wouter";

export default function BookDetail() {
  const [, params] = useRoute("/book/:id");
  const bookId = params?.id;
  const { user, isAuthenticated } = useAuth();

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedRentalPeriod, setSelectedRentalPeriod] = useState("1");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  // Fetch book data dynamically from API
  const { data: book, isLoading, error } = useQuery({
    queryKey: ['book', bookId],
    queryFn: async () => {
      const response = await fetch(`/api/books/${bookId}`);
      if (!response.ok) {
        throw new Error('Book not found');
      }
      return response.json();
    },
    enabled: !!bookId
  });

  // Fetch reviews data
  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ['reviews', bookId],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/reviews/book/${bookId}`);
        if (!response.ok) {
          console.warn('Reviews API failed:', response.status, response.statusText);
          return [];
        }
        const data = await response.json();
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.warn('Reviews API error:', error);
        return [];
      }
    },
    enabled: !!bookId,
    retry: false,
    refetchOnWindowFocus: false,
  });
const handleSubmitReview = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!isAuthenticated || !user) {
    alert("Please login to submit a review");
    return;
  }

  // Log the review data before submission
  const reviewData = {
    userId: user.id,
    bookId: bookId,
    rating: reviewRating,
    comment: reviewComment,
  };
  
  console.log("Review Data being submitted:", reviewData);

  try {
    const response = await fetch('/api/reviews', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reviewData),
    });

    if (response.ok) {
      setShowReviewForm(false);
      setReviewComment("");
      setReviewRating(5);
      // Refetch or reload reviews after a successful submission
      window.location.reload();
    } else {
      const errorData = await response.json();
      console.error("Failed to submit review:", errorData);
    }
  } catch (error) {
    console.error("Error submitting review:", error);
  }
};

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "1 day ago";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    } else {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months > 1 ? 's' : ''} ago`;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading book details...</p>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Book Not Found</h1>
            <p className="text-muted-foreground mb-4">
              The book you're looking for doesn't exist.
            </p>
            <Link href="/catalog">
              <Button>Browse Catalog</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const rentalPeriods = [
    { weeks: "1", price: parseFloat(book.pricePerWeek).toFixed(2), label: "1 Week" },
    { weeks: "2", price: (parseFloat(book.pricePerWeek) * 1.9).toFixed(2), label: "2 Weeks", discount: "5% off" },
    { weeks: "4", price: (parseFloat(book.pricePerWeek) * 3.6).toFixed(2), label: "1 Month", discount: "10% off" },
  ];

  // Use dynamic reviews data or fallback to empty array
  const displayReviews = reviews.length > 0 ? reviews : [];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <Link href="/catalog">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Catalog
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Book Image and Quick Actions */}
        <div className="lg:col-span-1">
          <div className="sticky top-8">
            <Card className="overflow-hidden">
              <div className="aspect-[3/4] relative">
                <img 
                  src={book.imageUrl} 
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4">
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className="bg-white/90 hover:bg-white"
                  >
                    <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                  </Button>
                </div>
                <div className="absolute top-4 left-4">
                  <Badge className="bg-primary text-primary-foreground">
                    {book.category}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${i < Math.floor(book.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium">{book.rating || "4.5"}</span>
                    <span className="text-sm text-muted-foreground">(12 reviews)</span>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Availability</span>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">{book.availableCopies} of {book.totalCopies} available</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Condition</span>
                    <Badge variant="outline">Excellent</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Format</span>
                    <span className="text-sm">Paperback</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Book Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
            <div className="flex items-center gap-4 text-muted-foreground mb-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{book.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{book.publishedYear}</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span>{book.pages} pages</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              <Badge variant="secondary" className="text-xs">
                {book.category}
              </Badge>
              {book.isbn && (
                <Badge variant="secondary" className="text-xs">
                  ISBN: {book.isbn}
                </Badge>
              )}
            </div>
          </div>

          {/* Description */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4">About This Book</h3>
              <p className="text-muted-foreground leading-relaxed">
                {book.description || "No description available for this book."}
              </p>
            </CardContent>
          </Card>

          {/* Book Details */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4">Book Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ISBN:</span>
                    <span className="font-mono text-sm">{book.isbn}</span>
                  </div>
                  {book.publishedYear && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Published:</span>
                      <span>{book.publishedYear}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Format:</span>
                    <span>Paperback</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Available Copies:</span>
                    <span>{book.availableCopies} of {book.totalCopies}</span>
                  </div>
                  {book.pages && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Pages:</span>
                      <span>{book.pages}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Category:</span>
                    <span>{book.category}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rental Options */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4">Rental Options</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {rentalPeriods.map((period) => (
                  <div
                    key={period.weeks}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedRentalPeriod === period.weeks
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedRentalPeriod(period.weeks)}
                  >
                    <div className="text-center">
                      <h4 className="font-semibold mb-1">{period.label}</h4>
                      <div className="text-2xl font-bold text-primary mb-1">
                        ${period.price}
                      </div>
                      {period.discount && (
                        <Badge variant="secondary" className="text-xs">
                          {period.discount}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-4">
                <Button 
                  className="flex-1" 
                  disabled={book.availableCopies === 0}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {book.availableCopies > 0 ? 'Rent Now' : 'Not Available'}
                </Button>
                <Button variant="outline">
                  Add to Cart
                </Button>
              </div>

              <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Free delivery within 24 hours • Return anytime during rental period</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reviews */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Reviews ({displayReviews.length})</h3>
                {isAuthenticated ? (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowReviewForm(!showReviewForm)}
                  >
                    {showReviewForm ? 'Cancel' : 'Write Review'}
                  </Button>
                ) : (
                  <Link href="/login">
                    <Button variant="outline" size="sm">
                      Login to Review
                    </Button>
                  </Link>
                )}
              </div>

              {/* Review Form */}
              {showReviewForm && isAuthenticated && (
                <Card className="mb-6">
                  <CardContent className="p-4">
                    <form onSubmit={handleSubmitReview} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Rating</label>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <button
                              key={rating}
                              type="button"
                              onClick={() => setReviewRating(rating)}
                              className="focus:outline-none"
                            >
                              <Star 
                                className={`h-5 w-5 cursor-pointer transition-colors ${
                                  rating <= reviewRating 
                                    ? 'fill-yellow-400 text-yellow-400' 
                                    : 'text-gray-300 hover:text-yellow-300'
                                }`} 
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Comment</label>
                        <textarea
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          className="w-full min-h-[100px] p-3 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Share your thoughts about this book..."
                          required
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit">Submit Review</Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setShowReviewForm(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {reviewsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">Loading reviews...</p>
                </div>
              ) : displayReviews.length > 0 ? (
                <div className="space-y-6">
                  {displayReviews.map((review) => (
                    <div key={review.id} className="flex gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {review.user?.firstName?.charAt(0) || 'U'}
                          {review.user?.lastName?.charAt(0) || ''}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold">
                            {review.user?.firstName} {review.user?.lastName}
                          </span>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`h-3 w-3 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                              />
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(review.createdAt)}
                          </span>
                        </div>
                        <p className="text-muted-foreground">{review.comment}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No reviews yet. Be the first to review this book!</p>
                </div>
              )}

              {displayReviews.length > 0 && (
                <>
                  <Separator className="my-6" />

                  <div className="text-center">
                    <Button variant="outline">
                      Load More Reviews
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}