import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Settings, Bell, User, LayoutDashboard, Users, GraduationCap, ChevronDown } from "lucide-react";
import { useState } from "react";

export default function UserMenu() {
	const router = useRouter();
	const { data: session, isPending } = authClient.useSession();
	const [currentRole, setCurrentRole] = useState<"MENTOR" | "APPRENANT">("MENTOR");
	const [isOpen, setIsOpen] = useState(false);

	if (isPending) {
		return <Skeleton className="h-9 w-24" />;
	}

	if (!session) {
		return (
			<Button variant="outline" asChild>
				<Link href="/login">Sign In</Link>
			</Button>
		);
	}

	const handleRoleToggle = () => {
		setCurrentRole(currentRole === "MENTOR" ? "APPRENANT" : "MENTOR");
	};

	const getRoleIcon = (role: "MENTOR" | "APPRENANT") => {
		return role === "MENTOR" ? <Users className="h-4 w-4" /> : <GraduationCap className="h-4 w-4" />;
	};

	const getRoleLabel = (role: "MENTOR" | "APPRENANT") => {
		return role === "MENTOR" ? "Mentor" : "Apprenant";
	};

	return (
		<DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" className="flex items-center gap-2">
					<div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
						<User className="h-3 w-3 text-primary" />
					</div>
					{session.user.name}
					<ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="bg-card">
				<DropdownMenuLabel>My Account</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem>{session.user.email}</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem asChild>
					<Link href="/dashboard" className="flex items-center gap-2">
						<LayoutDashboard className="h-4 w-4" />
						Tableau de bord
					</Link>
				</DropdownMenuItem>
				<DropdownMenuItem asChild>
					<Link href="/profile" className="flex items-center gap-2">
						<User className="h-4 w-4" />
						Mon Profil
					</Link>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem 
					onClick={handleRoleToggle}
					className="flex items-center justify-between cursor-pointer"
				>
					<div className="flex items-center gap-2">
						{getRoleIcon(currentRole)}
						<span>Rôle actuel : {getRoleLabel(currentRole)}</span>
					</div>
					<Button
						variant="outline"
						size="sm"
						onClick={(e) => {
							e.stopPropagation();
							handleRoleToggle();
						}}
						className="ml-2"
					>
						Changer
					</Button>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem asChild>
					<Link href="/notifications" className="flex items-center gap-2">
						<Bell className="h-4 w-4" />
						Notifications
					</Link>
				</DropdownMenuItem>
				<DropdownMenuItem asChild>
					<Link href="/settings" className="flex items-center gap-2">
						<Settings className="h-4 w-4" />
						Paramètres
					</Link>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem asChild>
					<Button
						variant="destructive"
						className="w-full"
						onClick={() => {
							authClient.signOut({
								fetchOptions: {
									onSuccess: () => {
										router.push("/");
									},
								},
							});
						}}
					>
						Se déconnecter
					</Button>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
