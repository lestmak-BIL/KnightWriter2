import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../App'
import { useDocumentStore } from '../store/documentStore'

describe('Format toolbar', () => {
  beforeEach(() => {
    useDocumentStore.setState({
      markdown: '',
      activeEditor: 'visual',
    })
  })

  it('renders format toolbar with bold button', () => {
    render(<App />)
    const boldButton = screen.getByTestId('bold-button')
    expect(boldButton).toBeInTheDocument()
  })

  it('has accessible toolbar buttons', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: /bold/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /italic/i })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /heading 1/i })
    ).toBeInTheDocument()
  })
})
