import React, { useEffect, useState } from "react";
import axios from "axios";
import CryptoJS from "crypto-js";
import PasswordGenerator from "@/components/PasswordGenerator";
import VaultItemCard from "@/components/VaultItemCard";

// Derive an AES key from the master password.
// (For demo: SHA256; in real use PBKDF2 or WebCrypto)
function deriveKey(master: string) {
  const salt = process.env.NEXT_PUBLIC_CRYPTO_SALT || "salt";
  return CryptoJS.SHA256(master + salt).toString();
}

export default function Vault() {
  const [token, setToken] = useState<string | null>(null);
  const [masterPassword, setMasterPassword] = useState("");
  const [derivedKey, setDerivedKey] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [generatedPwd, setGeneratedPwd] = useState("");

  // On load, check for auth token
  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) {
      alert("Please login first.");
      window.location.href = "/";
    } else {
      setToken(t);
      fetchVaultItems(t);
    }
  }, []);

  // Fetch all encrypted items from DB
  const fetchVaultItems = async (t: string) => {
    try {
      const res = await axios.get("/api/vault/list", {
        headers: { Authorization: `Bearer ${t}` },
      });
      setItems(res.data.items || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Derive the encryption key locally
  const handleDeriveKey = () => {
    if (!masterPassword) return alert("Enter your master password");
    const key = deriveKey(masterPassword);
    setDerivedKey(key);
    alert("Key derived successfully!");
  };

  // Create and save  new vault item
 const handleCreateItem = async (e: React.FormEvent<HTMLFormElement>) => {
 e.preventDefault();
if (!derivedKey) return alert("Please derive key first!");
 // Save the form reference before any async calls
 const form = e.currentTarget;

 const formData = new FormData(form);
 const data = {
  title: formData.get("title"),
username: formData.get("username"),
 password: formData.get("password"),
 url: formData.get("url"),
 notes: formData.get("notes"),
 };
 const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), derivedKey).toString();
 await axios.post(
 "/api/vault/create",
 { encrypted },
{ headers: { Authorization: `Bearer ${token}` } }
 );

 alert("Item saved!");
 fetchVaultItems(token!);
  setTimeout(() => {
    form.reset();
  }, 10000);
};


  // Delete item
  const handleDelete = async (id: string) => {
    if (!token) return;
    await axios.delete("/api/vault/delete", {
      data: { id },
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchVaultItems(token);
  };

  // Update item (edit)
  const handleUpdate = async (id: string, encrypted: string) => {
    if (!token) return;
    await axios.put(
      "/api/vault/update",
      { id, encrypted },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchVaultItems(token);
  };

  return (
    <div style={{ padding: 30, fontFamily: "sans-serif" }}>
      <h2>Your Secure Vault 🔒</h2>

      {/* Master Password Input */}
      <div style={{ marginBottom: 20 }}>
        <label>
          Master Password:{" "}
          <input
            type="password"
            value={masterPassword}
            onChange={(e) => setMasterPassword(e.target.value)}
            style={{ marginRight: 10 }}
          />
        </label>
        <button onClick={handleDeriveKey}>Derive Key</button>
      </div>

      {/* Password Generator */}
      <PasswordGenerator onGenerate={(pwd) => setGeneratedPwd(pwd)} />

      {/* Add new vault entry */}
      <form onSubmit={handleCreateItem} style={{ marginTop: 20 }}>
        <h3>Add New Entry</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 400 }}>
          <input name="title" placeholder="Title" required />
          <input name="username" placeholder="Username" required />
          <input name="password" placeholder="Password" defaultValue={generatedPwd} required />
          <input name="url" placeholder="URL" />
          <textarea name="notes" placeholder="Notes" />
          <button type="submit">Save Entry</button>
        </div>
      </form>

      {/* Display vault items */}
      <section style={{ marginTop: 30 }}>
        <h3>Saved Items</h3>
        {items.length === 0 && <p>No items yet.</p>}
        {items.map((item) => (
          <VaultItemCard
            key={item._id}
            id={item._id}
            encrypted={item.encrypted}
            derivedKey={derivedKey}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
          />
        ))}
      </section>
    </div>
  );
}
