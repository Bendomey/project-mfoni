import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { Link } from '@remix-run/react'
import { cva, type VariantProps } from "class-variance-authority"
import { classNames } from '@/lib/classNames.ts'


const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md font-semibold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        solid: '',
        outlined: "bg-white border border-gray-300 disabled:bg-gray-200 disabled:hover:bg-gray-200",
        unstyled: '',
      },
      size: {
        md: "px-4 py-3 md:py-2 text-base md:text-sm",
        sm: "px-3.5 py-2 md:py-1 text-sm md:text-xs",
        lg: "px-6 py-3 text-lg",
        xl: "px-8 py-2 md:py-4 text-lg md:text-xl",
      },
      color: {
        primary: "bg-blue-600 text-white hover:bg-blue-800",
        secondary: "bg-gray-600 text-white hover:bg-gray-800",
        danger: "bg-red-600 text-white hover:bg-red-800",
        success: "bg-green-600 text-white hover:bg-green-800",
        warning: "bg-yellow-600 text-white hover:bg-yellow-800",
        info: "bg-indigo-600 text-white hover:bg-indigo-800",
        black: "bg-black text-white hover:bg-gray-900",
        white: "bg-white text-gray-900 hover:bg-gray-100",

        primaryGhost: "bg-blue-100 text-blue-900 hover:bg-blue-200",
        secondaryGhost: "bg-gray-100 text-gray-900  hover:bg-gray-200",
        dangerGhost: "bg-red-100 text-red-900 hover:bg-red-200",
        successGhost: "bg-green-100 text-green-900  hover:bg-green-200",
        warningGhost: "bg-yellow-100 text-yellow-900  hover:bg-yellow-200",
        infoGhost: "bg-indigo-100 text-indigo-900  hover:bg-indigo-200",
      }
    },
    compoundVariants: [
      {
        variant: 'solid',
        size: ['lg', 'md', 'sm', 'xl'],
        color: ['primary', 'secondary', 'danger', 'success', 'warning', 'info']
      },
      {
        variant: 'outlined',
        size: ['lg', 'md', 'sm', 'xl'],
        className: 'bg-white text-gray-900 hover:bg-gray-100'
      },
      {
        variant: 'unstyled',
        className: 'bg-transparent border-none hover:bg-transparent text-base p-0 text-inherit font-normal'
      }
    ],
    defaultVariants: {
      variant: "solid",
      size: "md",
      color: "primary",
    },
  }
)

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "size" | "color" | "variant">,
  VariantProps<typeof buttonVariants> {
  isLink?: boolean
  href?: string
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, color, isLink = false, asChild = false, type = 'button', ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    if (isLink) {
      return (
        <Link
          to={props.href ?? '/'}
          className={classNames(buttonVariants({ variant, size, className, color }))}
          aria-disabled={props.disabled}
        >
          {props.children}
        </Link>
      )
    }
    return (
      <Comp
        className={classNames(buttonVariants({ variant, size, className, color }))}
        ref={ref}
        type={type}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

