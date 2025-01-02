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
import { useUnfeatureContent } from "@/api";
import { Loader2Icon } from "lucide-react";

interface UnfeatureContentModalProps {
  data?: Content;
  refetch: VoidFunction;
  opened: boolean;
  setOpened: Dispatch<SetStateAction<boolean>>;
}

export const UnfeatureContentModal = ({
  data,
  refetch,
  opened,
  setOpened,
}: UnfeatureContentModalProps) => {
  const { toast } = useToast();
  const { mutate, isPending: isLoading } = useUnfeatureContent();

  const handleSubmit = () => {
    if (!data) {
      toast({
        title: "Content data not found",
        variant: "destructive",
      })
      return;
    }

      mutate(
        data.id,
        {
          onError: () => {
            toast({
              title: "We couldn't process your request",
              variant: "destructive",
            })   
            
          }, onSuccess: () => {
          refetch()
          toast({
            title: "Content marked as featured",
            variant: "success",
          });
          setOpened(false);
        }
      }
      )
  };

  const title = <span className="capitalize">{data?.title}'s </span> 

  return (
    <Dialog open={opened} onOpenChange={() => setOpened(false)}>
      <DialogOverlay className="bg-black/10" />
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-black top-32">
        <DialogHeader>
          <DialogTitle className="leading-normal">
          Stop featuring {data?.title ? title : "this"} content
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Are you sure you want to stop featuring{" "}
            {data?.title ? title : "this"} content?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button className="bg-emerald-600 hover:bg-emerald-400" disabled={isLoading} type="button" onClick={() => handleSubmit()}>
          { isLoading ? <Loader2Icon className="animate-spin" /> : null} Yes, stop featuring
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
