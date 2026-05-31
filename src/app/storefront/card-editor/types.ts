export interface CardFields {
  name: string;
  title: string;
  company: string;
  phone: string;
  email: string;
}

export type CardDesign = "minimal" | "bold" | "elegant" | "tech" | "medical" | "gastro";

export interface ColorScheme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  bg: string;
  text: string;
}