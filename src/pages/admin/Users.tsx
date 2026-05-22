import { useState, useEffect } from "react";
import { Check, X } from "lucide-react";
import { adminListUsers, type AdminUser } from "../../lib/admin-api";

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const limit = 25;

  useEffect(() => {
    adminListUsers(limit, page * limit)
      .then(d => { setUsers(d.users || []); setTotal(d.total ?? 0); })
      .catch(() => {});
  }, [page]);

  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em", margin: 0 }}>Users</h1>
          <p style={{ fontSize: 13, color: "var(--muted)", margin: "4px 0 0" }}>{total} registered users</p>
        </div>
      </div>

      <div className="flat-card" style={{ overflow: "hidden", padding: 0 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 100px 180px", padding: "10px 16px", borderBottom: "1px solid var(--line)", background: "oklch(0.12 0.012 235)" }}>
          <span className="font-mono" style={{ fontSize: 10, color: "var(--muted-2)" }}>USERNAME</span>
          <span className="font-mono" style={{ fontSize: 10, color: "var(--muted-2)" }}>EMAIL</span>
          <span className="font-mono" style={{ fontSize: 10, color: "var(--muted-2)" }}>VERIFIED</span>
          <span className="font-mono" style={{ fontSize: 10, color: "var(--muted-2)" }}>CREATED</span>
        </div>
        {users.map(u => (
          <div key={u.user_id} style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 100px 180px", padding: "12px 16px", borderBottom: "1px solid var(--line)", alignItems: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 500 }}>{u.username}</span>
            <span className="font-mono" style={{ fontSize: 12, color: "var(--fg-2)" }}>{u.email}</span>
            <span>
              {u.email_verified
                ? <span className="pill pill-ok" style={{ fontSize: 9 }}><Check size={10} /> Yes</span>
                : <span className="pill pill-warn" style={{ fontSize: 9 }}><X size={10} /> No</span>
              }
            </span>
            <span style={{ fontSize: 12, color: "var(--muted)" }}>{new Date(u.created_at).toLocaleDateString()}</span>
          </div>
        ))}
      </div>

      {total > limit && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button className="btn btn-ghost" disabled={page === 0} onClick={() => setPage(p => p - 1)} style={{ fontSize: 12 }}>Previous</button>
          <span className="font-mono" style={{ fontSize: 11, color: "var(--muted)" }}>
            {page * limit + 1}–{Math.min((page + 1) * limit, total)} of {total}
          </span>
          <button className="btn btn-ghost" disabled={(page + 1) * limit >= total} onClick={() => setPage(p => p + 1)} style={{ fontSize: 12 }}>Next</button>
        </div>
      )}
    </div>
  );
}
