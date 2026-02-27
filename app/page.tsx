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
            Connectivity powers our lives, strengthens communities and drives
            progress. When everyone is connected, we can create a future full of
            possibilities.
          </p>
        </div>

        <Link href="/dashboard" passHref>
  <Button className={styles.ctaBtn}>
    Continue to Dashboard
  </Button>
</Link>
      </section>

      <a href="#" className={styles.policy}>Policy</a>
    </div>
  );
}