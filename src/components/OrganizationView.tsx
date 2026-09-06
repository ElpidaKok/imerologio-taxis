import { useState, type FormEvent } from 'react'
import {
  CalendarCheck,
  ClipboardList,
  FileCheck2,
  FileHeart,
  FileText,
  Mail,
  MessageSquareText,
  Plus,
  Printer,
  School,
  Trash2,
  Users,
  X,
} from 'lucide-react'
import type { AgendaData, AttendanceRecord, FamilyMeeting, Student } from '../agenda'

export type FamilyMeetingInput = Omit<FamilyMeeting, 'id'>

type OrganizationViewProps = {
  classroom: AgendaData['classroom']
  students: Student[]
  attendance: AttendanceRecord[]
  meetings: FamilyMeeting[]
  selectedDate: string
  onAddMeeting: (meeting: FamilyMeetingInput) => void
  onDeleteMeeting: (meetingId: string) => void
}

type TemplateId = 'absences' | 'communication' | 'substitute' | 'minutes' | 'welcome' | 'newsletter' | 'praise' | 'consent'

const templates: Array<{ id: TemplateId; title: string; description: string; icon: typeof FileText; tone: string }> = [
  { id: 'absences', title: 'Δελτίο απουσιών', description: 'Ημερήσια κατάσταση απουσιών και δικαιολογήσεων', icon: CalendarCheck, tone: 'coral' },
  { id: 'communication', title: 'Επικοινωνία οικογενειών', description: 'Αρχείο συναντήσεων, συμμετοχής και θεμάτων', icon: Users, tone: 'teal' },
  { id: 'substitute', title: 'Πλάνο αναπλήρωσης', description: 'Βασικές πληροφορίες τάξης για αναπληρωτή', icon: School, tone: 'blue' },
  { id: 'minutes', title: 'Πρακτικό συνάντησης', description: 'Θέματα, αποφάσεις και επόμενα βήματα', icon: ClipboardList, tone: 'gold' },
  { id: 'welcome', title: 'Επιστολή καλωσορίσματος', description: 'Έτοιμη βάση επιστολής προς τις οικογένειες', icon: Mail, tone: 'teal' },
  { id: 'newsletter', title: 'Ενημερωτικό δελτίο', description: 'Νέα τάξης, υπενθυμίσεις και προσεχείς δράσεις', icon: FileText, tone: 'blue' },
  { id: 'praise', title: 'Έπαινος μαθητή', description: 'Σύντομη θετική ενημέρωση προς την οικογένεια', icon: FileHeart, tone: 'gold' },
  { id: 'consent', title: 'Έντυπο συγκατάθεσης', description: 'Πρότυπο άδειας συμμετοχής ή χρήσης υλικού', icon: FileCheck2, tone: 'coral' },
]

function parseDate(value: string) {
  return new Date(`${value}T12:00:00`)
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('el-GR').format(parseDate(value))
}

