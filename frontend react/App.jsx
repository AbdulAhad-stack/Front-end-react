import { useState, useRef, useCallback } from "react";
import API from "./config.js";

const TABS = ["encode", "decode"];

function formatBytes(b) {
  if (!b) return "";
  if (b < 1024) return `${b} B`;
  if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1048576).toFixed(1)} MB`;
}

/* ── Icons ─────────────────────────────────────────────────────────────── */
function LockIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );
}

function EyeIcon({ open = true }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/>
      <line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </svg>
  );
}

/* ── Reusable components ───────────────────────────────────────────────── */
function Label({ children }) {
  return (
    <label style={{
      display: "block", marginBottom: 8,
      fontSize: 11, letterSpacing: "0.1em",
      textTransform: "uppercase", color: "#5a7090",
      fontFamily: "'Space Mono', monospace",
    }}>
      {children}
    </label>
  );
}

function PasswordField({ value, onChange, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <Label>Password</Label>
      <div style={{ position: "relative" }}>
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          style={{
            width: "100%", boxSizing: "border-box",
            background: "#0e1420", border: "1.5px solid #1e2d42",
            borderRadius: 10, padding: "12px 48px 12px 16px",
            color: "#e2eaf5", fontSize: 15,
            fontFamily: "'Space Mono', monospace",
            outline: "none", transition: "border-color 0.2s",
          }}
          onFocus={e => e.target.style.borderColor = "#7c5cbf"}
          onBlur={e => e.target.style.borderColor = "#1e2d42"}
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          style={{
            position: "absolute", right: 14, top: "50%",
            transform: "translateY(-50%)",
            background: "none", border: "none",
            color: "#5a7090", cursor: "pointer", padding: 0,
          }}
        >
          <EyeIcon open={show} />
        </button>
      </div>
    </div>
  );
}

function StatusBox({ type, message }) {
  const colors = {
    success: { bg: "rgba(16,185,129,0.08)", border: "#10b981", text: "#34d399" },
    error:   { bg: "rgba(239,68,68,0.08)",  border: "#ef4444", text: "#fca5a5" },
    info:    { bg: "rgba(124,92,191,0.08)", border: "#7c5cbf", text: "#c4b5fd" },
  };
  const c = colors[type] || colors.info;
  return (
    <div style={{
      background: c.bg, border: `1px solid ${c.border}`,
      borderRadius: 10, padding: "14px 18px",
    }}>
      <p style={{
        margin: 0, color: c.text, fontSize: 13,
        lineHeight: 1.7, wordBreak: "break-word",
        fontFamily: "'Space Mono', monospace",
      }}>
        {message}
      </p>
    </div>
  );
}

function Spinner() {
  return (
    <div style={{
      width: 16, height: 16,
      border: "2px solid #1e2d42",
      borderTopColor: "#a585f0",
      borderRadius: "50%",
      animation: "spin 0.75s linear infinite",
      flexShrink: 0,
    }} />
  );
}

/* ── Image drop zone ───────────────────────────────────────────────────── */
function ImageDropZone({ image, preview, capacity, onFile, onClear }) {
  const inputRef = useRef();
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback(e => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) onFile(f);
  }, [onFile]);

  if (preview) {
    return (
      <div>
        <Label>Cover image</Label>
        <div style={{
          position: "relative", borderRadius: 12,
          overflow: "hidden", background: "#0a0f1a",
          border: "1px solid #1e2d42",
        }}>
          <img src={preview} alt="Cover"
            style={{ width: "100%", maxHeight: 260, objectFit: "contain", display: "block" }} />
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            background: "rgba(0,0,0,0.8)", padding: "10px 16px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div style={{ fontSize: 12, color: "#aaa", fontFamily: "'Space Mono', monospace" }}>
              {image?.name} · {formatBytes(image?.size)}
              {capacity?.max_chars > 0 && (
                <span style={{ marginLeft: 10, color: "#a585f0" }}>
                  ↑ {capacity.max_chars.toLocaleString()} chars max
                </span>
              )}
            </div>
            <button onClick={onClear} style={{
              background: "rgba(255,255,255,0.1)", border: "1px solid #2a3a54",
              borderRadius: 6, color: "#ccc", fontSize: 12,
              padding: "4px 12px", cursor: "pointer",
            }}>
              Change
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Label>Cover image</Label>
      <div
        onClick={() => inputRef.current.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${dragging ? "#7c5cbf" : "#1e2d42"}`,
          borderRadius: 12, padding: "52px 24px", textAlign: "center",
          cursor: "pointer",
          background: dragging ? "rgba(124,92,191,0.06)" : "#0e1420",
          transition: "all 0.2s",
        }}
      >
        <div style={{ color: "#5a7090", marginBottom: 14 }}><UploadIcon /></div>
        <div style={{ color: "#e2eaf5", fontSize: 15, fontWeight: 600, marginBottom: 6 }}>
          Drop image here or click to browse
        </div>
        <div style={{ color: "#5a7090", fontSize: 13 }}>
          PNG · JPG · BMP · WebP — max 20 MB
        </div>
        <input ref={inputRef} type="file" accept="image/*"
          style={{ display: "none" }}
          onChange={e => { if (e.target.files[0]) onFile(e.target.files[0]); }} />
      </div>
    </div>
  );
}

