"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  async function register() {
    await supabase.auth.signUp({
      email,
      password,
    });
  }

  return (
    <div className="min-h-screen min-w-1/2 flex items-start justify-end bg-[#1010ca] margin-left: 72px;">
    <div className=" min-h-screen flex items-center justify-center bg-[#0A0A0F] p-6 rounded-3xl">
      <div className="w-full max-w-md bg-[#12121A] p-8 rounded-3xl border-2 border-violet-600">
        <h1 className="text-3xl font-bold text-white">
          Create Account
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
          onClick={register}
          className="w-full mt-6 bg-violet-600 p-3 rounded-xl"
        >
          Create Account
        </button>
      </div>
    </div>
    </div>
  );
}