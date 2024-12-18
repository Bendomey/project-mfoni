import { Button } from "@/components/ui/button";
import { Dispatch, SetStateAction, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogOverlay,
  DialogClose,
} from "@/components/ui/dialog";
import _ from "lodash";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { localizedDayjs } from "@/lib/date";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ViewApplicationModalProps {
  data?: User;
  refetch: VoidFunction;
  opened: boolean;
  setOpened: Dispatch<SetStateAction<boolean>>;
}

const labelCSS = "text-gray-400";

export const ViewUserModal = ({
  data,
  refetch,
  opened,
  setOpened,
}: ViewApplicationModalProps) => {
 
  return (
    <>
    <Dialog open={opened} onOpenChange={() => setOpened(false)}>
      <DialogOverlay className="bg-black/10" />
      <DialogContent className={`sm:max-w-[850px] bg-white dark:bg-black ${data?.creator ? 'top-[28rem]' : 'top-96'}`}>
        <DialogHeader className="flex-row items-center gap-3">
            <Avatar className="w-20 h-16 rounded-md">
        <AvatarImage src={data?.photo} alt="Profile picture" />
        <AvatarFallback>{_.upperCase(data?.name.split(' ').map(name => name[0]).join(''))}</AvatarFallback>
      </Avatar>
          <div className="">
          <DialogTitle className="leading-normal">
            {data?.name ? `${_.upperFirst(data.name)}'s` : "Application"}{" "}
            Details
          </DialogTitle>
          <Badge className={`${data?.status === 'ACTIVE' ? 'bg-emerald-400' : 'bg-red-400'}`}>{data?.status}</Badge>
          </div>
        </DialogHeader>
        <Separator />

        <div className="grid grid-cols-2 gap-x-12 gap-y-5">

          <div>
            <Label className={`${labelCSS}`}>Email:</Label>
            <p>{_.lowerCase(data?.email)}</p>
          </div>

          <div>
            <Label className={`${labelCSS}`}>Email Verified On:</Label>
            <p>
              {data?.emailVerifiedAt && localizedDayjs(data.emailVerifiedAt).isValid()
                ? localizedDayjs(data?.emailVerifiedAt).format("MMMM DD, YYYY")
                : "N/A"}
            </p>
          </div>

          <div>
            <Label className={`${labelCSS}`}>Phone:</Label>
            <p>{data?.phoneNumber ?? 'N/A' }</p>
          </div>

          <div>
            <Label className={`${labelCSS}`}>Phone Number Verified On:</Label>
            <p>
              {data?.phoneNumberVerifiedAt && localizedDayjs(data.phoneNumberVerifiedAt).isValid()
                ? localizedDayjs(data?.phoneNumberVerifiedAt).format("MMMM DD, YYYY")
                : "N/A"}
            </p>
          </div>

          <div>
            <Label className={`${labelCSS}`}>Role:</Label>
            <p>{_.startCase(_.lowerCase(data?.role))}</p>
          </div>

          <div>
            <Label className={`${labelCSS}`}>Created On:</Label>
            <p>{localizedDayjs(data?.createdAt).format("MMMM DD, YYYY")}</p>
          </div>

          <div>
            <Label className={`${labelCSS}`}>Update On:</Label>
            <p>
              {data?.createdAt && localizedDayjs(data.createdAt).isValid()
                ? localizedDayjs(data?.createdAt).format("MMMM DD, YYYY")
                : "N/A"}
            </p>
          </div>
          </div>

{data?.creator ? ( 
  <>
  <div>
          <p className="mt-5 font-semibold text-lg">Creator Detail's</p>
        <Separator className="" />
  </div>
          <div className="grid grid-cols-2 gap-x-12 gap-y-5">
          <div className="flex flex-col gap-1">
            <Label className={`${labelCSS}`}>Status:</Label>
            <Badge className={`w-fit ${data?.status === 'ACTIVE' ? 'bg-emerald-400' : 'bg-red-400'}`}>{data?.status}</Badge>
          </div>

          <div>
            <Label className={`${labelCSS}`}>Subscription:</Label>
            <p>{data?.creator?.subscription ?? "N/A"}</p>
          </div>

          <div>
            <Label className={`${labelCSS}`}>Social Media:</Label>
            {data?.creator.socialMedia ? data?.creator.socialMedia.map(item=> <p>{item.handle}</p>) : "N/A"}
          </div>
        </div>
  </>
): null }

        <Separator className="mt-12" />
        <DialogFooter className="sm:justify-between">
          <DialogClose asChild>
            <Button type="button" variant="outline" className="dark:bg-gray-200 dark:text-gray-800 dark:hover:bg-gray-400">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>

</>
  );
};
