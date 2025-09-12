import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { BookCard } from "@/components/book-card";
import { Book } from "@/lib/types";
import { Grid, List, Search, Filter } from "lucide-react";

export default function Catalog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortBy, setSortBy] = useState("relevance");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [availableOnly, setAvailableOnly] = useState(false);

  const { data: books, isLoading } = useQuery<Book[]>({
    queryKey: ["/api/books", searchQuery, categoryFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (categoryFilter) params.append("category", categoryFilter);
      
      const response = await fetch(`/api/books?${params}`);
      if (!response.ok) throw new Error("Failed to fetch books");
      return response.json();
    },
  });

  const categories = [
    { name: "Fiction", count: 156 },
    { name: "Non-Fiction", count: 89 },
    { name: "Mystery", count: 67 },
    { name: "Romance", count: 45 },
    { name: "Sci-Fi", count: 34 },
  ];

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, category]);
    } else {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    }
  };

  const filteredBooks = books ? books.filter(book => {
    if (availableOnly && book.availableCopies === 0) return false;
    if (selectedCategories.length > 0 && !selectedCategories.includes(book.category)) return false;
    if (minPrice && parseFloat(book.pricePerWeek) < parseFloat(minPrice)) return false;
    if (maxPrice && parseFloat(book.pricePerWeek) > parseFloat(maxPrice)) return false;
    return true;
  }) : [];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="lg:w-1/4">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4" data-testid="text-filters-title">Filters</h3>
              
              {/* Search in Catalog */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Search</label>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search books..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="input-catalog-search"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                </div>
              </div>
              
              {/* Categories */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Category</label>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category.name} className="flex items-center space-x-2">
                      <Checkbox
                        id={category.name}
                        checked={selectedCategories.includes(category.name)}
                        onCheckedChange={(checked) => handleCategoryChange(category.name, checked as boolean)}
                        data-testid={`checkbox-category-${category.name.toLowerCase()}`}
                      />
                      <label htmlFor={category.name} className="text-sm cursor-pointer">
                        {category.name} ({category.count})
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Availability */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Availability</label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="all-books"
                      checked={!availableOnly}
                      onCheckedChange={() => setAvailableOnly(false)}
                      data-testid="checkbox-all-books"
                    />
                    <label htmlFor="all-books" className="text-sm cursor-pointer">All Books</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="available-only"
                      checked={availableOnly}
                      onCheckedChange={(checked) => setAvailableOnly(checked as boolean)}
                      data-testid="checkbox-available-only"
                    />
                    <label htmlFor="available-only" className="text-sm cursor-pointer">Available Only</label>
                  </div>
                </div>
              </div>
              
              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Price Range (per week)</label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="text-sm"
                    data-testid="input-min-price"
                  />
                  <span>-</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="text-sm"
                    data-testid="input-max-price"
                  />
                </div>
              </div>
              
              <Button className="w-full" data-testid="button-apply-filters">
                <Filter className="mr-2 h-4 w-4" />
                Apply Filters
              </Button>
            </CardContent>
          </Card>
        </div>
        
        {/* Books Grid */}
        <div className="lg:w-3/4">
          {/* Sort and View Options */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground" data-testid="text-books-count">
                Showing {filteredBooks.length} books
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48" data-testid="select-sort">
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Sort by: Relevance</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="title">Title: A to Z</SelectItem>
                  <SelectItem value="recent">Recently Added</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  className="rounded-r-none"
                  data-testid="button-grid-view"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                  className="rounded-l-none"
                  data-testid="button-list-view"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Books Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}
          
          {/* Pagination */}
          <div className="flex justify-center mt-8">
            <nav className="flex items-center space-x-1">
              <Button variant="ghost" data-testid="button-prev">Previous</Button>
              <Button className="bg-primary text-primary-foreground" data-testid="button-page-1">1</Button>
              <Button variant="ghost" data-testid="button-page-2">2</Button>
              <Button variant="ghost" data-testid="button-page-3">3</Button>
              <span className="px-3 py-2 text-muted-foreground">...</span>
              <Button variant="ghost" data-testid="button-page-12">12</Button>
              <Button variant="ghost" data-testid="button-next">Next</Button>
            </nav>
          </div>
        </div>
      </div>
    </main>
  );
}
