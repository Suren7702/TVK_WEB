import React from 'react';
// Make sure to create these placeholder images in your public folder or replace the paths!
// Example: /admin1.jpg, /admin2.jpg, /admin3.jpg

// Sample data for the additional admins.
// Update names, roles, and image paths here.
const admins = [
  {
    id: 1,
    name: "திரு.ஆனந்த் ",
    role: "கட்சி செயலாளர்",
    imgSrc: "\assets\admins\anand.avif", // Replace with actual image path
  },
  {
    id: 2,
    name: "திரு.ரவிசங்கர்",
    role: "மாவட்ட செயலாளர்",
    imgSrc: "/admin-placeholder-2.jpg", // Replace with actual image path
  },
  {
    id: 3,
    name: "திரு. நிர்வாகி 3",
    role: "பொருளாளர்",
    imgSrc: "/admin-placeholder-3.jpg", // Replace with actual image path
  },
];

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-overlay" />

      <div className="hero-inner">
        {/* Left Side Text Content */}
        <div className="hero-text">
          <p className="hero-tag">பிறப்பொக்கும் எல்லா உயிர்க்கும்</p>
          <h1 className="hero-title">
            மாவட்ட வளர்ச்சியை
            <span className="hero-title-highlight"> மாற்றும் அரசியல் குரல்</span>
          </h1>
          <p className="hero-desc">
            உங்கள் பகுதி மக்கள் சந்திக்கும் உண்மை பிரச்சினைகள், அரசு திட்டங்கள்,
            கட்சி செயற்பாடுகள் அனைத்தையும் ஒரே இடத்தில் கொண்டு வரும்
            டிஜிட்டல் அரசியல் தளம்.
          </p>

          <div className="hero-actions">
            <a href="#programs" className="btn btn-primary">
              திட்டங்களை பார்க்க
            </a>
            <a href="#contact" className="btn btn-outline">
              தொடர்பு கொள்ள
            </a>
          </div>

          <div className="hero-meta">
            <span>📍 உங்கள் மாவட்டம்</span>
            <span>•</span>
            <span>நேரடி மக்கள் இணைப்பு</span>
          </div>
        </div>

        {/* Right Side - Media Column (Main Leader + Admins) */}
        <div className="hero-media-column">
          {/* Main Leader - Large Photo Card (Existing code) */}
          <div className="hero-photo-card main-leader-card">
            <div className="hero-photo-wrapper">
              <img
                src="/leader.jfif"
                alt="Main Leader"
                className="hero-photo"
              />
              <div className="hero-photo-border" />
            </div>
            <div className="hero-photo-caption">
              <p className="hero-leader-name">திரு.விஜய் </p>
              <p className="hero-leader-role">தலைவர்</p>
            </div>
          </div>

          {/* New Section - Smaller Admin Cards Row */}
          <div className="hero-admin-row">
            {admins.map((admin) => (
              <div key={admin.id} className="hero-admin-card small-card">
                <div className="hero-photo-wrapper small-wrapper">
                  <img
                    src={admin.imgSrc}
                    alt={admin.name}
                    className="hero-photo small-photo"
                  />
                   {/* Optional: thinner border for small cards */}
                  <div className="hero-photo-border small-border" />
                </div>
                <div className="hero-admin-caption">
                  <p className="hero-admin-name small-name">{admin.name}</p>
                  <p className="hero-admin-role small-role">{admin.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}