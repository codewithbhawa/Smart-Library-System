
from flask import Flask, jsonify, request
from flask_cors import CORS
from database import get_db_connection
import sqlite3

app = Flask(__name__)
CORS(app)


@app.route("/")
def home():
    return jsonify({
        "message": "Welcome to Smart Library Management System!",
        "status": "Backend is running successfully"
    })


# DASHBOARD
@app.route("/api/dashboard")
def dashboard():
    connection = get_db_connection()

    total_books = connection.execute(
        "SELECT COALESCE(SUM(total_copies), 0) FROM books"
    ).fetchone()[0]

    available_books = connection.execute(
        "SELECT COALESCE(SUM(available_copies), 0) FROM books"
    ).fetchone()[0]

    total_members = connection.execute(
        "SELECT COUNT(*) FROM members"
    ).fetchone()[0]

    borrowed_books = connection.execute("""
        SELECT COUNT(*) FROM borrowings
        WHERE status = 'Borrowed'
        AND due_date >= date('now')
    """).fetchone()[0]

    overdue_books = connection.execute("""
        SELECT COUNT(*) FROM borrowings
        WHERE status = 'Borrowed'
        AND due_date < date('now')
    """).fetchone()[0]

    connection.close()

    return jsonify({
        "total_books": total_books,
        "available_books": available_books,
        "active_members": total_members,
        "books_borrowed": borrowed_books,
        "overdue_books": overdue_books
    })


# BOOKS: GET AND SEARCH
@app.route("/api/books", methods=["GET"])
def get_books():
    search = request.args.get("search", "").strip()

    connection = get_db_connection()

    books = connection.execute("""
        SELECT * FROM books
        WHERE title LIKE ?
        OR author LIKE ?
        OR category LIKE ?
        ORDER BY id DESC
    """, (f"%{search}%", f"%{search}%", f"%{search}%")).fetchall()

    connection.close()
    return jsonify([dict(book) for book in books])


