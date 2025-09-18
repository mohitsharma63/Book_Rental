import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, Edit, Trash2, Image } from "lucide-react";

interface Slider {
  id: number;
  title: string;
  description?: string;
  imageUrl: string;
  linkUrl?: string;
  buttonText?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
}

export function SliderManager() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingSlider, setEditingSlider] = useState<Slider | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
    linkUrl: "",
    buttonText: "",
    order: "0",
    isActive: true,
  });

  const queryClient = useQueryClient();

  const { data: sliders = [], isLoading, error } = useQuery({
    queryKey: ['sliders'],
    queryFn: async () => {
      const response = await fetch('/api/sliders');
      if (!response.ok) throw new Error('Failed to fetch sliders');
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 3,
    retryDelay: 1000,
  });

  const createSliderMutation = useMutation({
    mutationFn: async (sliderData: any) => {
      const response = await fetch('/api/sliders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...sliderData,
          order: parseInt(sliderData.order),
        }),
      });
      if (!response.ok) throw new Error('Failed to create slider');
      return response.json();
    },
    onSuccess: (newSlider) => {
      // Optimistic update instead of invalidating
      queryClient.setQueryData(['sliders'], (old: any) => 
        old ? [...old, newSlider] : [newSlider]
      );
      setShowAddDialog(false);
      resetForm();
    },
  });

  const updateSliderMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await fetch(`/api/sliders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          order: parseInt(data.order),
        }),
      });
      if (!response.ok) throw new Error('Failed to update slider');
      return response.json();
    },
    onSuccess: (updatedSlider) => {
      // Optimistic update
      queryClient.setQueryData(['sliders'], (old: any) =>
        old ? old.map((slider: Slider) => 
          slider.id === updatedSlider.id ? updatedSlider : slider
        ) : [updatedSlider]
      );
      setShowEditDialog(false);
      setEditingSlider(null);
      resetForm();
    },
  });

  const deleteSliderMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/sliders/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete slider');
      return response.json();
    },
    onSuccess: (_, deletedId) => {
      // Optimistic update
      queryClient.setQueryData(['sliders'], (old: any) =>
        old ? old.filter((slider: Slider) => slider.id !== deletedId) : []
      );
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      imageUrl: "",
      linkUrl: "",
      buttonText: "",
      order: "0",
      isActive: true,
    });
    setUploadProgress(0);
    setIsUploading(false);
  };

  const handleImageUpload = (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    const reader = new FileReader();

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95; // Keep at 95% until file is actually processed
        }
        return prev + Math.random() * 15;
      });
    }, 100);

    reader.onload = (event) => {
      const result = event.target?.result as string;

      // Simulate final processing time
      setTimeout(() => {
        setFormData(prev => ({ ...prev, imageUrl: result }));
        setUploadProgress(100);
        clearInterval(progressInterval);

        // Reset progress after showing completion
        setTimeout(() => {
          setIsUploading(false);
          setUploadProgress(0);
        }, 1000);
      }, 500);
    };

    reader.onerror = () => {
      clearInterval(progressInterval);
      setIsUploading(false);
      setUploadProgress(0);
      alert('Error uploading image. Please try again.');
    };

    reader.readAsDataURL(file);
  };

  const handleEdit = (slider: Slider) => {
    setEditingSlider(slider);
    setFormData({
      title: slider.title,
      description: slider.description || "",
      imageUrl: slider.imageUrl,
      linkUrl: slider.linkUrl || "",
      buttonText: slider.buttonText || "",
      order: slider.order.toString(),
      isActive: slider.isActive,
    });
    setShowEditDialog(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this slider?')) {
      deleteSliderMutation.mutate(id);
    }
  };

  const renderSliderForm = (onSubmit: () => void, submitText: string) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Enter slider title (optional)"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Enter slider description"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="imageUrl">Image *</Label>
        <div className="space-y-2">
          <Input
            id="imageFile"
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleImageUpload(file);
              }
            }}
            disabled={isUploading}
            className="file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 disabled:opacity-50"
          />

          {/* Upload Progress Bar */}
          {isUploading && (
            <div className="space-y-2 mt-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Uploading image...</span>
                <span className="text-muted-foreground">{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}
        </div>
        <div className="text-sm text-muted-foreground">Or enter image URL below:</div>
        <Input
          id="imageUrl"
          value={formData.imageUrl}
          onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
          placeholder="https://example.com/image.jpg"
        />
        {formData.imageUrl && (
          <div className="mt-2">
            <img
              src={formData.imageUrl}
              alt="Slider preview"
              className="w-32 h-20 object-cover rounded border"
            />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="linkUrl">Link URL</Label>
        <Input
          id="linkUrl"
          value={formData.linkUrl}
          onChange={(e) => setFormData(prev => ({ ...prev, linkUrl: e.target.value }))}
          placeholder="https://example.com"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="buttonText">Button Text</Label>
        <Input
          id="buttonText"
          value={formData.buttonText}
          onChange={(e) => setFormData(prev => ({ ...prev, buttonText: e.target.value }))}
          placeholder="Learn More"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="order">Display Order</Label>
        <Input
          id="order"
          type="number"
          value={formData.order}
          onChange={(e) => setFormData(prev => ({ ...prev, order: e.target.value }))}
          placeholder="0"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
        />
        <Label htmlFor="isActive">Active</Label>
      </div>

      <div className="flex justify-end space-x-2">
        <Button
          variant="outline"
          onClick={() => {
            setShowAddDialog(false);
            setShowEditDialog(false);
            resetForm();
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={onSubmit}
          disabled={!formData.imageUrl || isUploading}
        >
          {isUploading ? "Uploading..." : submitText}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Slider Management</h3>
          <p className="text-sm text-muted-foreground">Manage homepage sliders</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Slider
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Slider</DialogTitle>
            </DialogHeader>
            {renderSliderForm(
              () => createSliderMutation.mutate(formData),
              "Add Slider"
            )}
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sliders ({sliders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading sliders...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              Error loading sliders. Please try again.
              <Button 
                variant="outline" 
                className="ml-2"
                onClick={() => queryClient.invalidateQueries({ queryKey: ['sliders'] })}
              >
                Retry
              </Button>
            </div>
          ) : sliders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No sliders found. Add your first slider to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sliders.map((slider: Slider) => (
                    <TableRow key={slider.id}>
                      <TableCell>
                        <img
                          src={slider.imageUrl}
                          alt={slider.title}
                          className="w-16 h-10 object-cover rounded"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder-image.jpg';
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{slider.title}</div>
                          {slider.description && (
                            <div className="text-sm text-muted-foreground">
                              {slider.description.substring(0, 50)}
                              {slider.description.length > 50 && "..."}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{slider.order}</TableCell>
                      <TableCell>
                        <Badge variant={slider.isActive ? "default" : "secondary"}>
                          {slider.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(slider.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(slider)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(slider.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Slider</DialogTitle>
          </DialogHeader>
          {renderSliderForm(
            () => editingSlider && updateSliderMutation.mutate({ 
              id: editingSlider.id, 
              data: formData 
            }),
            "Update Slider"
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}