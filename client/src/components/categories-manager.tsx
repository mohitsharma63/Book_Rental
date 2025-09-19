import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Edit, Trash2, MoreHorizontal, Tag, BookOpen } from "lucide-react";

interface Category {
  id: number;
  name: string;
  description: string;
  imageUrl?: string;
  bookCount: number;
  isActive: boolean;
  createdAt: string;
}

export function CategoriesManager() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    imageUrl: "",
    isActive: true
  });

  const queryClient = useQueryClient();

  // Fetch categories from API
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      return data.map((category: any) => ({
        ...category,
        imageUrl: category.imageUrl || "",
        isActive: category.isActive ?? true,
        bookCount: category.bookCount || 0,
        createdAt: category.createdAt || new Date().toISOString()
      }));
    },
  });

  // Fetch books to calculate category counts
  const { data: books = [] } = useQuery({
    queryKey: ['books'],
    queryFn: async () => {
      const response = await fetch('/api/books');
      if (!response.ok) {
        throw new Error('Failed to fetch books');
      }
      return response.json();
    },
  });

  // Calculate book counts for each category
  const categoriesWithCounts = categories.map((category: any) => ({
    ...category,
    bookCount: books.filter((book: any) => book.category === category.name).length
  }));

  // Add category mutation
  const addCategoryMutation = useMutation({
    mutationFn: async (categoryData: any) => {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      });
      if (!response.ok) {
        throw new Error('Failed to add category');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setIsDialogOpen(false);
      setFormData({ name: "", description: "", imageUrl: "", isActive: true });
    },
  });

  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, ...categoryData }: any) => {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      });
      if (!response.ok) {
        throw new Error('Failed to update category');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setIsDialogOpen(false);
      setEditingCategory(null);
      setFormData({ name: "", description: "", imageUrl: "", isActive: true });
    },
  });

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete category');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const handleAddCategory = () => {
    setEditingCategory(null);
    setFormData({ name: "", description: "", imageUrl: "", isActive: true });
    setIsDialogOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      imageUrl: category.imageUrl || "",
      isActive: category.isActive
    });
    setIsDialogOpen(true);
  };

  const handleSaveCategory = () => {
    if (editingCategory) {
      // Update existing category
      updateCategoryMutation.mutate({ id: editingCategory.id, ...formData });
    } else {
      // Add new category
      addCategoryMutation.mutate(formData);
    }
  };

  const handleDeleteCategory = (id: number) => {
    if (confirm('Are you sure you want to delete this category?')) {
      deleteCategoryMutation.mutate(id);
    }
  };

  const toggleCategoryStatus = (id: number) => {
    const category = categories.find((cat: any) => cat.id === id);
    if (category) {
      updateCategoryMutation.mutate({
        id,
        name: category.name,
        description: category.description,
        imageUrl: category.imageUrl,
        isActive: !category.isActive
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading categories...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Tag className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
            <p className="text-muted-foreground">Manage book categories and genres</p>
          </div>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddCategory} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? "Edit Category" : "Add New Category"}
              </DialogTitle>
              <DialogDescription>
                {editingCategory 
                  ? "Make changes to the category details below."
                  : "Create a new category for organizing your books."
                }
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="col-span-3"
                  placeholder="Category name"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="col-span-3"
                  placeholder="Category description"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="imageUrl" className="text-right">
                  Image
                </Label>
                <div className="col-span-3 space-y-2">
                  <Input
                    id="imageFile"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const result = event.target?.result as string;
                          setFormData({ ...formData, imageUrl: result });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  />
                  <div className="text-sm text-muted-foreground">Or enter image URL:</div>
                  <Input
                    id="imageUrl"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://example.com/category-image.jpg"
                  />
                  {formData.imageUrl && (
                    <div className="mt-2">
                      <img
                        src={formData.imageUrl}
                        alt="Category image preview"
                        className="w-20 h-20 object-cover rounded border"
                        onError={(e) => {
                          console.log('Image failed to load:', formData.imageUrl);
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
                disabled={addCategoryMutation.isPending || updateCategoryMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveCategory}
                disabled={!formData.name || addCategoryMutation.isPending || updateCategoryMutation.isPending}
              >
                {addCategoryMutation.isPending || updateCategoryMutation.isPending
                  ? (editingCategory ? "Updating..." : "Creating...")
                  : (editingCategory ? "Update" : "Create")} Category
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categoriesWithCounts.length}</div>
            <p className="text-xs text-muted-foreground">
              Total categories
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Categories</CardTitle>
            <Badge variant="outline" className="text-green-600">Active</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {categoriesWithCounts.filter((c: any) => c.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently in use
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Books</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {categoriesWithCounts.reduce((sum: number, cat: any) => sum + cat.bookCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all categories
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Books</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[70px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categoriesWithCounts.map((category: any) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      {category.imageUrl ? (
                        <div className="relative">
                          <img
                            src={category.imageUrl}
                            alt={category.name}
                            className="w-10 h-10 object-cover rounded border"
                            onError={(e) => {
                              const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                              e.currentTarget.style.display = 'none';
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                          <div style={{ display: 'none' }} className="w-10 h-10 bg-gray-100 rounded border flex items-center justify-center">
                            <Tag className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded border flex items-center justify-center">
                          <Tag className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{category.name}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[200px] truncate text-muted-foreground">
                      {category.description || "No description"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {category.bookCount} books
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleCategoryStatus(category.id)}
                      disabled={updateCategoryMutation.isPending}
                    >
                      <Badge 
                        variant={category.isActive ? "default" : "secondary"}
                        className={category.isActive ? "bg-green-100 text-green-800" : ""}
                      >
                        {category.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </Button>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(category.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          className="h-8 w-8 p-0"
                          disabled={updateCategoryMutation.isPending || deleteCategoryMutation.isPending}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditCategory(category)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteCategory(category.id)}
                          className="text-red-600"
                          disabled={category.bookCount > 0}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}