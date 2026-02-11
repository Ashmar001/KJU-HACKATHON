import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ParticleField from "@/components/ParticleField";
import heroBg from "@/assets/hero-bg.jpg";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden">
      <ParticleField />

      {/* Background image */}
      <div
        className="fixed inset-0 z-0 opacity-30"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Radial gradient overlay */}
      <div className="fixed inset-0 z-0 bg-radial-warm" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="max-w-2xl"
        >
          {/* Decorative element */}
          <motion.div
            className="w-16 h-16 mx-auto mb-8 rounded-full border-2 border-primary/30 flex items-center justify-center glow-amber"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <div className="w-3 h-3 rounded-full bg-primary animate-pulse-glow" />
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-serif font-bold text-gradient-amber mb-6 leading-tight">
            Time Capsule
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground font-sans font-light leading-relaxed mb-4 max-w-lg mx-auto">
            Write a letter to your future self.
            <br />
            Then hear back from them.
          </p>

          <p className="text-sm text-muted-foreground/60 font-sans mb-12 max-w-md mx-auto">
            An AI-powered conversation with the person you're becoming — based on your goals, dreams, and fears.
          </p>

          <motion.button
            onClick={() => navigate("/write")}
            className="px-8 py-4 rounded-xl font-sans font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-all glow-amber text-base"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            Open Your Time Capsule
          </motion.button>

          {/* Features */}
          <motion.div
            className="mt-20 grid grid-cols-3 gap-8 max-w-lg mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            {[
              { icon: "✍️", label: "Write" },
              { icon: "🔮", label: "Ask" },
              { icon: "💡", label: "Discover" },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <div className="text-2xl mb-2">{item.icon}</div>
                <p className="text-xs text-muted-foreground font-sans uppercase tracking-widest">
                  {item.label}
                </p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
