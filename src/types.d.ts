import { ReactNode } from "react";

export type Router = {
  path: string
  routes: { [route: string]: (last: string, props?: any) => ReactNode }
}