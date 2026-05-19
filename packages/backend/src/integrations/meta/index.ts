// Meta Graph adapter (brief §8.5): Facebook Pages + Instagram publishing.
// Stub — Aider wires real Graph calls after App Review.
export const meta = {
  facebook: {
    async createPagePost(_pageId: string, _message: string, _scheduledAt?: string) {
      return { id: `fb-post-stub-${Date.now()}` };
    },
    async pageInsights(_pageId: string, _metric: string) {
      return { data: [] as unknown[] };
    },
  },
  instagram: {
    async publish(_igUserId: string, _imageUrl: string, _caption: string) {
      // two-step: create container then media_publish
      return { containerId: `ig-c-${Date.now()}`, mediaId: `ig-m-${Date.now()}` };
    },
  },
  async status() {
    return { ok: true, detail: "stub adapter — requires Meta App Review (multi-week lead)" };
  },
};
