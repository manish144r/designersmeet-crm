import { v4 as uuid } from "uuid";
import { SocialMediaAccount, type SocialMediaAccountCreate } from "@dm/shared";
import type { ISocialAccountRepository } from "../interfaces.js";
import { now, store } from "./store.js";

export class InMemorySocialAccountRepository implements ISocialAccountRepository {
  async list(filter?: { platform?: string }) {
    let rows = Array.from(store.socialAccounts.values());
    if (filter?.platform) rows = rows.filter((r) => r.platform === filter.platform);
    return rows;
  }

  async findById(id: string) {
    return store.socialAccounts.get(id) ?? null;
  }

  async create(data: SocialMediaAccountCreate) {
    const ts = now();
    const account = SocialMediaAccount.parse({
      ...data,
      account_id: uuid(),
      created_at: ts,
      updated_at: ts,
    });
    store.socialAccounts.set(account.account_id, account);
    return account;
  }

  async update(id: string, data: Partial<SocialMediaAccountCreate>) {
    const existing = store.socialAccounts.get(id);
    if (!existing) throw new Error(`Social account ${id} not found`);
    const updated = SocialMediaAccount.parse({ ...existing, ...data, account_id: id, updated_at: now() });
    store.socialAccounts.set(id, updated);
    return updated;
  }

  async delete(id: string) {
    store.socialAccounts.delete(id);
  }
}
