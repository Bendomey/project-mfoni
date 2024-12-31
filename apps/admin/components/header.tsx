'use client'
import { cn } from "@/lib/utils";
import Link from "next/link";
import { buttonVariants } from "./ui/button";
import { siteConfig } from "@/config/site";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { usePathname } from "next/navigation";
import { ModeToggle } from "./ModeToggle";


const links = [
    {
        name: "Overview",
        href: "/"
    },
    {
        name: "Creator Applications",
        href: "/creator-applications"
    },
    {
        name: "Users",
        href: "/users"
    },
    {
        name: "Administrators",
        href: "/administrators"
    },
    {
        name: "Wallet Transactions",
        href: "/wallet-transactions"
    },
    {
        name: "Contents",
        href: "/contents"
    },
    {
        name: "Settings",
        href: "/settings"
    }
]

export function Header() {

    const pathname = usePathname();

    return (
        <div className="px-7 py-2 border-b border-zinc-200 dark:border-zinc-900 flex flex-row justify-between items-center">
            <div className="flex flex-row items-center">
                <Link href="/">
                    <div className="flex flex-row items-center font-extrabold lg:inline-block text-3xl">
                        <span className="text-blue-600">
                            {siteConfig.name}
                        </span>
                    </div>
                </Link>
                <div className="ml-5 flex flex-row items-center text-sm">
                    {
                        links.map((link, index) => (
                            <Link key={index} href={link.href} className={cn(
                                buttonVariants({
                                    variant: "ghost",
                                    className: "px-3"
                                }),
                                pathname === link.href ? "font-semibold" : "text-gray-500"
                            )}>
                                {link.name}
                            </Link>
                        ))
                    }
                   
                </div>
            </div>
            <div className="flex flex-row justify-between items-center space-x-4">
                <div>
                <DropdownMenu>
                    <DropdownMenuTrigger>
                        <Avatar>
                            <AvatarFallback>AD</AvatarFallback>
                        </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Profile</DropdownMenuItem>
                        <DropdownMenuItem>Billing</DropdownMenuItem>
                        <DropdownMenuItem>Team</DropdownMenuItem>
                        <DropdownMenuItem>Subscription</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                </div>
                <div>
                    <ModeToggle />
                </div>
            </div>
        </div>
    );
}