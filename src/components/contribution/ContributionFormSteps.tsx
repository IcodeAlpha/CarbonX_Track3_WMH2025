import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Upload, X, TreePine, Zap, Droplets, Recycle, Leaf, Flame, Sprout } from "lucide-react";
import { ContributionMapWrapper } from "@/components/ContributionMapWrapper";

interface StepProps {
  formData: any;
  updateFormData: (data: any) => void;
  errors: Record<string, string>;
}

// Step 1: Type & Basic Info
export const TypeStep = ({ formData, updateFormData, errors }: StepProps) => {
  const contributionTypes = [
    { value: 'tree_planting', label: 'Tree Planting', icon: TreePine, description: 'Reforestation and urban greening' },
    { value: 'home_solar', label: 'Solar Energy', icon: Zap, description: 'Solar panels and renewable energy' },
    { value: 'rainwater_harvesting', label: 'Water Conservation', icon: Droplets, description: 'Rainwater collection systems' },
    { value: 'composting', label: 'Composting', icon: Recycle, description: 'Organic waste management' },
    { value: 'clean_cooking', label: 'Clean Cooking', icon: Flame, description: 'Efficient cookstoves' },
    { value: 'gardening', label: 'Urban Gardening', icon: Sprout, description: 'Sustainable food production' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Select Contribution Type</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Choose the type of climate action you want to share
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {contributionTypes.map((type) => {
          const Icon = type.icon;
          return (
            <button
              key={type.value}
              type="button"
              onClick={() => updateFormData({ contribution_type: type.value })}
              className={cn(
                "p-4 rounded-lg border-2 text-left transition-all hover:border-primary/50",
                formData.contribution_type === type.value
                  ? "border-primary bg-primary/5"
                  : "border-border"
              )}
            >
              <div className="flex items-start gap-3">
                <Icon className="w-6 h-6 text-primary mt-1" />
                <div>
                  <h4 className="font-medium mb-1">{type.label}</h4>
                  <p className="text-sm text-muted-foreground">{type.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      {errors.contribution_type && (
        <p className="text-sm text-destructive">{errors.contribution_type}</p>
      )}

      <div>
        <Label htmlFor="title">Project Title *</Label>
        <Input
          id="title"
          value={formData.title || ''}
          onChange={(e) => updateFormData({ title: e.target.value })}
          placeholder="e.g., Community Tree Planting Initiative"
          className="mt-1.5"
        />
        {errors.title && <p className="text-sm text-destructive mt-1">{errors.title}</p>}
      </div>
    </div>
  );
};

// Step 2: Location
export const LocationStep = ({ formData, updateFormData, errors }: StepProps) => {
  const handleLocationSelect = (coordinates: [number, number]) => {
    updateFormData({ coordinates });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Where is your project?</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Select your location on the map or enter it manually
        </p>
      </div>

      <div>
        <Label htmlFor="location">Location Name *</Label>
        <Input
          id="location"
          value={formData.location || ''}
          onChange={(e) => updateFormData({ location: e.target.value })}
          placeholder="e.g., Nairobi, Kenya"
          className="mt-1.5"
        />
        {errors.location && <p className="text-sm text-destructive mt-1">{errors.location}</p>}
      </div>

      <div>
        <Label>Select on Map (Optional)</Label>
        <div className="mt-1.5 rounded-lg overflow-hidden border h-[400px]">
          <ContributionMapWrapper
            contributions={[]}
            onLocationSelect={handleLocationSelect}
          />
        </div>
        {formData.coordinates && (
          <p className="text-xs text-muted-foreground mt-2">
            Selected: {formData.coordinates[0].toFixed(4)}, {formData.coordinates[1].toFixed(4)}
          </p>
        )}
      </div>
    </div>
  );
};

// Step 3: Details
export const DetailsStep = ({ formData, updateFormData, errors }: StepProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Project Details</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Tell us about the scale and timeline of your contribution
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="quantity">Quantity *</Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            step="0.01"
            value={formData.quantity || ''}
            onChange={(e) => updateFormData({ quantity: e.target.value })}
            placeholder="e.g., 50"
            className="mt-1.5"
          />
          {errors.quantity && <p className="text-sm text-destructive mt-1">{errors.quantity}</p>}
        </div>
        <div>
          <Label htmlFor="unit">Unit *</Label>
          <Select
            value={formData.unit || ''}
            onValueChange={(value) => updateFormData({ unit: value })}
          >
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="trees">Trees</SelectItem>
              <SelectItem value="kWh">kWh</SelectItem>
              <SelectItem value="liters">Liters</SelectItem>
              <SelectItem value="kg">Kilograms</SelectItem>
              <SelectItem value="m²">Square Meters</SelectItem>
              <SelectItem value="cookstoves">Cookstoves</SelectItem>
            </SelectContent>
          </Select>
          {errors.unit && <p className="text-sm text-destructive mt-1">{errors.unit}</p>}
        </div>
      </div>

      <div>
        <Label>Start Date *</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal mt-1.5",
                !formData.start_date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formData.start_date ? format(new Date(formData.start_date), "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={formData.start_date ? new Date(formData.start_date) : undefined}
              onSelect={(date) => updateFormData({ start_date: date?.toISOString() })}
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
        {errors.start_date && <p className="text-sm text-destructive mt-1">{errors.start_date}</p>}
      </div>

      <div>
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => updateFormData({ description: e.target.value })}
          placeholder="Describe your project, methodology, and expected impact..."
          rows={5}
          className="mt-1.5"
        />
        {errors.description && <p className="text-sm text-destructive mt-1">{errors.description}</p>}
        <p className="text-xs text-muted-foreground mt-1">
          {formData.description?.length || 0} / 1000 characters
        </p>
      </div>
    </div>
  );
};

// Step 4: Photos
export const PhotosStep = ({ formData, updateFormData, errors }: StepProps) => {
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newPhotos: string[] = [];
    Array.from(files).forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is too large. Maximum size is 5MB.`);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        newPhotos.push(reader.result as string);
        if (newPhotos.length === files.length) {
          updateFormData({ photo_urls: [...(formData.photo_urls || []), ...newPhotos] });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    const updated = (formData.photo_urls || []).filter((_: string, i: number) => i !== index);
    updateFormData({ photo_urls: updated });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Add Photos</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Upload photos of your project for community verification (optional but recommended)
        </p>
      </div>

      <div>
        <label
          htmlFor="photo-upload"
          className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors"
        >
          <div className="flex flex-col items-center justify-center">
            <Upload className="w-12 h-12 mb-3 text-muted-foreground" />
            <p className="text-sm font-medium mb-1">Click to upload photos</p>
            <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB each</p>
          </div>
          <input
            id="photo-upload"
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handlePhotoUpload}
          />
        </label>
      </div>

      {formData.photo_urls && formData.photo_urls.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {formData.photo_urls.map((photo: string, index: number) => (
            <div key={index} className="relative group">
              <img
                src={photo}
                alt={`Upload ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border"
              />
              <button
                type="button"
                onClick={() => removePhoto(index)}
                className="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Step 5: Review
export const ReviewStep = ({ formData }: StepProps) => {
  const calculateTokens = (type: string, quantity: number): number => {
    const baseTokens: Record<string, number> = {
      tree_planting: 5,
      home_solar: 50,
      rainwater_harvesting: 10,
      composting: 3,
      clean_cooking: 20,
      gardening: 4,
    };
    return Math.floor((baseTokens[type] || 5) * quantity);
  };

  const estimatedTokens = formData.contribution_type && formData.quantity
    ? calculateTokens(formData.contribution_type, parseFloat(formData.quantity))
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Review Your Submission</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Please review all details before submitting
        </p>
      </div>

      <div className="rounded-lg border p-6 space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Type</p>
          <p className="font-medium capitalize">{formData.contribution_type?.replace(/_/g, ' ')}</p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Project Title</p>
          <p className="font-medium">{formData.title}</p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Location</p>
          <p className="font-medium">{formData.location}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Quantity</p>
            <p className="font-medium">{formData.quantity} {formData.unit}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Start Date</p>
            <p className="font-medium">
              {formData.start_date ? format(new Date(formData.start_date), "PP") : '-'}
            </p>
          </div>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Description</p>
          <p className="text-sm">{formData.description}</p>
        </div>

        {formData.photo_urls && formData.photo_urls.length > 0 && (
          <div>
            <p className="text-sm text-muted-foreground mb-2">Photos ({formData.photo_urls.length})</p>
            <div className="grid grid-cols-4 gap-2">
              {formData.photo_urls.map((photo: string, index: number) => (
                <img
                  key={index}
                  src={photo}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-20 object-cover rounded border"
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="rounded-lg bg-primary/5 border border-primary/20 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Estimated Token Reward</p>
            <p className="text-3xl font-bold text-primary">{estimatedTokens}</p>
          </div>
          <Leaf className="w-12 h-12 text-primary/40" />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Tokens will be awarded after AI verification
        </p>
      </div>
    </div>
  );
};
