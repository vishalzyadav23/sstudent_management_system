# EduCore ERP and IOT Telemetry

## 1. Project Overview

The system includes:
- Spring Boot backend for student records, health data ingestion, alert generation, and medical document storage.
- React frontend for admin and student dashboards, live vital charts, predictive summaries, and paramedic assistant chat.
- IoT device or wearable data feed to automatically capture student health metrics.
- Emergency escalation workflow that notifies nurses/admins when health thresholds are breached.

## 2. Functional Requirements

### Backend
- Student profile management (CRUD, contact info, emergency contact).
- Health record persistence for BPM, SpO2, body temperature, room temperature, humidity, and alert metadata.
- Health alert generation and notification workflow.
- Medical document upload and retrieval.
- AI / predictive health recommendation endpoints.
- REST API compliance for frontend and device integration.
- JWT-based authentication and role-based access control.
- Email notification support for alerts and password resets.

### Frontend
- Student dashboard with tabs for personal info, classes, grades, attendance, and live health vitals.
- Real-time health telemetry charting.
- Health alert timeline and escalation indication.
- Medical document upload UI.
- Profile picture upload and editable contact info.
- Responsive layout for desktop and mobile.
- Dark mode toggle support.

### IoT / Hardware Integration
- Sensor data ingestion endpoint for student health metrics.
- Support for wearable/edge devices sending BPM, SpO2, temperature, and humidity.
- Device metadata field for source identification.
- Automatic escalation based on defined vital thresholds.

## 3. Hardware Components
- ESP8266 or ESP32-based sensor module
- Heart rate sensor
- SpO2 sensor
- Body temperature sensor
- Humidity / ambient temperature sensor
- Wi-Fi or Bluetooth connectivity for device data transmission
- Optional smartphone or mobile relay device for wearable sensor forwarding
- Nurse/admin workstation or tablet for alert viewing

## 4. Software Components

### Backend
- Java 17+ / OpenJDK
- Spring Boot
- Spring Data JPA
- Spring Security
- PostgreSQL (or equivalent relational database)
- Maven wrapper (`mvnw`, `mvnw.cmd`)
- SMTP email support
- Optional OpenAI or AI service integration for medical chat and advice

### Frontend
- React
- `react-scripts`
- Axios
- React Router
- Recharts for chart visualization
- CSS for styling and responsive design

### Development Tools
- VS Code or IntelliJ IDEA
- Git
- Node.js / npm
- Postman or API testing tool
- Browser for frontend testing

## 5. Deployment / Runtime Requirements
- Backend running at `http://localhost:8080`
- Frontend served via `npm start`
- Database accessible to backend
- Network connectivity for device data ingestion
- SMTP server credentials for email notifications

## 6. Optional Enhancements
- Docker containers for backend and frontend
- HTTPS / TLS for production security
- Progressive Web App (PWA) support
- SMS or push notifications for faster alerts
- Mobile app interface for students and medical staff
- Enhanced wearable integrations via BLE or mobile sensors

## 7. Success Criteria
- Students can view academic and health data from one portal.
- Live vital metrics are displayed and updated automatically.
- Critical health conditions trigger alert escalation.
- Medical documents can be uploaded and accessed securely.
- Admins and nurses are notified when a student's health record crosses danger thresholds.
- The frontend is responsive, user-friendly, and supports dark mode.
