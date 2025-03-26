"use client"

import { useReducer } from "react"
import { Button } from "@/components/ui/button"
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
    DrawerFooter,
} from "@/components/ui/drawer"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import toast from 'react-hot-toast'
import { User } from "@prisma/client"

interface UserDrawerProps {
    user: User & {
        subscriptions: { status: string }[]
        apiUsageCount: number
    }
    open: boolean
    onOpenChange: (open: boolean) => void
    onUserUpdated: () => void
}

type State = {
    isSaving: boolean
    showConfirmDialog: boolean
    pendingAction: boolean | null
}

type Action =
    | { type: 'SHOW_CONFIRM_DIALOG'; payload: boolean }
    | { type: 'SET_PENDING_ACTION'; payload: boolean | null }
    | { type: 'START_SAVING' }
    | { type: 'END_SAVING' }

const initialState: State = {
    isSaving: false,
    showConfirmDialog: false,
    pendingAction: null
}

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case 'SHOW_CONFIRM_DIALOG':
            return { ...state, showConfirmDialog: action.payload }
        case 'SET_PENDING_ACTION':
            return { ...state, pendingAction: action.payload }
        case 'START_SAVING':
            return { ...state, isSaving: true }
        case 'END_SAVING':
            return { ...state, isSaving: false, showConfirmDialog: false }
        default:
            return state
    }
}

export function UserDrawer({ user, open, onOpenChange, onUserUpdated }: UserDrawerProps) {
    const [state, dispatch] = useReducer(reducer, initialState)

    if (!user) {
        return null;
    }

    const handleSuspend = async (suspended: boolean) => {
        dispatch({ type: 'SET_PENDING_ACTION', payload: suspended })
        dispatch({ type: 'SHOW_CONFIRM_DIALOG', payload: true })
    }

    const confirmSuspend = async () => {
        try {
            dispatch({ type: 'START_SAVING' })
            const response = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: user.id,
                    suspended: state.pendingAction
                })
            })

            if (!response.ok) {
                throw new Error(response.status === 401 ?
                    'Unauthorized' : 'Failed to update user')
            }

            toast.success(
                `${user.name} has been ${state.pendingAction ? 'suspended' : 'reactivated'}`
            )
            onUserUpdated()
            onOpenChange(false)
        } catch (error) {
            console.error('Error updating user:', error)
            toast.error('Failed to update user status')
        } finally {
            dispatch({ type: 'END_SAVING' })
        }
    }

    const getSubscriptionStatus = () => {
        if (!user.subscriptions?.length) return "None"
        const activeSub = user.subscriptions.find(sub =>
            ["active", "trialing"].includes(sub.status)
        )
        return activeSub ? "Active" : "Inactive"
    }

    return (
        <>
            <Drawer open={open} onOpenChange={onOpenChange} direction="right">
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle>User Details</DrawerTitle>
                        <DrawerDescription>
                            Manage user account and permissions
                        </DrawerDescription>
                    </DrawerHeader>

                    <div className="p-4 space-y-4">
                        <div>
                            <h3 className="font-medium">Name</h3>
                            <p className="text-sm text-muted-foreground">{user.name}</p>
                        </div>

                        <div>
                            <h3 className="font-medium">Email</h3>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>

                        <div>
                            <h3 className="font-medium">API Usage</h3>
                            <p className="text-sm text-muted-foreground">{user.apiUsageCount} requests</p>
                        </div>

                        <div>
                            <h3 className="font-medium">Subscription</h3>
                            <p className="text-sm text-muted-foreground">{getSubscriptionStatus()}</p>
                        </div>

                        <div>
                            <h3 className="font-medium">Status</h3>
                            <p className="text-sm text-muted-foreground">
                                {user.deletedAt ? "Suspended" : "Active"}
                            </p>
                        </div>
                    </div>

                    <DrawerFooter className="flex-row gap-2 justify-end">
                        {user.deletedAt ? (
                            <Button
                                variant="default"
                                onClick={() => handleSuspend(false)}
                                disabled={state.isSaving}
                            >
                                Unsuspend User
                            </Button>
                        ) : (
                            <Button
                                variant="destructive"
                                onClick={() => handleSuspend(true)}
                                disabled={state.isSaving}
                            >
                                Suspend User
                            </Button>
                        )}
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>

            <ConfirmationDialog
                open={state.showConfirmDialog}
                onOpenChange={(open) => dispatch({ type: 'SHOW_CONFIRM_DIALOG', payload: open })}
                title={state.pendingAction ? "Confirm User Suspension" : "Confirm User Reactivation"}
                description={
                    state.pendingAction
                        ? `Are you sure you want to suspend ${user.name}? They will lose access to the service.`
                        : `Are you sure you want to reactivate ${user.name}? They will regain access to the service.`
                }
                confirmText={state.pendingAction ? "Suspend User" : "Reactivate User"}
                variant={state.pendingAction ? "destructive" : "default"}
                onConfirm={confirmSuspend}
            />
        </>
    )
}
