import { useEffect, useState } from 'react'
import { BookMarked, BookOpen, CalendarCheck, CalendarRange, FolderKanban, History, MoreHorizontal, NotebookTabs, Settings, ShieldCheck, Users } from 'lucide-react'
import './App.css'
import { createEmptyRecord, createId, createStudentDetails, getDateKey, getStudentColor, loadAgenda, saveAgenda, type AttendanceRecord, type Student, type StudentEntry } from './agenda'
import CoverView from './components/CoverView'
import HistoryView from './components/HistoryView'
import LibraryView, { type BookInput } from './components/LibraryView'
import OrganizationView, { type FamilyMeetingInput } from './components/OrganizationView'
import SettingsView from './components/SettingsView'
import StudentDossiersView, { type StudentInput } from './components/StudentDossiersView'
import TodayView from './components/TodayView'
import YearView, { type SchoolEventInput } from './components/YearView'

type View = 'cover' | 'today' | 'year' | 'students' | 'organization' | 'library' | 'history' | 'settings' | 'more'

const navigation: Array<{ id: View; label: string; icon: typeof CalendarCheck }> = [
  { id: 'cover', label: 'Εξώφυλλο', icon: BookMarked },
  { id: 'today', label: 'Σήμερα', icon: CalendarCheck },
  { id: 'year', label: 'Σχολικό έτος', icon: CalendarRange },
  { id: 'students', label: 'Μαθητές', icon: Users },
  { id: 'organization', label: 'Οργάνωση', icon: FolderKanban },
  { id: 'library', label: 'Βιβλιοθήκη', icon: BookOpen },
  { id: 'history', label: 'Ιστορικό', icon: History },
  { id: 'settings', label: 'Ρυθμίσεις', icon: Settings },
]

const mobileNavigation: Array<{ id: View; label: string; icon: typeof CalendarCheck }> = [
  { id: 'cover', label: 'Αρχική', icon: BookMarked },
  { id: 'today', label: 'Σήμερα', icon: CalendarCheck },
  { id: 'students', label: 'Μαθητές', icon: Users },
  { id: 'library', label: 'Βιβλία', icon: BookOpen },
  { id: 'more', label: 'Περισσότερα', icon: MoreHorizontal },
]

