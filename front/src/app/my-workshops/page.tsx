"use client";

import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  getStatusBadge,
  formatDate,
  formatTime,
  isWorkshopEnded,
} from "@/lib/workshop-utils";
import { DeleteWorkshopDialog } from "@/components/workshop/dialogs/DeleteWorkshopDialog";
import {
  Calendar,
  Clock,
  Users,
  Plus,
  Edit,
  CheckCircle,
  Trash2,
  Eye,
  EyeOff,
  MapPin,
  Link as LinkIcon,
} from "lucide-react";
import { AcceptWorkshopRequestDialog } from "@/components/mentor/AcceptWorkshopRequestDialog";
import { RejectWorkshopRequestDialog } from "@/components/mentor/RejectWorkshopRequestDialog";
import { WorkshopStatsCards } from "@/components/workshop/stats/WorkshopStatsCards";
import { WorkshopRequests } from "@/components/workshop/requests/WorkshopRequests";
import { PageContainer } from "@/components/layout";
import ShinyText from "@/components/ui/ShinyText";
import { motion, useReducedMotion } from "framer-motion";
import type { WorkshopDetailed } from "@/types/workshop";

import { useMyWorkshops } from "@/hooks/useMyWorkshops";
import {
  NextWorkshopBanner,
  WorkshopFiltersBar,
  CalendarSection,
} from "@/components/my-workshops";

