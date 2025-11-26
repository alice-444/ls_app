export function formatWorkshopReferencePreview(content: string): string {
  const trimmedContent = content.trim();
  if (trimmedContent.startsWith("{") && trimmedContent.endsWith("}")) {
    try {
      const parsed = JSON.parse(trimmedContent);
      if (parsed.type === "workshop_reference" && parsed.workshopTitle) {
        return `📚 ${parsed.workshopTitle}`;
      }
    } catch (error) {
      if (!(error instanceof SyntaxError)) {
        console.error("Unexpected error parsing message content:", error);
      }
    }
  }
  return content;
}
