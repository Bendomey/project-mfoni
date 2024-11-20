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
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import _ from "lodash";

interface RejectApplicationModalProps {
  data?: CreatorApplication;
  refetch?: VoidFunction;
  opened: boolean;
  setOpened: Dispatch<SetStateAction<boolean>>;
}

export const RejectApplicationModal = ({
  data,
  refetch,
  opened,
  setOpened,
}: RejectApplicationModalProps) => {
  const { toast } = useToast();
  // const { mutate, status } = useApproveApplication();

  // const handleSubmit = () => {
  //   mutate(data!.id);
  //   if (status == 200) {
  //     setOpened(false);
  //     toast({
  //       title: "Application rejected",
  //       variant: "success",
  //       duration: 5000,
  //     });
  //   } else {
  //     toast({
  //       title: "Error rejecting application",
  //       variant: "destructive",
  //       duration: 5000,
  //     });
  //   }
  // };

  return (
    <Dialog open={opened} onOpenChange={() => setOpened(false)}>
      <DialogOverlay className="bg-black/10" />
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-black top-32">
        <DialogHeader>
          <DialogTitle className="leading-normal">
            Reject {data?.name ? `${_.upperFirst(data.name)}'s` : "this"} application
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400 ">
            Are you sure you want to reject{" "}
            {data?.name ? `${_.upperFirst(data.name)}'s` : "this"} application?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" onClick={() => {}}>
            Yes, Reject
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};