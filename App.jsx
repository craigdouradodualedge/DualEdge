import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const T = {
  bg: "#08080f", card: "#101020", card2: "#18182e", border: "#1f1f38",
  text: "#eeeeff", muted: "#55557a",
  orange: "#f97316", purple: "#8b5cf6", green: "#10b981", red: "#ef4444", yellow: "#eab308",
};

const todayEvents = [
  { time: "07:00", type: "training", title: "Morning pool session", location: "Aquatics Centre", duration: "90 min" },
  { time: "09:30", type: "academic", title: "Sports psychology lecture", location: "Room B204", duration: "60 min" },
  { time: "11:00", type: "academic", title: "Research methods seminar", location: "Library", duration: "2 hrs" },
  { time: "14:00", type: "training", title: "Strength & conditioning", location: "Performance gym", duration: "60 min" },
  { time: "16:00", type: "academic", title: "Essay submission deadline", location: "Online portal", urgent: true },
  { time: "18:00", type: "training", title: "Team tactics session", location: "Main pitch", duration: "45 min" },
];

const weekSchedule = {
  Mon: [{ type: "training", title: "Morning training", time: "07:00" }, { type: "academic", title: "Biomechanics", time: "10:00" }, { type: "training", title: "S&C session", time: "14:00" }],
  Tue: [{ type: "academic", title: "Stats workshop", time: "09:00" }, { type: "training", title: "Pool session", time: "15:00" }],
  Wed: [{ type: "training", title: "Recovery swim", time: "08:00" }, { type: "academic", title: "Sports psych", time: "09:30" }, { type: "academic", title: "Essay due", time: "16:00", urgent: true }, { type: "training", title: "Tactics", time: "18:00" }],
  Thu: [{ type: "training", title: "High intensity", time: "07:00" }, { type: "academic", title: "Research methods", time: "10:00" }, { type: "training", title: "Match prep", time: "15:00" }],
  Fri: [{ type: "academic", title: "Dissertation meeting", time: "10:00" }, { type: "training", title: "Team practice", time: "14:00" }, { type: "academic", title: "Portfolio due", time: "23:59", urgent: true }],
  Sat: [{ type: "training", title: "Match day", time: "14:00" }],
  Sun: [{ type: "training", title: "Active recovery", time: "10:00" }],
};

const wellbeingHistory = [
  { day: "Mon", sleep: 7, energy: 6, mood: 7, stress: 5 },
  { day: "Tue", sleep: 6, energy: 5, mood: 6, stress: 7 },
  { day: "Wed", sleep: 8, energy: 7, mood: 8, stress: 4 },
  { day: "Thu", sleep: 5, energy: 4, mood: 5, stress: 8 },
  { day: "Fri", sleep: 7, energy: 6, mood: 7, stress: 6 },
  { day: "Sat", sleep: 9, energy: 8, mood: 9, stress: 3 },
  { day: "Sun", sleep: 8, energy: 7, mood: 7, stress: 4 },
].map(d => ({ ...d, overall: Math.round((d.sleep + d.energy + d.mood + (10 - d.stress)) / 4) }));

const performanceLog = [
  { date: "Jun 22", type: "Match", title: "vs UCL — Won 3-1", notes: "Strong showing, 2 assists", score: 9 },
  { date: "Jun 20", type: "Training", title: "High intensity block", notes: "PB on 400m: 52.3s", score: 8 },
  { date: "Jun 18", type: "S&C", title: "Strength session", notes: "Squat 1RM: 120kg", score: 7 },
  { date: "Jun 15", type: "Match", title: "vs Kings — Drew 1-1", notes: "Solid defensively", score: 6 },
  { date: "Jun 12", type: "Training", title: "Recovery session", notes: "Low intensity, form focused", score: 7 },
];

