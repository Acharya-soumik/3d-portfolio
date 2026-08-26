import { photoSrc } from '../content/gallery-manifest'
import type { PhotoName } from '../content/gallery-manifest'
import type { Project } from '../content/data'

/**
 * The proof frame on a work card, in browser chrome.
 *
 * `shot` may be either a key from the generated photo manifest (drop a file in
 * assets/shots, run `npm run images`) or any absolute URL. Until one is set the
 * frame renders a designed placeholder built from the project's own data — so a
 * card with no image yet still reads as finished rather than broken.
 */
export function ProofShot({ project }: { project: Project }) {
  const { shot, shotLabel, shotPublic, title, sector, visibility, href } = project
  const isUrl = !!shot && /^https?:\/\//.test(shot)
  const src = shot ? (isUrl ? shot : photoSrc(shot as PhotoName, 1280)) : null

  return (
    <figure className="shot">
      <div className="shot-chrome" aria-hidden="true">
        <span className="shot-dot" />
        <span className="shot-dot" />
        <span className="shot-dot" />
        <span className="shot-url mono">
          {href ? href.replace(/^https?:\/\//, '') : sector.toLowerCase()}
        </span>
      </div>

      <div className="shot-frame">
        {src ? (
          /* decoding="async" matters on iOS: a lazy image that starts loading
             as the card enters the viewport otherwise decodes on the main
             thread, mid-scroll, and the frame visibly pops. width/height give
             the 16:9 box its aspect up front so nothing reflows around it. */
          <img
            className="shot-img"
            src={src}
            alt={shotLabel ?? title}
            loading="lazy"
            decoding="async"
            width={1280}
            height={720}
          />
        ) : (
          /* Placeholder: a schematic of an interface, not an empty box. The
             metric is deliberately absent — the card already states it just
             below, and printing it twice reads as a mistake. */
          <div className="shot-placeholder" aria-hidden="true">
            <div className="shot-skeleton">
              <span className="shot-bar shot-bar--wide" />
              <span className="shot-bar" />
              <span className="shot-bar shot-bar--short" />
            </div>
            <div className="shot-grid">
              <span className="shot-block" />
              <span className="shot-block" />
              <span className="shot-block shot-block--tall" />
            </div>
          </div>
        )}
        <span className="shot-sheen" aria-hidden="true" />
      </div>

      <figcaption className="shot-cap mono">
        {shotLabel ?? title}
        {visibility === 'nda' && !shotPublic && (
          <span className="shot-nda"> · internal, not public</span>
        )}
      </figcaption>
    </figure>
  )
}
