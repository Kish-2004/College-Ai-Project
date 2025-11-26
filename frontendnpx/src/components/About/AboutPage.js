// src/components/AboutPage.js

import React from 'react';
import kishorePhoto from '../../assets/kishore.jpg';
import senthilPhoto from '../../assets/senthil.jpeg';
import './AboutPage.css'; // This will link to our new stunning CSS

const teamMembers = [
  {
    name: 'Kishore Kumar',
    role: 'Lead AI & Backend Architect',
    imageUrl: kishorePhoto,
    bio: 'The architect of our core AI engine, Kishore specializes in computer vision and deep learning to ensure our damage assessments are second to none.',
    linkedin: 'https://www.linkedin.com/in/kishore521/' // Replace with actual LinkedIn URL
  },
  {
    name: 'Senthil Kumar',
    role: 'Head of Frontend & UX',
    imageUrl: senthilPhoto,
    bio: 'Senthil is the creative force behind our intuitive user interface, focusing on a seamless and efficient experience for every user.',
    linkedin: 'https://www.linkedin.com/in/senthil-kumar-1217ba2aa/' // Replace with actual LinkedIn URL
  }
];

function AboutPage() {
  return (
    <div className="about-page-container">
      <div className="about-header">
        <h1>Transforming Claims with AI Precision</h1>
        <p>
          Our platform harnesses advanced computer vision to deliver instant, objective, and transparent vehicle damage assessments. We are dedicated to reducing claim cycle times, enhancing adjuster efficiency, and building greater trust between insurers and their clients.
        </p>
      </div>

      <div className="team-section">
        <h2>The Innovators Behind the Code</h2>
        <div className="team-grid">
          {teamMembers.map((member, index) => (
            <div key={index} className="team-member-card">
              <img src={member.imageUrl} alt={member.name} className="team-member-photo" />
              <div className="team-member-info">
                <h3>{member.name}</h3>
                <h4>{member.role}</h4>
                <p>{member.bio}</p>
                <div className="social-links">
                  <a href={member.linkedin} target="_blank" rel="noopener noreferrer">
                    LinkedIn
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AboutPage;