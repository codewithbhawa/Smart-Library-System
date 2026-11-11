
import { useState, useEffect } from 'react'

const API = 'http://127.0.0.1:5000/api'

function App() {
  const [activePage, setActivePage] = useState('Dashboard')
  const [books, setBooks] = useState([])
  const [members, setMembers] = useState([])
  const [borrowings, setBorrowings] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [memberSearch, setMemberSearch] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [showBookForm, setShowBookForm] = useState(false)
  const [showMemberForm, setShowMemberForm] = useState(false)
  const [saving, setSaving] = useState(false)

  const [bookForm, setBookForm] = useState({
    title: '', author: '', category: '', isbn: '', total_copies: 1
  })

  const [memberForm, setMemberForm] = useState({
    name: '', email: '', phone: '', interests: ''
  })

  const [borrowForm, setBorrowForm] = useState({
    book_id: '', member_id: '', due_date: ''
  })

  const [recommendMember, setRecommendMember] = useState('')
  const [recommendations, setRecommendations] = useState([])

  async function loadData() {
    try {
      const [dashboard, bookList, memberList, borrowingList] =
        await Promise.all([
          fetch(`${API}/dashboard`),
          fetch(`${API}/books`),
          fetch(`${API}/members`),
          fetch(`${API}/borrowings`)
        ])

      if (!dashboard.ok || !bookList.ok || !memberList.ok || !borrowingList.ok) {
        throw new Error('Unable to load library data.')
      }

      const [dashboardData, booksData, membersData, borrowingData] =
        await Promise.all([
          dashboard.json(),
          bookList.json(),
          memberList.json(),
          borrowingList.json()
        ])

      setStats(dashboardData)
      setBooks(booksData)
      setMembers(membersData)
      setBorrowings(borrowingData)
      setError('')
    } catch (err) {
      setError('Backend connection failed. Check that Flask is running.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  function notify(text) {
    setMessage(text)
    setError('')
  }

  function fail(text) {
    setError(text)
    setMessage('')
  }

  async function addBook(event) {
    event.preventDefault()
    setSaving(true)

    try {
      const response = await fetch(`${API}/books`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookForm)
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)

      setBookForm({
        title: '', author: '', category: '', isbn: '', total_copies: 1
      })
      setShowBookForm(false)
      notify('Book added successfully!')
      await loadData()
    } catch (err) {
      fail(err.message || 'Could not add book.')
    } finally {
      setSaving(false)
    }
  }

  async function deleteBook(id) {
    if (!window.confirm('Are you sure you want to delete this book?')) return

    try {
      const response = await fetch(`${API}/books/${id}`, {
        method: 'DELETE'
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)

      notify('Book deleted successfully!')
      await loadData()
    } catch (err) {
      fail(err.message)
    }
  }

  async function addMember(event) {
    event.preventDefault()
    setSaving(true)

    try {
      const response = await fetch(`${API}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memberForm)
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)

      setMemberForm({ name: '', email: '', phone: '', interests: '' })
      setShowMemberForm(false)
      notify('Member added successfully!')
      await loadData()
    } catch (err) {
      fail(err.message || 'Could not add member.')
    } finally {
      setSaving(false)
    }
  }

  async function issueBook(event) {
    event.preventDefault()
    setSaving(true)

    try {
      const response = await fetch(`${API}/borrow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(borrowForm)
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)

      setBorrowForm({ book_id: '', member_id: '', due_date: '' })
      notify('Book issued successfully!')
      await loadData()
    } catch (err) {
      fail(err.message || 'Could not issue book.')
    } finally {
      setSaving(false)
    }
  }

  async function returnBook(id) {
    try {
      const response = await fetch(`${API}/return/${id}`, {
        method: 'POST'
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)

      notify('Book returned successfully!')
      await loadData()
    } catch (err) {
      fail(err.message || 'Could not return book.')
    }
  }

  async function getRecommendations(event) {
    event.preventDefault()
    if (!recommendMember) return

    try {
      const response = await fetch(
        `${API}/recommendations/${recommendMember}`
      )
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)

      setRecommendations(data)
      if (data.length === 0) {
        notify('No matching books found. Try updating member interests.')
      } else {
        notify(`${data.length} recommended books found!`)
      }
    } catch (err) {
      fail(err.message || 'Could not load recommendations.')
    }
  }

  const filteredBooks = books.filter(book =>
    `${book.title} ${book.author} ${book.category}`
      .toLowerCase().includes(search.toLowerCase())
  )

  const filteredMembers = members.filter(member =>
    `${member.name} ${member.email || ''} ${member.interests || ''}`
      .toLowerCase().includes(memberSearch.toLowerCase())
  )

  const navItems = [
    ['Dashboard', '▦'],
    ['Books Catalogue', '▤'],
    ['Members', '♙'],
    ['Borrow & Return', '⇄'],
    ['Analytics', '▥'],
    ['Recommendations', '✧']
  ]

  const cardStats = [
    { label: 'Total Book Copies', value: stats.total_books ?? 0, icon: '📚', color: 'bg-blue-50 text-blue-600' },
    { label: 'Active Members', value: stats.active_members ?? 0, icon: '👥', color: 'bg-green-50 text-green-600' },
    { label: 'Books Borrowed', value: stats.books_borrowed ?? 0, icon: '📖', color: 'bg-purple-50 text-purple-600' },
    { label: 'Overdue Books', value: stats.overdue_books ?? 0, icon: '⏰', color: 'bg-orange-50 text-orange-600' }
  ]

  const borrowedCount = borrowings.filter(item => item.status !== 'Returned').length
  const returnedCount = borrowings.filter(item => item.status === 'Returned').length
  const overdueCount = borrowings.filter(item => item.status === 'Overdue').length

  const inputClass = 'w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
  const buttonClass = 'rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50'
  const panelClass = 'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'

  function PageTitle({ title, subtitle }) {
    return (
      <div className="mb-7">
        <p className="text-sm text-slate-500">Smart Library / {title}</p>
        <h2 className="mt-1 text-3xl font-bold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>
    )
  }

  function BookTable({ items, showDelete = false }) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b bg-slate-50 text-slate-500">
              <th className="p-3">Book</th>
              <th className="p-3">Author</th>
              <th className="p-3">Category</th>
              <th className="p-3">Copies</th>
              <th className="p-3">Availability</th>
              {showDelete && <th className="p-3">Action</th>}
            </tr>
          </thead>
          <tbody>
            {items.map(book => (
              <tr key={book.id} className="border-b last:border-0 hover:bg-slate-50">
                <td className="p-3 font-semibold text-slate-800">{book.title}</td>
                <td className="p-3 text-slate-600">{book.author}</td>
                <td className="p-3 text-slate-600">{book.category}</td>
                <td className="p-3 text-slate-600">{book.available_copies}/{book.total_copies}</td>
                <td className="p-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    book.available_copies > 0
                      ? 'bg-green-100 text-green-700'
                      : 'bg-orange-100 text-orange-700'
                  }`}>
                    {book.available_copies > 0 ? 'Available' : 'Unavailable'}
                  </span>
                </td>
                {showDelete && (
                  <td className="p-3">
                    <button onClick={() => deleteBook(book.id)}
                      className="font-semibold text-red-600 hover:text-red-800">
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={showDelete ? 6 : 5} className="p-8 text-center text-slate-400">No books found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-800">
      <aside className="bg-slate-950 p-5 text-white md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <div>
          <h1 className="text-2xl font-bold">📚 Smart Library</h1>
          <p className="mt-1 text-xs tracking-wider text-slate-400">MANAGEMENT SYSTEM</p>
        </div>

        <p className="mb-3 mt-9 text-xs font-semibold uppercase tracking-widest text-slate-500">Workspace</p>
        <nav className="grid grid-cols-2 gap-2 md:block md:space-y-2">
          {navItems.map(([name, icon]) => (
            <button key={name} onClick={() => {
              setActivePage(name)
              setMessage('')
              setError('')
            }}
              className={`w-full rounded-xl px-4 py-3 text-left text-sm transition ${
                activePage === name
                  ? 'bg-blue-600 font-semibold text-white shadow-lg'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}>
              <span className="mr-3">{icon}</span>{name}
            </button>
          ))}
        </nav>

        <div className="mt-auto hidden rounded-xl bg-slate-900 p-4 md:block">
          <p className="font-semibold">Library Assistant</p>
          <p className="mt-1 text-xs text-slate-400">Manage your collection smartly.</p>
          <p className="mt-3 text-xs text-green-400">● System workspace</p>
        </div>
      </aside>

      <main
  style={{
  width: 'calc(100% - 16rem)',
  minHeight: '100vh',
  boxSizing: 'border-box',
  padding: '36px',
  marginLeft: '16rem',
  maxWidth: 'none'

  }}
  className="min-w-0"
>
        <header className="mb-7 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-5">
          <div>
            <p className="text-sm text-slate-500">Welcome to your workspace</p>
            <h2 className="text-xl font-bold text-slate-900">{activePage}</h2>
          </div>
          <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium">👤 Administrator</div>
        </header>

        {message && <div className="mb-5 rounded-xl bg-green-50 p-4 text-sm text-green-700">{message}</div>}
        {error && <div className="mb-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}

        {loading ? (
          <div className="rounded-xl bg-white p-12 text-center text-slate-500">Loading your library...</div>
        ) : (
          <>
            {/* DASHBOARD */}
            {activePage === 'Dashboard' && (
              <>
                <PageTitle title="Dashboard" subtitle="A quick overview of your library activities." />

                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {cardStats.map(stat => (
                    <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-500">{stat.label}</p>
                        <span className={`rounded-xl p-3 text-xl ${stat.color}`}>{stat.icon}</span>
                      </div>
                      <h3 className="mt-4 text-3xl font-bold text-slate-900">{stat.value}</h3>
                    </div>
                  ))}
                </section>

                <section className={`${panelClass} mt-7`}>
                  <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold">Recently Added Books</h3>
                      <p className="text-sm text-slate-500">Your latest library collection</p>
                    </div>
                    <button onClick={() => setActivePage('Books Catalogue')} className="text-sm font-semibold text-blue-600">View all →</button>
                  </div>
                  <BookTable items={books.slice(0, 6)} />
                </section>
              </>
            )}

            {/* BOOKS */}
            {activePage === 'Books Catalogue' && (
              <>
                <PageTitle title="Books Catalogue" subtitle="Search, add and manage your library collection." />

                <section className={`${panelClass} mb-6`}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold">Book Collection</h3>
                      <p className="text-sm text-slate-500">{books.length} different book records</p>
                    </div>
                    <button className={buttonClass} onClick={() => setShowBookForm(!showBookForm)}>+ Add New Book</button>
                  </div>

                  {showBookForm && (
                    <form onSubmit={addBook} className="mt-6 grid gap-4 border-t pt-5 sm:grid-cols-2">
                      <input className={inputClass} placeholder="Book title *" required value={bookForm.title} onChange={e => setBookForm({...bookForm, title: e.target.value})} />
                      <input className={inputClass} placeholder="Author name *" required value={bookForm.author} onChange={e => setBookForm({...bookForm, author: e.target.value})} />
                      <input className={inputClass} placeholder="Category *" required value={bookForm.category} onChange={e => setBookForm({...bookForm, category: e.target.value})} />
                      <input className={inputClass} placeholder="ISBN (optional)" value={bookForm.isbn} onChange={e => setBookForm({...bookForm, isbn: e.target.value})} />
                      <input className={inputClass} type="number" min="1" required placeholder="Total copies" value={bookForm.total_copies} onChange={e => setBookForm({...bookForm, total_copies: e.target.value})} />
                      <div className="flex gap-2">
                        <button disabled={saving} className={buttonClass}>{saving ? 'Saving...' : 'Save Book'}</button>
                        <button type="button" onClick={() => setShowBookForm(false)} className="rounded-lg border px-5 py-3 text-sm">Cancel</button>
                      </div>
                    </form>
                  )}
                </section>

                <section className={panelClass}>
                  <input className={`${inputClass} mb-5`} placeholder="Search by book title, author or category..." value={search} onChange={e => setSearch(e.target.value)} />
                  <BookTable items={filteredBooks} showDelete />
                </section>
              </>
            )}

            {/* MEMBERS */}
            {activePage === 'Members' && (
              <>
                <PageTitle title="Library Members" subtitle="Manage registered members and their reading interests." />

                <div className="mb-6 grid gap-4 sm:grid-cols-2">
                  <div className={panelClass}>
                    <p className="text-sm text-slate-500">Registered Members</p>
                    <h3 className="mt-2 text-3xl font-bold">{members.length}</h3>
                  </div>
                  <div className={panelClass}>
                    <p className="text-sm text-slate-500">Membership Status</p>
                    <h3 className="mt-2 text-3xl font-bold text-green-600">Active</h3>
                  </div>
                </div>

                <section className={panelClass}>
                  <div className="flex flex-wrap justify-between gap-3">
                    <input className={`${inputClass} sm:max-w-xs`} placeholder="Search members..." value={memberSearch} onChange={e => setMemberSearch(e.target.value)} />
                    <button className={buttonClass} onClick={() => setShowMemberForm(!showMemberForm)}>+ Add Member</button>
                  </div>

                  {showMemberForm && (
                    <form onSubmit={addMember} className="mt-5 grid gap-4 border-t pt-5 sm:grid-cols-2">
                      <input className={inputClass} placeholder="Full name *" required value={memberForm.name} onChange={e => setMemberForm({...memberForm, name: e.target.value})} />
                      <input className={inputClass} type="email" placeholder="Email address" value={memberForm.email} onChange={e => setMemberForm({...memberForm, email: e.target.value})} />
                      <input className={inputClass} placeholder="Phone number" value={memberForm.phone} onChange={e => setMemberForm({...memberForm, phone: e.target.value})} />
                      <input className={inputClass} placeholder="Interests e.g. History, Science" value={memberForm.interests} onChange={e => setMemberForm({...memberForm, interests: e.target.value})} />
                      <button disabled={saving} className={buttonClass}>{saving ? 'Saving...' : 'Save Member'}</button>
                    </form>
                  )}

                  <div className="mt-6 overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead><tr className="border-b bg-slate-50 text-slate-500"><th className="p-3">ID</th><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Phone</th><th className="p-3">Interests</th></tr></thead>
                      <tbody>
                        {filteredMembers.map(member => (
                          <tr key={member.id} className="border-b last:border-0">
                            <td className="p-3">#{member.id}</td>
                            <td className="p-3 font-semibold">{member.name}</td>
                            <td className="p-3">{member.email || '—'}</td>
                            <td className="p-3">{member.phone || '—'}</td>
                            <td className="p-3">{member.interests || '—'}</td>
                          </tr>
                        ))}
                        {filteredMembers.length === 0 && <tr><td colSpan="5" className="p-6 text-center text-slate-400">No members found.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </section>
              </>
            )}

            {/* BORROW AND RETURN */}
            {activePage === 'Borrow & Return' && (
              <>
                <PageTitle title="Borrow & Return" subtitle="Issue books to members and manage returns." />

                <section className={`${panelClass} mb-6`}>
                  <h3 className="mb-4 text-lg font-bold">Issue a Book</h3>
                  <form onSubmit={issueBook} className="grid gap-4 sm:grid-cols-3">
                    <select className={inputClass} required value={borrowForm.book_id} onChange={e => setBorrowForm({...borrowForm, book_id: e.target.value})}>
                      <option value="">Select available book</option>
                      {books.filter(book => book.available_copies > 0).map(book => <option key={book.id} value={book.id}>{book.title} ({book.available_copies} available)</option>)}
                    </select>
                    <select className={inputClass} required value={borrowForm.member_id} onChange={e => setBorrowForm({...borrowForm, member_id: e.target.value})}>
                      <option value="">Select member</option>
                      {members.map(member => <option key={member.id} value={member.id}>{member.name}</option>)}
                    </select>
                    <input className={inputClass} type="date" required value={borrowForm.due_date} onChange={e => setBorrowForm({...borrowForm, due_date: e.target.value})} />
                    <button disabled={saving} className={buttonClass}>{saving ? 'Processing...' : 'Issue Book'}</button>
                  </form>
                </section>

                <section className={panelClass}>
                  <h3 className="mb-4 text-lg font-bold">Borrowing Records</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead><tr className="border-b bg-slate-50 text-slate-500"><th className="p-3">Book</th><th className="p-3">Member</th><th className="p-3">Borrowed</th><th className="p-3">Due Date</th><th className="p-3">Status</th><th className="p-3">Action</th></tr></thead>
                      <tbody>
                        {borrowings.map(record => (
                          <tr key={record.id} className="border-b last:border-0">
                            <td className="p-3 font-semibold">{record.book_title}</td>
                            <td className="p-3">{record.member_name}</td>
                            <td className="p-3">{record.borrow_date}</td>
                            <td className="p-3">{record.due_date}</td>
                            <td className="p-3"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${record.status === 'Returned' ? 'bg-green-100 text-green-700' : record.status === 'Overdue' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{record.status}</span></td>
                            <td className="p-3">{record.status !== 'Returned' && <button onClick={() => returnBook(record.id)} className="font-semibold text-blue-600">Return</button>}</td>
                          </tr>
                        ))}
                        {borrowings.length === 0 && <tr><td colSpan="6" className="p-8 text-center text-slate-400">No borrowing records yet.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </section>
              </>
            )}

            {/* ANALYTICS */}
            {activePage === 'Analytics' && (
              <>
                <PageTitle title="Library Analytics" subtitle="Understand your library's current activity." />
                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {[
                    ['Total Copies', stats.total_books || 0],
                    ['Available Copies', stats.available_books || 0],
                    ['Currently Borrowed', borrowedCount],
                    ['Overdue Records', overdueCount]
                  ].map(([label, value]) => (
                    <div className={panelClass} key={label}>
                      <p className="text-sm text-slate-500">{label}</p>
                      <h3 className="mt-3 text-3xl font-bold">{value}</h3>
                    </div>
                  ))}
                </section>

                <section className={`${panelClass} mt-6`}>
                  <h3 className="mb-6 text-lg font-bold">Borrowing Overview</h3>
                  {[
                    ['Currently Borrowed', borrowedCount, 'bg-blue-500'],
                    ['Returned Books', returnedCount, 'bg-green-500'],
                    ['Overdue Books', overdueCount, 'bg-orange-500']
                  ].map(([label, value, color]) => {
                    const total = Math.max(borrowings.length, 1)
                    return (
                      <div className="mb-6" key={label}>
                        <div className="mb-2 flex justify-between text-sm"><span>{label}</span><strong>{value}</strong></div>
                        <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                          <div className={`h-full rounded-full ${color}`} style={{width: `${value / total * 100}%`}} />
                        </div>
                      </div>
                    )
                  })}
                  <p className="text-xs text-slate-400">Statistics are calculated from your library database records.</p>
                </section>
              </>
            )}

            {/* RECOMMENDATIONS */}
            {activePage === 'Recommendations' && (
              <>
                <PageTitle title="Book Recommendations" subtitle="Discover books based on a member's reading interests." />
                <section className={`${panelClass} mb-6`}>
                  <h3 className="mb-4 text-lg font-bold">Find Recommended Books</h3>
                  <form onSubmit={getRecommendations} className="flex flex-wrap gap-3">
                    <select className={`${inputClass} sm:max-w-md`} required value={recommendMember} onChange={e => setRecommendMember(e.target.value)}>
                      <option value="">Choose a library member</option>
                      {members.map(member => <option key={member.id} value={member.id}>{member.name} — {member.interests || 'No interests added'}</option>)}
                    </select>
                    <button className={buttonClass}>Find Recommendations</button>
                  </form>
                </section>

                <section className={panelClass}>
                  <h3 className="mb-4 text-lg font-bold">Recommended for You</h3>
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {recommendations.map(book => (
                      <div key={book.id} className="rounded-xl border border-slate-200 p-5 hover:border-blue-300">
                        <div className="mb-3 text-3xl">📘</div>
                        <h4 className="font-bold text-slate-900">{book.title}</h4>
                        <p className="mt-1 text-sm text-slate-500">{book.author}</p>
                        <div className="mt-4 flex items-center justify-between">
                          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-700">{book.category}</span>
                          <span className="text-xs text-green-600">Available</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {recommendations.length === 0 && <p className="py-8 text-center text-sm text-slate-400">Select a member above to see personalized recommendations.</p>}
                </section>
              </>
            )}
          </>
        )}

        <footer className="mt-10 border-t border-slate-200 pt-5 text-center text-xs text-slate-400">
          Smart Library Management System · React · Flask · SQLite
        </footer>
      </main>
    </div>
  )
}

export default App
