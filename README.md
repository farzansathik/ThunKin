🍔 Thunkin – Food Ordering Mobile AppThunkin is a full-stack mobile food ordering application built with React Native (Expo) and Supabase.
It provides a seamless experience for browsing menus, managing a real-time cart, and handling user authentication through a PostgreSQL backend.
🚀 Overview : This project demonstrates a robust mobile architecture, bridging a modern frontend with a powerful Backend-as-a-Service (BaaS).

Frontend: React Native with Expo Router for file-based navigation.
Backend: Supabase (PostgreSQL) for data persistence and Secure Auth.
Integration: Real-time API interaction between the mobile client and the database.
🛠 Tech StackFrontend Framework: React Native / ExpoNavigation: Expo RouterLanguage: TypeScriptIcons: @expo/vector-icons
Backend & DatabaseBaaS: SupabaseDatabase: PostgreSQLAuthentication: Supabase AuthClient Library: @supabase/supabase-js

✨ Features:
🔐 Secure Auth: User registration and login via Supabase.
📖 Menu Browsing: Dynamic fetching of food items from the database.
🛒 Cart Management: Add items, adjust quantities ($+$ / $-$), and view real-time totals.
💾 Persistence: Cart data is stored in PostgreSQL, allowing for cross-device consistency.
📱 Cross-Platform: Ready for iOS, Android, and Web via Expo.
📂 Project Structure
├── app/                 # Expo Router File-based Navigation
│   ├── index.tsx        # Main entry screen
│   ├── login.tsx        # User login
│   ├── register.tsx     # User registration
│   ├── restaurant.tsx   # Menu browsing & Add to cart
│   └── cart.tsx         # Cart overview & checkout logic
├── lib/
│   └── supabase.ts      # Supabase client configuration
├── assets/              # Images and static files
├── package.json
└── README.md
⚙️ Installation & Setup:
Clone & Install   Bashgit clone <repo-url>
cd frontend
npm install
2. Configure Supabase:
Create a project at Supabase.com.

Run the SQL provided in the "Setup Database Tables" section in your Supabase SQL Editor.

Update lib/supabase.ts with your credentials:
const supabaseUrl = "YOUR_SUPABASE_URL";
const supabaseKey = "YOUR_SUPABASE_ANON_KEY";


3. Launch:
   npm run web or npm run android (with android emulator)

Author: YesKing ICE Capstone Project
