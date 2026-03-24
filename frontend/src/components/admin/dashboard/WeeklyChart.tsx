'use client'

export function WeeklyChart() {
  const bars = [
    { height: '35%', delay: '0.68s' },
    { height: '55%', delay: '0.73s' },
    { height: '80%', delay: '0.78s' },
    { height: '45%', delay: '0.83s' },
    { height: '95%', delay: '0.88s' },
    { height: '60%', delay: '0.93s' },
    { height: '20%', delay: '0.98s' }
  ]

  return (
    <div className="admin-mini-card">
      <h4>Weekly Appointments</h4>
      <div className="admin-chart-bar-wrap">
        {bars.map((bar, index) => (
          <div
            key={index}
            className="admin-bar"
            style={{ 
              height: bar.height,
              animationDelay: bar.delay
            }}
          />
        ))}
      </div>
    </div>
  )
}
