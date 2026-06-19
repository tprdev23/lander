"use client";

import { useState } from "react";

export default function TestPage() {
  const [reply, setReply] = useState("");

  async function sendTest() {
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: "Say hello in one short sentence" }),
    });

    const data = await res.json();
    setReply(data.reply);
  }

  return (
    <div style={{ padding: 20 }}>
      <button onClick={sendTest}>Test AI</button>
      <p>{reply}</p>
    </div>
  );
}
