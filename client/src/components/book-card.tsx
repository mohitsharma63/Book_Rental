
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Book } from "@/lib/types";
import { Heart, BookOpen, Star, ShoppingCart } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { useStore } from "@/lib/store-context";

interface BookCardProps {
  book: Book;
  onRent?: () => void;
  onWishlist?: () => void;
}

export function BookCard({ book, onRent, onWishlist }: BookCardProps) {
  const { addToCart, addToWishlist, removeFromWishlist, wishlistItems } = useStore();
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Check if book is already in wishlist
  useEffect(() => {
    const isInWishlist = wishlistItems.some(item => item.bookId === book.id);
    setIsWishlisted(isInWishlist);
  }, [wishlistItems, book.id]);
  
  const getStatusColor = (availableCopies: number) => {
    if (availableCopies > 0) return "bg-green-100 text-green-800 border-green-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  const getStatusText = (availableCopies: number) => {
    if (availableCopies > 0) return "Available";
    return "Rented";
  };

  const handleWishlistClick = () => {
    if (isWishlisted) {
      // Remove from wishlist
      const wishlistItem = wishlistItems.find(item => item.bookId === book.id);
      if (wishlistItem) {
        removeFromWishlist(wishlistItem.id);
      }
    } else {
      // Add to wishlist
      const wishlistItem = {
        id: `wishlist-${book.id}-${Date.now()}`,
        bookId: book.id,
        title: book.title,
        author: book.author,
        imageUrl: book.imageUrl || "/placeholder-book.jpg",
        available: book.availableCopies > 0,
        price: parseFloat(book.pricePerWeek),
        rating: parseFloat(book.rating || "4.5"),
        dateAdded: new Date().toISOString(),
        category: book.category
      };
      addToWishlist(wishlistItem);
    }
    onWishlist?.();
  };

  const handleRentClick = () => {
    if (book.availableCopies > 0) {
      const cartItem = {
        id: `cart-${book.id}-${Date.now()}`,
        bookId: book.id,
        title: book.title,
        author: book.author,
        imageUrl: book.imageUrl || "/placeholder-book.jpg",
        price: parseFloat(book.pricePerWeek),
        rentalDuration: 1,
        quantity: 1,
        available: true
      };
      addToCart(cartItem);
    }
    onRent?.();
  };

  const renderStars = (rating: number = 4.5) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-3 w-3 ${
              i < Math.floor(rating)
                ? "fill-yellow-400 text-yellow-400"
                : "fill-gray-200 text-gray-200"
            }`}
          />
        ))}
        <span className="text-xs text-muted-foreground ml-1">{rating}</span>
      </div>
    );
  };

  return (
    <Card className="group relative overflow-hidden bg-white border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-xl hover:-translate-y-1" data-testid={`card-book-${book.id}`}>
      {/* Status Badge */}
      <div className="absolute top-3 left-3 z-20">
        <Badge 
          className={`text-xs px-2 py-1 font-medium border ${getStatusColor(book.availableCopies)}`}
          data-testid={`status-book-${book.id}`}
        >
          {getStatusText(book.availableCopies)}
        </Badge>
      </div>

      {/* Wishlist Button */}
      <div className="absolute top-3 right-3 z-20">
        <Button
          variant="ghost"
          size="icon"
          className={`h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200 hover:bg-white transition-all duration-200 ${
            isWishlisted ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
          }`}
          onClick={handleWishlistClick}
          data-testid={`button-wishlist-${book.id}`}
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </Button>
      </div>

      {/* Book Image */}
      <Link href={`/book/${book.id}`}>
        <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
          <img 
            src={book.imageUrl || "/placeholder-book.jpg"} 
            alt={`${book.title} cover`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            data-testid={`img-book-cover-${book.id}`}
            onError={(e) => {
              e.currentTarget.src = "/placeholder-book.jpg";
            }}
          />
          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300"></div>
        </div>
      </Link>

      <CardContent className="p-2 space-y-3">
        {/* Title and Author */}
        <div className="space-y-1">
          <h4 className="font-semibold text-base leading-tight text-gray-900 line-clamp-2 group-hover:text-primary transition-colors" data-testid={`text-book-title-${book.id}`}>
            {book.title}
          </h4>
          <p className="text-sm text-gray-600" data-testid={`text-book-author-${book.id}`}>
            by {book.author}
          </p>
        </div>

        {/* Category and Rating */}
        <div className="">
          {book.category && (
            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full font-medium" data-testid={`text-book-category-${book.id}`}>
              {book.category}
            </span>
          )}
          {renderStars(book.rating || 4.5)}
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-gray-900" data-testid={`text-book-price-${book.id}`}>
              ${book.pricePerWeek}
            </span>
            <span className="text-sm text-gray-500">/week</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <Button 
            className={`w-full font-medium transition-all duration-200 ${
              book.availableCopies > 0 
                ? "bg-green-600 hover:bg-green-700 text-white" 
                : "bg-gray-400 text-gray-200 cursor-not-allowed"
            }`}
            disabled={book.availableCopies === 0}
            onClick={handleRentClick}
            data-testid={`button-rent-${book.id}`}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {book.availableCopies > 0 ? "Rent Now" : "Not Available"}
          </Button>
          
          <Link href={`/book/${book.id}`} className="block w-full">
            <Button variant="outline" className="w-full font-medium border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200">
              <BookOpen className="h-4 w-4 mr-2" />
              View Details
            </Button>
          </Link>
        </div>

        {/* Stock indicator */}
        {book.availableCopies > 0 && book.availableCopies <= 3 && (
          <div className="flex items-center gap-2 pt-1">
            <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
            <span className="text-xs text-orange-600 font-medium">
              Only {book.availableCopies} left
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
