import { createStyles } from "antd-style";

export const useStyles = createStyles(({ css }) => ({
  loginWrapper: css`
    background-color: #000;
    min-height: 100vh;
    color: white;
    font-family: var(--font-monda), sans-serif;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow-x: hidden;
  `,

  navbar: css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 30px 60px;
    z-index: 10;

    @media (max-width: 768px) {
      padding: 20px 30px;
    }
  `,

  logo: css`
    font-size: 24px;
    font-weight: 700;
    letter-spacing: -0.5px;
  `,

  mainContent: css`
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
  `,

  title: css`
    font-family: var(--font-monda);
    font-size: 42px;
    font-weight: 400;
    margin-bottom: 60px;
    color: #fff;
    text-align: center;

    @media (max-width: 576px) {
      font-size: 28px;
      margin-bottom: 40px;
    }
  `,

  formImageContainer: css`
    display: flex;
    align-items: center;
    gap: 100px;
    max-width: 1200px;
    width: 100%;
    justify-content: center;

    @media (max-width: 992px) {
      gap: 0;
    }
  `,

  // MERGED VERSION OF FORMSECTION
  formSection: css`
    width: 100%;
    max-width: 320px;
    display: flex;
    flex-direction: column;
    /* Gap removed as Form.Item handles margins, but internal logic remains */

    .ant-form-item {
      margin-bottom: 15px;
    }

    .ant-form-item-explain-error {
      font-family: var(--font-monda);
      font-size: 12px;
      margin-top: 4px;
      color: #ff4d4f;
    }

    /* Styling Ant Design Inputs to match the dark theme */
    .ant-input-affix-wrapper,
    .ant-input {
      background-color: #0a0a0a !important;
      border: 1px solid #404040 !important;
      color: #fff !important;
      border-radius: 0;
      padding: 12px 15px;
      font-family: var(--font-monda);

      input {
        background-color: transparent !important;
        color: #fff !important;
        font-family: var(--font-monda);
      }

      &::placeholder {
        color: #929090;
      }

      &:hover,
      &:focus,
      &-focused {
        border-color: #b9b9b9 !important;
        box-shadow: none !important;
      }
    }

    .ant-input-password-icon {
      color: #444 !important;
      &:hover {
        color: #fff !important;
      }
    }
  `,

  loginBtn: css`
    background-color: transparent !important;
    border: 1px solid #828282 !important;
    color: #fff !important;
    border-radius: 0;
    height: 50px;
    font-family: var(--font-monda);
    font-size: 16px;
    text-transform: none;
    margin-top: 10px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
      background-color: #fff !important;
      color: #000 !important;
      border-color: #fff !important;
    }
  `,

  dividerContainer: css`
    display: flex;
    align-items: center;
    width: 100%;
    margin: 15px 0;

    &::before,
    &::after {
      content: "";
      flex: 1;
      height: 1px;
      background: #858585;
    }

    span {
      padding: 0 15px;
      color: #c0bebe;
      font-size: 14px;
      font-family: var(--font-monda);
    }
  `,

  createAccountLink: css`
    text-align: center;
    color: #fff;
    text-decoration: none;
    font-size: 16px;
    font-family: var(--font-monda);
    transition: opacity 0.3s;

    &:hover {
      opacity: 0.7;
      text-decoration: underline;
    }
  `,

  imageWrapper: css`
    position: relative;
    display: block;

    @media (max-width: 992px) {
      display: none;
    }
  `,

  handshakeImage: css`
    filter: grayscale(1) contrast(1.1);
    opacity: 0.8;
    object-fit: contain;
  `,
}));