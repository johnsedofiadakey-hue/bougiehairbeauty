"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Lock, User as UserIcon, ArrowLeft, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError("Invalid credentials. Please check your email and password.");
      } else {
        router.push("/admin/settings");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#1C140F] flex items-center justify-center p-6 overflow-hidden">
      {/* Ambient glow so the glass card below has something to actually blur —
          a flat color behind a backdrop-blur panel reads as plain opacity,
          not glass. */}
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-brand-primary/25 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-[#D4AF37]/20 blur-3xl" />

      <div className="relative max-w-md w-full bg-white/10 backdrop-blur-2xl border border-white/15 rounded-3xl p-10 shadow-2xl">
        <div className="text-center mb-10 relative">
          <Link href="/" aria-label="Back to website" className="absolute -top-6 -left-6 w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="w-16 h-16 bg-[#D4AF37]/15 border border-[#D4AF37]/30 rounded-2xl mx-auto flex items-center justify-center text-[#D4AF37] mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-serif text-white">Studio Access</h2>
          <p className="text-white/50 mt-2">Enter your credentials to manage your studio.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/70 flex items-center gap-2">
              <UserIcon className="w-4 h-4" /> Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-white/15 bg-white/5 text-white placeholder:text-white/30 focus:ring-2 focus:ring-[#D4AF37] outline-none"
              placeholder="you@bougiehairuk.com"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/70 flex items-center gap-2">
              <Lock className="w-4 h-4" /> Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-white/15 bg-white/5 text-white placeholder:text-white/30 focus:ring-2 focus:ring-[#D4AF37] outline-none"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-rose-300 text-xs text-center">{error}</p>}

          <Button type="submit" className="w-full h-14 text-lg" disabled={loading}>
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Unlock Dashboard"}
          </Button>
        </form>

        <p className="text-center text-white/30 text-[10px] mt-8 uppercase tracking-widest">
          Staff &amp; Admin Access Only
        </p>
      </div>
    </div>
  );
}
