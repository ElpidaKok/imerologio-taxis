import { useEffect, useState } from 'react'
import { BookOpen, CalendarCheck, History, NotebookTabs, Settings, ShieldCheck, Users } from 'lucide-react'
import './App.css'
import { createEmptyRecord, createId, getDateKey, getStudentColor, loadAgenda, saveAgenda, type AttendanceRecord, type Student } from './agenda'
import HistoryView from './components/HistoryView'
import LibraryView, { type BookInput } from './components/LibraryView'
import SettingsView from './components/SettingsView'
import StudentsView, { type StudentInput } from './components/StudentsView'
import TodayView from './components/TodayView'

type View = 'today' | 'students' | 'library' | 'history' | 'settings'

const navigation: Array<{ id: View; label: string; icon: typeof CalendarCheck }> = [
  { id: 'today', label: 'Σήμερα', icon: CalendarCheck },
  { id: 'students', label: 'Μαθητές', icon: Users },
  { id: 'library', label: 'Βιβλιοθήκη', icon: BookOpen },
  { id: 'history', label: 'Ιστορικό', icon: History },
  { id: 'settings', label: 'Ρυθμίσεις', icon: Settings },
]

function App() {
  const [data, setData] = useState(loadAgenda)
  const [activeView, setActiveView] = useState<View>('today')
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

  function clearClassroom() {
    setData((current) => ({ ...current, students: [], attendance: [], books: [] }))
  }

  const selectedLabel = new Intl.DateTimeFormat('el-GR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(`${selectedDate}T12:00:00`))

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true"><NotebookTabs size={23} /></span>
          <span><strong>Ημερολόγιο</strong><small>τάξης</small></span>
        </div>

        <nav className="side-navigation" aria-label="Κύρια πλοήγηση">
          {navigation.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className={activeView === id ? 'active' : ''}
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
        <header className="topbar">
          <div>
            <span className="eyebrow">{data.classroom.schoolYear}</span>
            <strong>{data.classroom.name}</strong>
          </div>
          <div className="topbar-date">
            <span>{selectedLabel}</span>
            <small>{data.classroom.teacherName}</small>
          </div>
        </header>

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
        {activeView === 'students' && <StudentsView students={data.students} books={data.books} onAddStudent={addStudent} onUpdateStudent={updateStudent} />}
        {activeView === 'library' && <LibraryView books={data.books} students={data.students} onAddBook={addBook} onLoanBook={loanBook} onReturnBook={returnBook} />}
        {activeView === 'history' && <HistoryView students={data.students} records={data.attendance} selectedDate={selectedDate} onDateChange={setSelectedDate} />}
        {activeView === 'settings' && <SettingsView data={data} onUpdateClassroom={(classroom) => setData((current) => ({ ...current, classroom }))} onImport={setData} onClear={clearClassroom} />}
      </main>

      <nav className="mobile-navigation" aria-label="Κύρια πλοήγηση κινητού">
        {navigation.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            className={activeView === id ? 'active' : ''}
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
