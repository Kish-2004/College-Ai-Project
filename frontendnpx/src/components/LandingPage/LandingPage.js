import React from "react";
import { Link } from "react-router-dom";
import "./LandingPage.css"; // ⬅️ IMPORT THE NEW CSS FILE

function LandingPage() {
  // NOTE: All previous inline styles object 'styles' is now removed.
  // The component now relies solely on CSS classes for styling and interactivity.

  return (
    // The main container now uses a class
    <main className="page-container">
      {/* --- HERO SECTION: ACCELERATE ASSESSMENT --- */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          {/* The h1 now relies on the .hero-content h1 style for the glow */}
          <h1 className="hero-title">
            AI-Powered Auto Claim <br /> Zero Waiting
          </h1>
          {/* The p now relies on the .hero-content p style */}
          <p className="hero-subtitle">
            Transforming a single photo into a detailed repair estimate in
            minutes, not days.
          </p>

          <div style={{ marginTop: "50px" }}>
            {/* Buttons now use class names for the pop-out hover effect */}
            <Link to="/register" className="primary-button">
              Start Your Free Assessment
            </Link>
            <Link to="/contact" className="secondary-button">
              Learn More
            </Link>
          </div>
        </div>
        <div className="scroll-indicator">
          <div className="mouse">
            <div className="wheel"></div>
          </div>
          <div className="arrow-down"></div>
        </div>
      </section>
      {/* --- NEW: STATS BANNER SECTION --- */}
      <section className="stats-section">
        <div className="stats-container">
          <div className="stat-item">
            <span className="stat-number">10k+</span>
            <span className="stat-label">Claims Processed</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-number">98%</span>
            <span className="stat-label">Accuracy Rate</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-number">$50M+</span>
            <span className="stat-label">Est. Savings</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-number">1min</span>
            <span className="stat-label">Avg. Turnaround</span>
          </div>
        </div>
      </section>
      {/* --- Separator Line with 3D Ridge Effect --- */}
      <div className="separator-line"></div>

      {/* --- VALUE PROPOSITION SECTION: WHY OUR AI ESTIMATOR --- */}
      <section id="features" className="value-section">
        <h2 className="section-header">The Future of Claims Processing</h2>
        <p className="section-subheader">
          Leveraging advanced computer vision and machine learning to deliver
          unparalleled speed, accuracy, and peace of mind.
        </p>

        <div className="value-card-container">
          {/* Value Card 1: Instant Evaluation (Lift & Glow Hover) */}
          <div className="value-card">
            <div className="icon-container">⚡</div>
            <h3 className="card-title">Instant Evaluation</h3>
            <p className="card-text">
              Our AI reduces claim processing time from days to minutes,
              achieving 95% straight-through processing for rapid settlements.
            </p>
          </div>

          {/* Value Card 2: Unmatched Accuracy */}
          <div className="value-card">
            <div className="icon-container">🎯</div>
            <h3 className="card-title">Unmatched Accuracy</h3>
            <p className="card-text">
              Real-time damage analysis provides accurate, itemized assessments
              with detailed, insurance-ready reports. Backed by $1B in processed
              claims.
            </p>
          </div>

          {/* Value Card 3: Secure & Compliant */}
          <div className="value-card">
            <div className="icon-container">🛡️</div>
            <h3 className="card-title">Secure & Compliant</h3>
            <p className="card-text">
              End-to-end encrypted processing ensures all customer data and
              claim history remain secure, meeting all industry compliance
              standards.
            </p>
          </div>
        </div>
      </section>
      {/* --- Separator Line with 3D Ridge Effect --- */}
      <div className="separator-line"></div>
      <section className="testimonials-section">
        <h2 className="section-header">Trusted by Professionals</h2>
        <div className="testimonial-grid">
          {/* Card 1 */}
          <div className="testimonial-card">
            <div className="quote-icon">“</div>
            <p className="testimonial-text">
              I was skeptical about AI estimates, but the line-by-line breakdown
              matched my shop's manual assessment perfectly. It saved us 3 days
              of back-and-forth.
            </p>
            <div className="user-profile">
              <div className="user-avatar">👨‍🔧</div>
              <div>
                <h4 className="user-name">Ram</h4>
                <span className="user-role">Auto Body Shop Manager</span>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="testimonial-card">
            <div className="quote-icon">“</div>
            <p className="testimonial-text">
              The user interface is incredibly simple. I uploaded photos of my
              fender bender and had an approved payout amount in my email before
              I got home.
            </p>
            <div className="user-profile">
              <div className="user-avatar">👩‍💼</div>
              <div>
                <h4 className="user-name">Saravanan</h4>
                <span className="user-role">Policyholder</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS SECTION --- */}
      <section id="how-it-works" className="how-it-works-section">
        <div className="custom-shape-divider-top">
          <svg
            data-name="Layer 1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
              class="shape-fill"
            ></path>
          </svg>
        </div>
        <h2 className="section-header">A Simple 3-Step Process</h2>
        <p className="section-subheader">
          From incident to estimate in less time than it takes to make a cup of
          coffee. Experience unparalleled efficiency.
        </p>
        <div className="step-box-container">
          {/* Step 1 (Slide & Highlight Hover) */}
          <div className="step-box">
            <h3 className="step-title">
              1. Initiate Claim & Upload Details{" "}
              <span role="img" aria-label="form">
                📝
              </span>
            </h3>
            <p className="step-description">
              A user registers their claim and submits preliminary vehicle,
              owner, and incident data via a simple mobile or web interface.
            </p>
          </div>

          {/* Step 2 */}
          <div className="step-box">
            <h3 className="step-title">
              2. Image Processing & Detection{" "}
              <span role="img" aria-label="camera">
                📸
              </span>
            </h3>
            <p className="step-description">
              A clear photo of the damage is uploaded. The image is instantly
              analyzed by our YOLOv8 Machine Learning engine to detect and
              quantify damage.
            </p>
          </div>

          {/* Step 3 */}
          <div className="step-box">
            <h3 className="step-title">
              3. Instant Report & Settlement{" "}
              <span role="img" aria-label="money">
                💰
              </span>
            </h3>
            <p className="step-description">
              Receive a plotted visual evidence report and an instant,
              line-by-line cost breakdown for repair or replacement, enabling
              immediate settlement approval.
            </p>
          </div>
        </div>
      </section>
      {/* --- TEAM QUOTE SECTION --- */}
      <section className="quote-section">
        <p className="quote-text">
          "Our goal wasn't just to make the claims process faster, but to make
          it fundamentally better—more accurate, more transparent, and entirely
          centered around the user."
        </p>
        <p className="quote-author">The AI Estimator Development Team</p>
      </section>

      <section className="cta-section">
        <div className="custom-shape-divider-top">
          <svg
            data-name="Layer 1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
              class="shape-fill"
            ></path>
          </svg>
        </div>
        <div className="cta-content">
          <h2>Ready to Revolutionize Your Claims Process?</h2>
          <p>
            Join 10,000+ professionals using AI to settle claims in minutes.
          </p>
          <Link to="/register" className="cta-button">
            Start Free Assessment <span className="arrow">→</span>
          </Link>
        </div>
      </section>
      {/* --- Separator Line with 3D Ridge Effect --- */}
      <div className="separator-line"></div>
      {/* --- CONTACT / ANY QUERIES SECTION --- */}
      <section className="contact-section">
        <h2
          className="section-header"
          style={{ color: "white", fontWeight: "700" }}
        >
          Have Complex Cases or Integration Questions?
        </h2>
        <p
          className="section-subheader"
          style={{ color: "#ccc", margin: "0 auto 50px" }}
        >
          Our dedicated team is ready to demonstrate how our platform can
          seamlessly integrate with your existing systems and tackle unique
          challenges.
        </p>

        <div
          className="contact-info-container"
          style={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            marginTop: "40px",
            marginBottom: "40px",
          }}
        >
          <div
            className="contact-detail"
            style={{ margin: "0 40px 20px", textAlign: "left" }}
          >
            <h3
              className="contact-title"
              style={{
                color: "#ff6600",
                marginBottom: "10px",
                fontSize: "1.7em",
                borderBottom: "2px solid #ff6600",
              }}
            >
              General Inquiries
            </h3>
            <p style={{ margin: "0" }}>
              <span role="img" aria-label="email">
                📧
              </span>{" "}
              <a href="mailto:info@aievaluator.com" className="footer-link">
                kishorekumar02122004@gmail.com
              </a>
            </p>
          </div>

          <div
            className="contact-detail"
            style={{ margin: "0 40px 20px", textAlign: "left" }}
          >
            <h3
              className="contact-title"
              style={{
                color: "#ff6600",
                marginBottom: "10px",
                fontSize: "1.7em",
                borderBottom: "2px solid #ff6600",
              }}
            >
              Sales & Partnerships
            </h3>
            <p style={{ margin: "0" }}>
              <span role="img" aria-label="phone">
                📞
              </span>{" "}
              <a href="tel:+916374407172" className="footer-link">
                +91 6374407172
              </a>
            </p>
          </div>
        </div>

        <div style={{ marginTop: "40px" }}>
          {/* Secondary button for contact form, inheriting the hover effect */}
          <Link to="/contact" className="secondary-button">
            Send Us a Message
          </Link>
        </div>
      </section>
      {/* --- Separator Line with 3D Ridge Effect --- */}
      <div className="separator-line"></div>
      {/* --- FOOTER --- */}
      <footer className="footer">
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <p>
            &copy; {new Date().getFullYear()} AI Estimator Platform. All rights
            reserved.
          </p>
          <div style={{ marginTop: "10px" }}>
            <Link
              to="/terms"
              className="footer-link"
              style={{ margin: "0 15px" }}
            >
              Terms of Service
            </Link>
            |
            <Link
              to="/privacy"
              className="footer-link"
              style={{ margin: "0 15px" }}
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

export default LandingPage;
