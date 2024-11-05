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
import { useApproveApplication } from "@/TestData";
import { useToast } from "@/hooks/use-toast";
import _ from "lodash";

interface AcceptApplicationModalProps {
  data?: Application;
  refetch?: VoidFunction;
  opened: boolean;
  setOpened: Dispatch<SetStateAction<boolean>>;
}

export const ViewApplicationModal = ({
  data,
  refetch,
  opened,
  setOpened,
}: AcceptApplicationModalProps) => {
  const { toast } = useToast();
  const { mutate, status } = useApproveApplication();

  const handleSubmit = () => {
    mutate(data!.id);
    if (status == 200) {
      setOpened(false);
      toast({
        title: "Application approved",
        variant: "success",
        duration: 5000,
      });
    } else {
      toast({
        title: "Error approving application",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  return (
    <Dialog open={opened} onOpenChange={() => setOpened(false)}>
      <DialogOverlay className="bg-black/10" />
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-black top-32">
        <DialogHeader>
          <DialogTitle className="leading-normal">
          Approve {data?.name ? `${_.upperFirst(data.name)}'s` : "this"} application
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Are you sure you want to approve{" "}
            {data?.name ? `${_.upperFirst(data.name)}'s` : "this"} application?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
        <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
         <div>
          <Button type="button" onClick={() => handleSubmit()}>
            Reject
          </Button>
          <Button type="button" onClick={() => handleSubmit()}>
            Approve
          </Button>
         </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
