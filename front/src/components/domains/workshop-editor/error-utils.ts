import type { FieldErrors } from "react-hook-form";

export const getFieldLabel = (field: string): string => {
  const labels: Record<string, string> = {
    title: "Titre",
    description: "Description",
    date: "Date",
    time: "Heure",
    durationHours: "Durée (Heures)",
    durationMinutes: "Durée (Minutes)",
    location: "Lieu",
    isVirtual: "Atelier virtuel",
    maxParticipants: "Nombre de participants",
    materialsNeeded: "Matériaux nécessaires",
    topic: "Sujet/Tags",
    creditCost: "Coût en crédits",
    workshopId: "ID de l'atelier",
  };

  return labels[field] || field;
};

export const formatValidationErrors = (errors: FieldErrors<any>): string => {
  const errorFields = Object.keys(errors)
    .filter((key) => key !== "root")
    .map((key) => getFieldLabel(key))
    .filter((value, index, self) => self.indexOf(value) === index);

  if (errorFields.length === 0) return "Certains champs sont invalides.";
  if (errorFields.length === 1)
    return `Le champ "${errorFields[0]}" est invalide.`;

  return `Les champs suivants sont invalides : ${errorFields.join(", ")}.`;
};
