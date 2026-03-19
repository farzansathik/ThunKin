# 🍔 Thunkin – Food Reservation Mobile App

**Thunkin** is a full-stack mobile food ordering application built with **React Native (Expo)** and **Supabase**.  
It provides a seamless experience for browsing menus, managing a real-time cart, and handling secure user authentication.

---

## 🚀 Overview

This project demonstrates a modern full-stack mobile architecture by connecting a responsive frontend with a Backend-as-a-Service (BaaS).

- 📱 Smooth mobile experience with real-time updates  
- 🔗 Direct integration between frontend and database  
- 🔐 Built-in authentication and data persistence  

---

## 🛠 Tech Stack

### **Frontend**
- **Framework:** React Native (Expo)
- **Navigation:** Expo Router (file-based routing)
- **Language:** TypeScript
- **Icons:** @expo/vector-icons

### **Backend & Database**
- **BaaS:** Supabase
- **Database:** PostgreSQL
- **Authentication:** Supabase Auth
- **Client Library:** @supabase/supabase-js

---

## ✨ Features

- 🔐 **Secure Authentication**  
  User registration and login powered by Supabase Auth  

- 📖 **Menu Browsing**  
  Dynamically fetch food items from the database  

- 🛒 **Cart Management**  
  Add/remove items, adjust quantity (+ / −), and calculate totals in real-time  

- 💾 **Persistent Storage**  
  Cart data stored in PostgreSQL for cross-device consistency  

- 📱 **Cross-Platform Support**  
  Runs on iOS, Android, and Web via Expo  

```
## 📂 Project Structure
├── app/ # Expo Router navigation
│ ├── index.tsx # Home screen
│ ├── login.tsx # Login screen
│ ├── register.tsx # Registration screen
│ ├── restaurant.tsx # Menu & add-to-cart
│ └── cart.tsx # Cart & checkout
│
├── lib/
│ └── supabase.ts # Supabase client setup
│
├── assets/ # Images & static files
├── package.json
└── README.md
```

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository


---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone <repo-url>
cd frontend
npm install
```

2️⃣ Configure Supabase

Create a project at https://supabase.com

Open the SQL Editor

Run your database setup SQL

Then update:

lib/supabase.ts

```
const supabaseUrl = "YOUR_SUPABASE_URL";
const supabaseKey = "YOUR_SUPABASE_ANON_KEY";

```
3️⃣ Run the App
```
npm run web       # Run in browser
npm run android   # Run on Android emulator
```

👨‍💻 Author: 
YesKing

ICE Capstone Project

