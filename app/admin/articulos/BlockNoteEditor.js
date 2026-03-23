'use client'
import { useCreateBlockNote } from '@blocknote/react'
import { BlockNoteView } from '@blocknote/mantine'
import '@blocknote/mantine/style.css'
import { useEffect } from 'react'

export default function BlockNoteEditor({ initialContent, onChange }) {
  const editor = useCreateBlockNote({
    initialContent: initialContent ?? undefined,
  })

  useEffect(() => {
    const unsubscribe = editor.onChange(() => {
      onChange(editor.document)
    })
    return unsubscribe
  }, [editor])

  return <BlockNoteView editor={editor} theme="light" />
}