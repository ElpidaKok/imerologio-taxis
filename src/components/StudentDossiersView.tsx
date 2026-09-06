import { useState, type FormEvent } from 'react'
import {
  Archive,
  BookOpen,
  Brain,
  CalendarDays,
  Camera,
  GraduationCap,
  HandHeart,
  HeartPulse,
  Mail,
  NotebookPen,
  Pencil,
  Phone,
  Plus,
  RotateCcw,
  Search,
  UserRound,
  Users,
  X,
} from 'lucide-react'
import { getDateKey, type Book, type Student, type StudentEntry, type StudentSection } from '../agenda'

export type StudentInput = Pick<Student,
  'fullName' | 'photoDataUrl' | 'birthDate' | 'className' | 'guardianName' | 'guardianPhone' |
  'secondGuardianName' | 'secondGuardianPhone' | 'guardianEmail' | 'profileNotes' |
  'sectionNotes' | 'supportNeeds' | 'accommodations'
>

type StudentDossiersViewProps = {
  students: Student[]
  books: Book[]
  entries: StudentEntry[]
  onAddStudent: (student: StudentInput) => void
  onUpdateStudent: (studentId: string, patch: Partial<Student>) => void
  onAddEntry: (entry: Omit<StudentEntry, 'id'>) => void
}

const sectionLabels: Record<StudentSection, string> = {
  academic: 'Ακαδημαϊκά',
  behavior: 'Συμπεριφορά',
  support: 'Υποστήριξη',
  health: 'Υγεία',
}

const sectionIcons = {
  academic: GraduationCap,
  behavior: Brain,
  support: HandHeart,
  health: HeartPulse,
}

const supportOptions = ['Δυσλεξία', 'ΔΕΠ-Υ', 'ΔΑΦ', 'Μαθησιακή υποστήριξη', 'Άλλο']

function initials(name: string) {
  return name.split(' ').slice(0, 2).map((part) => part[0]).join('')
}

function formatDate(value: string) {
  if (!value) return 'Δεν έχει καταχωριστεί'
  return new Intl.DateTimeFormat('el-GR').format(new Date(`${value}T12:00:00`))
}

async function resizePhoto(file: File) {
  const bitmap = await createImageBitmap(file)
  const maxSize = 360
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  const context = canvas.getContext('2d')
  if (!context) throw new Error('canvas-unavailable')
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  return canvas.toDataURL('image/jpeg', 0.82)
}

function StudentPortrait({ student, large = false }: { student: Student; large?: boolean }) {
  if (student.photoDataUrl) return <img className={`student-photo${large ? ' large' : ''}`} src={student.photoDataUrl} alt={student.fullName} />
  return <span className={`student-avatar ${student.color}${large ? ' large' : ''}`}>{initials(student.fullName)}</span>
}

function emptyStudent(className: string): StudentInput {
  return {
    fullName: '',
    photoDataUrl: '',
    birthDate: '',
    className,
    guardianName: '',
    guardianPhone: '',
    secondGuardianName: '',
    secondGuardianPhone: '',
    guardianEmail: '',
    profileNotes: '',
    sectionNotes: { academic: '', behavior: '', support: '', health: '' },
    supportNeeds: [],
    accommodations: '',
  }
}

