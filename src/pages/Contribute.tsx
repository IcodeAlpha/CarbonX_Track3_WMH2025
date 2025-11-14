import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Navigation } from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Leaf, TreePine, Zap, Droplets, Recycle, CheckCircle2, Clock, XCircle, ArrowLeft, ArrowRight, Save } from "lucide-react";
import { useContributionForm } from "@/hooks/useContributionForm";
import { TypeStep, LocationStep, DetailsStep, PhotosStep, ReviewStep } from "@/components/contribution/ContributionFormSteps";

interface Contribution {
  id: string;
  contribution_type: string;
  title: string;
  description: string;
  location: string;
  quantity: number;
  unit: string;
  verification_status: string;
  blockchain_hash?: string;
  impact_metrics?: any;
  created_at: string;
  verified_at?: string;
  photo_urls?: string[];
}

const Contribute = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  
  const {
    currentStep,
    totalSteps,
    formData,
    errors,
    updateFormData,
    nextStep,
    prevStep,
    validateFullForm,
    clearDraft,
    resetForm,
  } = useContributionForm();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchContributions();
      
      // Set up realtime subscription for verification updates
      const channel = supabase
        .channel('contributions-changes')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'individual_contributions',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            fetchContributions();
            if (payload.new.verification_status === 'verified') {
              toast({
                title: "Contribution Verified! 🎉",
                description: "Your contribution has been verified and your impact has been updated!",
              });
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchContributions = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('individual_contributions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    setContributions(data || []);
  };

  const handleSubmit = async () => {
    if (!validateFullForm()) {
      toast({
        title: "Validation Error",
        description: "Please check all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to submit contributions",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Insert contribution to database
      const { data, error } = await supabase
        .from('individual_contributions')
        .insert({
          user_id: user.id,
          contribution_type: formData.contribution_type!,
          title: formData.title!,
          description: formData.description || null,
          location: formData.location!,
          quantity: parseFloat(formData.quantity!),
          unit: formData.unit!,
          verification_status: 'pending',
          photo_urls: formData.photo_urls || null,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Contribution Submitted! 🌱",
        description: "Your contribution is being verified by our AI system...",
      });

      // Trigger auto-verification edge function
      await supabase.functions.invoke('auto-verify-contribution', {
        body: { contribution_id: data.id }
      });

      resetForm();
      
      // Refresh contributions list
      const { data: updatedContributions } = await supabase
        .from('individual_contributions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      setContributions(updatedContributions || []);
      
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your contribution. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30";
      case "rejected":
        return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30";
      default:
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/30";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle2 className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getContributionIcon = (type: string) => {
    switch (type) {
      case "tree_planting":
        return <TreePine className="w-5 h-5" />;
      case "home_solar":
        return <Zap className="w-5 h-5" />;
      case "rainwater_harvesting":
        return <Droplets className="w-5 h-5" />;
      case "composting":
        return <Recycle className="w-5 h-5" />;
      default:
        return <Leaf className="w-5 h-5" />;
    }
  };

  if (authLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const stepComponents = [
    <TypeStep key="1" formData={formData} updateFormData={updateFormData} errors={errors} />,
    <LocationStep key="2" formData={formData} updateFormData={updateFormData} errors={errors} />,
    <DetailsStep key="3" formData={formData} updateFormData={updateFormData} errors={errors} />,
    <PhotosStep key="4" formData={formData} updateFormData={updateFormData} errors={errors} />,
    <ReviewStep key="5" formData={formData} updateFormData={updateFormData} errors={errors} />,
  ];

  const stepTitles = [
    "Contribution Type",
    "Location",
    "Details",
    "Photos",
    "Review & Submit"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Leaf className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Your Contributions
            </h1>
          </div>
          <p className="text-muted-foreground">
            Track your climate impact - every action counts and is verified transparently on-chain
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Multi-step Form */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Submit New Contribution</CardTitle>
              <CardDescription>
                Step {currentStep} of {totalSteps}: {stepTitles[currentStep - 1]}
              </CardDescription>
              
              {/* Progress Bar */}
              <div className="space-y-2 pt-4">
                <Progress value={(currentStep / totalSteps) * 100} />
                <div className="flex justify-between text-xs text-muted-foreground">
                  {stepTitles.map((title, index) => (
                    <span
                      key={index}
                      className={currentStep === index + 1 ? "text-primary font-medium" : ""}
                    >
                      {index + 1}
                    </span>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Step Content */}
              <div className="min-h-[400px]">
                {stepComponents[currentStep - 1]}
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between gap-4 mt-8 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1 || isSubmitting}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearDraft}
                  disabled={isSubmitting}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Clear Draft
                </Button>

                {currentStep < totalSteps ? (
                  <Button type="button" onClick={nextStep} disabled={isSubmitting}>
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit Contribution"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Contributions List */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">My Submissions</h2>
            
            {contributions.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Leaf className="w-16 h-16 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center">
                    No contributions yet. Start making an impact today!
                  </p>
                </CardContent>
              </Card>
            ) : (
              contributions.map((contribution) => (
                <Card key={contribution.id} className="border">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getContributionIcon(contribution.contribution_type)}
                        <div>
                          <h3 className="font-semibold">{contribution.title}</h3>
                          <p className="text-sm text-muted-foreground">{contribution.location}</p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(contribution.verification_status)}>
                        {getStatusIcon(contribution.verification_status)}
                        <span className="ml-1 capitalize">{contribution.verification_status}</span>
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3">
                      {contribution.description}
                    </p>

                    {contribution.photo_urls && contribution.photo_urls.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        {contribution.photo_urls.map((url, index) => (
                          <img
                            key={index}
                            src={url}
                            alt={`Project photo ${index + 1}`}
                            className="w-full h-24 object-cover rounded border"
                          />
                        ))}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Quantity:</span>
                        <p className="font-medium">{contribution.quantity} {contribution.unit}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Submitted:</span>
                        <p className="font-medium">
                          {new Date(contribution.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {contribution.blockchain_hash && (
                      <div className="mt-4 p-3 bg-primary/5 rounded border border-primary/20">
                        <p className="text-xs text-muted-foreground mb-1">Blockchain Proof</p>
                        <p className="text-xs font-mono break-all">{contribution.blockchain_hash}</p>
                      </div>
                    )}

                    {contribution.impact_metrics && (
                      <div className="mt-3 p-3 bg-muted/50 rounded text-xs space-y-1">
                        {Object.entries(contribution.impact_metrics).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-muted-foreground">{key.replace(/_/g, ' ')}:</span>
                            <span className="font-medium">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Contribute;
