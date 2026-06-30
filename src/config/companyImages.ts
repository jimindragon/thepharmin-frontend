export const companyExampleImages = {
  primary: "/images/company/company_pic_example.jpg",
  hero: "/images/company/company_pic_example_1.jpg",
  workspace: "/images/company/company_pic_example_2.jpg",
  culture: "/images/company/company_pic_example_3.jpg",
  lab: "/images/company/company_pic_example_4.jpg",
  meeting: "/images/company/company_pic_example_5.jpg",
  office: "/images/company/company_pic_example_6.jpg",
  research: "/images/company/company_pic_example_7.jpg",
  headhuntingHero: "/images/headhunting-hero.jpg",
} as const;

export const companyExampleImageList = [
  companyExampleImages.primary,
  companyExampleImages.hero,
  companyExampleImages.workspace,
  companyExampleImages.culture,
  companyExampleImages.lab,
  companyExampleImages.meeting,
  companyExampleImages.office,
  companyExampleImages.research,
] as const;

export const personExampleImages = {
  primary: "/images/person-example.jpg",
  secondary: "/images/person-example-1.jpg",
} as const;

export const heroImages = {
  support: "/images/working-people-1.jpg",
} as const;

export const companyLogos: Record<string, string> = {
  유한양행: "/images/companies/yuhan.png",
  삼성바이오로직스: "/images/companies/samsung-biologics.png",
  셀트리온: "/images/companies/celltrion.png",
};
