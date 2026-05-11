import './style.css'
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'

const editor = new Editor({
  element: document.querySelector('#editor'),
  extensions: [StarterKit],
  content: '<p>Écris ton article...</p>',
})

// Save vers backend
document.querySelector('#save').addEventListener('click', async () => {
  const data = editor.getJSON()

  await fetch('http://localhost:3000/api/articles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Mon article',
      content: data
    })
  })
})