function MeetingDialog({ students, onClose, onSave }: { students: Student[]; onClose: () => void; onSave: (meeting: FamilyMeetingInput) => void }) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [type, setType] = useState<FamilyMeeting['type']>('group')
  const [studentId, setStudentId] = useState('')
  const [attended, setAttended] = useState('')
  const [expected, setExpected] = useState('')
  const [notes, setNotes] = useState('')

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSave({
      title: title.trim(),
      date,
      time,
      type,
      studentId: type === 'individual' ? studentId || null : null,
      attended: type === 'group' && attended ? Number(attended) : null,
      expected: type === 'group' && expected ? Number(expected) : null,
      notes: notes.trim(),
    })
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="dialog" role="dialog" aria-modal="true" aria-labelledby="meeting-dialog-title">
        <div className="dialog-heading"><div><span className="eyebrow">Οικογένειες</span><h2 id="meeting-dialog-title">Νέα συνάντηση</h2></div><button type="button" className="icon-button" aria-label="Κλείσιμο" title="Κλείσιμο" onClick={onClose}><X size={20} /></button></div>
        <form className="dialog-form" onSubmit={submit}>
          <label>Θέμα συνάντησης<input required autoFocus value={title} onChange={(event) => setTitle(event.target.value)} /></label>
          <div className="form-row"><label>Ημερομηνία<input required type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label><label>Ώρα<input type="time" value={time} onChange={(event) => setTime(event.target.value)} /></label></div>
          <label>Τύπος<select value={type} onChange={(event) => setType(event.target.value as FamilyMeeting['type'])}><option value="group">Γενική</option><option value="individual">Ατομική</option></select></label>
          {type === 'individual' ? <label>Μαθητής<select required value={studentId} onChange={(event) => setStudentId(event.target.value)}><option value="">Επίλεξε μαθητή</option>{students.filter((student) => student.active).map((student) => <option key={student.id} value={student.id}>{student.fullName}</option>)}</select></label> : <div className="form-row"><label>Συμμετείχαν<input type="number" min="0" value={attended} onChange={(event) => setAttended(event.target.value)} /></label><label>Σύνολο προσκεκλημένων<input type="number" min="0" value={expected} onChange={(event) => setExpected(event.target.value)} /></label></div>}
          <label>Σημειώσεις<textarea rows={4} value={notes} onChange={(event) => setNotes(event.target.value)} /></label>
          <div className="dialog-actions"><button type="button" className="button secondary" onClick={onClose}>Ακύρωση</button><button type="submit" className="button primary">Αποθήκευση</button></div>
        </form>
      </section>
    </div>
  )
}

function PrintableDocument({ templateId, classroom, students, attendance, meetings, selectedDate }: { templateId: TemplateId; classroom: AgendaData['classroom']; students: Student[]; attendance: AttendanceRecord[]; meetings: FamilyMeeting[]; selectedDate: string }) {
  const activeStudents = students.filter((student) => student.active)
  const absentRows = attendance.filter((record) => record.date === selectedDate && record.status === 'absent').map((record) => ({ record, student: students.find((student) => student.id === record.studentId) })).filter((row) => row.student)

  return (
    <article className="print-document">
      <header><div><span>agenda</span><strong>{classroom.schoolName}</strong></div><div>{classroom.name}<small>{classroom.schoolYear}</small></div></header>
      {templateId === 'absences' && <><h1>Δελτίο απουσιών</h1><p className="document-subtitle">Ημερομηνία: {formatDate(selectedDate)}</p><table><thead><tr><th>Μαθητής</th><th>Αιτία</th><th>Δικαιολόγηση</th><th>Σημείωση</th></tr></thead><tbody>{absentRows.map(({ record, student }) => <tr key={record.studentId}><td>{student?.fullName}</td><td>{record.absenceReason === 'illness' ? 'Ασθένεια' : 'Άλλο / δεν δηλώθηκε'}</td><td>{record.parentExcused ? 'Ναι' : 'Όχι'}</td><td>{record.note || '—'}</td></tr>)}</tbody></table>{absentRows.length === 0 && <p className="blank-message">Δεν έχουν καταχωριστεί απουσίες για αυτή την ημέρα.</p>}</>}
      {templateId === 'communication' && <><h1>Αρχείο επικοινωνίας με οικογένειες</h1><table><thead><tr><th>Ημερομηνία</th><th>Θέμα</th><th>Τύπος / μαθητής</th><th>Συμμετοχή</th></tr></thead><tbody>{meetings.map((meeting) => <tr key={meeting.id}><td>{formatDate(meeting.date)}</td><td>{meeting.title}</td><td>{meeting.type === 'group' ? 'Γενική' : students.find((student) => student.id === meeting.studentId)?.fullName || 'Ατομική'}</td><td>{meeting.attended !== null && meeting.expected !== null ? `${meeting.attended}/${meeting.expected}` : '—'}</td></tr>)}</tbody></table></>}
      {templateId === 'substitute' && <><h1>Πλάνο αναπλήρωσης</h1><div className="document-fields"><p><strong>Τμήμα</strong>{classroom.name}</p><p><strong>Εκπαιδευτικός</strong>{classroom.teacherName}</p><p><strong>Μαθητές</strong>{activeStudents.length}</p><p><strong>Ημερομηνία</strong>____ / ____ / ______</p></div><DocumentLines title="Πρόγραμμα ημέρας" /><DocumentLines title="Χρήσιμες πληροφορίες και προσαρμογές" /></>}
      {templateId === 'minutes' && <><h1>Πρακτικό συνάντησης</h1><div className="document-fields"><p><strong>Ημερομηνία</strong>____ / ____ / ______</p><p><strong>Συμμετέχοντες</strong>________________________</p></div><DocumentLines title="Θέματα συζήτησης" /><DocumentLines title="Αποφάσεις" /><DocumentLines title="Επόμενα βήματα" /></>}
      {templateId === 'welcome' && <><h1>Καλωσόρισμα στη σχολική χρονιά</h1><p>Αγαπητές οικογένειες,</p><p>σας καλωσορίζω στο {classroom.name} για τη σχολική χρονιά {classroom.schoolYear}. Στόχος μας είναι μια δημιουργική χρονιά με σταθερή επικοινωνία, συνεργασία και φροντίδα για κάθε παιδί.</p><p>Με εκτίμηση,<br /><strong>{classroom.teacherName}</strong></p></>}
      {templateId === 'newsletter' && <><h1>Ενημερωτικό δελτίο τάξης</h1><DocumentLines title="Τι μάθαμε" /><DocumentLines title="Νέα και δράσεις" /><DocumentLines title="Υπενθυμίσεις για την επόμενη εβδομάδα" /></>}
      {templateId === 'praise' && <><h1>Έπαινος μαθητή</h1><p>Αγαπητή οικογένεια,</p><p>θα ήθελα να μοιραστώ μαζί σας ότι ο/η ______________________________ ξεχώρισε για:</p><div className="checklist"><span>□ προσπάθεια</span><span>□ συνεργασία</span><span>□ υπευθυνότητα</span><span>□ πρόοδο</span></div><DocumentLines title="Συγκεκριμένη θετική παρατήρηση" /></>}
      {templateId === 'consent' && <><h1>Έντυπο συγκατάθεσης</h1><p>Ο/Η υπογράφων/ουσα ______________________________, κηδεμόνας του/της ______________________________, δηλώνω ότι:</p><div className="checklist vertical"><span>□ συναινώ στη συμμετοχή στη δράση ______________________________</span><span>□ έχω ενημερωθεί για τον σκοπό και τον τρόπο υλοποίησης</span><span>□ δεν συναινώ στη συμμετοχή</span></div><div className="document-signatures"><span>Ημερομηνία</span><span>Υπογραφή κηδεμόνα</span></div></>}
      <footer><span>{classroom.schoolEmail || '____________________'}</span><span>{classroom.schoolPhone || '____________________'}</span></footer>
    </article>
  )
}

