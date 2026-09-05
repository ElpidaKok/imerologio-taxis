import { useState, type FormEvent } from 'react'
import { Archive, BookOpen, Pencil, Phone, Plus, RotateCcw, Search, UserRound, X } from 'lucide-react'
import type { Book, Student } from '../agenda'

export type StudentInput = Pick<Student, 'fullName' | 'guardianName' | 'guardianPhone' | 'profileNotes'>

type StudentsViewProps = {
  students: Student[]
  books: Book[]
  onAddStudent: (student: StudentInput) => void
  onUpdateStudent: (studentId: string, patch: Partial<Student>) => void
}

function initials(name: string) {
  return name.split(' ').slice(0, 2).map((part) => part[0]).join('')
}

function StudentDialog({
  student,
  onClose,
  onSave,
}: {
  student: Student | null
  onClose: () => void
  onSave: (student: StudentInput) => void
}) {
  const [draft, setDraft] = useState<StudentInput>({
    fullName: student?.fullName ?? '',
    guardianName: student?.guardianName ?? '',
    guardianPhone: student?.guardianPhone ?? '',
    profileNotes: student?.profileNotes ?? '',
  })

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSave({
      fullName: draft.fullName.trim(),
      guardianName: draft.guardianName.trim(),
      guardianPhone: draft.guardianPhone.trim(),
      profileNotes: draft.profileNotes.trim(),
    })
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="dialog" role="dialog" aria-modal="true" aria-labelledby="student-dialog-title">
        <div className="dialog-heading">
          <div>
            <span className="eyebrow">Καρτέλα μαθητή</span>
            <h2 id="student-dialog-title">{student ? 'Επεξεργασία στοιχείων' : 'Νέος μαθητής'}</h2>
          </div>
          <button type="button" className="icon-button" aria-label="Κλείσιμο" title="Κλείσιμο" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={submit} className="dialog-form">
          <label>Ονοματεπώνυμο<input required autoFocus value={draft.fullName} onChange={(event) => setDraft({ ...draft, fullName: event.target.value })} /></label>
          <div className="form-row">
            <label>Όνομα κηδεμόνα<input value={draft.guardianName} onChange={(event) => setDraft({ ...draft, guardianName: event.target.value })} /></label>
            <label>Τηλέφωνο<input inputMode="tel" value={draft.guardianPhone} onChange={(event) => setDraft({ ...draft, guardianPhone: event.target.value })} /></label>
          </div>
          <label>Μόνιμες σημειώσεις<textarea rows={3} placeholder="π.χ. αλλεργίες ή χρήσιμες πληροφορίες" value={draft.profileNotes} onChange={(event) => setDraft({ ...draft, profileNotes: event.target.value })} /></label>
          <div className="dialog-actions">
            <button type="button" className="button secondary" onClick={onClose}>Ακύρωση</button>
            <button type="submit" className="button primary">{student ? 'Αποθήκευση' : 'Προσθήκη μαθητή'}</button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default function StudentsView({ students, books, onAddStudent, onUpdateStudent }: StudentsViewProps) {
  const [query, setQuery] = useState('')
  const [showArchived, setShowArchived] = useState(false)
  const [dialogStudent, setDialogStudent] = useState<Student | 'new' | null>(null)
  const visibleStudents = students.filter((student) => {
    const matchesState = showArchived ? !student.active : student.active
    return matchesState && student.fullName.toLocaleLowerCase('el').includes(query.toLocaleLowerCase('el'))
  })

  return (
    <section className="agenda-view">
      <div className="view-heading">
        <div><span className="eyebrow">Μητρώο τάξης</span><h1>Μαθητές</h1><p>Στοιχεία επικοινωνίας, σημειώσεις και ενεργοί δανεισμοί.</p></div>
        <button type="button" className="button primary" onClick={() => setDialogStudent('new')}><Plus size={18} /> Νέος μαθητής</button>
      </div>

      <div className="list-toolbar wrap-mobile">
        <label className="search-field"><Search size={18} /><span className="sr-only">Αναζήτηση μαθητή</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Αναζήτηση μαθητή…" /></label>
        <div className="segmented-control compact">
          <button type="button" className={!showArchived ? 'active' : ''} onClick={() => setShowArchived(false)}>Ενεργοί ({students.filter((student) => student.active).length})</button>
          <button type="button" className={showArchived ? 'active' : ''} onClick={() => setShowArchived(true)}>Αρχείο ({students.filter((student) => !student.active).length})</button>
        </div>
      </div>

      <div className="profiles-grid">
        {visibleStudents.map((student) => {
          const loans = books.filter((book) => book.borrowerId === student.id)
          return (
            <article className="profile-card" key={student.id}>
              <div className="profile-heading">
                <span className={`student-avatar ${student.color}`}>{initials(student.fullName)}</span>
                <div><h2>{student.fullName}</h2><span>{student.active ? 'Ενεργός μαθητής' : 'Στο αρχείο'}</span></div>
                <button type="button" className="icon-button" title="Επεξεργασία" aria-label={`Επεξεργασία ${student.fullName}`} onClick={() => setDialogStudent(student)}><Pencil size={17} /></button>
              </div>
              <dl className="profile-details">
                <div><dt><UserRound size={16} /> Κηδεμόνας</dt><dd>{student.guardianName || 'Δεν έχει καταχωριστεί'}</dd></div>
                <div><dt><Phone size={16} /> Τηλέφωνο</dt><dd>{student.guardianPhone || 'Δεν έχει καταχωριστεί'}</dd></div>
                <div><dt><BookOpen size={16} /> Δανεισμοί</dt><dd>{loans.length ? loans.map((book) => book.title).join(', ') : 'Κανένας ενεργός'}</dd></div>
              </dl>
              {student.profileNotes && <p className="profile-note">{student.profileNotes}</p>}
              <button type="button" className="text-button" onClick={() => onUpdateStudent(student.id, { active: !student.active })}>
                {student.active ? <Archive size={16} /> : <RotateCcw size={16} />}
                {student.active ? 'Μεταφορά στο αρχείο' : 'Επαναφορά μαθητή'}
              </button>
            </article>
          )
        })}
      </div>

      {visibleStudents.length === 0 && <div className="empty-state"><UserRound /><h2>Δεν βρέθηκαν μαθητές</h2><p>Άλλαξε την αναζήτηση ή πρόσθεσε νέα καρτέλα.</p></div>}

      {dialogStudent && (
        <StudentDialog
          key={dialogStudent === 'new' ? 'new' : dialogStudent.id}
          student={dialogStudent === 'new' ? null : dialogStudent}
          onClose={() => setDialogStudent(null)}
          onSave={(student) => {
            if (dialogStudent !== 'new') onUpdateStudent(dialogStudent.id, student)
            else onAddStudent(student)
            setDialogStudent(null)
          }}
        />
      )}
    </section>
  )
}