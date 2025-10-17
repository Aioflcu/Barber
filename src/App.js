import React, { useEffect, useMemo, useRef, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

/* --------------------
  Core app: FadeMaster Pro
  - Multi-page: Book / Bookings / Services
  - Tailwind via CDN in index.html
  - LocalStorage persistence
  - Framer Motion animations
  - Floating Book button
---------------------*/

const STORAGE = {
  BOOKINGS: "fm_bookings_v1",
  THEME: "fm_theme_v1",
  SERVICES: "fm_services_v1"
};

const DEFAULT_SERVICES = [
  { id: "s1", name: "Haircut", price: 2000, minutes: 30 },
  { id: "s2", name: "Beard Trim", price: 1000, minutes: 15 },
  { id: "s3", name: "Hair Dye", price: 2500, minutes: 60 },
  { id: "s4", name: "Full Groom", price: 3500, minutes: 75 }
];

// small ID util
const id = (p = "") => `${p}${Date.now().toString(36)}${Math.random().toString(36).slice(2,6)}`;

/* ---------------- Header / Navbar ---------------- */
function Navbar({ theme, setTheme }) {
  return (
    <header className="w-full glass py-3 px-4 sm:px-6 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 flex items-center justify-center rounded-xl btn-primary text-white font-bold shadow-neon">FP</div>
          <div>
            <div className="text-xl font-bold">FadeMaster Pro <span className="text-sm">✂️</span></div>
            <div className="text-xs text-gray-300">Smart booking for barbers</div>
          </div>
        </div>

        <nav className="flex items-center gap-3">
          <Link className="px-3 py-2 rounded-md bg-white/5 hover:bg-white/6" to="/">Book</Link>
          <Link className="px-3 py-2 rounded-md bg-white/5 hover:bg-white/6" to="/bookings">Bookings</Link>
          <Link className="px-3 py-2 rounded-md bg-white/5 hover:bg-white/6" to="/services">Services</Link>
          <button onClick={() => setTheme(t => t === "dark" ? "light" : "dark")} className="px-3 py-2 rounded-md bg-white/5">
            {theme === "dark" ? "Light" : "Dark"}
          </button>
        </nav>
      </div>
    </header>
  );
}

/* ---------------- Floating Book Button ---------------- */
function FloatingBook() {
  return (
    <motion.a
      href="https://wa.me/2349131493788?text=Hi%20FadeMaster%20Pro,%20I%20want%20to%20book%20an%20appointment"
      target="_blank"
      rel="noreferrer"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 120 }}
      whileHover={{ scale: 1.06, boxShadow: "0 0 25px rgba(99,102,241,0.18)" }}
      className="fixed right-5 bottom-5 btn-gold rounded-full px-5 py-3 z-50"
    >
      💬 Book Now
    </motion.a>
  );
}

