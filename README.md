\# 📚 Smart Library Management System



A full-stack web application designed to manage library operations efficiently through a modern and user-friendly dashboard.



\## 🚀 Project Overview



The Smart Library Management System helps librarians manage books, members, borrowing records, returns, and book recommendations in one place.



\## ✨ Features



\- 📊 \*\*Dashboard:\*\* View library statistics.

\- 📚 \*\*Book Management:\*\* Add, search, view, and delete books.

\- 👥 \*\*Member Management:\*\* Add and search library members.

\- 🔄 \*\*Borrow \& Return:\*\* Issue books and manage returns.

\- 📈 \*\*Analytics:\*\* Track borrowing and overdue records.

\- 💡 \*\*Book Recommendations:\*\* Get book suggestions based on member interests.



\## 🛠️ Technologies Used



| Technology | Purpose |

|---|---|

| React.js | Frontend |

| Tailwind CSS | UI Styling |

| Python | Backend programming |

| Flask | Backend framework |

| SQLite | Database |

| JavaScript | Application functionality |



\## 📁 Project Structure



```text

Smart-Library-System/

│

├── frontend/

│   ├── public/

│   └── src/

│       ├── App.jsx

│       ├── App.css

│       ├── index.css

│       └── main.jsx

│

├── backend/

│   ├── app.py

│   ├── database.py

│   ├── seed\_data.py

│   └── requirements.txt

│

└── README.md

```



\## ⚙️ Installation \& Setup



\### 1. Clone the repository



```bash

git clone https://github.com/codewithbhawa/Smart-Library-System.git

```



\### 2. Open the project folder



```bash

cd Smart-Library-System

```



\### 3. Setup Backend



```bash

cd backend

python -m venv venv

```



Activate the virtual environment on Windows:



```powershell

.\\venv\\Scripts\\Activate.ps1

```



Install dependencies:



```bash

pip install -r requirements.txt

```



Initialize the database and sample data:



```bash

python database.py

python seed\_data.py

```



Run the Flask server:



```bash

python app.py

```



Backend URL: http://127.0.0.1:5000



\### 4. Setup Frontend



Open another terminal:



```bash

cd frontend

npm install

npm run dev

```



Open the frontend URL shown in your terminal, usually:



http://localhost:5173



\## 💡 Future Improvements



\- User authentication and login system

\- Fine calculation for overdue books

\- Email reminders for due dates

\- Advanced recommendation system

\- Deployment to a live server



\## 👩‍💻 Author



\*\*Bhawna\*\*



Project: Smart Library Management System



GitHub: https://github.com/codewithbhawa



\---



⭐ If you find this project useful, feel free to explore the repository!



