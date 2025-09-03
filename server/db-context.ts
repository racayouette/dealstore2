// context.ts
import { AsyncLocalStorage } from "async_hooks";

export const tenantContext = new AsyncLocalStorage<{ subdomainId: string }>();

export function setTenant(subdomainId: string, fn: () => Promise<any>) {
  return tenantContext.run({ subdomainId }, fn);
}

export function getTenantId() {
  return tenantContext.getStore()?.subdomainId;
}
