import * as React from "react"
import { TextInput, TextInputProps } from "react-native"
import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<React.ElementRef<typeof TextInput>, TextInputProps>(
    ({ className, placeholderTextColor, ...props }, ref) => {
        return (
            <TextInput
                ref={ref}
                multiline
                className={cn(
                    "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                    className
                )}
                placeholderTextColor={placeholderTextColor || "#666"}
                textAlignVertical="top"
                {...props}
            />
        )
    }
)
Textarea.displayName = "Textarea"

export { Textarea }
