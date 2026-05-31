export interface Alert {  
  key: string,
  variant: "success" | "info" | "warning" | "error",
  open: boolean,
  title: string,
  desc: string,
}