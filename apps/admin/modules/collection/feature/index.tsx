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
import { useFeatureCollection } from "@/api";
import { Loader2Icon } from "lucide-react";

interface FeatureCollectionModalProps {
  data?: Collection;
  refetch: VoidFunction;
  opened: boolean;
  setOpened: Dispatch<SetStateAction<boolean>>;
}

export const FeatureCollectionModal = ({
  data,
  refetch,
  opened,
  setOpened,
}: FeatureCollectionModalProps) => {
  const { toast } = useToast();
  const { mutate, isPending: isLoading } = useFeatureCollection();

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
            title: "Collection marked as featured",
            variant: "success",
          });
          setOpened(false);
        }
      }
      )
  };

  const name = <span className="capitalize">{data?.name ? (data.name.endsWith("s") ? data.name : `${data.name}'s`) : "this"} </span> 

  return (
    <Dialog open={opened} onOpenChange={() => setOpened(false)}>
      <DialogOverlay className="bg-black/10" />
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-black top-32">
        <DialogHeader>
          <DialogTitle className="leading-normal">
          Feature {name} collection
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Are you sure you want to mark{" "}
            {name} collection as featured?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button className="bg-emerald-600 hover:bg-emerald-400" disabled={isLoading} type="button" onClick={() => handleSubmit()}>
          { isLoading ? <Loader2Icon className="animate-spin" /> : null} Yes, mark as featured
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