function StudentEditor({ student, defaultClassName, onClose, onSave }: { student: Student | null; defaultClassName: string; onClose: () => void; onSave: (student: StudentInput) => void }) {
  const [draft, setDraft] = useState<StudentInput>(student ?? emptyStudent(defaultClassName))
  const [photoLoading, setPhotoLoading] = useState(false)

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSave({
      ...draft,
      fullName: draft.fullName.trim(),
      className: draft.className.trim(),
      guardianName: draft.guardianName.trim(),
      guardianPhone: draft.guardianPhone.trim(),
      secondGuardianName: draft.secondGuardianName.trim(),
      secondGuardianPhone: draft.secondGuardianPhone.trim(),
      guardianEmail: draft.guardianEmail.trim(),
      profileNotes: draft.profileNotes.trim(),
      accommodations: draft.accommodations.trim(),
    })
  }

  async function choosePhoto(file: File | undefined) {
    if (!file) return
    setPhotoLoading(true)
    try {
      const photoDataUrl = await resizePhoto(file)
      setDraft((current) => ({ ...current, photoDataUrl }))
    } finally {
      setPhotoLoading(false)
    }
  }

  function toggleSupport(option: string) {
    setDraft((current) => ({
      ...current,
      supportNeeds: current.supportNeeds.includes(option)
        ? current.supportNeeds.filter((item) => item !== option)
        : [...current.supportNeeds, option],
    }))
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="dialog student-editor" role="dialog" aria-modal="true" aria-labelledby="student-editor-title">
        <div className="dialog-heading"><div><span className="eyebrow">Καρτέλα μαθητή</span><h2 id="student-editor-title">{student ? 'Επεξεργασία στοιχείων' : 'Νέος μαθητής'}</h2></div><button type="button" className="icon-button" aria-label="Κλείσιμο" title="Κλείσιμο" onClick={onClose}><X size={20} /></button></div>
        <form onSubmit={submit} className="dialog-form">
          <div className="photo-editor">
            {draft.photoDataUrl ? <img className="student-photo large" src={draft.photoDataUrl} alt="Προεπισκόπηση μαθητή" /> : <span className="student-avatar teal large"><Camera size={25} /></span>}
            <label className="button secondary"><Camera size={17} /> {photoLoading ? 'Επεξεργασία…' : 'Επιλογή φωτογραφίας'}<input type="file" accept="image/*" disabled={photoLoading} onChange={(event) => void choosePhoto(event.target.files?.[0])} /></label>
            {draft.photoDataUrl && <button type="button" className="text-button" onClick={() => setDraft({ ...draft, photoDataUrl: '' })}>Αφαίρεση</button>}
          </div>
          <div className="form-row three-fields"><label>Ονοματεπώνυμο<input required autoFocus value={draft.fullName} onChange={(event) => setDraft({ ...draft, fullName: event.target.value })} /></label><label>Τμήμα<input value={draft.className} onChange={(event) => setDraft({ ...draft, className: event.target.value })} /></label><label>Ημερομηνία γέννησης<input type="date" value={draft.birthDate} onChange={(event) => setDraft({ ...draft, birthDate: event.target.value })} /></label></div>
          <div className="form-row"><label>Κηδεμόνας 1<input value={draft.guardianName} onChange={(event) => setDraft({ ...draft, guardianName: event.target.value })} /></label><label>Τηλέφωνο 1<input inputMode="tel" value={draft.guardianPhone} onChange={(event) => setDraft({ ...draft, guardianPhone: event.target.value })} /></label></div>
          <div className="form-row"><label>Κηδεμόνας 2<input value={draft.secondGuardianName} onChange={(event) => setDraft({ ...draft, secondGuardianName: event.target.value })} /></label><label>Τηλέφωνο 2<input inputMode="tel" value={draft.secondGuardianPhone} onChange={(event) => setDraft({ ...draft, secondGuardianPhone: event.target.value })} /></label></div>
          <label>Email οικογένειας<input type="email" value={draft.guardianEmail} onChange={(event) => setDraft({ ...draft, guardianEmail: event.target.value })} /></label>
          <fieldset className="support-checks"><legend>ΕΕΑ / υποστήριξη</legend>{supportOptions.map((option) => <label key={option}><input type="checkbox" checked={draft.supportNeeds.includes(option)} onChange={() => toggleSupport(option)} /> {option}</label>)}</fieldset>
          <label>Προσαρμογές<textarea rows={2} placeholder="π.χ. σύντομες οδηγίες, οπτικά βοηθήματα" value={draft.accommodations} onChange={(event) => setDraft({ ...draft, accommodations: event.target.value })} /></label>
          <label>Γενικές παρατηρήσεις<textarea rows={3} value={draft.profileNotes} onChange={(event) => setDraft({ ...draft, profileNotes: event.target.value })} /></label>
          <div className="dialog-actions"><button type="button" className="button secondary" onClick={onClose}>Ακύρωση</button><button type="submit" className="button primary">{student ? 'Αποθήκευση' : 'Προσθήκη μαθητή'}</button></div>
        </form>
      </section>
    </div>
  )
}

