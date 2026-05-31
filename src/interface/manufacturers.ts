export interface Addon {
  id: number;
  name: string;
  price: string;
  description: string;
  addon_color: string[];
}

export interface AddedBy {
  id: number;
  name: string;
  email: string;
  franchise: Franchise;
}
export interface Franchise {
  id: number;
  franchise_name: string;
}

export interface AddproductsResponse {
  product_guide: string | null;
  id: number;
  addons: Addon[];
  added_by: AddedBy;
  name: string;
  color: string[];
  features: string[];
  price_table: PriceTable[];
  model_number: string;
  blind_type: string;
  createdAt: string;
}

export interface PriceTable {
  width: string | number;
  height: string | number;
  price: string | number;
}
export interface Product {
  id: number;
  addons: Addon[];
  added_by: AddedBy;
  name: string;
  color: string[];
  features: string[];
  price_table: PriceTable[];
  model_number: string;
  blind_type: string;
  createdAt: string;
  updatedAt: string;
}
export interface GetProductsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Product[];
}
export interface Option {
  name: string;
  disabled?: boolean;
  hide?: boolean;
}

interface FranchiseOption {
  label: string;
  value?: null | number;
}

export type ProductForm = {
  name: string;
  color: Option[];
  features: Option[];
  price_table: PriceTable[];
  model_number: string;
  blind_type: Option;
  franchise?: FranchiseOption;
  addons: { name: string; price: string; description: string, addon_color: Option[] }[];
};

export interface MultipleSelectBoxProps {
  className?: string;
  datas?: Option[] | [];
  label?: string;
  variant?: "default" | "status" | "no-border";
  isRequired?: boolean;
  selectedData?: Option[];
  handleChange?: (value: Option[]) => void;
}

export type ProductConfigForm = {
  product_type?: any;
  vendor?: any;
  product?: any;
  style?: any;
};