import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import ParticleField from "@/components/ParticleField";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/future-chat`;

const TalkToFuture = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [letterContext, setLetterContext] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("timeCapsuleContext");
    if (stored) {
      const ctx = JSON.parse(stored);
      setLetterContext(ctx);
      // Auto-send the letter as first message
      sendMessage(
        `I wrote you a letter. Here it is:\n\n${ctx.letter}`,
        ctx
      );
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string, ctx?: any) => {
    const userMsg: Msg = { role: "user", content: text };
    const currentMessages = [...messages, userMsg];
    setMessages(currentMessages);
    setInput("");
    setIsLoading(true);

    let assistantSoFar = "";

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: currentMessages,
          letterContext: ctx || letterContext,
        }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Something went wrong" }));
        throw new Error(err.error || "Failed to connect");
      }

      if (!resp.body) throw new Error("No response stream");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantSoFar += content;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) =>
                    i === prev.length - 1 ? { ...m, content: assistantSoFar } : m
                  );
                }
                return [...prev, { role: "assistant", content: assistantSoFar }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (e: any) {
      console.error(e);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `*Connection lost.* ${e.message || "Please try again."}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <ParticleField />

      {/* Header */}
      <div className="relative z-10 border-b border-border/50 px-6 py-4 flex items-center justify-between backdrop-blur-sm bg-background/50">
        <button
          onClick={() => navigate("/")}
          className="text-muted-foreground hover:text-foreground transition-colors text-sm font-sans"
        >
          ← Back
        </button>
        <h1 className="font-serif text-lg text-gradient-amber">Future You</h1>
        <div className="w-12" />
      </div>

      {/* Messages */}
      <div className="flex-1 relative z-10 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {messages.length === 0 && !isLoading && (
            <motion.div
              className="text-center py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-muted-foreground font-sans text-sm">
                Write a letter first to begin the conversation...
              </p>
              <button
                onClick={() => navigate("/write")}
                className="mt-4 text-primary hover:text-primary/80 font-sans text-sm transition-colors"
              >
                Write your letter →
              </button>
            </motion.div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-5 py-3.5 font-sans text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-primary/20 text-foreground rounded-br-md"
                      : "bg-card border border-border/50 text-foreground rounded-bl-md glow-amber-soft"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <span className="block text-xs text-primary/70 font-medium mb-1.5 font-serif">
                      Future You
                    </span>
                  )}
                  <div className="prose prose-sm prose-invert max-w-none [&>p]:mb-2 [&>p:last-child]:mb-0">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-card border border-border/50 rounded-2xl rounded-bl-md px-5 py-3.5 glow-amber-soft">
                <span className="block text-xs text-primary/70 font-medium mb-1.5 font-serif">
                  Future You
                </span>
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary/40 animate-pulse" />
                  <span className="w-2 h-2 rounded-full bg-primary/40 animate-pulse [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-primary/40 animate-pulse [animation-delay:0.4s]" />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="relative z-10 border-t border-border/50 px-4 py-4 backdrop-blur-sm bg-background/50">
        <div className="max-w-2xl mx-auto flex gap-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your future self anything..."
            rows={1}
            className="flex-1 rounded-xl border border-border bg-secondary/50 px-4 py-3 font-sans text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all resize-none"
          />
          <motion.button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-5 rounded-xl bg-primary text-primary-foreground font-sans text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Send
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default TalkToFuture;
