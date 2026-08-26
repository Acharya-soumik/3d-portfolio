import { rangePlate } from '../content/data'
import type { Project } from '../content/data'

/**
 * The hero's range plate.
 *
 * The card used to answer "what did you achieve?" — one outcome per cycle.
 * This answers "how wide is the range?", which a carousel is a poor instrument
 * for: showing one thing at a time is the opposite of showing breadth.
 *
 * It went through a wordier draft first — every token of all three
 * vocabularies, set as a list. That put twenty-one words on screen at once,
 * and a well-set word list is still a word list: you have to READ it before
 * the breadth registers. So the vocabulary became a SCALE. Each dimension is a
 * rail of ticks, one per value, and only what is live gets named. The count
 * lands at a glance, on three words of copy instead of twenty-one, and the
 * travelling mark does the rest as the cases cycle.
 *
 * The words stay in the DOM for screen readers and for anyone searching the
 * page — they just stop asking for the reader's eye.
 *
 * Every token comes from `rangePlate`, which is derived from the cases
 * themselves — nothing can appear here that no project backs.
 */

/** One dimension: a rail of ticks, its count, and whatever is live named. */
function Row({
  label,
  tokens,
  live,
}: {
  label: string
  tokens: string[]
  /** May be more than one — a project is often several surfaces at once. */
  live: string[]
}) {
  return (
    <div className="range-row">
      <p className="range-key mono">
        {label}
        <span className="range-count">{tokens.length}</span>
      </p>
      {/* the scale carries no text, so the vocabulary has to stay reachable to
          assistive tech and to anyone searching the page some other way */}
      <p className="sr-only">
        {label}: {tokens.join(', ')}.
      </p>
      <div className="range-rail" aria-hidden="true">
        {tokens.map((t) => (
          <span className={`range-tick${live.includes(t) ? ' is-on' : ''}`} key={t} />
        ))}
      </div>
      <p className="range-live">{live.join(' · ')}</p>
    </div>
  )
}

/**
 * `cases` are all stacked in one grid cell with only the active one visible —
 * the same trick the old ledger used, and for the same reason: swapping the
 * copy in normal flow would change the card's height every few seconds, which
 * changes the hero's height, which invalidates the section anchors the scroll
 * engine measured. The card's height is the tallest case, permanently.
 */
export function RangePlate({ cases, active }: { cases: Project[]; active: number }) {
  const project = cases[active]
  return (
    <>
      <div className="range-plate">
        <Row label="Sectors" tokens={rangePlate.sectors} live={[project.sector]} />
        <Row label="Roles" tokens={rangePlate.roles} live={project.roles} />
        <Row label="Surfaces" tokens={rangePlate.surfaces} live={project.surfaces} />
      </div>

      {/* the case underneath — support for the plate, not the headline */}
      <div className="range-now">
        {cases.map((c, i) => (
          <article
            className={`range-case${i === active ? ' is-active' : ''}`}
            key={c.index}
            aria-hidden={i !== active}
          >
            {/* deliberately NOT the coordinates — the plate is already
                lighting those, and printing them twice is just noise. The
                company and the year are the one thing the plate can't say. */}
            <p className="range-who mono">
              {c.role} · {c.period}
            </p>
            <p className="range-arc">
              {c.came}
              <span className="range-arc-turn" aria-hidden="true">
                →
              </span>
              <span className="range-arc-out">{c.shipped}</span>
            </p>
            <p className="range-metric">
              {c.metric}
              <span className="mono">{c.metricLabel}</span>
            </p>
          </article>
        ))}
      </div>
    </>
  )
}
