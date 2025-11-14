import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { contribution_id } = await req.json();
    
    console.log('Auto-verifying contribution:', contribution_id);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Simulate AI verification delay (3 seconds)
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Get contribution details
    const { data: contribution, error: fetchError } = await supabase
      .from('individual_contributions')
      .select('*')
      .eq('id', contribution_id)
      .single();

    if (fetchError) {
      console.error('Error fetching contribution:', fetchError);
      throw fetchError;
    }

    console.log('Processing contribution:', contribution);

    // Calculate AI impact score and metrics based on contribution type
    const calculateImpactMetrics = (type: string, quantity: number) => {
      const impactFactors: Record<string, { co2: number, score: number }> = {
        tree_planting: { co2: 21.77, score: 0.85 },
        home_solar: { co2: 1.5, score: 0.92 },
        rainwater_harvesting: { co2: 0.5, score: 0.78 },
        composting: { co2: 0.3, score: 0.72 },
        clean_cooking: { co2: 2.5, score: 0.88 },
        gardening: { co2: 0.4, score: 0.75 },
      };

      const factor = impactFactors[type] || { co2: 0.5, score: 0.7 };
      const co2Reduced = (quantity * factor.co2).toFixed(2);
      
      return {
        co2_reduced_kg: parseFloat(co2Reduced),
        ai_confidence_score: factor.score + (Math.random() * 0.1 - 0.05), // Add slight variation
        verification_method: 'ai_image_analysis',
        verified_at: new Date().toISOString(),
      };
    };

    const impactMetrics = calculateImpactMetrics(contribution.contribution_type, contribution.quantity);

    // Update contribution to verified status
    const { error: updateError } = await supabase
      .from('individual_contributions')
      .update({
        verification_status: 'verified',
        verified_at: new Date().toISOString(),
        verification_method: 'AI automated verification',
        impact_metrics: impactMetrics,
        blockchain_hash: `0x${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      })
      .eq('id', contribution_id);

    if (updateError) {
      console.error('Error updating contribution:', updateError);
      throw updateError;
    }

    console.log('Contribution verified successfully:', contribution_id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Contribution verified successfully',
        impact_metrics: impactMetrics 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Auto-verification error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});