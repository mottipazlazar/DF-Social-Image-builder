import React, { useState, useEffect } from "react";
import App from "./dealflow-post-builder-v4";

// ─── Brand colors ───────────────────────────────────────────────────────────
const C = {
  PINE:   "#3F6B55",
  TAUPE:  "#635752",
  GOLD:   "#E5A94D",
  IVORY:  "#F6F4E3",
  LEMON:  "#FFFEF6",
  LIGHT:  "#EDE9DC",
};

// ─── Storage helpers ─────────────────────────────────────────────────────────
const USERS_KEY   = "dealflow_users";
const SESSION_KEY = "dealflow_session";

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function seedAdmin() {
  const users = getUsers();
  if (!users.find(u => u.username === "admin")) {
    saveUsers([{ username: "admin", password: "dealflow2024", role: "admin" }, ...users]);
  }
}

function getSession() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
  } catch {
    return null;
  }
}

function setSession(user) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

// ─── Shared UI atoms ─────────────────────────────────────────────────────────
const inputSt = {
  width: "100%",
  padding: "11px 14px",
  borderRadius: 10,
  border: `1.5px solid ${C.LIGHT}`,
  background: C.LEMON,
  color: C.TAUPE,
  fontSize: 14,
  fontFamily: "'DM Sans', Inter, sans-serif",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.2s",
};

function Input({ label, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 16 }}>
      {label && (
        <div style={{ fontSize: 11, fontWeight: 700, color: "#9A9087", textTransform: "uppercase", letterSpacing: "0.11em", marginBottom: 6 }}>
          {label}
        </div>
      )}
      <input
        {...props}
        style={{ ...inputSt, borderColor: focused ? C.PINE : C.LIGHT, ...props.style }}
        onFocus={e => { setFocused(true); props.onFocus && props.onFocus(e); }}
        onBlur={e => { setFocused(false); props.onBlur && props.onBlur(e); }}
      />
    </div>
  );
}

function Btn({ children, variant = "primary", style, ...props }) {
  const base = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: "11px 22px",
    borderRadius: 10,
    border: "none",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
    fontFamily: "'DM Sans', Inter, sans-serif",
    transition: "opacity 0.15s, transform 0.1s",
    userSelect: "none",
  };
  const variants = {
    primary:   { background: C.PINE,  color: "#fff" },
    danger:    { background: "#C0392B", color: "#fff" },
    ghost:     { background: "transparent", color: C.TAUPE, border: `1.5px solid ${C.LIGHT}` },
    gold:      { background: C.GOLD, color: "#fff" },
  };
  return (
    <button
      {...props}
      style={{ ...base, ...variants[variant], ...style }}
      onMouseDown={e => { e.currentTarget.style.transform = "scale(0.97)"; }}
      onMouseUp={e => { e.currentTarget.style.transform = "scale(1)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
    >
      {children}
    </button>
  );
}

// ─── Login Screen ─────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      const users = getUsers();
      const user  = users.find(u => u.username === username && u.password === password);
      if (user) {
        setSession(user);
        onLogin(user);
      } else {
        setError("Invalid username or password.");
      }
      setLoading(false);
    }, 300);
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(145deg, ${C.LEMON} 0%, ${C.IVORY} 60%, #EDE0C8 100%)`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'DM Sans', Inter, sans-serif",
    }}>
      {/* Decorative bg shapes */}
      <div style={{ position: "fixed", top: -120, right: -120, width: 400, height: 400, borderRadius: "50%", background: `${C.GOLD}18`, pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: -80, left: -80, width: 300, height: 300, borderRadius: "50%", background: `${C.PINE}12`, pointerEvents: "none" }} />

      <div style={{
        background: "#fff",
        borderRadius: 20,
        padding: "48px 44px",
        width: "100%",
        maxWidth: 420,
        boxShadow: "0 8px 48px rgba(63,107,85,0.13), 0 2px 12px rgba(0,0,0,0.06)",
        position: "relative",
      }}>
        {/* Logo / brand mark */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 56,
            height: 56,
            borderRadius: 16,
            background: `linear-gradient(135deg, ${C.PINE} 0%, #2F5240 100%)`,
            marginBottom: 16,
            boxShadow: `0 4px 16px ${C.PINE}40`,
          }}>
            <span style={{ color: C.GOLD, fontSize: 26, fontWeight: 900, fontFamily: "serif" }}>D</span>
          </div>
          <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 26, fontWeight: 700, color: C.TAUPE, lineHeight: 1.1 }}>
            DealFlow OH
          </div>
          <div style={{ fontSize: 12, color: "#9A9087", marginTop: 4, letterSpacing: "0.06em" }}>Post Builder — Sign In</div>
        </div>

        <form onSubmit={handleSubmit}>
          <Input
            label="Username"
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Enter username"
            autoComplete="username"
            autoFocus
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter password"
            autoComplete="current-password"
          />

          {error && (
            <div style={{ background: "#FDF0EF", border: "1px solid #F5C6C2", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#B5332A", marginBottom: 16 }}>
              {error}
            </div>
          )}

          <Btn type="submit" style={{ width: "100%", padding: "13px 22px", borderRadius: 12, fontSize: 15 }} disabled={loading}>
            {loading ? "Signing in…" : "Sign In"}
          </Btn>
        </form>

        <div style={{ marginTop: 20, textAlign: "center", fontSize: 11, color: "#BDB6AE" }}>
          Contact admin to create or update your account.
        </div>
      </div>
    </div>
  );
}

