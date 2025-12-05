import * as React from "react"
import { Text, TouchableOpacity, TouchableOpacityProps, View } from "react-native"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
    "flex-row items-center justify-center rounded-md",
    {
        variants: {
            variant: {
                default: "bg-primary",
                destructive: "bg-destructive",
                outline: "border border-input bg-background",
                secondary: "bg-secondary",
                ghost: "hover:bg-accent hover:text-accent-foreground",
                link: "text-primary underline-offset-4",
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-9 rounded-md px-3",
                lg: "h-11 rounded-md px-8",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

const buttonTextVariants = cva(
    "text-sm font-medium transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium",
    {
        variants: {
            variant: {
                default: "text-primary-foreground",
                destructive: "text-destructive-foreground",
                outline: "text-foreground",
                secondary: "text-secondary-foreground",
                ghost: "text-foreground",
                link: "text-primary underline",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

export interface ButtonProps
    extends TouchableOpacityProps,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
}

const Button = React.forwardRef<React.ElementRef<typeof TouchableOpacity>, ButtonProps>(
    ({ className, variant, size, asChild = false, children, ...props }, ref) => {
        return (
            <TouchableOpacity
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            >
                {typeof children === 'string' ? (
                    <Text className={cn(buttonTextVariants({ variant }))}>
                        {children}
                    </Text>
                ) : (
                    children
                )}
            </TouchableOpacity>
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }
