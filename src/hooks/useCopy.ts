import { useState, useCallback } from 'react'

export const useCopy = () => {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }, [])

  return { copied, copyToClipboard }
}
