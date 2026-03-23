'use client'
import { useCreateBlockNote } from '@blocknote/react'
import { BlockNoteView } from '@blocknote/mantine'
import '@blocknote/mantine/style.css'

export default function ArticuloContent({ content }) {
  const editor = useCreateBlockNote({
    initialContent: content ?? undefined,
    editable: false,
  })

  return <BlockNoteView editor={editor} theme="light" />
}