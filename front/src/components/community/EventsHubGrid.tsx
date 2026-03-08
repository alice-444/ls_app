"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, ExternalLink, Info } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  date: Date | string;
  location: string;
  link?: string | null;
}

interface EventsHubGridProps {
  events: CommunityEvent[];
}

export function EventsHubGrid({ events }: EventsHubGridProps) {
  if (events.length === 0) {
    return (
      <div className="bg-ls-bg/50 border-2 border-dashed border-ls-border rounded-3xl p-12 text-center">
        <div className="bg-ls-blue/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-8 h-8 text-ls-blue" />
        </div>
        <h3 className="text-xl font-bold text-ls-heading mb-2">No Community Events Yet</h3>
        <p className="text-ls-text-light max-w-sm mx-auto">
          Be the first to propose a meetup, a webinar, or a student event to the community!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {events.map((event) => (
        <Card key={event.id} className="overflow-hidden border-ls-border hover:border-brand/30 hover:shadow-xl transition-all duration-300 rounded-3xl group">
          <CardHeader className="bg-gradient-to-br from-ls-blue/5 to-brand/5 p-6">
            <div className="flex justify-between items-start mb-2">
              <Badge variant="secondary" className="bg-brand/10 text-brand border-brand/20 rounded-full px-3">
                Events Hub
              </Badge>
              <div className="bg-white/80 backdrop-blur-sm p-2 rounded-2xl shadow-sm text-center min-w-[60px]">
                <span className="block text-xs font-bold text-ls-text-light uppercase">
                  {format(new Date(event.date), "MMM", { locale: fr })}
                </span>
                <span className="block text-2xl font-black text-brand leading-none">
                  {format(new Date(event.date), "dd")}
                </span>
              </div>
            </div>
            <CardTitle className="text-xl font-black text-ls-heading line-clamp-1 group-hover:text-brand transition-colors">
              {event.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-ls-text-light text-sm line-clamp-3 mb-4 min-h-[60px]">
              {event.description}
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-ls-heading">
                <Calendar className="w-4 h-4 text-brand" />
                {format(new Date(event.date), "EEEE d MMMM à HH:mm", { locale: fr })}
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-ls-heading">
                <MapPin className="w-4 h-4 text-brand" />
                {event.location}
              </div>
            </div>
          </CardContent>
          <CardFooter className="p-6 pt-0">
            {event.link ? (
              <Button asChild className="w-full bg-brand hover:bg-brand/90 text-white font-bold h-11 rounded-full shadow-lg shadow-brand/20">
                <a href={event.link} target="_blank" rel="noopener noreferrer">
                  Join Event <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </Button>
            ) : (
              <Button variant="outline" className="w-full border-brand/20 text-brand font-bold h-11 rounded-full" disabled>
                Check Details <Info className="w-4 h-4 ml-2" />
              </Button>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
