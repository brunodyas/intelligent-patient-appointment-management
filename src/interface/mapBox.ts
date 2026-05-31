export interface MarkerInterface {
  id: number;
  name: string;
  created_at: string;
  longitude: number;
  latitude: number;
  assigned_tech?: number | string
  jobTime?:string;
  isTechnician?: boolean;
  color?:string;
}

export interface MapViewProps {
  markers: MarkerInterface[];
  style?: React.CSSProperties;
  techmarkers?:MarkerInterface[];
}