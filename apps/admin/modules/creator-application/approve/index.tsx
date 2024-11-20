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
import { useApproveCreatorApplication } from "@/api";
import { Loader2Icon } from "lucide-react";

interface AcceptApplicationModalProps {
  data?: CreatorApplication;
  refetch: VoidFunction;
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
  const { mutate, isPending: isLoading } = useApproveCreatorApplication();

  const handleSubmit = () => {
    mutate(data!.id),{
      onError: () => {
        toast({
          title: "Error approving application",
          variant: "destructive",
          duration: 5000,
        })   
      },
      onSuccess: () => {
      refetch()
      toast({
        title: "Application approved",
        variant: "success",
        duration: 5000,
      });
      setOpened(false);
    }}
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
          <Button disabled={isLoading} type="button" onClick={() => handleSubmit()}>
          { isLoading && (<Loader2Icon className="animate-spin" />)} Yes, Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
