import * as React from "react"
import { ScrollView, ScrollViewProps } from "react-native"
import { cn } from "@/lib/utils"

const ScrollArea = React.forwardRef<ScrollView, ScrollViewProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <ScrollView
                ref={ref}
                className={cn("relative overflow-hidden", className)}
                {...props}
            >
                {children}
            </ScrollView>
        )
    }
)
ScrollArea.displayName = "ScrollArea"

const ScrollBar = () => null // No-op for native as ScrollView handles it

export { ScrollArea, ScrollBar }
