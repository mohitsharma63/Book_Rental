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
import { useStore } from "@/lib/store-context";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const { addToWishlist, addToCart } = useStore();

  // Fetch books dynamically from database
  const { data: booksData = [], isLoading } = useQuery({
    queryKey: ['books'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/books');
        if (!response.ok) {
          console.warn('Books API failed:', response.status, response.statusText);
          return [];
        }
        const data = await response.json();
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.warn('Books API error:', error);
        return [];
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Use dynamic books data
  const books = booksData;
  
  // Filter books for display
  const filteredBooks = books.filter(book => {
    if (searchQuery && !book.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !book.author.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (categoryFilter && book.category !== categoryFilter) {
      return false;
    }
    return true;
  });

  // Get featured books (first 3 or books marked as featured)
  const featuredBooks = books.filter(book => book.featured).slice(0, 3);
  const displayFeaturedBooks = featuredBooks.length > 0 ? featuredBooks : books.slice(0, 3);

  // Fetch categories dynamically from database
  const { data: categoriesData = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) {
          console.warn('Categories API failed:', response.status, response.statusText);
          return [];
        }
        const data = await response.json();
        return Array.isArray(data) ? data.filter(cat => cat.isActive) : [];
      } catch (error) {
        console.warn('Categories API error:', error);
        return [];
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Map categories to display format with icons and colors
  const getIconForCategory = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes('fiction')) return WandSparkles;
    if (name.includes('romance')) return Heart;
    if (name.includes('thriller') || name.includes('mystery')) return SearchIcon;
    if (name.includes('sci-fi') || name.includes('science')) return Rocket;
    return WandSparkles; // default icon
  };

  const getColorForCategory = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes('fiction')) return { color: "from-blue-50 to-blue-100", iconColor: "text-blue-600", textColor: "text-blue-900", countColor: "text-blue-700" };
    if (name.includes('romance')) return { color: "from-red-50 to-red-100", iconColor: "text-red-600", textColor: "text-red-900", countColor: "text-red-700" };
    if (name.includes('thriller') || name.includes('mystery')) return { color: "from-purple-50 to-purple-100", iconColor: "text-purple-600", textColor: "text-purple-900", countColor: "text-purple-700" };
    if (name.includes('sci-fi') || name.includes('science')) return { color: "from-green-50 to-green-100", iconColor: "text-green-600", textColor: "text-green-900", countColor: "text-green-700" };
    return { color: "from-gray-50 to-gray-100", iconColor: "text-gray-600", textColor: "text-gray-900", countColor: "text-gray-700" };
  };

  const categories = categoriesData.map(category => {
    const icon = getIconForCategory(category.name);
    const colors = getColorForCategory(category.name);
    const bookCount = books.filter(book => book.category === category.name).length;
    
    return {
      name: category.name,
      icon,
      ...colors,
      count: bookCount.toString()
    };
  });

  const stats = [
    { label: "Books Available", value: "10,000+", icon: "📚", color: "text-blue-600" },
    { label: "Happy Readers", value: "25,000+", icon: "👥", color: "text-green-600" },
    { label: "Cities Served", value: "50+", icon: "🏙️", color: "text-purple-600" },
    { label: "Years of Service", value: "5+", icon: "⏰", color: "text-orange-600" },
  ];

  const handleAddToWishlist = (book: Book) => {
    const wishlistItem = {
      id: book.id,
      title: book.title,
      author: book.author,
      imageUrl: book.imageUrl || "/placeholder-book.jpg",
      price: parseFloat(book.pricePerWeek),
      available: book.availableCopies > 0,
      rating: book.rating || 4.5,
      category: book.category,
      dateAdded: new Date().toISOString()
    };
    addToWishlist(wishlistItem);
  };

  const handleRentNow = (book: Book) => {
    if (book.availableCopies > 0) {
      const cartItem = {
        id: book.id,
        title: book.title,
        author: book.author,
        imageUrl: book.imageUrl || "/placeholder-book.jpg",
        pricePerWeek: parseFloat(book.pricePerWeek),
        category: book.category,
        availableCopies: book.availableCopies,
        quantity: 1,
        rentalPeriod: 1
      };
      addToCart(cartItem);
    }
  };

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
 <section className="mb-8 sm:mb-12">
        <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6" data-testid="text-categories-title">Popular Categories</h3>
        
        {categoriesLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-100 p-3 sm:p-6 rounded-lg text-center animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-full mx-auto mb-2 sm:mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
              </div>
            ))}
          </div>
        ) : categories.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {categories.slice(0, 8).map((category) => {
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
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No categories available at the moment.</p>
          </div>
        )}
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
            {displayFeaturedBooks.map((book, index) => (
              <div key={book.id} className="relative">
                <div className="absolute top-2 left-2 z-10">
                  <Badge className="bg-primary text-primary-foreground text-xs">
                    #{index + 1} Featured
                  </Badge>
                </div>
                <BookCard 
                  book={book}
                  onRent={() => handleRentNow(book)}
                  onWishlist={() => handleAddToWishlist(book)}
                />
              </div>
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