export const ERROR_CATEGORIES = {
  quota: {
    id: 'quota',
    label: 'クォータ超過',
    description: '1日の使用上限に達しています',
    color: 'var(--yellow)',
    dimColor: 'var(--yellow-dim)',
    icon: '⚠'
  },
  invalid: {
    id: 'invalid',
    label: '無効なキー',
    description: 'APIキーが正しくありません',
    color: 'var(--red)',
    dimColor: 'var(--red-dim)',
    icon: '✕'
  },
  disabled: {
    id: 'disabled',
    label: 'API未有効化',
    description: 'YouTube Data API v3 が有効になっていません',
    color: '#ff6d00',
    dimColor: '#ff6d0022',
    icon: '○'
  },
  restricted: {
    id: 'restricted',
    label: 'アクセス制限',
    description: 'IP・リファラー・アプリ制限がかかっています',
    color: '#aa00ff',
    dimColor: '#aa00ff22',
    icon: '⊘'
  },
  forbidden: {
    id: 'forbidden',
    label: 'アクセス拒否',
    description: 'このAPIキーでは権限がありません',
    color: '#d50000',
    dimColor: '#d5000022',
    icon: '⊗'
  },
  ok: {
    id: 'ok',
    label: '正常',
    description: 'すべてのテストに成功しました',
    color: 'var(--green)',
    dimColor: 'var(--green-dim)',
    icon: '✓'
  },
  partial: {
    id: 'partial',
    label: '一部エラー',
    description: '一部のテストが失敗しました',
    color: 'var(--yellow)',
    dimColor: 'var(--yellow-dim)',
    icon: '△'
  },
  unknown: {
    id: 'unknown',
    label: 'その他のエラー',
    description: '不明なエラーが発生しました',
    color: 'var(--text-muted)',
    dimColor: '#90909022',
    icon: '?'
  },
  running: {
    id: 'running',
    label: 'テスト中',
    description: '',
    color: 'var(--blue)',
    dimColor: 'var(--blue-dim)',
    icon: '…'
  }
}

export function classifyErrorMessage(msg) {
  if (!msg) return 'unknown'
  const m = msg.toLowerCase()
  if (m.includes('quota') || m.includes('rateLimitExceeded') || m.includes('userRateLimitExceeded')) return 'quota'
  if (m.includes('api key not valid') || m.includes('keyinvalid') || m.includes('bad request') || m.includes('invalid api key') || m.includes('invalid_key')) return 'invalid'
  if (m.includes('accessnotconfigured') || m.includes('api not enabled') || m.includes('has not been used') || m.includes('disabled') || m.includes('not enabled')) return 'disabled'
  if (m.includes('ip address') || m.includes('referer') || m.includes('not authorized') || m.includes('ip_address_blocked') || m.includes('requests from this ip') || m.includes('key_expired')) return 'restricted'
  if (m.includes('forbidden') || m.includes('403')) return 'forbidden'
  return 'unknown'
}

export function classifyKeyResults(results) {
  const statuses = Object.values(results || {})
  if (statuses.length === 0) return ERROR_CATEGORIES.running
  if (statuses.some(r => r.status === 'running')) return ERROR_CATEGORIES.running

  const errors = statuses.filter(r => r.status === 'error')
  if (errors.length === 0) return ERROR_CATEGORIES.ok

  const errorTypes = errors.map(r => classifyErrorMessage(r.summary))
  const dominant = errorTypes.reduce((acc, t) => {
    acc[t] = (acc[t] || 0) + 1
    return acc
  }, {})
  const topType = Object.entries(dominant).sort((a, b) => b[1] - a[1])[0][0]

  if (errors.length < statuses.length) {
    if (topType === 'quota') return ERROR_CATEGORIES.quota
    return ERROR_CATEGORIES.partial
  }

  return ERROR_CATEGORIES[topType] || ERROR_CATEGORIES.unknown
}
