import { useState } from 'react'

function parseKeys(value) {
  const trimmed = value.trim()
  if (!trimmed) return []

  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed)
      if (Array.isArray(parsed)) {
        return parsed.map(k => String(k).trim()).filter(k => k.length > 0)
      }
      const vals = Object.values(parsed).flat()
      return vals.map(k => String(k).trim()).filter(k => k.length > 0)
    } catch {
      return []
    }
  }

  return trimmed.split('\n').map(k => k.trim()).filter(k => k.length > 0)
}

export default function ApiKeyInput({ onSubmit, onReset, submitted, apiKeys }) {
  const [value, setValue] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const keys = parseKeys(value)
    if (keys.length > 0) onSubmit(keys)
  }

  const keys = parseKeys(value)
  const keyCount = keys.length
  const isJson = value.trim().startsWith('[') || value.trim().startsWith('{')
  const isInvalidJson = isJson && value.trim().length > 2 && keyCount === 0

  if (submitted) {
    return (
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 28,
        gap: 16
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', minWidth: 0 }}>
          <span style={{
            width: 8, height: 8, borderRadius: '50%',
            background: 'var(--green)', display: 'inline-block',
            boxShadow: '0 0 6px var(--green)', flexShrink: 0
          }} />
          <span style={{ fontSize: 13, color: 'var(--text-muted)', flexShrink: 0 }}>
            {apiKeys.length} 件のキーをテスト中
          </span>
        </div>
        <button
          onClick={onReset}
          style={{
            background: 'var(--surface2)',
            border: '1px solid var(--border)',
            color: 'var(--text-muted)',
            borderRadius: 'var(--radius-sm)',
            padding: '6px 14px',
            fontSize: 13,
            flexShrink: 0,
            transition: 'all 0.15s'
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          変更
        </button>
      </div>
    )
  }

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '28px 28px',
      marginBottom: 28
    }}>
      <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>
        YouTube Data API v3 キーを入力
      </h2>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 10 }}>
        1行に1キー（複数可）、または JSON 配列 / オブジェクト形式で貼り付け可能。
        <a
          href="https://console.cloud.google.com/apis/credentials"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--blue)', marginLeft: 6, textDecoration: 'none' }}
        >
          キーを取得する →
        </a>
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        {['改行区切り', 'JSON 配列', 'JSON オブジェクト'].map(fmt => (
          <span key={fmt} style={{
            fontSize: 11, color: 'var(--text-muted)',
            background: 'var(--surface2)',
            border: '1px solid var(--border)',
            borderRadius: 4, padding: '2px 8px'
          }}>
            {fmt}
          </span>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <textarea
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder={'AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX\nAIzaSyYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY\n\nまたは JSON: ["AIzaSy...", "AIzaSy..."]'}
            autoComplete="off"
            spellCheck={false}
            rows={5}
            style={{
              width: '100%',
              background: 'var(--surface2)',
              border: `1px solid ${isInvalidJson ? 'var(--red)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text)',
              fontSize: 13,
              padding: '10px 14px',
              outline: 'none',
              resize: 'vertical',
              transition: 'border-color 0.15s',
              fontFamily: 'monospace',
              lineHeight: 1.8
            }}
            onFocus={e => { if (!isInvalidJson) e.target.style.borderColor = 'var(--blue)' }}
            onBlur={e => { if (!isInvalidJson) e.target.style.borderColor = isInvalidJson ? 'var(--red)' : 'var(--border)' }}
          />
          <div style={{
            position: 'absolute', bottom: 10, right: 10,
            display: 'flex', gap: 6, alignItems: 'center'
          }}>
            {isJson && !isInvalidJson && (
              <span style={{
                fontSize: 11, color: 'var(--green)',
                background: 'var(--green-dim)',
                border: '1px solid var(--green)',
                padding: '2px 7px', borderRadius: 4
              }}>JSON ✓</span>
            )}
            {isInvalidJson && (
              <span style={{
                fontSize: 11, color: 'var(--red)',
                background: 'var(--red-dim)',
                border: '1px solid var(--red)',
                padding: '2px 7px', borderRadius: 4
              }}>JSON エラー</span>
            )}
            {keyCount > 0 && (
              <span style={{
                fontSize: 11, color: 'var(--text-muted)',
                background: 'var(--surface2)',
                padding: '2px 8px', borderRadius: 4,
                border: '1px solid var(--border)'
              }}>{keyCount} 件</span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="submit"
            disabled={keyCount === 0}
            style={{
              background: keyCount > 0 ? 'var(--red)' : 'var(--surface2)',
              border: 'none',
              color: keyCount > 0 ? '#fff' : 'var(--text-muted)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 26px',
              fontWeight: 600,
              fontSize: 14,
              transition: 'all 0.15s',
              cursor: keyCount > 0 ? 'pointer' : 'default'
            }}
          >
            {keyCount > 1 ? `${keyCount} 件をテスト開始` : 'テスト開始'}
          </button>
        </div>
      </form>
    </div>
  )
}
