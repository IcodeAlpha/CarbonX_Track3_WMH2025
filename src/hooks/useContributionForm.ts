import { useState, useEffect } from 'react';
import { z } from 'zod';

const DRAFT_KEY = 'contribution_draft';

const contributionSchema = z.object({
  contribution_type: z.string().min(1, 'Please select a contribution type'),
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title must be less than 100 characters'),
  location: z.string().min(2, 'Please enter a location'),
  coordinates: z
  .union([
    z.object({ lat: z.number(), lng: z.number() }),
    z.tuple([z.number(), z.number()])
  ])
  .optional(),
  quantity: z
  .union([z.string(), z.number()])
  .refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Quantity must be a positive number'),

  unit: z.string().min(1, 'Please select a unit'),
  start_date: z.string().min(1, 'Please select a start date'),
  description: z.string().min(20, 'Description must be at least 20 characters').max(1000, 'Description must be less than 1000 characters'),
  photo_urls: z.array(z.string()).optional(),
});

type FormData = z.infer<typeof contributionSchema>;

export const useContributionForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<FormData>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const totalSteps = 5;

  // Load draft from localStorage on mount
  useEffect(() => {
    const draft = localStorage.getItem(DRAFT_KEY);
    if (draft) {
      try {
        setFormData(JSON.parse(draft));
      } catch (error) {
        console.error('Failed to load draft:', error);
      }
    }
  }, []);

  // Save draft to localStorage whenever formData changes
  useEffect(() => {
    if (Object.keys(formData).length > 0) {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
    }
  }, [formData]);

  const updateFormData = (data: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
    // Clear errors for updated fields
    const updatedFields = Object.keys(data);
    setErrors((prev) => {
      const newErrors = { ...prev };
      updatedFields.forEach((field) => delete newErrors[field]);
      return newErrors;
    });
  };

  const validateStep = (step: number): boolean => {
    const stepSchemas = {
      1: z.object({
        contribution_type: contributionSchema.shape.contribution_type,
        title: contributionSchema.shape.title,
      }),
      2: z.object({
        location: contributionSchema.shape.location,
      }),
      3: z.object({
        quantity: contributionSchema.shape.quantity,
        unit: contributionSchema.shape.unit,
        start_date: contributionSchema.shape.start_date,
        description: contributionSchema.shape.description,
      }),
      4: z.object({}), 
      5: z.object({}), 
    };

    const schema = stepSchemas[step as keyof typeof stepSchemas];
    if (!schema) return true;

    try {
      schema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.issues.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const validateFullForm = (): boolean => {
  try {
    const preparedData = {
      ...formData,
      quantity: formData.quantity ? Number(formData.quantity) : undefined,
      coordinates: Array.isArray(formData.coordinates)
        ? { lat: formData.coordinates[0], lng: formData.coordinates[1] }
        : formData.coordinates,
    };

    contributionSchema.parse(preparedData);
    setErrors({});
    return true;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const newErrors: Record<string, string> = {};
      error.issues.forEach((err) => {
        if (err.path[0]) {
          newErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(newErrors);
      console.log("Validation errors:", error.issues); // <-- See what fails
    }
    return false;
  }
};


  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const goToStep = (step: number) => {
    setCurrentStep(Math.max(1, Math.min(step, totalSteps)));
  };

  const clearDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setFormData({});
    setErrors({});
    setCurrentStep(1);
  };

  const resetForm = () => {
    clearDraft();
  };

  return {
    currentStep,
    totalSteps,
    formData,
    errors,
    updateFormData,
    nextStep,
    prevStep,
    goToStep,
    validateStep,
    validateFullForm,
    clearDraft,
    resetForm,
  };
};
