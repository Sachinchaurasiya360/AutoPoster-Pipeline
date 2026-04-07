import { LoginForm } from "@/components/login-form";
import { Lock } from "lucide-react";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-2xl">
          <div className="flex flex-col items-center text-center space-y-2 mb-6">
            <div className="h-12 w-12 rounded-full bg-cyan-500/20 flex items-center justify-center mb-2">
              <Lock className="h-6 w-6 text-cyan-400" />
            </div>
            <h1 className="text-3xl font-bold text-white">Hi Sachin 👋</h1>
            <p className="text-sm text-slate-400">
              Enter your password to continue
            </p>
          </div>

          <LoginForm />

          <div className="mt-6 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
            <p className="text-xs text-amber-300/90 text-center">
              ⚠️ This website is for personal use only — not for public access.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
