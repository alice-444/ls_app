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
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Settings,
  Bell,
  User,
  LayoutDashboard,
  Users,
  GraduationCap,
  ChevronDown,
  BookOpen,
} from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUserRole } from "@/lib/api-client";

export default function UserMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();
  const [isOpen, setIsOpen] = useState(false);

  const { data: userRole, isLoading: isLoadingRole } = useQuery({
    queryKey: ["userRole", session?.user?.id],
    queryFn: getUserRole,
    enabled: !!session?.user?.id,
    staleTime: 5 * 60 * 1000,
  });

  if (isPending) {
    return <Skeleton className="h-9 w-24" />;
  }

  if (!session) {
    if (pathname === "/login") {
      return null;
    }
    return (
      <Button variant="outline" asChild>
        <Link href="/login">Sign In</Link>
      </Button>
    );
  }

  if (isLoadingRole) {
    return <Skeleton className="h-9 w-24" />;
  }

  const getRoleIcon = (role: "MENTOR" | "APPRENANT" | null) => {
    return role === "MENTOR" ? (
      <Users className="h-4 w-4" />
    ) : (
      <GraduationCap className="h-4 w-4" />
    );
  };

  const getRoleLabel = (role: "MENTOR" | "APPRENANT" | null) => {
    return role === "MENTOR" ? "Mentor" : "Apprenant";
  };

  const isMentor = userRole === "MENTOR";
  const isApprenant = userRole === "APPRENANT";

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-3 w-3 text-primary" />
          </div>
          {session.user.name}
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
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
        {isMentor && (
          <>
            <DropdownMenuItem asChild>
              <Link href="/my-workshops" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Mes Ateliers
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/workshop-editor" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Atelab
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/mentor-profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Mon Profil Mentor
              </Link>
            </DropdownMenuItem>
          </>
        )}
        {isApprenant && (
          <>
            <DropdownMenuItem asChild>
              <Link href="/workshop-room" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                e-Atelier
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/profil" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profil
              </Link>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        {userRole && (
          <DropdownMenuItem className="flex items-center gap-2 cursor-default">
            {getRoleIcon(userRole)}
            <span>Rôle : {getRoleLabel(userRole)}</span>
          </DropdownMenuItem>
        )}
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
