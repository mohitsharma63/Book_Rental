import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Book, User, Heart, ShoppingCart, Search, Filter, Grid3X3, List, Star } from "lucide-react";
import { Link } from "wouter";
import type { Book as BookType } from "@/lib/types";

export default function Catalog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [availability, setAvailability] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("relevance");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: books } = useQuery<BookType[]>({
    queryKey: ["/api/books"],
  });

  // Mock data for demonstration
  const mockBooks = [
    {
      id: 1,
      title: "The Psychology of Money",
      author: "Morgan Housel",
      category: "Finance",
      price: 12.99,
      image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400",
      status: "available",
      rating: 4.8,
      reviews: 128
    },
    {
      id: 2,
      title: "Atomic Habits",
      author: "James Clear",
      category: "Self-Help",
      price: 14.99,
      image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400",
      status: "available",
      rating: 4.9,
      reviews: 256
    },
    {
      id: 3,
      title: "The Silent Patient",
      author: "Alex Michaelides",
      category: "Thriller",
      price: 11.99,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400",
      status: "available",
      rating: 4.6,
      reviews: 89
    },
    {
      id: 4,
      title: "Klara and the Sun",
      author: "Kazuo Ishiguro",
      category: "Fiction",
      price: 13.99,
      image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400",
      status: "available",
      rating: 4.4,
      reviews: 167
    },
    {
      id: 5,
      title: "Dune",
      author: "Frank Herbert",
      category: "Science Fiction",
      price: 15.99,
      image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400",
      status: "rented",
      rating: 4.7,
      reviews: 342
    },
    {
      id: 6,
      title: "The Seven Husbands of Evelyn Hugo",
      author: "Taylor Jenkins Reid",
      category: "Romance",
      price: 12.99,
      image: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400",
      status: "available",
      rating: 4.8,
      reviews: 198
    }
  ];

  const displayBooks = books || mockBooks;

  const categories = [
    { name: "Finance", count: 45 },
    { name: "Self-Help", count: 67 },
    { name: "Thriller", count: 32 },
    { name: "Fiction", count: 89 },
    { name: "Science Fiction", count: 28 },
    { name: "Romance", count: 54 },
    { name: "Mystery", count: 41 },
    { name: "Biography", count: 23 }
  ];

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
                      <div key={category.name} className="group">
                        <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 cursor-pointer">
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              id={category.name}
                              checked={selectedCategories.includes(category.name)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedCategories([...selectedCategories, category.name]);
                                } else {
                                  setSelectedCategories(selectedCategories.filter(c => c !== category.name));
                                }
                              }}
                              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
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

                {/* Price Range */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Price Range (per week)
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>$0</span>
                      <span>$25+</span>
                    </div>
                    <div className="px-3">
                      <div className="h-2 bg-gradient-to-r from-green-200 to-green-400 rounded-full relative">
                        <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white border-2 border-green-500 rounded-full shadow-sm cursor-pointer"></div>
                        <div className="absolute right-6 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white border-2 border-green-500 rounded-full shadow-sm cursor-pointer"></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Input placeholder="Min" className="w-20 h-8 text-xs" />
                      <span className="text-muted-foreground">to</span>
                      <Input placeholder="Max" className="w-20 h-8 text-xs" />
                    </div>
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
                      setAvailability([]);
                    }}
                  >
                    Clear All Filters
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Filter Summary */}
            {(selectedCategories.length > 0 || availability.length > 0 || searchQuery) && (
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
                  Showing <span className="font-semibold text-gray-900">{displayBooks.length}</span> books
                </span>
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
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Books Grid */}
            <div className={`grid gap-6 ${
              viewMode === "grid" 
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
                : "grid-cols-1"
            }`}>
              {displayBooks.map((book) => (
                <Card key={book.id} className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-white">
                  <div className="relative">
                    <div className="aspect-[3/4] overflow-hidden">
                      <img
                        src={book.image}
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
                        <span className="text-xs text-muted-foreground">({book.reviews} reviews)</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {book.category}
                        </Badge>
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary">
                            ${book.price}<span className="text-sm font-normal text-muted-foreground">/week</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button 
                          className="flex-1" 
                          disabled={book.status !== "available"}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          {book.status === "available" ? "Rent Now" : "Unavailable"}
                        </Button>
                        <Button variant="outline" size="icon">
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

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