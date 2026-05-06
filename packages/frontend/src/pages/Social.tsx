import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SOCIAL_PLATFORMS, type SocialPlatform } from "@dm/shared";
import { socialApi } from "../api/resources.js";

export function Social() {
  const qc = useQueryClient();
  const platformsQ = useQuery({ queryKey: ["social", "platforms"], queryFn: () => socialApi.platforms() });
  const accountsQ = useQuery({ queryKey: ["social", "accounts"], queryFn: () => socialApi.accounts() });

  const [draft, setDraft] = useState<{ platform: SocialPlatform; account_name: string; access_token: string }>({
    platform: "linkedin",
    account_name: "",
    access_token: "",
  });
  const [postContent, setPostContent] = useState("");
  const [postAccountId, setPostAccountId] = useState("");

  const createAccountM = useMutation({
    mutationFn: () =>
      socialApi.createAccount({
        platform: draft.platform,
        account_name: draft.account_name,
        access_token: draft.access_token,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["social", "accounts"] });
      setDraft({ platform: "linkedin", account_name: "", access_token: "" });
    },
  });

  const deleteAccountM = useMutation({
    mutationFn: (id: string) => socialApi.deleteAccount(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["social", "accounts"] }),
  });

  const postM = useMutation({
    mutationFn: () => socialApi.post({ account_id: postAccountId, content: postContent }),
    onSuccess: () => {
      setPostContent("");
      qc.invalidateQueries({ queryKey: ["queue"] });
    },
  });

  const platforms = platformsQ.data ?? [];
  const accounts = accountsQ.data ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold">Social Pipeline</h1>

      <div className="card">
        <h2 className="text-sm uppercase tracking-widest text-ice mb-3">Channels</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {SOCIAL_PLATFORMS.map((p) => {
            const meta = platforms.find((x) => x.platform === p);
            return (
              <div key={p} className="bg-bg border border-borderc rounded-md p-3">
                <div className="flex items-center justify-between">
                  <span className="capitalize font-semibold text-textc">{p}</span>
                  <span className={`badge ${meta?.available ? "" : "opacity-50"}`}>
                    {meta?.available ? "live" : "stub"}
                  </span>
                </div>
                <div className="text-xs text-textDim mt-2">
                  {meta?.available ? "Wired up — ready to post." : "Coming soon — interface ready, implementation pending."}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card">
        <h2 className="text-sm uppercase tracking-widest text-ice mb-3">Connected accounts</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
          <select
            value={draft.platform}
            onChange={(e) => setDraft((d) => ({ ...d, platform: e.target.value as SocialPlatform }))}
            aria-label="Select social platform"
          >
            {SOCIAL_PLATFORMS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <input
            aria-label="Account name"
            placeholder="Account name (LinkedIn URN or handle)"
            value={draft.account_name}
            onChange={(e) => setDraft((d) => ({ ...d, account_name: e.target.value }))}
          />
          <input
            aria-label="Access token"
            placeholder="Access token"
            type="password"
            value={draft.access_token}
            onChange={(e) => setDraft((d) => ({ ...d, access_token: e.target.value }))}
          />
        </div>
        <button
          className="btn-primary"
          disabled={!draft.account_name || !draft.access_token || createAccountM.isPending}
          onClick={() => createAccountM.mutate()}
          aria-label="Add social media account"
        >
          Add account
        </button>

        <table className="w-full text-sm mt-4">
          <thead className="text-textDim text-xs uppercase">
            <tr>
              <th className="text-left py-2">Platform</th>
              <th className="text-left py-2">Account</th>
              <th className="text-left py-2">Token</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((a) => (
              <tr key={a.account_id} className="border-t border-borderc">
                <td className="py-2 capitalize text-gold">{a.platform}</td>
                <td className="py-2">{a.account_name}</td>
                <td className="py-2 text-textDim">{a.has_access_token ? "stored" : "missing"}</td>
                <td className="py-2 text-right">
                  <button className="btn-danger btn-sm" onClick={() => deleteAccountM.mutate(a.account_id)} aria-label={`Remove ${a.platform} account ${a.account_name}`}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
            {accounts.length === 0 && (
              <tr>
                <td colSpan={4} className="py-6 text-center text-textDim">
                  No accounts connected.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h2 className="text-sm uppercase tracking-widest text-ice mb-3">Compose post</h2>
        <select className="mb-2" value={postAccountId} onChange={(e) => setPostAccountId(e.target.value)} aria-label="Select account to post from">
          <option value="">Select account…</option>
          {accounts.map((a) => (
            <option key={a.account_id} value={a.account_id}>
              {a.platform} — {a.account_name}
            </option>
          ))}
        </select>
        <textarea
          rows={5}
          aria-label="Post content"
          placeholder="What's on your mind?"
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
        />
        <button
          className="btn-primary mt-2"
          disabled={!postAccountId || !postContent || postM.isPending}
          onClick={() => postM.mutate()}
          aria-label="Queue social media post"
        >
          Queue post
        </button>
        {postM.isSuccess && <div className="text-statusGreen text-xs mt-2">Queued — check the Queue tab.</div>}
        {postM.isError && <div className="text-statusRed text-xs mt-2">{(postM.error as Error).message}</div>}
      </div>
    </div>
  );
}
