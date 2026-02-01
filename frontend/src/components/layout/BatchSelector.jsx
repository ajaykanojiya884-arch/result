import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

export default function BatchSelector() {
  const { user } = useAuth();
  const [batches, setBatches] = useState([]);
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newBatchId, setNewBatchId] = useState("");

  const isAdmin = user && (user.role || "").toUpperCase() === "ADMIN";

  useEffect(() => {
    let mounted = true;
    async function fetchBatches() {
      if (!user) return;
      try {
        const res = await fetch("/admin/batches", {
          headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
        });
        if (!res.ok) throw new Error("Not allowed");
        const data = await res.json();
        if (!mounted) return;
        setBatches(data.batches || []);
        // `active_batch` may be a string or an object { batch_id, ... }
        setActive((data.active_batch && (data.active_batch.batch_id || data.active_batch)) || null);
      } catch (e) {
        // cannot fetch batches (likely not admin) — try to read cached active batch
        const cached = localStorage.getItem("active_batch");
        if (cached) setActive(cached);
      }
    }
    fetchBatches();
    return () => {
      mounted = false;
    };
  }, [user]);

  const handleChange = async (ev) => {
    const newBatch = ev.target.value;
    if (!newBatch) return;
    if (!window.confirm(`Switch active batch to ${newBatch}?`)) return;
    setLoading(true);
    try {
      const res = await fetch("/admin/batches/switch", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ batch_id: newBatch }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to switch batch");
      // notify and reload
      try {
        alert(`Active batch set to ${newBatch}`);
      } catch {}
      // cache for non-admin views
      localStorage.setItem("active_batch", newBatch);
      window.location.reload();
    } catch (e) {
      alert(e.message || "Failed to switch batch");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    const bid = (newBatchId || "").toString().trim();
    if (!bid) return alert("Enter batch id (e.g. 25-26)");
    try {
      setLoading(true);
      const res = await fetch("/admin/batches/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ batch_id: bid }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.details || "Failed to create batch");
      // Append created batch (may be object) to state
      setBatches((prev) => (prev || []).concat(data.batch || { batch_id: bid }));
      setNewBatchId("");
      alert(`Batch ${bid} created`);
    } catch (e) {
      alert(e.message || "Failed to create batch");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div style={{ marginLeft: 12, display: "flex", alignItems: "center", gap: 8 }}>
      {/* Searchable Select for Admins, Static Text for Users */}
      {isAdmin && batches.length > 0 ? (
        <select value={active || ""} onChange={handleChange} disabled={loading}>
          <option value="">Select batch</option>
          {batches.map((b) => (
            <option key={b.batch_id || b} value={b.batch_id || b}>
              {b.batch_id || b}
            </option>
          ))}
        </select>
      ) : (
        <div style={{ fontWeight: 600 }}>Batch: {active || "—"}</div>
      )}

      {/* Admin create form */}
      {isAdmin && (
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <input
            placeholder="new batch (e.g. 25-26)"
            value={newBatchId}
            onChange={(e) => setNewBatchId(e.target.value)}
            style={{ padding: 6, borderRadius: 4 }}
            disabled={loading}
          />
          <button onClick={handleCreate} disabled={loading || !newBatchId} style={{ padding: "6px 8px" }}>
            Create
          </button>
        </div>
      )}
    </div>
  );
}
