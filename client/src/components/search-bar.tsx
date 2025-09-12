import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { useState } from "react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  onCategoryFilter?: (category: string) => void;
}

const popularCategories = [
  "Fiction",
  "Mystery", 
  "Romance",
  "Sci-Fi",
  "Biography"
];

export function SearchBar({ onSearch, onCategoryFilter }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
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
          {popularCategories.map((category) => (
            <Badge
              key={category}
              variant="secondary"
              className="cursor-pointer hover:bg-muted"
              onClick={() => onCategoryFilter?.(category)}
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