const athletes = [
  { id: 1, name: "Priya Sharma", sport: "Swimming", course: "Sports Science", year: "2nd Year", wellbeing: { sleep: 4, energy: 3, mood: 4, stress: 9 }, status: "at-risk", athleticLoad: 85, academicLoad: 75, lastCheckIn: "Today" },
  { id: 2, name: "Marcus Thompson", sport: "Athletics", course: "Kinesiology", year: "3rd Year", wellbeing: { sleep: 8, energy: 7, mood: 8, stress: 3 }, status: "good", athleticLoad: 70, academicLoad: 60, lastCheckIn: "Today" },
  { id: 3, name: "Aisha Patel", sport: "Football", course: "Sports Mgmt", year: "1st Year", wellbeing: { sleep: 7, energy: 6, mood: 7, stress: 5 }, status: "good", athleticLoad: 65, academicLoad: 80, lastCheckIn: "Yesterday" },
  { id: 4, name: "Jake Morrison", sport: "Weightlifting", course: "Sports Science", year: "2nd Year", wellbeing: { sleep: 5, energy: 5, mood: 5, stress: 7 }, status: "watch", athleticLoad: 75, academicLoad: 70, lastCheckIn: "Today" },
  { id: 5, name: "Sofia Reyes", sport: "Tennis", course: "Physiotherapy", year: "4th Year", wellbeing: { sleep: 8, energy: 8, mood: 9, stress: 2 }, status: "good", athleticLoad: 60, academicLoad: 65, lastCheckIn: "Today" },
  { id: 6, name: "Tom O'Brien", sport: "Rugby", course: "Coaching", year: "3rd Year", wellbeing: { sleep: 6, energy: 5, mood: 6, stress: 6 }, status: "watch", athleticLoad: 80, academicLoad: 70, lastCheckIn: "2 days ago" },
];

// ── Shared helpers ─────────────────────────────────────────────────────────
const card = (extra = {}) => ({ background: T.card, border: `1px solid ${T.border}`, borderRadius: "14px", padding: "18px", ...extra });

const Badge = ({ children, color = T.orange }) => (
  <span style={{ background: `${color}22`, color, fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "20px", letterSpacing: "0.06em", textTransform: "uppercase" }}>
    {children}
  </span>
);

const DualStrip = () => (
  <div style={{ height: "2px", background: `linear-gradient(90deg, ${T.orange} 50%, ${T.purple} 50%)`, borderRadius: "1px", marginBottom: "14px" }} />
);

const Sidebar = ({ logo, name, role, navItems, tab, setTab, accent, onBack }) => (
  <div style={{ width: "195px", background: T.card, borderRight: `1px solid ${T.border}`, padding: "20px 14px", display: "flex", flexDirection: "column", flexShrink: 0, minHeight: "100vh" }}>
    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
      <div style={{ width: "26px", height: "26px", background: `linear-gradient(135deg, ${T.orange}, ${T.purple})`, borderRadius: "7px", flexShrink: 0 }} />
      <span style={{ fontSize: "16px", fontWeight: 700, color: T.text, letterSpacing: "-0.02em" }}>DualEdge</span>
    </div>
    <div style={{ height: "2px", background: `linear-gradient(90deg, ${T.orange} 50%, ${T.purple} 50%)`, borderRadius: "1px", marginBottom: "20px" }} />
    <div style={{ marginBottom: "6px" }}>
      <div style={{ fontSize: "9px", color: T.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "6px" }}>{role}</div>
      <div style={{ fontSize: "13px", fontWeight: 700, color: T.text }}>{name}</div>
      {logo}
    </div>
    <div style={{ height: "1px", background: T.border, margin: "14px 0" }} />
    <div style={{ flex: 1 }}>
      {navItems.map(n => (
        <div key={n.id} onClick={() => setTab(n.id)}
          style={{ display: "flex", alignItems: "center", gap: "8px", padding: "9px 10px", borderRadius: "8px", cursor: "pointer", marginBottom: "3px", background: tab === n.id ? `${accent}18` : "transparent", borderLeft: tab === n.id ? `2px solid ${accent}` : "2px solid transparent", color: tab === n.id ? accent : T.muted, fontWeight: tab === n.id ? 700 : 400, fontSize: "13px", transition: "all 0.15s", userSelect: "none" }}>
          <span style={{ fontSize: "14px" }}>{n.icon}</span>
          {n.label}
          {n.badge > 0 && <span style={{ marginLeft: "auto", background: T.red, color: "white", fontSize: "9px", fontWeight: 700, padding: "1px 5px", borderRadius: "8px" }}>{n.badge}</span>}
        </div>
      ))}
    </div>
    <div style={{ height: "1px", background: T.border, margin: "14px 0" }} />
    <div onClick={onBack} style={{ fontSize: "11px", color: T.muted, cursor: "pointer", userSelect: "none" }}>← Switch role</div>
  </div>
);

