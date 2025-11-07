import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Plus, Minus } from "lucide-react";
import { Book } from "@/lib/types";
import { Heart, BookOpen, ShoppingCart } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { useStore } from "@/lib/store-context";
import { useToast } from "@/hooks/use-toast";

interface BookCardProps {
  book: Book;
  onRent?: () => void;
  onWishlist?: () => void;
}

export function BookCard({ book, onRent, onWishlist }: BookCardProps) {
  const { addToCart, addToWishlist, removeFromWishlist, wishlistItems, cartItems, updateCartQuantity } = useStore();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [quantity, setQuantity] = useState(1); // State for quantity
  const { toast } = useToast();

  // Check if book is already in wishlist and update state immediately
  useEffect(() => {
    const isInWishlist = wishlistItems.some(item => item.bookId === book.id);
    setIsWishlisted(isInWishlist);
  }, [wishlistItems, book.id]);

  // Additional effect to ensure state is synchronized
  useEffect(() => {
    const checkWishlistStatus = () => {
      const isInWishlist = wishlistItems.some(item => item.bookId === book.id);
      if (isWishlisted !== isInWishlist) {
        setIsWishlisted(isInWishlist);
      }
    };
    checkWishlistStatus();
  }, [wishlistItems, book.id, isWishlisted]);

  const getStatusColor = (availableCopies: number) => {
    if (availableCopies > 0) return "bg-green-100 text-green-800 border-green-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  const getStatusText = (availableCopies: number) => {
    if (availableCopies > 0) return "Available";
    return "Not Available";
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isWishlisted) {
      const wishlistItem = wishlistItems.find(item => item.bookId === book.id);
      if (wishlistItem) {
        removeFromWishlist(wishlistItem.id);
        setIsWishlisted(false); // Immediately update local state
        toast({
          title: "Removed from Wishlist",
          description: `"${book.title}" has been removed from your wishlist!`,
          variant: "default",
        });
      }
    } else {
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
      setIsWishlisted(true); // Immediately update local state
      toast({
        title: "Added to Wishlist",
        description: `"${book.title}" has been added to your wishlist!`,
        variant: "default",
      });
    }
    onWishlist?.();
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (book.availableCopies === 0) return;

    // Check if item already exists in cart with same book and rental duration
    const existingCartItem = cartItems.find(
      item => item.bookId === book.id && item.rentalDuration === 4
    );

   

    const cartItem = {
      id: `cart-${book.id}-4-${Date.now()}`,
      bookId: book.id,
      title: book.title,
      author: book.author,
      price: parseFloat(book.pricePerWeek),
      imageUrl: book.imageUrl,
      quantity: quantity,
      rentalDuration: 4,
      rentalPeriodLabel: "1 Month",
      available: book.availableCopies > 0
    };

    addToCart(cartItem);

    toast({
      title: "Added to Cart",
      description: `"${book.title}" (${quantity}) added to your cart`,
      variant: "default",
      action: (
        <a href="/cart" className="inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
          View Cart
        </a>
      ),
    });

   

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

  const incrementQuantity = () => {
  setQuantity(prev => Math.min( prev + 1));
};

const decrementQuantity = () => {
  setQuantity(prev => Math.max(1, prev - 1));
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
          onClick={handleWishlistToggle}
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
            className="w-full h-full book-card-image transition-transform duration-300 group-hover:scale-105"
            style={{ objectFit: 'contain', objectPosition: 'center' }}
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
          {renderStars(typeof book.rating === 'string' ? parseFloat(book.rating) : book.rating || 4.5)}
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-gray-900" data-testid={`text-book-price-${book.id}`}>
              ₹{book.pricePerWeek}
            </span>
            <span className="text-sm text-gray-500">/month</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          {/* Quantity Selector */}
          {book.availableCopies > 0 && (
  <div className="flex items-center justify-between gap-3">
    <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Qty:</span>
    <div className="flex items-center gap-2 flex-1 justify-end">
      <div className="flex items-center border border-gray-300 rounded-md overflow-hidden bg-white">
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setQuantity(prev => Math.max(1, prev - 1));
          }}
          className="h-8 w-8 rounded-none "
        >
          <Minus className="h-3 w-3" />
        </Button>
        <input
          type="number"
          value={quantity}
          onChange={(e) => {
            e.stopPropagation();
            const val = parseInt(e.target.value);
            if (!isNaN(val) && val >= 1) {
              setQuantity(val);
            } else if (e.target.value === '') {
              setQuantity(1);
            }
          }}
          onBlur={(e) => {
            const val = parseInt(e.target.value);
            if (isNaN(val) || val < 1) {
              setQuantity(1);
            }
          }}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          className="w-12 text-center text-sm font-medium py-1.5 border-x border-gray-300 focus:outline-none focus:bg-gray-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          min="1"
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setQuantity(prev => prev + 1);
          }}
          className="h-8 w-8 rounded-none"
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
     
    </div>
  </div>
)}

          <Button
            className={`w-full font-medium transition-all duration-200 shadow-md ${
              book.availableCopies > 0
                ? "bg-green-600 hover:bg-green-700 text-white hover:shadow-lg"
                : "bg-gray-400 text-gray-200 cursor-not-allowed"
            }`}
            onClick={handleAddToCart}
            data-testid={`button-rent-${book.id}`}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {book.availableCopies > 0 ? "Add to Cart" : "Not Available"}
          </Button>

          <Link href={`/book/${book.id}`} className="block w-full">
            <Button variant="outline" className="w-full font-medium border-gray-300 text-gray-700  hover:border-gray-400 transition-all duration-200">
              <BookOpen className="h-4 w-4 mr-2" />
              View Details
            </Button>
          </Link>
        </div>

        </CardContent>
      </Card>
  );
} 