function StudentDossier({ student, books, entries, onClose, onEdit, onUpdate, onAddEntry }: { student: Student; books: Book[]; entries: StudentEntry[]; onClose: () => void; onEdit: () => void; onUpdate: (patch: Partial<Student>) => void; onAddEntry: (entry: Omit<StudentEntry, 'id'>) => void }) {
  const [section, setSection] = useState<StudentSection>('academic')
  const [entryDate, setEntryDate] = useState(getDateKey())
  const [entryText, setEntryText] = useState('')
  const Icon = sectionIcons[section]
  const activeLoans = books.filter((book) => book.borrowerId === student.id)
  const sectionEntries = entries.filter((entry) => entry.studentId === student.id && entry.category === section).sort((first, second) => second.date.localeCompare(first.date))

  function addEntry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onAddEntry({ studentId: student.id, date: entryDate, category: section, text: entryText.trim() })
    setEntryText('')
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="dialog dossier-dialog" role="dialog" aria-modal="true" aria-labelledby="dossier-title">
        <div className="dossier-header">
          <StudentPortrait student={student} large />
          <div><span className="eyebrow">Καρτέλα μαθητή</span><h2 id="dossier-title">{student.fullName}</h2><p>{student.className || 'Χωρίς τμήμα'} · {student.active ? 'Ενεργός μαθητής' : 'Στο αρχείο'}</p></div>
          <button type="button" className="button secondary" onClick={onEdit}><Pencil size={17} /> Επεξεργασία</button>
          <button type="button" className="icon-button" aria-label="Κλείσιμο" title="Κλείσιμο" onClick={onClose}><X size={20} /></button>
        </div>

        <dl className="dossier-facts">
          <div><dt><CalendarDays size={15} /> Ημ/νία γέννησης</dt><dd>{formatDate(student.birthDate)}</dd></div>
          <div><dt><Users size={15} /> Κηδεμόνας 1</dt><dd>{student.guardianName || '—'}{student.guardianPhone && <small>{student.guardianPhone}</small>}</dd></div>
          <div><dt><Users size={15} /> Κηδεμόνας 2</dt><dd>{student.secondGuardianName || '—'}{student.secondGuardianPhone && <small>{student.secondGuardianPhone}</small>}</dd></div>
          <div><dt><Mail size={15} /> Email</dt><dd>{student.guardianEmail || '—'}</dd></div>
          <div><dt><BookOpen size={15} /> Βιβλία</dt><dd>{activeLoans.length ? activeLoans.map((book) => book.title).join(', ') : 'Κανένας δανεισμός'}</dd></div>
        </dl>

        <div className="dossier-tabs" role="tablist" aria-label="Ενότητες καρτέλας">
          {(Object.keys(sectionLabels) as StudentSection[]).map((item) => {
            const TabIcon = sectionIcons[item]
            return <button key={item} type="button" role="tab" aria-selected={section === item} className={section === item ? 'active' : ''} onClick={() => setSection(item)}><TabIcon size={17} /> {sectionLabels[item]}</button>
          })}
        </div>

        <div className="dossier-content">
          <section className="dossier-overview">
            <div className="section-title"><div><h3><Icon size={18} /> {sectionLabels[section]}</h3><p>Σταθερές πληροφορίες και προσαρμογές.</p></div></div>
            {section === 'support' && <div className="support-summary"><strong>ΕΕΑ / υποστήριξη</strong><div>{student.supportNeeds.length ? student.supportNeeds.map((need) => <span key={need}>{need}</span>) : <small>Δεν έχει επιλεγεί ανάγκη υποστήριξης.</small>}</div>{student.accommodations && <p>{student.accommodations}</p>}</div>}
            {section === 'health' && student.profileNotes && <div className="health-alert"><HeartPulse size={17} /><p>{student.profileNotes}</p></div>}
            <label className="note-field"><span>Σημειώσεις ενότητας</span><textarea rows={5} value={student.sectionNotes[section]} placeholder={`Σημειώσεις για ${sectionLabels[section].toLocaleLowerCase('el')}…`} onChange={(event) => onUpdate({ sectionNotes: { ...student.sectionNotes, [section]: event.target.value } })} /></label>
          </section>

          <section className="entry-panel">
            <div className="section-title"><div><h3><NotebookPen size={18} /> Χρονολόγιο</h3><p>{sectionEntries.length} καταγραφές</p></div></div>
            <form className="entry-form" onSubmit={addEntry}><input type="date" value={entryDate} onChange={(event) => setEntryDate(event.target.value)} /><textarea required rows={2} placeholder="Νέα σύντομη καταγραφή…" value={entryText} onChange={(event) => setEntryText(event.target.value)} /><button type="submit" className="button primary"><Plus size={17} /> Προσθήκη</button></form>
            <div className="entry-list">{sectionEntries.map((entry) => <article key={entry.id}><time>{formatDate(entry.date)}</time><p>{entry.text}</p></article>)}{sectionEntries.length === 0 && <p className="empty-copy">Δεν υπάρχουν ακόμη καταγραφές σε αυτή την ενότητα.</p>}</div>
          </section>
        </div>
      </section>
    </div>
  )
}

