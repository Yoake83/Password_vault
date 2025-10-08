import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

// This page handles user signup and login.
// On success, it stores the JWT token and redirects to /vault.

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  // Signup function
  const handleSignup = async () => {
    try {
      const res = await axios.post("/api/auth/signup", { email, password });
      localStorage.setItem("token", res.data.token);
      alert("Signup successful!");
      router.push("/vault");
    } catch (err: any) {
      alert(err.response?.data?.error || "Signup failed");
    }
  };

  // Login function
  const handleLogin = async () => {
    try {
      const res = await axios.post("/api/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      alert("Login successful!");
      router.push("/vault");
    } catch (err: any) {
      alert(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <main style={{ padding: 40, fontFamily: "sans-serif" }}>
      <h1>Password Vault </h1>
      <p>Sign up or log in to access your secure vault.</p>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          maxWidth: 300,
          marginTop: 20,
        }}
      >
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: 8 }}
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: 8 }}
        />

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={handleSignup}>Sign Up</button>
          <button onClick={handleLogin}>Log In</button>
        </div>
      </div>
    </main>
  );
}
