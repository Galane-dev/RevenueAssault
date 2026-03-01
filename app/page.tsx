"use client";

import React from "react";
import { Button } from "antd";
import { useStyles } from "./style";
import Link from "next/link";

export default function LandingPage() {
  const { styles, cx } = useStyles();

  // Each entry is split into [topLine, bottomLine]
  const phrases = [
    ["Sales", "Automation"],
    ["Pipeline", "Tracking"],
    ["Deadline", "Monitoring"],
    ["Reporting", "Dashboards"]
  ];

  return (
    <div className={styles.landingWrapper}>
      <div className={styles.smokeContainer} aria-hidden="true">
        <svg
          className={styles.smokeSvg}
          viewBox="0 0 1200 800"
          preserveAspectRatio="xMidYMid slice"
        >
          <path
            className={cx(styles.smokePath, styles.core, styles.d1)}
            d="M-100,400 Q400,100 800,500 T1300,400"
          />
          <path
            className={cx(styles.smokePath, styles.core, styles.d2)}
            d="M-100,350 Q300,600 700,200 T1300,450"
          />

          <path
            className={cx(styles.smokePath, styles.bridge, styles.d3)}
            d="M-100,420 C200,200 500,600 800,400 S1200,200 1300,420"
          />
          <path
            className={cx(styles.smokePath, styles.bridge, styles.d4)}
            d="M-100,390 C180,560 470,140 760,390 S1150,560 1300,390"
          />

          <path
            className={cx(styles.smokePath, styles.strand, styles.d1)}
            d="M-100,390 C250,250 550,550 850,390 S1250,250 1300,390"
          />
          <path
            className={cx(styles.smokePath, styles.strand, styles.d2)}
            d="M-100,410 Q300,100 600,410 T1300,410"
          />
          <path
            className={cx(styles.smokePath, styles.strand, styles.d3)}
            d="M-100,370 C200,600 500,200 800,370 S1100,600 1300,370"
          />
        </svg>
      </div>
      <div className={styles.backgroundVeil} aria-hidden="true" />

      <section className={styles.hero}>
        <div className={styles.textFlipper}>
          <div className={styles.flipperInner}>
            {phrases.map((pair, index) => (
              <div key={index} className={styles.flipBlock}>
                <h1 className={cx(styles.textLine, styles.outline)}>
                  {pair[0]}
                </h1>
                <h1 className={cx(styles.textLine, styles.solid)}>
                  {pair[1]}
                </h1>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.descriptionWrapper}>
          <p>
            Control the pipeline. Eliminate blind spots. Execute with force. 
            When every opportunity is monitored with ruthless precision, 
            growth stops being hopeful and becomes engineered.
          </p>
        </div>

        <Link href="/dashboard" passHref>
          <Button className={styles.ctaBtn}>Continue to Dashboard</Button>
        </Link>
      </section>

      <a href="#" className={styles.policy}>Policy</a>
    </div>
  );
}