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
import { useApproveApplication } from "@/TestData";
import { useToast } from "@/hooks/use-toast";

interface AcceptApplicationModalProps {
  data?: Application;
  refetch?: VoidFunction;
  opened: boolean;
  setOpened: Dispatch<SetStateAction<boolean>>;
}

export const ApproveApplicationModal = ({
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
        description: "Application successfully approved",
        variant: "success",
        duration: 5000,
      });
    } else {
      toast({
        title: "Error approving application",
        description: "There was a problem with your request.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  return (
    <Dialog open={opened} onOpenChange={() => setOpened(false)}>
      <DialogOverlay className="bg-black/10" />
      <DialogContent className="sm:max-w-[425px] bg-black top-32">
        <DialogHeader>
          <DialogTitle className="leading-normal">
            Approve {data?.name ? `${data.name}'s` : "this"} application
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Are you sure you want to approve{" "}
            {data?.name ? `${data.name}'s` : "this"} application?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" onClick={() => handleSubmit()}>
            Yes, Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
