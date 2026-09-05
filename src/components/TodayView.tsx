import { useState } from 'react'
import {
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  LogOut,
  RotateCcw,
  Search,
  StickyNote,
  Stethoscope,
  UserX,
} from 'lucide-react'
import { createEmptyRecord, type AttendanceRecord, type Book, type Student } from '../agenda'

type TodayViewProps = {
  students: Student[]
  records: AttendanceRecord[]
  books: Book[]
  selectedDate: string
  onDateChange: (date: string) => void
  onUpdateAttendance: (studentId: string, date: string, patch: Partial<AttendanceRecord>) => void
}

const statusLabels = {
  unmarked: 'Δεν σημειώθηκε',
  present: 'Στην τάξη',
  departed: 'Αναχώρησε',
  absent: 'Απουσία',
}

function currentTime() {
  return new Intl.DateTimeFormat('el-GR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date())
}

function shiftDate(value: string, amount: number) {
  const date = new Date(`${value}T12:00:00`)
  date.setDate(date.getDate() + amount)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function initials(name: string) {
  return name.split(' ').slice(0, 2).map((part) => part[0]).join('')
}

export default function TodayView({
  students,
  records,
  books,
  selectedDate,
  onDateChange,
  onUpdateAttendance,
}: TodayViewProps) {
  const [query, setQuery] = useState('')
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null)
  const activeStudents = students.filter((student) => student.active)
  const dayRecords = records.filter((record) => record.date === selectedDate)
  const visibleStudents = activeStudents.filter((student) =>
    student.fullName.toLocaleLowerCase('el').includes(query.toLocaleLowerCase('el')),
  )
  const counts = {
    present: dayRecords.filter((record) => record.status === 'present').length,
    departed: dayRecords.filter((record) => record.status === 'departed').length,
    absent: dayRecords.filter((record) => record.status === 'absent').length,
  }
  const marked = counts.present + counts.departed + counts.absent

  return (
    <section className="agenda-view">
      <div className="view-heading">
        <div>
          <span className="eyebrow">Ημερήσια εικόνα</span>
          <h1>Παρουσίες</h1>
          <p>{marked} από {activeStudents.length} μαθητές έχουν σημειωθεί.</p>
        </div>
        <div className="date-control">
          <button type="button" title="Προηγούμενη ημέρα" aria-label="Προηγούμενη ημέρα" onClick={() => onDateChange(shiftDate(selectedDate, -1))}>
            <ChevronLeft size={20} />
          </button>
          <label>
            <span className="sr-only">Ημερομηνία</span>
            <input type="date" value={selectedDate} onChange={(event) => onDateChange(event.target.value)} />
          </label>
          <button type="button" title="Επόμενη ημέρα" aria-label="Επόμενη ημέρα" onClick={() => onDateChange(shiftDate(selectedDate, 1))}>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="summary-grid" aria-label="Σύνοψη παρουσιών">
        <div className="summary-item present"><span>Στην τάξη</span><strong>{counts.present}</strong><small>παρόντες τώρα</small></div>
        <div className="summary-item departed"><span>Αναχώρησαν</span><strong>{counts.departed}</strong><small>ολοκλήρωσαν</small></div>
        <div className="summary-item absent"><span>Απουσίες</span><strong>{counts.absent}</strong><small>για σήμερα</small></div>
        <div className="summary-item pending"><span>Εκκρεμούν</span><strong>{Math.max(0, activeStudents.length - marked)}</strong><small>χωρίς σημείωση</small></div>
      </div>

      <div className="list-toolbar">
        <label className="search-field">
          <Search size={18} />
          <span className="sr-only">Αναζήτηση μαθητή</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Αναζήτηση μαθητή…" />
        </label>
        <span>{visibleStudents.length} μαθητές</span>
      </div>

      <div className="student-grid">
        {visibleStudents.map((student) => {
          const record = dayRecords.find((item) => item.studentId === student.id) ?? createEmptyRecord(student.id, selectedDate)
          const activeLoans = books.filter((book) => book.borrowerId === student.id)
          const expanded = expandedStudent === student.id

          return (
            <article className={`student-card status-${record.status}`} key={student.id}>
              <div className="student-card-main">
                <span className={`student-avatar ${student.color}`}>{initials(student.fullName)}</span>
                <div className="student-identity">
                  <div className="student-name-row">
                    <h2>{student.fullName}</h2>
                    <span className={`status-pill ${record.status}`}>{statusLabels[record.status]}</span>
                  </div>
                  <div className="student-meta">
                    {record.arrivedAt && <span><Clock3 size={14} /> Άφιξη {record.arrivedAt}</span>}
                    {record.departedAt && <span><LogOut size={14} /> Αναχώρηση {record.departedAt}</span>}
                    {activeLoans.length > 0 && <span><BookOpen size={14} /> {activeLoans.length} {activeLoans.length === 1 ? 'βιβλίο' : 'βιβλία'}</span>}
                    {record.note && <span><StickyNote size={14} /> Σημείωση</span>}
                  </div>
                </div>
              </div>

              <div className="attendance-actions" aria-label={`Ενέργειες για ${student.fullName}`}>
                <button
                  type="button"
                  className={record.status === 'present' ? 'selected arrive' : ''}
                  title="Σημείωση άφιξης"
                  onClick={() => onUpdateAttendance(student.id, selectedDate, {
                    status: 'present',
                    arrivedAt: record.arrivedAt ?? currentTime(),
                    departedAt: null,
                    absenceReason: null,
                    parentExcused: false,
                  })}
                >
                  <Check size={18} /><span>Ήρθε</span>
                </button>
                <button
                  type="button"
                  className={record.status === 'departed' ? 'selected leave' : ''}
                  title="Σημείωση αναχώρησης"
                  disabled={!record.arrivedAt}
                  onClick={() => onUpdateAttendance(student.id, selectedDate, {
                    status: 'departed',
                    departedAt: currentTime(),
                  })}
                >
                  <LogOut size={18} /><span>Έφυγε</span>
                </button>
                <button
                  type="button"
                  className={record.status === 'absent' ? 'selected absent' : ''}
                  title="Σημείωση απουσίας"
                  onClick={() => {
                    onUpdateAttendance(student.id, selectedDate, {
                      status: 'absent',
                      arrivedAt: null,
                      departedAt: null,
                    })
                    setExpandedStudent(student.id)
                  }}
                >
                  <UserX size={18} /><span>Απουσία</span>
                </button>
                <button
                  type="button"
                  className="details-toggle"
                  title="Σημειώσεις και λεπτομέρειες"
                  aria-expanded={expanded}
                  onClick={() => setExpandedStudent(expanded ? null : student.id)}
                >
                  <StickyNote size={18} /><span>Σημείωση</span>
                </button>
                {record.status !== 'unmarked' && (
                  <button
                    type="button"
                    className="icon-button reset-attendance"
                    title="Καθαρισμός σημερινής εγγραφής"
                    aria-label="Καθαρισμός σημερινής εγγραφής"
                    onClick={() => onUpdateAttendance(student.id, selectedDate, createEmptyRecord(student.id, selectedDate))}
                  >
                    <RotateCcw size={17} />
                  </button>
                )}
              </div>

              {expanded && (
                <div className="student-details">
                  {record.status === 'absent' && (
                    <div className="absence-options">
                      <span>Αιτία απουσίας</span>
                      <div className="segmented-control">
                        <button
                          type="button"
                          className={record.absenceReason === 'illness' ? 'active' : ''}
                          onClick={() => onUpdateAttendance(student.id, selectedDate, { absenceReason: 'illness' })}
                        >
                          <Stethoscope size={16} /> Ασθένεια
                        </button>
                        <button
                          type="button"
                          className={record.absenceReason === 'other' ? 'active' : ''}
                          onClick={() => onUpdateAttendance(student.id, selectedDate, { absenceReason: 'other' })}
                        >
                          Άλλο
                        </button>
                      </div>
                      <label className="check-control">
                        <input
                          type="checkbox"
                          checked={record.parentExcused}
                          onChange={(event) => onUpdateAttendance(student.id, selectedDate, { parentExcused: event.target.checked })}
                        />
                        <span>Δικαιολογήθηκε από γονέα</span>
                      </label>
                    </div>
                  )}
                  <label className="note-field">
                    <span>Σημείωση ημέρας</span>
                    <textarea
                      value={record.note}
                      rows={2}
                      placeholder="Πρόσθεσε μια σύντομη σημείωση…"
                      onChange={(event) => onUpdateAttendance(student.id, selectedDate, { note: event.target.value })}
                    />
                  </label>
                </div>
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}