"use client";

import { useState } from "react";
import { trpc } from "@/utils/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import { PieChart, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PollOption {
  id: string;
  label: string;
}

interface PollResult {
  optionId: string;
  count: number;
}

interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  hasVoted: boolean;
  userOptionId?: string | null;
  totalVotes: number;
  results: PollResult[];
}

interface CommunityPollProps {
  poll: Poll;
  onVoteSuccess: () => void;
}

export function CommunityPoll({ poll, onVoteSuccess }: Readonly<CommunityPollProps>) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const voteMutation = trpc.community.voteInPoll.useMutation({
    onSuccess: () => {
      toast.success("Merci pour ton vote !");
      onVoteSuccess();
    },
    onError: (err: any) => {
      toast.error(err.message);
    }
  });

  const handleVote = () => {
    if (!selectedOption) return;
    voteMutation.mutate({ pollId: poll.id, optionId: selectedOption });
  };

  const getPercentage = (optionId: string) => {
    if (poll.totalVotes === 0) return 0;
    const count = poll.results.find(r => r.optionId === optionId)?.count || 0;
    return Math.round((count / poll.totalVotes) * 100);
  };

  return (
    <Card className="border border-border/50 bg-card/95 backdrop-blur-md shadow-xl rounded-2xl overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-brand"></div>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2 text-brand mb-1">
          <PieChart className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-widest">Sondage de la semaine</span>
        </div>
        <CardTitle className="text-xl font-black text-ls-heading leading-tight">
          {poll.question}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {poll.hasVoted ? (
          <div className="space-y-4">
            {poll.options.map((option) => {
              const percentage = getPercentage(option.id);
              const isUserChoice = poll.userOptionId === option.id;

              return (
                <div key={option.id} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className={cn("font-medium", isUserChoice ? "text-ls-heading" : "text-ls-muted")}>
                      {option.label}
                      {isUserChoice && <CheckCircle2 className="w-3 h-3 inline ml-1 text-ls-success" />}
                    </span>
                    <span className="font-bold text-ls-heading">{percentage}%</span>
                  </div>
                  <div className="h-2 w-full bg-border/30 rounded-full overflow-hidden">
                    <div
                      className={cn("h-full transition-all duration-1000", isUserChoice ? "bg-brand" : "bg-ls-muted/40")}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
            <p className="text-[10px] text-ls-muted text-center pt-2">
              {poll.totalVotes} vote(s) au total
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {poll.options.map((option) => (
              <button
                type="button"
                key={option.id}
                onClick={() => setSelectedOption(option.id)}
                className={cn(
                  "w-full p-3 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between group text-left",
                  selectedOption === option.id
                    ? "border-brand bg-brand-soft text-ls-heading"
                    : "border-border hover:border-brand/50 text-ls-text"
                )}
              >
                <span className="text-sm font-medium">{option.label}</span>
                <div
                  className={cn(
                    "w-4 h-4 rounded-full border-2 transition-all",
                    selectedOption === option.id ? "border-brand bg-brand" : "border-border"
                  )}
                  aria-hidden
                />
              </button>
            ))}
            <Button
              variant="cta" size="cta" className="w-full mt-4 font-bold h-11"
              disabled={!selectedOption || voteMutation.isPending}
              onClick={handleVote}
            >
              {voteMutation.isPending ? "Vote en cours..." : "Voter"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
