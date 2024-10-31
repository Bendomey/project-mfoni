import { Button } from "@/components/ui/button"
import { Dispatch, SetStateAction } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogOverlay,
} from "@/components/ui/dialog"
import { useApproveApplication } from "@/TestData";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast"


interface AcceptApplicationModalProps {
    data?: Application;
    refetch?: VoidFunction;
    opened: boolean;
    setOpened: Dispatch<SetStateAction<boolean>>;
}

export const ApproveApplicationModal = ({data,refetch, opened, setOpened,}: AcceptApplicationModalProps) => {
  const { toast } = useToast()
const { mutate, status } = useApproveApplication();


const handleSubmit = () => {
      mutate(data!.id)
                if(status == 200){
                  console.log('success')
                  setOpened(false)
                  toast({
                    title: "Uh oh! Something went wrong.",
                    description: "There was a problem with your request.",
                    variant: "default"
                  })
                }
                else{
                  toast({
                    title: "Uh oh! Something went wrong.",
                    description: "There was a problem with your request.",
                    variant: "destructive",
                    duration: 50000
                  })
                  console.log('error----')
            }
        }     
  
    
  return (
    <Dialog open={opened} onOpenChange={() => setOpened(false)}>
      <DialogOverlay className="bg-black/10" /> 
      <DialogContent className="sm:max-w-[425px] bg-black top-32" >
        <DialogHeader>
          <DialogTitle className="leading-normal">Approve {data?.name ? `${data.name}'s`: "this"} application</DialogTitle>
          <DialogDescription className="text-gray-400">
            Are you sure you want to approve {data?.name ? `${data.name}'s`: "this"} application?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" onClick={()=> handleSubmit()}>Yes, Approve</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
