// src/pages/AdminDashboard.jsx
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import API, { setAuthToken } from "../api.js";
import { getToken, clearAuth } from "../auth.js";

// --- DEFAULT FORM STATE FOR BARRIERS ---
const INITIAL_BARRIER_FORM = {
  nameTa: "",
  personName: "",
  roleTa: "",
  phone: "",
  photoUrl: ""
};

export default function AdminDashboard() {
  // --- AUTH & USER STATE ---
  const [loadingUser, setLoadingUser] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // --- NEWS STATE ---
  const [newsList, setNewsList] = useState([]);
  const [newsForm, setNewsForm] = useState({ title: "", content: "", imageUrl: "", category: "district" });

  // --- EVENTS STATE ---
  const [events, setEvents] = useState([]);
  const [eventForm, setEventForm] = useState({ title: "", description: "", imageUrl: "", date: "", location: "" });

  // --- PARTY BARRIER STATE ---
  const [partyNetwork, setPartyNetwork] = useState([]);
  const [barrierStatus, setBarrierStatus] = useState("");

  // Selection State for Hierarchy
  const [selUnionId, setSelUnionId] = useState("");
  const [selVillageId, setSelVillageId] = useState("");
  const [selWardId, setSelWardId] = useState("");
  const [selBoothId, setSelBoothId] = useState("");

  // CRUD State
  const [barrierForm, setBarrierForm] = useState(INITIAL_BARRIER_FORM);
  const [targetLevel, setTargetLevel] = useState("");
  const [targetParentId, setTargetParentId] = useState("");

  // ✅ STATES FOR EDIT & VIEW
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [viewNode, setViewNode] = useState(null);

  // Saving state to prevent double submits
  const [saving, setSaving] = useState(false);

  // --- 1. INITIALIZATION ---
  useEffect(() => {
    const init = async () => {
      const token = getToken();
      if (!token) {
        clearAuth();
        navigate("/admin/login");
        return;
      }

      // ensure axios has the token before any request
      setAuthToken(token);

      try {
        // NOTE: make sure this matches your backend mount -> /api/auth/me
        const { data } = await API.get("/api/auth/me");
        if (!data || data.role !== "admin") {
          clearAuth();
          navigate("/admin/login");
          return;
        }

        setUser(data);
        setLoadingUser(false);

        // load dashboard data
        await Promise.all([loadNews(), loadEvents(), loadPartyNetwork()]);
      } catch (err) {
        console.error("Failed to init admin:", err.response?.data || err.message);
        clearAuth();
        navigate("/admin/login");
      }
    };
    init();
  }, [navigate]);

  // --- DATA LOADERS ---
  const loadNews = async () => {
    try {
      const { data } = await API.get("/api/news");
      setNewsList(data || []);
    } catch (err) {
      console.error("loadNews failed", err?.response?.data || err?.message);
      setNewsList([]);
    }
  };

  const loadEvents = async () => {
    try {
      const { data } = await API.get("/api/events");
      setEvents(data || []);
    } catch (err) {
      console.error("loadEvents failed", err?.response?.data || err?.message);
      setEvents([]);
    }
  };

  const loadPartyNetwork = async () => {
    try {
      console.log("[AdminDashboard] loading party network...");
      const { data } = await API.get("/api/party-network");
      console.log("[AdminDashboard] party network loaded, count:", Array.isArray(data) ? data.length : "unknown");
      setPartyNetwork(data || []);
    } catch (err) {
      console.error("Failed to load party network", err?.response?.data || err?.message);
      setPartyNetwork([]);
    }
  };

  // --- NEWS HANDLERS ---
  const handleNewsChange = (e) => setNewsForm({ ...newsForm, [e.target.name]: e.target.value });
  const handleNewsSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/api/news", newsForm);
      setNewsForm({ title: "", content: "", imageUrl: "", category: "district" });
      await loadNews();
    } catch (err) {
      console.error("Error adding news", err?.response?.data || err?.message);
      alert("Error adding news");
    }
  };
  const handleNewsDelete = async (id) => {
    if (!confirm("Delete this news?")) return;
    try {
      await API.delete(`/api/news/${id}`);
      await loadNews();
    } catch (err) {
      console.error(err);
    }
  };

  // --- EVENTS HANDLERS ---
  const handleEventChange = (e) => setEventForm({ ...eventForm, [e.target.name]: e.target.value });
  const handleEventSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/api/events", eventForm);
      setEventForm({ title: "", description: "", imageUrl: "", date: "", location: "" });
      await loadEvents();
    } catch (err) {
      console.error("Error adding event", err?.response?.data || err?.message);
      alert("Error adding event");
    }
  };
  const handleEventDelete = async (id) => {
    if (!confirm("Delete this event?")) return;
    try {
      await API.delete(`/api/events/${id}`);
      await loadEvents();
    } catch (err) {
      console.error(err);
    }
  };

  // ==========================================
  // --- PARTY BARRIER LOGIC (HIERARCHY) ---
  // ==========================================

  const selectedUnion = useMemo(() => partyNetwork.find(u => u.id === selUnionId), [partyNetwork, selUnionId]);
  const selectedVillage = useMemo(() => selectedUnion?.villages?.find(v => v.id === selVillageId), [selectedUnion, selVillageId]);
  const selectedWard = useMemo(() => selectedVillage?.wards?.find(w => w.id === selWardId), [selectedVillage, selWardId]);
  const selectedBooth = useMemo(() => selectedWard?.booths?.find(b => b.id === selBoothId), [selectedWard, selBoothId]);

  const handleBarrierChange = (e) => setBarrierForm({ ...barrierForm, [e.target.name]: e.target.value });

  // ✅ NEW: HANDLE FILE UPLOAD (Convert to Base64)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("File is too large! Please select an image under 2MB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setBarrierForm(prev => ({ ...prev, photoUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // 1. OPEN ADD FORM
  const openAddForm = (level, parentId = null) => {
    setIsEditing(false);
    setEditId(null);
    setTargetLevel(level);
    setTargetParentId(parentId);
    setBarrierForm(INITIAL_BARRIER_FORM);
    setBarrierStatus(`Adding new ${level}...`);
  };

  // 2. OPEN EDIT FORM
  const openEditForm = (node, level, parentId) => {
    setIsEditing(true);
    setEditId(node.id);
    setTargetLevel(level);
    setTargetParentId(parentId);
    setBarrierForm({
      nameTa: node.nameTa,
      personName: node.person || "",
      roleTa: node.roleTa || "",
      phone: node.phone || "",
      photoUrl: node.photo || ""
    });
    setBarrierStatus(`Editing ${level}...`);
  };

  // 3. SUBMIT (Handles Add AND Edit) - improved
  const handleBarrierSubmit = async (e) => {
    e.preventDefault();
    if (!targetLevel) {
      setBarrierStatus("Error: Missing target level");
      return;
    }

    setSaving(true);
    setBarrierStatus(isEditing ? "Updating..." : "Saving...");

    const payload = {
      // include both naming variants to be tolerant to backend schema
      person: barrierForm.personName,
      personName: barrierForm.personName,
      type: targetLevel,
      parentId: targetParentId ? targetParentId : null,
      nameTa: barrierForm.nameTa,
      roleTa: barrierForm.roleTa,
      phone: barrierForm.phone,
      photo: barrierForm.photoUrl,
      photoUrl: barrierForm.photoUrl
    };

    try {
      console.log("[AdminDashboard] sending payload:", payload);

      let res;
      if (isEditing) {
        res = await API.put(`/api/party-network/${editId}`, payload);
        setBarrierStatus("Updated Successfully! ✅");
      } else {
        // fallback: both / and /add exist on server; using /add for clarity
        res = await API.post("/api/party-network/add", payload);
        setBarrierStatus("Saved Successfully! ✅");
      }

      console.log("[AdminDashboard] server response:", res?.data);
      setBarrierForm(INITIAL_BARRIER_FORM);
      setTargetLevel("");
      setIsEditing(false);
      setEditId(null);
      await loadPartyNetwork();
    } catch (err) {
      console.error("FULL ERROR DETAILS:", err?.response?.data || err?.message || err);
      const serverMessage = err?.response?.data?.message || err?.response?.data || err?.message || "Unknown error";
      setBarrierStatus(`Error: ${serverMessage}`);
    } finally {
      setSaving(false);
    }
  };

  const handleBarrierDelete = async (nodeId, level) => {
    if (!confirm(`Are you sure you want to delete this ${level}?`)) return;
    try {
      await API.delete(`/api/party-network/${nodeId}`, { data: { level } });
      await loadPartyNetwork();
    } catch (err) {
      console.error("Delete error:", err?.response?.data || err?.message);
      alert("Error deleting node.");
    }
  };

  const ActionButtons = ({ node, level, parentId }) => {
    if (!node) {
      return <button className="btn btn-primary" onClick={() => openAddForm(level, parentId)}>Add {level}</button>;
    }
    return (
      <div style={{ display: 'flex', gap: '5px' }}>
        <button className="btn btn-outline-small" style={{ backgroundColor: '#17a2b8', color: 'white', borderColor: '#17a2b8' }} onClick={() => setViewNode(node)}>View</button>
        <button className="btn btn-outline-small" style={{ backgroundColor: '#ffc107', color: 'black', borderColor: '#ffc107' }} onClick={() => openEditForm(node, level, parentId)}>Edit</button>
        <button className="btn btn-outline-small" onClick={() => handleBarrierDelete(node.id, level)}>Delete</button>
      </div>
    );
  };

  if (loadingUser) return <div className="page-wrap"><p>Loading Admin...</p></div>;

  return (
    <section className="page-wrap admin-page">
      <header className="page-header">
        <h1 className="section-heading-ta">நிர்வாக – செய்தி, நிகழ்வு & கட்சிப் பொறுப்பாளர்கள்</h1>
        {user && <p className="status-text">உள்நுழைந்தவர்: {user.name}</p>}
      </header>
      {/* ======================================================= */}
      {/* SECTION 1: PARTY BARRIER MANAGEMENT (HIERARCHY VIEW)    */}
      {/* ======================================================= */}
      <div className="admin-section-box" style={{ border: '2px solid #F26522', padding: '20px', borderRadius: '8px', marginBottom: '30px', backgroundColor: '#fff' }}>
        <h2 className="form-title-ta" style={{ color: '#F26522' }}>கட்சிப் பொறுப்பாளர்கள் மேலாண்மை (Party Barriers)</h2>

        {/* --- 1. SELECTORS (View) --- */}
        <div className="hierarchy-selectors" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '20px' }}>

          {/* UNION SELECT */}
          <div>
            <label className="form-label-ta">யூனியன்</label>
            <select className="input" value={selUnionId} onChange={e => { setSelUnionId(e.target.value); setSelVillageId(""); setSelWardId(""); setSelBoothId(""); }}>
              <option value="">— Select Union —</option>
              {partyNetwork.map(u => <option key={u.id} value={u.id}>{u.nameTa}</option>)}
            </select>
          </div>

          {/* VILLAGE SELECT */}
          <div>
            <label className="form-label-ta">கிராமம்</label>
            <select className="input" value={selVillageId} onChange={e => { setSelVillageId(e.target.value); setSelWardId(""); setSelBoothId(""); }} disabled={!selUnionId}>
              <option value="">— Select Village —</option>
              {selectedUnion?.villages?.map(v => <option key={v.id} value={v.id}>{v.nameTa}</option>)}
            </select>
          </div>

          {/* WARD SELECT */}
          <div>
            <label className="form-label-ta">வார்டு</label>
            <select className="input" value={selWardId} onChange={e => { setSelWardId(e.target.value); setSelBoothId(""); }} disabled={!selVillageId}>
              <option value="">— Select Ward —</option>
              {selectedVillage?.wards?.map(w => <option key={w.id} value={w.id}>{w.nameTa}</option>)}
            </select>
          </div>

          {/* BOOTH SELECT */}
          <div>
            <label className="form-label-ta">பூத்</label>
            <select className="input" value={selBoothId} onChange={e => setSelBoothId(e.target.value)} disabled={!selWardId}>
              <option value="">— Select Booth —</option>
              {selectedWard?.booths?.map(b => <option key={b.id} value={b.id}>{b.nameTa}</option>)}
            </select>
          </div>
        </div>

        {/* --- 2. DISPLAY & ACTIONS (List) --- */}
        <div className="hierarchy-display">
          <h3 className="section-subheading-ta">தற்போதைய பொறுப்பாளர்கள்:</h3>
          <ul className="admin-news-items">
            <li className="admin-news-item" style={{ borderLeft: '4px solid #F26522' }}>
              <div>
                <strong>யூனியன் நிலை:</strong> {selectedUnion ? selectedUnion.nameTa : "Not Selected"} <br />
                <span style={{ fontSize: '0.9rem', color: '#666' }}>{selectedUnion?.person || "No In-charge assigned"}</span>
              </div>
              <div><ActionButtons node={selectedUnion} level="union" parentId={null} /></div>
            </li>

            {selUnionId && (
              <li className="admin-news-item" style={{ borderLeft: '4px solid #28a745', marginLeft: '20px' }}>
                <div>
                  <strong>கிராமம் நிலை:</strong> {selectedVillage ? selectedVillage.nameTa : "Not Selected"} <br />
                  <span style={{ fontSize: '0.9rem', color: '#666' }}>{selectedVillage?.person || "No In-charge assigned"}</span>
                </div>
                <div><ActionButtons node={selectedVillage} level="village" parentId={selUnionId} /></div>
              </li>
            )}

            {selVillageId && (
              <li className="admin-news-item" style={{ borderLeft: '4px solid #17a2b8', marginLeft: '40px' }}>
                <div>
                  <strong>வார்டு நிலை:</strong> {selectedWard ? selectedWard.nameTa : "Not Selected"} <br />
                  <span style={{ fontSize: '0.9rem', color: '#666' }}>{selectedWard?.person || "No In-charge assigned"}</span>
                </div>
                <div><ActionButtons node={selectedWard} level="ward" parentId={selVillageId} /></div>
              </li>
            )}

            {selWardId && (
              <li className="admin-news-item" style={{ borderLeft: '4px solid #ffc107', marginLeft: '60px' }}>
                <div>
                  <strong>பூத் நிலை:</strong> {selectedBooth ? selectedBooth.nameTa : "Not Selected"} <br />
                  <span style={{ fontSize: '0.9rem', color: '#666' }}>{selectedBooth?.person || "No In-charge assigned"}</span>
                </div>
                <div><ActionButtons node={selectedBooth} level="booth" parentId={selWardId} /></div>
              </li>
            )}
          </ul>
        </div>

        {/* --- 3. ADD / EDIT FORM --- */}
        {targetLevel && (
          <div className="admin-form" style={{ marginTop: '20px', border: '1px dashed #ccc', padding: '15px', backgroundColor: isEditing ? '#fffbf0' : '#fff' }}>
            <h3 className="form-title-ta">
              {isEditing ? `Edit ${targetLevel} Details` : `Add New ${targetLevel}`}
            </h3>
            <form onSubmit={handleBarrierSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <label className="form-label-ta">இடத்தின் பெயர் (Place Name)
                  <input name="nameTa" className="input" placeholder="e.g. Manapparai Union" value={barrierForm.nameTa} onChange={handleBarrierChange} required />
                </label>
                <label className="form-label-ta">பொறுப்பாளர் பெயர் (Person Name)
                  <input name="personName" className="input" placeholder="e.g. Mr. Palanisamy" value={barrierForm.personName} onChange={handleBarrierChange} required />
                </label>
                <label className="form-label-ta">பதவி (Role)
                  <input name="roleTa" className="input" placeholder="e.g. Union Secretary" value={barrierForm.roleTa} onChange={handleBarrierChange} required />
                </label>
                <label className="form-label-ta">தொலைபேசி (Phone)
                  <input name="phone" className="input" placeholder="9876543210" value={barrierForm.phone} onChange={handleBarrierChange} />
                </label>

                {/* ✅ MODIFIED: PHOTO UPLOAD INPUT */}
                <label className="form-label-ta" style={{ gridColumn: 'span 2' }}>
                  புகைப்படம் (Upload Photo)
                  <input
                    type="file"
                    name="photo"
                    accept="image/*"
                    className="input"
                    onChange={handleFileChange} // Calls helper function
                  />
                  {barrierForm.photoUrl && (
                    <div style={{ marginTop: '10px' }}>
                      <small>Preview:</small> <br />
                      <img src={barrierForm.photoUrl} alt="Preview" style={{ height: '60px', borderRadius: '5px', border: '1px solid #ccc' }} />
                    </div>
                  )}
                </label>
              </div>
              <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? (isEditing ? "Updating..." : "Saving...") : (isEditing ? "Update Details" : "Save Details")}
                </button>
                <button type="button" className="btn btn-outline-small" onClick={() => { setTargetLevel(""); setIsEditing(false); }}>Cancel</button>
              </div>
              {barrierStatus && <p className="status-text">{barrierStatus}</p>}
            </form>
          </div>
        )}
      </div>

      {/* --- 4. VIEW DETAILS POPUP (MODAL) --- */}
      {viewNode && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000
          }}
          onClick={() => setViewNode(null)}
        >
          <div
            style={{
              backgroundColor: '#fff', padding: '25px', borderRadius: '10px',
              maxWidth: '450px', width: '90%', boxShadow: '0 5px 15px rgba(0,0,0,0.3)', position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => setViewNode(null)} style={{ position: 'absolute', top: '10px', right: '15px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
            <h2 className="form-title-ta" style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginTop: 0 }}>விவரங்கள் (Details)</h2>

            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '20px' }}>
              <img src={viewNode.photo || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} alt="Profile" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #f0f0f0' }} />
              <div>
                <h3 style={{ margin: '0 0 5px 0', color: '#F26522', fontSize: '1.4rem' }}>{viewNode.nameTa}</h3>
                <span style={{ backgroundColor: '#fff0e6', color: '#F26522', border: '1px solid #ffccbc', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                  {viewNode.type ? viewNode.type.toUpperCase() : "UNKNOWN"}
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gap: '10px', fontSize: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f9f9f9', paddingBottom: '5px' }}>
                <span style={{ color: '#666' }}>பொறுப்பாளர்:</span><span style={{ fontWeight: 'bold', color: 'black' }}>{viewNode.person || "—"}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f9f9f9', paddingBottom: '5px' }}>
                <span style={{ color: '#666' }}>பதவி:</span><span style={{ fontWeight: 'bold', color: 'black' }}>{viewNode.roleTa || "—"}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f9f9f9', paddingBottom: '5px' }}>
                <span style={{ color: '#666' }}>தொலைபேசி:</span>
                <span style={{ fontWeight: 'bold' }}>{viewNode.phone ? <a href={`tel:${viewNode.phone}`} style={{ color: '#007bff' }}>{viewNode.phone}</a> : "—"}</span>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '25px' }}>
              <button className="btn btn-primary" onClick={() => setViewNode(null)} style={{ width: '100%' }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* SECTION 2: NEWS & EVENTS */}
      {/* ======================================================= */}
      <div className="admin-layout">
        {/* NEWS FORM */}
        <form onSubmit={handleNewsSubmit} className="admin-form">
          <h2 className="form-title-ta">புதிய செய்தி சேர்க்க</h2>
          <label className="form-label-ta">தலைப்பு <input name="title" className="input" value={newsForm.title} onChange={handleNewsChange} required /></label>
          <label className="form-label-ta">செய்தி விவரம் <textarea name="content" className="textarea" value={newsForm.content} onChange={handleNewsChange} required /></label>
          <label className="form-label-ta">படம் URL <input name="imageUrl" className="input" value={newsForm.imageUrl} onChange={handleNewsChange} /></label>
          <label className="form-label-ta">வகை
            <select name="category" className="input" value={newsForm.category} onChange={handleNewsChange}>
              <option value="district">மாவட்டம்</option>
              <option value="state">மாநிலம்</option>
              <option value="national">தேசியம்</option>
            </select>
          </label>
          <button type="submit" className="btn btn-primary btn-full">செய்தி சேர்க்க</button>
        </form>

        {/* NEWS LIST & EVENTS */}
        <div className="admin-news-list">
          <h2 className="form-title-ta">செய்திகள்</h2>
          {newsList.length === 0 ? <p className="status-text">செய்திகள் இல்லை.</p> : (
            <ul className="admin-news-items">
              {newsList.map((n) => (
                <li key={n._id} className="admin-news-item">
                  <div>
                    <p className="admin-news-title">{n.title}</p>
                    <p className="admin-news-meta">{new Date(n.publishedAt).toLocaleDateString("ta-IN")}</p>
                  </div>
                  <button type="button" className="btn btn-outline-small" onClick={() => handleNewsDelete(n._id)}>நீக்கு</button>
                </li>
              ))}
            </ul>
          )}

          {/* EVENTS BLOCK */}
          <div style={{ marginTop: "1.5rem" }}>
            <h2 className="form-title-ta">நிகழ்வுகள்</h2>
            <form onSubmit={handleEventSubmit} className="auth-form" style={{ marginTop: "0.75rem" }}>
              <label className="form-label-ta">தலைப்பு <input name="title" className="input" value={eventForm.title} onChange={handleEventChange} required /></label>
              <label className="form-label-ta">தேதி <input type="date" name="date" className="input" value={eventForm.date} onChange={handleEventChange} /></label>
              <label className="form-label-ta">இடம் <input name="location" className="input" value={eventForm.location} onChange={handleEventChange} /></label>
              <label className="form-label-ta">படம் URL <input name="imageUrl" className="input" value={eventForm.imageUrl} onChange={handleEventChange} required /></label>
              <label className="form-label-ta">விளக்கம் <textarea name="description" className="textarea" value={eventForm.description} onChange={handleEventChange} /></label>
              <button type="submit" className="btn btn-primary btn-full">நிகழ்வு சேர்க்க</button>
            </form>
            <ul className="admin-news-items" style={{ marginTop: "0.75rem" }}>
              {events.map((ev) => (
                <li key={ev._id} className="admin-news-item">
                  <div>
                    <p className="admin-news-title">{ev.title}</p>
                    <p className="admin-news-meta">{ev.date ? new Date(ev.date).toLocaleDateString("ta-IN") : ""}</p>
                  </div>
                  <button className="btn btn-outline-small" onClick={() => handleEventDelete(ev._id)}>நீக்கு</button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
