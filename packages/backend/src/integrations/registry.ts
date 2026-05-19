// Aggregated integration health — feeds Settings → Integrations (page 15).
import { m365 } from "./m365/index.js";
import { shopify } from "./shopify/index.js";
import { meta } from "./meta/index.js";
import { stripe } from "./stripe/index.js";
import { emailProviders } from "./email/index.js";

export async function integrationStatuses() {
  const [m, s, mt, st] = await Promise.all([
    m365.status(),
    shopify.status(),
    meta.status(),
    stripe.status(),
  ]);
  const email = await Promise.all(Object.values(emailProviders).map((p) => p.status()));
  return {
    m365: m,
    shopify: s,
    meta: mt,
    stripe: st,
    email,
  };
}
