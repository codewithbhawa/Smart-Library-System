
import sqlite3
import os

DATABASE_PATH = os.path.join(
    os.path.dirname(__file__),
    "library.db"
)


def get_db_connection():
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    return connection


def initialize_database():
    connection = get_db_connection()

    connection.execute("""
        CREATE TABLE IF NOT EXISTS books (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            author TEXT NOT NULL,
            category TEXT NOT NULL,
            isbn TEXT UNIQUE,
            total_copies INTEGER DEFAULT 1,
            available_copies INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    connection.execute("""
        CREATE TABLE IF NOT EXISTS members (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE,
            phone TEXT,
            interests TEXT,
            joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    connection.execute("""
        CREATE TABLE IF NOT EXISTS borrowings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            book_id INTEGER NOT NULL,
            member_id INTEGER NOT NULL,
            borrow_date DATE NOT NULL,
            due_date DATE NOT NULL,
            return_date DATE,
            status TEXT DEFAULT 'Borrowed',
            FOREIGN KEY (book_id) REFERENCES books(id),
            FOREIGN KEY (member_id) REFERENCES members(id)
        )
    """)

    connection.commit()
    connection.close()

    print("Database initialized successfully!")


if __name__ == "__main__":
    initialize_database()