export default function StudentDossiersView({ students, books, entries, onAddStudent, onUpdateStudent, onAddEntry }: StudentDossiersViewProps) {
  const [query, setQuery] = useState('')
  const [showArchived, setShowArchived] = useState(false)
  const [editorStudent, setEditorStudent] = useState<Student | 'new' | null>(null)
  const [dossierStudentId, setDossierStudentId] = useState<string | null>(null)
  const dossierStudent = students.find((student) => student.id === dossierStudentId) ?? null
  const visibleStudents = students.filter((student) => (showArchived ? !student.active : student.active) && student.fullName.toLocaleLowerCase('el').includes(query.toLocaleLowerCase('el')))
  const defaultClassName = students.find((student) => student.className)?.className ?? ''

  return (
    <section className="agenda-view">
      <div className="view-heading"><div><span className="eyebrow">Μητρώο τάξης</span><h1>Μαθητές</h1><p>Πλήρεις καρτέλες, επικοινωνία, υποστήριξη και παρατηρήσεις.</p></div><button type="button" className="button primary" onClick={() => setEditorStudent('new')}><Plus size={18} /> Νέος μαθητής</button></div>
      <div className="list-toolbar wrap-mobile"><label className="search-field"><Search size={18} /><span className="sr-only">Αναζήτηση μαθητή</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Αναζήτηση μαθητή…" /></label><div className="segmented-control compact"><button type="button" className={!showArchived ? 'active' : ''} onClick={() => setShowArchived(false)}>Ενεργοί ({students.filter((student) => student.active).length})</button><button type="button" className={showArchived ? 'active' : ''} onClick={() => setShowArchived(true)}>Αρχείο ({students.filter((student) => !student.active).length})</button></div></div>
      <div className="profiles-grid">
        {visibleStudents.map((student) => {
          const loans = books.filter((book) => book.borrowerId === student.id)
          const latestEntry = entries.filter((entry) => entry.studentId === student.id).sort((first, second) => second.date.localeCompare(first.date))[0]
          return <article className="profile-card" key={student.id}>
            <div className="profile-heading"><StudentPortrait student={student} /><div><h2>{student.fullName}</h2><span>{student.className || 'Χωρίς τμήμα'} · {student.active ? 'Ενεργός' : 'Στο αρχείο'}</span></div><button type="button" className="icon-button" title="Επεξεργασία" aria-label={`Επεξεργασία ${student.fullName}`} onClick={() => setEditorStudent(student)}><Pencil size={17} /></button></div>
            <dl className="profile-details"><div><dt><UserRound size={16} /> Κηδεμόνας</dt><dd>{student.guardianName || 'Δεν έχει καταχωριστεί'}</dd></div><div><dt><Phone size={16} /> Τηλέφωνο</dt><dd>{student.guardianPhone || 'Δεν έχει καταχωριστεί'}</dd></div><div><dt><BookOpen size={16} /> Δανεισμοί</dt><dd>{loans.length ? loans.map((book) => book.title).join(', ') : 'Κανένας ενεργός'}</dd></div></dl>
            {student.supportNeeds.length > 0 && <div className="support-tags">{student.supportNeeds.map((need) => <span key={need}>{need}</span>)}</div>}
            {latestEntry && <p className="profile-latest"><time>{formatDate(latestEntry.date)}</time>{latestEntry.text}</p>}
            <div className="profile-actions"><button type="button" className="button secondary" onClick={() => setDossierStudentId(student.id)}><NotebookPen size={17} /> Άνοιγμα καρτέλας</button><button type="button" className="text-button" onClick={() => onUpdateStudent(student.id, { active: !student.active })}>{student.active ? <Archive size={16} /> : <RotateCcw size={16} />}{student.active ? 'Αρχείο' : 'Επαναφορά'}</button></div>
          </article>
        })}
      </div>
      {visibleStudents.length === 0 && <div className="empty-state"><UserRound /><h2>Δεν βρέθηκαν μαθητές</h2><p>Άλλαξε την αναζήτηση ή πρόσθεσε νέα καρτέλα.</p></div>}
      {editorStudent && <StudentEditor key={editorStudent === 'new' ? 'new' : editorStudent.id} student={editorStudent === 'new' ? null : editorStudent} defaultClassName={defaultClassName} onClose={() => setEditorStudent(null)} onSave={(student) => { if (editorStudent !== 'new') onUpdateStudent(editorStudent.id, student); else onAddStudent(student); setEditorStudent(null) }} />}
      {dossierStudent && <StudentDossier student={dossierStudent} books={books} entries={entries} onClose={() => setDossierStudentId(null)} onEdit={() => { setEditorStudent(dossierStudent); setDossierStudentId(null) }} onUpdate={(patch) => onUpdateStudent(dossierStudent.id, patch)} onAddEntry={onAddEntry} />}
    </section>
  )
}