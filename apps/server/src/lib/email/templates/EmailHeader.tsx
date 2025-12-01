import { Section, Row, Column, Img, Tailwind } from "@react-email/components";
import * as React from "react";

interface EmailHeaderProps {
  readonly logoUrl?: string;
  readonly logoAlt?: string;
  readonly logoHeight?: number;
}

export function EmailHeader({
  logoUrl,
  logoAlt = "LearnSup logo",
  logoHeight = 42,
}: EmailHeaderProps) {
  return (
    <Tailwind>
      <Section className="my-[40px] px-[32px] py-[40px]">
        {logoUrl && (
          <Row>
            <Column align="center">
              <Img alt={logoAlt} height={logoHeight} src={logoUrl} />
            </Column>
          </Row>
        )}
      </Section>
    </Tailwind>
  );
}
