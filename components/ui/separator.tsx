import * as React from "react"
import { View, ViewProps } from "react-native"
import { cn } from "@/lib/utils"

const Separator = React.forwardRef<View, ViewProps & { orientation?: "horizontal" | "vertical", decorative?: boolean }>(
    (
        { className, orientation = "horizontal", decorative = true, ...props },
        ref
    ) => (
        <View
            ref={ref}
            className={cn(
                "shrink-0 bg-border",
                orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
                className
            )}
            {...props}
        />
    )
)
Separator.displayName = "Separator"

export { Separator }
