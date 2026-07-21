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
    <div className="min-h-screen bg-brand-primary flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl p-10 shadow-2xl">
        <div className="text-center mb-10 relative">
          <Link href="/" aria-label="Back to website" className="absolute -top-6 -left-6 w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 hover:text-brand-primary transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="w-16 h-16 bg-brand-secondary/50 rounded-2xl mx-auto flex items-center justify-center text-brand-primary mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-serif text-brand-primary">Studio Access</h2>
          <p className="text-zinc-500 mt-2">Enter your credentials to manage your studio.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 flex items-center gap-2">
              <UserIcon className="w-4 h-4" /> Email
            </label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-brand-primary outline-none"
              placeholder="you@bougiehairuk.com"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 flex items-center gap-2">
              <Lock className="w-4 h-4" /> Password
            </label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-brand-primary outline-none"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-red-500 text-xs text-center">{error}</p>}

          <Button type="submit" className="w-full h-14 text-lg" disabled={loading}>
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Unlock Dashboard"}
          </Button>
        </form>

        <p className="text-center text-zinc-400 text-[10px] mt-8 uppercase tracking-widest">
          Secure Multi-Factor Infrastructure Enabled
        </p>
      </div>
    </div>
  );
}
