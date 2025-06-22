"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

export default function SharePage() {
  const { id } = useParams();
  const [passcode, setPasscode] = useState("");
  const [fileUrls, setFileUrls] = useState<string[] | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    const res = await fetch(`/api/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, passcode }),
    });

    const result = await res.json();
    if (res.ok) {
      setFileUrls(result.fileUrls);
      setError("");
    } else {
      setError(result.error || "Access denied");
    }
  };

  return (
    <main style={{ padding: "2rem" }}>
      <h1>Enter Passcode to Access Files</h1>
      <input
        type="password"
        placeholder="Passcode"
        value={passcode}
        onChange={(e) => setPasscode(e.target.value)}
      />
      <button onClick={handleSubmit} style={{ marginLeft: "1rem" }}>
        Submit
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {fileUrls && (
        <div style={{ marginTop: "1rem" }}>
          <h2>Download Links:</h2>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "1rem",
              marginTop: "1rem",
            }}
          >
            {fileUrls.map((url, idx) => {
              const isImage = url.match(/\.(jpg|jpeg|png|gif)$/i);
              const isVideo = url.match(/\.(mp4|webm|ogg)$/i);

              return (
                <div key={idx} style={{ maxWidth: "300px" }}>
                  {isImage && (
                    <img
                      src={url}
                      alt={`file-${idx}`}
                      style={{ width: "100%" }}
                    />
                  )}
                  {isVideo && (
                    <video controls style={{ width: "100%" }}>
                      <source src={url} type="video/mp4" />
                      Your browser does not support video playback.
                    </video>
                  )}
                  {!isImage && !isVideo && (
                    <a href={url} target="_blank">
                      Download File {idx + 1}
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </main>
  );
}
