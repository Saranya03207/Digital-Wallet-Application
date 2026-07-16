import React, { useEffect, useState } from "react";

// Helper to dynamically load jsQR script without requiring node_modules installation
export const getJsQR = () => {
  return new Promise((resolve) => {
    if (window.jsQR) {
      resolve(window.jsQR);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js";
    script.onload = () => {
      resolve(window.jsQR);
    };
    script.onerror = () => {
      console.error("Failed to load jsQR CDN");
      resolve(null);
    };
    document.head.appendChild(script);
  });
};

// Component that renders a real, scannable QR code image
export const QRCodeSVG = ({ value, size = 180 }) => {
  const [loaded, setLoaded] = useState(false);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value || "")}&margin=10`;

  return (
    <div style={{ width: `${size}px`, height: `${size}px`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
      {!loaded && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", fontSize: "12px", fontWeight: 600 }}>
          Generating QR...
        </div>
      )}
      <img
        id="user-qr-code-img"
        src={qrUrl}
        alt="Payment QR Code"
        crossOrigin="anonymous"
        onLoad={() => setLoaded(true)}
        style={{ width: "100%", height: "100%", objectFit: "contain", opacity: loaded ? 1 : 0, transition: "opacity 0.2s" }}
      />
    </div>
  );
};
