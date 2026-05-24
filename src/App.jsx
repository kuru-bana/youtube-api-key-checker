import { useState } from 'react'
import ApiKeyInput from './components/ApiKeyInput'
import TestRunner from './components/TestRunner'

export default function App() {
  const [apiKeys, setApiKeys] = useState([])
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(keys) {
    setApiKeys(keys)
    setSubmitted(true)
  }

  function handleReset() {
    setApiKeys([])
    setSubmitted(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Header />
      <main style={{ maxWidth: 900, margin: '0 auto', padding: '0 20px 60px' }}>
        <ApiKeyInput
          onSubmit={handleSubmit}
          onReset={handleReset}
          submitted={submitted}
          apiKeys={apiKeys}
        />
        {submitted && <TestRunner apiKeys={apiKeys} />}
      </main>
    </div>
  )
}

function Header() {
  return (
    <header style={{
      borderBottom: '1px solid var(--border)',
      padding: '20px 24px',
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      marginBottom: 40
    }}>
      <YoutubeIcon />
      <div>
        <h1 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.3px' }}>
          YouTube API Key Tester
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
          APIキーの各機能が正常に動作するか確認します
        </p>
      </div>
    </header>
  )
}

function YoutubeIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <rect width="36" height="36" rx="8" fill="var(--red)" />
      <path d="M15.8 21.5v-7l6.4 3.5-6.4 3.5z" fill="white" />
    </svg>
  )
}
