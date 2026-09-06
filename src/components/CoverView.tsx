import {
  AlarmClock,
  Apple,
  ArrowRight,
  Atom,
  BookOpen,
  CalendarDays,
  FlaskConical,
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

const coverTabs = ['Σήμερα', 'Έτος', 'Μαθητές', 'Παρουσίες', 'Οργάνωση', 'Βιβλία', 'Αρχείο', 'Ρυθμίσεις']

function BotanicalBranch({ position }: { position: string }) {
  return <div className={`cover-botanical ${position}`} aria-hidden="true">
    {Array.from({ length: 7 }, (_, index) => <span key={index} />)}
  </div>
}

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

        <BotanicalBranch position="cover-botanical-top" />
        <BotanicalBranch position="cover-botanical-left" />
        <BotanicalBranch position="cover-botanical-bottom-left" />
        <BotanicalBranch position="cover-botanical-bottom-right" />

        <div className="cover-decoration cover-decoration-top" aria-hidden="true">
          <PencilLine />
          <Sparkles />
        </div>

        <div className="cover-content">
          <span className="cover-year">{classroom.schoolYear}</span>
          <p className="cover-script">agenda</p>
          <h1 id="cover-title">Ατζέντα<br />Εκπαιδευτικού</h1>
          <p className="cover-owner">{classroom.teacherName}</p>
          <p className="cover-school">{classroom.schoolName} · {classroom.name}</p>

          <div className="cover-illustration" aria-hidden="true">
            <span className="cover-clock"><AlarmClock /></span>
            <span className="cover-atom"><Atom /></span>
            <span className="cover-open-book"><BookOpen /></span>
            <div className="cover-board">
              <div><BookOpen /><Apple /><FlaskConical /></div>
              <span>α × β = γ ?</span>
              <div><PencilLine /><span>△ = ?</span><Atom /></div>
            </div>
            <div className="cover-pencils"><span /><span /></div>
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

      </article>
    </section>
  )
}