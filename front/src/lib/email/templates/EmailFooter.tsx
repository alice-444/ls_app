import {
  Section,
  Img,
  Text,
  Row,
  Column,
  Link,
  Tailwind,
} from "@react-email/components";
import * as React from "react";

interface EmailFooterProps {
  readonly logoUrl?: string;
  readonly logoAlt?: string;
  readonly companyName?: string;
  readonly tagline?: string;
  readonly email?: string;
  readonly socialLinks?: {
    readonly facebook?: string;
    readonly twitter?: string;
    readonly instagram?: string;
  };
}

export function EmailFooter({
  logoUrl,
  logoAlt = "LearnSup logo",
  companyName = "LearnSup",
  tagline = "Connecter les mentors et les apprentis",
  email,
  socialLinks,
}: EmailFooterProps) {
  return (
    <Tailwind>
      <Section className="text-center">
        <table className="w-full">
          {logoUrl && (
            <tr className="w-full">
              <td align="center">
                <Img alt={logoAlt} height="42" src={logoUrl} width="42" />
              </td>
            </tr>
          )}
          <tr className="w-full">
            <td align="center">
              <Text className="my-[8px] font-semibold text-[16px] text-gray-900 leading-[24px]">
                {companyName}
              </Text>
              {tagline && (
                <Text className="mt-[4px] mb-0 text-[16px] text-gray-500 leading-[24px]">
                  {tagline}
                </Text>
              )}
            </td>
          </tr>
          {socialLinks?.instagram && (
            <tr>
              <td align="center">
                <Row className="table-cell h-[44px] w-[56px] align-bottom">
                  {socialLinks.instagram && (
                    <Column>
                      <Link href={socialLinks.instagram}>
                        <Img
                          alt="Instagram"
                          height="36"
                          src="https://react.email/static/instagram-logo.png"
                          width="36"
                        />
                      </Link>
                    </Column>
                  )}
                </Row>
              </td>
            </tr>
          )}
          {email && (
            <tr>
              <td align="center">
                {email && (
                  <Text className="mt-[4px] mb-0 font-semibold text-[16px] text-gray-500 leading-[24px]">
                    {email ? `${email}` : email}
                  </Text>
                )}
              </td>
            </tr>
          )}
        </table>
      </Section>
    </Tailwind>
  );
}
