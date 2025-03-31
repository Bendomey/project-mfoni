import { Image } from "./Image.tsx";
import { useValidateImage } from "@/hooks/use-validate-image.tsx";
import { classNames } from "@/lib/classNames.ts";
import { getNameInitials } from "@/lib/misc.ts";
import { safeString } from "@/lib/strings.ts";

interface Props {
  image?: Nullable<string>;
  name: string;
  size?: string;
}

export function UserImage({ name, image, size }: Props) {
  const isProfilePhotoValid = useValidateImage(safeString(image));
  const initials = getNameInitials(name);

  return (
    <>
      {isProfilePhotoValid && image ? (
        <Image
          className={classNames("size-6 rounded-full", size)}
          src={image}
          alt={name}
        />
      ) : (
        <span
          className={classNames(
            "inline-flex size-6 items-center justify-center rounded-full bg-blue-600",
            size,
          )}
        >
          <span className="text-sm font-medium leading-none text-white">
            {initials}
          </span>
        </span>
      )}
    </>
  );
}
