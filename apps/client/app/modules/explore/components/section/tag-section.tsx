import { TagIcon } from "@heroicons/react/24/outline";
import { Link } from "@remix-run/react";
import dayjs from "dayjs";
import { PAGES } from "@/constants/index.ts";

interface Props {
  data: Tag;
}

export function TagSection({ data }: Props) {
  return (
    <Link to={PAGES.TAG.replace(":tag", data.slug)}>
      <div className="min-w-56 rounded border bg-zinc-50 px-4 py-2 hover:bg-zinc-100">
        <div className="flex items-center gap-2">
          <TagIcon className="size-5 text-black" />
          <div>
            <h1 className="truncate capitalize">{data.name}</h1>
            <p className="text-xs text-zinc-400">
              created on {dayjs(data.createdAt).format("L")}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function TagShimmer() {
  return (
    <Link to="" preventScrollReset>
      <div className="h-10 w-36 animate-pulse rounded-md bg-zinc-100" />
    </Link>
  );
}
