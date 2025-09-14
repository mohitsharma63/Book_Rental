import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

interface SearchBarProps {
  onSearch: (query: string) => void;
  onCategoryFilter?: (category: string) => void;
}

export function SearchBar({ onSearch, onCategoryFilter }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("");

  // Fetch categories dynamically from database
  const { data: categoriesData = [] } = useQuery({
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

  const categories = categoriesData.map(cat => cat.name);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  const handleCategoryClick = (category: string) => {
    setActiveCategory(category);
    onCategoryFilter?.(category);
  };

  return (
    <div className="bg-card rounded-lg shadow-sm p-6 mb-8">
      <div className="max-w-2xl mx-auto">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search for books, authors, or genres..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-12 pr-4 py-3"
            data-testid="input-search"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          {categories.map((category) => (
            <Badge
              key={category}
              variant={activeCategory === category ? "default" : "secondary"}
              className="cursor-pointer hover:bg-muted transition-colors"
              onClick={() => handleCategoryClick(category)}
              data-testid={`badge-category-${category.toLowerCase()}`}
            >
              {category}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}