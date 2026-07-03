"use client";

import Link from "next/link";
import { BusinessHeader } from "@/components/business/BusinessHeaders";
import { PageHeader } from "@/components/PageHeader";
import styles from "./SignupTypeSelectClient.module.css";

/** STEP A — 가입 유형 선택. 헤드헌팅 분기 페이지(/headhunting/select)와 같은 좌우 대비 카드 문법을 쓴다. */
export function SignupTypeSelectClient() {
  return (
    <>
      <BusinessHeader />
      <main className={styles.main}>
        <div className={`app-shell ${styles.shell}`}>
          <PageHeader
            breadcrumbLabel="기업회원 가입"
            eyebrow="기업회원 가입"
            title="가입하실 기관 유형을 선택해 주세요"
            description="기관 유형에 따라 필요한 인증 절차가 다릅니다. 상세 정보는 가입 후 기관 정보에서 입력할 수 있습니다."
          />

          <div className={styles.choices} role="group" aria-label="가입 유형 선택">
            <Link
              className={`${styles.card} ${styles.cardLight}`}
              href="/business/signup/company"
              aria-label="기업·병원·연구기관으로 가입하기"
            >
              <span className={styles.cardType}>기업 · 병원 · 연구기관</span>
              <p className={styles.cardSub}>
                제약사, 바이오텍, 의료기기, CRO·CDMO, 병원, 연구기관 채용 담당자를 위한 가입
              </p>
              <p className={styles.cardFootnote}>사업자등록증명원으로 인증 · 병원은 요양기관번호 추가 입력</p>
              <span className={`${styles.cardAction} ${styles.actionGradient}`}>
                가입 진행
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </span>
            </Link>

            <Link className={`${styles.card} ${styles.cardDark}`} href="/business/signup/pharmacy" aria-label="약국으로 가입하기">
              <span className={`${styles.cardType} ${styles.cardTypeDark}`}>약국</span>
              <p className={`${styles.cardSub} ${styles.cardSubDark}`}>약국을 운영하며 약사 인력을 채용하려는 약국장·관리약사</p>
              <p className={`${styles.cardFootnote} ${styles.cardFootnoteDark}`}>약사면허번호와 요양기관번호로 인증</p>
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
