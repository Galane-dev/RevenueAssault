import { createStyles, keyframes } from "antd-style";

const rollUp = keyframes`
  0%, 20% { transform: translateY(0); }
  25%, 45% { transform: translateY(-25%); }
  50%, 70% { transform: translateY(-50%); }
  75%, 95% { transform: translateY(-75%); }
  100% { transform: translateY(0); }
`;

export const useStyles = createStyles(({ css }) => ({
  landingWrapper: css`
    background-color: #000;
    min-height: 100vh;
    color: white;
    background: url('https://img.freepik.com/premium-photo/wave-white-smoke-is-blowing-wind_994023-120187.jpg?semt=ais_user_personalization&w=740&q=80') no-repeat center center;
    background-size: cover;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
    font-family: var(--font-monda);
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
  `,

  outline: css`
    color: transparent;
    -webkit-text-stroke: 1px rgba(255, 255, 255, 0.7);
  `,

  solid: css`
    color: white;
  `,

  descriptionWrapper: css`
    max-width: 500px;
    margin-top: 40px;
    padding-left: 20px;
    border-left: 1px solid rgba(255, 255, 255, 0.3);
    
    p {
      color: #aaa;
      font-size: 16px;
      line-height: 1.6;
      margin: 0;
      letter-spacing: 0.5px;
    }
  `,

  ctaBtn: css`
    margin-top: 40px;
    background: transparent;
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
    color: #666;
    font-size: 14px;
    text-decoration: none;
    transition: color 0.3s;
    &:hover {
      color: white;
    }
  `,
}));