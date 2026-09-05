export type AttendanceStatus = 'unmarked' | 'present' | 'departed' | 'absent'

export type AbsenceReason = 'illness' | 'other' | null

export type Student = {
  id: string
  fullName: string
  guardianName: string
  guardianPhone: string
  profileNotes: string
  color: string
  active: boolean
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
  version: 1
  classroom: {
    name: string
    schoolYear: string
    teacherName: string
  }
  students: Student[]
  attendance: AttendanceRecord[]
  books: Book[]
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

function createInitialData(): AgendaData {
  const today = getDateKey()
  const students: Student[] = [
    ['student-1', 'Άννα Δημητρίου', 'Μαρία Δημητρίου', '690 000 0001', ''],
    ['student-2', 'Γιώργος Νικολάου', 'Ελένη Νικολάου', '690 000 0002', 'Αλλεργία στα φιστίκια'],
    ['student-3', 'Ειρήνη Παππά', 'Κώστας Παππάς', '690 000 0003', ''],
    ['student-4', 'Μάριος Αντωνίου', 'Σοφία Αντωνίου', '690 000 0004', ''],
    ['student-5', 'Νεφέλη Ιωάννου', 'Πέτρος Ιωάννου', '690 000 0005', ''],
    ['student-6', 'Ορέστης Γεωργίου', 'Λίνα Γεωργίου', '690 000 0006', ''],
  ].map(([id, fullName, guardianName, guardianPhone, profileNotes], index) => ({
    id,
    fullName,
    guardianName,
    guardianPhone,
    profileNotes,
    color: getStudentColor(index),
    active: true,
  }))

  return {
    version: 1,
    classroom: {
      name: 'Τμήμα Α1',
      schoolYear: '2026–2027',
      teacherName: 'Εκπαιδευτικός',
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
  }
}

export function isAgendaData(value: unknown): value is AgendaData {
  if (!value || typeof value !== 'object') return false
  const data = value as Partial<AgendaData>
  return data.version === 1 && Array.isArray(data.students) && Array.isArray(data.attendance) && Array.isArray(data.books)
}

export function loadAgenda(): AgendaData {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed: unknown = JSON.parse(saved)
      if (isAgendaData(parsed)) return parsed
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
  if (!isAgendaData(parsed)) throw new Error('invalid-backup')
  return parsed
}