# SwapUp

SwapUp is a comprehensive mobile app designed specifically for hotel shift management. Developed as our Software Development Group Project (SDGP) at the Informatics Institute of Technology (IIT), this application streamlines scheduling, attendance, and communication between hotel staff. It features strict role-based access, ensuring managers and employees only interact with the tools specific to their roles.

## 🛠 Tech Stack

* **Frontend:** React Native Expo with TypeScript (`.tsx`).
* **Backend:** Node.js and Express with TypeScript.
* **Database:** PostgreSQL modeled with Prisma Schema.
* **Real-time Communication:** Socket.io for live chat and notifications.

---

## ✨ Core Features

### For All Users (Managers & Employees)
* **Authentication:** Secure login and registration requiring hotel name, department, role selection, and OTP verification.
* **Geo-Location Check-In:** Users must have their phone's location turned on to verify they are physically at the hotel to mark attendance.
* **Real-Time Chat:** Employees and managers can communicate directly with each other.
* **User Profile:** Manage personal information, privacy, notifications, and passwords.

### The Smart Swap System (Main Feature)
The core of SwapUp is a streamlined, three-step shift swapping system:
1. **Request:** Employee A requests a shift swap, which appears as an interactive card in Employee B's chat.
2. **Peer Approval:** Employee B can either accept or decline the card directly in the chat.
3. **Manager Approval:** If accepted by the peer, the card goes to the manager for final approval. If approved, the schedule automatically updates and notifies both employees.

### Employee Features
* **My Schedule:** View assigned shifts with the ability to export them to Google Calendar or local files.
* **Leave Requests:** Submit leave requests (with reason and duration) to the manager. Approval or denial notifications are sent back as chat cards.
* **Personal Analytics:** View individual reports on punctuality, absences, and overtime, including 3-month comparisons, which can be exported.

### Manager Features
* **Roster Creation:** Select a week, add timestamps, assign employees, and publish the official schedule.
* **Fatigue Alerts:** An innovative tracking system that flags when an employee is working excessive overtime, helping managers prevent staff burnout.
* **Employee Details Hub:** View specific metrics for employees in their branch, including total overtime, punctuality, and shift ratings.
* **Announcements:** Broadcast important updates to all employees.

---

## 👥 Team

* Vihara Senanayaka
* Umesh Isuranga
* Esala Gamage
* Vishwa Kamal
* Don Dulaj
* Ashwin Miron
