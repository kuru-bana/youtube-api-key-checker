import { useState } from 'react'

export default function TestCard({ test, result }) {
  const [expanded, setExpanded] = useState(false)
  const status = result?.status ?? 'pending'

  const colors = {
    pending: { border: 'var(--border)', bg: 'transparent', dot: 'var(--text-muted)', label: '待機中', labelColor: 'var(--text-muted)' },
    running: { border: 'var(--blue)', bg: 'var(--blue-dim)', dot: 'var(--blue)', label: 'テスト中', labelColor: 'var(--blue)' },
    ok: { border: 'var(--green)', bg: 'var(--green-dim)', dot: 'var(--green)', label: '成功', labelColor: 'var(--green)' },
    error: { border: 'var(--red)', bg: 'var(--red-dim)', dot: 'var(--red)', label: '失敗', labelColor: 'var(--red)' }
  }
  const c = colors[status]

  return (
    <div style={{
      background: 'var(--surface)',
      border: `1px solid ${c.border}`,
      borderRadius: 'var(--radius)',
      overflow: 'hidden',
      transition: 'border-color 0.3s'
    }}>
      <button
        onClick={() => result && setExpanded(e => !e)}
        style={{
          width: '100%',
          background: c.bg,
          border: 'none',
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          cursor: result ? 'pointer' : 'default',
          textAlign: 'left',
          transition: 'background 0.2s'
        }}
      >
        <StatusDot status={status} color={c.dot} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>{test.name}</span>
            <span style={{
              fontSize: 11, fontWeight: 600, color: c.labelColor,
              background: `${c.dot}18`,
              border: `1px solid ${c.dot}44`,
              borderRadius: 4, padding: '1px 7px',
              textTransform: 'uppercase', letterSpacing: '0.5px'
            }}>
              {c.label}
            </span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
            {result?.summary || test.description}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <span style={{
            fontSize: 11, color: 'var(--text-muted)',
            fontFamily: 'monospace', background: 'var(--surface2)',
            padding: '2px 8px', borderRadius: 4
          }}>
            {test.endpoint}
          </span>
          {result && (
            <ChevronIcon expanded={expanded} />
          )}
        </div>
      </button>

      {expanded && result && (
        <div style={{
          borderTop: `1px solid var(--border)`,
          padding: '14px 18px',
          background: 'var(--bg)'
        }}>
          {result.detail && (
            <pre style={{
              fontSize: 12,
              color: 'var(--text-muted)',
              whiteSpace: 'pre-wrap',
              marginBottom: result.raw ? 12 : 0,
              lineHeight: 1.7
            }}>
              {result.detail}
            </pre>
          )}
          {result.raw && (
            <details>
              <summary style={{
                fontSize: 12, color: 'var(--blue)', cursor: 'pointer',
                userSelect: 'none', marginBottom: 8
              }}>
                レスポンス JSON を表示
              </summary>
              <pre style={{
                fontSize: 11,
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: 12,
                overflow: 'auto',
                maxHeight: 300,
                color: 'var(--text-muted)',
                whiteSpace: 'pre-wrap',
                lineHeight: 1.5
              }}>
                {JSON.stringify(result.raw, null, 2)}
              </pre>
            </details>
          )}
          {status === 'error' && (
            <div style={{
              fontSize: 12, color: 'var(--red)',
              background: 'var(--red-dim)',
              border: '1px solid var(--red)',
              borderRadius: 'var(--radius-sm)',
              padding: '8px 12px'
            }}>
              <strong>エラー:</strong> {result.summary}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function StatusDot({ status, color }) {
  if (status === 'running') {
    return (
      <div style={{ position: 'relative', width: 10, height: 10, flexShrink: 0 }}>
        <style>{`
          @keyframes pulse-ring {
            0% { transform: scale(0.5); opacity: 1; }
            100% { transform: scale(2.2); opacity: 0; }
          }
          @keyframes pulse-dot {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
        <div style={{
          position: 'absolute', inset: 0,
          borderRadius: '50%', background: color,
          animation: 'pulse-dot 1.2s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          borderRadius: '50%', background: color,
          animation: 'pulse-ring 1.2s ease-out infinite'
        }} />
      </div>
    )
  }
  return (
    <div style={{
      width: 10, height: 10, borderRadius: '50%',
      background: color, flexShrink: 0,
      boxShadow: status === 'ok' ? `0 0 6px ${color}` : 'none',
      transition: 'all 0.3s'
    }} />
  )
}

function ChevronIcon({ expanded }) {
  return (
    <svg
      width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      style={{
        color: 'var(--text-muted)',
        transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
        transition: 'transform 0.2s'
      }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}
