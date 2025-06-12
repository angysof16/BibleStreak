import React from 'react'
import ProgressBar from './ProgressBar'
import VerseSelector from './VerseSelector'
import { useReadings } from '../hooks/useReadings'

const TOTAL_VERSES = 31102 // Reina Valera 1960

function Dashboard() {
  // For now, we'll use a mock user - replace with real auth later
  const mockUserId = 'user-123'
  const { totalRead, todayRead, streak, loading, recordReading } = useReadings(mockUserId)

  if (loading) {
    return (
      <div className="card">
        <p>Cargando...</p>
      </div>
    )
  }

  const progressPercentage = (totalRead / TOTAL_VERSES) * 100

  return (
    <div>
      <div className="card">
        <h1>📖 Mi Lectura Bíblica</h1>
        <p>¡Mantén tu racha de lectura!</p>
      </div>

      <div className="card">
        <h2>📊 Progreso General</h2>
        <ProgressBar 
          progress={progressPercentage}
          label={`${totalRead.toLocaleString()} de ${TOTAL_VERSES.toLocaleString()} versículos`}
        />
      </div>

      <div className="card">
        <h2>🔥 Racha Actual</h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '2em', fontWeight: 'bold', color: streak > 0 ? '#10b981' : '#666' }}>
              {streak}
            </div>
            <div style={{ color: '#666' }}>días consecutivos</div>
          </div>
          <div>
            <div style={{ fontSize: '1.5em', fontWeight: 'bold', color: todayRead > 0 ? '#1e40af' : '#666' }}>
              {todayRead}
            </div>
            <div style={{ color: '#666' }}>versículos hoy</div>
          </div>
        </div>
      </div>

      <VerseSelector onVersesRead={recordReading} />
    </div>
  )
}

export default Dashboard