function App() {
  const [data, setData] = useState(loadAgenda)
  const [activeView, setActiveView] = useState<View>('cover')
  const [selectedDate, setSelectedDate] = useState(getDateKey)

  useEffect(() => {
    saveAgenda(data)
  }, [data])

  function updateAttendance(studentId: string, date: string, patch: Partial<AttendanceRecord>) {
    setData((current) => {
      const existing = current.attendance.find(
        (record) => record.studentId === studentId && record.date === date,
      )
      const updated = { ...(existing ?? createEmptyRecord(studentId, date)), ...patch }
      const attendance = existing
        ? current.attendance.map((record) =>
            record.studentId === studentId && record.date === date ? updated : record,
          )
        : [...current.attendance, updated]
      return { ...current, attendance }
    })
  }

  function addStudent(student: StudentInput) {
    setData((current) => ({
      ...current,
      students: [...current.students, {
        ...createStudentDetails(current.classroom.name),
        ...student,
        id: createId(),
        color: getStudentColor(current.students.length),
        active: true,
      }],
    }))
  }

  function updateStudent(studentId: string, patch: Partial<Student>) {
    setData((current) => ({
      ...current,
      students: current.students.map((student) => student.id === studentId ? { ...student, ...patch } : student),
    }))
  }

  function addStudentEntry(entry: Omit<StudentEntry, 'id'>) {
    setData((current) => ({ ...current, studentEntries: [...current.studentEntries, { ...entry, id: createId() }] }))
  }

  function addBook(book: BookInput) {
    setData((current) => ({
      ...current,
      books: [...current.books, { ...book, id: createId(), borrowerId: null, borrowedAt: null }],
    }))
  }

  function loanBook(bookId: string, studentId: string) {
    setData((current) => ({
      ...current,
      books: current.books.map((book) => book.id === bookId ? { ...book, borrowerId: studentId, borrowedAt: getDateKey() } : book),
    }))
  }

  function returnBook(bookId: string) {
    setData((current) => ({
      ...current,
      books: current.books.map((book) => book.id === bookId ? { ...book, borrowerId: null, borrowedAt: null } : book),
    }))
  }

  function addSchoolEvent(event: SchoolEventInput) {
    setData((current) => ({ ...current, schoolEvents: [...current.schoolEvents, { ...event, id: createId() }] }))
  }

  function deleteSchoolEvent(eventId: string) {
    setData((current) => ({ ...current, schoolEvents: current.schoolEvents.filter((event) => event.id !== eventId) }))
  }

  function addFamilyMeeting(meeting: FamilyMeetingInput) {
    setData((current) => ({ ...current, familyMeetings: [...current.familyMeetings, { ...meeting, id: createId() }] }))
  }

  function deleteFamilyMeeting(meetingId: string) {
    setData((current) => ({ ...current, familyMeetings: current.familyMeetings.filter((meeting) => meeting.id !== meetingId) }))
  }

  function clearClassroom() {
    setData((current) => ({
      ...current,
      students: [],
      attendance: [],
      books: [],
      schoolEvents: [],
      familyMeetings: [],
      studentEntries: [],
    }))
  }

  const selectedLabel = new Intl.DateTimeFormat('el-GR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(`${selectedDate}T12:00:00`))

  return (
    <div className={`app-shell${activeView === 'cover' ? ' cover-active' : ''}`}>
      <div className="notebook-binding" aria-hidden="true">
        {Array.from({ length: 13 }, (_, index) => <span key={index} />)}
      </div>
      <aside className="sidebar">
        <button type="button" className="brand" aria-label="Μετάβαση στο εξώφυλλο" onClick={() => setActiveView('cover')}>
          <span className="brand-mark" aria-hidden="true"><NotebookTabs size={23} /></span>
          <span><strong>Ημερολόγιο</strong><small>τάξης</small></span>
        </button>

        <nav className="side-navigation" aria-label="Κύρια πλοήγηση">
          {navigation.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className={`nav-item nav-${id}${activeView === id ? ' active' : ''}`}
              aria-label={label}
              title={label}
              onClick={() => setActiveView(id)}
            >
              <Icon size={20} strokeWidth={1.8} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="privacy-note">
          <ShieldCheck size={18} />
          <span><strong>Τοπική αποθήκευση</strong><small>Τα δεδομένα μένουν στη συσκευή.</small></span>
        </div>
      </aside>

      <main className="workspace">
        {activeView !== 'cover' && <header className="topbar">
          <div>
            <span className="eyebrow">{data.classroom.schoolYear}</span>
            <strong>{data.classroom.name}</strong>
          </div>
          <div className="topbar-date">
            <span>{selectedLabel}</span>
            <small>{data.classroom.teacherName}</small>
          </div>
        </header>}

        {activeView === 'cover' && <CoverView classroom={data.classroom} studentCount={data.students.filter((student) => student.active).length} eventCount={data.schoolEvents.length} onOpenAgenda={() => setActiveView('today')} onOpenYear={() => setActiveView('year')} />}
        {activeView === 'today' && (
          <TodayView
            students={data.students}
            records={data.attendance}
            books={data.books}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            onUpdateAttendance={updateAttendance}
          />
        )}
        {activeView === 'year' && <YearView classroom={data.classroom} students={data.students} events={data.schoolEvents} onAddEvent={addSchoolEvent} onDeleteEvent={deleteSchoolEvent} />}
        {activeView === 'students' && <StudentDossiersView students={data.students} books={data.books} entries={data.studentEntries} onAddStudent={addStudent} onUpdateStudent={updateStudent} onAddEntry={addStudentEntry} />}
        {activeView === 'organization' && <OrganizationView classroom={data.classroom} students={data.students} attendance={data.attendance} meetings={data.familyMeetings} selectedDate={selectedDate} onAddMeeting={addFamilyMeeting} onDeleteMeeting={deleteFamilyMeeting} />}
        {activeView === 'library' && <LibraryView books={data.books} students={data.students} onAddBook={addBook} onLoanBook={loanBook} onReturnBook={returnBook} />}
        {activeView === 'history' && <HistoryView students={data.students} records={data.attendance} selectedDate={selectedDate} onDateChange={setSelectedDate} />}
        {activeView === 'settings' && <SettingsView data={data} onUpdateClassroom={(classroom) => setData((current) => ({ ...current, classroom }))} onImport={setData} onClear={clearClassroom} />}
        {activeView === 'more' && (
          <section className="agenda-view more-view">
            <div className="view-heading"><div><span className="eyebrow">Εργαλεία τάξης</span><h1>Περισσότερα</h1><p>Αρχείο, οικογένειες, εκτυπώσεις και ρυθμίσεις.</p></div></div>
            <div className="more-grid">
              <button type="button" onClick={() => setActiveView('year')}><span><CalendarRange size={23} /></span><strong>Σχολικό έτος</strong><small>Ημερολόγιο, αργίες και σημαντικές ημερομηνίες</small></button>
              <button type="button" onClick={() => setActiveView('organization')}><span><FolderKanban size={23} /></span><strong>Οργάνωση</strong><small>Συναντήσεις οικογενειών και εκτυπώσεις</small></button>
              <button type="button" onClick={() => setActiveView('history')}><span><History size={23} /></span><strong>Ιστορικό</strong><small>Παρουσίες και σημειώσεις ανά ημέρα</small></button>
              <button type="button" onClick={() => setActiveView('settings')}><span><Settings size={23} /></span><strong>Ρυθμίσεις</strong><small>Στοιχεία τάξης και αντίγραφα δεδομένων</small></button>
            </div>
          </section>
        )}
      </main>

      <nav className="mobile-navigation" aria-label="Κύρια πλοήγηση κινητού">
        {mobileNavigation.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            className={`nav-item nav-${id}${activeView === id || (id === 'more' && ['year', 'organization', 'history', 'settings'].includes(activeView)) ? ' active' : ''}`}
            aria-label={label}
            onClick={() => setActiveView(id)}
          >
            <Icon size={21} strokeWidth={1.8} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

export default App
