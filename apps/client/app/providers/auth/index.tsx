/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { USER_CIPHER } from "@/constants/index.ts";
import { auth } from "@/lib/cookies.config.ts";
import { type PropsWithChildren, createContext, useMemo, useContext } from "react";
import { toast } from "react-hot-toast";

interface AuthContextProps {
    isLoading: boolean;
    currentUser?: User;
    getToken: () => Nullable<string>;
    onSignin: (input: { user: User, token: string }) => void;
    onSignout: () => void;
}

export const AuthContext = createContext<AuthContextProps>({
    isLoading: false,
    onSignin: () => { },
    onSignout: () => { },
    getToken: () => null
})

export const AuthProvider = ({ children }: PropsWithChildren) => {

    const authController = useMemo(() => ({
        onSignin: ({ token }: { user: User, token: string }) => {
            auth.setCipher(USER_CIPHER, token)
        },
        onSignout: () => {
            const token = auth.getCipher(USER_CIPHER)
            if (token) {
                auth.clearCipher(USER_CIPHER);
                toast.success("Logged out successfully", { id: 'logout-success' })
            }
        },
        getToken: () => {
            const token = auth.getCipher(USER_CIPHER)
            return token ?? null
        }
    }), [])

    return (
        <AuthContext.Provider value={{
            ...authController,
            isLoading: false,
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)

    if (!context) {
        throw new Error("useAuth must be used within AuthProvider")
    }

    return context
}