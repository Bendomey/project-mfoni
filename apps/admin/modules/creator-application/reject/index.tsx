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
import { useRejectCreatorApplication } from "@/api";
import { Loader2Icon } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface RejectApplicationModalProps {
  data?: CreatorApplication;
  refetch: VoidFunction;
  opened: boolean;
  setOpened: Dispatch<SetStateAction<boolean>>;
}

const formSchema = z.object({
  reason: z.string().min(1, "Reason is required"),
});

type RejectCreatorApplcationInputParams = z.infer<typeof formSchema>;

export const RejectApplicationModal = ({
  data,
  refetch,
  opened,
  setOpened,
}: RejectApplicationModalProps) => {
  const { toast } = useToast();
  const { mutate, isPending: isLoading } = useRejectCreatorApplication();

  const form = useForm<RejectCreatorApplcationInputParams>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reason: "",
    },
  });

  const handleSubmit = ({ reason }: RejectCreatorApplcationInputParams) => {
    if (!data) {
      toast({
        title: "Application data not found",
        variant: "destructive",
      });
      return;
    }

    mutate(
      {
        id: data.id,
        reason,
      },
      {
        onError: () => {
          toast({
            title: "We couldn't process your request",
            variant: "destructive",
          });
        },
        onSuccess: () => {
          refetch();
          toast({
            title: "Application rejected",
            variant: "success",
          });
          setOpened(false);
          form.reset();
        },
      }
    );
  };

  return (
    <Dialog open={opened} onOpenChange={() => setOpened(false)}>
      <DialogOverlay className="bg-black/10" />
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-black top-52">
        <DialogHeader>
          <DialogTitle className="leading-normal">
            Reject {data?.name ? `${_.upperFirst(data.name)}'s` : "this"}{" "}
            application
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400 ">
            Are you sure you want to reject{" "}
            {data?.name ? `${_.upperFirst(data.name)}'s` : "this"} application?
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            className="space-y-4 mt-3"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    htmlFor="reason"
                    className="text-md text-gray-700 dark:text-gray-300 font-normal"
                  >
                    Reason For Rejection
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Reason for rejecting here."
                      {...field}
                      className="text-gray-800 dark:text-gray-200"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex flex-row justify-end">
              <Button disabled={isLoading} type="submit">
                {isLoading ? <Loader2Icon className="animate-spin" /> : null}{" "}
                Yes, Reject
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
