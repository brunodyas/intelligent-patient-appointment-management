import { StringUnitLength } from "luxon";

export interface CRMConfig {
  id: number,
  linked_job: number;
  config_name: string;
  createdAt: string;
  chosen_config: ChoseConfigInterface | null;
  addedBy: number;
}

export interface CRMConfigByIdResponse {
  id: number,
  linked_job: number;
  config_name: string;
  createdAt: string;
  chosen_config: any | null;
  appointment_recording: string | null;
  appointment_recording_transcription: string | null;
  addedBy: number;
  blind_width_in: string;
  blind_height_in: string;
  technician_notes: string | null
  filter_questions_answers: {
    question: string;
    answer: string;
  }[] | null
}

export interface BlindInterface {
  blind: {
    id: number;
    addons: {
      id: number;
      name: string;
      price: string;
      description: string;
      addon_color: string[]
    }[];
    added_by: {
      id: number;
      name: string;
      email: string;
    }
    linked_franchise: {
      franchise_name:string;
      // price_markup: string | null;
      // is_manufacturer: boolean;
    }
    product_guide: null
    name: string;
    color: string[]
    features: string[];
    price_table: {
      price: number;
      width: number;
      height: number;
    }[]
    model_number: string;
    blind_type: string;
    createdAt: string;
    updatedAt: string;
  }
  matching_features: string[];
  missing_features: string[];
  matching_addons: {
    id: number
    name:string
    price: number
  }[];
  missing_addons: string[];
  addon_costs: {}
  match_count: number;
  resolve_matching: string[];
  missing_count: number;
  resolve_missing: string[];
  total_price: string;
}

export interface SelectedBlindPayload {
  blind?: number;
  selected_color?: string;
  selected_addons?: number[];
  blind_width_in?: number;
  blind_height_in?: number;
  addon_colors?: { 
    [addonId: string]: string 
  };
}

export interface ChoseConfigInterface {
  blind: {
    id: number;
    name: string;
    price_table: {
      price: number;
      width: number;
      height: number;
    }[];
    available_colors:  string[];
    features: string[];
    blind_type: string;
    model_number: string;
    available_addons: {
      id: number;
      name: string;
      price: string;
      description: string
    }[];
  }
  selected_color: string;
  selected_addons: {
    id: number;
    name: string;
    price: string;
    description: string;
  }[];
  blind_width_in: string;
  blind_height_in: string;
  total_price: number;
}

export interface CreateConfigResponse {
  id: number;
}