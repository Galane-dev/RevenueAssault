import { createStyles } from "antd-style";

export const useStyles = createStyles(({ css }) => ({
  navbar: css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 30px 60px;
    position: absolute; /* Keeps it over hero backgrounds */
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    background: transparent;

    @media (max-width: 768px) {
      padding: 20px 30px;
    }
  `,

  logo: css`
    font-size: 24px;
    font-weight: 700;
    letter-spacing: -0.5px;
    color: white;
    text-decoration: none;
    font-spacing: 2.3px;
  `,

  navLinks: css`
    display: flex;
    gap: 40px;
    
    a {
      font-family: var(--font-monda);
      font-size: 16px;
      transition: color 0.3s;
      text-decoration: none;
    }
  `,
}));