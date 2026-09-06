import { useState, type FormEvent } from 'react'
import { CalendarDays, Cake, Flag, GraduationCap, Palmtree, Plus, Star, Trash2, X } from 'lucide-react'
import type { AgendaData, SchoolEvent, SchoolEventKind, Student } from '../agenda'

export type SchoolEventInput = Omit<SchoolEvent, 'id'>

type YearViewProps = {
  classroom: AgendaData['classroom']
  students: Student[]
  events: SchoolEvent[]
  onAddEvent: (event: SchoolEventInput) => void
  onDeleteEvent: (eventId: string) => void
}

const weekdays = ['Δ', 'Τ', 'Τ', 'Π', 'Π', 'Σ', 'Κ']

const eventLabels: Record<SchoolEventKind, string> = {
  important: 'Σημαντική ημερομηνία',
  holiday: 'Αργία',
  break: 'Διακοπές',
  birthday: 'Γενέθλια',
  meeting: 'Συνάντηση',
  school: 'Σχολείο',
}

function parseDate(value: string) {
  return new Date(`${value}T12:00:00`)
}

function dateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('el-GR', { day: 'numeric', month: 'short', year: 'numeric' }).format(parseDate(value))
}

function getSchoolMonths(startDate: string, endDate: string) {
  const start = parseDate(startDate)
  const end = parseDate(endDate)
  const months: Date[] = []
  const cursor = new Date(start.getFullYear(), start.getMonth(), 1, 12)
  const finalMonth = new Date(end.getFullYear(), end.getMonth(), 1, 12)
  while (cursor <= finalMonth && months.length < 12) {
    months.push(new Date(cursor))
    cursor.setMonth(cursor.getMonth() + 1)
  }
  return months
}

function birthdayDates(students: Student[], startDate: string, endDate: string) {
  const start = parseDate(startDate)
  const end = parseDate(endDate)
  return students.flatMap((student) => {
    if (!student.active || !student.birthDate) return []
    const birthDate = parseDate(student.birthDate)
    const dates = [start.getFullYear(), end.getFullYear()]
      .filter((year, index, years) => years.indexOf(year) === index)
      .map((year) => new Date(year, birthDate.getMonth(), birthDate.getDate(), 12))
      .filter((date) => date >= start && date <= end)
    return dates.map((date) => ({ date: dateKey(date), student }))
  })
}

