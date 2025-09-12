import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { BookCard } from "@/components/book-card";
import { SearchBar } from "@/components/search-bar";
import { Book } from "@/lib/types";
import { WandSparkles, Heart, Search as SearchIcon, Rocket } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

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

  const featuredBooks = books?.slice(0, 4) || [];

  const categories = [
    { name: "Fantasy", icon: WandSparkles, color: "from-blue-50 to-blue-100", iconColor: "text-blue-600", textColor: "text-blue-900", countColor: "text-blue-700", count: "245" },
    { name: "Romance", icon: Heart, color: "from-red-50 to-red-100", iconColor: "text-red-600", textColor: "text-red-900", countColor: "text-red-700", count: "189" },
    { name: "Mystery", icon: SearchIcon, color: "from-purple-50 to-purple-100", iconColor: "text-purple-600", textColor: "text-purple-900", countColor: "text-purple-700", count: "167" },
    { name: "Sci-Fi", icon: Rocket, color: "from-green-50 to-green-100", iconColor: "text-green-600", textColor: "text-green-900", countColor: "text-green-700", count: "134" },
  ];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="gradient-hero rounded-lg p-8 mb-8 text-white">
        <div className="max-w-2xl">
          <h2 className="text-4xl font-bold mb-4" data-testid="text-hero-title">
            Discover Your Next Great Read
          </h2>
          <p className="text-lg mb-6 opacity-90" data-testid="text-hero-subtitle">
            Browse thousands of books available for rent. Find classics, bestsellers, and hidden gems.
          </p>
          <Link href="/catalog">
            <Button className="bg-white text-primary hover:bg-gray-100" data-testid="button-start-browsing">
              Start Browsing
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Search Bar */}
      <SearchBar 
        onSearch={setSearchQuery}
        onCategoryFilter={setCategoryFilter}
      />
      
      {/* Featured Books */}
      <section className="mb-12">
        <h3 className="text-2xl font-bold mb-6" data-testid="text-featured-title">Featured Books</h3>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-card rounded-lg shadow-sm animate-pulse">
                <div className="w-full h-64 bg-muted"></div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </section>
      
      {/* Popular Categories */}
      <section className="mb-12">
        <h3 className="text-2xl font-bold mb-6" data-testid="text-categories-title">Popular Categories</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <div 
                key={category.name}
                className={`bg-gradient-to-br ${category.color} p-6 rounded-lg text-center hover:shadow-md transition-shadow cursor-pointer`}
                onClick={() => setCategoryFilter(category.name)}
                data-testid={`card-category-${category.name.toLowerCase()}`}
              >
                <Icon className={`text-3xl ${category.iconColor} mb-3 mx-auto`} size={32} />
                <h4 className={`font-semibold ${category.textColor}`}>{category.name}</h4>
                <p className={`text-sm ${category.countColor}`}>{category.count} books</p>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
