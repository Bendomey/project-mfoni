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
import { useUnfeatureCollection } from "@/api";
import { Loader2Icon } from "lucide-react";

interface UnfeatureCollectionModalProps {
  data?: Collection;
  refetch: VoidFunction;
  opened: boolean;
  setOpened: Dispatch<SetStateAction<boolean>>;
}

export const UnfeatureCollectionModal = ({
  data,
  refetch,
  opened,
  setOpened,
}: UnfeatureCollectionModalProps) => {
  const { toast } = useToast();
  const { mutate, isPending: isLoading } = useUnfeatureCollection();

  const handleSubmit = () => {
    if (!data) {
      toast({
        title: "Collection data not found",
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
            title: "Collection unfeatured successfully",
            variant: "success",
          });
          setOpened(false);
        }
      }
      )
  };

  const name = <span className="capitalize">{data?.name.endsWith("s") ? data?.name : `${data?.name}'s`} </span> 

  return (
    <Dialog open={opened} onOpenChange={() => setOpened(false)}>
      <DialogOverlay className="bg-black/10" />
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-black top-32">
        <DialogHeader>
          <DialogTitle className="leading-normal">
          Stop featuring {data?.name ? name : "this"} collection
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Are you sure you want to stop featuring{" "}
            {data?.name ? name : "this"} collection?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button className="bg-red-600 hover:bg-red-400" disabled={isLoading} type="button" onClick={() => handleSubmit()}>
          { isLoading ? <Loader2Icon className="animate-spin" /> : null} Yes, stop featuring
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
