<p align="center">
  <h1 align="center">🌸 Flower Calculator Backend</h1>
  <p align="center">Simple payout & commission backend using Node.js</p>
</p>

---

## 🚀 Live API

https://audaykumarr-flower-backend-url.onrender.com

---

## 📦 Tech Stack

- Node.js
- Express.js
- SQLite
- CORS

---

## 📁 Project Structure

flower-backend/

│── index.js        # Main server  
│── package.json  
│── flower.db       # SQLite DB (ignored in git)

---

## ⚙️ Setup (Local)

1. Clone repo  
git clone https://github.com/audaykumarr/flower-backend.git  
cd flower-backend  

2. Install dependencies  
npm install  

3. Run server  
npm start  

Server runs at:  
http://localhost:5000  

---

## 📌 API Endpoints

GET /  
GET /entries  
GET /entries/:id  
POST /entries  
PUT /entries/:id  
DELETE /entries/:id  

---

## 🧠 Features

- Auto calculation of totals  
- Commission-based payout  
- SQLite storage  
- Clean REST APIs  

---

## ⚠️ Notes

- flower.db is ignored  
- Fresh DB auto-created  
- Default commission = 10%  

---

## 🚀 Deployment (Render)

Build Command: npm install  
Start Command: npm start  

---

## 👨‍💻 Author

Uday Kumar