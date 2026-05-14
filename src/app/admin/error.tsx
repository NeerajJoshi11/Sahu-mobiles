"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div style={{ padding: "3rem", textAlign: "center" }}>
      <h2 style={{ color: "#ef4444" }}>Something went wrong in the Admin Panel!</h2>
      <p style={{ margin: "1rem 0", color: "#666" }}>{error.message}</p>
      <button
        onClick={() => reset()}
        className="btn btn-primary"
      >
        Try again
      </button>
    </div>
  );
}
