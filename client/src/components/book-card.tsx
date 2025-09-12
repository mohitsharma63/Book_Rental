import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Book } from "@/lib/types";
import { Heart } from "lucide-react";
import { Link } from "wouter";

interface BookCardProps {
  book: Book;
  onRent?: () => void;
  onWishlist?: () => void;
}

export function BookCard({ book, onRent, onWishlist }: BookCardProps) {
  const getStatusColor = (availableCopies: number) => {
    if (availableCopies > 0) return "status-available";
    return "status-rented";
  };

  const getStatusText = (availableCopies: number) => {
    if (availableCopies > 0) return "Available";
    return "Rented";
  };

  return (
    <Card className="book-card-hover cursor-pointer overflow-hidden" data-testid={`card-book-${book.id}`}>
      <Link href={`/book/${book.id}`}>
        <div className="aspect-[3/4] overflow-hidden">
          <img 
            src={book.imageUrl || "/placeholder-book.jpg"} 
            alt={`${book.title} cover`}
            className="w-full h-full object-cover transition-transform hover:scale-105"
            data-testid={`img-book-cover-${book.id}`}
          />
        </div>
      </Link>
      <CardContent className="p-4">
        <h4 className="font-semibold text-lg mb-1 truncate" data-testid={`text-book-title-${book.id}`}>
          {book.title}
        </h4>
        <p className="text-muted-foreground text-sm mb-2" data-testid={`text-book-author-${book.id}`}>
          {book.author}
        </p>
        {book.category && (
          <p className="text-xs text-muted-foreground mb-2" data-testid={`text-book-category-${book.id}`}>
            {book.category}
          </p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-primary font-semibold" data-testid={`text-book-price-${book.id}`}>
            ${book.pricePerWeek}/week
          </span>
          <Badge 
            className={`text-xs ${getStatusColor(book.availableCopies)}`}
            data-testid={`status-book-${book.id}`}
          >
            {getStatusText(book.availableCopies)}
          </Badge>
        </div>
        <div className="flex gap-2 mt-3">
          <Button 
            className="flex-1" 
            disabled={book.availableCopies === 0}
            onClick={onRent}
            data-testid={`button-rent-${book.id}`}
          >
            {book.availableCopies > 0 ? "Rent Now" : "Not Available"}
          </Button>
          <Button variant="outline" size="icon" onClick={onWishlist} data-testid={`button-wishlist-${book.id}`}>
            <Heart className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
