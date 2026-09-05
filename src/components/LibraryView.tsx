import { useState, type FormEvent } from 'react'
import { BookCheck, BookOpen, LibraryBig, Plus, RotateCcw, Search, X } from 'lucide-react'
import type { Book, Student } from '../agenda'

export type BookInput = Pick<Book, 'title' | 'author'>

type LibraryViewProps = {
  books: Book[]
  students: Student[]
  onAddBook: (book: BookInput) => void
  onLoanBook: (bookId: string, studentId: string) => void
  onReturnBook: (bookId: string) => void
}

function BookDialog({ onClose, onSave }: { onClose: () => void; onSave: (book: BookInput) => void }) {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSave({ title: title.trim(), author: author.trim() })
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="dialog small" role="dialog" aria-modal="true" aria-labelledby="book-dialog-title">
        <div className="dialog-heading"><div><span className="eyebrow">Βιβλιοθήκη τάξης</span><h2 id="book-dialog-title">Νέο βιβλίο</h2></div><button type="button" className="icon-button" aria-label="Κλείσιμο" title="Κλείσιμο" onClick={onClose}><X size={20} /></button></div>
        <form className="dialog-form" onSubmit={submit}>
          <label>Τίτλος<input required autoFocus value={title} onChange={(event) => setTitle(event.target.value)} /></label>
          <label>Συγγραφέας<input value={author} onChange={(event) => setAuthor(event.target.value)} /></label>
          <div className="dialog-actions"><button type="button" className="button secondary" onClick={onClose}>Ακύρωση</button><button type="submit" className="button primary">Προσθήκη</button></div>
        </form>
      </section>
    </div>
  )
}

function BookRow({ book, students, onLoan, onReturn }: { book: Book; students: Student[]; onLoan: (studentId: string) => void; onReturn: () => void }) {
  const [studentId, setStudentId] = useState('')
  const borrower = students.find((student) => student.id === book.borrowerId)
  return (
    <article className={`book-row ${book.borrowerId ? 'loaned' : ''}`}>
      <span className="book-cover" aria-hidden="true"><BookOpen size={22} /></span>
      <div className="book-title"><h2>{book.title}</h2><p>{book.author || 'Χωρίς καταχωρισμένο συγγραφέα'}</p></div>
      <div className="book-state">
        <span className={`status-pill ${book.borrowerId ? 'absent' : 'present'}`}>{book.borrowerId ? 'Σε δανεισμό' : 'Διαθέσιμο'}</span>
        {borrower && <small>{borrower.fullName}{book.borrowedAt ? ` · ${new Intl.DateTimeFormat('el-GR').format(new Date(`${book.borrowedAt}T12:00:00`))}` : ''}</small>}
      </div>
      <div className="book-action">
        {book.borrowerId ? (
          <button type="button" className="button secondary" onClick={onReturn}><RotateCcw size={17} /> Επιστροφή</button>
        ) : (
          <>
            <label><span className="sr-only">Μαθητής</span><select value={studentId} onChange={(event) => setStudentId(event.target.value)}><option value="">Επίλεξε μαθητή</option>{students.filter((student) => student.active).map((student) => <option key={student.id} value={student.id}>{student.fullName}</option>)}</select></label>
            <button type="button" className="button primary" disabled={!studentId} onClick={() => { onLoan(studentId); setStudentId('') }}><BookCheck size={17} /> Δανεισμός</button>
          </>
        )}
      </div>
    </article>
  )
}

export default function LibraryView({ books, students, onAddBook, onLoanBook, onReturnBook }: LibraryViewProps) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'available' | 'loaned'>('all')
  const [showDialog, setShowDialog] = useState(false)
  const visibleBooks = books.filter((book) => {
    const matchesQuery = `${book.title} ${book.author}`.toLocaleLowerCase('el').includes(query.toLocaleLowerCase('el'))
    const matchesFilter = filter === 'all' || (filter === 'available' ? !book.borrowerId : Boolean(book.borrowerId))
    return matchesQuery && matchesFilter
  })
  const loanedCount = books.filter((book) => book.borrowerId).length

  return (
    <section className="agenda-view">
      <div className="view-heading"><div><span className="eyebrow">Δανειστική συλλογή</span><h1>Βιβλιοθήκη</h1><p>{books.length - loanedCount} διαθέσιμα · {loanedCount} σε δανεισμό</p></div><button type="button" className="button primary" onClick={() => setShowDialog(true)}><Plus size={18} /> Νέο βιβλίο</button></div>
      <div className="list-toolbar wrap-mobile">
        <label className="search-field"><Search size={18} /><span className="sr-only">Αναζήτηση βιβλίου</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Τίτλος ή συγγραφέας…" /></label>
        <div className="segmented-control compact"><button type="button" className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>Όλα</button><button type="button" className={filter === 'available' ? 'active' : ''} onClick={() => setFilter('available')}>Διαθέσιμα</button><button type="button" className={filter === 'loaned' ? 'active' : ''} onClick={() => setFilter('loaned')}>Δανεισμένα</button></div>
      </div>
      <div className="books-list">{visibleBooks.map((book) => <BookRow key={book.id} book={book} students={students} onLoan={(studentId) => onLoanBook(book.id, studentId)} onReturn={() => onReturnBook(book.id)} />)}</div>
      {visibleBooks.length === 0 && <div className="empty-state"><LibraryBig /><h2>Δεν βρέθηκαν βιβλία</h2><p>Άλλαξε το φίλτρο ή πρόσθεσε έναν νέο τίτλο.</p></div>}
      {showDialog && <BookDialog onClose={() => setShowDialog(false)} onSave={(book) => { onAddBook(book); setShowDialog(false) }} />}
    </section>
  )
}