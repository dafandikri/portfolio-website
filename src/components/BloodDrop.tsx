import './BloodDrop.css'

/**
 * A drop of blood falls onto the card and soaks into it.
 *
 * The card is a straight-faced parody of Patrick Bateman's, and this is the
 * punchline — held back until the card has finished landing and its fields have
 * finished revealing, so it reads as a beat rather than as decoration.
 *
 * Entirely decorative, so the whole thing is hidden from assistive technology.
 */
export default function BloodDrop() {
  return (
    <div className="blood" aria-hidden="true">
      {/*
        Roughens the pool's outline. A smooth-edged red shape reads as a sticker
        laid on the card; liquid soaking into cotton stock creeps unevenly along
        the fibres, and displacing the edge with fractal noise is what reads as
        absorbed rather than applied. Same primitive as the paper grain, so the
        two materials agree with each other.
      */}
      <svg className="blood__defs" aria-hidden="true" focusable="false">
        <defs>
          <filter id="blood-wick" x="-40%" y="-40%" width="180%" height="180%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.042"
              numOctaves="3"
              seed="7"
              result="wickNoise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="wickNoise"
              scale="17"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
          {/*
            Darker and browner than the colour people reach for. Fresh blood on
            white paper is nowhere near #f00; it sits near #6d0202 and oxidises
            browner as it dries and spreads, so the rim is thinner and warmer
            than the core.
          */}
          <radialGradient id="blood-fill" cx="44%" cy="40%" r="64%">
            <stop offset="0%" stopColor="#5e0202" />
            <stop offset="48%" stopColor="#760a04" />
            <stop offset="100%" stopColor="#5c1608" />
          </radialGradient>
          {/*
            Shape and fill are kept separate. Filling each lobe with its own
            gradient puts three gradient centres where they overlap, and the
            displacement map then drags those internal seams into what look
            like holes in the stain. Masking one gradient-filled rect with the
            union of the lobes leaves a single continuous fill and no interior
            edges for the noise to expose.
          */}
          <mask id="blood-mass">
            <ellipse cx="97" cy="61" rx="42" ry="27" fill="#fff" />
            <ellipse cx="118" cy="54" rx="24" ry="19" fill="#fff" />
            <ellipse cx="79" cy="70" rx="20" ry="15" fill="#fff" />
          </mask>
        </defs>
      </svg>

      {/* Falls, stretching as it accelerates. */}
      <span className="blood__drip" />

      <svg className="blood__pool" viewBox="0 0 200 120" aria-hidden="true" focusable="false">
        <g filter="url(#blood-wick)">
          {/*
            The mass: three overlapping lobes rather than one ellipse, because a
            single ellipse survives displacement still looking like an ellipse —
            a wax seal rather than a spill.
          */}
          <rect width="200" height="120" fill="url(#blood-fill)" mask="url(#blood-mass)" />
          {/* Sparse spatter from the impact. Asymmetric on purpose. */}
          <ellipse cx="155" cy="42" rx="6.5" ry="4.8" fill="#5e0202" opacity="0.85" />
          <ellipse cx="38" cy="80" rx="5" ry="3.8" fill="#5e0202" opacity="0.74" />
          <ellipse cx="139" cy="92" rx="3.6" ry="2.8" fill="#5c1608" opacity="0.62" />
          <ellipse cx="57" cy="33" rx="3" ry="2.4" fill="#5c1608" opacity="0.52" />
          <ellipse cx="168" cy="70" rx="2.4" ry="2" fill="#5c1608" opacity="0.45" />
        </g>
      </svg>
    </div>
  )
}
