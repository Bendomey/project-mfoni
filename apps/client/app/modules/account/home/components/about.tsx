import { PencilIcon } from "@heroicons/react/24/outline";
import { type FormEventHandler, useState } from "react";
import { useForm } from "react-hook-form";
import { useUpdateCreatorBasicDetails } from "@/api/creators/index.ts";
import { Button } from "@/components/button/index.tsx";
import { classNames } from "@/lib/classNames.ts";
import { errorToast, successToast } from "@/lib/custom-toast-functions.tsx";
import { safeString } from "@/lib/strings.ts";
import { useAuth } from "@/providers/auth/index.tsx";

const defaultInterests = [
  "set",
  "your",
  "interests",
  "here",
  "and",
  "let",
  "people",
  "know",
  "more",
  "about",
  "you",
];

interface Inputs {
  about: string;
  interests: Array<string>;
}

export function CreatorAbout() {
  const { currentUser } = useAuth();
  const creator = currentUser?.creator;
  const [mode, setMode] = useState("VIEW");
  const [about, setAbout] = useState(safeString(creator?.about));
  const [interests, setInterests] = useState(creator?.interests ?? []);
  const { mutate, isPending } = useUpdateCreatorBasicDetails();

  const {
    register,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<Inputs>({
    defaultValues: {
      about,
      interests,
    },
  });

  let aboutContent = <></>;

  if (mode === "VIEW") {
    aboutContent = (
      <>
        {about ? (
          <p className="text-sm text-gray-600">{about}</p>
        ) : (
          <span className="text-sm italic text-gray-500">
            Set your about here. This will help people know more about you.
          </span>
        )}
      </>
    );
  } else if (mode === "EDIT") {
    aboutContent = (
      <div className="mt-5">
        <textarea
          maxLength={500}
          rows={5}
          {...register("about")}
          className={classNames(
            "mt-1 block w-full rounded-md border-0 p-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6",
            errors.about ? "ring-red-500" : "",
          )}
          placeholder="Set your about here. This will help people know more about you..."
        ></textarea>
        <span className="text-gray-400 text-xs">Maximum of 500 characters</span>
      </div>
    );
  }

  let interestsContent = <></>;

  if (mode === "VIEW") {
    const ints =
      watch("interests").length > 0 ? watch("interests") : defaultInterests;
    interestsContent = (
      <>
        {ints.map((interest, index) => (
          <div
            key={index}
            className="rounded bg-gray-100 px-3 py-1 hover:bg-gray-200"
          >
            <span className="text-xs font-medium text-gray-600">
              {interest}
            </span>
          </div>
        ))}
      </>
    );
  } else if (mode === "EDIT") {
    interestsContent = (
      <EditInterests
        data={watch("interests")}
        setData={(its) => setValue("interests", its)}
      />
    );
  }

  const onSubmit = (data: Inputs) => {
    mutate(
      {
        address: creator?.address || null,
        about: data.about || null,
        interests: data.interests,
        socialMedia: creator?.socialMedia || [],
      },
      {
        onError: () => {
          errorToast("Failed to update about");
        },
        onSuccess: () => {
          successToast("About updated successfully");
          setAbout(data.about);
          setInterests(data.interests);
          reset(data);
          setMode("VIEW");
        },
      },
    );
  };

  const isClean =
    watch("about") === about &&
    JSON.stringify(watch("interests")) === JSON.stringify(interests);
  const isDirty = !isClean;

  return (
    <div className="rounded-md border border-gray-200 bg-white pb-5">
      <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h1 className="font-bold">About</h1>
          {mode === "VIEW" ? (
            <Button onClick={() => setMode("EDIT")} variant="unstyled">
              <PencilIcon className="h-4 w-4" />
            </Button>
          ) : null}
        </div>

        {aboutContent}

        <div className="mt-5">
          <h1 className="text-sm">Interests</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {interestsContent}
          </div>
        </div>

        {mode === "EDIT" ? (
          <div className="mt-5 flex justify-end space-x-3">
            <Button
              disabled={isPending || !isDirty}
              onClick={() =>
                onSubmit({
                  about: watch("about"),
                  interests: watch("interests"),
                })
              }
            >
              Update
            </Button>
            <Button
              size="sm"
              onClick={() => {
                reset();
                setMode("VIEW");
              }}
              variant="outlined"
              color="dangerGhost"
            >
              Cancel
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

interface EditInterestsProps {
  data: string[];
  setData: (data: string[]) => void;
}

function EditInterests({ data, setData }: EditInterestsProps) {
  const [interest, setInterest] = useState("");

  const handleRemove = (index: number) => {
    const newData = data.filter((_, i) => i !== index);
    setData(newData);
  };

  const handleAdd: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (interest.trim() === "") return;
    setData([...data, interest]);
    setInterest("");
  };

  return (
    <>
      {data.map((interest, index) => (
        <span
          key={index}
          className="inline-flex items-center gap-x-2 rounded-md bg-gray-50 px-3 py-2 md:text-xs font-medium text-gray-600 ring-1 ring-gray-500/10 ring-inset"
        >
          {interest}
          <button
            onClick={() => handleRemove(index)}
            type="button"
            className="group relative -mr-1 size-5 md:size-4 rounded-xs hover:bg-gray-500/20"
          >
            <span className="sr-only">Remove</span>
            <svg
              viewBox="0 0 14 14"
              className="size-5 md:size-4 stroke-gray-600/50 group-hover:stroke-gray-600/75"
            >
              <path d="M4 4l6 6m0-6l-6 6" />
            </svg>
            <span className="absolute -inset-1" />
          </button>
        </span>
      ))}
      <form onSubmit={handleAdd} className="space-x-3">
        <input
          placeholder="interest here..."
          value={interest}
          onChange={(e) => setInterest(e.target.value)}
          className={classNames(
            "mt-1 rounded-md border-0 text-sm py-2 md:py-1 px-2 w-auto text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6",
          )}
        />
        <Button type="submit" disabled={interest.trim() === ""} size="sm">
          Add
        </Button>
      </form>
    </>
  );
}
