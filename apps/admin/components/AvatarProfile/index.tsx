import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import _ from "lodash";

interface AvatarComponentProps {
  width?: number;
  photo?: string;
  fallBackContent: string | undefined;
  className?: string;
}

export const AvatarProfilea = ({
  photo,
  fallBackContent,
  className,
  width = 20,
}: AvatarComponentProps) => {
  return (
    <Avatar className={`w-[${width}px] h-full ${className}`}>
      <AvatarImage src={photo} alt="Profile picture" />
      <AvatarFallback>
        {fallBackContent
          ? _.upperCase(
              fallBackContent
                .split(" ")
                .map((fallBackContent) => fallBackContent[0])
                .join("")
            )
          : ""}
      </AvatarFallback>
    </Avatar>
  );
};