/* ---------------- Home / Book Page ---------------- */
function BookPage({ services, onBook }) {
  const [form, setForm] = useState({
    name: "", phone: "", date: "", time: "", serviceId: services[0]?.id || "", notes: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const nav = useNavigate();

  useEffect(() => {
    if (!services.find(s => s.id === form.serviceId)) {
      setForm(f => ({ ...f, serviceId: services[0]?.id || "" }));
    }
  }, [services]);

  const validate = () => {
    if (!form.name.trim()) return "Please enter your name";
    if (!/^\+?\d{7,15}$/.test(form.phone.trim())) return "Enter a valid phone (digits, optional +)";
    if (!form.date) return "Select a date";
    if (!form.time) return "Select a time";
    return null;
  };

  const submit = (e) => {
    e.preventDefault();
    setError("");
    const v = validate();
    if (v) { setError(v); return; }
    const dt = new Date(`${form.date}T${form.time}`);
    if (isNaN(dt.getTime())) { setError("Invalid date/time"); return; }
    if (dt < new Date()) { setError("Cannot book in the past"); return; }

    const svc = services.find(s => s.id === form.serviceId);
    const booking = {
      id: id("b_"),
      name: form.name.trim(),
      phone: form.phone.trim(),
      datetime: dt.toISOString(),
      serviceId: svc.id,
      serviceName: svc.name,
      price: svc.price,
      notes: form.notes,
      status: "upcoming",
      createdAt: new Date().toISOString()
    };
    onBook(booking);
    setSuccess("Appointment booked!");
    setTimeout(() => { setSuccess(""); nav("/bookings"); }, 1100);
    setForm({ ...form, name: "", phone: "", date: "", time: "", notes: "" });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto space-y-6">
      <div className="glass p-5 rounded-xl">
        <h2 className="text-lg font-semibold mb-2">Book an appointment</h2>
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input value={form.name} onChange={(e)=>setForm(f=>({...f,name:e.target.value}))} placeholder="Full name" className="p-3 rounded-lg bg-white/5" />
            <input value={form.phone} onChange={(e)=>setForm(f=>({...f,phone:e.target.value}))} placeholder="Phone (+234...)" className="p-3 rounded-lg bg-white/5" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input type="date" value={form.date} onChange={(e)=>setForm(f=>({...f,date:e.target.value}))} className="p-3 rounded-lg bg-white/5" />
            <input type="time" value={form.time} onChange={(e)=>setForm(f=>({...f,time:e.target.value}))} className="p-3 rounded-lg bg-white/5" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select className="p-3 rounded-lg bg-white/5" value={form.serviceId} onChange={(e)=>setForm(f=>({...f,serviceId:e.target.value}))}>
              {services.map(s=> <option key={s.id} value={s.id}>{s.name} — ₦{s.price}</option>)}
            </select>
            <input placeholder="Notes (optional)" value={form.notes} onChange={(e)=>setForm(f=>({...f,notes:e.target.value}))} className="p-3 rounded-lg bg-white/5" />
          </div>

          {error && <div className="text-sm text-red-400">{error}</div>}
          {success && <div className="text-sm text-green-300">{success}</div>}

          <div className="flex gap-3">
            <button type="submit" className="btn-primary rounded-full px-5 py-2">Book Now</button>
            <button type="button" onClick={()=> {
              setForm({
                name: "John Doe", phone: "+2348012345678", date: new Date().toISOString().slice(0,10),
                time: "10:00", serviceId: services[0]?.id || "", notes: ""
              });
            }} className="btn-gold rounded-full px-4 py-2">Quick Fill</button>
          </div>
        </form>
      </div>
      <div className="text-sm text-gray-400">We operate Mon–Sat • 09:00 — 19:00</div>
    </motion.div>
  );
}

/* ---------------- Bookings Page ---------------- */
function BookingsPage({ bookings, onComplete, onDelete }) {
  const [filter, setFilter] = useState("all");
  const filtered = bookings.filter(b => filter === "all" ? true : b.status === filter);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Bookings</h2>
        <div className="flex items-center gap-2">
          <select value={filter} onChange={(e)=>setFilter(e.target.value)} className="p-2 rounded-md bg-white/5">
            <option value="all">All</option>
            <option value="upcoming">Upcoming</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="p-6 text-center text-gray-400 glass rounded-xl">No bookings yet.</div>
      ) : (
        <div className="grid gap-3">
          {filtered.map(b => (
            <article key={b.id} className="glass p-4 rounded-xl flex flex-col sm:flex-row sm:justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <div className="text-lg font-semibold">{b.name}</div>
                  <div className={`text-xs px-2 py-1 rounded ${b.status === "completed" ? "bg-green-500 text-black" : "bg-yellow-400 text-black"}`}>{b.status}</div>
                </div>
                <div className="text-sm text-gray-300">{b.serviceName} — ₦{b.price}</div>
                <div className="text-xs text-gray-400">{new Date(b.datetime).toLocaleString()}</div>
                {b.notes && <div className="mt-2 text-sm text-gray-300">Note: {b.notes}</div>}
              </div>

              <div className="flex items-center gap-2">
                {b.status !== "completed" && <button onClick={()=>onComplete(b.id)} className="px-3 py-2 bg-green-500 rounded-md">✅ Complete</button>}
                <a href={`https://wa.me/${b.phone.replace(/[^0-9]/g,'')}`} target="_blank" rel="noreferrer" className="px-3 py-2 bg-cyan-400 rounded-md">💬 WhatsApp</a>
                <button onClick={()=>onDelete(b.id)} className="px-3 py-2 bg-red-500 rounded-md text-white">❌ Delete</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </motion.div>
  );
}

/* ---------------- Services Page ---------------- */
function ServicesPage({ services, addService, removeService }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Services</h2>
        <div>
          <button onClick={()=> addService({ name: "Express Cut", price: 1500, minutes: 20 })} className="px-3 py-2 bg-white/5 rounded-md">+ Add</button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {services.map(s => (
          <div key={s.id} className="glass p-4 rounded-xl flex items-center justify-between">
            <div>
              <div className="font-semibold">{s.name}</div>
              <div className="text-xs text-gray-400">₦{s.price} • {s.minutes} mins</div>
            </div>
            <div className="flex flex-col gap-2">
              <button onClick={()=>navigator.clipboard?.writeText(`${s.name} — ₦${s.price}`)} className="px-3 py-2 bg-white/5 rounded-md">Copy</button>
              <button onClick={()=>removeService(s.id)} className="px-3 py-2 bg-red-600 text-white rounded-md">Remove</button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* ---------------- Main App ---------------- */
export default function App() {
  // theme persisted
  const [theme, setTheme] = useState(() => localStorage.getItem(STORAGE.THEME) || "dark");
  useEffect(()=> localStorage.setItem(STORAGE.THEME, theme), [theme]);

  // bookings persisted
  const [bookings, setBookings] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE.BOOKINGS) || "[]"); } catch { return []; }
  });
  useEffect(()=> localStorage.setItem(STORAGE.BOOKINGS, JSON.stringify(bookings)), [bookings]);

  // services persisted
  const [services, setServices] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE.SERVICES) || "null") || DEFAULT_SERVICES; } catch { return DEFAULT_SERVICES; }
  });
  useEffect(()=> localStorage.setItem(STORAGE.SERVICES, JSON.stringify(services)), [services]);

  // handlers
  const handleBook = (bk) => setBookings(prev => [bk, ...prev]);
  const handleComplete = (id) => setBookings(prev => prev.map(b => b.id === id ? {...b, status: "completed"} : b));
  const handleDelete = (id) => setBookings(prev => prev.filter(b => b.id !== id));

  const addService = (s) => setServices(prev => [{...s, id: id("s_")}, ...prev]);
  const removeService = (sid) => setServices(prev => prev.filter(s => s.id !== sid));

  // runtime styling toggles
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.style.background = "linear-gradient(180deg,#06070a,#0b0f16)";
      root.style.color = "#e6eef8";
    } else {
      root.style.background = "#f7f7fb";
      root.style.color = "#0b1226";
    }
  }, [theme]);

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar theme={theme} setTheme={setTheme} />

        <main className="flex-1 max-w-6xl mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<BookPage services={services} onBook={handleBook} />} />
            <Route path="/bookings" element={<BookingsPage bookings={bookings} onComplete={handleComplete} onDelete={handleDelete} />} />
            <Route path="/services" element={<ServicesPage services={services} addService={addService} removeService={removeService} />} />
            <Route path="*" element={<BookPage services={services} onBook={handleBook} />} />
          </Routes>
        </main>

        <footer className="py-4 px-4 glass">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <div className="font-semibold">Working Hours</div>
              <div className="text-xs text-gray-400">Mon–Sat • 09:00 — 19:00</div>
            </div>
            <div className="text-xs text-gray-400">Built by OlufemiDavid 🚀</div>
          </div>
        </footer>

        <FloatingBook />
      </div>
    </Router>
  );
}
