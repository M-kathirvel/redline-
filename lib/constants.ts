export const PROJECT_CATEGORIES = [
  "Branding",
  "Digital Marketing",
  "Ads",
  "Promotion Shoots",
  "Social Media",
  "SEO",
  "Content"
] as const;

export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];

export const PORTFOLIO_FILTERS = [
  "All",
  "Branding",
  "Digital Marketing",
  "Ads",
  "Promotion Shoots",
  "Social Media",
  "SEO",
  "Content"
] as const;

export const TEAM = [
  { name: "Aravind", phone: "+91 7708448375", digits: "917708448375" },
  { name: "Harish", phone: "+91 7810084560", digits: "7810084560" },
  { name: "Naveen", phone: "+91 8925452654", digits: "8925452654" }
] as const;

export const BUSINESS_EMAIL = "redlinemarketinginfo@gmail.com";
export const INSTAGRAM_HANDLE = "redlinemarketing_co";
