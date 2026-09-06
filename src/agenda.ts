export type AttendanceStatus = 'unmarked' | 'present' | 'departed' | 'absent'

export type AbsenceReason = 'illness' | 'other' | null

export type StudentSection = 'academic' | 'behavior' | 'support' | 'health'

export type SchoolEventKind = 'holiday' | 'break' | 'birthday' | 'meeting' | 'school'

export type Student = {
  id: string
  fullName: string
  photoDataUrl: string
  birthDate: string
  className: string
  guardianName: string
  guardianPhone: string
  secondGuardianName: string
  secondGuardianPhone: string
  guardianEmail: string
  profileNotes: string
  sectionNotes: Record<StudentSection, string>
  supportNeeds: string[]
  accommodations: string
  color: string
  active: boolean
}

export type StudentEntry = {
  id: string
  studentId: string
  date: string
  category: StudentSection
  text: string
}

export type SchoolEvent = {
  id: string
  title: string
  startDate: string
  endDate: string | null
  kind: SchoolEventKind
  notes: string
}

export type FamilyMeeting = {
  id: string
  date: string
  time: string
  title: string
  type: 'group' | 'individual'
  studentId: string | null
  attended: number | null
  expected: number | null
  notes: string
}

export type AttendanceRecord = {
  studentId: string
  date: string
  status: AttendanceStatus
  arrivedAt: string | null
  departedAt: string | null
  absenceReason: AbsenceReason
  parentExcused: boolean
  note: string
}

export type Book = {
  id: string
  title: string
  author: string
  borrowerId: string | null
  borrowedAt: string | null
}

export type AgendaData = {
  version: 2
  classroom: {
    name: string
    schoolYear: string
    teacherName: string
    schoolName: string
    startDate: string
    endDate: string
    teachingDays: number
    schoolEmail: string
    schoolPhone: string
  }
  students: Student[]
  attendance: AttendanceRecord[]
  books: Book[]
  schoolEvents: SchoolEvent[]
  familyMeetings: FamilyMeeting[]
  studentEntries: StudentEntry[]
}

const STORAGE_KEY = 'imerologio-taxis:data:v1'

const studentColors = ['coral', 'teal', 'gold', 'blue', 'rose', 'green']