# BOOKS: ADD
@app.route("/api/books", methods=["POST"])
def add_book():
    data = request.get_json(silent=True) or {}

    title = str(data.get("title", "")).strip()
    author = str(data.get("author", "")).strip()
    category = str(data.get("category", "")).strip()
    isbn = str(data.get("isbn", "")).strip()
    
    try:
        copies = int(data.get("total_copies", 1))
        if copies < 1:
            raise ValueError()
    except (ValueError, TypeError):
        return jsonify({"error": "Copies must be at least 1."}), 400

    if not title or not author or not category:
        return jsonify({
            "error": "Title, author and category are required."
        }), 400

    connection = get_db_connection()

    try:
        cursor = connection.execute("""
            INSERT INTO books
            (title, author, category, isbn, total_copies, available_copies)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (title, author, category, isbn or None, copies, copies))

        connection.commit()

        book = connection.execute(
            "SELECT * FROM books WHERE id = ?", (cursor.lastrowid,)
        ).fetchone()

        return jsonify({
            "message": "Book added successfully!",
            "book": dict(book)
        }), 201

    except sqlite3.IntegrityError:
        connection.rollback()
        return jsonify({"error": "This ISBN is already registered."}), 409

    finally:
        connection.close()


# BOOKS: DELETE
@app.route("/api/books/<int:book_id>", methods=["DELETE"])
def delete_book(book_id):
    connection = get_db_connection()

    try:
        active = connection.execute("""
            SELECT COUNT(*) FROM borrowings
            WHERE book_id = ? AND status = 'Borrowed'
        """, (book_id,)).fetchone()[0]

        if active:
            return jsonify({
                "error": "Return this book before deleting it."
            }), 400

        cursor = connection.execute(
            "DELETE FROM books WHERE id = ?", (book_id,)
        )
        connection.commit()

        if cursor.rowcount == 0:
            return jsonify({"error": "Book not found."}), 404

        return jsonify({"message": "Book deleted successfully!"})

    finally:
        connection.close()


# MEMBERS: GET
@app.route("/api/members", methods=["GET"])
def get_members():
    connection = get_db_connection()

    members = connection.execute("""
        SELECT * FROM members ORDER BY id DESC
    """).fetchall()

    connection.close()
    return jsonify([dict(member) for member in members])


# MEMBERS: ADD
@app.route("/api/members", methods=["POST"])
def add_member():
    data = request.get_json(silent=True) or {}

    name = str(data.get("name", "")).strip()
    email = str(data.get("email", "")).strip()
    phone = str(data.get("phone", "")).strip()
    interests = str(data.get("interests", "")).strip()

    if not name:
        return jsonify({"error": "Member name is required."}), 400

    connection = get_db_connection()

    try:
        cursor = connection.execute("""
            INSERT INTO members (name, email, phone, interests)
            VALUES (?, ?, ?, ?)
        """, (name, email or None, phone, interests))

        connection.commit()

        member = connection.execute(
            "SELECT * FROM members WHERE id = ?", (cursor.lastrowid,)
        ).fetchone()

        return jsonify({
            "message": "Member added successfully!",
            "member": dict(member)
        }), 201

    except sqlite3.IntegrityError:
        connection.rollback()
        return jsonify({
            "error": "This email address is already registered."
        }), 409

    finally:
        connection.close()


# BORROW: ISSUE A BOOK
@app.route("/api/borrow", methods=["POST"])
def borrow_book():
    data = request.get_json(silent=True) or {}

    try:
        book_id = int(data.get("book_id"))
        member_id = int(data.get("member_id"))
    except (ValueError, TypeError):
        return jsonify({"error": "Valid book and member IDs are required."}), 400

    due_date = str(data.get("due_date", "")).strip()

    if not due_date:
        return jsonify({"error": "Due date is required."}), 400

    connection = get_db_connection()

    try:
        book = connection.execute(
            "SELECT * FROM books WHERE id = ?", (book_id,)
        ).fetchone()

        member = connection.execute(
            "SELECT * FROM members WHERE id = ?", (member_id,)
        ).fetchone()

        if not book or not member:
            return jsonify({"error": "Book or member not found."}), 404

        if book["available_copies"] < 1:
            return jsonify({"error": "No copies available."}), 400

        cursor = connection.execute("""
            INSERT INTO borrowings
            (book_id, member_id, borrow_date, due_date, status)
            VALUES (?, ?, date('now'), ?, 'Borrowed')
        """, (book_id, member_id, due_date))

        connection.execute("""
            UPDATE books
            SET available_copies = available_copies - 1
            WHERE id = ?
        """, (book_id,))

        connection.commit()

        return jsonify({
            "message": "Book issued successfully!",
            "borrowing_id": cursor.lastrowid
        }), 201

    except sqlite3.IntegrityError:
        connection.rollback()
        return jsonify({"error": "Could not issue this book."}), 400

    finally:
        connection.close()


# BORROWINGS: VIEW ALL
@app.route("/api/borrowings", methods=["GET"])
def get_borrowings():
    connection = get_db_connection()

    records = connection.execute("""
        SELECT
            borrowings.id,
            borrowings.book_id,
            borrowings.member_id,
            books.title AS book_title,
            members.name AS member_name,
            borrowings.borrow_date,
            borrowings.due_date,
            borrowings.return_date,
            CASE
                WHEN borrowings.status = 'Returned' THEN 'Returned'
                WHEN borrowings.due_date < date('now') THEN 'Overdue'
                ELSE 'Borrowed'
            END AS status
        FROM borrowings
        JOIN books ON books.id = borrowings.book_id
        JOIN members ON members.id = borrowings.member_id
        ORDER BY borrowings.id DESC
    """).fetchall()

    connection.close()
    return jsonify([dict(record) for record in records])


# RETURN A BOOK
@app.route("/api/return/<int:borrowing_id>", methods=["POST"])
def return_book(borrowing_id):
    connection = get_db_connection()

    try:
        record = connection.execute("""
            SELECT * FROM borrowings WHERE id = ?
        """, (borrowing_id,)).fetchone()

        if not record:
            return jsonify({"error": "Borrowing record not found."}), 404

        if record["status"] == "Returned":
            return jsonify({"error": "This book is already returned."}), 400

        connection.execute("""
            UPDATE borrowings
            SET status = 'Returned', return_date = date('now')
            WHERE id = ?
        """, (borrowing_id,))

        connection.execute("""
            UPDATE books
            SET available_copies = available_copies + 1
            WHERE id = ?
        """, (record["book_id"],))

        connection.commit()

        return jsonify({"message": "Book returned successfully!"})

    finally:
        connection.close()


# PERSONALIZED RECOMMENDATIONS
@app.route("/api/recommendations/<int:member_id>", methods=["GET"])
def recommendations(member_id):
    connection = get_db_connection()

    member = connection.execute(
        "SELECT * FROM members WHERE id = ?", (member_id,)
    ).fetchone()

    if not member:
        connection.close()
        return jsonify({"error": "Member not found."}), 404

    interests = [
        word.strip().lower()
        for word in (member["interests"] or "").replace(",", " ").split()
        if len(word.strip()) > 2
    ]

    books = connection.execute("""
        SELECT * FROM books
        WHERE available_copies > 0
        ORDER BY id DESC
    """).fetchall()

    connection.close()

    results = []

    for book in books:
        category = (book["category"] or "").lower()
        title = (book["title"] or "").lower()
        author = (book["author"] or "").lower()

        score = sum(
            1 for word in interests
            if word in category or word in title or word in author
        )

        if score > 0:
            item = dict(book)
            item["recommendation_score"] = score
            results.append(item)

    results.sort(
        key=lambda item: item["recommendation_score"],
        reverse=True
    )

    return jsonify(results[:10])


if __name__ == "__main__":
    app.run(debug=True, port=5000)
