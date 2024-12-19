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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AvatarProfilea } from "@/components/AvatarProfile";

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
        <DialogContent
          className={`sm:max-w-[850px] bg-white dark:bg-black top-96`}
        >
          <DialogHeader className="flex-row items-center gap-3">
            <AvatarProfilea
              fallBackContent={data?.name}
              photo={data?.photo}
              width={60}
              className="rounded-md"
            />
            <div className="">
              <DialogTitle className="leading-normal">
                {data?.name ? `${_.upperFirst(data.name)}'s` : "Application"}{" "}
                Details
              </DialogTitle>
              <Badge
                className={`${
                  data?.status === "ACTIVE" ? "bg-emerald-400" : "bg-red-400"
                }`}
              >
                {data?.status}
              </Badge>
            </div>
          </DialogHeader>
          <Separator />

          <Tabs defaultValue="basic" className="w-full h-80">
            {data?.creator ? (
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">Basic</TabsTrigger>
                <TabsTrigger value="creator">
                  Creator/Subscription Details
                </TabsTrigger>
              </TabsList>
            ) : null}

            <TabsContent value="basic">
              <div className="grid grid-cols-2 gap-x-12 gap-y-5 pt-3">
                <div>
                  <Label className={`${labelCSS}`}>Email:</Label>
                  <p>{data?.email}</p>
                </div>

                <div>
                  <Label className={`${labelCSS}`}>Email Verified On:</Label>
                  <p>
                    {data?.emailVerifiedAt &&
                    localizedDayjs(data.emailVerifiedAt).isValid()
                      ? localizedDayjs(data?.emailVerifiedAt).format(
                          "MMMM DD, YYYY"
                        )
                      : "N/A"}
                  </p>
                </div>

                <div>
                  <Label className={`${labelCSS}`}>Phone:</Label>
                  <p>{data?.phoneNumber ?? "N/A"}</p>
                </div>

                <div>
                  <Label className={`${labelCSS}`}>
                    Phone Number Verified On:
                  </Label>
                  <p>
                    {data?.phoneNumberVerifiedAt &&
                    localizedDayjs(data.phoneNumberVerifiedAt).isValid()
                      ? localizedDayjs(data?.phoneNumberVerifiedAt).format(
                          "MMMM DD, YYYY"
                        )
                      : "N/A"}
                  </p>
                </div>

                <div>
                  <Label className={`${labelCSS}`}>Role:</Label>
                  <p>
                    {data?.role ? _.startCase(_.lowerCase(data?.role)) : "N/A"}
                  </p>
                </div>

                <div>
                  <Label className={`${labelCSS}`}>Created On:</Label>
                  <p>
                    {localizedDayjs(data?.createdAt).format("MMMM DD, YYYY")}
                  </p>
                </div>

                <div>
                  <Label className={`${labelCSS}`}>Update On:</Label>
                  <p>
                    {data?.updatedAt && localizedDayjs(data.updatedAt).isValid()
                      ? localizedDayjs(data?.updatedAt).format("MMMM DD, YYYY")
                      : "N/A"}
                  </p>
                </div>
              </div>
            </TabsContent>

            {data?.creator ? (
              <TabsContent value="creator">
                <div className="grid grid-cols-2 gap-x-12 gap-y-5 pt-3">
                  <div className="flex flex-col gap-1">
                    <Label className={`${labelCSS}`}>Status:</Label>
                    <Badge
                      className={`w-fit ${
                        data?.status === "ACTIVE"
                          ? "bg-emerald-400"
                          : "bg-red-400"
                      }`}
                    >
                      {data?.status}
                    </Badge>
                  </div>

                  <div>
                    <Label className={`${labelCSS}`}>Social Media:</Label>
                    {data?.creator.socialMedia
                      ? data?.creator.socialMedia.map((item) => (
                          <p>{item.handle}</p>
                        ))
                      : "N/A"}
                  </div>

                  <div>
                    <Label className={`${labelCSS}`}>Package Type:</Label>
                    <p>{data?.creator?.subscription?.packageType ?? "N/A"}</p>
                  </div>

                  <div>
                    <Label className={`${labelCSS}`}>
                      Subscription Period:
                    </Label>
                    <p>{data?.creator?.subscription.period ?? "N/A"}</p>
                  </div>

                  <div>
                    <Label className={`${labelCSS}`}>Started On:</Label>
                    <p>
                      {localizedDayjs(
                        data?.creator?.subscription?.startedAt
                      ).format("MMMM DD, YYYY")}
                    </p>
                  </div>

                  <div>
                    <Label className={`${labelCSS}`}>Ended On:</Label>
                    <p>
                      {data?.creator?.subscription.endedAt &&
                      localizedDayjs(
                        data.creator?.subscription.endedAt
                      ).isValid()
                        ? localizedDayjs(
                            data?.creator?.subscription.endedAt
                          ).format("MMMM DD, YYYY")
                        : "N/A"}
                    </p>
                  </div>

                  <div>
                    <Label className={`${labelCSS}`}>Created On:</Label>
                    <p>
                      {localizedDayjs(
                        data?.creator?.subscription.createdAt
                      ).format("MMMM DD, YYYY")}
                    </p>
                  </div>

                  <div>
                    <Label className={`${labelCSS}`}>Update On:</Label>
                    <p>
                      {data?.creator?.subscription.updatedAt &&
                      localizedDayjs(
                        data.creator?.subscription.updatedAt
                      ).isValid()
                        ? localizedDayjs(
                            data?.creator?.subscription.updatedAt
                          ).format("MMMM DD, YYYY")
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </TabsContent>
            ) : null}
          </Tabs>

          <Separator className="mt-12" />
          <DialogFooter className="sm:justify-between">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                className="dark:bg-gray-200 dark:text-gray-800 dark:hover:bg-gray-400"
              >
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