// ─── User Management Modal ────────────────────────────────────────────────────
function UserManagementModal({ currentUser, onClose }) {
  const [users, setUsers]       = useState(getUsers());
  const [tab, setTab]           = useState("list"); // "list" | "add"
  const [editingUser, setEditing] = useState(null); // user object being edited
  const [form, setForm]         = useState({ username: "", password: "", role: "user" });
  const [msg, setMsg]           = useState("");
  const [error, setError]       = useState("");

  function refresh() { setUsers(getUsers()); }

  function showMsg(m) {
    setMsg(m); setTimeout(() => setMsg(""), 2500);
  }
  function showErr(m) {
    setError(m); setTimeout(() => setError(""), 3000);
  }

  function handleAdd(e) {
    e.preventDefault();
    const all = getUsers();
    if (!form.username.trim() || !form.password.trim()) { showErr("Username and password required."); return; }
    if (all.find(u => u.username === form.username.trim())) { showErr("Username already exists."); return; }
    const newUser = { username: form.username.trim(), password: form.password, role: form.role };
    saveUsers([...all, newUser]);
    refresh();
    setForm({ username: "", password: "", role: "user" });
    setTab("list");
    showMsg(`User "${newUser.username}" added.`);
  }

  function handleSaveEdit(e) {
    e.preventDefault();
    if (!form.username.trim() || !form.password.trim()) { showErr("Username and password required."); return; }
    const all = getUsers();
    const conflict = all.find(u => u.username === form.username.trim() && u.username !== editingUser.username);
    if (conflict) { showErr("Username already taken."); return; }
    const updated = all.map(u =>
      u.username === editingUser.username
        ? { ...u, username: form.username.trim(), password: form.password, role: form.role }
        : u
    );
    saveUsers(updated);
    refresh();
    setEditing(null);
    setTab("list");
    showMsg("User updated.");
  }

  function startEdit(user) {
    setEditing(user);
    setForm({ username: user.username, password: user.password, role: user.role });
    setTab("edit");
  }

  function handleDelete(username) {
    if (username === currentUser.username) { showErr("You cannot delete your own account."); return; }
    if (!window.confirm(`Delete user "${username}"?`)) return;
    saveUsers(getUsers().filter(u => u.username !== username));
    refresh();
    showMsg(`User "${username}" deleted.`);
  }

  const isEditOrAdd = tab === "add" || tab === "edit";

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(30,24,18,0.45)", zIndex: 9999,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'DM Sans', Inter, sans-serif",
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background: "#fff",
        borderRadius: 20,
        width: "100%",
        maxWidth: 520,
        maxHeight: "85vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
      }}>
        {/* Header */}
        <div style={{
          background: `linear-gradient(135deg, ${C.PINE} 0%, #2F5240 100%)`,
          padding: "22px 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <div>
            <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 22, fontWeight: 700, color: "#fff" }}>
              User Management
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", marginTop: 2 }}>
              {users.length} user{users.length !== 1 ? "s" : ""}
            </div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", borderRadius: 8, width: 34, height: 34, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex", borderBottom: `1px solid ${C.LIGHT}`, background: C.LEMON }}>
          {[
            { key: "list", label: "All Users" },
            { key: "add",  label: "+ Add User" },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setEditing(null); setForm({ username: "", password: "", role: "user" }); }}
              style={{
                flex: 1,
                padding: "13px 0",
                border: "none",
                background: "transparent",
                fontFamily: "'DM Sans', Inter, sans-serif",
                fontSize: 13,
                fontWeight: 600,
                color: tab === t.key ? C.PINE : "#9A9087",
                borderBottom: tab === t.key ? `2px solid ${C.PINE}` : "2px solid transparent",
                cursor: "pointer",
                transition: "color 0.15s",
              }}
            >
              {t.label}
            </button>
          ))}
          {tab === "edit" && (
            <button style={{ flex: 1, padding: "13px 0", border: "none", background: "transparent", fontFamily: "'DM Sans', Inter, sans-serif", fontSize: 13, fontWeight: 600, color: C.GOLD, borderBottom: `2px solid ${C.GOLD}`, cursor: "default" }}>
              Edit User
            </button>
          )}
        </div>

        {/* Feedback */}
        {(msg || error) && (
          <div style={{
            margin: "12px 20px 0",
            padding: "10px 14px",
            borderRadius: 8,
            background: msg ? "#EFF7F2" : "#FDF0EF",
            border: `1px solid ${msg ? "#A8D5BC" : "#F5C6C2"}`,
            color: msg ? "#2F6B4A" : "#B5332A",
            fontSize: 13,
          }}>
            {msg || error}
          </div>
        )}

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 28px" }}>
          {/* USER LIST */}
          {tab === "list" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {users.length === 0 && (
                <div style={{ textAlign: "center", color: "#9A9087", padding: "40px 0", fontSize: 14 }}>No users found.</div>
              )}
              {users.map(user => (
                <div key={user.username} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "14px 16px",
                  borderRadius: 12,
                  background: C.LEMON,
                  border: `1px solid ${C.LIGHT}`,
                }}>
                  <div style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: user.role === "admin" ? `linear-gradient(135deg, ${C.PINE}, #2F5240)` : `linear-gradient(135deg, #C8BEB5, #A09690)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 16,
                    flexShrink: 0,
                  }}>
                    {user.username[0].toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: C.TAUPE, fontSize: 14 }}>{user.username}</div>
                    <div style={{ fontSize: 11, color: "#9A9087", marginTop: 2, textTransform: "uppercase", letterSpacing: "0.08em" }}>{user.role}</div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Btn variant="ghost" style={{ padding: "7px 14px", fontSize: 12, borderRadius: 8 }} onClick={() => startEdit(user)}>
                      Edit
                    </Btn>
                    <Btn variant="danger" style={{ padding: "7px 14px", fontSize: 12, borderRadius: 8 }} onClick={() => handleDelete(user.username)}>
                      Delete
                    </Btn>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ADD / EDIT FORM */}
          {isEditOrAdd && (
            <form onSubmit={tab === "edit" ? handleSaveEdit : handleAdd}>
              <Input
                label="Username"
                type="text"
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                placeholder="Enter username"
                autoFocus
              />
              <Input
                label="Password"
                type="text"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="Enter password"
              />
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#9A9087", textTransform: "uppercase", letterSpacing: "0.11em", marginBottom: 8 }}>Role</div>
                <div style={{ display: "flex", gap: 10 }}>
                  {["user", "admin"].map(role => (
                    <label key={role} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                      <input
                        type="radio"
                        name="role"
                        value={role}
                        checked={form.role === role}
                        onChange={() => setForm(f => ({ ...f, role }))}
                        style={{ accentColor: C.PINE }}
                      />
                      <span style={{ fontSize: 13, color: C.TAUPE, textTransform: "capitalize" }}>{role}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <Btn type="submit" style={{ flex: 1 }}>
                  {tab === "edit" ? "Save Changes" : "Add User"}
                </Btn>
                <Btn
                  type="button"
                  variant="ghost"
                  onClick={() => { setTab("list"); setEditing(null); }}
                  style={{ flex: 1 }}
                >
                  Cancel
                </Btn>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Top bar for logged-in state ──────────────────────────────────────────────
function TopBar({ user, onLogout, onManageUsers }) {
  return (
    <div style={{
      position: "fixed",
      top: 0,
      right: 0,
      zIndex: 1000,
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "10px 18px",
    }}>
      {user.role === "admin" && (
        <Btn variant="ghost" style={{ padding: "7px 14px", fontSize: 12, borderRadius: 9 }} onClick={onManageUsers}>
          Manage Users
        </Btn>
      )}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(6px)",
        borderRadius: 10,
        padding: "7px 12px",
        border: `1px solid ${C.LIGHT}`,
        fontSize: 13,
        color: C.TAUPE,
        fontFamily: "'DM Sans', Inter, sans-serif",
      }}>
        <div style={{
          width: 26,
          height: 26,
          borderRadius: 8,
          background: user.role === "admin" ? C.PINE : "#A09690",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          fontSize: 13,
        }}>
          {user.username[0].toUpperCase()}
        </div>
        <span style={{ fontWeight: 600 }}>{user.username}</span>
        {user.role === "admin" && (
          <span style={{ background: C.GOLD, color: "#fff", fontSize: 9, fontWeight: 700, borderRadius: 4, padding: "2px 5px", letterSpacing: "0.06em", textTransform: "uppercase" }}>admin</span>
        )}
      </div>
      <Btn variant="ghost" style={{ padding: "7px 14px", fontSize: 12, borderRadius: 9 }} onClick={onLogout}>
        Sign out
      </Btn>
    </div>
  );
}

// ─── Root AuthApp ─────────────────────────────────────────────────────────────
export default function AuthApp() {
  const [user, setUser]           = useState(null);
  const [ready, setReady]         = useState(false);
  const [showUserMgmt, setShowUserMgmt] = useState(false);

  useEffect(() => {
    seedAdmin();
    const session = getSession();
    if (session) {
      // Validate session user still exists
      const users = getUsers();
      const stillExists = users.find(u => u.username === session.username && u.password === session.password);
      if (stillExists) setUser(stillExists);
    }
    setReady(true);
  }, []);

  function handleLogin(u) {
    setUser(u);
  }

  function handleLogout() {
    clearSession();
    setUser(null);
    setShowUserMgmt(false);
  }

  if (!ready) return null;

  if (!user) return <LoginScreen onLogin={handleLogin} />;

  return (
    <>
      <TopBar
        user={user}
        onLogout={handleLogout}
        onManageUsers={() => setShowUserMgmt(true)}
      />
      {showUserMgmt && (
        <UserManagementModal
          currentUser={user}
          onClose={() => setShowUserMgmt(false)}
        />
      )}
      <App />
    </>
  );
}
