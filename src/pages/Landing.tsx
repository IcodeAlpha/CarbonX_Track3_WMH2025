import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Leaf, TrendingDown, Users, Globe } from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?q=80&w=2070&auto=format&fit=crop')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-emerald-900/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 text-center">
        {/* Logo/Icon */}
        <div className="mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center p-4 bg-emerald-500/20 backdrop-blur-sm rounded-full border border-emerald-500/30 shadow-2xl">
            <Globe className="h-16 w-16 text-emerald-400" />
          </div>
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-fade-in-delay-1">
          CarbonX
          <span className="block text-emerald-400 mt-2">Act. Support. Restore.</span>
        </h1>

        {/* Subheading */}
        <p className="text-xl md:text-2xl text-gray-200 mb-12 max-w-3xl animate-fade-in-delay-2">
          Join CarbonX to support trusted carbon projects, follow your impact in real time, and be part of a global climate community.
        </p>

        {/* CTA Button */}
        <Button 
          onClick={() => navigate('/auth')}
          size="lg"
          className="text-lg px-12 py-6 bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300 transform hover:scale-105 animate-fade-in-delay-3"
        >
          <Leaf className="mr-2 h-5 w-5" />
          Save the Planet
        </Button>

        {/* Feature Cards */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full animate-fade-in-delay-4">
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
            <TrendingDown className="h-10 w-10 text-emerald-400 mb-4 mx-auto" />
            <h3 className="text-xl font-semibold text-white mb-2">Reduce Emissions</h3>
            <p className="text-gray-300">
              Offset your carbon footprint with verified credits from sustainable projects worldwide
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
            <Users className="h-10 w-10 text-emerald-400 mb-4 mx-auto" />
            <h3 className="text-xl font-semibold text-white mb-2">Join Community</h3>
            <p className="text-gray-300">
              Connect with like-minded individuals committed to environmental sustainability
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
            <Globe className="h-10 w-10 text-emerald-400 mb-4 mx-auto" />
            <h3 className="text-xl font-semibold text-white mb-2">Global Impact</h3>
            <p className="text-gray-300">
              Support reforestation, renewable energy, and conservation projects across the globe
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-16 flex flex-wrap justify-center gap-8 text-white animate-fade-in-delay-5">
          <div className="text-center">
            <div className="text-4xl font-bold text-emerald-400">1M+</div>
            <div className="text-sm text-gray-300">Tons of CO₂ Offset</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-emerald-400">50K+</div>
            <div className="text-sm text-gray-300">Active Users</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-emerald-400">200+</div>
            <div className="text-sm text-gray-300">Verified Projects</div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }

        .animate-fade-in-delay-1 {
          opacity: 0;
          animation: fadeIn 0.8s ease-out 0.2s forwards;
        }

        .animate-fade-in-delay-2 {
          opacity: 0;
          animation: fadeIn 0.8s ease-out 0.4s forwards;
        }

        .animate-fade-in-delay-3 {
          opacity: 0;
          animation: fadeIn 0.8s ease-out 0.6s forwards;
        }

        .animate-fade-in-delay-4 {
          opacity: 0;
          animation: fadeIn 0.8s ease-out 0.8s forwards;
        }

        .animate-fade-in-delay-5 {
          opacity: 0;
          animation: fadeIn 0.8s ease-out 1s forwards;
        }
      `}</style>
    </div>
  );
}