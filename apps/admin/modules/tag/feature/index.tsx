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
import { useFeatureTag } from "@/api";
import { Loader2Icon } from "lucide-react";

interface FeatureTagModalProps {
  data?: Tag;
  refetch: VoidFunction;
  opened: boolean;
  setOpened: Dispatch<SetStateAction<boolean>>;
}

export const FeatureTagModal = ({
  data,
  refetch,
  opened,
  setOpened,
}: FeatureTagModalProps) => {
  const { toast } = useToast();
  const { mutate, isPending: isLoading } = useFeatureTag();

  const handleSubmit = () => {
    if (!data) {
      toast({
        title: "Tag data not found",
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
            title: "Tag marked as featured",
            variant: "success",
          });
          setOpened(false);
        }
      }
      )
  };

  const name = <span className="capitalize">{data?.name}'s </span> 

  return (
    <Dialog open={opened} onOpenChange={() => setOpened(false)}>
      <DialogOverlay className="bg-black/10" />
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-black top-32">
        <DialogHeader>
          <DialogTitle className="leading-normal">
          Feature {data?.name ? name : "this"} tag
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Are you sure you want to mark{" "}
            {data?.name ? name : "this"} tag as featured?
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
