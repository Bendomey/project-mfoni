interface Tag {
  id: string;
  slug: string;
  name: string;
  isFeatured: boolean;
  description: Nullable<String>;
  createdAt: Date;
  updatedAt: Date;
}

interface FetchTagFilter {}

interface TagContent {
  id: string;
  tagId: string;
  tag: Nullable<Tag>;
  contentId: string;
  content: Nullable<Content>;
  createdAt: Date;
  updatedAt: Date;
}

interface FetchTagContentFilter {
  orientation?: string;
  license?: string;
}
