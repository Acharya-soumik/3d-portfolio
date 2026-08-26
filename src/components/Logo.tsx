/**
 * The logo mark — the "SOUMIK" lightbulb wordmark badge. Used everywhere the
 * old circular monogram was (nav, footer, preloader).
 *
 * It's a wide horizontal lockup, so it sizes by height with the width left to
 * follow the 663×218 aspect. The scroll-linked spin the round badge used to do
 * is gone — a wordmark rotating past 90° just reads as broken — but the hover
 * tilt stays.
 */
export function Logo({ size = 'nav' }: { size?: 'nav' | 'footer' | 'loader' }) {
  return (
    <img
      className={`logo-mark logo-mark--${size}`}
      src="/logo.png"
      alt="Soumik Acharjee"
      width={663}
      height={218}
    />
  )
}
