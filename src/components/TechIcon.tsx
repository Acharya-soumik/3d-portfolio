import {
  siReact,
  siNextdotjs,
  siTypescript,
  siJavascript,
  siGreensock,
  siThreedotjs,
  siNodedotjs,
  siPython,
  siGraphql,
  siPostgresql,
  siSupabase,
  siMongodb,
  siGooglecloud,
  siVercel,
  siClaude,
  siGithubactions,
  siVerizon,
  siFord,
  siHandm,
  siUpwork,
} from 'simple-icons'
import type { Skill } from '../content/data'

const ICONS: Record<string, { path: string }> = {
  siReact,
  siNextdotjs,
  siTypescript,
  siJavascript,
  siGreensock,
  siThreedotjs,
  siNodedotjs,
  siPython,
  siGraphql,
  siPostgresql,
  siSupabase,
  siMongodb,
  siGooglecloud,
  siVercel,
  siClaude,
  siGithubactions,
  siVerizon,
  siFord,
  siHandm,
  siUpwork,
}

/** Bare brand/tech SVG by simple-icons key; renders nothing for unknown keys. */
export function IconSvg({ icon, className }: { icon?: string; className?: string }) {
  const found = icon ? ICONS[icon] : undefined
  if (!found) return null
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d={found.path} fill="currentColor" />
    </svg>
  )
}

export function TechIcon({ skill }: { skill: Skill }) {
  if (skill.icon && ICONS[skill.icon]) {
    return <IconSvg icon={skill.icon} className="tech-icon" />
  }
  return (
    <span className="tech-glyph" aria-hidden="true">
      {skill.glyph ?? skill.name.charAt(0)}
    </span>
  )
}
