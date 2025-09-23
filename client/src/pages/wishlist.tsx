import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, Search, Grid, List, Star, Calendar, Trash2 } from "lucide-react";
import { useStore } from "@/lib/store-context";
import { Link } from "wouter";

export default function Wishlist() {
  const { wishlistItems, removeFromWishlist } = useStore();
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date-added");
  const [filterAvailable, setFilterAvailable] = useState("all");

  const filteredWishlist = wishlistItems.filter(item => {
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

  const handleRentNow = (id: string) => {
    alert(`Rent Now clicked for book ID: ${id}`);
  };

  const handleRemoveFromWishlist = (id: string) => {
    removeFromWishlist(id);
  };

  const handleToggleWishlist = (id: string) => {
    removeFromWishlist(id);
  };

  const stats = {
    total: wishlistItems.length,
    available: wishlistItems.filter(item => item.available).length,
    unavailable: wishlistItems.filter(item => !item.available).length
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
          <Link href="/catalog">
            <Button size="lg" data-testid="browse-books">
              Browse Books
            </Button>
          </Link>
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
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 left-2 bg-white/80 hover:bg-white"
                    onClick={() => handleToggleWishlist(item.id)}
                    data-testid={`remove-wishlist-${item.id}`}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-1 line-clamp-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{item.author}</p>
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm">{item.rating}</span>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold">₹{item.price}</span>
                    <Badge variant="outline" className="text-xs">
                      {item.category}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    {item.available ? (
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleRentNow(item.id)}
                        data-testid={`rent-now-${item.id}`}
                      >
                        Rent Now
                      </Button>
                    ) : (
                      <Button variant="secondary" size="sm" className="flex-1">
                        Notify Me
                      </Button>
                    )}
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
                      <div className="flex items-center gap-2">
                        <Badge
                          className={`${
                            item.available
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {item.available ? "Available" : "Unavailable"}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleWishlist(item.id)}
                          data-testid={`remove-wishlist-${item.id}`}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                    <div className="">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">{item.rating}</span>
                      </div>
                      <Badge variant="outline">{item.category}</Badge>
                      <span className="font-semibold">₹{item.price}</span>
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
                            onClick={() => handleRentNow(item.id)}
                            data-testid={`rent-now-${item.id}`}
                          >
                            Rent Now
                          </Button>
                        ) : (
                          <Button variant="secondary" size="sm">
                            Notify Me
                          </Button>
                        )}
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