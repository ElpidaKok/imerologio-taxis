import {
  Apple,
  ArrowRight,
  Atom,
  BookOpen,
  CalendarDays,
  FlaskConical,
  GraduationCap,
  PencilLine,
  Sparkles,
} from 'lucide-react'
import type { AgendaData } from '../agenda'

type CoverViewProps = {
  classroom: AgendaData['classroom']
  studentCount: number
  eventCount: number
  onOpenAgenda: () => void
  onOpenYear: () => void
}

const coverTabs = ['Σήμερα', 'Έτος', 'Μαθητές', 'Οργάνωση', 'Βιβλία', 'Αρχείο']

export default function CoverView({ classroom, studentCount, eventCount, onOpenAgenda, onOpenYear }: CoverViewProps) {
  return (
    <section className="cover-view" aria-labelledby="cover-title">
      <article className="cover-notebook">
        <div className="cover-spiral" aria-hidden="true">
          {Array.from({ length: 12 }, (_, index) => <span key={index} />)}
        </div>
        <div className="cover-tabs" aria-hidden="true">
          {coverTabs.map((tab) => <span key={tab}>{tab}</span>)}
        </div>

        <div className="cover-decoration cover-decoration-top" aria-hidden="true">
          <PencilLine />
          <Sparkles />
        </div>

        <div className="cover-content">
          <span className="cover-year">{classroom.schoolYear}</span>
          <div className="cover-seal" aria-hidden="true"><GraduationCap /></div>
          <p className="cover-script">agenda</p>
          <h1 id="cover-title">Ατζέντα<br />Εκπαιδευτικού</h1>
          <p className="cover-owner">{classroom.teacherName}</p>
          <p className="cover-school">{classroom.schoolName} · {classroom.name}</p>

          <div className="cover-board" aria-hidden="true">
            <BookOpen />
            <span>α + β = γ</span>
            <FlaskConical />
            <Apple />
            <Atom />
          </div>

          <div className="cover-summary" aria-label="Σύνοψη ατζέντας">
            <span><strong>{studentCount}</strong> μαθητές</span>
            <span><strong>{eventCount}</strong> ημερομηνίες</span>
          </div>

          <div className="cover-actions">
            <button type="button" className="button primary" onClick={onOpenAgenda}>Άνοιγμα ατζέντας <ArrowRight size={18} /></button>
            <button type="button" className="button secondary" onClick={onOpenYear}><CalendarDays size={18} /> Σχολικό έτος</button>
          </div>
        </div>

        <div className="cover-decoration cover-decoration-bottom" aria-hidden="true">
          <BookOpen />
          <span />
          <PencilLine />
        </div>
      </article>
    </section>
  )
}