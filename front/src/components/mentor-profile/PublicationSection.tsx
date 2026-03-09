"use client";

import { Eye, EyeOff, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PublicationSectionProps {
  readonly isPublished: boolean;
  readonly isSubmitting: boolean;
  readonly isFormSubmitting: boolean;
  readonly isPublishing: boolean;
  readonly isUnpublishing: boolean;
  readonly handlePublish: () => void;
  readonly handleUnpublish: () => void;
}

export function PublicationSection({
  isPublished,
  isSubmitting,
  isFormSubmitting,
  isPublishing,
  isUnpublishing,
  handlePublish,
  handleUnpublish,
}: PublicationSectionProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Eye className="h-8 w-8 text-ls-heading" />
        <h2 className="text-2xl font-semibold text-ls-heading">Publication</h2>
      </div>
      <p className="text-base text-ls-muted">
        Gérez la visibilité de votre profil dans le répertoire des mentors
      </p>

      {isPublished && (
          <div className="flex items-center gap-2 p-3 bg-ls-success-soft border border-ls-success rounded-2xl">
          <CheckCircle2 className="h-5 w-5 text-ls-success" />
          <span className="text-sm font-medium text-ls-success">
            Votre profil est publié et visible dans le répertoire des mentors
          </span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        {isPublished ? (
          <Button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleUnpublish();
            }}
            disabled={isUnpublishing}
            className="flex-1 bg-brand hover:bg-brand-hover text-[#161616] rounded-full font-semibold"
            size="lg"
          >
            {isUnpublishing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Dépublication...
              </>
            ) : (
              <>
                <EyeOff className="mr-2 h-4 w-4" />
                Dépublier le profil
              </>
            )}
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handlePublish}
            disabled={isPublishing || isSubmitting || isFormSubmitting}
            className="flex-1 bg-ls-success hover:bg-ls-success/90 text-white rounded-full font-semibold"
            size="lg"
          >
            {isPublishing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Publication...
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Publier le profil
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
