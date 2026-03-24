import { render } from "@react-email/render";
import * as React from "react";

export interface EmailRenderResult {
  html: string;
  text: string;
}

export async function renderEmailTemplate(
  component: React.ReactElement
): Promise<EmailRenderResult> {
  const html = await render(component, { pretty: true });
  const text = await render(component, { plainText: true });

  return { html, text };
}
