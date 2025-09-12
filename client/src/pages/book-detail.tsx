import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Book } from "@/lib/types";
import { ArrowLeft, Heart, Star } from "lucide-react";

export default function BookDetail() {
  const params = useParams();
  const bookId = params.id;

  const { data: book, isLoading, error } = useQuery<Book>({
    queryKey: ["/api/books", bookId],
    queryFn: async () => {
      const response = await fetch(`/api/books/${bookId}`);
      if (!response.ok) throw new Error("Failed to fetch book");
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="w-full h-96 bg-muted rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded w-3/4"></div>
              <div className="h-6 bg-muted rounded w-1/2"></div>
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <div className="h-4 bg-muted rounded w-1/3"></div>
                    <div className="h-4 bg-muted rounded w-1/4"></div>
                  </div>
                ))}
              </div>
              <div className="h-20 bg-muted rounded"></div>
              <div className="h-12 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !book) {
    return (
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Book Not Found</h1>
          <p className="text-muted-foreground mb-4">The book you're looking for doesn't exist.</p>
          <Link href="/catalog">
            <Button>Back to Catalog</Button>
          </Link>
        </div>
      </main>
    );
  }

  const renderStars = (rating: string) => {
    const numRating = parseFloat(rating);
    const fullStars = Math.floor(numRating);
    const hasHalfStar = numRating % 1 !== 0;
    
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < fullStars 
                ? "fill-yellow-400 text-yellow-400" 
                : i === fullStars && hasHalfStar 
                  ? "fill-yellow-400/50 text-yellow-400" 
                  : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-muted-foreground">({rating}/5)</span>
      </div>
    );
  };

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <Link href="/catalog">
          <Button variant="ghost" className="pl-0" data-testid="button-back">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Catalog
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Book Cover */}
            <div>
              <img 
                src={book.imageUrl || "/placeholder-book.jpg"} 
                alt={`${book.title} cover`}
                className="w-full h-96 object-cover rounded-lg shadow-lg"
                data-testid="img-book-detail-cover"
              />
            </div>
            
            {/* Book Details */}
            <div>
              <h1 className="text-3xl font-bold mb-2" data-testid="text-book-detail-title">
                {book.title}
              </h1>
              <p className="text-lg text-muted-foreground mb-4" data-testid="text-book-detail-author">
                by {book.author}
              </p>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Genre:</span>
                  <Badge variant="secondary">{book.category}</Badge>
                </div>
                {book.publishedYear && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Published:</span>
                    <span data-testid="text-published-year">{book.publishedYear}</span>
                  </div>
                )}
                {book.pages && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pages:</span>
                    <span data-testid="text-pages">{book.pages}</span>
                  </div>
                )}
                {book.rating && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rating:</span>
                    {renderStars(book.rating)}
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rental Price:</span>
                  <span className="font-semibold text-primary text-lg" data-testid="text-book-detail-price">
                    ${book.pricePerWeek}/week
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Availability:</span>
                  <Badge 
                    className={book.availableCopies > 0 ? "status-available" : "status-rented"}
                    data-testid="badge-availability"
                  >
                    {book.availableCopies > 0 
                      ? `${book.availableCopies} available`
                      : "Not available"
                    }
                  </Badge>
                </div>
              </div>
              
              {book.description && (
                <div className="mb-6">
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-book-description">
                    {book.description}
                  </p>
                </div>
              )}
              
              <div className="flex space-x-4">
                <Button 
                  className="flex-1"
                  disabled={book.availableCopies === 0}
                  data-testid="button-rent-now"
                >
                  <span className="mr-2">📚</span>
                  {book.availableCopies > 0 ? "Rent Now" : "Not Available"}
                </Button>
                <Button variant="outline" data-testid="button-add-wishlist">
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
