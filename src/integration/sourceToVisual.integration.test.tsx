import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import App from '../App'
import { useDocumentStore } from '../store/documentStore'

describe('Source to Visual sync', () => {
  beforeEach(() => {
    useDocumentStore.setState({
      markdown: '# Welcome to KnightWriter\n\nStart typing in either pane...',
      activeEditor: 'source',
      isSyncing: false,
    })
  })

  it('renders app with source and visual editors', () => {
    render(<App />)
    expect(screen.getByTestId('source-editor')).toBeInTheDocument()
    expect(screen.getByTestId('visual-editor')).toBeInTheDocument()
  })

  it('visual pane shows content from store markdown', async () => {
    useDocumentStore.setState({
      markdown: '# Hello World\n\nThis is content.',
    })
    render(<App />)
    await waitFor(
      () => {
        const visualEditor = screen.getByTestId('visual-editor')
        expect(visualEditor.textContent).toContain('Hello World')
        expect(visualEditor.textContent).toContain('This is content.')
      },
      { timeout: 1000 }
    )
  })

  it('visual pane renders headings and formatting', async () => {
    useDocumentStore.setState({
      markdown: '**bold** *italic* ~~strikethrough~~',
    })
    render(<App />)
    await waitFor(
      () => {
        const visualEditor = screen.getByTestId('visual-editor')
        expect(visualEditor.querySelector('strong')).toBeTruthy()
        expect(visualEditor.querySelector('em')).toBeTruthy()
      },
      { timeout: 1000 }
    )
  })
})
