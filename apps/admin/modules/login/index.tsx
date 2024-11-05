"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { useLogin } from "@/api";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "next/navigation";
import { ROUTES } from "@/constants/pages";
import { useCurrentUser } from "@/providers/auth";
import { useEffect, useState } from "react";
import { EyeOffIcon } from "lucide-react";
import { EyeOpenIcon } from "@radix-ui/react-icons";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormProps = z.infer<typeof formSchema>;

export function LoginModule() {
  const { mutate, isPending: isLoading } = useLogin();
  const { signIn, signOut } = useCurrentUser();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [isVisible, setIsVisible] = useState(false);

  const redirectTo = searchParams.get("redirect_to");

  const form = useForm<LoginFormProps>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    signOut();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (values: LoginFormProps) => {
    mutate(values, {
      onSuccess: async (data) => {
        if (data) {
          await signIn(data);
          if (redirectTo) {
            document.location = redirectTo as string;
          } else {
            document.location = ROUTES.DASHBOARD as string;
          }
        }
      },
      onError: (e) => {
        if (e instanceof Error) {
          toast({
            title: "Error Logging In!",
            variant: "destructive",
            duration: 5000,
          });
        }
      },
    });
  };

  return (
    <>
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="w-1/3 p-6 my-10 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
          <h2 className="text-3xl text-gray-600 font-bold text-center mb-2">
            Welcome back!
          </h2>
          <p className="text-gray-500 text-center mb-6">
            Forgot your password?{" "}
            <a
              href="/forgot-password"
              className="text-blue-600 hover:underline"
            >
              Recover
            </a>
          </p>

          <div className="p-5">
            <Form {...form}>
              <form
                className="space-y-4"
                onSubmit={form.handleSubmit(handleSubmit)}
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel
                        htmlFor="email"
                        className="text-lg text-gray-700 dark:text-gray-300 font-medium"
                      >
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your email"
                          {...field}
                          className="text-gray-800 dark:text-gray-200"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel
                        htmlFor="password"
                        className="text-lg text-gray-700 dark:text-gray-300 font-medium"
                      >
                        Password
                      </FormLabel>
                      <FormControl className="relative">
                        <div className="relative">
                          <Input
                            placeholder="Enter your password"
                            {...field}
                            type={isVisible ? "text" : "password"}
                            className="text-gray-800"
                          />
                          <div
                            className="absolute inset-y-0 right-0 flex items-center p-3 cursor-pointer"
                            onClick={() => setIsVisible(!isVisible)}
                          >
                            {isVisible ? (
                              <EyeOffIcon className="h-6 w-6" />
                            ) : (
                              <EyeOpenIcon className="h-6 w-6" />
                            )}
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center space-x-2 mt-4">
                  <Checkbox id="remember_me" />
                  <Label
                    htmlFor="remember_me"
                    className="text-gray-700 dark:text-gray-300 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Remember me
                  </Label>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-black text-white hover:bg-gray-800 mt-4"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </>
  );
}
