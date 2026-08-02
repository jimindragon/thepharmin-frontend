"use client";

import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import styles from "./SignupTypeSelectClient.module.css";

/** STEP A — 가입 유형 선택. 헤드헌팅 분기 페이지(/headhunting/select)와 같은 좌우 대비 카드 문법을 쓴다. */
export function SignupTypeSelectClient() {
  return (
    <>
      <main className={styles.main}>
        <div className={`app-shell ${styles.shell}`}>
          <PageHeader
            breadcrumbLabel="기업회원 가입"
            eyebrow="기업회원 가입"
            title="가입 유형을 선택해 주세요"
            description="유형에 따라 필요한 인증 절차가 다릅니다."
          />

          <div className={styles.choices} role="group" aria-label="가입 유형 선택">
            <Link
              className={`${styles.card} ${styles.cardLight}`}
              href="/business/signup/company"
              aria-label="기업·병원·연구기관으로 가입하기"
            >
              <div
                className={`${styles.cardPhoto} ${styles.cardPhotoLight}`}
                style={{ backgroundImage: "url(/images/signup-company-bg.jpg)" }}
                aria-hidden="true"
              />
              <span className={styles.cardType}>기업 · 병원 · 연구기관</span>
              <div className={styles.chipRow}>
                <span className={styles.chip}>제약사</span>
                <span className={styles.chip}>바이오텍</span>
                <span className={styles.chip}>의료기기</span>
                <span className={styles.chip}>CRO·CDMO</span>
              </div>
              <p className={styles.cardFootnote}>사업자등록증명원 인증 · 병원은 요양기관번호 추가</p>
              <span className={`${styles.cardAction} ${styles.actionGradient}`}>
                가입 진행
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </span>
            </Link>

            <Link className={`${styles.card} ${styles.cardDark}`} href="/business/signup/pharmacy" aria-label="약국으로 가입하기">
              <div
                className={`${styles.cardPhoto} ${styles.cardPhotoDark}`}
                style={{ backgroundImage: "url(/images/signup-pharmacy-bg.jpg)" }}
                aria-hidden="true"
              />
              <span className={`${styles.cardType} ${styles.cardTypeDark}`}>약국</span>
              <div className={styles.chipRow}>
                <span className={`${styles.chip} ${styles.chipDark}`}>일반약국</span>
                <span className={`${styles.chip} ${styles.chipDark}`}>의원층약국</span>
                <span className={`${styles.chip} ${styles.chipDark}`}>문전약국</span>
              </div>
              <p className={`${styles.cardFootnote} ${styles.cardFootnoteDark}`}>약사면허번호 · 요양기관번호 인증</p>
              <span className={`${styles.cardAction} ${styles.cardActionDark}`}>
                가입 진행
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </span>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
