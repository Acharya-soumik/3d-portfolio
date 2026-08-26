/**
 * The section eyebrow.
 *
 * It used to be one line of 0.72rem tracked caps — correct, and completely
 * inert. These are the page's chapter breaks and they were reading as captions.
 *
 * The numeral does the work now: set in the display face at headline scale, it
 * gives the mark weight without competing with the section's actual headline,
 * which is the other thing living in this space. The number is legitimate
 * structure rather than decoration — the page IS a sequence, and these are the
 * same numbers the nav counts off.
 *
 * The rule running out to the right is what makes it read as a chapter opening
 * rather than a label: it draws the eye across the full measure and gives the
 * section a visible starting line.
 */
export function SectionMark({
  n,
  children,
  className,
}: {
  /** Omitted for the interstitial sections the nav doesn't count. */
  n?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <p className={`eyebrow${className ? ` ${className}` : ''}`}>
      {n && <span className="eyebrow-num">{n}</span>}
      <span className="eyebrow-text">{children}</span>
      <span className="eyebrow-rule" aria-hidden="true" />
    </p>
  )
}
