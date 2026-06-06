"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function login() {
    const { error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (!error) {
      router.push("/dashboard");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0F]">
      <div className="w-full max-w-md bg-[#12121A] p-8 rounded-3xl">
        <h1 className="text-3xl font-bold text-white">
          Welcome Back
        </h1>

        <input
          placeholder="Email"
          className="w-full mt-6 p-3 rounded-xl bg-black text-white"
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mt-4 p-3 rounded-xl bg-black text-white"
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        <button
          onClick={login}
          className="w-full mt-6 bg-violet-600 p-3 rounded-xl"
        >
          Login
        </button>
      </div>
    </div>
  );
}