function DocumentLines({ title }: { title: string }) {
  return <section className="document-lines"><h2>{title}</h2><span /><span /><span /></section>
}

function PrintDialog({ templateId, classroom, students, attendance, meetings, selectedDate, onClose }: { templateId: TemplateId; classroom: AgendaData['classroom']; students: Student[]; attendance: AttendanceRecord[]; meetings: FamilyMeeting[]; selectedDate: string; onClose: () => void }) {
  function printDocument() {
    document.body.classList.add('print-template-active')
    window.print()
    window.setTimeout(() => document.body.classList.remove('print-template-active'), 300)
  }

  return <div className="modal-backdrop print-preview-overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="dialog print-dialog" role="dialog" aria-modal="true" aria-label="Προεπισκόπηση εκτύπωσης"><div className="print-dialog-toolbar"><button type="button" className="button secondary" onClick={onClose}><X size={17} /> Κλείσιμο</button><button type="button" className="button primary" onClick={printDocument}><Printer size={17} /> Εκτύπωση</button></div><PrintableDocument templateId={templateId} classroom={classroom} students={students} attendance={attendance} meetings={meetings} selectedDate={selectedDate} /></section></div>
}

export default function OrganizationView({ classroom, students, attendance, meetings, selectedDate, onAddMeeting, onDeleteMeeting }: OrganizationViewProps) {
  const [tab, setTab] = useState<'meetings' | 'prints'>('meetings')
  const [showMeetingDialog, setShowMeetingDialog] = useState(false)
  const [templateId, setTemplateId] = useState<TemplateId | null>(null)
  const sortedMeetings = [...meetings].sort((first, second) => first.date.localeCompare(second.date))
  const totalAttended = meetings.reduce((sum, meeting) => sum + (meeting.attended ?? 0), 0)
  const totalExpected = meetings.reduce((sum, meeting) => sum + (meeting.expected ?? 0), 0)

  return <section className="agenda-view organization-view">
    <div className="view-heading"><div><span className="eyebrow">Επικοινωνία & έγγραφα</span><h1>Οργάνωση</h1><p>Συναντήσεις οικογενειών και έτοιμα πρότυπα εκτύπωσης.</p></div>{tab === 'meetings' && <button type="button" className="button primary" onClick={() => setShowMeetingDialog(true)}><Plus size={18} /> Νέα συνάντηση</button>}</div>
    <div className="organization-tabs"><button type="button" className={tab === 'meetings' ? 'active' : ''} onClick={() => setTab('meetings')}><MessageSquareText size={18} /> Συναντήσεις οικογενειών</button><button type="button" className={tab === 'prints' ? 'active' : ''} onClick={() => setTab('prints')}><Printer size={18} /> Εκτυπώσεις & επιστολές</button></div>
    {tab === 'meetings' ? <>
      <div className="meeting-summary"><article><span>Συναντήσεις</span><strong>{meetings.length}</strong></article><article><span>Γενικές</span><strong>{meetings.filter((meeting) => meeting.type === 'group').length}</strong></article><article><span>Ατομικές</span><strong>{meetings.filter((meeting) => meeting.type === 'individual').length}</strong></article><article><span>Συμμετοχή</span><strong>{totalExpected ? `${totalAttended}/${totalExpected}` : '—'}</strong></article></div>
      <div className="meetings-list">{sortedMeetings.map((meeting) => { const student = students.find((item) => item.id === meeting.studentId); return <article key={meeting.id}><div className="meeting-date"><strong>{parseDate(meeting.date).getDate()}</strong><span>{new Intl.DateTimeFormat('el-GR', { month: 'short' }).format(parseDate(meeting.date))}</span></div><div className="meeting-main"><span className={`status-pill ${meeting.type === 'group' ? 'present' : 'departed'}`}>{meeting.type === 'group' ? 'Γενική' : 'Ατομική'}</span><h2>{meeting.title}</h2><p>{student?.fullName || classroom.name}{meeting.time && ` · ${meeting.time}`}</p>{meeting.notes && <small>{meeting.notes}</small>}</div><div className="meeting-participation"><span>Συμμετοχή</span><strong>{meeting.attended !== null && meeting.expected !== null ? `${meeting.attended}/${meeting.expected}` : student ? '1 οικογένεια' : '—'}</strong></div><button type="button" className="icon-button" title="Διαγραφή συνάντησης" aria-label={`Διαγραφή ${meeting.title}`} onClick={() => onDeleteMeeting(meeting.id)}><Trash2 size={16} /></button></article>})}</div>
      {meetings.length === 0 && <div className="empty-state"><Users /><h2>Καμία συνάντηση</h2><p>Πρόσθεσε την πρώτη συνάντηση με οικογένεια.</p></div>}
    </> : <div className="template-grid">{templates.map((template) => { const Icon = template.icon; return <button type="button" className="template-card" key={template.id} onClick={() => setTemplateId(template.id)}><span className={`template-icon ${template.tone}`}><Icon size={23} /></span><span><strong>{template.title}</strong><small>{template.description}</small></span><Printer size={17} /></button>})}</div>}
    {showMeetingDialog && <MeetingDialog students={students} onClose={() => setShowMeetingDialog(false)} onSave={(meeting) => { onAddMeeting(meeting); setShowMeetingDialog(false) }} />}
    {templateId && <PrintDialog templateId={templateId} classroom={classroom} students={students} attendance={attendance} meetings={meetings} selectedDate={selectedDate} onClose={() => setTemplateId(null)} />}
  </section>
}