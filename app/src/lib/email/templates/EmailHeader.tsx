import { Section, Img, Tailwind } from "@react-email/components";

interface EmailHeaderProps {
  readonly logoUrl?: string;
  readonly logoAlt?: string;
  readonly logoHeight?: number;
}

export function EmailHeader({
  logoUrl,
  logoAlt = "LearnSup logo",
  logoHeight = 50,
}: EmailHeaderProps) {
  const finalLogoUrl = logoUrl || (process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/logo/logo.png` : undefined);

  return (
    <Tailwind>
      <Section className="my-[20px] text-center">
        {finalLogoUrl ? (
          <Img 
            alt={logoAlt} 
            height={logoHeight} 
            src={finalLogoUrl} 
            style={{ margin: "0 auto", display: "block" }}
          />
        ) : (
          <div style={{ fontSize: "24px", fontWeight: "bold", color: "#FFB647" }}>LearnSup</div>
        )}
      </Section>
    </Tailwind>
  );
}
