# Community Food Sharing Platform (Do Not Waste)

## 📖 Project Overview
**Course:** ITEC 4010A - Systems Analysis and Design (Fall 2025)  
**Deliverable:** 3 - Implementation  

This is a web-based platform designed to reduce food waste by connecting local food donors (restaurants, bakeries) with community members in need. The system allows donors to list surplus food items and users to reserve and pick them up.

## 👥 Team Members
* **Xinyu Jing** (217442179)
* **Ashir Malik**
* **Arshyam Qais**

## 🚀 Live Demo
**Deployed on Render:** https://itec-4010-project.onrender.com

> **Note:** The server on the free tier may spin down after inactivity. Please wait 30-60 seconds for the initial load.

---

## 🛠️ Tech Stack
* **Frontend:** EJS (Embedded JavaScript), Bootstrap 5 (Responsive UI)
* **Backend:** Node.js, Express.js
* **Database:** MongoDB Atlas (Cloud NoSQL Database)
* **Deployment:** Render
* **Tools:** Git, GitHub, VS Code

---

## ✨ Key Features

### 🏪 For Donors (Restaurants/Donors)
* **Account Management:** Register and login as a "Donor".
* **Post Listings:** Create food listings with details (Name, Expiry Date, Quantity).
* **Smart Images:** * **Auto-Category:** Automatically assigns high-quality images based on food category (Fruits, Veggies, Bakery, etc.).
    * **Custom Upload:** Supports uploading custom images (Base64 encoded).
* **Inventory Dashboard:** * **Action Required:** View and confirm pending reservations.
    * **Active Listings:** Manage unsold inventory.
    * **History:** View completed transactions and user reviews.
* **Workflow:** Mark items as "Picked Up" to complete the cycle.

### 👤 For Users (Receivers)
* **Search & Browse:** View available food listings or search by keywords.
* **Partial Reservation:** Ability to reserve a specific quantity (e.g., take 2 out of 5 items), automatically splitting the order.
* **Reservation Dashboard:**
    * **Active:** View pickup codes for reserved items.
    * **History:** View past orders.
* **Review System:** Rate donors (1-5 stars) and leave feedback after pickup.
* **Cancelation:** Ability to cancel active reservations (restores stock automatically).

---

## ⚙️ Installation & Local Setup

To run this project locally on your machine, follow these steps:

### 1. Prerequisites
* [Node.js](https://nodejs.org/) (v14 or higher) installed.
* A [MongoDB Atlas](https://www.mongodb.com/atlas) connection string.

### 2. Clone the Repository
```bash
git clone [https://github.com/darrelljing21/ITEC-4010-project.git](https://github.com/darrelljing21/ITEC-4010-project.git)
cd ITEC-4010-project