export function getDateKey(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function createId() {
  return crypto.randomUUID()
}

export function getStudentColor(index: number) {
  return studentColors[index % studentColors.length]
}

export function createEmptyRecord(studentId: string, date: string): AttendanceRecord {
  return {
    studentId,
    date,
    status: 'unmarked',
    arrivedAt: null,
    departedAt: null,
    absenceReason: null,
    parentExcused: false,
    note: '',
  }
}

export function createStudentDetails(className = ''): Pick<Student, 'photoDataUrl' | 'birthDate' | 'className' | 'secondGuardianName' | 'secondGuardianPhone' | 'guardianEmail' | 'sectionNotes' | 'supportNeeds' | 'accommodations'> {
  return {
    photoDataUrl: '',
    birthDate: '',
    className,
    secondGuardianName: '',
    secondGuardianPhone: '',
    guardianEmail: '',
    sectionNotes: { academic: '', behavior: '', support: '', health: '' },
    supportNeeds: [],
    accommodations: '',
  }
}

function createInitialData(): AgendaData {
  const today = getDateKey()
  const students: Student[] = [
    ['student-1', 'Άννα Δημητρίου', '2018-04-12', 'Μαρία Δημητρίου', '690 000 0001', ''],
    ['student-2', 'Γιώργος Νικολάου', '2018-07-03', 'Ελένη Νικολάου', '690 000 0002', 'Αλλεργία στα φιστίκια'],
    ['student-3', 'Ειρήνη Παππά', '2018-02-21', 'Κώστας Παππάς', '690 000 0003', ''],
    ['student-4', 'Μάριος Αντωνίου', '2018-09-15', 'Σοφία Αντωνίου', '690 000 0004', ''],
    ['student-5', 'Νεφέλη Ιωάννου', '2018-11-28', 'Πέτρος Ιωάννου', '690 000 0005', ''],
    ['student-6', 'Ορέστης Γεωργίου', '2018-06-09', 'Λίνα Γεωργίου', '690 000 0006', ''],
  ].map(([id, fullName, birthDate, guardianName, guardianPhone, profileNotes], index) => ({
    id,
    fullName,
    ...createStudentDetails('Α1'),
    birthDate,
    guardianName,
    guardianPhone,
    profileNotes,
    color: getStudentColor(index),
    active: true,
  }))

  return {
    version: 2,
    classroom: {
      name: 'Τμήμα Α1',
      schoolYear: '2026–2027',
      teacherName: 'Εκπαιδευτικός',
      schoolName: 'Το σχολείο μου',
      startDate: '2026-09-11',
      endDate: '2027-06-15',
      teachingDays: 175,
      schoolEmail: '',
      schoolPhone: '',
    },
    students,
    attendance: [
      { ...createEmptyRecord('student-1', today), status: 'present', arrivedAt: '08:03' },
      { ...createEmptyRecord('student-2', today), status: 'present', arrivedAt: '08:11', note: 'Να αποφύγει το κέρασμα.' },
      { ...createEmptyRecord('student-3', today), status: 'departed', arrivedAt: '08:07', departedAt: '13:04' },
      { ...createEmptyRecord('student-4', today), status: 'absent', absenceReason: 'illness', parentExcused: true, note: 'Ενημέρωση από τη μητέρα.' },
    ],
    books: [
      { id: 'book-1', title: 'Ο μικρός πρίγκιπας', author: 'Antoine de Saint-Exupéry', borrowerId: 'student-1', borrowedAt: today },
      { id: 'book-2', title: 'Παραμύθια από όλο τον κόσμο', author: 'Συλλογικό', borrowerId: null, borrowedAt: null },
      { id: 'book-3', title: 'Το δέντρο που έδινε', author: 'Shel Silverstein', borrowerId: 'student-5', borrowedAt: today },
      { id: 'book-4', title: 'Μικρές ιστορίες για μεγάλα όνειρα', author: 'Lucy Mangan', borrowerId: null, borrowedAt: null },
    ],
    schoolEvents: [
      { id: 'event-1', title: 'Έναρξη μαθημάτων', startDate: '2026-09-11', endDate: null, kind: 'school', notes: '' },
      { id: 'event-2', title: 'Εθνική Επέτειος 28ης Οκτωβρίου', startDate: '2026-10-28', endDate: null, kind: 'holiday', notes: '' },
      { id: 'event-3', title: 'Διακοπές Χριστουγέννων', startDate: '2026-12-24', endDate: '2027-01-07', kind: 'break', notes: '' },
      { id: 'event-4', title: 'Ευαγγελισμός της Θεοτόκου', startDate: '2027-03-25', endDate: null, kind: 'holiday', notes: '' },
      { id: 'event-5', title: 'Λήξη μαθημάτων', startDate: '2027-06-15', endDate: null, kind: 'school', notes: '' },
    ],
    familyMeetings: [
      { id: 'meeting-1', date: '2026-10-17', time: '18:00', title: 'Πρώτη ενημέρωση οικογενειών', type: 'group', studentId: null, attended: 18, expected: 24, notes: '' },
      { id: 'meeting-2', date: '2027-01-23', time: '13:30', title: 'Ατομική συνάντηση', type: 'individual', studentId: 'student-2', attended: null, expected: null, notes: 'Συζήτηση για την πρόοδο και τη συνεργασία.' },
      { id: 'meeting-3', date: '2027-05-08', time: '18:00', title: 'Απολογισμός σχολικής χρονιάς', type: 'group', studentId: null, attended: 20, expected: 24, notes: '' },
    ],
    studentEntries: [
      { id: 'entry-1', studentId: 'student-1', date: '2026-09-12', category: 'academic', text: 'Δείχνει ιδιαίτερο ενδιαφέρον για την ανάγνωση.' },
      { id: 'entry-2', studentId: 'student-2', date: '2026-09-13', category: 'health', text: 'Υπενθύμιση για την αλλεργία στα φιστίκια.' },
      { id: 'entry-3', studentId: 'student-4', date: '2026-09-15', category: 'behavior', text: 'Συνεργάστηκε πολύ καλά στην ομαδική δραστηριότητα.' },
    ],
  }
}

function normalizeAgenda(value: unknown): AgendaData | null {
  if (!value || typeof value !== 'object') return null
  const data = value as Partial<AgendaData> & { version?: number }
  if (!data.classroom || !Array.isArray(data.students) || !Array.isArray(data.attendance) || !Array.isArray(data.books)) return null
  const defaults = createInitialData()
  const className = data.classroom.name ?? defaults.classroom.name

  return {
    version: 2,
    classroom: { ...defaults.classroom, ...data.classroom },
    students: data.students.map((student, index) => {
      const details = createStudentDetails(className)
      return {
        ...details,
        ...student,
        id: student.id || `student-${index + 1}`,
        fullName: student.fullName || 'Χωρίς όνομα',
        guardianName: student.guardianName || '',
        guardianPhone: student.guardianPhone || '',
        profileNotes: student.profileNotes || '',
        color: student.color || getStudentColor(index),
        active: student.active ?? true,
        sectionNotes: { ...details.sectionNotes, ...student.sectionNotes },
        supportNeeds: Array.isArray(student.supportNeeds) ? student.supportNeeds : [],
      }
    }),
    attendance: data.attendance,
    books: data.books,
    schoolEvents: Array.isArray(data.schoolEvents) ? data.schoolEvents : defaults.schoolEvents,
    familyMeetings: Array.isArray(data.familyMeetings) ? data.familyMeetings : [],
    studentEntries: Array.isArray(data.studentEntries) ? data.studentEntries : [],
  }
}

export function isAgendaData(value: unknown): value is AgendaData {
  return normalizeAgenda(value) !== null
}

export function loadAgenda(): AgendaData {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed: unknown = JSON.parse(saved)
      const migrated = normalizeAgenda(parsed)
      if (migrated) return migrated
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY)
  }
  return createInitialData()
}

export function saveAgenda(data: AgendaData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function parseAgendaBackup(contents: string) {
  const parsed: unknown = JSON.parse(contents)
  const migrated = normalizeAgenda(parsed)
  if (!migrated) throw new Error('invalid-backup')
  return migrated
}