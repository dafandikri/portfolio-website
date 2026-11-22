import './ScrollCue.css'

export default function ScrollCue({ ready }: { ready: boolean }) {
  return (
    <svg
      className={`scroll-cue${ready ? ' is-ready' : ''}`}
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 4v16m-6-6 6 6 6-6" />
    </svg>
  )
}
