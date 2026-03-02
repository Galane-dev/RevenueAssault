'use client';

import React, { useMemo } from 'react';
import { Button, Card, Progress, Space, Tag, Typography } from 'antd';
import {
  AlertOutlined,
  CheckCircleOutlined,
  RiseOutlined,
  RobotOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { createStyles } from 'antd-style';
import type { IDashboardOverview } from '@/app/providers/dashboardProvider/context';

const { Text } = Typography;

const useAISummaryStyles = createStyles(({ css }) => ({
  card: css`
    position: relative;
    overflow: hidden;
    border: 1px solid #2a2a2a !important;
    border-radius: 10px !important;
    background: linear-gradient(180deg, #090909 0%, #060606 100%);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04), 0 12px 28px rgba(0, 0, 0, 0.35);

    &::before {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent, rgba(200, 200, 200, 0.7), transparent);
      pointer-events: none;
      opacity: 0.85;
    }

    .ant-card-body {
      position: relative;
      z-index: 1;
      padding: 22px;
    }
  `,

  topRow: css`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
    flex-wrap: wrap;
  `,

  titleWrap: css`
    display: flex;
    flex-direction: column;
    gap: 4px;
  `,

  signalLine: css`
    display: flex;
    align-items: center;
    gap: 8px;
  `,

  pulseDot: css`
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #b7b7b7;
    box-shadow: 0 0 10px rgba(86, 87, 85, 0.6);
    animation: ai-pulse 1.8s ease-in-out infinite;

    @keyframes ai-pulse {
      0%,
      100% {
        transform: scale(1);
        opacity: 0.8;
      }
      50% {
        transform: scale(1.45);
        opacity: 1;
      }
    }
  `,

  chip: css`
    border: 1px solid #2f2f2f !important;
    background: #111 !important;
    color: #cfcfcf !important;
    font-family: var(--font-monda);
    letter-spacing: 0.3px;
  `,

  leadText: css`
    color: #f0f0f0;
    font-family: var(--font-monda);
    display: block;
    margin: 14px 0 16px;
    line-height: 1.55;
  `,

  insightGrid: css`
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
    margin-bottom: 14px;

    @media (max-width: 992px) {
      grid-template-columns: 1fr;
    }
  `,

  insightBox: css`
    border: 1px solid #2f2f2f;
    border-radius: 8px;
    background: #0d0d0d;
    padding: 12px;
    min-height: 84px;

    .label {
      color: #8c8c8c;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-bottom: 6px;
      display: block;
    }

    .value {
      color: #fff;
      font-size: 18px;
      font-weight: 600;
      font-family: var(--font-monda);
    }
  `,

  footer: css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
  `,

 confidence: css`
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;             /* Added: Allow this section to take up available space */
    min-width: 250px;    /* Added: Prevent it from getting too small on mid-sized screens */

    .ant-progress {
      flex: 1;           /* Added: Let the progress component fill the middle */
      max-width: 200px;  /* Optional: Cap the width so it doesn't get TOO long */
      margin-bottom: 0;
    }
  `,

  button: css`
    border-color: #3a3a3a !important;
    color: #f2f2f2 !important;
    background: #151515 !important;

    &:hover {
      border-color: #5b5b5b !important;
      color: #ffffff !important;
      background: #1d1d1d !important;
    }
  `,
}));

interface DashboardOpportunity {
  id?: string;
  clientName?: string;
  stage?: number;
  probability?: number;
  estimatedValue?: number;
}

interface AISummaryCardProps {
  overview: IDashboardOverview | null;
  recentOpportunities: DashboardOpportunity[];
  onAskAI?: () => void;
}

export const AISummaryCard: React.FC<AISummaryCardProps> = ({
  overview,
  recentOpportunities,
  onAskAI,
}) => {
  const { styles } = useAISummaryStyles();

  const summary = useMemo(() => {
    const winRate = overview?.opportunities?.winRate ?? 0;
    const pipelineValue = overview?.opportunities?.pipelineValue ?? 0;
    const activeContracts = overview?.contracts?.totalActiveCount ?? 0;
    const overdue = overview?.activities?.overdueCount ?? 0;

    const riskOpportunities = recentOpportunities.filter(
      (opportunity) => (opportunity.probability ?? 0) > 0 && (opportunity.probability ?? 0) < 45
    ).length;

    const totalRecentValue = recentOpportunities.reduce(
      (accumulator, opportunity) => accumulator + (opportunity.estimatedValue ?? 0),
      0
    );

    const evidenceSignals = [
      !!overview?.opportunities,
      !!overview?.contracts,
      !!overview?.activities,
      (overview?.revenue?.monthlyTrend?.length ?? 0) > 0,
    ].filter(Boolean).length;

    const confidence = overview ? Math.max(45, Math.round((evidenceSignals / 4) * 100)) : 0;

    let headline =
      'Signal quality is stable. Pipeline momentum is positive, with execution indicators in healthy range.';

    if (overdue > 0) {
      headline = `Execution risk detected: ${overdue} overdue task${overdue === 1 ? '' : 's'} may slow deal velocity.`;
    } else if (winRate >= 50 && pipelineValue > 0) {
      headline = 'Strong conversion pattern detected. Current win-rate and pipeline depth indicate upward trajectory.';
    } else if (pipelineValue === 0) {
      headline = 'Pipeline data is thin. Add or update active opportunities to improve AI forecasting precision.';
    }

    return {
      winRate,
      activeContracts,
      totalRecentValue,
      riskOpportunities,
      confidence,
      headline,
    };
  }, [overview, recentOpportunities]);

  return (
    <Card className={styles.card}>
      <div className={styles.topRow}>
        <div className={styles.titleWrap}>
          <Space className={styles.signalLine}>
            <span className={styles.pulseDot} />
            <Text style={{ color: '#555555', fontFamily: 'var(--font-monda)', fontSize: 12 }}>
              AI SYNTHESIS ENGINE
            </Text>
          </Space>
          <Text style={{ color: '#fff', fontSize: 19, fontFamily: 'var(--font-monda)', letterSpacing: 0.3 }}>
            Dashboard Neural Summary
          </Text>
        </div>
        <Tag className={styles.chip} icon={<ThunderboltOutlined />}>
          ADVANCED ANALYSIS
        </Tag>
      </div>

      <Text className={styles.leadText}>{summary.headline}</Text>

      <div className={styles.insightGrid}>
        <div className={styles.insightBox}>
          <Text className="label">
            <RiseOutlined /> Conversion Signal
          </Text>
          <Text className="value">{summary.winRate.toFixed(1)}%</Text>
        </div>
        <div className={styles.insightBox}>
          <Text className="label">
            <CheckCircleOutlined /> Active Contracts
          </Text>
          <Text className="value">{summary.activeContracts}</Text>
        </div>
        <div className={styles.insightBox}>
          <Text className="label">
            <AlertOutlined /> At-Risk Deals
          </Text>
          <Text className="value">{summary.riskOpportunities}</Text>
        </div>
      </div>

      <div className={styles.footer}>
        <div className={styles.confidence}>
          <Text style={{ color: '#8c8c8c', fontSize: 12, textTransform: 'uppercase' }}>Model Confidence</Text>
          <Progress
            percent={summary.confidence}
            showInfo={false}
            size="small"
            strokeColor={{ '0%': '#3d3d3d', '100%': '#52c41a' }}
            trailColor="#1f1f1f"
          />
          <Text style={{ color: '#fff' }}>{summary.confidence}%</Text>
        </div>
        <Space>
          <Tag style={{ background: '#111', color: '#d9d9d9', border: '1px solid #303030' }}>
            Recent Value: ZAR {summary.totalRecentValue.toLocaleString()}
          </Tag>
          <Button icon={<RobotOutlined />} className={styles.button} onClick={onAskAI}>
            Deep Dive
          </Button>
        </Space>
      </div>
    </Card>
  );
};

export default AISummaryCard;