/* ── Main App ──────────────────────────────────────────────────────────── */
export default function App() {
  const [tab, setTab]           = useState("encode");
  const [image, setImage]       = useState(null);
  const [preview, setPreview]   = useState(null);
  const [capacity, setCapacity] = useState(null);
  const [message, setMessage]   = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [status, setStatus]     = useState(null);
  const [decoded, setDecoded]   = useState("");
  const [copied, setCopied]     = useState(false);

  const reset = () => {
    setImage(null); setPreview(null); setCapacity(null);
    setStatus(null); setDecoded(""); setMessage(""); setPassword("");
  };

  const handleFile = async file => {
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setStatus(null);
    setDecoded("");
    setCapacity(null);

    if (tab === "encode") {
      try {
        const form = new FormData();
        form.append("image", file);
        const res  = await fetch(`${API}/api/capacity`, { method: "POST", body: form });
        if (res.ok) {
          const data = await res.json();
          setCapacity(data);
        }
      } catch {
        // capacity check is optional — silently skip
      }
    }
  };

  const switchTab = t => { setTab(t); reset(); };

  const handleEncode = async () => {
    if (!image)            return setStatus({ type: "error", text: "Please upload an image first." });
    if (!message.trim())   return setStatus({ type: "error", text: "Please enter a secret message." });
    if (!password.trim())  return setStatus({ type: "error", text: "Please enter a password." });
    if (password.length < 4) return setStatus({ type: "error", text: "Password must be at least 4 characters." });

    setLoading(true);
    setStatus({ type: "info", text: "Encrypting with AES-256 and embedding into pixels..." });

    try {
      const form = new FormData();
      form.append("image", image);
      form.append("message", message);
      form.append("password", password);

      const res = await fetch(`${API}/api/encode`, { method: "POST", body: form });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setStatus({ type: "error", text: err.error || `Server error: ${res.status}` });
        return;
      }

      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url; a.download = "stegocrypt_secret.png"; a.click();
      URL.revokeObjectURL(url);

      setStatus({
        type: "success",
        text: `Done! "stegocrypt_secret.png" was downloaded. Share it normally — it looks like a regular photo. Only someone with the password can reveal the message.`,
      });
    } catch {
      setStatus({
        type: "error",
        text: "Could not reach the backend. Check that the Railway server is running.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDecode = async () => {
    if (!image)           return setStatus({ type: "error", text: "Please upload the stego image." });
    if (!password.trim()) return setStatus({ type: "error", text: "Please enter the decryption password." });

    setLoading(true);
    setDecoded("");
    setStatus({ type: "info", text: "Extracting bits from pixels and decrypting..." });

    try {
      const form = new FormData();
      form.append("image", image);
      form.append("password", password);

      const res  = await fetch(`${API}/api/decode`, { method: "POST", body: form });
      const data = await res.json();

      if (!res.ok || data.error) {
        setStatus({ type: "error", text: data.error || "Decoding failed." });
        return;
      }

      setDecoded(data.message);
      setStatus({ type: "success", text: `Message found — ${data.length} characters decrypted.` });
    } catch {
      setStatus({
        type: "error",
        text: "Could not reach the backend. Check that the Railway server is running.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(decoded).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const charsLeft = capacity ? capacity.max_chars - message.length : null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;600;700;800&display=swap');
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes glow    {
          0%,100% { box-shadow: 0 0 20px rgba(124,92,191,0.3); }
          50%     { box-shadow: 0 0 40px rgba(124,92,191,0.6); }
        }
        * { box-sizing: border-box; }
        body { font-family: 'Syne', sans-serif; }
        input::placeholder, textarea::placeholder { color: #2a3a54; }
      `}</style>

      {/* BG grid */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        backgroundImage: "linear-gradient(rgba(124,92,191,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(124,92,191,0.04) 1px,transparent 1px)",
        backgroundSize: "52px 52px",
      }} />

      <div style={{ position: "relative", zIndex: 1, minHeight: "100vh", padding: "48px 20px 80px" }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>

          {/* ── Header ── */}
          <div style={{ textAlign: "center", marginBottom: 52, animation: "fadeUp 0.5s ease" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 56, height: 56, borderRadius: 14, marginBottom: 20,
              background: "linear-gradient(135deg,#7c5cbf,#4a2d9e)",
              animation: "glow 3s ease-in-out infinite",
            }}>
              <LockIcon size={24} />
            </div>
            <h1 style={{
              fontFamily: "'Syne', sans-serif", fontSize: "clamp(36px,8vw,52px)",
              fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1,
              background: "linear-gradient(120deg,#e2eaf5 30%,#a585f0)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              marginBottom: 12,
            }}>
              StegoCrypt
            </h1>
            <p style={{
              color: "#5a7090", fontSize: 14,
              fontFamily: "'Space Mono', monospace", letterSpacing: "0.05em",
            }}>
              hide encrypted messages inside ordinary images · AES-256 + LSB
            </p>
          </div>

          {/* ── Tab bar ── */}
          <div style={{
            display: "flex", gap: 4, background: "#0e1420",
            border: "1px solid #1e2d42", borderRadius: 14,
            padding: 5, marginBottom: 32,
          }}>
            {TABS.map(t => (
              <button key={t} onClick={() => switchTab(t)} style={{
                flex: 1, padding: "13px 0", borderRadius: 10, border: "none",
                fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15,
                cursor: "pointer", transition: "all 0.25s",
                background: tab === t
                  ? t === "encode"
                    ? "linear-gradient(135deg,#7c5cbf,#5a3fa0)"
                    : "linear-gradient(135deg,#0a7d60,#0f9e7b)"
                  : "transparent",
                color: tab === t ? "#fff" : "#5a7090",
                boxShadow: tab === t ? "0 2px 14px rgba(124,92,191,0.25)" : "none",
              }}>
                {t === "encode" ? "🔒 Hide message" : "🔓 Reveal message"}
              </button>
            ))}
          </div>

          {/* ── Main card ── */}
          <div style={{
            background: "#0e1420", border: "1px solid #1e2d42",
            borderRadius: 20, padding: "clamp(20px,4vw,36px)",
            display: "flex", flexDirection: "column", gap: 28,
          }}>
            <ImageDropZone
              image={image} preview={preview} capacity={capacity}
              onFile={handleFile} onClear={reset}
            />

            {/* Message textarea (encode only) */}
            {tab === "encode" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <Label>Secret message</Label>
                  {charsLeft !== null && (
                    <span style={{
                      fontSize: 11, fontFamily: "'Space Mono', monospace",
                      color: charsLeft < 100 ? "#ef4444" : "#5a7090",
                    }}>
                      {charsLeft.toLocaleString()} chars left
                    </span>
                  )}
                </div>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Type your secret message here..."
                  rows={5}
                  style={{
                    width: "100%", resize: "vertical",
                    background: "#080b12", border: "1.5px solid #1e2d42",
                    borderRadius: 10, padding: "14px 16px",
                    color: "#e2eaf5", fontSize: 15, lineHeight: 1.6,
                    fontFamily: "'Syne', sans-serif", outline: "none",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={e => e.target.style.borderColor = "#7c5cbf"}
                  onBlur={e => e.target.style.borderColor = "#1e2d42"}
                />
              </div>
            )}

            <PasswordField
              value={password}
              onChange={setPassword}
              placeholder={tab === "encode" ? "Set a strong password" : "Enter the decryption password"}
            />

            {/* Action button */}
            <button
              onClick={tab === "encode" ? handleEncode : handleDecode}
              disabled={loading}
              style={{
                width: "100%", padding: "16px 0",
                borderRadius: 12, border: "none",
                fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16,
                cursor: loading ? "not-allowed" : "pointer",
                transition: "opacity 0.2s, transform 0.1s",
                background: loading ? "#141b28"
                  : tab === "encode"
                    ? "linear-gradient(135deg,#7c5cbf,#5a3fa0)"
                    : "linear-gradient(135deg,#0a7d60,#0f9e7b)",
                color: loading ? "#5a7090" : "#fff",
                boxShadow: loading ? "none" : "0 4px 24px rgba(124,92,191,0.3)",
                display: "flex", alignItems: "center",
                justifyContent: "center", gap: 10,
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = "0.88"; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
            >
              {loading ? (
                <><Spinner /> Processing...</>
              ) : tab === "encode" ? (
                <><LockIcon /> Encrypt &amp; hide in image</>
              ) : (
                <><LockIcon /> Extract &amp; decrypt message</>
              )}
            </button>

            {/* Status */}
            {status && <StatusBox type={status.type} message={status.text} />}

            {/* Decoded message box */}
            {decoded && (
              <div style={{
                background: "#080b12", border: "1px solid #1e2d42",
                borderRadius: 12, padding: 20,
              }}>
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  alignItems: "center", marginBottom: 14,
                }}>
                  <span style={{
                    fontSize: 11, color: "#00d4aa",
                    fontFamily: "'Space Mono', monospace",
                    letterSpacing: "0.1em", textTransform: "uppercase",
                  }}>
                    Decrypted message
                  </span>
                  <button onClick={handleCopy} style={{
                    display: "flex", alignItems: "center", gap: 6,
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid #1e2d42", borderRadius: 6,
                    color: copied ? "#00d4aa" : "#5a7090",
                    fontSize: 12, padding: "5px 12px",
                    cursor: "pointer", fontFamily: "'Space Mono', monospace",
                    transition: "color 0.2s",
                  }}>
                    <CopyIcon />
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
                <p style={{
                  color: "#e2eaf5", fontSize: 15, lineHeight: 1.75,
                  whiteSpace: "pre-wrap", wordBreak: "break-word",
                  fontFamily: "'Syne', sans-serif",
                }}>
                  {decoded}
                </p>
              </div>
            )}
          </div>

          {/* ── How it works strip ── */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 14, marginTop: 32,
          }}>
            {[
              { n: "01", t: "AES-256-GCM",  d: "Message encrypted with authenticated encryption before hiding" },
              { n: "02", t: "LSB encode",    d: "Each cipher bit hides in the least-significant bit of a pixel" },
              { n: "03", t: "PNG output",    d: "Lossless format preserves every hidden bit — JPEG would destroy them" },
            ].map(({ n, t, d }) => (
              <div key={n} style={{
                background: "#0e1420", border: "1px solid #1e2d42",
                borderRadius: 14, padding: 18,
              }}>
                <div style={{ fontSize: 10, color: "#a585f0", marginBottom: 8, fontFamily: "'Space Mono', monospace" }}>{n}</div>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>{t}</div>
                <div style={{ fontSize: 12, color: "#5a7090", lineHeight: 1.6 }}>{d}</div>
              </div>
            ))}
          </div>

          <p style={{
            textAlign: "center", marginTop: 40,
            fontSize: 11, color: "#2a3a54",
            fontFamily: "'Space Mono', monospace",
          }}>
            StegoCrypt · AES-256 + LSB Steganography · University of Agriculture Faisalabad
          </p>
        </div>
      </div>
    </>
  );
}
