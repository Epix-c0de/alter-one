import * as React from "react"
import { View, Text, TouchableOpacity, ViewProps } from "react-native"
import { cn } from "@/lib/utils"

const TabsContext = React.createContext<{
    value: string
    onValueChange: (value: string) => void
} | null>(null)

const Tabs = React.forwardRef<View, ViewProps & { value: string; onValueChange: (value: string) => void }>(
    ({ className, value, onValueChange, ...props }, ref) => (
        <TabsContext.Provider value={{ value, onValueChange }}>
            <View ref={ref} className={cn("flex flex-col gap-2", className)} {...props} />
        </TabsContext.Provider>
    )
)
Tabs.displayName = "Tabs"

const TabsList = React.forwardRef<View, ViewProps>(({ className, ...props }, ref) => (
    <View
        ref={ref}
        className={cn(
            "flex flex-row items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
            className
        )}
        {...props}
    />
))
TabsList.displayName = "TabsList"

const TabsTrigger = React.forwardRef<React.ElementRef<typeof TouchableOpacity>, React.ComponentProps<typeof TouchableOpacity> & { value: string }>(
    ({ className, value, children, ...props }, ref) => {
        const context = React.useContext(TabsContext)
        const isActive = context?.value === value

        return (
            <TouchableOpacity
                ref={ref}
                onPress={() => context?.onValueChange(value)}
                className={cn(
                    "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                    isActive && "bg-background text-foreground shadow-sm",
                    className
                )}
                {...props}
            >
                {typeof children === 'string' ? <Text className={isActive ? "text-foreground font-medium" : "text-muted-foreground"}>{children}</Text> : children}
            </TouchableOpacity>
        )
    }
)
TabsTrigger.displayName = "TabsTrigger"

const TabsContent = React.forwardRef<View, ViewProps & { value: string }>(
    ({ className, value, ...props }, ref) => {
        const context = React.useContext(TabsContext)
        if (context?.value !== value) return null

        return (
            <View
                ref={ref}
                className={cn(
                    "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    className
                )}
                {...props}
            />
        )
    }
)
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }
