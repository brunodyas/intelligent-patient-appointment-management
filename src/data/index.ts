import { Alert } from "@/interface/signIn";
import { SignInForm } from "@/types";

export const colorsData = [
  { name: "Red" },
  { name: "Yellow" },
  { name: "Green" },
  { name: "Cyan" },
  { name: "Blue" },
  { name: "Magenta" },
  { name: "Orange" },
  { name: "Chartreuse" },
  { name: "Spring Green" },
  { name: "Azure" },
  { name: "Violet" },
  { name: "Brown" },
  { name: "Purple" },
  { name: "Pink" },
  { name: "White" },
  { name: "Black" },
  { name: "Rose" },
  { name: "Gray" },
];

export const featuresData = [
  { name: "Light Filtering" },
  { name: "Cordless Operation" },
  { name: "Temperature Controle" },
];

export const blindData = [
  { name: "Select Blind Type", disabled: true },
  { name: "Wood Blinds" },
  { name: "Faux Wood Blinds" },
  { name: "Shutters" },
  { name: "Roller Shades" },
  { name: "Cellular Shades" },
  { name: "Pleated Shades" },
  { name: "Roman Shades" },
  { name: "Woven Wood/Natural Grass Shades" },
  { name: "Drapery" },
  { name: "Exterior Roller Shades" },
  { name: "Awnings" },
];

export const initializeManufacturers = {
  name: "",
  color: [{ name: "" }],
  features: [{ name: "" }],
  price_table: [{ width: "", height: "", price: "" }],
  model_number: "",
  blind_type: { name: "" },
  franchise: {label: "", value: null},
  addons: [{ name: "", price: "", description: "", addon_color: [{ name: "" }] }],
};

export const initializeAlert: Alert = {
  key: "",
  variant: "success",
  open: false,
  title: "",
  desc: "",
};

export const initializeSignInForm: SignInForm = {
  email: "",
  password: "",
};

export const manufacturerFileTypes = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.csv'];

export const priorityData = [
  { name: "Low" },
  { name: "Medium" },
  { name: "High" },
  { name: "Critical" },
];