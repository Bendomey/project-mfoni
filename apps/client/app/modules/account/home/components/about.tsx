import { PencilIcon } from "@heroicons/react/24/outline";
import { Link } from "@remix-run/react";
import { Button } from "@/components/button/index.tsx";
import { PAGES } from "@/constants/index.ts";

const interests = [
  "wallpaper",
  "nature",
  "background",
  "love",
  "business",
  "money",
  "office",
  "people",
];

export function CreatorAbout() {
  return (
    <div className="rounded-md border border-gray-200 bg-white pb-5">
      <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h1 className="font-bold">About</h1>
          <Button variant="unstyled">
            <PencilIcon className="h-4 w-4" />
          </Button>
        </div>

        <div className="">
          <span className="text-sm italic text-gray-500">
            Set your about here. This will help people know more about you.
          </span>
          {/* <p className="text-sm text-gray-600">Lorem ipsum dolor sit amet consectetur, adipisicing elit. Recusandae dolorem cupiditate, nobis natus voluptatum porro est soluta, voluptatibus animi expedita magni molestiae hic. Ut, cumque distinctio dolorum deleniti incidunt quasi!</p> */}
        </div>

        <div>
          <div className="mt-5">
            <h1 className="text-sm">Interests</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {interests.map((tag, index) => (
                <Link key={index} to={PAGES.TAG.replace(":tag", tag)}>
                  <div className="rounded bg-gray-100 px-3 py-1 hover:bg-gray-200">
                    <span className="text-xs font-medium text-gray-600">
                      {tag}
                    </span>
                  </div>
                </Link>
              ))}
              {/* {
                                [...Array(7)].map((_, index) => (
                                    <div key={index} className="border border-dashed border-gray-200 bg-gray-50 h-8 w-20 px-3 py-1 rounded"/>
                                ))
                            } */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
