import React from 'react'

function ProgressBar({ progress, label }) {
  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginBottom: '8px',
        fontSize: '14px',
        color: '#666'
      }}>
        <span>{label}</span>
        <span>{progress.toFixed(1)}%</span>
      </div>
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  )
}

export default ProgressBar