import { render, screen } from '@testing-library/react'
import Home from '../app/page'

describe('Home', () => {
    it('renders the Next.js logo', () => {
        render(<Home />)
        const logo = screen.getByAltText('Next.js logo')
        expect(logo).toBeInTheDocument()
    })

    it('renders the getting started instructions', () => {
        render(<Home />)
        const instructions = screen.getByText(/Get started by editing/i)
        expect(instructions).toBeInTheDocument()
    })

    it('renders the deployment link', () => {
        render(<Home />)
        const deployLink = screen.getByText('Deploy now')
        expect(deployLink).toBeInTheDocument()
        expect(deployLink).toHaveAttribute('href', expect.stringContaining('vercel.com'))
    })
}) 