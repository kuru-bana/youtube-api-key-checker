import { useState, useEffect } from 'react'
import TestCard from './TestCard'
import { ERROR_CATEGORIES, classifyKeyResults } from '../utils/errorClassifier'

const TESTS = [
  {
    id: 'quota',
    name: '認証確認',
    description: 'APIキーが有効かどうかを確認します',
    endpoint: 'videos',
    run: async (key) => {
      const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=dQw4w9WgXcQ&key=${key}`
      const res = await fetch(url)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error?.message || `HTTP ${res.status}`)
      return {
        summary: `認証成功 — ${data.pageInfo?.totalResults ?? 0} 件取得`,
        detail: `ステータス: ${res.status} OK`,
        raw: data
      }
    }
  },
  {
    id: 'search',
    name: '動画検索',
    description: '検索エンドポイントが利用可能か確認します',
    endpoint: 'search',
    run: async (key) => {
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=test&maxResults=3&type=video&key=${key}`
      const res = await fetch(url)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error?.message || `HTTP ${res.status}`)
      const titles = (data.items || []).map(i => i.snippet?.title).filter(Boolean)
      return {
        summary: `${data.pageInfo?.totalResults?.toLocaleString() ?? 0} 件の動画が見つかりました`,
        detail: titles.slice(0, 3).map(t => `• ${t}`).join('\n'),
        raw: data
      }
    }
  },
  {
    id: 'channels',
    name: 'チャンネル取得',
    description: 'チャンネル情報の取得が可能か確認します',
    endpoint: 'channels',
    run: async (key) => {
      const url = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=UCVHFbw7woebKtffS26yA1Yw&key=${key}`
      const res = await fetch(url)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error?.message || `HTTP ${res.status}`)
      const ch = data.items?.[0]
      return {
        summary: ch ? `チャンネル取得成功: ${ch.snippet?.title}` : 'チャンネルデータを取得しました',
        detail: ch ? `登録者数: ${Number(ch.statistics?.subscriberCount).toLocaleString()} 人` : '',
        raw: data
      }
    }
  },
  {
    id: 'playlists',
    name: 'プレイリスト取得',
    description: 'プレイリストエンドポイントが利用可能か確認します',
    endpoint: 'playlists',
    run: async (key) => {
      const url = `https://www.googleapis.com/youtube/v3/playlists?part=snippet&channelId=UCVHFbw7woebKtffS26yA1Yw&maxResults=5&key=${key}`
      const res = await fetch(url)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error?.message || `HTTP ${res.status}`)
      return {
        summary: `${data.items?.length ?? 0} 件のプレイリストを取得しました`,
        detail: (data.items || []).slice(0, 3).map(p => `• ${p.snippet?.title}`).join('\n'),
        raw: data
      }
    }
  },
  {
    id: 'comments',
    name: 'コメント取得',
    description: 'コメントスレッドの取得が可能か確認します',
    endpoint: 'commentThreads',
    run: async (key) => {
      const url = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=dQw4w9WgXcQ&maxResults=3&key=${key}`
      const res = await fetch(url)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error?.message || `HTTP ${res.status}`)
      return {
        summary: `コメント取得成功 — ${data.pageInfo?.totalResults?.toLocaleString() ?? 0} 件`,
        detail: (data.items || []).slice(0, 2).map(c =>
          `• ${c.snippet?.topLevelComment?.snippet?.textDisplay?.slice(0, 60)}...`
        ).join('\n'),
        raw: data
      }
    }
  },
  {
    id: 'captions',
    name: '字幕リスト',
    description: '字幕エンドポイントへのアクセスを確認します',
    endpoint: 'captions',
    run: async (key) => {
      const url = `https://www.googleapis.com/youtube/v3/captions?part=snippet&videoId=dQw4w9WgXcQ&key=${key}`
      const res = await fetch(url)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error?.message || `HTTP ${res.status}`)
      return {
        summary: `字幕エンドポイントアクセス成功`,
        detail: `${data.items?.length ?? 0} 件の字幕トラック`,
        raw: data
      }
    }
  },
  {
    id: 'videoCategories',
    name: '動画カテゴリ',
    description: '動画カテゴリリストを取得できるか確認します',
    endpoint: 'videoCategories',
    run: async (key) => {
      const url = `https://www.googleapis.com/youtube/v3/videoCategories?part=snippet&regionCode=JP&hl=ja&key=${key}`
      const res = await fetch(url)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error?.message || `HTTP ${res.status}`)
      const cats = (data.items || []).filter(c => c.snippet?.assignable)
      return {
        summary: `${cats.length} 件の有効なカテゴリを取得しました`,
        detail: cats.slice(0, 5).map(c => `• ${c.snippet?.title}`).join('\n'),
        raw: data
      }
    }
  },
  {
    id: 'trending',
    name: 'トレンド動画',
    description: '日本のトレンド動画が取得できるか確認します',
    endpoint: 'videos (mostPopular)',
    run: async (key) => {
      const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&regionCode=JP&maxResults=5&key=${key}`
      const res = await fetch(url)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error?.message || `HTTP ${res.status}`)
      return {
        summary: `トレンド動画 ${data.items?.length ?? 0} 件を取得しました`,
        detail: (data.items || []).map(v => `• ${v.snippet?.title?.slice(0, 50)}`).join('\n'),
        raw: data
      }
    }
  }
]

export default function TestRunner({ apiKeys }) {
  const [resultsByKey, setResultsByKey] = useState({})
  const [running, setRunning] = useState(false)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    runAll()
  }, [apiKeys])

  async function runAll() {
    setRunning(true)
    setStarted(true)
    const initial = {}
    for (const key of apiKeys) {
      initial[key] = {}
      for (const test of TESTS) {
        initial[key][test.id] = { status: 'running' }
      }
    }
    setResultsByKey(initial)

    await Promise.all(
      apiKeys.flatMap(key =>
        TESTS.map(async (test) => {
          try {
            const result = await test.run(key)
            setResultsByKey(prev => ({
              ...prev,
              [key]: { ...prev[key], [test.id]: { status: 'ok', ...result } }
            }))
          } catch (err) {
            setResultsByKey(prev => ({
              ...prev,
              [key]: { ...prev[key], [test.id]: { status: 'error', summary: err.message } }
            }))
          }
        })
      )
    )

    setRunning(false)
  }

  const allDone = !running && started

  const categoryMap = {}
  for (const key of apiKeys) {
    const cat = classifyKeyResults(resultsByKey[key] || {})
    if (!categoryMap[cat.id]) categoryMap[cat.id] = { cat, keys: [] }
    categoryMap[cat.id].keys.push(key)
  }

  const sortOrder = ['ok', 'partial', 'quota', 'disabled', 'restricted', 'forbidden', 'invalid', 'unknown', 'running']
  const sortedCategories = Object.values(categoryMap).sort(
    (a, b) => sortOrder.indexOf(a.cat.id) - sortOrder.indexOf(b.cat.id)
  )

  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 20
      }}>
        <h2 style={{ fontSize: 15, fontWeight: 600 }}>テスト結果</h2>
        <button
          onClick={runAll}
          disabled={running}
          style={{
            background: running ? 'var(--surface2)' : 'var(--surface)',
            border: '1px solid var(--border)',
            color: running ? 'var(--text-muted)' : 'var(--text)',
            borderRadius: 'var(--radius-sm)',
            padding: '8px 16px',
            fontSize: 13,
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            transition: 'all 0.15s'
          }}
        >
          <RefreshIcon spinning={running} />
          {running ? 'テスト中...' : '再テスト'}
        </button>
      </div>

      {allDone && apiKeys.length > 1 && (
        <CategorySummary categories={sortedCategories} total={apiKeys.length} />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {apiKeys.map((key, idx) => {
          const results = resultsByKey[key] || {}
          const statuses = Object.values(results)
          const okCount = statuses.filter(r => r.status === 'ok').length
          const errCount = statuses.filter(r => r.status === 'error').length
          const runningNow = statuses.some(r => r.status === 'running')
          const cat = classifyKeyResults(results)

          return (
            <div key={key}>
              <KeyHeader
                index={idx + 1}
                fullKey={key}
                okCount={okCount}
                errCount={errCount}
                total={TESTS.length}
                running={runningNow}
                cat={cat}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                {TESTS.map(test => (
                  <TestCard
                    key={test.id}
                    test={test}
                    result={results[test.id]}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function CategorySummary({ categories, total }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '18px 20px',
      marginBottom: 28
    }}>
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14, color: 'var(--text-muted)' }}>
        キー分類サマリー ({total} 件)
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {categories.map(({ cat, keys }) => (
          <div key={cat.id}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              marginBottom: 6
            }}>
              <span style={{
                fontSize: 12, fontWeight: 700,
                color: cat.color,
                background: cat.dimColor,
                border: `1px solid ${cat.color}`,
                borderRadius: 4, padding: '2px 9px',
                minWidth: 90, textAlign: 'center'
              }}>
                {cat.icon} {cat.label}
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {cat.description}
              </span>
              <span style={{ fontSize: 12, color: cat.color, marginLeft: 'auto', fontWeight: 600 }}>
                {keys.length} 件
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, paddingLeft: 4 }}>
              {keys.map((k, i) => (
                <code key={i} style={{
                  fontSize: 11,
                  fontFamily: 'monospace',
                  background: 'var(--surface2)',
                  border: `1px solid ${cat.color}44`,
                  borderRadius: 4,
                  padding: '3px 9px',
                  color: 'var(--text)',
                  letterSpacing: '0.3px'
                }}>
                  {k}
                </code>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function KeyHeader({ index, fullKey, okCount, errCount, total, running, cat }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '10px 14px',
      background: 'var(--surface)',
      border: `1px solid ${cat.color}`,
      borderRadius: 'var(--radius)',
      transition: 'border-color 0.3s',
      flexWrap: 'wrap'
    }}>
      <div style={{
        fontSize: 11, fontWeight: 700, color: '#fff',
        background: cat.color,
        borderRadius: 4, padding: '2px 8px',
        flexShrink: 0, transition: 'background 0.3s'
      }}>
        KEY {index}
      </div>
      <code style={{
        fontSize: 12, color: 'var(--text)',
        flex: 1, letterSpacing: '0.3px',
        wordBreak: 'break-all', minWidth: 0,
        fontFamily: 'monospace'
      }}>
        {fullKey}
      </code>
      <span style={{
        fontSize: 12, color: cat.color, fontWeight: 600,
        flexShrink: 0, transition: 'color 0.3s'
      }}>
        {running
          ? 'テスト中...'
          : `${cat.icon} ${cat.label} (${okCount}/${total})`
        }
      </span>
    </div>
  )
}

function RefreshIcon({ spinning }) {
  return (
    <svg
      width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ animation: spinning ? 'spin 1s linear infinite' : 'none' }}
    >
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
    </svg>
  )
}
