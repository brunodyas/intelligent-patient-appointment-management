import { routes } from "./routes";

export const GUARDS = [
  routes.crmInsights,
  routes.orderStatus,
  routes.manufacturers,
]

export const ENVS = {
  development: "development",
  production: "production"
}