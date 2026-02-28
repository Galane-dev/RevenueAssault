import { createStyles, keyframes } from "antd-style";

const rollUp = keyframes`
  0%, 20% { transform: translateY(0); }
  25%, 45% { transform: translateY(-25%); }
  50%, 70% { transform: translateY(-50%); }
  75%, 95% { transform: translateY(-75%); }
  100% { transform: translateY(0); }
`;

const drift = keyframes`
  0% { transform: translate(-40px, -30px) scale(0.98) rotate(-0.6deg); }
  100% { transform: translate(40px, 30px) scale(1.02) rotate(0.6deg); }
`;

export const useStyles = createStyles(({ css }) => ({
  landingWrapper: css`
    background-color: #000;
    min-height: 100vh;
    color: white;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
    isolation: isolate;
    font-family: var(--font-monda);
  `,

  smokeContainer: css`
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    background: #000;
    opacity: 0.7;
    z-index: 0;
    pointer-events: none;
  `,

  smokeSvg: css`
    width: 100%;
    height: 100%;
    transform: translateZ(0);
  `,

  backgroundVeil: css`
    position: absolute;
    inset: 0;
    z-index: 1;
    pointer-events: none;
    background:
      radial-gradient(circle at 70% 20%, rgba(255, 255, 255, 0.05), transparent 45%),
      linear-gradient(115deg, rgba(0, 0, 0, 0.72) 15%, rgba(0, 0, 0, 0.45) 55%, rgba(0, 0, 0, 0.75) 100%);
  `,

  smokePath: css`
    fill: none;
    stroke: #fff;
    stroke-linecap: round;
    animation: ${drift} 14s ease-in-out infinite alternate;
    will-change: transform;

    @media (prefers-reduced-motion: reduce) {
      animation: none;
    }
  `,

  core: css`
    stroke-opacity: 0.07;
    stroke-width: 92px;
  `,

  bridge: css`
    stroke-opacity: 0.14;
    stroke-width: 34px;
  `,

  strand: css`
    stroke-opacity: 0.28;
    stroke-width: 8px;
  `,

  d1: css`
    animation-duration: 16s;
  `,

  d2: css`
    animation-duration: 20s;
    animation-delay: -2s;
  `,

  d3: css`
    animation-duration: 18s;
    animation-delay: -4s;
  `,

  d4: css`
    animation-duration: 22s;
    animation-delay: -6s;
  `,

  navbar: css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 60px;
    z-index: 10;
    font-family: var(--font-monda);
  `,

  logo: css`
    font-size: 24px;
    font-weight: 700;
    font-family: var(--font-monda);
    letter-spacing: 2.3px;
  `,

  hero: css`
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 0 60px;
    /* This pushes the content down from the center slightly */
    margin-top: 80px;
    position: relative;
    z-index: 2;
    font-family: var(--font-monda);
    letter-spacing: 1px;
  `,

  /* The "Window" for the animation - height accommodates two lines */
  textFlipper: css`
    height: 200px; 
    overflow: hidden;
    margin-bottom: 20px;
  `,

  flipperInner: css`
    display: flex;
    flex-direction: column;
    animation: ${rollUp} 12s cubic-bezier(0.85, 0, 0.15, 1) infinite;
  `,

  /* Each block containing the two lines */
  flipBlock: css`
    height: 200px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  `,

  textLine: css`
    font-size: 90px;
    font-weight: 800;
    line-height: 1;
    text-transform: uppercase;
    margin: 0;
    letter-spacing: 10px;
    text-shadow: 0 10px 28px rgba(0, 0, 0, 0.6);
  `,

  outline: css`
    color: transparent;
    -webkit-text-stroke: 1px rgba(255, 255, 255, 0.85);
  `,

  solid: css`
    color: white;
  `,

  descriptionWrapper: css`
    max-width: 500px;
    margin-top: 40px;
    padding: 14px 18px;
    padding-left: 20px;
    border-left: 1px solid rgba(255, 255, 255, 0.3);
    background: rgba(0, 0, 0, 0.35);
    backdrop-filter: blur(2px);
    
    p {
      color: #d2d2d2;
      font-size: 16px;
      line-height: 1.6;
      margin: 0;
      letter-spacing: 0.5px;
    }
  `,

  ctaBtn: css`
    margin-top: 40px;
    background: rgba(0, 0, 0, 0.35);
    border: 1px solid white;
    color: white;
    padding: 12px 35px;
    height: auto;
    font-size: 16px;
    border-radius: 0;
    width: fit-content; /* Prevents full width */
    text-transform: none;
    transition: all 0.3s;

    &:hover {
      background: white !important;
      color: black !important;
      border-color: white !important;
    }
  `,

  policy: css`
    position: absolute;
    bottom: 30px;
    right: 60px;
    z-index: 2;
    color: #9a9a9a;
    font-size: 14px;
    text-decoration: none;
    transition: color 0.3s;
    &:hover {
      color: white;
    }
  `,
}));