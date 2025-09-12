
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, Trash2, ShoppingCart, Search, Filter, Grid, List, Star, Calendar } from "lucide-react";

export default function Wishlist() {
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date-added");
  const [filterAvailable, setFilterAvailable] = useState("all");

  const staticWishlist = [
    {
      id: "wish1",
      bookId: "book6",
      title: "The Silent Patient",
      author: "Alex Michaelides",
      imageUrl: "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=280",
      available: true,
      price: 3.99,
      rating: 4.5,
      dateAdded: "2024-01-15",
      category: "Thriller"
    },
    {
      id: "wish2",
      bookId: "book7",
      title: "Where the Crawdads Sing",
      author: "Delia Owens",
      imageUrl: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=280",
      available: false,
      price: 4.99,
      rating: 4.8,
      dateAdded: "2024-01-10",
      category: "Fiction"
    },
    {
      id: "wish3",
      bookId: "book8",
      title: "The Seven Husbands of Evelyn Hugo",
      author: "Taylor Jenkins Reid",
      imageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=280",
      available: true,
      price: 4.49,
      rating: 4.7,
      dateAdded: "2024-01-08",
      category: "Romance"
    },
    {
      id: "wish4",
      bookId: "book9",
      title: "Educated",
      author: "Tara Westover",
      imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=280",
      available: true,
      price: 3.49,
      rating: 4.6,
      dateAdded: "2024-01-05",
      category: "Biography"
    },
    {
      id: "wish5",
      bookId: "book10",
      title: "The Midnight Library",
      author: "Matt Haig",
      imageUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=280",
      available: false,
      price: 3.99,
      rating: 4.4,
      dateAdded: "2024-01-03",
      category: "Fiction"
    },
    {
      id: "wish6",
      bookId: "book11",
      title: "Atomic Habits",
      author: "James Clear",
      imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=280",
      available: true,
      price: 4.99,
      rating: 4.9,
      dateAdded: "2024-01-01",
      category: "Self-Help"
    }
  ];

  const filteredWishlist = staticWishlist.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAvailability = filterAvailable === "all" || 
                               (filterAvailable === "available" && item.available) ||
                               (filterAvailable === "unavailable" && !item.available);
    return matchesSearch && matchesAvailability;
  });

  const sortedWishlist = [...filteredWishlist].sort((a, b) => {
    switch (sortBy) {
      case "title":
        return a.title.localeCompare(b.title);
      case "author":
        return a.author.localeCompare(b.author);
      case "price":
        return a.price - b.price;
      case "rating":
        return b.rating - a.rating;
      case "date-added":
      default:
        return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
    }
  });

  const handleRemoveFromWishlist = (id: string) => {
    console.log("Remove from wishlist:", id);
  };

  const handleAddToCart = (id: string) => {
    console.log("Add to cart:", id);
  };

  const stats = {
    total: staticWishlist.length,
    available: staticWishlist.filter(item => item.available).length,
    unavailable: staticWishlist.filter(item => !item.available).length
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2" data-testid="wishlist-title">
            My Wishlist
          </h1>
          <p className="text-muted-foreground">
            Keep track of books you want to read
          </p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {stats.total} Total
          </Badge>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            {stats.available} Available
          </Badge>
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            {stats.unavailable} Unavailable
          </Badge>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search your wishlist..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="search-wishlist"
          />
        </div>
        <div className="flex gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48" data-testid="sort-by">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-added">Date Added</SelectItem>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="author">Author</SelectItem>
              <SelectItem value="price">Price</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterAvailable} onValueChange={setFilterAvailable}>
            <SelectTrigger className="w-40" data-testid="filter-availability">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Books</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="unavailable">Unavailable</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              data-testid="view-grid"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              data-testid="view-list"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {sortedWishlist.length === 0 && searchQuery === "" && (
        <div className="text-center py-16">
          <Heart className="mx-auto h-16 w-16 mb-6 text-muted-foreground" />
          <h3 className="text-2xl font-semibold mb-4">Your wishlist is empty</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Start adding books to your wishlist to keep track of what you want to read next!
          </p>
          <Button size="lg" data-testid="browse-books">
            Browse Books
          </Button>
        </div>
      )}

      {/* No Search Results */}
      {sortedWishlist.length === 0 && searchQuery !== "" && (
        <div className="text-center py-16">
          <Search className="mx-auto h-16 w-16 mb-6 text-muted-foreground" />
          <h3 className="text-2xl font-semibold mb-4">No books found</h3>
          <p className="text-muted-foreground mb-6">
            Try adjusting your search terms or filters
          </p>
          <Button variant="outline" onClick={() => setSearchQuery("")}>
            Clear Search
          </Button>
        </div>
      )}

      {/* Grid View */}
      {viewMode === "grid" && sortedWishlist.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedWishlist.map((item) => (
            <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="relative">
                  <img
                    src={item.imageUrl}
                    alt={`${item.title} cover`}
                    className="w-full h-64 object-cover"
                  />
                  <Badge
                    className={`absolute top-2 right-2 ${
                      item.available
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {item.available ? "Available" : "Unavailable"}
                  </Badge>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-1 line-clamp-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{item.author}</p>
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm">{item.rating}</span>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold">${item.price}</span>
                    <Badge variant="outline" className="text-xs">
                      {item.category}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    {item.available ? (
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleAddToCart(item.id)}
                        data-testid={`add-to-cart-${item.id}`}
                      >
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        Rent
                      </Button>
                    ) : (
                      <Button variant="secondary" size="sm" className="flex-1">
                        Notify Me
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFromWishlist(item.id)}
                      data-testid={`remove-${item.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Added {new Date(item.dateAdded).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && sortedWishlist.length > 0 && (
        <div className="space-y-4">
          {sortedWishlist.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <img
                    src={item.imageUrl}
                    alt={`${item.title} cover`}
                    className="w-24 h-32 object-cover rounded"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">{item.title}</h3>
                        <p className="text-muted-foreground">{item.author}</p>
                      </div>
                      <Badge
                        className={`${
                          item.available
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {item.available ? "Available" : "Unavailable"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">{item.rating}</span>
                      </div>
                      <Badge variant="outline">{item.category}</Badge>
                      <span className="font-semibold">${item.price}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Added {new Date(item.dateAdded).toLocaleDateString()}
                      </div>
                      <div className="flex gap-2">
                        {item.available ? (
                          <Button 
                            size="sm"
                            onClick={() => handleAddToCart(item.id)}
                            data-testid={`add-to-cart-${item.id}`}
                          >
                            <ShoppingCart className="h-4 w-4 mr-1" />
                            Rent
                          </Button>
                        ) : (
                          <Button variant="secondary" size="sm">
                            Notify Me
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFromWishlist(item.id)}
                          data-testid={`remove-${item.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
