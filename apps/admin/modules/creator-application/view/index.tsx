import { Button } from "@/components/ui/button";
import { Dispatch, SetStateAction } from "react";
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
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { localizedDayjs } from "@/lib/date";


interface ViewApplicationModalProps {
  data?: CreatorApplication;
  refetch?: VoidFunction;
  opened: boolean;
  setOpened: Dispatch<SetStateAction<boolean>>;
}

const labelCSS = 'text-gray-400'

export const ViewApplicationModal = ({
  data,
  refetch,
  opened,
  setOpened,
}: ViewApplicationModalProps) => {

  return (
    <Dialog open={opened} onOpenChange={() => setOpened(false)}>
      <DialogOverlay className="bg-black/10" />
      <DialogContent className="sm:max-w-[850px] bg-white dark:bg-black top-96">
        <DialogHeader>
          <DialogTitle className="leading-normal">
          {data?.name ? `${_.upperFirst(data.name)}'s` : "Application"} Details
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
          Review this application and take necessary actions  using the buttons below.
          </DialogDescription>
        </DialogHeader>
        <Separator/>

        <div className="grid grid-cols-2 gap-x-12 gap-y-7">

          <div>
            <Label className={`${labelCSS}`}>
            Submitted On:
            </Label>
            <p>{data?.submittedAt && localizedDayjs(data.submittedAt).isValid()? localizedDayjs(data?.submittedAt).format(
                                      'MMMM DD, YYYY',
                                    )
                                  : 'N/A'}</p>
          </div>

          <div>
            <Label className={`${labelCSS}`}>
            Approved On:
            </Label>
            <p>{data?.approvedAt && localizedDayjs(data.approvedAt).isValid()? localizedDayjs(data?.approvedAt).format(
                                      'MMMM DD, YYYY',
                                    )
                                  : 'N/A'}</p>
          </div>

          <div>
            <Label className={`${labelCSS}`}>
            Pricing Package:
            </Label>
            <p>{data?.intendedPricingPackage}</p>
          </div>

          <div>
            <Label className={`${labelCSS}`}>
            ID Type:
            </Label>
            <p>{data?.idType}</p>
          </div>

          <div>
            <Label className={`${labelCSS}`}>
            ID Back:
            </Label>
            <div className="h-48 w-full relative mt-2">
      <Image
        src={data?.idBackImage ?? '/images/thumbnail.png'}
        alt="ID Back"
        fill
        className="rounded-md object-cover"
      />
    </div>
          </div>

          <div>
            <Label className={`${labelCSS}`}>
            ID Front:
            </Label>
            <div className="h-48 w-full relative mt-2">
      <Image
        src={data?.idFrontImage ?? '/images/thumbnail.png'}
        alt="ID Back"
        fill
        className="rounded-md object-cover"
      />
    </div>
          </div>
          

        </div>

        <Separator className="mt-20" />
        <DialogFooter className="sm:justify-between">
        <DialogClose asChild>
            <Button type="button" variant="outline">
              Close
            </Button>
          </DialogClose>
          <div className="flex  gap-3">
          <Button type="button" className="bg-red-700 text-white hover:bg-red-400" onClick={() => {}}>
            Reject
          </Button>
          <Button type="button" className="bg-green-800 text-white hover:bg-green-400" onClick={() => {}}>
            Approve
          </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
