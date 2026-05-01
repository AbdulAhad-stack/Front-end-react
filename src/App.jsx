import { useState, useRef, useCallback } from "react";

const API = "https://web-production-ecc88.up.railway.app";

const TABS = ["encode", "decode"];

function formatBytes(b) {
  if (b < 1024) return `${b} B`;
  if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1048576).toFixed(1)} MB`;
}

function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/>
      <line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  );
}

function ImageDropZone({ image, preview, capacity, onFile, onClear }) {
  const inputRef = useRef();
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onFile(file);
  }, [onFile]);

  return (
    <div>
      <label style={{ display: "block", marginBottom: 8, fontSize: 13, color: "var(--c-muted)", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "var(--f-mono)" }}>
        Cover image
      </label>
      {!preview ? (
        <div
          onClick={() => inputRef.current.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${dragging ? "var(--c-accent)" : "var(--c-border)"}`,
            borderRadius: 12,
            padding: "48px 24px",
            textAlign: "center",
            cursor: "pointer",
            background: dragging ? "rgba(139,92,246,0.06)" : "var(--c-surface)",
            transition: "all 0.2s",
          }}
        >
          <div style={{ color: "var(--c-muted)", marginBottom: 12 }}><UploadIcon /></div>
          <div style={{ color: "var(--c-text)", fontSize: 15, marginBottom: 4 }}>Drop image here</div>
          <div style={{ color: "var(--c-muted)", fontSize: 13 }}>PNG, JPG, BMP, WebP — max 20 MB</div>
          <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }}
            onChange={(e) => { if (e.target.files[0]) onFile(e.target.files[0]); }} />
        </div>
      ) : (
        <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", background: "var(--c-surface)" }}>
          <img src={preview} alt="Cover" style={{ width: "100%", maxHeight: 280, objectFit: "contain", display: "block" }} />
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            background: "rgba(0,0,0,0.75)", padding: "10px 16px",
            display: "flex", justifyContent: "space-between", alignItems: "center"
          }}>
            <div style={{ fontSize: 12, color: "#ccc" }}>
              {image?.name} · {formatBytes(image?.size || 0)}
              {capacity && (
                <span style={{ marginLeft: 12, color: "var(--c-accent-soft)" }}>
                  Holds up to {capacity.max_chars.toLocaleString()} chars
                </span>
              )}
            </div>
            <button onClick={onClear} style={{
              background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 6,
              color: "#fff", fontSize: 12, padding: "4px 10px", cursor: "pointer"
            }}>Change</button>
          </div>
        </div>
      )}
    </div>
  );
}

function PasswordField({ value, onChange, placeholder = "Encryption password" }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label style={{ display: "block", marginBottom: 8, fontSize: 13, color: "var(--c-muted)", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "var(--f-mono)" }}>
        Password
      </label>
      <div style={{ position: "relative" }}>
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: "100%", boxSizing: "border-box",
            background: "var(--c-surface)", border: "1.5px solid var(--c-border)",
            borderRadius: 10, padding: "12px 48px 12px 16px",
            color: "var(--c-text)", fontSize: 15, outline: "none",
            fontFamily: "var(--f-mono)",
            transition: "border-color 0.2s",
          }}
          onFocus={(e) => e.target.style.borderColor = "var(--c-accent)"}
          onBlur={(e) => e.target.style.borderColor = "var(--c-border)"}
        />
        <button onClick={() => setShow(s => !s)} style={{
          position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
          background: "none", border: "none", color: "var(--c-muted)", cursor: "pointer", padding: 0
        }}>
          <EyeIcon />
        </button>
      </div>
    </div>
  );
}

