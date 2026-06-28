"use client";

import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import styles from "./HeadhuntingSelectClient.module.css";

export function HeadhuntingSelectClient() {
  return (
    <main className={styles.main}>
      <div className={`app-shell ${styles.shell}`}>
        <PageHeader
          breadcrumbLabel="헤드헌팅"
          eyebrow="THE PHARMA HEADHUNTING"
          title="좋은 자리도, 좋은 사람도 먼저 찾아드립니다"
          description="제약·바이오 전문 헤드헌팅, 더파마 리크루트로 시작하세요."
        />

        <div className={styles.choices} role="group" aria-label="헤드헌팅 회원 유형 선택">
          <Link
            className={`${styles.card} ${styles.cardPerson}`}
            href="/mypage/resume"
            aria-label="개인 회원으로 시작하기"
          >
            <div
              className={`${styles.cardPhoto} ${styles.cardPhotoPerson}`}
              style={{ backgroundImage: "url(/images/headhunting-person-handshake.jpg)" }}
              aria-hidden="true"
            />
            <span className={styles.cardType}>개인 회원</span>
            <p className={styles.cardSub}>이력서를 등록하고 기업·헤드헌터의 제안을 받습니다.</p>
            <span className={`${styles.cardAction} ${styles.actionGradient}`}>
              제안 받기 시작
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </span>
          </Link>

          <Link
            className={`${styles.card} ${styles.cardBiz}`}
            href="/business/headhunting"
            aria-label="기업 회원으로 시작하기"
          >
            <div
              className={`${styles.cardPhoto} ${styles.cardPhotoBiz}`}
              style={{ backgroundImage: "url(/images/headhunting-company-skyline.jpg)" }}
              aria-hidden="true"
            />
            <span className={`${styles.cardType} ${styles.cardTypeBiz}`}>기업 회원</span>
            <p className={`${styles.cardSub} ${styles.cardSubBiz}`}>필요한 인재를 더파마가 직접 발굴해 추천합니다.</p>
            <span className={`${styles.cardAction} ${styles.cardActionBiz}`}>
              인재 찾기 시작
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </span>
          </Link>
        </div>

      </div>
    </main>
  );
}
