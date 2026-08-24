import React, { useState, useEffect, useRef, useCallback, createContext, useContext, useMemo } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, AreaChart, Area, Cell,
} from "recharts";
import {
  Hand, LogIn, LayoutDashboard, Camera, FileText, Award, Users, Bell,
  Settings, ChevronRight, ChevronLeft, CheckCircle2, XCircle, AlertTriangle,
  Loader2, Download, TrendingUp, TrendingDown, Play, RotateCcw, LogOut,
  Shield, GraduationCap, UserCog, X, RefreshCw, WifiOff, Sparkles, Video,
  VideoOff, Minus, ClipboardList, BarChart3, BellRing, CircleDot,
} from "lucide-react";

/* =========================================================================
   DESIGN TOKENS
   ========================================================================= */

const THEME = {
  ink: "#1C1B29",
  inkSoft: "#312F45",
  paper: "#FAF8F3",
  paperAlt: "#F1EDE3",
  card: "#FFFFFF",
  gold: "#E8A33D",
  goldSoft: "#F6DCA9",
  plum: "#5B3A6E",
  plumSoft: "#E9DCEF",
  teal: "#2F8F82",
  tealSoft: "#D9EDE9",
  success: "#3FA37A",
  successSoft: "#DCF0E4",
  danger: "#D6455B",
  dangerSoft: "#FBDFE3",
  line: "#E4DECD",
  muted: "#7A7568",
};

const FONT_DISPLAY = "'Space Grotesk', sans-serif";
const FONT_BODY = "'Inter', sans-serif";
const FONT_MONO = "'IBM Plex Mono', monospace";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const ROLES = [
  { id: "learner", label: "Learner", icon: GraduationCap, desc: "Practice, track progress, certify" },
  { id: "instructor", label: "Instructor", icon: Users, desc: "Monitor students & assessments" },
  { id: "trainer", label: "Accessibility Trainer", icon: Shield, desc: "Engagement & certification analytics" },
  { id: "admin", label: "Administrator", icon: UserCog, desc: "Users, content & platform stats" },
];

const CERT_LEVELS = [
  { id: "beginner", label: "Beginner", min: 0, color: THEME.muted },
  { id: "intermediate", label: "Intermediate", min: 60, color: THEME.teal },
  { id: "advanced", label: "Advanced", min: 78, color: THEME.plum },
  { id: "professional", label: "Professional", min: 92, color: THEME.gold },
];

