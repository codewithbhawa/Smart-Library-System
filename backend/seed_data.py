
from database import get_db_connection

books = [
    ("Atomic Habits", "James Clear", "Self Development", "9780000000001", 5, 5),
    ("The Psychology of Money", "Morgan Housel", "Finance", "9780000000002", 4, 4),
    ("Ikigai", "Hector Garcia", "Self Development", "9780000000003", 3, 3),
    ("Rich Dad Poor Dad", "Robert Kiyosaki", "Finance", "9780000000004", 4, 4),
    ("Wings of Fire", "A.P.J. Abdul Kalam", "Biography", "9780000000005", 5, 5),
    ("The Alchemist", "Paulo Coelho", "Fiction", "9780000000006", 4, 4),
    ("1984", "George Orwell", "Fiction", "9780000000007", 3, 3),
    ("The Great Gatsby", "F. Scott Fitzgerald", "Fiction", "9780000000008", 2, 2),
    ("Deep Work", "Cal Newport", "Productivity", "9780000000009", 3, 3),
    ("Think and Grow Rich", "Napoleon Hill", "Finance", "9780000000010", 4, 4),
    ("The Power of Habit", "Charles Duhigg", "Self Development", "9780000000011", 3, 3),
    ("India After Gandhi", "Ramachandra Guha", "History", "9780000000012", 2, 2),
    ("The Discovery of India", "Jawaharlal Nehru", "History", "9780000000013", 3, 3),
    ("Sapiens", "Yuval Noah Harari", "History", "9780000000014", 4, 4),
    ("Harry Potter", "J.K. Rowling", "Fantasy", "9780000000015", 5, 5),
    ("The Hobbit", "J.R.R. Tolkien", "Fantasy", "9780000000016", 3, 3),
    ("To Kill a Mockingbird", "Harper Lee", "Fiction", "9780000000017", 2, 2),
    ("Pride and Prejudice", "Jane Austen", "Romance", "9780000000018", 3, 3),
    ("The 5 AM Club", "Robin Sharma", "Self Development", "9780000000019", 3, 3),
    ("Start With Why", "Simon Sinek", "Business", "9780000000020", 2, 2),
    ("The Intelligent Investor", "Benjamin Graham", "Finance", "9780000000021", 2, 2),
    ("A Brief History of Time", "Stephen Hawking", "Science", "9780000000022", 3, 3),
    ("The Theory of Everything", "Stephen Hawking", "Science", "9780000000023", 2, 2),
    ("Gitanjali", "Rabindranath Tagore", "Poetry", "9780000000024", 3, 3),
    ("Godan", "Munshi Premchand", "Literature", "9780000000025", 4, 4),
    ("The Guide", "R.K. Narayan", "Literature", "9780000000026", 2, 2),
    ("Wuthering Heights", "Emily Bronte", "Classic", "9780000000027", 2, 2),
    ("The Silent Patient", "Alex Michaelides", "Thriller", "9780000000028", 3, 3),
    ("Educated", "Tara Westover", "Memoir", "9780000000029", 2, 2),
    ("Man's Search for Meaning", "Viktor Frankl", "Psychology", "9780000000030", 3, 3),
]

members = [
    ("Aarav Sharma", "aarav@example.com", "9000000001", "Fiction, History"),
    ("Priya Verma", "priya@example.com", "9000000002", "Finance, Business"),
    ("Rohan Gupta", "rohan@example.com", "9000000003", "Science, Technology"),
    ("Ananya Singh", "ananya@example.com", "9000000004", "Literature, Poetry"),
    ("Kabir Mehta", "kabir@example.com", "9000000005", "Self Development"),
    ("Isha Kapoor", "isha@example.com", "9000000006", "Psychology, Fiction"),
    ("Arjun Patel", "arjun@example.com", "9000000007", "History, Biography"),
    ("Meera Joshi", "meera@example.com", "9000000008", "Classic, Literature"),
    ("Dev Malhotra", "dev@example.com", "9000000009", "Finance, Business"),
    ("Sana Khan", "sana@example.com", "9000000010", "Poetry, Fiction"),
    ("Aditya Rao", "aditya@example.com", "9000000011", "Science, History"),
    ("Kavya Nair", "kavya@example.com", "9000000012", "Self Development"),
    ("Vivaan Das", "vivaan@example.com", "9000000013", "Fantasy, Fiction"),
    ("Diya Jain", "diya@example.com", "9000000014", "Psychology, Memoir"),
    ("Ishaan Roy", "ishaan@example.com", "9000000015", "Biography, History"),
]


def seed_database():
    connection = get_db_connection()

    try:
        book_count = connection.execute(
            "SELECT COUNT(*) FROM books"
        ).fetchone()[0]

        member_count = connection.execute(
            "SELECT COUNT(*) FROM members"
        ).fetchone()[0]

        if book_count == 0:
            connection.executemany("""
                INSERT INTO books
                (title, author, category, isbn, total_copies, available_copies)
                VALUES (?, ?, ?, ?, ?, ?)
            """, books)
            print("30 sample books added.")

        else:
            print("Books already exist. Skipping books.")

        if member_count == 0:
            connection.executemany("""
                INSERT INTO members
                (name, email, phone, interests)
                VALUES (?, ?, ?, ?)
            """, members)
            print("15 sample members added.")

        else:
            print("Members already exist. Skipping members.")

        connection.commit()

        print("Sample data setup completed!")

    except Exception as error:
        connection.rollback()
        print("Error:", error)

    finally:
        connection.close()


if __name__ == "__main__":
    seed_database()
