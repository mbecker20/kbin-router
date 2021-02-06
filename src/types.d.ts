import { ReactNode } from "react";

export type Router = {
  path: string
  routes: { [route: string]: ReactNode }
}