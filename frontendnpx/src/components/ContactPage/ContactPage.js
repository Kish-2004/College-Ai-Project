import React, { useState } from "react";
import { Mail, Phone, MapPin, Loader, Send, Clock } from "lucide-react";
import "./Contact.css"; // 🟢 Import the new CSS

// Mock Contact Information
const CONTACT_INFO = {
  email: "kishorekumar02122004@gmail.com",
  phone: "+91 63744077172",
  address: "40, UCEV, Kakuppam Road, Villupuram, Tamil Nadu, India, 606104",
};

const MOCK_SUBMIT_DELAY_MS = 1500;

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (status) setStatus(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, MOCK_SUBMIT_DELAY_MS));
      console.log("Form Submitted:", formData);
      setStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      console.error("Submission Error:", error);
      setStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-page-wrapper">
      <div className="contact-card">
        {/* 1. Left Panel: Info (Dark) */}
        <div className="contact-info-panel">
          <div className="contact-info-content">
            <h2 className="contact-title">Let's Talk Claims</h2>
            <p className="contact-subtitle">
              Connect with our dedicated team for all integration, partnership,
              and technical support inquiries.
            </p>

            <div className="contact-list">
              {/* Email */}
              <div className="contact-item">
                <div className="contact-icon-box">
                  <Mail size={24} />
                </div>
                <div>
                  <h4>Email Support</h4>
                  <a href={`mailto:${CONTACT_INFO.email}`}>
                    {CONTACT_INFO.email}
                  </a>
                </div>
              </div>

              {/* Phone */}
              <div className="contact-item">
                <div className="contact-icon-box">
                  <Phone size={24} />
                </div>
                <div>
                  <h4>Call Our Team</h4>
                  <a href={`tel:${CONTACT_INFO.phone}`}>{CONTACT_INFO.phone}</a>
                </div>
              </div>

              {/* Address */}
              <div className="contact-item">
                <div className="contact-icon-box">
                  <MapPin size={24} />
                </div>
                <div>
                  <h4>Headquarters</h4>
                  <p>{CONTACT_INFO.address}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Guarantee Box */}
          <div className="guarantee-box">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "5px",
              }}
            >
              <Clock size={18} color="#ff6600" />
              <h3 style={{ fontSize: "1rem", color: "#ff6600", margin: 0 }}>
                Response Guarantee
              </h3>
            </div>
            <p style={{ fontSize: "0.9rem", color: "#cbd5e0", margin: 0 }}>
              We promise a personalized response to all business inquiries
              within 24 business hours.
            </p>
          </div>
        </div>

        {/* 2. Right Panel: Form (Light) */}
        <div className="contact-form-panel">
          <h3 className="contact-form-header">Send Us a Message</h3>

          {/* Status Messages */}
          {status === "success" && (
            <div className="message success" role="alert">
              🎉 Message Sent! We will be in touch shortly.
            </div>
          )}
          {status === "error" && (
            <div className="message error" role="alert">
              ❌ Submission Failed! Please try again later.
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
              }}
            >
              <div className="contact-input-group">
                <label htmlFor="name" className="contact-label">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="contact-input"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="John Doe"
                />
              </div>
              <div className="contact-input-group">
                <label htmlFor="email" className="contact-label">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="contact-input"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="you@company.com"
                />
              </div>
            </div>

            <div className="contact-input-group">
              <label htmlFor="subject" className="contact-label">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                className="contact-input"
                value={formData.subject}
                onChange={handleChange}
                required
                placeholder="Integration Inquiry or Support Request"
              />
            </div>

            <div className="contact-input-group">
              <label htmlFor="message" className="contact-label">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows="6"
                className="contact-textarea"
                value={formData.message}
                onChange={handleChange}
                required
                placeholder="Tell us about your project..."
              />
            </div>

            <button
              type="submit"
              className="contact-submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader className="animate-spin" size={20} /> Sending...
                </>
              ) : (
                <>
                  <Send size={20} /> Send Message
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
