import * as React from "react"
import { Modal, View, Text, TouchableOpacity, ViewProps } from "react-native"
import { cn } from "@/lib/utils"

const DialogContext = React.createContext<{
    open: boolean
    onOpenChange: (open: boolean) => void
} | null>(null)

const Dialog = ({ children, open, onOpenChange }: { children: React.ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }) => {
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
    const isControlled = open !== undefined
    const isOpen = isControlled ? open : uncontrolledOpen
    const handleOpenChange = (newOpen: boolean) => {
        if (!isControlled) setUncontrolledOpen(newOpen)
        onOpenChange?.(newOpen)
    }

    return (
        <DialogContext.Provider value={{ open: isOpen, onOpenChange: handleOpenChange }}>
            {children}
        </DialogContext.Provider>
    )
}

const DialogTrigger = ({ children, asChild, ...props }: React.ComponentProps<typeof TouchableOpacity> & { asChild?: boolean }) => {
    const context = React.useContext(DialogContext)
    return (
        <TouchableOpacity onPress={() => context?.onOpenChange(true)} {...props}>
            {children}
        </TouchableOpacity>
    )
}

const DialogContent = React.forwardRef<View, ViewProps>(({ className, children, ...props }, ref) => {
    const context = React.useContext(DialogContext)
    if (!context?.open) return null

    return (
        <Modal
            transparent
            animationType="fade"
            visible={context.open}
            onRequestClose={() => context.onOpenChange(false)}
        >
            <View className="flex-1 items-center justify-center bg-black/50">
                <View
                    ref={ref}
                    className={cn(
                        "w-full max-w-lg rounded-lg border border-border bg-background p-6 shadow-lg",
                        className
                    )}
                    {...props}
                >
                    {children}
                    <TouchableOpacity
                        className="absolute right-4 top-4 opacity-70"
                        onPress={() => context.onOpenChange(false)}
                    >
                        <Text className="text-foreground">✕</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    )
})
DialogContent.displayName = "DialogContent"

const DialogHeader = ({ className, ...props }: ViewProps) => (
    <View className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({ className, ...props }: ViewProps) => (
    <View className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<Text, React.ComponentProps<typeof Text>>(({ className, ...props }, ref) => (
    <Text
        ref={ref}
        className={cn("text-lg font-semibold leading-none tracking-tight text-foreground", className)}
        {...props}
    />
))
DialogTitle.displayName = "DialogTitle"

const DialogDescription = React.forwardRef<Text, React.ComponentProps<typeof Text>>(({ className, ...props }, ref) => (
    <Text
        ref={ref}
        className={cn("text-sm text-muted-foreground", className)}
        {...props}
    />
))
DialogDescription.displayName = "DialogDescription"

export {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
}
