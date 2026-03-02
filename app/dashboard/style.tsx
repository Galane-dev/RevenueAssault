import { createStyles } from "antd-style";

export const useStyles = createStyles(({ css }) => ({
  layoutWrapper: css`
    min-height: 100vh;
    background: #000;
  `,

  siderFlexContainer: css`
    display: flex;
    flex-direction: column;
    height: 100%;
    justify-content: space-between;
  `,

  topSection: css`
    flex: 1;
    overflow-y: auto;
    /* Hide scrollbar but allow scrolling if menu is long */
    &::-webkit-scrollbar { display: none; }
    scrollbar-width: none;
  `,

  logo: css`
    padding: 32px 24px;
    color: #fff;
    font-size: 22px;
    font-weight: 700;
    font-family: var(--font-monda);
    letter-spacing: 1px;
  `,

  menu: css`
    background: transparent !important;
    border: none !important;
    
    .ant-menu-item {
      color: #8c8c8c !important;
      font-family: var(--font-monda);
      height: 60px !important; // Larger tiles
      font-size: 18px !important; // Larger text
      margin: 8px 16px !important;
      width: calc(100% - 32px) !important;
      border-radius: 4px !important;
      display: flex;
      align-items: center;

      .anticon {
        font-size: 22px !important; // Larger icons
      }

      &:hover {
        color: #fff !important;
        background: rgba(255, 255, 255, 0.05) !important;
      }
    }

    .ant-menu-item-selected {
      background: #1a1a1a !important;
      color: #fff !important;
      font-weight: 600;
    }
  `,

  bottomSection: css`
    border-top: 1px solid #1a1a1a;
    background: #000;
    padding-bottom: 10px;
  `,

  accountProfile: css`
    padding: 24px;
    background: #050505;
  `,

  userInfo: css`
    display: flex;
    flex-direction: column;
    line-height: 1.4;
  `,

  userName: css`
    color: #fff !important;
    font-weight: 600;
    font-size: 15px;
    font-family: var(--font-monda);
  `,

  userRole: css`
    color: #595959 !important;
    font-size: 12px;
    font-family: var(--font-monda);
  `,

  mainLayout: css`
    background: #000 !important;
    margin-left: 280px; // Matches Sider width
    min-height: 100vh;

    @media (max-width: 992px) {
      margin-left: 0;
    }
  `,

  content: css`
    padding: 40px 60px;
    max-width: 1400px;
    margin: 0 auto;
    width: 100%;

    @media (max-width: 768px) {
      padding: 20px;
    }
  `,

  header: css`
    margin-bottom: 40px;
  `,

  pageTitle: css`
    color: #fff !important;
    font-family: var(--font-monda) !important;
    font-weight: 400 !important;
    letter-spacing: 2px;
  `,

  kpiCard: css`
    background: #000 !important;
    border: 1px solid #7d7d7d !important;
    border-radius: 4px !important;
    height: 100%;
    
    .ant-card-head {
      border-bottom: 1px solid #1a1a1a !important;
      background: transparent;
      min-height: 50px;
      
      .ant-card-head-title {
        color: #e7e7e7;
        text-align: center;
        font-family: var(--font-monda);
        font-size: 14px;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
    }
  `,

  chartPlaceholder: css`
    height: 220px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: radial-gradient(circle, #0a0a0a 0%, #000 70%);
  `,

  tableSection: css`
    margin-top: 60px;
  `,

  sectionTitle: css`
    color: #fff !important;
    font-family: var(--font-monda) !important;
    margin-bottom: 24px !important;
    text-transform: uppercase;
    font-size: 16px !important;
    letter-spacing: 1px;
  `,

  customTable: css`
    .ant-table {
      background: transparent !important;
      border: 1px solid #8d8b8b;
      border-radius: 0;
    }

    .ant-pagination-item-active {
      border-color: #8d8b8b !important;
      background: #000000 !important;
      a { color: #fff !important; }
    }

    .ant-pagination-item, .ant-pagination-prev, .ant-pagination-next {
      background: transparent !important;
      border: 1px solid #444444;
      a { color: #8c8c8c !important; }
    }
  

    .ant-table-thead > tr > th {
      background: #0a0a0a !important;
      color: #e7e7e7 !important;
      border-bottom: 1px solid #8d8b8b !important;
      font-family: var(--font-monda);
      font-size: 12px;
      padding: 16px;
      &::before { display: none !important; }
    }

    .ant-table-tbody > tr > td {
      border-bottom: 1px solid #585858 !important;
      background: #000 !important;
      color: #fff;
      padding: 20px 16px;
      font-family: var(--font-monda);
    }

    .ant-table-placeholder .ant-empty-normal {
      color: #595959;
    }
  `,

    mobileTrigger: css`
  display: none;
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 1001;
  background: #1a1a1a !important;
  border: 1px solid #404040 !important;
  color: #fff !important;
  width: 45px;
  height: 45px;
  border-radius: 4px;

  @media (max-width: 992px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`,

mobileOverlay: css`
  display: none;
  @media (max-width: 992px) {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
    z-index: 999;
  }
`,

sider: css`
  background: #000 !important;
  border-right: 1px solid #1a1a1a;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 1000;
  transition: all 0.2s;

  /* Ensure Sider translates off-screen when collapsed on mobile */
  @media (max-width: 992px) {
    &.ant-layout-sider-collapsed {
      transform: translateX(-100%);
    }
  }
`,


    filterSection: css`
    margin-bottom: 24px;
    display: flex;
    gap: 16px;
  `,

  searchInput: css`
    max-width: 400px;
    background: #0a0a0a !important;
    border: 1px solid #1a1a1a !important;
    color: #fff !important;
    height: 45px;
    border-radius: 4px !important;

    &:hover, &:focus {
      border-color: #404040 !important;
      box-shadow: none !important;
    }

    input {
      background: transparent !important;
      color: #fff !important;
      &::placeholder { color: #595959; }
    }
  `,

  primaryButton: css`
    background: #232323 !important;
    color: #ffffff !important;
    border: #525151 solid 2px !important;
    border-radius: 4px !important;
    font-weight: 600;
    font-family: var(--font-monda);
    height: 35px;
    padding: 0 24px;

    &:hover {
      background: #ffffff !important;
      color: #000 !important;
    }
  `,

  drawerSelectPopup: css`
    .ant-select-item {
      color: #8c8c8c !important;
      font-family: var(--font-monda);
      
      &:hover {
        background: #1a1a1a !important;
        color: #fff !important;
      }
    }
    
    .ant-select-item-option-selected {
      background: #262626 !important;
      color: #fff !important;
      font-weight: 600;
    }

    background-color: #0a0a0a !important;
    border: 1px solid #1a1a1a !important;
    border-radius: 4px;
  `,


}));