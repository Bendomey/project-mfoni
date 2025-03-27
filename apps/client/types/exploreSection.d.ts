interface ExploreSection {
  id: string;
  type: "TAG" | "CREATOR" | "CONTENT" | "COLLECTION";
  endpoint: string;
  title: string;
  sort: number;
  seeMorePathname: Nullable<string>;
  ensureAuth: boolean;
  createdAt: Date;
  updatedAt: Date;
  visibility: "PUBLIC" | "PRIVATE";
}

interface FetchExploreSectionFilter {}
