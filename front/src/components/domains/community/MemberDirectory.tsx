"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Users, UserPlus } from "lucide-react";
import Link from "next/link";

interface Member {
  id: string;
  name: string;
  displayName?: string | null;
  photoUrl?: string | null;
  role?: string | null;
  title?: string | null;
}

interface MemberDirectoryProps {
  members: Member[];
}

export function MemberDirectory({ members }: Readonly<MemberDirectoryProps>) {
  return (
    <Card className="border border-border/50 bg-card/95 backdrop-blur-md shadow-xl rounded-2xl overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2 text-ls-blue mb-1">
          <Users className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-widest">Membres à la une</span>
        </div>
        <CardTitle className="text-xl font-black text-ls-heading">
          Nouveaux arrivants
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <div className="divide-y divide-border/30">
          {members.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-4 hover:bg-brand-soft/30 transition-all group">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="w-10 h-10 border-2 border-border group-hover:border-brand transition-colors">
                    {member.photoUrl && <AvatarImage src={member.photoUrl} alt={member.name} />}
                    <AvatarFallback className="bg-ls-blue-soft text-ls-blue font-bold">
                      {member.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-ls-success border-2 border-white dark:border-ls-surface rounded-full"></div>
                </div>
                <div>
                  <Link href={`/mentor-profile/${member.id}`} className="text-sm font-bold text-ls-heading hover:text-brand transition-colors">
                    {member.displayName || member.name}
                  </Link>
                  <p className="text-[10px] text-ls-muted font-medium uppercase tracking-tight">
                    {member.role === "MENTOR" ? "Mentor" : "Apprenant"} • {member.title || "Explorateur"}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-brand-soft hover:text-brand text-ls-muted">
                <UserPlus className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
        <div className="p-4 pt-2">
          <Button variant="ctaOutline" size="cta" className="w-full text-xs font-bold h-10" asChild>
            <Link href="/mentors">Voir tout le monde</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
