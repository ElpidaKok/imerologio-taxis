import { useState, type FormEvent } from 'react'
import { Check, Download, Eraser, HardDrive, Settings, Upload } from 'lucide-react'
import { parseAgendaBackup, type AgendaData } from '../agenda'

type SettingsViewProps = {
  data: AgendaData
  onUpdateClassroom: (classroom: AgendaData['classroom']) => void
  onImport: (data: AgendaData) => void
  onClear: () => void
}

export default function SettingsView({ data, onUpdateClassroom, onImport, onClear }: SettingsViewProps) {
  const [classroom, setClassroom] = useState(data.classroom)
  const [saved, setSaved] = useState(false)
  const [importMessage, setImportMessage] = useState('')

  function saveClassroom(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onUpdateClassroom({
      ...classroom,
      name: classroom.name.trim(),
      schoolYear: classroom.schoolYear.trim(),
      teacherName: classroom.teacherName.trim(),
      schoolName: classroom.schoolName.trim(),
      schoolEmail: classroom.schoolEmail.trim(),
      schoolPhone: classroom.schoolPhone.trim(),
    })
    setSaved(true)
  }

  function exportData() {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `imerologio-taxis-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  async function importData(file: File | undefined) {
    if (!file) return
    try {
      const imported = parseAgendaBackup(await file.text())
      onImport(imported)
      setClassroom(imported.classroom)
      setImportMessage('Το αντίγραφο εισήχθη επιτυχώς.')
    } catch {
      setImportMessage('Το αρχείο δεν είναι έγκυρο αντίγραφο της εφαρμογής.')
    }
  }

  function clearClassroom() {
    if (!window.confirm('Να διαγραφούν όλοι οι μαθητές, οι παρουσίες, τα βιβλία, οι συναντήσεις και οι καταγραφές από αυτή τη συσκευή;')) return
    onClear()
    setImportMessage('Η τάξη είναι πλέον κενή.')
  }

  return (
    <section className="agenda-view settings-view">
      <div className="view-heading"><div><span className="eyebrow">Παραμετροποίηση</span><h1>Ρυθμίσεις</h1><p>Στοιχεία τάξης και διαχείριση τοπικών δεδομένων.</p></div></div>
      <div className="settings-layout">
        <section className="settings-section">
          <div className="settings-section-heading"><span><Settings size={20} /></span><div><h2>Στοιχεία τάξης</h2><p>Εμφανίζονται στην κορυφή της εφαρμογής.</p></div></div>
          <form className="settings-form" onSubmit={saveClassroom}>
            <label>Όνομα σχολείου<input required value={classroom.schoolName} onChange={(event) => { setSaved(false); setClassroom({ ...classroom, schoolName: event.target.value }) }} /></label>
            <label>Όνομα τμήματος<input required value={classroom.name} onChange={(event) => { setSaved(false); setClassroom({ ...classroom, name: event.target.value }) }} /></label>
            <div className="form-row">
              <label>Σχολική χρονιά<input required value={classroom.schoolYear} onChange={(event) => { setSaved(false); setClassroom({ ...classroom, schoolYear: event.target.value }) }} /></label>
              <label>Εκπαιδευτικός<input required value={classroom.teacherName} onChange={(event) => { setSaved(false); setClassroom({ ...classroom, teacherName: event.target.value }) }} /></label>
            </div>
            <div className="form-row">
              <label>Έναρξη μαθημάτων<input required type="date" value={classroom.startDate} onChange={(event) => { setSaved(false); setClassroom({ ...classroom, startDate: event.target.value }) }} /></label>
              <label>Λήξη μαθημάτων<input required type="date" value={classroom.endDate} onChange={(event) => { setSaved(false); setClassroom({ ...classroom, endDate: event.target.value }) }} /></label>
            </div>
            <label>Ημέρες διδασκαλίας<input required type="number" min="1" max="366" value={classroom.teachingDays} onChange={(event) => { setSaved(false); setClassroom({ ...classroom, teachingDays: Number(event.target.value) }) }} /></label>
            <div className="form-row">
              <label>Email σχολείου<input type="email" value={classroom.schoolEmail} onChange={(event) => { setSaved(false); setClassroom({ ...classroom, schoolEmail: event.target.value }) }} /></label>
              <label>Τηλέφωνο σχολείου<input type="tel" value={classroom.schoolPhone} onChange={(event) => { setSaved(false); setClassroom({ ...classroom, schoolPhone: event.target.value }) }} /></label>
            </div>
            <button type="submit" className="button primary">{saved ? <Check size={18} /> : <Settings size={18} />}{saved ? 'Αποθηκεύτηκε' : 'Αποθήκευση στοιχείων'}</button>
          </form>
        </section>

        <section className="settings-section">
          <div className="settings-section-heading"><span><HardDrive size={20} /></span><div><h2>Αντίγραφο δεδομένων</h2><p>Για φύλαξη ή μεταφορά σε άλλη συσκευή.</p></div></div>
          <div className="data-actions">
            <button type="button" className="button secondary" onClick={exportData}><Download size={18} /> Εξαγωγή αντιγράφου</button>
            <label className="button secondary file-button"><Upload size={18} /> Εισαγωγή αντιγράφου<input type="file" accept="application/json,.json" onChange={(event) => void importData(event.target.files?.[0])} /></label>
          </div>
          {importMessage && <p className="settings-message" role="status">{importMessage}</p>}
          <div className="danger-zone">
            <div><strong>Καθαρισμός τάξης</strong><span>Διαγράφει τα δεδομένα τάξης από αυτή τη συσκευή, διατηρώντας μόνο τα στοιχεία σχολείου.</span></div>
            <button type="button" className="button danger" onClick={clearClassroom}><Eraser size={18} /> Καθαρισμός</button>
          </div>
        </section>
      </div>
    </section>
  )
}