export default function MyWorkshopsPage() {
  const {
    router,
    session,
    isSessionLoading,
    userRole,
    isLoadingRole,
    isLoading,
    workshopsError,
    workshops,
    searchQuery,
    setSearchQuery,
    sortField,
    setSortField,
    sortOrder,
    setSortOrder,
    statusFilter,
    setStatusFilter,
    filteredAndSortedWorkshops,
    upcomingWorkshops,
    nextWorkshop,
    countdown,
    pendingRequestsCount,
    calendarDate,
    calendarView,
    setCalendarView,
    navigateCalendar,
    setCalendarDate,
    showDeleteDialog,
    setShowDeleteDialog,
    selectedRequest,
    setSelectedRequest,
    showAcceptDialog,
    setShowAcceptDialog,
    showRejectDialog,
    setShowRejectDialog,
    expandedWorkshopId,
    setExpandedWorkshopId,
    deleteMutation,
    publishMutation,
    unpublishMutation,
    confirmAttendanceMutation,
    rejectRequest,
    utils,
    handleAcceptRequest,
    handleRejectRequest,
    confirmRejectRequest,
    handleDelete,
    handlePublish,
    handleUnpublish,
    handleConfirmComplete,
  } = useMyWorkshops();

  const prefersReducedMotion = useReducedMotion();

  if (!isSessionLoading && !session) redirect("/login");

  if (isSessionLoading || isLoading || isLoadingRole) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4" />
            <p className="text-ls-muted">Chargement de tes ateliers...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!session) {
    return null;
  }

  if (userRole !== "MENTOR") {
    return (
      <PageContainer>
        <Card className="border-border/50 bg-card/95 backdrop-blur-md shadow-xl">
          <CardHeader>
            <CardTitle className="text-brand">
              Accès réservé aux mentors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-ls-text mb-4">
              Cette page est réservée aux mentors. Ton rôle actuel est :{" "}
              <strong>{userRole || "Non défini"}</strong>
            </p>
            <p className="text-sm text-ls-muted mb-4">
              Si tu devrais avoir accès à cette page, vérifie ton profil et
              sélectionne le rôle MENTOR.
            </p>
            <Button onClick={() => router.push("/dashboard")} className="rounded-full">
              Retour au dashboard
            </Button>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  if (workshopsError) {
    return (
      <PageContainer>
        <Card className="border-destructive bg-card/95 backdrop-blur-md shadow-xl">
          <CardHeader>
            <CardTitle className="text-destructive">
              Erreur d&apos;accès
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-ls-text mb-4">
              {workshopsError.message || "Une erreur est survenue"}
            </p>
            <Button onClick={() => router.push("/dashboard")} className="rounded-full">
              Retour au dashboard
            </Button>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="mb-6 sm:mb-8">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
            <ShinyText text="Mes Ateliers" />
          </h1>
          <p className="text-base sm:text-lg text-ls-muted mt-2">
            Gère et organise tes ateliers
          </p>
        </motion.div>
      </div>

      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4 mb-6">
          <Button
            variant="cta"
            size="cta"
            onClick={() => router.push("/workshop-editor")}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Créer un atelier
          </Button>
        </div>

        <WorkshopStatsCards
          total={workshops?.length || 0}
          published={
            workshops?.filter((w: { status: string }) => w.status === "PUBLISHED").length || 0
          }
          drafts={
            workshops?.filter((w: { status: string }) => w.status === "DRAFT").length || 0
          }
          completed={
            workshops?.filter((w: { status: string }) => w.status === "COMPLETED").length || 0
          }
          pendingRequests={pendingRequestsCount}
        />
      </motion.div>

      {nextWorkshop ? (
        <NextWorkshopBanner
          workshop={nextWorkshop}
          countdown={countdown}
          onViewDetails={(id) => router.push(`/workshop/${id}`)}
        />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="mb-6 border-2 border-dashed border-border/50 bg-card/95 backdrop-blur-md rounded-2xl shadow-lg hover:border-brand/30 transition-colors duration-300">
            <CardContent className="pt-12 pb-12 text-center">
              <Calendar className="w-16 h-16 mx-auto text-ls-muted mb-4" />
              <h3 className="text-xl font-semibold text-ls-text mb-2">
                Aucun atelier programmé
              </h3>
              <p className="text-ls-muted mb-6">
                Crée ton premier atelier pour commencer à partager tes
                connaissances
              </p>
              <Button
                variant="cta"
                size="cta"
                onClick={() => router.push("/workshop-editor")}
                className="gap-2"
              >
                <Plus className="w-5 h-5" />
                Créer un atelier
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {upcomingWorkshops.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="mb-6 bg-card/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-ls-heading">
                <Calendar className="w-5 h-5" />
                Autres ateliers à venir ({upcomingWorkshops.length - 1})
              </CardTitle>
              <CardDescription className="text-ls-muted">
                Tes prochains ateliers programmés
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingWorkshops.slice(1).map((workshop: typeof upcomingWorkshops[number], idx: number) => (
                  <motion.div
                    key={workshop.id}
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: prefersReducedMotion ? 0 : idx * 0.05 }}
                    whileHover={prefersReducedMotion ? undefined : { y: -4, transition: { duration: 0.2 } }}
                  >
                    <Card
                      className="hover:shadow-xl transition-shadow duration-200 cursor-pointer bg-card/80 border border-border/50 rounded-2xl"
                      onClick={() => router.push(`/workshop/${workshop.id}`)}
                    >
                      <CardHeader>
                        <CardTitle className="text-lg line-clamp-2 text-ls-heading">
                          {workshop.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm text-ls-muted">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {formatDate(workshop.date, { includeWeekday: true })}
                          </div>
                          {workshop.time && (
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              {formatTime(workshop.time)}
                              {workshop.duration && ` • ${workshop.duration} min`}
                            </div>
                          )}
                          {workshop.isVirtual ? (
                            <div className="flex items-center gap-2">
                              <LinkIcon className="w-4 h-4" />
                              <span>En ligne</span>
                            </div>
                          ) : (
                            workshop.location && (
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span className="truncate">
                                  {workshop.location}
                                </span>
                              </div>
                            )
                          )}
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span>
                              Inscrits: {workshop.apprenticeId ? 1 : 0} /{" "}
                              {workshop.maxParticipants || "∞"}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <WorkshopFiltersBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          sortField={sortField}
          onSortFieldChange={setSortField}
          sortOrder={sortOrder}
          onSortOrderToggle={() =>
            setSortOrder(sortOrder === "asc" ? "desc" : "asc")
          }
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="bg-card/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-xl">
          <CardHeader>
            <CardTitle className="text-ls-heading">Tous les ateliers</CardTitle>
            <CardDescription className="text-ls-muted">
              {filteredAndSortedWorkshops.length} atelier(s) trouvé(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredAndSortedWorkshops.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 mx-auto text-ls-muted mb-4" />
                <h3 className="text-lg font-semibold text-ls-text mb-2">
                  Aucun atelier trouvé
                </h3>
                <p className="text-ls-muted mb-4">
                  {searchQuery || statusFilter !== "all"
                    ? "Essayez de modifier les filtres de recherche"
                    : "Commencez par créer ton premier atelier"}
                </p>
                {!searchQuery && statusFilter === "all" && (
                  <Button
                    variant="cta"
                    size="cta"
                    onClick={() => router.push("/workshop-editor")}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Créer un atelier
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAndSortedWorkshops.map((workshop, idx) => (
                  <motion.div
                    key={workshop.id}
                    initial={prefersReducedMotion ? false : { opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: prefersReducedMotion ? 0 : Math.min(idx * 0.03, 0.3) }}
                    whileHover={prefersReducedMotion ? undefined : { x: 4, transition: { duration: 0.15 } }}
                  >
                    <div
                      className="border border-border/50 rounded-2xl p-4 hover:bg-brand-soft transition-colors bg-card/50 hover:shadow-md"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-3 mb-2">
                            <div className="flex-1 min-w-0">
                              <Link
                                href={`/workshop/${workshop.id}`}
                                className="text-lg font-semibold text-ls-heading mb-1 truncate cursor-pointer hover:text-ls-blue transition-colors block"
                              >
                                {workshop.title}
                              </Link>
                              {workshop.description && (
                                <p className="text-sm text-ls-muted line-clamp-2">
                                  {workshop.description}
                                </p>
                              )}
                            </div>
                            <div>{getStatusBadge(workshop.status)}</div>
                          </div>

                          <div className="flex flex-wrap gap-4 text-sm text-ls-muted">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(workshop.date)}
                            </div>
                            {workshop.time && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {workshop.time}
                              </div>
                            )}
                            {workshop.duration && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {workshop.duration} min
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {workshop.status === "PUBLISHED" &&
                                workshop.apprenticeId
                                ? 1
                                : 0}{" "}
                              / {workshop.maxParticipants || "∞"} participants
                            </div>
                          </div>
                          <WorkshopRequests
                            workshopId={workshop.id}
                            workshopStatus={workshop.status}
                            expandedWorkshopId={expandedWorkshopId}
                            setExpandedWorkshopId={setExpandedWorkshopId}
                            onAcceptRequest={handleAcceptRequest}
                            onRejectRequest={handleRejectRequest}
                            isRejecting={rejectRequest.isPending}
                          />
                        </div>

                        <div className="flex gap-2 lg:flex-col xl:flex-row">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/workshop/${workshop.id}`)}
                            className="flex-1 lg:flex-none border border-ls-border bg-ls-input-bg text-ls-heading hover:bg-brand-soft hover:border-brand rounded-full transition-all"
                          >
                            <Eye className="w-4 h-4 lg:mr-0 xl:mr-2" />
                            <span className="lg:hidden xl:inline">Détails</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              router.push(`/workshop-editor?id=${workshop.id}`)
                            }
                            className="flex-1 lg:flex-none border border-ls-border bg-ls-input-bg text-ls-heading hover:bg-brand-soft hover:border-brand rounded-full transition-all"
                          >
                            <Edit className="w-4 h-4 lg:mr-0 xl:mr-2" />
                            <span className="lg:hidden xl:inline">Éditer</span>
                          </Button>
                          {workshop.status === "DRAFT" && (
                            <Button
                              variant="cta"
                              size="ctaSm"
                              onClick={() => handlePublish(workshop.id)}
                              disabled={publishMutation.isPending}
                              className="flex-1 lg:flex-none"
                            >
                              <CheckCircle className="w-4 h-4 lg:mr-0 xl:mr-2" />
                              <span className="lg:hidden xl:inline">Publier</span>
                            </Button>
                          )}
                          {workshop.status === "PUBLISHED" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUnpublish(workshop.id)}
                              disabled={unpublishMutation.isPending}
                              className="flex-1 lg:flex-none border border-ls-border bg-ls-input-bg text-ls-heading hover:bg-brand-soft hover:border-brand rounded-full transition-all"
                            >
                              <EyeOff className="w-4 h-4 lg:mr-0 xl:mr-2" />
                              <span className="lg:hidden xl:inline">Dépublier</span>
                            </Button>
                          )}
                          {workshop.status === "PUBLISHED" &&
                            isWorkshopEnded(
                              workshop.date,
                              workshop.time,
                              workshop.duration
                            ) && (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleConfirmComplete(workshop.id)}
                                disabled={confirmAttendanceMutation.isPending}
                                className="flex-1 lg:flex-none bg-green-600 hover:bg-green-700 text-white rounded-full shadow-sm hover:shadow-md transition-all disabled:opacity-50"
                              >
                                <CheckCircle className="w-4 h-4 lg:mr-0 xl:mr-2" />
                                <span className="lg:hidden xl:inline">
                                  Terminer
                                </span>
                              </Button>
                            )}
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setShowDeleteDialog(workshop.id)}
                            disabled={deleteMutation.isPending}
                            className="flex-1 lg:flex-none bg-ls-error hover:bg-ls-error-hover text-white rounded-full shadow-sm hover:shadow-md transition-all disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4 lg:mr-0 xl:mr-2" />
                            <span className="lg:hidden xl:inline">Supprimer</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <CalendarSection
          workshops={(workshops || []) as unknown as WorkshopDetailed[]}
          calendarDate={calendarDate}
          calendarView={calendarView}
          onDateChange={setCalendarDate}
          onViewChange={setCalendarView}
          onNavigate={navigateCalendar}
          onSelectEvent={(workshop) => router.push(`/workshop/${workshop.id}`)}
        />
      </motion.div>

      <DeleteWorkshopDialog
        open={showDeleteDialog !== null}
        onOpenChange={(open) => !open && setShowDeleteDialog(null)}
        onConfirm={() => showDeleteDialog && handleDelete(showDeleteDialog)}
        isLoading={deleteMutation.isPending}
      />

      {selectedRequest && (
        <AcceptWorkshopRequestDialog
          open={showAcceptDialog}
          onOpenChange={(open) => {
            setShowAcceptDialog(open);
            if (!open) {
              setSelectedRequest(null);
              utils.mentor.getWorkshopRequests.invalidate();
            }
          }}
          requestId={selectedRequest.id}
          requestTitle={selectedRequest.title}
          preferredDate={
            selectedRequest.preferredDate
              ? new Date(selectedRequest.preferredDate)
              : null
          }
          preferredTime={selectedRequest.preferredTime}
        />
      )}

      <RejectWorkshopRequestDialog
        open={showRejectDialog}
        onOpenChange={(open) => {
          setShowRejectDialog(open);
          if (!open) setShowRejectDialog(false);
        }}
        onConfirm={confirmRejectRequest}
        isSubmitting={rejectRequest.isPending}
      />
    </PageContainer>
  );
}
