"use client";
import { useState } from "react";

export function LocalModelPreview({ html, model }: { html: string; model: string }) {
  const [replay, setReplay] = useState(0);
  // Model code is untrusted: no scripts, network, forms, navigation or same-origin access.
  const policy = '<meta http-equiv="Content-Security-Policy" content="default-src \'none\'; style-src \'unsafe-inline\'; img-src data:; base-uri \'none\'; form-action \'none\'">';
  return <div>
    <iframe key={replay} title={`Illustration originale de ${model}`} sandbox="" referrerPolicy="no-referrer" srcDoc={policy + html} style={{ width: "100%", aspectRatio: "16 / 9", border: "1px solid #465449", borderRadius: 14, background: "#fff", display: "block" }} />
    <button onClick={() => setReplay(value => value + 1)} style={{ marginTop: 12, padding: "10px 18px", borderRadius: 20, border: "1px solid #465449", background: "#253027", color: "#eef5e9", cursor: "pointer" }}>↻ Rejouer l’animation</button>
    <details style={{ marginTop: 16 }}><summary>Code original du modèle</summary><pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", fontSize: 12 }}>{html}</pre></details>
  </div>;
}