function StatusBox({ type, message }) {
  const colors = {
    success: { bg: "rgba(16,185,129,0.1)", border: "#10b981", text: "#34d399" },
    error:   { bg: "rgba(239,68,68,0.1)",  border: "#ef4444", text: "#fca5a5" },
    info:    { bg: "rgba(139,92,246,0.1)", border: "#8b5cf6", text: "#c4b5fd" },
  };
  const c = colors[type] || colors.info;
  return (
    <div style={{
      background: c.bg, border: `1px solid ${c.border}`,
      borderRadius: 10, padding: "14px 18px",
    }}>
      <p style={{ margin: 0, color: c.text, fontSize: 14, lineHeight: 1.6, fontFamily: "var(--f-mono)", wordBreak: "break-word" }}>
        {message}
      </p>
    </div>
  );
}

export default function App() {
  const [tab, setTab]           = useState("encode");
  const [image, setImage]       = useState(null);
  const [preview, setPreview]   = useState(null);
  const [capacity, setCapacity] = useState(null);
  const [message, setMessage]   = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [status, setStatus]     = useState(null); // { type, text }
  const [decoded, setDecoded]   = useState("");

  const handleFile = async (file) => {
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
        const data = await res.json();
        if (data.max_chars !== undefined) setCapacity(data);
      } catch {}
    }
  };

  const handleClear = () => {
    setImage(null);
    setPreview(null);
    setCapacity(null);
    setStatus(null);
    setDecoded("");
  };

  const switchTab = (t) => {
    setTab(t);
    handleClear();
    setMessage("");
    setPassword("");
  };

  const handleEncode = async () => {
    if (!image) return setStatus({ type: "error", text: "Please upload an image first." });
    if (!message.trim()) return setStatus({ type: "error", text: "Please enter a secret message." });
    if (!password.trim()) return setStatus({ type: "error", text: "Please enter a password." });
    if (password.length < 4) return setStatus({ type: "error", text: "Password must be at least 4 characters." });

    setLoading(true);
    setStatus({ type: "info", text: "Encrypting and embedding your message..." });

    try {
      const form = new FormData();
      form.append("image", image);
      form.append("message", message);
      form.append("password", password);

      const res = await fetch(`${API}/api/encode`, { method: "POST", body: form });

      if (!res.ok) {
        const err = await res.json();
        setStatus({ type: "error", text: err.error || "Encoding failed." });
        return;
      }

      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url;
      a.download = "stegocrypt_secret.png";
      a.click();
      URL.revokeObjectURL(url);

      setStatus({
        type: "success",
        text: `Done! Your message is hidden inside the image. The file was downloaded as "stegocrypt_secret.png". Share it normally — it looks like a regular photo.`,
      });
    } catch {
      setStatus({ type: "error", text: "Could not connect to the Flask server. Make sure it is running on port 5001." });
    } finally {
      setLoading(false);
    }
  };

  const handleDecode = async () => {
    if (!image) return setStatus({ type: "error", text: "Please upload the stego image." });
    if (!password.trim()) return setStatus({ type: "error", text: "Please enter the decryption password." });

    setLoading(true);
    setDecoded("");
    setStatus({ type: "info", text: "Extracting and decrypting hidden message..." });

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
      setStatus({ type: "success", text: `Hidden message found! (${data.length} characters)` });
    } catch {
      setStatus({ type: "error", text: "Could not connect to the Flask server. Make sure it is running on port 5001." });
    } finally {
      setLoading(false);
    }
  };

  const charsLeft = capacity ? capacity.max_chars - message.length : null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;500;600;700;800&display=swap');

        :root {
          --c-bg:          #080b12;
          --c-surface:     #0e1420;
          --c-surface2:    #141b28;
          --c-border:      #1e2d42;
          --c-text:        #e2eaf5;
          --c-muted:       #5a7090;
          --c-accent:      #7c5cbf;
          --c-accent-soft: #a585f0;
          --c-teal:        #00d4aa;
          --f-display:     'Syne', sans-serif;
          --f-mono:        'Space Mono', monospace;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: var(--c-bg);
          color: var(--c-text);
          font-family: var(--f-display);
          min-height: 100vh;
        }

        textarea:focus, input:focus { outline: none; }

        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--c-border); border-radius: 3px; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.5s ease forwards; }

        @keyframes pulse-ring {
          0%   { transform: scale(1);    opacity: 0.6; }
          100% { transform: scale(1.35); opacity: 0; }
        }

        @keyframes scan {
          0%   { background-position: 0 -100%; }
          100% { background-position: 0 200%; }
        }
      `}</style>

      <div style={{ minHeight: "100vh", background: "var(--c-bg)" }}>

        {/* Decorative background grid */}
        <div style={{
          position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
          backgroundImage: "linear-gradient(rgba(124,92,191,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(124,92,191,0.04) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 700, margin: "0 auto", padding: "48px 24px 80px" }}>

          {/* Header */}
          <div className="fade-up" style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <div style={{
                width: 42, height: 42, borderRadius: 10,
                background: "linear-gradient(135deg, #7c5cbf, #00d4aa)",
                display: "flex", alignItems: "center", justifyContent: "center",
                position: "relative",
              }}>
                <div style={{
                  position: "absolute", inset: 0, borderRadius: 10,
                  background: "linear-gradient(135deg, #7c5cbf, #00d4aa)",
                  animation: "pulse-ring 2s ease-out infinite",
                }} />
                <LockIcon />
              </div>
            </div>
            <h1 style={{
              fontFamily: "var(--f-display)", fontSize: 48, fontWeight: 800,
              letterSpacing: "-0.03em", lineHeight: 1,
              background: "linear-gradient(120deg, #e2eaf5 30%, #a585f0)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              marginBottom: 14,
            }}>
              StegoCrypt
            </h1>
            <p style={{ color: "var(--c-muted)", fontSize: 15, fontFamily: "var(--f-mono)", letterSpacing: "0.04em" }}>
              hide encrypted messages inside ordinary images
            </p>
          </div>

          {/* Tab switcher */}
          <div className="fade-up" style={{
            display: "flex", gap: 4, background: "var(--c-surface)",
            borderRadius: 14, padding: 5, marginBottom: 36,
            border: "1px solid var(--c-border)",
          }}>
            {TABS.map(t => (
              <button key={t} onClick={() => switchTab(t)} style={{
                flex: 1, padding: "12px 0",
                borderRadius: 10, border: "none",
                fontFamily: "var(--f-display)", fontWeight: 600, fontSize: 15,
                letterSpacing: "0.02em",
                cursor: "pointer",
                transition: "all 0.25s",
                background: tab === t
                  ? (t === "encode" ? "linear-gradient(135deg,#7c5cbf,#5a3fa0)" : "linear-gradient(135deg,#0f9e7b,#00d4aa22)")
                  : "transparent",
                color: tab === t ? "#fff" : "var(--c-muted)",
                boxShadow: tab === t ? "0 2px 12px rgba(124,92,191,0.3)" : "none",
              }}>
                {t === "encode" ? "Hide message" : "Reveal message"}
              </button>
            ))}
          </div>

          {/* Main card */}
          <div className="fade-up" style={{
            background: "var(--c-surface)", border: "1px solid var(--c-border)",
            borderRadius: 20, padding: 32, display: "flex", flexDirection: "column", gap: 28,
          }}>

            <ImageDropZone
              image={image} preview={preview} capacity={capacity}
              onFile={handleFile} onClear={handleClear}
            />

            {tab === "encode" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <label style={{ fontSize: 13, color: "var(--c-muted)", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "var(--f-mono)" }}>
                    Secret message
                  </label>
                  {charsLeft !== null && (
                    <span style={{ fontSize: 12, fontFamily: "var(--f-mono)", color: charsLeft < 50 ? "#ef4444" : "var(--c-muted)" }}>
                      {charsLeft} chars remaining
                    </span>
                  )}
                </div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your secret message here..."
                  rows={5}
                  style={{
                    width: "100%", resize: "vertical",
                    background: "var(--c-surface2)", border: "1.5px solid var(--c-border)",
                    borderRadius: 10, padding: "14px 16px",
                    color: "var(--c-text)", fontSize: 15, lineHeight: 1.6,
                    fontFamily: "var(--f-display)",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => e.target.style.borderColor = "var(--c-accent)"}
                  onBlur={(e) => e.target.style.borderColor = "var(--c-border)"}
                />
              </div>
            )}

            <PasswordField value={password} onChange={setPassword}
              placeholder={tab === "encode" ? "Set a decryption password" : "Enter the decryption password"} />

            {/* Action button */}
            <button
              onClick={tab === "encode" ? handleEncode : handleDecode}
              disabled={loading}
              style={{
                width: "100%", padding: "16px 0",
                borderRadius: 12, border: "none",
                fontFamily: "var(--f-display)", fontWeight: 700, fontSize: 16,
                letterSpacing: "0.03em",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                background: loading
                  ? "var(--c-surface2)"
                  : tab === "encode"
                    ? "linear-gradient(135deg, #7c5cbf, #5a3fa0)"
                    : "linear-gradient(135deg, #0a7d60, #0f9e7b)",
                color: loading ? "var(--c-muted)" : "#fff",
                boxShadow: loading ? "none" : "0 4px 20px rgba(124,92,191,0.35)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: 16, height: 16, border: "2px solid var(--c-muted)",
                    borderTopColor: "var(--c-accent-soft)", borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                  }} />
                  Processing...
                </>
              ) : tab === "encode" ? (
                <><LockIcon /> Encrypt &amp; hide in image</>
              ) : (
                <><EyeIcon /> Extract &amp; decrypt message</>
              )}
            </button>

            {status && <StatusBox type={status.type} message={status.text} />}

            {decoded && (
              <div style={{
                background: "var(--c-surface2)",
                border: "1px solid var(--c-border)",
                borderRadius: 12, padding: 20,
              }}>
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  alignItems: "center", marginBottom: 12,
                }}>
                  <span style={{ fontSize: 12, color: "var(--c-teal)", fontFamily: "var(--f-mono)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    Decrypted message
                  </span>
                  <button onClick={() => navigator.clipboard.writeText(decoded)} style={{
                    background: "rgba(255,255,255,0.07)", border: "1px solid var(--c-border)",
                    borderRadius: 6, color: "var(--c-muted)", fontSize: 12,
                    padding: "4px 10px", cursor: "pointer", fontFamily: "var(--f-mono)",
                  }}>
                    Copy
                  </button>
                </div>
                <p style={{
                  color: "var(--c-text)", fontSize: 15, lineHeight: 1.7,
                  fontFamily: "var(--f-display)", wordBreak: "break-word", whiteSpace: "pre-wrap",
                }}>
                  {decoded}
                </p>
              </div>
            )}
          </div>

          {/* How it works strip */}
          <div className="fade-up" style={{ marginTop: 40, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            {[
              { step: "01", label: "AES-256 encrypt", desc: "Message encrypted with GCM mode before hiding" },
              { step: "02", label: "LSB encode",      desc: "Cipher bits replace least-significant pixel bits" },
              { step: "03", label: "PNG output",      desc: "Lossless format preserves every hidden bit intact" },
            ].map(({ step, label, desc }) => (
              <div key={step} style={{
                background: "var(--c-surface)", border: "1px solid var(--c-border)",
                borderRadius: 14, padding: 20,
              }}>
                <div style={{ fontSize: 11, fontFamily: "var(--f-mono)", color: "var(--c-accent-soft)", marginBottom: 8 }}>{step}</div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{label}</div>
                <div style={{ fontSize: 12, color: "var(--c-muted)", lineHeight: 1.6 }}>{desc}</div>
              </div>
            ))}
          </div>

          <p style={{ textAlign: "center", marginTop: 36, fontSize: 12, color: "var(--c-muted)", fontFamily: "var(--f-mono)" }}>
            StegoCrypt · BS Information Technology · University of Agriculture Faisalabad
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}
