
import React, { useState } from "react";

type Props = {
  onGenerate?: (pwd: string) => void;
};

const LOWER = "abcdefghijklmnopqrstuvwxyz";
const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const NUM = "23456789"; // exclude 0 and 1 to avoid look-alikes
const SYM = "!@#$%^&*()-_=+[]{}";

export default function PasswordGenerator({ onGenerate }: Props) {
  const [length, setLength] = useState<number>(12);
  const [useUpper, setUseUpper] = useState<boolean>(true);
  const [useNum, setUseNum] = useState<boolean>(true);
  const [useSym, setUseSym] = useState<boolean>(true);
  const [noLookAlike, setNoLookAlike] = useState<boolean>(true);
  const [result, setResult] = useState<string>("");

  function buildCharset() {
    let chars = LOWER;
    if (useUpper) chars += UPPER;
    if (useNum) chars += NUM;
    if (useSym) chars += SYM;
    if (noLookAlike) {
      // remove often-confused characters
      chars = chars.replace(/[O0Il1]/g, "");
    }
    return chars;
  }

  const generate = () => {
    const chars = buildCharset();
    if (!chars.length) return;
    let pwd = "";
    for (let i = 0; i < length; i++) {
      pwd += chars[Math.floor(Math.random() * chars.length)];
    }
    setResult(pwd);
    onGenerate?.(pwd);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // optional UX: could show toast — keep simple here
    } catch {
      // ignore clipboard errors for demo
    }
  };

  return (
    <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
      <h3 style={{ margin: "0 0 8px 0" }}>Password Generator</h3>

      <div style={{ marginBottom: 8 }}>
        <label style={{ display: "block", marginBottom: 6 }}>
          Length: <strong>{length}</strong>
        </label>
        <input
          type="range"
          min={6}
          max={64}
          value={length}
          onChange={(e) => setLength(Number(e.target.value))}
        />
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 8 }}>
        <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <input type="checkbox" checked={useUpper} onChange={(e) => setUseUpper(e.target.checked)} />
          Uppercase
        </label>

        <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <input type="checkbox" checked={useNum} onChange={(e) => setUseNum(e.target.checked)} />
          Numbers
        </label>

        <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <input type="checkbox" checked={useSym} onChange={(e) => setUseSym(e.target.checked)} />
          Symbols
        </label>

        <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <input
            type="checkbox"
            checked={noLookAlike}
            onChange={(e) => setNoLookAlike(e.target.checked)}
          />
          Exclude look-alikes
        </label>
      </div>

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button onClick={generate}>Generate</button>
        <input
          readOnly
          value={result}
          style={{ width: "60%", padding: "6px 8px", borderRadius: 4, border: "1px solid #ccc" }}
        />
        <button onClick={() => { copyToClipboard(result); }}>Copy</button>
      </div>
    </div>
  );
}

