import { createStyles } from "antd-style";

export const useStyles = createStyles(({ css }) => ({
  drawerHeader: css`
    background: #262626 !important;
    border-bottom: 1px solid #434343 !important;

    .ant-drawer-title {
      color: #fff;
      font-family: var(--font-monda);
      font-weight: 600;
    }
  `,

  drawerBody: css`
    background: #1f1f1f !important;
    padding: 16px !important;
  `,

  messagesContainer: css`
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow-y: auto;
    margin-bottom: 16px;
    padding-right: 8px;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: #434343;
      border-radius: 3px;

      &:hover {
        background: #595959;
      }
    }
  `,

  messageGroup: css`
    margin-bottom: 12px;
    display: flex;
    animation: slideIn 0.3s ease-in-out;

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `,

  userMessage: css`
    justify-content: flex-end;
  `,

  assistantMessage: css`
    justify-content: flex-start;
  `,

  messageBubble: css`
    max-width: 85%;
    padding: 10px 12px;
    border-radius: 8px;
    word-wrap: break-word;
    white-space: pre-wrap;
    position: relative;
    font-family: var(--font-monda);
    font-size: 14px;
    line-height: 1.5;
  `,

  userBubble: css`
    background: #595959;
    color: #ffffff;
    border: none;
  `,

  assistantBubble: css`
    background: #262626;
    color: #ffffff;
    border: 1px solid #434343;
  `,

  messageActions: css`
    opacity: 0;
    transition: opacity 0.2s;
    margin-top: 4px;

    &:hover {
      opacity: 1;
    }
  `,

  emptyState: css`
    color: #8c8c8c !important;
    margin-top: 40px;
  `,

  inputContainer: css`
    margin-bottom: 8px;

    .ant-input-textarea {
      background: #262626 !important;
      border: 1px solid #434343 !important;
      color: #ffffff !important;
      border-radius: 4px !important;

      textarea {
        background: transparent !important;
        color: #ffffff !important;
        font-family: var(--font-monda);
        font-size: 13px;

        &::placeholder {
          color: #595959;
        }

        &:focus {
          border-color: #595959 !important;
          box-shadow: none !important;
        }
      }

      &:hover {
        border-color: #595959 !important;
      }
    }
  `,

  actionButtons: css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;

    .ant-btn {
      font-family: var(--font-monda);
      font-size: 13px;
      height: 32px;
      border-radius: 4px;

      &.ant-btn-primary {
        background: #595959 !important;
        border: 1px solid #595959 !important;

        &:hover {
          background: #7d7d7d !important;
          border-color: #7d7d7d !important;
        }

        &:disabled {
          background: #434343 !important;
          border-color: #434343 !important;
          color: #8c8c8c !important;
          cursor: not-allowed;
        }
      }

      &.ant-btn-text {
        color: #8c8c8c;

        &:hover {
          color: #ffffff;
          background: transparent;
        }

        &.ant-btn-dangerous {
          color: #ff4d4f;

          &:hover {
            color: #ff7875;
          }
        }

        &:disabled {
          color: #595959 !important;
          cursor: not-allowed;
        }
      }
    }
  `,

  divider: css`
    border-color: #434343 !important;
    margin: 12px 0 !important;
  `,

  tagContainer: css`
    display: inline-block;
    margin-left: 8px;

    .ant-tag {
      background: #1a5f7a !important;
      border: none !important;
      color: #5cdbd3 !important;
      font-family: var(--font-monda);
      font-size: 12px;
    }
  `,

  copyButton: css`
    opacity: 0;
    transition: opacity 0.2s;
    color: #8c8c8c;

    &:hover {
      color: #ffffff;
    }

    &.copied {
      color: #52c41a;
    }
  `,

  spinnerWrapper: css`
    display: flex;
    justify-content: flex-start;
    margin-bottom: 12px;

    .ant-spin-spinning {
      color: #595959 !important;
    }
  `,
}));