// ── ROLE SELECTION ─────────────────────────────────────────────────────────
const RoleSelect = ({ onSelect }) => (
  <div style={{ minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px", fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>
    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
      <div style={{ width: "36px", height: "36px", background: `linear-gradient(135deg, ${T.orange}, ${T.purple})`, borderRadius: "9px" }} />
      <span style={{ fontSize: "28px", fontWeight: 700, color: T.text, letterSpacing: "-0.03em" }}>DualEdge</span>
    </div>
    <p style={{ color: T.muted, marginBottom: "52px", fontSize: "13px" }}>The dual career platform for student-athletes</p>
    <div style={{ display: "flex", gap: "16px", maxWidth: "520px", width: "100%", flexWrap: "wrap" }}>
      {[
        { role: "athlete", label: "Student-athlete", sub: "Manage your training, academics & wellbeing in one place", color: T.orange, icon: "🏅" },
        { role: "coach", label: "Coach / advisor", sub: "Monitor athlete wellbeing, load, and flag at-risk players", color: T.purple, icon: "📋" },
      ].map(({ role, label, sub, color, icon }) => (
        <div key={role} onClick={() => onSelect(role)}
          style={{ flex: 1, minWidth: "200px", ...card({ cursor: "pointer", textAlign: "center", padding: "28px 20px" }) }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.transform = "translateY(-3px)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = "none"; }}>
          <div style={{ fontSize: "38px", marginBottom: "14px" }}>{icon}</div>
          <div style={{ height: "2px", background: color, borderRadius: "1px", marginBottom: "14px" }} />
          <div style={{ fontSize: "16px", fontWeight: 700, color: T.text, marginBottom: "6px" }}>{label}</div>
          <div style={{ fontSize: "12px", color: T.muted, lineHeight: 1.6 }}>{sub}</div>
        </div>
      ))}
    </div>
  </div>
);

// ── ATHLETE: TODAY ─────────────────────────────────────────────────────────
const TodayView = () => {
  const training = todayEvents.filter(e => e.type === "training").length;
  const academic = todayEvents.filter(e => e.type === "academic").length;
  const urgent = todayEvents.filter(e => e.urgent).length;
  return (
    <div>
      <div style={{ marginBottom: "18px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: 700, color: T.text, marginBottom: "3px" }}>Today's schedule</h2>
        <p style={{ color: T.muted, fontSize: "12px" }}>Wednesday 24 June 2026</p>
      </div>
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
        <Badge color={T.orange}>{training} training</Badge>
        <Badge color={T.purple}>{academic} academic</Badge>
        {urgent > 0 && <Badge color={T.red}>{urgent} urgent</Badge>}
      </div>
      <div style={{ ...card({ marginBottom: "16px", padding: "14px 18px" }) }}>
        <DualStrip />
        <div style={{ fontSize: "11px", color: T.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" }}>Weekly workload balance</div>
        <div style={{ display: "flex", gap: "2px", height: "10px", borderRadius: "5px", overflow: "hidden", marginBottom: "8px" }}>
          <div style={{ flex: 3, background: T.orange }} />
          <div style={{ flex: 4, background: T.purple }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px" }}>
          <span style={{ color: T.orange, fontWeight: 600 }}>Athletic 43%</span>
          <span style={{ color: T.purple, fontWeight: 600 }}>Academic 57%</span>
        </div>
      </div>
      {todayEvents.map((ev, i) => (
        <div key={i} style={{ display: "flex", gap: "12px", marginBottom: "9px", alignItems: "flex-start" }}>
          <div style={{ width: "44px", textAlign: "right", paddingTop: "12px", flexShrink: 0 }}>
            <span style={{ color: T.muted, fontSize: "11px" }}>{ev.time}</span>
          </div>
          <div style={{ width: "2px", background: ev.type === "training" ? T.orange : T.purple, borderRadius: "1px", flexShrink: 0, marginTop: "12px", alignSelf: "stretch", minHeight: "44px" }} />
          <div style={{ flex: 1, ...card({ padding: "10px 13px", border: ev.urgent ? `1px solid ${T.red}44` : `1px solid ${T.border}` }) }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ display: "flex", gap: "6px", marginBottom: "4px" }}>
                  {ev.urgent && <Badge color={T.red}>Urgent</Badge>}
                  <Badge color={ev.type === "training" ? T.orange : T.purple}>{ev.type}</Badge>
                </div>
                <div style={{ color: T.text, fontWeight: 600, fontSize: "13px" }}>{ev.title}</div>
                {ev.location && <div style={{ color: T.muted, fontSize: "11px", marginTop: "2px" }}>{ev.location}</div>}
              </div>
              {ev.duration && <span style={{ color: T.muted, fontSize: "10px", flexShrink: 0, marginLeft: "8px" }}>{ev.duration}</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// ── ATHLETE: SCHEDULE ──────────────────────────────────────────────────────
const ScheduleView = () => {
  const days = Object.keys(weekSchedule);
  const today = "Wed";
  return (
    <div>
      <h2 style={{ fontSize: "18px", fontWeight: 700, color: T.text, marginBottom: "3px" }}>Weekly schedule</h2>
      <p style={{ color: T.muted, fontSize: "12px", marginBottom: "18px" }}>22–28 June 2026</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "5px" }}>
        {days.map(day => (
          <div key={day} style={{ ...card({ padding: "9px 6px", border: `1px solid ${day === today ? T.orange + "55" : T.border}`, background: day === today ? T.card2 : T.card }) }}>
            <div style={{ textAlign: "center", marginBottom: "8px", fontSize: "10px", color: day === today ? T.orange : T.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>{day}</div>
            {weekSchedule[day].map((ev, i) => (
              <div key={i} style={{ background: ev.type === "training" ? `${T.orange}18` : `${T.purple}18`, borderLeft: `2px solid ${ev.type === "training" ? T.orange : T.purple}`, borderRadius: "3px", padding: "3px 4px", marginBottom: "3px" }}>
                <div style={{ fontSize: "9px", color: ev.type === "training" ? T.orange : T.purple, fontWeight: 700 }}>{ev.time}</div>
                <div style={{ fontSize: "9px", color: T.text, lineHeight: 1.3 }}>{ev.title}</div>
                {ev.urgent && <div style={{ fontSize: "9px", color: T.red, fontWeight: 700 }}>Due</div>}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

// ── ATHLETE: WELLBEING ─────────────────────────────────────────────────────
const WellbeingView = () => {
  const [vals, setVals] = useState({ sleep: 7, energy: 6, mood: 7, stress: 5 });
  const [saved, setSaved] = useState(false);
  const overall = +((vals.sleep + vals.energy + vals.mood + (10 - vals.stress)) / 4).toFixed(1);
  const oColor = overall >= 7 ? T.green : overall >= 5 ? T.yellow : T.red;
  const fields = [
    { k: "sleep", label: "Sleep quality", color: T.purple },
    { k: "energy", label: "Energy level", color: T.orange },
    { k: "mood", label: "Mood", color: T.green },
    { k: "stress", label: "Stress level", color: T.red },
  ];
  return (
    <div>
      <h2 style={{ fontSize: "18px", fontWeight: 700, color: T.text, marginBottom: "3px" }}>Wellbeing tracker</h2>
      <p style={{ color: T.muted, fontSize: "12px", marginBottom: "18px" }}>Daily check-in and 7-day trends</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
        <div style={card()}>
          <DualStrip />
          <div style={{ fontSize: "11px", color: T.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "14px" }}>Today's check-in</div>
          {fields.map(({ k, label, color }) => (
            <div key={k} style={{ marginBottom: "13px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                <span style={{ color: T.muted, fontSize: "11px" }}>{label}</span>
                <span style={{ color, fontSize: "11px", fontWeight: 700 }}>{vals[k]}/10</span>
              </div>
              <input type="range" min="1" max="10" step="1" value={vals[k]}
                onChange={e => { setVals(v => ({ ...v, [k]: Number(e.target.value) })); setSaved(false); }}
                style={{ width: "100%", accentColor: color, cursor: "pointer" }} />
            </div>
          ))}
          <button onClick={() => setSaved(true)}
            style={{ width: "100%", padding: "10px", background: saved ? `${T.green}22` : `linear-gradient(135deg, ${T.orange}, ${T.purple})`, border: saved ? `1px solid ${T.green}44` : "none", borderRadius: "9px", color: saved ? T.green : "white", fontWeight: 700, fontSize: "13px", cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}>
            {saved ? "✓ Check-in saved" : "Save check-in"}
          </button>
        </div>
        <div style={card()}>
          <DualStrip />
          <div style={{ fontSize: "11px", color: T.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "14px" }}>Current status</div>
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div style={{ fontSize: "54px", fontWeight: 700, color: oColor, lineHeight: 1 }}>{overall}</div>
            <div style={{ fontSize: "12px", color: T.muted, marginTop: "4px" }}>overall score</div>
          </div>
          {fields.map(({ k, label, color }) => (
            <div key={k} style={{ marginBottom: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <span style={{ fontSize: "11px", color: T.muted }}>{label}</span>
                <span style={{ fontSize: "11px", color, fontWeight: 700 }}>{vals[k]}</span>
              </div>
              <div style={{ height: "5px", background: T.border, borderRadius: "3px" }}>
                <div style={{ height: "100%", width: `${vals[k] * 10}%`, background: color, borderRadius: "3px", transition: "width 0.3s" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={card()}>
        <DualStrip />
        <div style={{ fontSize: "11px", color: T.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "14px" }}>7-day wellbeing trend</div>
        <ResponsiveContainer width="100%" height={150}>
          <LineChart data={wellbeingHistory} margin={{ top: 4, right: 4, bottom: 0, left: -22 }}>
            <XAxis dataKey="day" tick={{ fill: T.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 10]} tick={{ fill: T.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: T.card2, border: `1px solid ${T.border}`, borderRadius: "8px", color: T.text, fontSize: "12px" }} />
            <Line type="monotone" dataKey="overall" stroke={T.orange} strokeWidth={2.5} dot={{ fill: T.orange, r: 3 }} name="Overall" />
            <Line type="monotone" dataKey="sleep" stroke={T.purple} strokeWidth={1.5} dot={false} strokeDasharray="4 2" name="Sleep" />
            <Line type="monotone" dataKey="energy" stroke={T.green} strokeWidth={1.5} dot={false} strokeDasharray="4 2" name="Energy" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// ── ATHLETE: PERFORMANCE ───────────────────────────────────────────────────
const PerformanceView = () => {
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState("Training");
  const [rating, setRating] = useState(7);
  const [notes, setNotes] = useState("");
  return (
    <div>
      <h2 style={{ fontSize: "18px", fontWeight: 700, color: T.text, marginBottom: "3px" }}>Performance log</h2>
      <p style={{ color: T.muted, fontSize: "12px", marginBottom: "18px" }}>Sessions, PBs, and progress tracking</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "18px" }}>
        {[{ label: "Sessions this week", value: "6", color: T.orange }, { label: "Average score", value: "7.4", color: T.green }, { label: "Training load", value: "High", color: T.red }].map((s, i) => (
          <div key={i} style={{ ...card({ textAlign: "center", padding: "14px" }) }}>
            <div style={{ fontSize: "24px", fontWeight: 700, color: s.color, marginBottom: "3px" }}>{s.value}</div>
            <div style={{ fontSize: "10px", color: T.muted, textTransform: "uppercase", letterSpacing: "0.07em" }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
        <div style={{ fontSize: "11px", color: T.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Recent sessions</div>
        <button onClick={() => setShowForm(!showForm)}
          style={{ padding: "7px 14px", background: `linear-gradient(135deg, ${T.orange}, ${T.purple})`, border: "none", borderRadius: "7px", color: "white", fontWeight: 700, fontSize: "11px", cursor: "pointer", fontFamily: "inherit" }}>
          + Log session
        </button>
      </div>
      {showForm && (
        <div style={{ ...card({ marginBottom: "12px", border: `1px solid ${T.orange}44` }) }}>
          <DualStrip />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", color: T.muted, marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.07em" }}>Session type</label>
              <select value={type} onChange={e => setType(e.target.value)}
                style={{ width: "100%", background: T.card2, border: `1px solid ${T.border}`, borderRadius: "7px", padding: "8px 10px", color: T.text, fontSize: "12px", fontFamily: "inherit" }}>
                <option>Training</option><option>Match</option><option>Recovery</option><option>S&C</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "11px", color: T.muted, marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.07em" }}>Rating: {rating}/10</label>
              <input type="range" min="1" max="10" step="1" value={rating} onChange={e => setRating(Number(e.target.value))}
                style={{ width: "100%", accentColor: T.orange, marginTop: "8px", cursor: "pointer" }} />
            </div>
          </div>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes, PBs, key moments..."
            style={{ width: "100%", background: T.card2, border: `1px solid ${T.border}`, borderRadius: "7px", padding: "9px 11px", color: T.text, fontSize: "12px", minHeight: "68px", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }} />
          <button onClick={() => { setShowForm(false); setNotes(""); }}
            style={{ marginTop: "10px", padding: "9px 18px", background: `linear-gradient(135deg, ${T.orange}, ${T.purple})`, border: "none", borderRadius: "7px", color: "white", fontWeight: 700, fontSize: "12px", cursor: "pointer", fontFamily: "inherit" }}>
            Save session
          </button>
        </div>
      )}
      {performanceLog.map((log, i) => (
        <div key={i} style={{ ...card({ padding: "12px 14px", marginBottom: "8px" }) }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ display: "flex", gap: "6px", alignItems: "center", marginBottom: "4px" }}>
                <Badge color={log.type === "Match" ? T.purple : T.orange}>{log.type}</Badge>
                <span style={{ color: T.muted, fontSize: "10px" }}>{log.date}</span>
              </div>
              <div style={{ color: T.text, fontWeight: 600, fontSize: "13px", marginBottom: "2px" }}>{log.title}</div>
              <div style={{ color: T.muted, fontSize: "11px" }}>{log.notes}</div>
            </div>
            <div style={{ textAlign: "center", flexShrink: 0, marginLeft: "14px" }}>
              <div style={{ fontSize: "22px", fontWeight: 700, color: log.score >= 8 ? T.green : log.score >= 6 ? T.yellow : T.red }}>{log.score}</div>
              <div style={{ fontSize: "9px", color: T.muted }}>score</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// ── ATHLETE APP ────────────────────────────────────────────────────────────
const AthleteApp = ({ onBack }) => {
  const [tab, setTab] = useState("today");
  const navItems = [
    { id: "today", label: "Today", icon: "📅" },
    { id: "schedule", label: "Schedule", icon: "🗓" },
    { id: "wellbeing", label: "Wellbeing", icon: "💚" },
    { id: "performance", label: "Performance", icon: "📈" },
  ];
  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Space Grotesk', system-ui, sans-serif", display: "flex" }}>
      <Sidebar
        name="Alex Johnson" role="Student-athlete" accent={T.orange}
        logo={<div style={{ fontSize: "11px", color: T.muted }}>Swimming · Year 2 · Sports Science</div>}
        navItems={navItems} tab={tab} setTab={setTab} onBack={onBack}
      />
      <div style={{ flex: 1, padding: "28px", overflowY: "auto", maxHeight: "100vh" }}>
        {tab === "today" && <TodayView />}
        {tab === "schedule" && <ScheduleView />}
        {tab === "wellbeing" && <WellbeingView />}
        {tab === "performance" && <PerformanceView />}
      </div>
    </div>
  );
};

// ── COACH: SQUAD ───────────────────────────────────────────────────────────
const SquadView = () => {
  const atRisk = athletes.filter(a => a.status === "at-risk");
  return (
    <div>
      <h2 style={{ fontSize: "18px", fontWeight: 700, color: T.text, marginBottom: "3px" }}>Squad overview</h2>
      <p style={{ color: T.muted, fontSize: "12px", marginBottom: "18px" }}>Wednesday 24 June 2026</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginBottom: "18px" }}>
        {[
          { label: "Total athletes", value: athletes.length, color: T.text },
          { label: "At risk", value: athletes.filter(a => a.status === "at-risk").length, color: T.red },
          { label: "Monitor", value: athletes.filter(a => a.status === "watch").length, color: T.yellow },
          { label: "On track", value: athletes.filter(a => a.status === "good").length, color: T.green },
        ].map((s, i) => (
          <div key={i} style={{ ...card({ textAlign: "center", padding: "14px" }) }}>
            <div style={{ fontSize: "28px", fontWeight: 700, color: s.color, marginBottom: "3px" }}>{s.value}</div>
            <div style={{ fontSize: "10px", color: T.muted, textTransform: "uppercase", letterSpacing: "0.07em" }}>{s.label}</div>
          </div>
        ))}
      </div>
      {atRisk.length > 0 && (
        <div style={{ ...card({ marginBottom: "14px", border: `1px solid ${T.red}44` }) }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: T.red, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" }}>Requires attention</div>
          {atRisk.map(a => (
            <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${T.border}` }}>
              <div>
                <div style={{ color: T.text, fontWeight: 600, fontSize: "13px" }}>{a.name}</div>
                <div style={{ color: T.muted, fontSize: "11px" }}>{a.sport} · Stress: <span style={{ color: T.red, fontWeight: 700 }}>{a.wellbeing.stress}/10</span></div>
              </div>
              <Badge color={T.red}>At risk</Badge>
            </div>
          ))}
        </div>
      )}
      <div style={{ fontSize: "11px", color: T.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>Full squad</div>
      {athletes.map(a => {
        const sc = a.status === "at-risk" ? T.red : a.status === "watch" ? T.yellow : T.green;
        const avg = Math.round((a.wellbeing.sleep + a.wellbeing.energy + a.wellbeing.mood + (10 - a.wellbeing.stress)) / 4);
        return (
          <div key={a.id} style={{ ...card({ padding: "12px 14px", marginBottom: "8px" }) }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: `${sc}22`, border: `1.5px solid ${sc}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700, color: sc, flexShrink: 0 }}>
                {a.name.charAt(0)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: T.text, fontWeight: 600, fontSize: "13px" }}>{a.name}</div>
                <div style={{ color: T.muted, fontSize: "11px" }}>{a.sport} · {a.course} · {a.year}</div>
              </div>
              <div style={{ display: "flex", gap: "14px", alignItems: "center", flexShrink: 0 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "16px", fontWeight: 700, color: avg >= 7 ? T.green : avg >= 5 ? T.yellow : T.red }}>{avg}</div>
                  <div style={{ fontSize: "9px", color: T.muted }}>Wellbeing</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: T.orange }}>{a.athleticLoad}%</div>
                  <div style={{ fontSize: "9px", color: T.muted }}>Athletic</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: T.purple }}>{a.academicLoad}%</div>
                  <div style={{ fontSize: "9px", color: T.muted }}>Academic</div>
                </div>
                <Badge color={sc}>{a.status === "at-risk" ? "At risk" : a.status === "watch" ? "Monitor" : "On track"}</Badge>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ── COACH: ALERTS ──────────────────────────────────────────────────────────
const AlertsView = () => (
  <div>
    <h2 style={{ fontSize: "18px", fontWeight: 700, color: T.text, marginBottom: "3px" }}>Alerts & flags</h2>
    <p style={{ color: T.muted, fontSize: "12px", marginBottom: "18px" }}>Athletes requiring attention</p>
    {athletes.filter(a => a.status !== "good").map(a => {
      const sc = a.status === "at-risk" ? T.red : T.yellow;
      return (
        <div key={a.id} style={{ ...card({ marginBottom: "12px", border: `1px solid ${sc}44` }) }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "8px" }}>
                <Badge color={sc}>{a.status === "at-risk" ? "At risk" : "Monitor"}</Badge>
                <span style={{ color: T.muted, fontSize: "10px" }}>Last check-in: {a.lastCheckIn}</span>
              </div>
              <div style={{ color: T.text, fontWeight: 700, fontSize: "14px" }}>{a.name}</div>
              <div style={{ color: T.muted, fontSize: "11px", marginBottom: "12px" }}>{a.sport} · {a.course} · {a.year}</div>
              <div style={{ display: "flex", gap: "16px" }}>
                {Object.entries(a.wellbeing).map(([k, v]) => {
                  const flagged = k === "stress" ? v >= 7 : v <= 4;
                  return (
                    <div key={k}>
                      <div style={{ fontSize: "10px", color: T.muted, textTransform: "capitalize", marginBottom: "2px" }}>{k}</div>
                      <div style={{ fontSize: "15px", fontWeight: 700, color: flagged ? T.red : T.green }}>{v}/10</div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px", flexShrink: 0, marginLeft: "16px" }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "10px", color: T.muted }}>Workload</div>
                <div style={{ fontSize: "11px", color: T.orange, fontWeight: 600 }}>{a.athleticLoad}% athletic</div>
                <div style={{ fontSize: "11px", color: T.purple, fontWeight: 600 }}>{a.academicLoad}% academic</div>
              </div>
              <button style={{ padding: "7px 14px", background: `${sc}18`, border: `1px solid ${sc}44`, borderRadius: "7px", color: sc, fontWeight: 700, fontSize: "11px", cursor: "pointer", fontFamily: "inherit" }}>
                Contact athlete
              </button>
            </div>
          </div>
        </div>
      );
    })}
  </div>
);

// ── COACH APP ──────────────────────────────────────────────────────────────
const CoachApp = ({ onBack }) => {
  const [tab, setTab] = useState("squad");
  const alertCount = athletes.filter(a => a.status !== "good").length;
  const navItems = [
    { id: "squad", label: "Squad", icon: "👥" },
    { id: "alerts", label: "Alerts", icon: "⚠️", badge: alertCount },
  ];
  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Space Grotesk', system-ui, sans-serif", display: "flex" }}>
      <Sidebar
        name="Dr. Sarah Williams" role="Coach / advisor" accent={T.purple}
        logo={<div style={{ fontSize: "11px", color: T.muted }}>Head of Performance · 6 athletes</div>}
        navItems={navItems} tab={tab} setTab={setTab} onBack={onBack}
      />
      <div style={{ flex: 1, padding: "28px", overflowY: "auto", maxHeight: "100vh" }}>
        {tab === "squad" && <SquadView />}
        {tab === "alerts" && <AlertsView />}
      </div>
    </div>
  );
};

// ── ROOT ───────────────────────────────────────────────────────────────────
export default function App() {
  const [role, setRole] = useState(null);
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #08080f; }
        ::-webkit-scrollbar-thumb { background: #1f1f38; border-radius: 3px; }
        select option { background: #18182e; }
      `}</style>
      {!role && <RoleSelect onSelect={setRole} />}
      {role === "athlete" && <AthleteApp onBack={() => setRole(null)} />}
      {role === "coach" && <CoachApp onBack={() => setRole(null)} />}
    </>
  );
}
