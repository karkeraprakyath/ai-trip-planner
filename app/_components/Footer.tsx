'use client'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="mt-16 border-t bg-card/40 backdrop-blur supports-[backdrop-filter]:bg-white/50 dark:supports-[backdrop-filter]:bg-neutral-900/40">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid grid-cols-1 gap-y-8 md:grid-cols-4 md:gap-8">
          
          {/* Branding */}
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-lg font-semibold text-foreground">AI Trip Planner</h3>
            <p className="text-sm text-muted-foreground">
              Plan itineraries, discover places, and generate trips with AI.
            </p>
          </div>

          {/* Product */}
          <div className="text-center md:text-left">
            <h4 className="text-sm font-semibold mb-3 text-foreground">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/create-new-trip" className="hover:text-foreground">Create Trip</Link></li>
              <li><Link href="/my-trips" className="hover:text-foreground">My Trips</Link></li>
              <li><Link href="/pricing" className="hover:text-foreground">Pricing</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div className="text-center md:text-left">
            <h4 className="text-sm font-semibold mb-3 text-foreground">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/contact-us" className="hover:text-foreground">Contact</Link></li>
              <li><Link href="/terms" className="hover:text-foreground">Terms</Link></li>
              <li><Link href="/privacy" className="hover:text-foreground">Privacy</Link></li>
            </ul>
          </div>

          {/* Socials */}
          <div className="text-center md:text-left">
            <h4 className="text-sm font-semibold mb-3 text-foreground">Follow</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="https://x.com" target="_blank" rel="noreferrer" className="hover:text-foreground">Twitter/X</a></li>
              <li><a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-foreground">GitHub</a></li>
              <li><a href="https://www.linkedin.com" target="_blank" rel="noreferrer" className="hover:text-foreground">LinkedIn</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 border-t pt-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} AI Trip Planner. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
