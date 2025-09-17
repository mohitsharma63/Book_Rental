import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookCard } from "@/components/book-card";
import { SearchBar } from "@/components/search-bar";
import { Book } from "@/lib/types";
import { WandSparkles, Heart, Search as SearchIcon, Rocket, Star, TrendingUp, Clock, Users, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { useStore } from "@/lib/store-context";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [categorySlide, setCategorySlide] = useState(0);
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

  // Fetch active sliders for homepage
  const { data: slidersData = [], isLoading: slidersLoading } = useQuery({
    queryKey: ['active-sliders'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/sliders/active');
        if (!response.ok) {
          console.warn('Sliders API failed:', response.status, response.statusText);
          return [];
        }
        const data = await response.json();
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.warn('Sliders API error:', error);
        return [];
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

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

  // Use dynamic books data for category counts
  const displayBooks = booksData;

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

  // Map categories from API data to display format with icons and colors
  const categories = categoriesData.map(category => {
    const colors = getColorForCategory(category.name);
    return {
      name: category.name,
      count: displayBooks.filter(book => book.category === category.name).length,
      icon: getIconForCategory(category.name),
      imageUrl: category.imageUrl, // Include imageUrl from database
      ...colors
    };
  });


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

  // Slider navigation functions
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slidersData.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slidersData.length) % slidersData.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Auto-slide functionality with pause on hover
  useEffect(() => {
    if (slidersData.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slidersData.length);
      }, 4000); // Change slide every 4 seconds for better engagement

      return () => clearInterval(interval);
    }
  }, [slidersData.length]);

  return (
    <>
      {slidersLoading ? (
        <div className="gradient-hero rounded-lg p-4 sm:p-6 lg:p-8 mb-8 text-white relative overflow-hidden animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/70"></div>
          <div className="relative z-10 max-w-2xl">
            <div className="h-4 bg-white/20 rounded mb-4 w-32"></div>
            <div className="h-8 bg-white/20 rounded mb-4 w-3/4"></div>
            <div className="h-4 bg-white/20 rounded mb-2 w-full"></div>
            <div className="h-4 bg-white/20 rounded mb-6 w-2/3"></div>
            <div className="flex gap-4">
              <div className="h-10 bg-white/20 rounded w-32"></div>
              <div className="h-10 bg-white/20 rounded w-32"></div>
            </div>
          </div>
        </div>
      ) : slidersData.length > 0 ? (
        <div 
          className="relative rounded-xl mb-8 overflow-hidden group shadow-2xl"
          onMouseEnter={() => setCurrentSlide(currentSlide)} // Pause auto-slide on hover
        >
          <div className="relative h-72 sm:h-96 lg:h-[32rem]">
            {slidersData.map((slider, index) => (
              <div
                key={slider.id}
                className={`absolute inset-0 transition-all duration-700 ease-in-out transform ${
                  index === currentSlide 
                    ? 'opacity-100 scale-100' 
                    : 'opacity-0 scale-105'
                }`}
              >
                <img
                  src={slider.imageUrl}
                  alt={slider.title || "Slider"}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>
                <div className="absolute inset-0 flex items-center justify-start">
                  <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12 text-white">
                    {slider.title && (
                      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight animate-fade-in">
                        {slider.title}
                      </h2>
                    )}
                    {slider.description && (
                      <p className="text-base sm:text-lg lg:text-xl mb-8 opacity-95 leading-relaxed max-w-2xl animate-fade-in-delay">
                        {slider.description}
                      </p>
                    )}
                    {(slider.linkUrl || slider.buttonText) && (
                      <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-delay-2">
                        {slider.linkUrl ? (
                          <a href={slider.linkUrl} target="_blank" rel="noopener noreferrer">
                            <Button className="w-full sm:w-auto bg-white text-primary hover:bg-gray-100 hover:scale-105 transition-all duration-300 px-8 py-3 text-lg font-semibold">
                              {slider.buttonText || "Learn More"}
                            </Button>
                          </a>
                        ) : slider.buttonText && (
                          <Button className="w-full sm:w-auto bg-white text-primary hover:bg-gray-100 hover:scale-105 transition-all duration-300 px-8 py-3 text-lg font-semibold">
                            {slider.buttonText}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation arrows */}
          {slidersData.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 border border-white/20"
                onClick={prevSlide}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 border border-white/20"
                onClick={nextSlide}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}

          {/* Dots indicator */}
          {slidersData.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
              {slidersData.map((_, index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 hover:scale-125 ${
                    index === currentSlide 
                      ? 'bg-white shadow-lg ring-2 ring-white/50' 
                      : 'bg-white/60 hover:bg-white/80'
                  }`}
                  onClick={() => goToSlide(index)}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="gradient-hero rounded-lg p-4 sm:p-6 lg:p-8 mb-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/70"></div>
          <div className="relative z-10 max-w-2xl">
            <Badge className="bg-white/20 text-white border-white/30 mb-4 text-xs sm:text-sm">
              New Release Alert 📚
            </Badge>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
              Discover Your Next Great Read
            </h2>
            <p className="text-sm sm:text-base lg:text-lg mb-6 opacity-90 leading-relaxed">
              Browse thousands of books available for rent. From timeless classics to modern bestsellers,
              find your perfect read at unbeatable prices.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link href="/catalog">
                <Button className="w-full sm:w-auto bg-white text-primary hover:bg-gray-100">
                  Start Browsing
                </Button>
              </Link>
              <Button variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-primary">
                View Popular Books
              </Button>
            </div>
          </div>
        </div>
      )}

    
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <section className="mb-8 sm:mb-12">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <h3 className="text-2xl sm:text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent" data-testid="text-categories-title">
              Popular Categories
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground">
              Discover books across your favorite genres
            </p>
          </div>
          <Badge variant="secondary" className="hidden sm:flex items-center gap-2 px-3 py-1">
            <Sparkles className="h-4 w-4" />
            Curated Selection
          </Badge>
        </div>

        {categoriesLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="group">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-sm border border-gray-200/50 p-6 text-center animate-pulse hover:shadow-lg transition-all duration-300">
                  <div className="relative mb-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-2xl mx-auto mb-3 animate-pulse"></div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gray-300 rounded-full animate-pulse"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-5 bg-gray-200 rounded-md w-3/4 mx-auto animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded-full w-16 mx-auto animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : categories.length > 0 ? (
          categories.length > 5 ? (
            // Carousel for more than 5 categories
            <div className="relative">
              <div className="overflow-hidden">
                <div 
                  className="flex transition-transform duration-500 ease-in-out gap-4 sm:gap-6"
                  style={{ transform: `translateX(-${(categorySlide * 100) / Math.min(5, categories.length)}%)` }}
                >
                  {categories.map((category, index) => {
                    const Icon = category.icon;
                    return (
                      <Link
                        key={category.name}
                        href={`/catalog?category=${encodeURIComponent(category.name)}`}
                        className="flex-none w-[calc(50%-0.5rem)] sm:w-[calc(33.333%-1rem)] lg:w-[calc(25%-1.125rem)] xl:w-[calc(20%-1.2rem)]"
                      >
                        <div 
                          className="group relative"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer group-hover:-translate-y-2 border border-gray-200/50 overflow-hidden backdrop-blur-sm hover:backdrop-blur-md relative">
                            {/* Subtle gradient overlay */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
                            
                            <div className="relative p-6 text-center">
                              {/* Category Image or Icon */}
                              <div className="relative mb-4">
                                {category.imageUrl ? (
                                  <div className="relative">
                                    <img
                                      src={category.imageUrl}
                                      alt={category.name}
                                      className="w-16 h-16 mx-auto rounded-2xl object-cover shadow-md group-hover:shadow-lg transition-all duration-300 border-2 border-white group-hover:scale-110"
                                      onError={(e) => {
                                        const target = e.currentTarget;
                                        const fallbackContainer = target.nextElementSibling as HTMLElement;
                                        if (fallbackContainer) {
                                          target.style.display = 'none';
                                          fallbackContainer.style.display = 'flex';
                                        }
                                      }}
                                    />
                                    <div className="hidden w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-sm items-center justify-center shadow-md border-2 border-white">
                                      <Icon className={`${category.iconColor} transition-all duration-300`} size={24} />
                                    </div>
                                    {/* Floating badge for book count */}
                                    <div className={`absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r ${category.color} rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 border-2 border-white`}>
                                      <span className="text-xs font-bold text-white">
                                        {category.count > 99 ? '99+' : category.count}
                                      </span>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="relative">
                                    <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-110 border border-white/20`}>
                                      <Icon className="text-white transition-all duration-300" size={24} />
                                    </div>
                                    {/* Floating badge for book count */}
                                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 border-2 border-gray-100">
                                      <span className={`text-xs font-bold ${category.textColor}`}>
                                        {category.count > 99 ? '99+' : category.count}
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Category Details */}
                              <div className="space-y-2">
                                <h4 className="font-semibold text-gray-900 text-sm sm:text-base group-hover:text-primary transition-colors duration-300 line-clamp-2">
                                  {category.name}
                                </h4>
                                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                                  <span className="font-medium">{category.count}</span>
                                  <span>book{category.count !== 1 ? 's' : ''}</span>
                                </div>
                              </div>

                              {/* Hover indicator */}
                              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent rounded-b-2xl transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Navigation arrows for categories */}
              
              {categories.length > 5 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg border border-gray-200/50 text-gray-700 hover:text-primary z-10"
                    onClick={() => setCategorySlide(Math.max(0, categorySlide - 1))}
                    disabled={categorySlide === 0}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg border border-gray-200/50 text-gray-700 hover:text-primary z-10"
                    onClick={() => setCategorySlide(Math.min(Math.max(0, categories.length - 5), categorySlide + 1))}
                    disabled={categorySlide >= Math.max(0, categories.length - 5)}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </>
              )}

              {/* Dots indicator for categories */}
              {categories.length > 5 && (
                <div className="flex justify-center mt-6 gap-2">
                  {Array.from({ length: Math.max(1, categories.length - 4) }).map((_, index) => (
                    <button
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === categorySlide 
                          ? 'bg-primary shadow-lg' 
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                      onClick={() => setCategorySlide(index)}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            // Grid for 5 or fewer categories
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
              {categories.map((category, index) => {
                const Icon = category.icon;
                return (
                  <Link
                    key={category.name}
                    href={`/catalog?category=${encodeURIComponent(category.name)}`}
                  >
                    <div 
                      className="group relative"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer group-hover:-translate-y-2 border border-gray-200/50 overflow-hidden backdrop-blur-sm hover:backdrop-blur-md relative">
                        {/* Subtle gradient overlay */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
                        
                        <div className="relative p-6 text-center">
                          {/* Category Image or Icon */}
                          <div className="relative mb-4">
                            {category.imageUrl ? (
                              <div className="relative">
                                <img
                                  src={category.imageUrl}
                                  alt={category.name}
                                  className="w-16 h-16 mx-auto rounded-2xl object-cover shadow-md group-hover:shadow-lg transition-all duration-300 border-2 border-white group-hover:scale-110"
                                  onError={(e) => {
                                    const target = e.currentTarget;
                                    const fallbackContainer = target.nextElementSibling as HTMLElement;
                                    if (fallbackContainer) {
                                      target.style.display = 'none';
                                      fallbackContainer.style.display = 'flex';
                                    }
                                  }}
                                />
                                <div className="hidden w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-sm items-center justify-center shadow-md border-2 border-white">
                                  <Icon className={`${category.iconColor} transition-all duration-300`} size={24} />
                                </div>
                                {/* Floating badge for book count */}
                                <div className={`absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r ${category.color} rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 border-2 border-white`}>
                                  <span className="text-xs font-bold text-white">
                                    {category.count > 99 ? '99+' : category.count}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div className="relative">
                                <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-110 border border-white/20`}>
                                  <Icon className="text-white transition-all duration-300" size={24} />
                                </div>
                                {/* Floating badge for book count */}
                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 border-2 border-gray-100">
                                  <span className={`text-xs font-bold ${category.textColor}`}>
                                    {category.count > 99 ? '99+' : category.count}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Category Details */}
                          <div className="space-y-2">
                            <h4 className="font-semibold text-gray-900 text-sm sm:text-base group-hover:text-primary transition-colors duration-300 line-clamp-2">
                              {category.name}
                            </h4>
                            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                              <span className="font-medium">{category.count}</span>
                              <span>book{category.count !== 1 ? 's' : ''}</span>
                            </div>
                          </div>

                          {/* Hover indicator */}
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent rounded-b-2xl transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
              <WandSparkles className="h-8 w-8 text-muted-foreground" />
            </div>
            <h4 className="text-lg font-semibold mb-2 text-muted-foreground">No Categories Available</h4>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Our book categories are being curated. Check back soon for an amazing selection!
            </p>
          </div>
        )}

        {/* View All Categories Button */}
        {categories.length > 10 && (
          <div className="text-center mt-8">
            <Link href="/catalog">
              <Button variant="outline" className="px-8 py-2 hover:scale-105 transition-transform duration-300">
                View All Categories
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
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
          <h3 className="text-xl sm:text-2xl font-bold mb-4">Why Choose BookLoop?</h3>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-4 sm:px-0">
            Join thousands of readers who have made BookLoop their go-to platform for discovering and enjoying great books.
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
    </>
  );
}