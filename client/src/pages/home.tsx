import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookCard } from "@/components/book-card";
import { SearchBar } from "@/components/search-bar";
import { Book } from "@/lib/types";
import { WandSparkles, Heart, Search as SearchIcon, Rocket, Star, TrendingUp, Clock, Users } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // Using static data instead of API
  const isLoading = false;

  // Comprehensive static book data
  const staticBooksData = [
    {
      id: "book1",
      title: "The Psychology of Money",
      author: "Morgan Housel",
      isbn: "9780857199096",
      category: "Finance",
      publishedYear: 2020,
      pricePerWeek: "12.99",
      availableCopies: 8,
      totalCopies: 10,
      description: "Timeless lessons on wealth, greed, and happiness from one of the most important financial writers of our time.",
      imageUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400",
      rating: 4.8,
      totalRentals: 245,
      featured: true
    },
    {
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
      imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400",
      rating: 4.9,
      totalRentals: 389,
      featured: true
    },
    {
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
      imageUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400",
      rating: 4.6,
      totalRentals: 178,
      featured: true
    },
    {
      id: "book4",
      title: "Klara and the Sun",
      author: "Kazuo Ishiguro",
      isbn: "9780571364886",
      category: "Fiction",
      publishedYear: 2021,
      pricePerWeek: "13.99",
      availableCopies: 4,
      totalCopies: 5,
      description: "A magnificent new novel from Nobel Prize-winner Kazuo Ishiguro about love, loss, and what it means to be human.",
      imageUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400",
      rating: 4.7,
      totalRentals: 156,
      featured: true
    },
    {
      id: "book5",
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      isbn: "9780743273565",
      category: "Fiction",
      publishedYear: 1925,
      pricePerWeek: "9.99",
      availableCopies: 6,
      totalCopies: 8,
      description: "A classic American novel set in the Jazz Age, exploring themes of wealth, love, and the American Dream.",
      imageUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400",
      rating: 4.4,
      totalRentals: 567,
      featured: false
    },
    {
      id: "book6",
      title: "To Kill a Mockingbird",
      author: "Harper Lee",
      isbn: "9780061120084",
      category: "Fiction",
      publishedYear: 1960,
      pricePerWeek: "10.99",
      availableCopies: 2,
      totalCopies: 5,
      description: "A gripping tale of racial injustice and childhood innocence in the American South.",
      imageUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400",
      rating: 4.8,
      totalRentals: 432,
      featured: false
    },
    {
      id: "book7",
      title: "1984",
      author: "George Orwell",
      isbn: "9780451524935",
      category: "Dystopian Fiction",
      publishedYear: 1949,
      pricePerWeek: "11.99",
      availableCopies: 4,
      totalCopies: 6,
      description: "A dystopian social science fiction novel exploring themes of totalitarianism and surveillance.",
      imageUrl: "https://images.unsplash.com/photo-1495640388908-05fa85288e61?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400",
      rating: 4.7,
      totalRentals: 298,
      featured: false
    },
    {
      id: "book8",
      title: "Pride and Prejudice",
      author: "Jane Austen",
      isbn: "9780141439518",
      category: "Romance",
      publishedYear: 1813,
      pricePerWeek: "8.99",
      availableCopies: 7,
      totalCopies: 9,
      description: "A romantic novel of manners following the relationship between Elizabeth Bennet and Mr. Darcy.",
      imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400",
      rating: 4.6,
      totalRentals: 543,
      featured: false
    },
    {
      id: "book9",
      title: "The Catcher in the Rye",
      author: "J.D. Salinger",
      isbn: "9780316769174",
      category: "Coming-of-age Fiction",
      publishedYear: 1951,
      pricePerWeek: "10.99",
      availableCopies: 3,
      totalCopies: 4,
      description: "A controversial novel about teenage rebellion and alienation in post-war America.",
      imageUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400",
      rating: 4.2,
      totalRentals: 267,
      featured: false
    },
    {
      id: "book10",
      title: "Dune",
      author: "Frank Herbert",
      isbn: "9780441172719",
      category: "Sci-Fi",
      publishedYear: 1965,
      pricePerWeek: "15.99",
      availableCopies: 2,
      totalCopies: 4,
      description: "An epic science fiction novel set in a distant future amidst a feudal interstellar society.",
      imageUrl: "https://images.unsplash.com/photo-1495640388908-05fa85288e61?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400",
      rating: 4.8,
      totalRentals: 189,
      featured: false
    }
  ];

  // Filter books for display
  const filteredBooks = staticBooksData.filter(book => {
    if (searchQuery && !book.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !book.author.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (categoryFilter && book.category !== categoryFilter) {
      return false;
    }
    return true;
  });

  const books = staticBooksData;
  const featuredBooks = books.slice(0, 3);

  const categories = [
    { name: "Fiction", icon: WandSparkles, color: "from-blue-50 to-blue-100", iconColor: "text-blue-600", textColor: "text-blue-900", countColor: "text-blue-700", count: "4" },
    { name: "Romance", icon: Heart, color: "from-red-50 to-red-100", iconColor: "text-red-600", textColor: "text-red-900", countColor: "text-red-700", count: "1" },
    { name: "Thriller", icon: SearchIcon, color: "from-purple-50 to-purple-100", iconColor: "text-purple-600", textColor: "text-purple-900", countColor: "text-purple-700", count: "1" },
    { name: "Sci-Fi", icon: Rocket, color: "from-green-50 to-green-100", iconColor: "text-green-600", textColor: "text-green-900", countColor: "text-green-700", count: "1" },
  ];

  const stats = [
    { label: "Books Available", value: "10,000+", icon: "📚", color: "text-blue-600" },
    { label: "Happy Readers", value: "25,000+", icon: "👥", color: "text-green-600" },
    { label: "Cities Served", value: "50+", icon: "🏙️", color: "text-purple-600" },
    { label: "Years of Service", value: "5+", icon: "⏰", color: "text-orange-600" },
  ];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="gradient-hero rounded-lg p-4 sm:p-6 lg:p-8 mb-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/70"></div>
        <div className="relative z-10 max-w-2xl">
          <Badge className="bg-white/20 text-white border-white/30 mb-4 text-xs sm:text-sm">
            New Release Alert 📚
          </Badge>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4" data-testid="text-hero-title">
            Discover Your Next Great Read
          </h2>
          <p className="text-sm sm:text-base lg:text-lg mb-6 opacity-90 leading-relaxed" data-testid="text-hero-subtitle">
            Browse thousands of books available for rent. From timeless classics to modern bestsellers, 
            find your perfect read at unbeatable prices.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Link href="/catalog">
              <Button className="w-full sm:w-auto bg-white text-primary hover:bg-gray-100" data-testid="button-start-browsing">
                Start Browsing
              </Button>
            </Link>
            <Button variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-primary">
              View Popular Books
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <section className="mb-8 sm:mb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center hover:shadow-md transition-shadow">
              <CardContent className="p-3 sm:p-6">
                <div className="text-2xl sm:text-3xl mb-2">{stat.icon}</div>
                <div className={`text-lg sm:text-2xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Search Bar */}
      <SearchBar 
        onSearch={setSearchQuery}
        onCategoryFilter={setCategoryFilter}
      />

      {/* Featured Books */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold mb-2" data-testid="text-featured-title">
              Featured Books
            </h3>
            <p className="text-muted-foreground">Handpicked selections from our editors</p>
          </div>
          <Badge variant="secondary" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Trending Now
          </Badge>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-card rounded-lg shadow-sm animate-pulse">
                <div className="w-full h-64 bg-muted rounded-t-lg"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                  <div className="flex justify-between">
                    <div className="h-3 bg-muted rounded w-1/4"></div>
                    <div className="h-6 bg-muted rounded w-16"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {featuredBooks.map((book, index) => (
              <Card key={book.id} className="book-card-hover overflow-hidden group">
                <div className="relative">
                  <img 
                    src={book.imageUrl} 
                    alt={book.title}
                    className="w-full h-48 sm:h-56 lg:h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
                    <Badge className="bg-primary text-primary-foreground text-xs">
                      #{index + 1} Featured
                    </Badge>
                  </div>
                  <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
                    <div className="flex items-center gap-1 bg-black/70 text-white px-2 py-1 rounded-full text-xs">
                      <Star className="h-3 w-3 fill-current" />
                      {book.rating || "4.5"}
                    </div>
                  </div>
                </div>
                <CardContent className="p-3 sm:p-4">
                  <div className="space-y-2">
                    <Badge variant="outline" className="text-xs">
                      {book.category}
                    </Badge>
                    <h4 className="font-semibold line-clamp-1 text-sm sm:text-base">{book.title}</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">{book.author}</p>

                    <div className="flex items-center gap-3 sm:gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span className="hidden sm:inline">{book.totalRentals || "150"} rentals</span>
                        <span className="sm:hidden">{book.totalRentals || "150"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {book.publishedYear}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-sm sm:text-lg font-bold">${book.pricePerWeek}<span className="text-xs sm:text-sm">/week</span></span>
                      <Link href={`/book/${book.id}`}>
                        <Button size="sm" className="text-xs px-2 sm:px-3">
                          <span className="hidden sm:inline">View Details</span>
                          <span className="sm:hidden">View</span>
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="text-center mt-8">
          <Link href="/catalog">
            <Button variant="outline" className="px-8">
              View All Featured Books
            </Button>
          </Link>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="mb-8 sm:mb-12">
        <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6" data-testid="text-categories-title">Popular Categories</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <div 
                key={category.name}
                className={`bg-gradient-to-br ${category.color} p-3 sm:p-6 rounded-lg text-center hover:shadow-md transition-all cursor-pointer group hover:scale-105`}
                onClick={() => setCategoryFilter(category.name)}
                data-testid={`card-category-${category.name.toLowerCase()}`}
              >
                <Icon className={`text-2xl sm:text-3xl ${category.iconColor} mb-2 sm:mb-3 mx-auto group-hover:scale-110 transition-transform`} size={24} />
                <h4 className={`font-semibold ${category.textColor} mb-1 text-sm sm:text-base`}>{category.name}</h4>
                <p className={`text-xs sm:text-sm ${category.countColor}`}>{category.count} books</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Why Choose BookWise */}
      <section className="mb-8 sm:mb-12 bg-muted/30 rounded-lg p-4 sm:p-6 lg:p-8">
        <div className="text-center mb-6 sm:mb-8">
          <h3 className="text-xl sm:text-2xl font-bold mb-4">Why Choose BookWise?</h3>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-4 sm:px-0">
            Join thousands of readers who have made BookWise their go-to platform for discovering and enjoying great books.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="text-center">
            <div className="bg-blue-100 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <span className="text-xl sm:text-2xl">💰</span>
            </div>
            <h4 className="font-semibold mb-2 text-sm sm:text-base">Affordable Pricing</h4>
            <p className="text-xs sm:text-sm text-muted-foreground px-2 sm:px-0">
              Rent books at a fraction of the retail price. Starting from just $5/week.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-green-100 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <span className="text-xl sm:text-2xl">🚚</span>
            </div>
            <h4 className="font-semibold mb-2 text-sm sm:text-base">Fast Delivery</h4>
            <p className="text-xs sm:text-sm text-muted-foreground px-2 sm:px-0">
              Get your books delivered within 24 hours. Free delivery on orders above $25.
            </p>
          </div>

          <div className="text-center sm:col-span-2 md:col-span-1">
            <div className="bg-purple-100 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <span className="text-xl sm:text-2xl">📖</span>
            </div>
            <h4 className="font-semibold mb-2 text-sm sm:text-base">Vast Collection</h4>
            <p className="text-xs sm:text-sm text-muted-foreground px-2 sm:px-0">
              Access over 10,000 titles across all genres. New releases added weekly.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}