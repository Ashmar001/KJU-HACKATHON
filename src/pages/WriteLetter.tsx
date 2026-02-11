import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ParticleField from "@/components/ParticleField";
import heroBg from "@/assets/hero-bg.jpg";

interface LetterContext {
  goals: string;
  fears: string;
  dreams: string;
  letter: string;
}

const WriteLetter = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<LetterContext>({
    goals: "",
    fears: "",
    dreams: "",
    letter: "",
  });

  const handleSubmit = () => {
    if (!form.letter.trim()) return;
    // Store in sessionStorage for the chat page
    sessionStorage.setItem("timeCapsuleContext", JSON.stringify(form));
    navigate("/talk");
  };

  const fieldClass =
    "w-full rounded-lg border border-border bg-secondary/50 px-4 py-3 font-sans text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all resize-none";

  return (
    <div className="min-h-screen relative">
      <ParticleField />
      <div
        className="fixed inset-0 z-0 opacity-20"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <div className="relative z-10 max-w-2xl mx-auto px-6 py-16">
        <motion.button
          onClick={() => navigate("/")}
          className="mb-8 text-muted-foreground hover:text-foreground transition-colors text-sm font-sans flex items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          ← Back
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-5xl font-serif font-semibold text-gradient-amber mb-3">
            Dear Future Me,
          </h1>
          <p className="text-muted-foreground font-sans mb-10">
            Share where you are right now. Your future self is listening.
          </p>
        </motion.div>

        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div>
            <label className="block text-sm font-sans text-foreground/80 mb-2">
              What are your current goals?
            </label>
            <textarea
              className={fieldClass}
              rows={2}
              placeholder="Career milestones, personal growth, relationships..."
              value={form.goals}
              onChange={(e) => setForm({ ...form, goals: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-sans text-foreground/80 mb-2">
              What keeps you up at night?
            </label>
            <textarea
              className={fieldClass}
              rows={2}
              placeholder="Your worries, anxieties, uncertainties..."
              value={form.fears}
              onChange={(e) => setForm({ ...form, fears: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-sans text-foreground/80 mb-2">
              What do you dream about?
            </label>
            <textarea
              className={fieldClass}
              rows={2}
              placeholder="The life you imagine, wild hopes, secret wishes..."
              value={form.dreams}
              onChange={(e) => setForm({ ...form, dreams: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-sans text-foreground/80 mb-2">
              Your letter to Future You *
            </label>
            <textarea
              className={fieldClass}
              rows={6}
              placeholder="Write freely. Tell your future self everything — what you're proud of, what you're struggling with, what you need to hear back..."
              value={form.letter}
              onChange={(e) => setForm({ ...form, letter: e.target.value })}
            />
          </div>

          <motion.button
            onClick={handleSubmit}
            disabled={!form.letter.trim()}
            className="w-full py-4 rounded-lg font-sans font-medium text-primary-foreground bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all glow-amber"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            Seal the Capsule & Talk to Future Me →
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default WriteLetter;
