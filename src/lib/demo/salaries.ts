export interface SalaryRow {
  id: string;
  company: string;
  title: string;
  totalComp: number;
  baseSalary: number;
  stockValue: number;
  bonus: number;
  yearsExperience: number;
  yearsAtCompany: number;
  location: string;
  isCanary?: boolean;
}

export const MOCK_SALARIES: SalaryRow[] = [
  {
    id: "sal_1",
    company: "Google",
    title: "Software Engineer III (L4)",
    totalComp: 268000,
    baseSalary: 165000,
    stockValue: 75000,
    bonus: 28000,
    yearsExperience: 4,
    yearsAtCompany: 2,
    location: "Mountain View, CA"
  },
  {
    id: "sal_2",
    company: "Meta",
    title: "Senior Software Engineer (E5)",
    totalComp: 395000,
    baseSalary: 210000,
    stockValue: 145000,
    bonus: 40000,
    yearsExperience: 7,
    yearsAtCompany: 1,
    location: "Menlo Park, CA"
  },
  {
    id: "sal_3",
    company: "Netflix",
    title: "Senior Software Engineer",
    totalComp: 520000,
    baseSalary: 450000,
    stockValue: 70000,
    bonus: 0,
    yearsExperience: 9,
    yearsAtCompany: 3,
    location: "Los Gatos, CA"
  },
  {
    id: "sal_4",
    company: "Apple",
    title: "ICT4",
    totalComp: 312000,
    baseSalary: 185000,
    stockValue: 100000,
    bonus: 27000,
    yearsExperience: 5,
    yearsAtCompany: 2,
    location: "Cupertino, CA"
  },
  {
    id: "sal_5",
    company: "Amazon",
    title: "Software Development Engineer II (L5)",
    totalComp: 245000,
    baseSalary: 162000,
    stockValue: 65000,
    bonus: 18000,
    yearsExperience: 5,
    yearsAtCompany: 3,
    location: "Seattle, WA"
  },
  {
    id: "sal_6",
    company: "Stripe",
    title: "Software Engineer (L2)",
    totalComp: 285000,
    baseSalary: 175000,
    stockValue: 90000,
    bonus: 20000,
    yearsExperience: 3,
    yearsAtCompany: 1,
    location: "San Francisco, CA"
  },
  {
    id: "sal_7",
    company: "Microsoft",
    title: "Senior Software Engineer (L63)",
    totalComp: 258000,
    baseSalary: 180000,
    stockValue: 55000,
    bonus: 23000,
    yearsExperience: 8,
    yearsAtCompany: 4,
    location: "Redmond, WA"
  },
  {
    id: "sal_8",
    company: "OpenAI",
    title: "Member of Technical Staff",
    totalComp: 820000,
    baseSalary: 300000,
    stockValue: 520000,
    bonus: 0,
    yearsExperience: 6,
    yearsAtCompany: 1,
    location: "San Francisco, CA"
  },
  {
    id: "sal_9",
    company: "Uber",
    title: "Senior Software Engineer (L5A)",
    totalComp: 345000,
    baseSalary: 195000,
    stockValue: 110000,
    bonus: 40000,
    yearsExperience: 7,
    yearsAtCompany: 2,
    location: "San Francisco, CA"
  },
  {
    id: "sal_10",
    company: "Google",
    title: "Staff Software Engineer (L6)",
    totalComp: 485000,
    baseSalary: 235000,
    stockValue: 190000,
    bonus: 60000,
    yearsExperience: 11,
    yearsAtCompany: 6,
    location: "Mountain View, CA"
  },
  {
    id: "sal_11",
    company: "Meta",
    title: "Software Engineer (E4)",
    totalComp: 275000,
    baseSalary: 170000,
    stockValue: 80000,
    bonus: 25000,
    yearsExperience: 3,
    yearsAtCompany: 2,
    location: "Seattle, WA"
  },
  {
    id: "sal_12",
    company: "Amazon",
    title: "Senior SDE (L6)",
    totalComp: 382000,
    baseSalary: 190000,
    stockValue: 160000,
    bonus: 32000,
    yearsExperience: 10,
    yearsAtCompany: 4,
    location: "Seattle, WA"
  },
  {
    id: "sal_13",
    company: "Microsoft",
    title: "Principal Engineer (L65)",
    totalComp: 395000,
    baseSalary: 235000,
    stockValue: 120000,
    bonus: 40000,
    yearsExperience: 14,
    yearsAtCompany: 5,
    location: "Redmond, WA"
  },
  {
    id: "sal_14",
    company: "Snowflake",
    title: "Senior Software Engineer",
    totalComp: 375000,
    baseSalary: 210000,
    stockValue: 135000,
    bonus: 30000,
    yearsExperience: 6,
    yearsAtCompany: 2,
    location: "San Mateo, CA"
  },
  {
    id: "sal_15",
    company: "Databricks",
    title: "Software Engineer (L4)",
    totalComp: 330000,
    baseSalary: 180000,
    stockValue: 120000,
    bonus: 30000,
    yearsExperience: 4,
    yearsAtCompany: 1,
    location: "San Francisco, CA"
  }
];
