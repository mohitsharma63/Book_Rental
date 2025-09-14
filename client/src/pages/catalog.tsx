import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Book, User, Heart, ShoppingCart, Search, Filter, Grid3X3, List, Star, BookOpen } from "lucide-react";
import { Link } from "wouter";
import { useStore } from "@/lib/store-context";
import type { Book as BookType } from "@/lib/types";
import React from "react";
import { useLocation } from "wouter";

export default function Catalog() {
  const { addToCart, addToWishlist } = useStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>([]);
  const [availability, setAvailability] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("relevance");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [_, navigate] = useLocation();

  // Get category from URL parameters
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    if (categoryParam) {
      setSelectedCategories([categoryParam]);
    }
  }, []);

  const { data: books = [], isLoading: booksLoading, error: booksError } = useQuery<BookType[]>({
    queryKey: ["/api/books"],
    queryFn: async () => {
      try {
        const res = await fetch('/api/books');
        if (!res.ok) {
          console.warn('Books API failed:', res.status, res.statusText);
          return [];
        }
        const data = await res.json();
        return Array.isArray(data) ? data.map(book => ({
          ...book,
          price: parseFloat(book.pricePerWeek),
          image: book.imageUrl || "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400",
          status: book.availableCopies > 0 ? "available" : "rented",
          rating: parseFloat(book.rating) || 4.5,
          reviews: Math.floor(Math.random() * 200) + 50 // Temporary until reviews are implemented
        })) : [];
      } catch (error) {
        console.warn('Books API error:', error);
        return [];
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  const displayBooks = books;

  // Fetch categories from API
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

  // Fetch authors from API
  const { data: authorsData = [], isLoading: authorsLoading } = useQuery({
    queryKey: ['authors'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/authors'); // Assuming an API endpoint for authors
        if (!response.ok) {
          console.warn('Authors API failed:', response.status, response.statusText);
          return [];
        }
        const data = await response.json();
        // Assuming the data is an array of author objects with a 'name' property
        return Array.isArray(data) ? data.map(author => author.name) : [];
      } catch (error) {
        console.warn('Authors API error:', error);
        return [];
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Calculate book counts for each category
  const categories = categoriesData.map(category => ({
    name: category.name,
    count: displayBooks.filter(book => book.category === category.name).length,
    imageUrl: category.imageUrl // Added imageUrl
  }));

  // Calculate book counts for each author
  const authors = authorsData.map(authorName => ({
    name: authorName,
    count: displayBooks.filter(book => book.author === authorName).length
  }));

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Available</Badge>;
      case "rented":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Rented</Badge>;
      case "reserved":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Reserved</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < Math.floor(rating)
                ? "fill-yellow-400 text-yellow-400"
                : "fill-gray-200 text-gray-200"
            }`}
          />
        ))}
        <span className="text-sm text-muted-foreground ml-1">{rating}</span>
      </div>
    );
  };

  const filteredBooks = displayBooks.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategories = selectedCategories.length === 0 || selectedCategories.includes(book.category);
    const matchesAuthors = selectedAuthors.length === 0 || selectedAuthors.includes(book.author);
    const matchesAvailability = availability.length === 0 || availability.includes(book.status);
    return matchesSearch && matchesCategories && matchesAuthors && matchesAvailability;
  });

  const sortedBooks = [...filteredBooks].sort((a, b) => {
    if (sortBy === "price-low") {
      return a.price - b.price;
    } else if (sortBy === "price-high") {
      return b.price - a.price;
    } else if (sortBy === "rating") {
      return b.rating - a.rating;
    } else if (sortBy === "newest") {
      // Assuming books have a 'createdAt' field or similar for sorting by newest
      // For mock data, we'll just use the id as a proxy
      return b.id - a.id;
    } else if (sortBy === "alphabetical-az") {
      return a.title.localeCompare(b.title);
    } else if (sortBy === "alphabetical-za") {
      return b.title.localeCompare(a.title);
    } else if (sortBy === "author-az") {
      return a.author.localeCompare(b.author);
    } else if (sortBy === "author-za") {
      return b.author.localeCompare(a.author);
    }
    return 0; // Default to relevance (or no specific sort)
  });

  const handleRentNow = (book: BookType) => {
    if (book.availableCopies > 0) {
      const cartItem = {
        id: book.id,
        title: book.title,
        author: book.author,
        imageUrl: book.imageUrl || book.image || "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400",
        pricePerWeek: parseFloat(book.pricePerWeek || book.price),
        price: parseFloat(book.pricePerWeek || book.price),
        category: book.category,
        availableCopies: book.availableCopies,
        quantity: 1,
        rentalPeriod: 1
      };
      addToCart(cartItem);
      alert(`"${book.title}" has been added to your cart!`);
    }
  };

  const handleAddToWishlist = (book: BookType) => {
    const wishlistItem = {
      id: book.id,
      title: book.title,
      author: book.author,
      imageUrl: book.imageUrl || book.image || "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400",
      price: parseFloat(book.pricePerWeek || book.price),
      category: book.category,
      rating: book.rating,
      available: book.availableCopies > 0,
      dateAdded: new Date().toISOString()
    };
    addToWishlist(wishlistItem);
    alert(`"${book.title}" has been added to your wishlist!`);
  };

  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategories([categoryName]);
    navigate(`/catalog?category=${categoryName}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="max-w-12xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Book className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Book Catalog
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Discover your next great read from our curated collection of {displayBooks.length} books
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-80 space-y-6">
            <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-md overflow-hidden">
              <div className="bg-gradient-to-r from-primary/5 via-blue-50 to-indigo-50 p-6 border-b border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Filter className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Smart Filters</h2>
                </div>
                <p className="text-sm text-muted-foreground">Find your perfect book faster</p>
              </div>

              <CardContent className="p-6 space-y-6">
                {/* Search */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    <Search className="h-4 w-4 text-primary" />
                    Quick Search
                  </label>
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 group-focus-within:text-primary transition-colors" />
                    <Input
                      placeholder="Search books, authors, genres..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-11 pr-4 py-3 border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl transition-all duration-200 bg-gray-50/50 hover:bg-white"
                    />
                  </div>
                </div>

                <Separator className="bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

                {/* Categories */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      Categories
                    </h3>
                    <Badge variant="secondary" className="text-xs px-2 py-1">
                      {selectedCategories.length} selected
                    </Badge>
                  </div>
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    {categories.map((category) => (
                        <div
                          key={category.name}
                          className="group cursor-pointer"
                          onClick={() => {
                            if (selectedCategories.includes(category.name)) {
                              const newCategories = selectedCategories.filter(cat => cat !== category.name);
                              setSelectedCategories(newCategories);
                              if (newCategories.length > 0) {
                                navigate(`/catalog?categories=${encodeURIComponent(newCategories.join(','))}`);
                              } else {
                                navigate("/catalog");
                              }
                            } else {
                              handleCategoryClick(category.name);
                            }
                          }}
                        >
                          <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 group-hover:shadow-md">
                            <div className="flex items-center space-x-3">
                              <Checkbox
                                id={category.name}
                                checked={selectedCategories.includes(category.name)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    handleCategoryClick(category.name);
                                  } else {
                                    setSelectedCategories([]);
                                    navigate("/catalog");
                                  }
                                }}
                                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                onClick={(e) => e.stopPropagation()} // Prevent click event from bubbling to the parent div
                              />
                              {category.imageUrl && (
                                <img
                                  src={category.imageUrl}
                                  alt={category.name}
                                  className="w-8 h-8 object-cover rounded border"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              )}
                              <label
                                htmlFor={category.name}
                                className="text-sm font-medium leading-none cursor-pointer group-hover:text-primary transition-colors"
                              >
                                {category.name}
                              </label>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                                {category.count}
                              </span>
                            </div>
                          </div>
                        </div>
                    ))}
                  </div>
                </div>

                <Separator className="bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

                {/* Authors */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Authors
                    </h3>
                    <Badge variant="secondary" className="text-xs px-2 py-1">
                      {selectedAuthors.length} selected
                    </Badge>
                  </div>
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    {authors.map((author) => (
                      <div key={author.name} className="group">
                        <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 cursor-pointer">
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              id={author.name}
                              checked={selectedAuthors.includes(author.name)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedAuthors([...selectedAuthors, author.name]);
                                } else {
                                  setSelectedAuthors(selectedAuthors.filter(a => a !== author.name));
                                }
                              }}
                              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                            <label
                              htmlFor={author.name}
                              className="text-sm font-medium leading-none cursor-pointer group-hover:text-primary transition-colors"
                            >
                              {author.name}
                            </label>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                              {author.count}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator className="bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

                {/* Availability */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Availability
                  </h3>
                  <div className="space-y-2">
                    {[
                      { label: "Available Now", value: "available", color: "bg-green-100 text-green-800 border-green-200" },
                      { label: "Coming Soon", value: "coming-soon", color: "bg-blue-100 text-blue-800 border-blue-200" },
                      { label: "All Books", value: "all", color: "bg-gray-100 text-gray-800 border-gray-200" }
                    ].map((option) => (
                      <div key={option.value} className="group">
                        <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 cursor-pointer">
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              id={option.value}
                              checked={availability.includes(option.value)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setAvailability([...availability, option.value]);
                                } else {
                                  setAvailability(availability.filter(a => a !== option.value));
                                }
                              }}
                              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                            <label
                              htmlFor={option.value}
                              className="text-sm font-medium leading-none cursor-pointer group-hover:text-primary transition-colors"
                            >
                              {option.label}
                            </label>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Clear Filters */}
                <div className="pt-4 border-t border-gray-100">
                  <Button
                    variant="outline"
                    className="w-full hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-200"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategories([]);
                      setSelectedAuthors([]);
                      setAvailability([]);
                      navigate("/catalog"); // Clear category from URL
                    }}
                  >
                    Clear All Filters
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Filter Summary */}
            {(selectedCategories.length > 0 || selectedAuthors.length > 0 || availability.length > 0 || searchQuery) && (
              <Card className="shadow-lg border-0 bg-gradient-to-r from-primary/5 to-blue-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <h4 className="font-semibold text-sm text-gray-900">Active Filters</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {searchQuery && (
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                        "{searchQuery}"
                      </Badge>
                    )}
                    {selectedCategories.map(cat => (
                      <Badge key={cat} variant="secondary" className="bg-blue-100 text-blue-800">
                        {cat}
                      </Badge>
                    ))}
                    {selectedAuthors.map(author => (
                      <Badge key={author} variant="secondary" className="bg-indigo-100 text-indigo-800">
                        {author}
                      </Badge>
                    ))}
                    {availability.map(avail => (
                      <Badge key={avail} variant="secondary" className="bg-green-100 text-green-800">
                        {avail}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Controls Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  Showing <span className="font-semibold text-gray-900">{filteredBooks.length}</span> of {displayBooks.length} books
                </span>
                {booksLoading && <span className="text-sm text-muted-foreground">Loading...</span>}
              </div>

              <div className="flex items-center gap-4">
                {/* View Toggle */}
                <div className="flex items-center border rounded-lg p-1 bg-white">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="h-8 px-3"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="h-8 px-3"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>

                {/* Sort */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Sort by:</span>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-40 border-gray-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Relevance</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="alphabetical-az">Title: A to Z</SelectItem>
                      <SelectItem value="alphabetical-za">Title: Z to A</SelectItem>
                      <SelectItem value="author-az">Author: A to Z</SelectItem>
                      <SelectItem value="author-za">Author: Z to A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Books Display */}
            {viewMode === "grid" ? (
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {sortedBooks.length > 0 ? (
                  sortedBooks.map((book) => (
                    <Card key={book.id} className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-white">
                      <div className="relative">
                        <div className="aspect-[3/4] overflow-hidden">
                          <img
                            src={book.imageUrl || book.image || "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400"}
                            alt={book.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="absolute top-3 left-3">
                          {getStatusBadge(book.status)}
                        </div>
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Button size="sm" variant="secondary" className="h-8 w-8 p-0 bg-white/90 hover:bg-white">
                            <Heart className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <CardContent className="p-5">
                        <div className="space-y-3">
                          <div>
                            <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                              {book.title}
                            </h3>
                            <p className="text-muted-foreground text-sm">by {book.author}</p>
                          </div>

                          <div className="flex items-center justify-between">
                            {renderStars(book.rating)}
                            <span className="text-sm text-muted-foreground">({book.reviews} reviews)</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-xs">
                              {book.category}
                            </Badge>
                            <div className="text-right">
                              <div className="text-lg font-bold text-primary">
                                ${parseFloat(book.pricePerWeek || book.price).toFixed(2)}<span className="text-sm font-normal text-muted-foreground">/week</span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2 mt-4">
                            <div className="flex items-center justify-between">
                              <Button
                                className="flex-1 mr-2"
                                onClick={() => handleRentNow(book)}
                                disabled={book.availableCopies === 0}
                              >
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                {book.availableCopies > 0 ? 'Rent Now' : 'Not Available'}
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleAddToWishlist(book)}
                              >
                                <Heart className="h-4 w-4" />
                              </Button>
                            </div>
                            <Link href={`/book/${book.id}`} className="block w-full">
                              <Button variant="outline" className="w-full">
                                <BookOpen className="h-4 w-4 mr-2" />
                                View Details
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <div className="text-6xl mb-4">📚</div>
                    <h3 className="text-xl font-semibold mb-2">No books found</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchQuery || selectedCategories.length > 0 || selectedAuthors.length > 0 || availability.length > 0
                        ? "Try adjusting your filters to see more results"
                        : "No books are currently available"}
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedCategories([]);
                        setSelectedAuthors([]);
                        setAvailability([]);
                      }}
                    >
                      Clear Filters
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {sortedBooks.length > 0 ? (
                  sortedBooks.map((book) => (
                    <Card key={book.id} className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
                      <CardContent className="p-6">
                        <div className="flex gap-6">
                          <div className="relative flex-shrink-0">
                            <div className="w-24 h-32 overflow-hidden rounded-lg">
                              <img
                                src={book.imageUrl || book.image || "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400"}
                                alt={book.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                            <div className="absolute -top-2 -right-2">
                              {getStatusBadge(book.status)}
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-semibold text-xl group-hover:text-primary transition-colors">
                                  {book.title}
                                </h3>
                                <p className="text-muted-foreground">by {book.author}</p>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-primary">
                                  ${parseFloat(book.pricePerWeek || book.price).toFixed(2)}<span className="text-sm font-normal text-muted-foreground">/week</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 mb-3">
                              {renderStars(book.rating)}
                              <span className="text-sm text-muted-foreground">({book.reviews} reviews)</span>
                              <Badge variant="outline" className="text-xs">
                                {book.category}
                              </Badge>
                            </div>

                            <div className="flex items-center gap-3 mt-4">
                              <Button
                                onClick={() => handleRentNow(book)}
                                disabled={book.availableCopies === 0}
                                className="flex-1"
                              >
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                {book.availableCopies > 0 ? 'Rent Now' : 'Not Available'}
                              </Button>
                              <Link href={`/book/${book.id}`}>
                                <Button variant="outline">
                                  <BookOpen className="h-4 w-4 mr-2" />
                                  Details
                                </Button>
                              </Link>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleAddToWishlist(book)}
                              >
                                <Heart className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📚</div>
                    <h3 className="text-xl font-semibold mb-2">No books found</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchQuery || selectedCategories.length > 0 || selectedAuthors.length > 0 || availability.length > 0
                        ? "Try adjusting your filters to see more results"
                        : "No books are currently available"}
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedCategories([]);
                        setSelectedAuthors([]);
                        setAvailability([]);
                      }}
                    >
                      Clear Filters
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Load More */}
            <div className="flex justify-center mt-12">
              <Button variant="outline" size="lg" className="px-8">
                Load More Books
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}