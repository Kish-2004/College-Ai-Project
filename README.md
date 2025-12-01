# 🚗 AI Vehicle Damage Estimator – Automated Insurance Claim System  

![Project Status](https://img.shields.io/badge/Status-Completed-success)
![Java](https://img.shields.io/badge/Backend-Spring%20Boot-green)
![React](https://img.shields.io/badge/Frontend-React.js-blue)
![AI](https://img.shields.io/badge/AI-Computer%20Vision-orange)
![License](https://img.shields.io/badge/License-MIT-lightgrey)

> A fully automated vehicle damage estimation & insurance claim processing system powered by **Computer Vision**, **Spring Boot**, **React**, and **AI-driven cost estimation**.  
> Users can upload damaged vehicle images, get **instant analysis**, **automated cost estimation**, and track claims — while Admins manage approvals with real-time analytics.

---

## 📖 Table of Contents  
- [Overview](#-overview)  
- [Key Features](#-key-features)  
- [Business Logic & Rules](#-business-logic--rules)  
- [Tech Stack](#-tech-stack)  
- [Screenshots](#-screenshots)  
- [Installation & Setup](#-installation--setup)  
- [API Endpoints](#-api-endpoints)  
- [Future Scope](#-future-scope)

---

## 🌟 Overview  
Insurance claim processing is slow, manual, and often inconsistent. This project solves the problem with an **AI-powered system** that:  
✔ Detects car damage from uploaded images  
✔ Identifies damage regions (segmentation)  
✔ Estimates repair cost using a smart cost engine  
✔ Auto-generates professional claim reports  
✔ Provides a streamlined Admin approval workflow  

Built for real-world insurance scenarios with deep business logic and automation.

---

## 🚀 Key Features  

### 👤 User Panel  
- **⚡ Instant AI Damage Analysis**  
  Upload any damaged vehicle image → system detects dents, scratches, glass breaks, and severity.  
- **💰 Smart Cost Engine**  
  Auto-calculates labor + parts cost based on severity and car age.  
- **🔥 Heatmap Visualization**  
  Highlights damaged regions using segmentation masks.  
- **📄 PDF Estimation Reports**  
  Professional invoice-style PDF with GST, parts, labor, and total cost.  
- **📝 Claim History Tracking**  
  View claim status: *Submitted → Under Review → Approved/Rejected*.  
- **🔐 Secure Login**  
  JWT authentication + Google OAuth2 login support.

### 👮 Admin Dashboard  
- **📊 Real-time Analytics:** Total claims, pending, completed, and user activity.  
- **🚦 Traffic Light Indicators:**  
  Green = Approved, Yellow = Pending Review, Red = Rejected.  
- **🔧 Claim Review Actions:**  
  Approve, Reject, Add comments.  
- **📁 User Management:**  
  Manage registered policyholders.

---

## 🧠 Business Logic & Rules  

### 1. 📉 Multiple Claim Deduction  
- **1st Claim:** 100% coverage  
- **2nd Claim (within 12 months):** 50% deduction  
- **3rd Claim+:** Flagged as *High Risk*, manual review required  

### 2. 🛡 Zero Depreciation Policy  
- When ON → 100% reimbursement for parts  
- When OFF → 20–40% depreciation based on vehicle age

### 3. 🛑 Total Loss Detection  
Claim flagged as **Total Loss** if:  
```
Repair Cost > 75% of Vehicle IDV
```

### 4. 🛠 Repair vs Replace Algorithm  
- Glass/Lights → Always replaced  
- Damage confidence > 85% → Replace  
- Moderate damage → Repair + repaint (cost-optimized)  

---

## 💻 Tech Stack  

| Component | Technology |
|---------|------------|
| **Frontend** | React.js, Axios, Chart.js, Advanced CSS (Glassmorphism) |
| **Backend** | Spring Boot 3, Spring Security (JWT + OAuth2), Java 17 |
| **Database** | MySQL 8, Hibernate JPA |
| **AI/ML** | Python (FastAPI), YOLOv8 Segmentation, OpenCV |
| **Infrastructure** | Docker, Docker Compose, Nginx/Caddy |
| **Cloud Hosting** | Microsoft Azure VM / Container Apps |

---

## 📸 Screenshots  

### 1️⃣ AI Damage Detection & Heatmap  
<img width="1919" height="1077" alt="Screenshot 2025-12-01 164217" src="https://github.com/user-attachments/assets/c2e3c3a9-476b-4e0d-810a-9a55bee4b80c" />
<img width="1919" height="1079" alt="Screenshot 2025-12-01 164227" src="https://github.com/user-attachments/assets/79f50999-2450-4571-93d7-e3969bccafa0" />
<img width="1919" height="1079" alt="Screenshot 2025-12-01 164235" src="https://github.com/user-attachments/assets/19442529-7149-467d-a9ec-0498c77393a9" />

### 2️⃣ Admin Dashboard  
<img width="1919" height="1079" alt="Screenshot 2025-12-01 163848" src="https://github.com/user-attachments/assets/ca908c3e-27ce-48ec-9634-89c3c323287c" />


### 3️⃣ User Profile & Claim History  
<img width="1919" height="1079" alt="Screenshot 2025-12-01 164136" src="https://github.com/user-attachments/assets/b662f83a-3524-4d90-86d6-85f03ca8acd2" />


---

## 🛠 Installation & Setup  

### ✔ Prerequisites  
- Java JDK 17+  
- Node.js (Latest LTS)  
- MySQL Server  
- Python 3.9+  

---

### 🔹 1. Clone the Repository  
```bash
git clone https://github.com/your-username/vehicle-damage-estimator.git
cd vehicle-damage-estimator
```

---

### 🔹 2. Backend Setup (Spring Boot)  
```bash
cd vehicledamage
```

Update `application.properties`:  
- MySQL URL, Username, Password  
- JWT Secret  
- Google OAuth Client ID (optional)

Run the backend:  
```bash
mvn spring-boot:run
```

---

### 🔹 3. Frontend Setup (React)  
```bash
cd frontend
npm install
npm start
```

---

### 🔹 4. (Optional) Full Deployment via Docker  
Run entire stack with one command:  
```bash
docker-compose up -d --build
```

Runs:  
✔ Backend  
✔ Frontend  
✔ MySQL  
✔ ML Service  
✔ Reverse Proxy  

---

## 📡 API Endpoints  

### 🔸 User APIs  
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/claims` | Create new claim |
| POST | `/api/v1/claims/{id}/estimate` | Upload image & trigger AI |
| GET | `/api/v1/claims/history` | Fetch user's claim history |

---

### 🔸 Admin APIs  
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/admin/claims/all` | Get all claims |
| PUT | `/api/v1/admin/claims/{id}/status` | Approve/Reject claim |

---

## 🔮 Future Scope  

- 📱 **Mobile App** (React Native)  
- 🎥 **Video Damage Analysis** (360° vehicle scan)  
- 📍 **Geo-Location Fraud Detection**  
- 🤖 **AI Chatbot** for policy queries  
- 🌐 **Multi-Garage Integration** (Authorized repair centers)

---

## 👨‍💻 Made with ❤️ by **Kishore Kumar R**  
> Passionate Full Stack & AI Developer • Building intelligent automated systems 🚀

