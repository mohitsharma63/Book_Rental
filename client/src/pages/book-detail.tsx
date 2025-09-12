
import { useState } from "react";
import { useRoute } from "wouter";
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
  
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedRentalPeriod, setSelectedRentalPeriod] = useState("1");

  // Static book data
  const staticBooksData = {
    "book1": {
      id: "book1",
      title: "The Psychology of Money",
      author: "Morgan Housel",
      isbn: "9780857199096",
      category: "Finance",
      publishedYear: 2020,
      pricePerWeek: "12.99",
      availableCopies: 8,
      totalCopies: 10,
      description: "Timeless lessons on wealth, greed, and happiness from one of the most important financial writers of our time. This book explores the psychological and emotional aspects of money management, revealing how our personal experiences and emotions shape our financial decisions more than we realize.",
      longDescription: "The Psychology of Money is a fascinating exploration of the complex relationship between human psychology and money. Morgan Housel presents 19 short stories that explore the strange ways people think about money and teaches you how to make better sense of one of life's most important topics. The book covers topics like the power of compounding, the importance of saving, the role of luck in success, and why financial planning is more about controlling your emotions than understanding spreadsheets.",
      imageUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400",
      rating: 4.8,
      totalRentals: 245,
      totalReviews: 156,
      featured: true,
      language: "English",
      pages: 256,
      publisher: "Harriman House",
      format: "Paperback",
      condition: "Excellent",
      tags: ["Finance", "Psychology", "Investment", "Personal Finance", "Behavioral Economics"]
    },
    "book2": {
      id: "book2",
      title: "Atomic Habits",
      author: "James Clear",
      isbn: "9780735211292",
      category: "Self-Help",
      publishedYear: 2018,
      pricePerWeek: "14.99",
      availableCopies: 5,
      totalCopies: 8,
      description: "An easy & proven way to build good habits & break bad ones. Transform your life with tiny changes.",
      longDescription: "Atomic Habits offers a proven framework for improving every day. James Clear, one of the world's leading experts on habit formation, reveals practical strategies that will teach you exactly how to form good habits, break bad ones, and master the tiny behaviors that lead to remarkable results.",
      imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400",
      rating: 4.9,
      totalRentals: 389,
      totalReviews: 234,
      featured: true,
      language: "English",
      pages: 320,
      publisher: "Avery",
      format: "Paperback",
      condition: "Good",
      tags: ["Self-Help", "Productivity", "Psychology", "Personal Development", "Habits"]
    },
    "book3": {
      id: "book3",
      title: "The Silent Patient",
      author: "Alex Michaelides",
      isbn: "9781250301697",
      category: "Thriller",
      publishedYear: 2019,
      pricePerWeek: "11.99",
      availableCopies: 3,
      totalCopies: 6,
      description: "A woman's act of violence against her husband and her refusal to speak sends shockwaves through London.",
      longDescription: "The Silent Patient is a shocking psychological thriller of a woman's act of violence against her husband—and of the therapist obsessed with uncovering her motive. Alicia Berenson's life is seemingly perfect. A famous painter married to an in-demand fashion photographer, she lives in a grand house overlooking a park in one of London's most desirable areas. One evening her husband Gabriel returns home late from a fashion shoot, and Alicia shoots him five times in the face, and then never speaks another word.",
      imageUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400",
      rating: 4.6,
      totalRentals: 178,
      totalReviews: 98,
      featured: true,
      language: "English",
      pages: 336,
      publisher: "Celadon Books",
      format: "Paperback",
      condition: "Very Good",
      tags: ["Thriller", "Mystery", "Psychological", "Crime", "Fiction"]
    }
  };

  const book = staticBooksData[bookId as keyof typeof staticBooksData];

  if (!book) {
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
    { weeks: "1", price: book.pricePerWeek, label: "1 Week" },
    { weeks: "2", price: (parseFloat(book.pricePerWeek) * 1.9).toFixed(2), label: "2 Weeks", discount: "5% off" },
    { weeks: "4", price: (parseFloat(book.pricePerWeek) * 3.6).toFixed(2), label: "1 Month", discount: "10% off" },
  ];

  const reviews = [
    {
      id: 1,
      user: "Sarah Johnson",
      rating: 5,
      comment: "Absolutely loved this book! Changed my perspective completely.",
      date: "2 days ago",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=32&h=32"
    },
    {
      id: 2,
      user: "Mike Chen",
      rating: 4,
      comment: "Great read, very insightful and well-written.",
      date: "1 week ago",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=32&h=32"
    },
    {
      id: 3,
      user: "Emma Davis",
      rating: 5,
      comment: "Couldn't put it down! Highly recommend to everyone.",
      date: "2 weeks ago",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=32&h=32"
    }
  ];

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
                    <span className="text-sm font-medium">{book.rating}</span>
                    <span className="text-sm text-muted-foreground">({book.totalReviews} reviews)</span>
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
                    <Badge variant="outline">{book.condition}</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Format</span>
                    <span className="text-sm">{book.format}</span>
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
              {book.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Description */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4">About This Book</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {book.description}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {book.longDescription}
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
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Publisher:</span>
                    <span>{book.publisher}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Language:</span>
                    <span>{book.language}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Rentals:</span>
                    <span>{book.totalRentals}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pages:</span>
                    <span>{book.pages}</span>
                  </div>
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
                <h3 className="text-xl font-semibold">Reviews ({book.totalReviews})</h3>
                <Button variant="outline" size="sm">
                  Write Review
                </Button>
              </div>

              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="flex gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={review.avatar} />
                      <AvatarFallback>{review.user.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold">{review.user}</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-3 w-3 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">{review.date}</span>
                      </div>
                      <p className="text-muted-foreground">{review.comment}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-6" />
              
              <div className="text-center">
                <Button variant="outline">
                  Load More Reviews
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
