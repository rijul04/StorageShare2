"use client";

import { useState } from "react";

export default function Home() {
  const [files, setFiles] = useState<FileList | null>(null);
  const [passcode, setPasscode] = useState("");
  const [shareLink, setShareLink] = useState("");
  const [message, setMessage] = useState("");

  const handleUpload = async () => {
    if (!files || files.length === 0 || !passcode) {
      setMessage("Please select files and enter a passcode.");
      return;
    }

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }
    formData.append("passcode", passcode);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const result = await res.json();
    if (res.ok) {
      setShareLink(`${window.location.origin}/share/${result.id}`);
    } else {
      setMessage(`❌ Upload failed: ${result.error}`);
    }
  };

  return (
    <main style={{ padding: "2rem" }}>
      <h1>SimpleShare Upload</h1>
      <input type="file" multiple onChange={(e) => setFiles(e.target.files)} />
      <input
        type="text"
        placeholder="Enter a passcode"
        value={passcode}
        onChange={(e) => setPasscode(e.target.value)}
        style={{ display: "block", marginTop: "1rem" }}
      />
      <button onClick={handleUpload} style={{ marginTop: "1rem" }}>
        Upload & Share
      </button>

      {shareLink && (
        <p style={{ marginTop: "1rem" }}>
          ✅ Share this link: <a href={shareLink}>{shareLink}</a>
        </p>
      )}
      {message && <p>{message}</p>}
    </main>
  );
}
