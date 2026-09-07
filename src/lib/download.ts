/**
 * 浏览器端触发文件下载
 * - downloadJson: 字符串/对象 → .json
 * - downloadText: 纯文本 → 自定义 MIME/文件名（用于 .st / .txt 等）
 * - downloadBlob: Blob → 自定义文件名
 */

export function downloadJson(data: unknown, filename: string) {
  const json = typeof data === 'string' ? data : JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  triggerDownload(blob, filename)
}

export function downloadText(text: string, filename: string, mime = 'text/plain;charset=utf-8') {
  const blob = new Blob([text], { type: mime })
  triggerDownload(blob, filename)
}

export function downloadBlob(blob: Blob, filename: string) {
  triggerDownload(blob, filename)
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  // 1s 后释放（避免 Safari 即时 revoke 失效）
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}