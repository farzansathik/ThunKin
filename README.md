Thunkin – Food Ordering Mobile App
Overview

Thunkin is a mobile food ordering application built using React Native (Expo) and Supabase.
The app allows users to browse restaurant menus, add food items to a cart, and proceed to checkout.

This project demonstrates a full-stack mobile architecture including:

Frontend: React Native + Expo Router

Backend: Supabase (PostgreSQL + Auth)

Database relations (menus, cart, users)

API integration between frontend and database

Tech Stack

Frontend

React Native

Expo

Expo Router

TypeScript

Backend / Database

Supabase

PostgreSQL

Supabase Auth

Libraries

@supabase/supabase-js

@expo/vector-icons

Project Features

User authentication (Supabase Auth)

Restaurant menu browsing

Add items to cart

Quantity adjustment (+ / -)

Cart screen with total price

Checkout button

Database persistence using Supabase

Project Structure
frontend
│
├── app
│   ├── login.tsx
│   ├── register.tsx
│   ├── restaurant.tsx
│   ├── cart.tsx
│   ├── index.tsx
│
├── lib
│   └── supabase.ts
│
├── assets
│
├── package.json
└── README.md

Explanation:

app/

Contains all screens/pages in the application.

login.tsx → user login screen

register.tsx → user registration

restaurant.tsx → restaurant menu + add to cart

cart.tsx → cart page showing selected items

index.tsx → main entry screen

lib/supabase.ts

Contains the Supabase client configuration used across the app.

Example:

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "YOUR_SUPABASE_URL";
const supabaseKey = "YOUR_SUPABASE_ANON_KEY";

export const supabase = createClient(supabaseUrl, supabaseKey);
Database Structure

The project uses Supabase PostgreSQL.

Tables
users
column	type
id	int
auth_id	uuid

This table maps the Supabase Auth user to an internal user ID.

menu
column	type
id	int
name	text
price	int
rest_id	int
status	text

Stores available menu items.

cart
column	type
id	int
user_id	int
menu_id	int
quantity	int
note	text

Stores items added to a user's cart.

Installation Guide
1. Clone the Repository
git clone <repo-url>
cd frontend
2. Install Dependencies
npm install

or

yarn install
3. Setup Supabase

Create a project at:

https://supabase.com

Then copy:

Project URL
Anon Public Key

Paste them into:

lib/supabase.ts
4. Setup Database Tables

Create the following tables in Supabase:

users

menu

cart

Make sure the following foreign keys exist:

cart.menu_id → menu.id
cart.user_id → users.id
5. Run the Application

Start Expo:

npx expo start

You can open the app using:

Expo Go (mobile)

Android emulator

iOS simulator

Web browser

Application Flow

User journey in the application:

Login / Register
        ↓
Restaurant Menu
        ↓
Add Food to Cart
        ↓
Cart Page
        ↓
Checkout
Example Workflow

User logs in

User opens restaurant menu

User presses + to add food

Item is inserted into cart table

Cart screen shows items and total price

User proceeds to checkout

Key Learning Objectives

This project demonstrates:

Mobile app development using React Native

Backend integration using Supabase

Database relationships

Cart management logic

API interaction

Full-stack application architecture

Future Improvements

Possible features to extend this project:

Order system

Payment integration

Multiple restaurants

Order history

Push notifications

Admin dashboard

Author
YesKing
Information and Communication Engineering
Chulalongkorn University