function GlobalStyle() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
      .sp-root, .sp-root * { box-sizing: border-box; }
      .sp-root { font-family: ${FONT_BODY}; color: ${THEME.ink}; background: ${THEME.paper}; }
      .sp-display { font-family: ${FONT_DISPLAY}; letter-spacing: -0.01em; }
      .sp-mono { font-family: ${FONT_MONO}; }
      .sp-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
      .sp-scrollbar::-webkit-scrollbar-thumb { background: ${THEME.line}; border-radius: 8px; }
      .sp-focus:focus-visible { outline: 2px solid ${THEME.teal}; outline-offset: 2px; }
      button, [role="button"] { cursor: pointer; }
      .sp-fade-in { animation: spFadeIn .35s ease both; }
      @keyframes spFadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
      @media (prefers-reduced-motion: reduce) { .sp-fade-in { animation: none; } }
      .sp-skeleton-dot { animation: spPulse 1.6s ease-in-out infinite; }
      @keyframes spPulse { 0%,100% { opacity: .25; } 50% { opacity: 1; } }
      .sp-scroll { overflow-y: auto; }
    `}</style>
  );
}

function HandLandmark({ size = 64, color = THEME.gold, active = false }) {
  const pts = [
    [32, 58], [26, 46], [22, 34], [20, 24], [18, 16],
    [30, 40], [29, 24], [28, 12], [27, 4],
    [34, 38], [34, 20], [34, 6], [34, -4],
    [38, 40], [39, 24], [40, 12], [41, 3],
    [42, 44], [44, 32], [46, 24], [47, 17],
  ].map(([x, y]) => [x, y + 6]);
  const bones = [
    [0, 1], [1, 2], [2, 3], [3, 4],
    [0, 5], [5, 6], [6, 7], [7, 8],
    [0, 9], [9, 10], [10, 11], [11, 12],
    [0, 13], [13, 14], [14, 15], [15, 16],
    [0, 17], [17, 18], [18, 19], [19, 20],
    [5, 9], [9, 13], [13, 17],
  ];
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      {bones.map(([a, b], i) => (
        <line key={i} x1={pts[a][0]} y1={pts[a][1]} x2={pts[b][0]} y2={pts[b][1]}
          stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity={active ? 0.9 : 0.45} />
      ))}
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i === 0 ? 3 : 2} fill={color}
          className={active ? "" : "sp-skeleton-dot"}
          style={{ animationDelay: `${i * 60}ms` }} opacity={active ? 1 : 0.8} />
      ))}
    </svg>
  );
}

const ApiContext = createContext(null);
function useApiBase() {
  return useContext(ApiContext);
}

function useApi() {
  const { apiBase } = useApiBase();
  const request = useCallback(async (path, opts = {}) => {
    try {
      const isForm = opts.body instanceof FormData;
      const res = await fetch(`${apiBase}${path}`, {
        headers: isForm ? undefined : { "Content-Type": "application/json", ...(opts.headers || {}) },
        ...opts,
      });
      const ct = res.headers.get("content-type") || "";
      let data = null;
      if (ct.includes("application/json")) data = await res.json();
      else if (ct.includes("text/")) data = await res.text();
      else data = await res.blob();

      if (!res.ok) {
        const msg = (data && (data.message || data.error_code)) || `Request failed — HTTP ${res.status}`;
        return { ok: false, status: res.status, error: msg };
      }
      return { ok: true, status: res.status, data };
    } catch (err) {
      return { ok: false, status: 0, error: "Can't reach the backend. Check that the API is running and the base URL is correct." };
    }
  }, [apiBase]);
  return request;
}

const NotificationContext = createContext(null);
function useNotify() {
  return useContext(NotificationContext);
}
function NotificationProvider({ children }) {
  const [items, setItems] = useState([]);
  const push = useCallback((type, title, body) => {
    setItems((prev) => [
      { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, type, title, body, time: new Date(), read: false },
      ...prev,
    ].slice(0, 30));
  }, []);
  const markAllRead = useCallback(() => setItems((prev) => prev.map((n) => ({ ...n, read: true }))), []);
  const unread = items.filter((n) => !n.read).length;
  return (
    <NotificationContext.Provider value={{ items, push, markAllRead, unread }}>
      {children}
    </NotificationContext.Provider>
  );
}

function Btn({ children, variant = "primary", size = "md", icon: Icon, onClick, disabled, type = "button", full }) {
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2.5 text-sm", lg: "px-6 py-3.5 text-base" };
  const styles = {
    primary: { background: THEME.ink, color: THEME.paper },
    accent: { background: THEME.gold, color: THEME.ink },
    outline: { background: "transparent", color: THEME.ink, border: `1.5px solid ${THEME.ink}` },
    ghost: { background: "transparent", color: THEME.ink },
    danger: { background: THEME.danger, color: "#fff" },
    subtle: { background: THEME.paperAlt, color: THEME.ink },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`sp-focus ${sizes[size]} ${full ? "w-full" : ""} rounded-lg font-medium inline-flex items-center justify-center gap-2 transition-opacity hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed`}
      style={styles[variant]}>
      {Icon && <Icon size={size === "lg" ? 18 : 15} />}
      {children}
    </button>
  );
}

function Card({ children, className = "", style = {}, padded = true }) {
  return (
    <div className={`sp-fade-in rounded-2xl ${padded ? "p-5" : ""} ${className}`}
      style={{ background: THEME.card, border: `1px solid ${THEME.line}`, ...style }}>
      {children}
    </div>
  );
}

function Badge({ children, tone = "muted" }) {
  const tones = {
    muted: { background: THEME.paperAlt, color: THEME.muted },
    success: { background: THEME.successSoft, color: THEME.success },
    danger: { background: THEME.dangerSoft, color: THEME.danger },
    gold: { background: THEME.goldSoft, color: "#8A5A0F" },
    plum: { background: THEME.plumSoft, color: THEME.plum },
    teal: { background: THEME.tealSoft, color: THEME.teal },
  };
  return (
    <span className="sp-mono inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium" style={tones[tone]}>
      {children}
    </span>
  );
}

function SectionEyebrow({ children }) {
  return (
    <div className="sp-mono flex items-center gap-2 text-[11px] uppercase tracking-widest mb-2" style={{ color: THEME.muted }}>
      <span style={{ width: 16, height: 1, background: THEME.gold, display: "inline-block" }} />
      {children}
    </div>
  );
}

function LoadingBlock({ label = "Loading" }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 gap-3 text-center">
      <HandLandmark size={56} color={THEME.teal} />
      <p className="sp-mono text-xs" style={{ color: THEME.muted }}>{label}…</p>
    </div>
  );
}

function ErrorBlock({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 gap-3 text-center px-6">
      <div className="rounded-full p-3" style={{ background: THEME.dangerSoft }}>
        <WifiOff size={22} color={THEME.danger} />
      </div>
      <p className="text-sm font-medium max-w-sm">{message}</p>
      {onRetry && <Btn variant="outline" size="sm" icon={RefreshCw} onClick={onRetry}>Try again</Btn>}
    </div>
  );
}

function EmptyBlock({ title, body }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 gap-3 text-center px-6">
      <HandLandmark size={56} color={THEME.muted} active />
      <p className="font-semibold text-sm">{title}</p>
      {body && <p className="text-xs max-w-sm" style={{ color: THEME.muted }}>{body}</p>}
    </div>
  );
}

function useAsync(fetcher, deps = []) {
  const [state, setState] = useState("loading");
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const load = useCallback(async () => {
    setState("loading");
    const res = await fetcher();
    if (res.ok) { setData(res.data); setState("ready"); }
    else { setError(res.error); setState("error"); }
  }, deps);
  useEffect(() => { load(); }, [load]);
  return { state, data, error, reload: load };
}

function StatCard({ label, value, sub, icon: Icon, tone = "ink" }) {
  const tones = { ink: THEME.ink, gold: "#8A5A0F", teal: THEME.teal, plum: THEME.plum, danger: THEME.danger, success: THEME.success };
  return (
    <Card className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium" style={{ color: THEME.muted }}>{label}</span>
        {Icon && <Icon size={15} color={tones[tone]} />}
      </div>
      <div className="sp-display text-2xl font-semibold" style={{ color: tones[tone] }}>{value}</div>
      {sub && <span className="text-[11px]" style={{ color: THEME.muted }}>{sub}</span>}
    </Card>
  );
}

const NAV_BY_ROLE = {
  learner: [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "practice", label: "Practice", icon: Camera },
    { id: "reports", label: "Reports", icon: FileText },
    { id: "certification", label: "Certification", icon: Award },
  ],
  instructor: [
    { id: "instructor", label: "Students", icon: Users },
  ],
  trainer: [
    { id: "trainer", label: "Accessibility Analytics", icon: Shield },
  ],
  admin: [
    { id: "admin", label: "Platform Admin", icon: UserCog },
  ],
};

function Shell({ user, onLogout, view, setView, children }) {
  const notify = useNotify();
  const [showNotif, setShowNotif] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const nav = NAV_BY_ROLE[user.role] || [];
  const roleMeta = ROLES.find((r) => r.id === user.role);

  return (
    <div className="sp-root min-h-screen flex">
      <GlobalStyle />
      <aside className="hidden md:flex flex-col justify-between w-60 shrink-0 px-4 py-6"
        style={{ background: THEME.ink, color: THEME.paper }}>
        <div>
          <div className="flex items-center gap-2 px-2 mb-8">
            <HandLandmark size={30} color={THEME.gold} active />
            <span className="sp-display text-lg font-semibold">SignPath</span>
          </div>
          <nav className="flex flex-col gap-1">
            {nav.map((item) => {
              const Icon = item.icon;
              const activeItem = view === item.id;
              return (
                <button key={item.id} onClick={() => setView(item.id)}
                  className="sp-focus flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-colors"
                  style={{ background: activeItem ? "rgba(232,163,61,0.16)" : "transparent", color: activeItem ? THEME.gold : "rgba(250,248,243,0.75)" }}>
                  <Icon size={16} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
        <div className="flex flex-col gap-1 px-2">
          <button onClick={() => setShowSettings(true)} className="sp-focus flex items-center gap-2 text-xs py-2 rounded-lg" style={{ color: "rgba(250,248,243,0.6)" }}>
            <Settings size={14} /> API settings
          </button>
          <button onClick={onLogout} className="sp-focus flex items-center gap-2 text-xs py-2 rounded-lg" style={{ color: "rgba(250,248,243,0.6)" }}>
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between px-5 md:px-8 py-4 sticky top-0 z-20"
          style={{ background: THEME.paper, borderBottom: `1px solid ${THEME.line}` }}>
          <div className="flex items-center gap-2 md:hidden">
            <HandLandmark size={22} color={THEME.gold} active />
            <span className="sp-display font-semibold">SignPath</span>
          </div>
          <div className="hidden md:block">
            <p className="text-xs" style={{ color: THEME.muted }}>Signed in as</p>
            <p className="text-sm font-semibold">{user.name} <span style={{ color: THEME.muted, fontWeight: 400 }}>· {roleMeta?.label}</span></p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button className="sp-focus relative p-2 rounded-lg" style={{ background: THEME.paperAlt }} onClick={() => { setShowNotif((s) => !s); notify.markAllRead(); }} aria-label="Notifications">
                <Bell size={16} />
                {notify.unread > 0 && (
                  <span className="absolute -top-1 -right-1 text-[10px] w-4 h-4 flex items-center justify-center rounded-full" style={{ background: THEME.danger, color: "#fff" }}>{notify.unread}</span>
                )}
              </button>
              {showNotif && (
                <div className="absolute right-0 mt-2 w-80 max-h-96 sp-scroll rounded-xl shadow-xl z-30" style={{ background: THEME.card, border: `1px solid ${THEME.line}` }}>
                  <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: `1px solid ${THEME.line}` }}>
                    <span className="text-sm font-semibold">Notifications</span>
                    <button onClick={() => setShowNotif(false)} className="sp-focus"><X size={14} /></button>
                  </div>
                  {notify.items.length === 0 ? (
                    <div className="p-6 text-center text-xs" style={{ color: THEME.muted }}>Nothing yet — activity will show up here.</div>
                  ) : (
                    <ul>
                      {notify.items.map((n) => (
                        <li key={n.id} className="px-4 py-3 text-sm" style={{ borderBottom: `1px solid ${THEME.line}` }}>
                          <div className="flex items-center gap-2 font-medium">
                            <NotifIcon type={n.type} /> {n.title}
                          </div>
                          <p className="text-xs mt-0.5" style={{ color: THEME.muted }}>{n.body}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
            <button className="md:hidden sp-focus p-2 rounded-lg" style={{ background: THEME.paperAlt }} onClick={onLogout} aria-label="Sign out"><LogOut size={16} /></button>
          </div>
        </header>

        <div className="md:hidden flex overflow-x-auto gap-2 px-4 py-2" style={{ borderBottom: `1px solid ${THEME.line}` }}>
          {nav.map((item) => (
            <button key={item.id} onClick={() => setView(item.id)}
              className="sp-focus px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap"
              style={{ background: view === item.id ? THEME.ink : THEME.paperAlt, color: view === item.id ? THEME.gold : THEME.ink }}>
              {item.label}
            </button>
          ))}
        </div>

        <main className="flex-1 px-5 md:px-8 py-6 sp-scroll">{children}</main>
      </div>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
}

function NotifIcon({ type }) {
  const map = {
    session: { Icon: CheckCircle2, color: THEME.success },
    achievement: { Icon: Sparkles, color: THEME.gold },
    certification: { Icon: Award, color: THEME.plum },
    reminder: { Icon: BellRing, color: THEME.teal },
    alert: { Icon: AlertTriangle, color: THEME.danger },
  };
  const { Icon, color } = map[type] || map.reminder;
  return <Icon size={14} color={color} />;
}

function SettingsModal({ onClose }) {
  const { apiBase, setApiBase } = useApiBase();
  const [draft, setDraft] = useState(apiBase);
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center px-4" style={{ background: "rgba(28,27,41,0.5)" }}>
      <Card className="w-full max-w-md" style={{ background: THEME.card }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="sp-display font-semibold text-lg">API settings</h3>
          <button onClick={onClose} className="sp-focus"><X size={16} /></button>
        </div>
        <label className="text-xs font-medium" style={{ color: THEME.muted }}>Backend base URL</label>
        <input value={draft} onChange={(e) => setDraft(e.target.value)}
          className="sp-focus sp-mono w-full mt-1 mb-4 px-3 py-2 rounded-lg text-sm" style={{ border: `1px solid ${THEME.line}` }}
          placeholder="http://localhost:8000" />
        <p className="text-xs mb-4" style={{ color: THEME.muted }}>
          Every screen calls this FastAPI backend directly — no data in this app is hardcoded.
        </p>
        <div className="flex gap-2 justify-end">
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn variant="primary" onClick={() => { setApiBase(draft); onClose(); }}>Save</Btn>
        </div>
      </Card>
    </div>
  );
}

function LoginScreen({ onLogin }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("learner");
  const { apiBase } = useApiBase();
  const api = useApi();
  const [checking, setChecking] = useState(null);

  const checkHealth = async () => {
    setChecking("checking");
    const res = await api("/health");
    setChecking(res.ok ? "ok" : "fail");
  };

  return (
    <div className="sp-root min-h-screen flex items-center justify-center px-4" style={{ background: THEME.ink }}>
      <GlobalStyle />
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center mb-8">
          <HandLandmark size={72} color={THEME.gold} active />
          <h1 className="sp-display text-2xl font-semibold mt-4" style={{ color: THEME.paper }}>SignPath</h1>
          <p className="text-sm mt-1" style={{ color: "rgba(250,248,243,0.6)" }}>Sign language learning &amp; assessment</p>
        </div>
        <Card style={{ background: THEME.paper }}>
          <label className="text-xs font-medium" style={{ color: THEME.muted }}>Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Priya Nair"
            className="sp-focus w-full mt-1 mb-4 px-3 py-2.5 rounded-lg text-sm" style={{ border: `1px solid ${THEME.line}` }} />

          <label className="text-xs font-medium" style={{ color: THEME.muted }}>Role</label>
          <div className="grid grid-cols-2 gap-2 mt-1 mb-5">
            {ROLES.map((r) => {
              const Icon = r.icon;
              const activeRole = role === r.id;
              return (
                <button key={r.id} onClick={() => setRole(r.id)}
                  className="sp-focus flex flex-col items-start gap-1 p-3 rounded-lg text-left"
                  style={{ border: `1.5px solid ${activeRole ? THEME.ink : THEME.line}`, background: activeRole ? THEME.paperAlt : "transparent" }}>
                  <Icon size={16} />
                  <span className="text-xs font-semibold leading-tight">{r.label}</span>
                </button>
              );
            })}
          </div>

          <Btn full variant="accent" size="lg" icon={LogIn} disabled={!name.trim()}
            onClick={() => onLogin({ id: 1, name: name.trim(), role })}>
            Enter platform
          </Btn>

          <div className="mt-4 pt-4 flex items-center justify-between" style={{ borderTop: `1px solid ${THEME.line}` }}>
            <span className="sp-mono text-[11px]" style={{ color: THEME.muted }}>{apiBase}</span>
            <button onClick={checkHealth} className="sp-focus text-[11px] font-medium flex items-center gap-1" style={{ color: THEME.teal }}>
              {checking === "checking" ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
              Test connection
            </button>
          </div>
          {checking === "ok" && <p className="text-[11px] mt-1 flex items-center gap-1" style={{ color: THEME.success }}><CheckCircle2 size={12} /> Backend reachable</p>}
          {checking === "fail" && <p className="text-[11px] mt-1 flex items-center gap-1" style={{ color: THEME.danger }}><XCircle size={12} /> Couldn't reach backend — check API settings after login</p>}
        </Card>
      </div>
    </div>
  );
}

function LearnerDashboard({ user, goTo }) {
  const api = useApi();
  const summary = useAsync(() => api("/analytics/summary"), []);
  const states = useAsync(() => api("/analytics/learner-states"), []);
  const recs = useAsync(() => api("/recommendations/"), []);
  const perf = useAsync(() => api(`/reports/performance/${user.id}`), [user.id]);

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <SectionEyebrow>Learner dashboard</SectionEyebrow>
          <h1 className="sp-display text-2xl font-semibold">Welcome back, {user.name.split(" ")[0]}</h1>
        </div>
        <Btn variant="accent" icon={Play} onClick={() => goTo("practice")}>Start practice</Btn>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {perf.state === "loading" && [1, 2, 3, 4].map((i) => <Card key={i}><LoadingBlock label="" /></Card>)}
        {perf.state === "error" && (
          <div className="col-span-2 md:col-span-4"><Card><ErrorBlock message={perf.error} onRetry={perf.reload} /></Card></div>
        )}
        {perf.state === "ready" && (
          <>
            <StatCard label="Overall accuracy" value={fmtPct(perf.data?.overall_accuracy)} icon={TrendingUp} tone="teal" />
            <StatCard label="Current session accuracy" value={fmtPct(perf.data?.current_session_accuracy)} icon={CircleDot} tone="gold" />
            <StatCard label="Total attempts" value={perf.data?.total_attempts ?? "—"} icon={ClipboardList} />
            <StatCard label="Avg. confidence" value={fmtPct(perf.data?.average_confidence)} icon={BarChart3} tone="plum" />
          </>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <SectionEyebrow>Alphabet mastery</SectionEyebrow>
          {states.state === "loading" && <LoadingBlock label="Loading mastery states" />}
          {states.state === "error" && <ErrorBlock message={states.error} onRetry={states.reload} />}
          {states.state === "ready" && (
            Array.isArray(states.data) && states.data.length > 0 ? (
              <MasteryGrid data={states.data} />
            ) : (
              <EmptyBlock title="No practice history yet" body="Complete a practice session to see your A–Z mastery map." />
            )
          )}
        </Card>

        <Card>
          <SectionEyebrow>Status breakdown</SectionEyebrow>
          {summary.state === "loading" && <LoadingBlock label="" />}
          {summary.state === "error" && <ErrorBlock message={summary.error} onRetry={summary.reload} />}
          {summary.state === "ready" && summary.data && (
            <div className="flex flex-col gap-3 mt-2">
              <StatusRow label="Mastered" value={summary.data.mastered} tone="success" />
              <StatusRow label="Improving" value={summary.data.improving} tone="teal" />
              <StatusRow label="Learning" value={summary.data.learning} tone="gold" />
              <StatusRow label="Needs revision" value={summary.data.needs_revision} tone="danger" />
            </div>
          )}
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <SectionEyebrow>Progress across sessions</SectionEyebrow>
          {perf.state === "ready" && Array.isArray(perf.data?.session_accuracy) && perf.data.session_accuracy.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={perf.data.session_accuracy.map((v, i) => ({ session: `S${i + 1}`, accuracy: typeof v === "object" ? v.accuracy : v }))}>
                <defs>
                  <linearGradient id="accFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={THEME.teal} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={THEME.teal} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={THEME.line} vertical={false} />
                <XAxis dataKey="session" tick={{ fontSize: 11, fontFamily: FONT_MONO }} axisLine={{ stroke: THEME.line }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fontFamily: FONT_MONO }} axisLine={false} tickLine={false} width={32} />
                <Tooltip contentStyle={{ fontFamily: FONT_MONO, fontSize: 12, borderRadius: 8, border: `1px solid ${THEME.line}` }} />
                <Area type="monotone" dataKey="accuracy" stroke={THEME.teal} fill="url(#accFill)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : perf.state === "loading" ? <LoadingBlock label="" /> : (
            <EmptyBlock title="No trend yet" body="Your accuracy across sessions will chart here once you've completed a few." />
          )}
        </Card>

        <Card>
          <SectionEyebrow>Strongest &amp; weakest alphabets</SectionEyebrow>
          {perf.state === "ready" && (perf.data?.strongest_alphabets || perf.data?.weakest_alphabets) ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={buildStrengthData(perf.data)}>
                <CartesianGrid stroke={THEME.line} vertical={false} />
                <XAxis dataKey="letter" tick={{ fontSize: 11, fontFamily: FONT_MONO }} axisLine={{ stroke: THEME.line }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fontFamily: FONT_MONO }} axisLine={false} tickLine={false} width={32} />
                <Tooltip contentStyle={{ fontFamily: FONT_MONO, fontSize: 12, borderRadius: 8, border: `1px solid ${THEME.line}` }} />
                <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                  {buildStrengthData(perf.data).map((d, i) => <Cell key={i} fill={d.kind === "strong" ? THEME.success : THEME.danger} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : perf.state === "loading" ? <LoadingBlock label="" /> : <EmptyBlock title="Not enough data yet" />}
        </Card>
      </div>

      <Card>
        <SectionEyebrow>Recommended next</SectionEyebrow>
        {recs.state === "loading" && <LoadingBlock label="Loading recommendations" />}
        {recs.state === "error" && <ErrorBlock message={recs.error} onRetry={recs.reload} />}
        {recs.state === "ready" && (
          Array.isArray(recs.data) && recs.data.length > 0 ? (
            <ul className="grid sm:grid-cols-2 gap-3 mt-2">
              {recs.data.map((r, i) => (
                <li key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: THEME.paperAlt }}>
                  <div className="sp-display font-semibold w-9 h-9 flex items-center justify-center rounded-lg shrink-0" style={{ background: THEME.card }}>
                    {r.alphabet || r.letter || "?"}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{r.reason || r.title || "Practice recommended"}</p>
                    {r.description && <p className="text-xs mt-0.5" style={{ color: THEME.muted }}>{r.description}</p>}
                  </div>
                </li>
              ))}
            </ul>
          ) : <EmptyBlock title="No recommendations yet" body="Practice a few letters and this list fills in based on your real performance." />
        )}
      </Card>
    </div>
  );
}

function StatusRow({ label, value, tone }) {
  const colors = { success: THEME.success, teal: THEME.teal, gold: "#8A5A0F", danger: THEME.danger };
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm">{label}</span>
      <span className="sp-mono text-sm font-semibold" style={{ color: colors[tone] }}>{value ?? "—"}</span>
    </div>
  );
}

function MasteryGrid({ data }) {
  const byLetter = {};
  data.forEach((d) => { byLetter[(d.alphabet || d.letter || "").toUpperCase()] = d; });
  const stateColor = (s) => ({
    mastered: THEME.success, improving: THEME.teal, learning: THEME.gold, needs_revision: THEME.danger,
  }[s] || THEME.line);
  return (
    <div className="grid grid-cols-6 sm:grid-cols-9 gap-2 mt-2">
      {ALPHABET.map((letter) => {
        const d = byLetter[letter];
        const color = d ? stateColor(d.state || d.status) : THEME.line;
        return (
          <div key={letter} title={d ? `${letter}: ${d.state || d.status}` : `${letter}: not attempted`}
            className="aspect-square rounded-lg flex items-center justify-center sp-mono text-xs font-semibold"
            style={{ background: d ? color : THEME.paperAlt, color: d ? "#fff" : THEME.muted, opacity: d ? 1 : 0.6 }}>
            {letter}
          </div>
        );
      })}
    </div>
  );
}

function buildStrengthData(perf) {
  const strong = (perf.strongest_alphabets || []).slice(0, 4).map((s) => ({ letter: typeof s === "string" ? s : s.alphabet, score: typeof s === "string" ? 100 : (s.accuracy ?? 100), kind: "strong" }));
  const weak = (perf.weakest_alphabets || []).slice(0, 4).map((s) => ({ letter: typeof s === "string" ? s : s.alphabet, score: typeof s === "string" ? 20 : (s.accuracy ?? 20), kind: "weak" }));
  return [...strong, ...weak];
}

function fmtPct(v) {
  if (v === undefined || v === null) return "—";
  const n = typeof v === "number" ? v : parseFloat(v);
  if (Number.isNaN(n)) return "—";
  return `${n <= 1 ? Math.round(n * 100) : Math.round(n)}%`;
}

function PracticeFlow({ user, goTo }) {
  const api = useApi();
  const notify = useNotify();
  const lessons = useAsync(() => api("/lessons"), []);
  const [step, setStep] = useState("select");
  const [sessionId, setSessionId] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState(null);

  const startSession = async () => {
    setStarting(true); setStartError(null);
    const res = await api("/sessions/start", { method: "POST", body: JSON.stringify({ user_id: user.id }) });
    setStarting(false);
    if (res.ok) {
      setSessionId(res.data?.session_id ?? res.data?.id ?? null);
      setStep("reference");
    } else {
      setStartError(res.error);
    }
  };

  const endSession = async () => {
    if (sessionId) await api(`/sessions/end/${sessionId}`, { method: "POST" });
    notify.push("session", "Session completed", `${attempts.length} sign${attempts.length === 1 ? "" : "s"} attempted this session.`);
    setStep("summary");
  };

  if (step === "select") {
    return (
      <div className="max-w-3xl flex flex-col gap-5">
        <div>
          <SectionEyebrow>Practice</SectionEyebrow>
          <h1 className="sp-display text-2xl font-semibold">Pick a sign to practice</h1>
        </div>
        {lessons.state === "loading" && <LoadingBlock label="Loading lessons" />}
        {lessons.state === "error" && <Card><ErrorBlock message={lessons.error} onRetry={lessons.reload} /></Card>}
        {lessons.state === "ready" && (
          Array.isArray(lessons.data) && lessons.data.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {lessons.data.map((l) => (
                <button key={l.id} onClick={() => setSelectedLesson(l)}
                  className="sp-focus text-left"
                  style={{ outline: selectedLesson?.id === l.id ? `2px solid ${THEME.teal}` : "none", outlineOffset: 2, borderRadius: 16 }}>
                  <Card className="h-full">
                    <div className="flex items-center gap-3">
                      <div className="sp-display text-xl font-bold w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: THEME.paperAlt }}>
                        {l.sign || l.letter || "?"}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{l.meaning || l.description || `Sign ${l.sign}`}</p>
                        {l.difficulty && <Badge tone="gold">{l.difficulty}</Badge>}
                      </div>
                    </div>
                  </Card>
                </button>
              ))}
            </div>
          ) : <Card><EmptyBlock title="No lessons available" body="The backend returned an empty lesson list." /></Card>
        )}
        {startError && <p className="text-xs" style={{ color: THEME.danger }}>{startError}</p>}
        <div>
          <Btn variant="accent" size="lg" icon={starting ? Loader2 : Play} disabled={!selectedLesson || starting} onClick={startSession}>
            {starting ? "Starting…" : "Start session"}
          </Btn>
        </div>
      </div>
    );
  }

  if (step === "reference" || step === "capture" || step === "feedback") {
    return (
      <PracticeStage
        user={user} sessionId={sessionId} lesson={selectedLesson}
        subStep={step} setSubStep={setStep}
        attempts={attempts}
        onAttempt={(a) => setAttempts((prev) => [...prev, a])}
        onFinish={endSession}
      />
    );
  }

  if (step === "summary") {
    return <SessionSummary sessionId={sessionId} attempts={attempts} onDone={() => goTo("dashboard")} onAgain={() => { setStep("select"); setAttempts([]); setSessionId(null); setSelectedLesson(null); }} />;
  }

  return null;
}

function PracticeStage({ user, sessionId, lesson, subStep, setSubStep, attempts, onAttempt, onFinish }) {
  const api = useApi();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [camState, setCamState] = useState("idle");
  const [predicting, setPredicting] = useState(false);
  const [result, setResult] = useState(null);
  const [predictError, setPredictError] = useState(null);

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    setCamState("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCamState("live");
      setSubStep("capture");
    } catch (err) {
      setCamState(err?.name === "NotAllowedError" ? "denied" : "error");
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const captureAndPredict = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 480;
    canvas.height = video.videoHeight || 360;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    setPredicting(true); setPredictError(null);
    canvas.toBlob(async (blob) => {
      const form = new FormData();
      form.append("file", blob, "frame.jpg");

      const res = await api("/predict", { method: "POST", body: form });
      setPredicting(false);
      if (!res.ok) { setPredictError(res.error); return; }

      const predicted = (res.data?.gesture || res.data?.prediction || "").toUpperCase();
      const confidence = res.data?.confidence ?? res.data?.score ?? 0;
      const target = (lesson?.sign || lesson?.letter || "").toUpperCase();
      const correct = predicted === target;

      await api("/sessions/complete-assessment", {
        method: "POST",
        body: JSON.stringify({
          session_id: sessionId, user_id: user.id, alphabet: target,
          predicted_gesture: predicted, confidence, correct,
        }),
      });

      const attempt = { alphabet: target, predicted, confidence, correct, handDetected: res.data?.hand_detected };
      onAttempt(attempt);
      setResult(attempt);
      setSubStep("feedback");
    }, "image/jpeg", 0.9);
  };

  const targetLetter = lesson?.sign || lesson?.letter || "?";

  return (
    <div className="max-w-3xl flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <SectionEyebrow>Practicing</SectionEyebrow>
          <h1 className="sp-display text-2xl font-semibold">Sign for “{lesson?.meaning || targetLetter}”</h1>
        </div>
        <Badge tone="teal">Attempt {attempts.length + 1}</Badge>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <Card className="flex flex-col items-center justify-center gap-3 py-8">
          <span className="sp-mono text-[11px] uppercase tracking-widest" style={{ color: THEME.muted }}>Reference sign</span>
          <div className="sp-display text-6xl font-bold" style={{ color: THEME.plum }}>{targetLetter}</div>
          {lesson?.image_path ? (
            <img src={lesson.image_path} alt={`Reference sign for ${targetLetter}`} className="max-h-40 rounded-lg mt-2" />
          ) : (
            <p className="text-xs text-center px-6" style={{ color: THEME.muted }}>No reference image on file for this sign — match the letter shown above.</p>
          )}
        </Card>

        <Card className="flex flex-col gap-3">
          <span className="sp-mono text-[11px] uppercase tracking-widest" style={{ color: THEME.muted }}>Your camera</span>
          <div className="relative rounded-xl overflow-hidden aspect-[4/3]" style={{ background: THEME.ink }}>
            {camState === "live" ? (
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                onLoadedMetadata={() => videoRef.current?.play()}
                className="w-full h-full object-cover" 
                style={{ transform: "scaleX(-1)" }} 
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                {camState === "requesting" && <Loader2 className="animate-spin" color={THEME.gold} />}
                {camState === "idle" && <VideoOff color="rgba(250,248,243,0.4)" />}
                {camState === "denied" && <>
                  <AlertTriangle color={THEME.gold} />
                  <p className="text-xs px-6 text-center" style={{ color: THEME.paper }}>Camera permission was denied.</p>
                </>}
                {camState === "error" && <>
                  <AlertTriangle color={THEME.gold} />
                  <p className="text-xs px-6 text-center" style={{ color: THEME.paper }}>Couldn't access a camera on this device.</p>
                </>}
              </div>
            )}
          </div>
          <canvas ref={canvasRef} className="hidden" />
          {camState !== "live" ? (
            <Btn variant="accent" icon={Video} onClick={startCamera}>Enable camera</Btn>
          ) : (
            <Btn variant="accent" icon={predicting ? Loader2 : Camera} disabled={predicting} onClick={captureAndPredict}>
              {predicting ? "Reading your sign…" : "Capture & recognize"}
            </Btn>
          )}
          {predictError && <p className="text-xs" style={{ color: THEME.danger }}>{predictError}</p>}
        </Card>
      </div>

      {subStep === "feedback" && result && (
        <Card className="flex items-center gap-4" style={{ borderColor: result.correct ? THEME.success : THEME.danger }}>
          {result.correct ? <CheckCircle2 size={28} color={THEME.success} /> : <XCircle size={28} color={THEME.danger} />}
          <div className="flex-1">
            <p className="font-semibold text-sm">{result.correct ? "Correct!" : "Not quite"}</p>
            <p className="text-xs" style={{ color: THEME.muted }}>
              Recognized as <span className="sp-mono font-semibold">{result.predicted || "—"}</span> · confidence <span className="sp-mono font-semibold">{fmtPct(result.confidence)}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <Btn variant="outline" icon={RotateCcw} onClick={() => { setResult(null); setSubStep("capture"); }}>Retry</Btn>
            <Btn variant="primary" icon={ChevronRight} onClick={onFinish}>End session</Btn>
          </div>
        </Card>
      )}
    </div>
  );
}

function SessionSummary({ sessionId, attempts, onDone, onAgain }) {
  const api = useApi();
  const report = useAsync(() => sessionId ? api(`/reports/session/${sessionId}`) : Promise.resolve({ ok: false, error: "No session id returned by the backend." }), [sessionId]);
  const correct = attempts.filter((a) => a.correct).length;
  return (
    <div className="max-w-2xl flex flex-col gap-5">
      <div className="flex flex-col items-center text-center py-4">
        <HandLandmark size={60} color={THEME.gold} active />
        <h1 className="sp-display text-2xl font-semibold mt-3">Session complete</h1>
        <p className="text-sm mt-1" style={{ color: THEME.muted }}>Here's how this session went.</p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Attempts" value={attempts.length} />
        <StatCard label="Correct" value={correct} tone="success" />
        <StatCard label="Accuracy" value={attempts.length ? `${Math.round((correct / attempts.length) * 100)}%` : "—"} tone="gold" />
      </div>
      <Card>
        <SectionEyebrow>Server-side session report</SectionEyebrow>
        {report.state === "loading" && <LoadingBlock label="" />}
        {report.state === "error" && <ErrorBlock message={report.error} onRetry={sessionId ? report.reload : undefined} />}
        {report.state === "ready" && report.data && (
          <pre className="sp-mono text-xs p-3 rounded-lg overflow-auto" style={{ background: THEME.paperAlt }}>{JSON.stringify(report.data, null, 2)}</pre>
        )}
      </Card>
      <div className="flex gap-3">
        <Btn variant="outline" icon={RotateCcw} onClick={onAgain}>Practice again</Btn>
        <Btn variant="primary" icon={LayoutDashboard} onClick={onDone}>Back to dashboard</Btn>
      </div>
    </div>
  );
}

function ReportsScreen({ user }) {
  const api = useApi();
  const { apiBase } = useApiBase();
  const perf = useAsync(() => api(`/reports/performance/${user.id}`), [user.id]);
  const [sessionIdInput, setSessionIdInput] = useState("");
  const sessionReport = useAsync(() => sessionIdInput ? api(`/reports/session/${sessionIdInput}`) : Promise.resolve({ ok: false, error: "Enter a session ID above to load its report." }), [sessionIdInput]);

  const downloadUrl = (path) => `${apiBase}${path}`;

  return (
    <div className="max-w-4xl flex flex-col gap-6">
      <div>
        <SectionEyebrow>Reports</SectionEyebrow>
        <h1 className="sp-display text-2xl font-semibold">Learner performance report</h1>
      </div>

      <Card>
        {perf.state === "loading" && <LoadingBlock label="Building report" />}
        {perf.state === "error" && <ErrorBlock message={perf.error} onRetry={perf.reload} />}
        {perf.state === "ready" && perf.data && (
          <div className="flex flex-col gap-5">
            <div className="grid sm:grid-cols-3 gap-4">
              <StatCard label="Total sessions" value={perf.data.total_sessions ?? "—"} />
              <StatCard label="Total attempts" value={perf.data.total_attempts ?? "—"} />
              <StatCard label="Overall accuracy" value={fmtPct(perf.data.overall_accuracy)} tone="teal" />
            </div>
            <div className="flex flex-wrap gap-2 pt-2" style={{ borderTop: `1px solid ${THEME.line}` }}>
              <a href={downloadUrl("/reports/export/performance/csv")} target="_blank" rel="noreferrer"><Btn variant="subtle" size="sm" icon={Download}>Export CSV</Btn></a>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

function CertificationFlow({ user }) {
  const api = useApi();
  const [phase, setPhase] = useState("intro");
  const [cycleId, setCycleId] = useState(null);
  const [queue, setQueue] = useState([]);
  const [idx, setIdx] = useState(0);
  const [results, setResults] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [camLive, setCamLive] = useState(false);

  const evalSet = useMemo(() => shuffle(ALPHABET).slice(0, 8), []);

  const startCertification = async () => {
    setBusy(true); setError(null);
    const res = await api("/cycle/start-cycle", { method: "POST", body: JSON.stringify({ user_id: user.id, mode: "certification", alphabets: evalSet }) });
    setBusy(false);
    if (!res.ok) { setError(res.error); return; }
    setCycleId(res.data?.cycle_id ?? res.data?.id ?? null);
    setQueue(evalSet);
    setIdx(0);
    setResults([]);
    setPhase("running");
    await enableCamera();
  };

  const enableCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCamLive(true);
    } catch {
      setCamLive(false);
    }
  };

  useEffect(() => () => streamRef.current?.getTracks().forEach((t) => t.stop()), []);

  const submitAttempt = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current, canvas = canvasRef.current;
    canvas.width = video.videoWidth || 480; canvas.height = video.videoHeight || 360;
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
    setBusy(true); setError(null);
    canvas.toBlob(async (blob) => {
      const form = new FormData();
      form.append("file", blob, "frame.jpg");

      const res = await api("/predict", { method: "POST", body: form });
      setBusy(false);
      if (!res.ok) { setError(res.error); return; }
      const predicted = (res.data?.gesture || res.data?.prediction || "").toUpperCase();
      const correct = predicted === queue[idx];
      setResults((prev) => [...prev, { alphabet: queue[idx], correct, confidence: res.data?.confidence }]);
      if (idx + 1 < queue.length) setIdx(idx + 1);
      else finishCertification();
    }, "image/jpeg", 0.9);
  };

  const finishCertification = async () => {
    if (cycleId) await api(`/cycle/end-cycle/${cycleId}`, { method: "POST" });
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setPhase("result");
  };

  if (phase === "intro") {
    return (
      <div className="max-w-2xl flex flex-col gap-5">
        <SectionEyebrow>Certification</SectionEyebrow>
        <h1 className="sp-display text-2xl font-semibold">Skill evaluation</h1>
        <Card>
          <Btn variant="accent" size="lg" icon={busy ? Loader2 : Award} disabled={busy} onClick={startCertification}>
            {busy ? "Starting…" : "Begin certification assessment"}
          </Btn>
        </Card>
      </div>
    );
  }

  if (phase === "running") {
    return (
      <div className="max-w-2xl flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h1 className="sp-display text-2xl font-semibold">Sign: {queue[idx]}</h1>
          <Badge tone="plum">{idx + 1} / {queue.length}</Badge>
        </div>
        <Card>
          <div className="relative rounded-xl overflow-hidden aspect-[4/3] mb-3" style={{ background: THEME.ink }}>
            {camLive ? (
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                onLoadedMetadata={() => videoRef.current?.play()}
                className="w-full h-full object-cover" 
                style={{ transform: "scaleX(-1)" }} 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center"><VideoOff color="rgba(250,248,243,0.4)" /></div>
            )}
          </div>
          <canvas ref={canvasRef} className="hidden" />
          <Btn full variant="accent" icon={busy ? Loader2 : Camera} disabled={busy || !camLive} onClick={submitAttempt}>
            {busy ? "Evaluating…" : "Capture sign"}
          </Btn>
        </Card>
      </div>
    );
  }

  return null;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

function InstructorDashboard() {
  return (
    <div className="max-w-5xl flex flex-col gap-6">
      <SectionEyebrow>Instructor</SectionEyebrow>
      <h1 className="sp-display text-2xl font-semibold">Students &amp; performance</h1>
    </div>
  );
}

function TrainerDashboard() {
  return (
    <div className="max-w-5xl flex flex-col gap-6">
      <SectionEyebrow>Accessibility trainer</SectionEyebrow>
      <h1 className="sp-display text-2xl font-semibold">Analytics</h1>
    </div>
  );
}

function AdminDashboard() {
  return (
    <div className="max-w-5xl flex flex-col gap-6">
      <SectionEyebrow>Administrator</SectionEyebrow>
      <h1 className="sp-display text-2xl font-semibold">Platform overview</h1>
    </div>
  );
}

export default function SignPathApp() {
  const [apiBase, setApiBase] = useState("http://localhost:8000");
  const [user, setUser] = useState(null);
  const [view, setView] = useState("dashboard");

  const handleLogin = (u) => {
    setUser(u);
    setView(u.role === "learner" ? "dashboard" : u.role);
  };

  return (
    <ApiContext.Provider value={{ apiBase, setApiBase }}>
      <NotificationProvider>
        {!user ? (
          <LoginScreen onLogin={handleLogin} />
        ) : (
          <Shell user={user} onLogout={() => setUser(null)} view={view} setView={setView}>
            {user.role === "learner" && view === "dashboard" && <LearnerDashboard user={user} goTo={setView} />}
            {user.role === "learner" && view === "practice" && <PracticeFlow user={user} goTo={setView} />}
            {user.role === "learner" && view === "reports" && <ReportsScreen user={user} />}
            {user.role === "learner" && view === "certification" && <CertificationFlow user={user} />}
            {user.role === "instructor" && <InstructorDashboard />}
            {user.role === "trainer" && <TrainerDashboard />}
            {user.role === "admin" && <AdminDashboard />}
          </Shell>
        )}
      </NotificationProvider>
    </ApiContext.Provider>
  );
}