import React, { useState } from "react";
import CryptoJS from "crypto-js";

type VaultPlain = {
  title: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
};

type Props = {
  id: string;
  encrypted: string;
  derivedKey: string; // derived key (hex/string)
  onDelete: (id: string) => Promise<void>;
  onUpdate: (id: string, encrypted: string) => Promise<void>;
};

export default function VaultItemCard({ id, encrypted, derivedKey, onDelete, onUpdate }: Props) {
  const [decrypted, setDecrypted] = useState<VaultPlain | null>(null);
  const [revealed, setRevealed] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [editing, setEditing] = useState<boolean>(false);
  const [editValues, setEditValues] = useState<VaultPlain | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const decrypt = () => {
    try {
      const bytes = CryptoJS.AES.decrypt(encrypted, derivedKey);
      const plain = bytes.toString(CryptoJS.enc.Utf8);
      if (!plain) throw new Error("empty plaintext");
      const obj = JSON.parse(plain) as VaultPlain;
      setDecrypted(obj);
      setEditValues(obj);
      setRevealed(true);
    } catch (e) {
      alert("Decryption failed — check your master password");
    }
  };

  const copyAndClear = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(async () => {
        try {
          await navigator.clipboard.writeText("");
        } catch {
          /* ignore */
        }
        setCopied(false);
      }, 15000); // clear after 15s
    } catch {
      alert("Copy failed");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this item?")) return;
    setLoading(true);
    try {
      await onDelete(id);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = () => {
    if (!decrypted) {
      decrypt();
      return;
    }
    setEditing(true);
  };

  const saveEdit = async () => {
    if (!editValues) return;
    setLoading(true);
    try {
      const plain = JSON.stringify(editValues);
      const newEncrypted = CryptoJS.AES.encrypt(plain,derivedKey).toString();
      await onUpdate(id, newEncrypted);
      setDecrypted(editValues);
      setEditing(false);
    } catch (e) {
      alert("Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ border: "1px solid #eee", padding: 10, borderRadius: 8, marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <strong>{decrypted?.title ?? "Encrypted item"}</strong>
        <div style={{ display: "flex", gap: 8 }}>
          {!revealed && <button onClick={decrypt}>Reveal</button>}
          {revealed && <button onClick={() => setRevealed(false)}>Hide</button>}
          <button onClick={startEdit}>{editing ? "Editing" : "Edit"}</button>
          <button onClick={handleDelete} disabled={loading}>{loading ? "..." : "Delete"}</button>
        </div>
      </div>

      {revealed && decrypted && !editing && (
        <div style={{ marginTop: 8 }}>
          <div><strong>Username:</strong> {decrypted.username}</div>
          <div><strong>URL:</strong> {decrypted.url}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div><strong>Password:</strong> {decrypted.password}</div>
            <button onClick={() => copyAndClear(decrypted.password)}>{copied ? "Copied" : "Copy"}</button>
          </div>
          <div><strong>Notes:</strong> {decrypted.notes}</div>
        </div>
      )}

      {revealed && decrypted && editing && editValues && (
        <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
          <input
            value={editValues.title}
            onChange={(e) => setEditValues({ ...editValues, title: e.target.value })}
            placeholder="Title"
          />
          <input
            value={editValues.username}
            onChange={(e) => setEditValues({ ...editValues, username: e.target.value })}
            placeholder="Username"
          />
          <input
            value={editValues.password}
            onChange={(e) => setEditValues({ ...editValues, password: e.target.value })}
            placeholder="Password"
          />
          <input
            value={editValues.url || ""}
            onChange={(e) => setEditValues({ ...editValues, url: e.target.value })}
            placeholder="URL"
          />
          <textarea
            value={editValues.notes || ""}
            onChange={(e) => setEditValues({ ...editValues, notes: e.target.value })}
            placeholder="Notes"
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={saveEdit} disabled={loading}>Save</button>
            <button onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
