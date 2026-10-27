/**
 * Dosya indirme. claude.ai Artifact içinde çalışırken platformun `downloads`
 * yeteneğini kullanır; normal tarayıcıda / yerel geliştirmede klasik
 * <a download> yöntemine düşer.
 */
type ClaudeDownloads = { save(r: { filename: string; data: Blob }): Promise<unknown> }
type ClaudeGlobal = { use?: (name: string) => Promise<unknown> }

export async function saveFile(filename: string, data: Blob): Promise<'saved' | 'declined'> {
  const claude = (window as unknown as { claude?: ClaudeGlobal }).claude
  if (claude?.use) {
    const dl = (await claude.use('downloads').catch(() => null)) as ClaudeDownloads | null
    if (dl) {
      try {
        await dl.save({ filename, data })
        return 'saved'
      } catch (e) {
        if ((e as { code?: string }).code === 'declined') return 'declined'
        throw e
      }
    }
  }
  const url = URL.createObjectURL(data)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 5000)
  return 'saved'
}
