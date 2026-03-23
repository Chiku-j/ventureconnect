"use client";
import { useState, useEffect, useCallback } from "react";
import { Bell, X, CheckCheck } from "lucide-react";

interface Notification {
  id: string;
  message: string;
  targetRole: "startup" | "vc";
  read: boolean;
  createdAt: string;
}

export default function NotificationPanel({ role }: { role: "startup" | "vc" }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const fetchNotifications = useCallback(async () => {
    const res = await fetch(`/api/notifications?role=${role}`);
    const data = await res.json();
    setNotifications(data.notifications || []);
  }, [role]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const unread = notifications.filter((n) => !n.read).length;

  const markAll = async () => {
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "markAllRead", role }),
    });
    fetchNotifications();
  };

  const markOne = async (id: string) => {
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "markRead", id }),
    });
    fetchNotifications();
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        className="btn-ghost"
        style={{ position: "relative", padding: "8px", borderRadius: "8px" }}
      >
        <Bell size={18} />
        {unread > 0 && (
          <span
            style={{
              position: "absolute",
              top: 4,
              right: 4,
              width: 16,
              height: 16,
              borderRadius: "50%",
              background: "#ef4444",
              color: "white",
              fontSize: 10,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              lineHeight: 1,
            }}
          >
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className="fade-slide-up"
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 8px)",
            width: 340,
            background: "#18181f",
            border: "1px solid #2a2a38",
            borderRadius: 12,
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            zIndex: 100,
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: "1px solid #2a2a38" }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>Notifications</span>
            <div style={{ display: "flex", gap: 8 }}>
              {unread > 0 && (
                <button onClick={markAll} className="btn-ghost" style={{ padding: "4px 8px", fontSize: 12, gap: 4 }}>
                  <CheckCheck size={13} /> Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="btn-ghost" style={{ padding: 4 }}>
                <X size={16} />
              </button>
            </div>
          </div>

          {/* List */}
          <div style={{ maxHeight: 320, overflowY: "auto" }}>
            {notifications.length === 0 ? (
              <div style={{ padding: 24, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
                No notifications yet
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markOne(n.id)}
                  style={{
                    display: "flex",
                    gap: 10,
                    padding: "12px 16px",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                    cursor: "pointer",
                    background: n.read ? "transparent" : "rgba(99,102,241,0.06)",
                    transition: "background 0.15s",
                  }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: n.read ? "transparent" : "#6366f1",
                      marginTop: 5,
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <p style={{ fontSize: 13, color: n.read ? "var(--text-secondary)" : "var(--text-primary)", margin: 0, lineHeight: 1.5 }}>
                      {n.message}
                    </p>
                    <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "4px 0 0" }}>
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