function MiniCalendar({ month, markedDates, minDate, maxDate, onSelectDate }: { month: Date; markedDates: Map<string, string>; minDate: string; maxDate: string; onSelectDate: (date: string) => void }) {
  const year = month.getFullYear()
  const monthIndex = month.getMonth()
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
  const leadingDays = (new Date(year, monthIndex, 1).getDay() + 6) % 7
  const days = Array.from({ length: leadingDays + daysInMonth }, (_, index) => index < leadingDays ? null : index - leadingDays + 1)
  const title = new Intl.DateTimeFormat('el-GR', { month: 'long' }).format(month)

  return (
    <article className="mini-calendar">
      <header><strong>{title}</strong><span>{year}</span></header>
      <div className="calendar-weekdays">{weekdays.map((weekday, index) => <span key={`${weekday}-${index}`}>{weekday}</span>)}</div>
      <div className="calendar-days">
        {days.map((day, index) => {
          if (!day) return <span key={`empty-${index}`} />
          const key = dateKey(new Date(year, monthIndex, day, 12))
          const marker = markedDates.get(key)
          const selectable = key >= minDate && key <= maxDate
          const label = new Intl.DateTimeFormat('el-GR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(year, monthIndex, day, 12))
          return <button type="button" key={key} className={marker ? `marked ${marker}` : ''} disabled={!selectable} title={selectable ? 'Προσθήκη σημαντικής ημερομηνίας' : undefined} aria-label={selectable ? `Προσθήκη σημαντικής ημερομηνίας στις ${label}` : label} onClick={() => onSelectDate(key)}>{day}</button>
        })}
      </div>
    </article>
  )
}

function EventDialog({ defaultDate, minDate, maxDate, onClose, onSave }: { defaultDate: string; minDate: string; maxDate: string; onClose: () => void; onSave: (event: SchoolEventInput) => void }) {
  const [title, setTitle] = useState('')
  const [startDate, setStartDate] = useState(defaultDate)
  const [endDate, setEndDate] = useState('')
  const [kind, setKind] = useState<SchoolEventKind>('important')
  const [notes, setNotes] = useState('')

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSave({ title: title.trim(), startDate, endDate: endDate || null, kind, notes: notes.trim() })
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="dialog small" role="dialog" aria-modal="true" aria-labelledby="event-dialog-title">
        <div className="dialog-heading">
          <div><span className="eyebrow">Ετήσιο ημερολόγιο</span><h2 id="event-dialog-title">Νέα σημαντική ημερομηνία</h2></div>
          <button type="button" className="icon-button" aria-label="Κλείσιμο" title="Κλείσιμο" onClick={onClose}><X size={20} /></button>
        </div>
        <form className="dialog-form" onSubmit={submit}>
          <label>Τίτλος<input required autoFocus value={title} onChange={(event) => setTitle(event.target.value)} /></label>
          <div className="form-row">
            <label>Ημερομηνία<input required type="date" min={minDate} max={maxDate} value={startDate} onChange={(event) => setStartDate(event.target.value)} /></label>
            <label>Έως (προαιρετικό)<input type="date" min={startDate} max={maxDate} value={endDate} onChange={(event) => setEndDate(event.target.value)} /></label>
          </div>
          <label>Τύπος<select value={kind} onChange={(event) => setKind(event.target.value as SchoolEventKind)}>{Object.entries(eventLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label>Σημειώσεις<textarea rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} /></label>
          <div className="dialog-actions"><button type="button" className="button secondary" onClick={onClose}>Ακύρωση</button><button type="submit" className="button primary">Αποθήκευση</button></div>
        </form>
      </section>
    </div>
  )
}

export default function YearView({ classroom, students, events, onAddEvent, onDeleteEvent }: YearViewProps) {
  const [eventDate, setEventDate] = useState<string | null>(null)
  const months = getSchoolMonths(classroom.startDate, classroom.endDate)
  const birthdays = birthdayDates(students, classroom.startDate, classroom.endDate)
  const markedDates = new Map<string, string>()
  events.forEach((event) => markedDates.set(event.startDate, event.kind))
  birthdays.forEach((birthday) => {
    if (!markedDates.has(birthday.date)) markedDates.set(birthday.date, 'birthday')
  })

  const today = dateKey(new Date())
  const defaultEventDate = today >= classroom.startDate && today <= classroom.endDate ? today : classroom.startDate

  const timeline = [
    ...events.map((event) => ({ id: event.id, date: event.startDate, title: event.title, kind: event.kind, detail: event.endDate ? `έως ${formatDate(event.endDate)}` : event.notes, removable: true })),
    ...birthdays.map(({ date, student }) => ({ id: `birthday-${student.id}-${date}`, date, title: student.fullName, kind: 'birthday' as const, detail: 'Γενέθλια μαθητή', removable: false })),
  ].sort((first, second) => first.date.localeCompare(second.date))

  return (
    <section className="agenda-view year-view">
      <div className="view-heading">
        <div><span className="eyebrow">Η χρονιά με μία ματιά</span><h1>Σχολικό έτος {classroom.schoolYear}</h1><p>{classroom.schoolName} · {classroom.name}</p></div>
        <button type="button" className="button primary" onClick={() => setEventDate(defaultEventDate)}><Plus size={18} /> Σημαντική ημερομηνία</button>
      </div>

      <div className="year-stat-grid">
        <article><span><Flag size={18} /> Έναρξη μαθημάτων</span><strong>{formatDate(classroom.startDate)}</strong></article>
        <article><span><GraduationCap size={18} /> Λήξη μαθημάτων</span><strong>{formatDate(classroom.endDate)}</strong></article>
        <article><span><CalendarDays size={18} /> Διδακτικές ημέρες</span><strong>{classroom.teachingDays}</strong></article>
        <article><span><Palmtree size={18} /> Αργίες & διακοπές</span><strong>{events.filter((event) => event.kind === 'holiday' || event.kind === 'break').length}</strong></article>
      </div>

      <div className="year-layout">
        <section className="year-calendar-panel">
          <div className="section-title"><div><h2>Ετήσιο ημερολόγιο</h2><p>Αργίες, σχολικά γεγονότα και γενέθλια.</p></div><div className="calendar-legend"><span className="important">Σημαντική</span><span className="holiday">Αργία</span><span className="school">Σχολείο</span><span className="birthday">Γενέθλια</span></div></div>
          <div className="year-calendar-grid">{months.map((month) => <MiniCalendar key={`${month.getFullYear()}-${month.getMonth()}`} month={month} markedDates={markedDates} minDate={classroom.startDate} maxDate={classroom.endDate} onSelectDate={setEventDate} />)}</div>
        </section>

        <aside className="year-timeline-panel">
          <div className="section-title"><div><h2>Σημαντικές ημερομηνίες</h2><p>{timeline.length} καταχωρίσεις</p></div></div>
          <div className="year-timeline">
            {timeline.map((item) => (
              <article key={item.id}>
                <span className={`timeline-icon ${item.kind}`}>{item.kind === 'birthday' ? <Cake size={17} /> : item.kind === 'important' ? <Star size={17} /> : <CalendarDays size={17} />}</span>
                <div><time>{formatDate(item.date)}</time><strong>{item.title}</strong>{item.detail && <small>{item.detail}</small>}</div>
                {item.removable && <button type="button" className="icon-button" title="Διαγραφή γεγονότος" aria-label={`Διαγραφή ${item.title}`} onClick={() => onDeleteEvent(item.id)}><Trash2 size={15} /></button>}
              </article>
            ))}
          </div>
        </aside>
      </div>

      {eventDate && <EventDialog defaultDate={eventDate} minDate={classroom.startDate} maxDate={classroom.endDate} onClose={() => setEventDate(null)} onSave={(event) => { onAddEvent(event); setEventDate(null) }} />}
    </section>
  )
}