import { CalendarDays, Check, Clock3, LogOut, Printer, Stethoscope, UserX } from 'lucide-react'
import type { AttendanceRecord, Student } from '../agenda'

type HistoryViewProps = {
  students: Student[]
  records: AttendanceRecord[]
  selectedDate: string
  onDateChange: (date: string) => void
}

const statusLabels = { present: 'Στην τάξη', departed: 'Αναχώρησε', absent: 'Απουσία', unmarked: 'Χωρίς σημείωση' }

export default function HistoryView({ students, records, selectedDate, onDateChange }: HistoryViewProps) {
  const dayRecords = records.filter((record) => record.date === selectedDate && record.status !== 'unmarked')
  const rows = dayRecords.map((record) => ({ record, student: students.find((student) => student.id === record.studentId) })).filter((row) => row.student)
  const presentCount = dayRecords.filter((record) => record.status === 'present' || record.status === 'departed').length
  const absentCount = dayRecords.filter((record) => record.status === 'absent').length
  const excusedCount = dayRecords.filter((record) => record.status === 'absent' && record.parentExcused).length

  return (
    <section className="agenda-view history-view">
      <div className="view-heading"><div><span className="eyebrow">Αρχείο παρουσιών</span><h1>Ιστορικό ημέρας</h1><p>Όλες οι καταχωρίσεις και οι σημειώσεις συγκεντρωμένες.</p></div><button type="button" className="button secondary print-button" onClick={() => window.print()}><Printer size={18} /> Εκτύπωση</button></div>
      <div className="history-date-band">
        <CalendarDays size={22} />
        <label><span>Επίλεξε ημερομηνία</span><input type="date" value={selectedDate} onChange={(event) => onDateChange(event.target.value)} /></label>
        <div><span><Check size={16} /> Παρόντες <strong>{presentCount}</strong></span><span><UserX size={16} /> Απόντες <strong>{absentCount}</strong></span><span>Δικαιολογημένες <strong>{excusedCount}</strong></span></div>
      </div>
      {rows.length > 0 ? (
        <div className="history-list">
          {rows.map(({ record, student }) => student && (
            <article className="history-row" key={student.id}>
              <div><strong>{student.fullName}</strong><span className={`status-pill ${record.status}`}>{statusLabels[record.status]}</span></div>
              <div className="history-times">{record.arrivedAt && <span><Clock3 size={15} /> {record.arrivedAt}</span>}{record.departedAt && <span><LogOut size={15} /> {record.departedAt}</span>}{record.absenceReason === 'illness' && <span><Stethoscope size={15} /> Ασθένεια</span>}{record.parentExcused && <span>Δικαιολογημένη από γονέα</span>}</div>
              <p>{record.note || 'Χωρίς σημείωση ημέρας.'}</p>
            </article>
          ))}
        </div>
      ) : <div className="empty-state"><CalendarDays /><h2>Καμία καταχώριση</h2><p>Δεν υπάρχουν παρουσίες ή απουσίες για αυτή την ημερομηνία.</p></div>}
    </section>
  )
}