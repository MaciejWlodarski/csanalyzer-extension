import type { FaceitMatch, FaceitMatchStats } from "../api/faceit";

declare global {
  interface WindowEventMap {
    matchApi: CustomEvent<FaceitMatch>;
    statsApi: CustomEvent<FaceitMatchStats[]>;
    urlChange: CustomEvent<string>;
  }
}

export {};
