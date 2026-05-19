// Microsoft Graph adapter (brief §8.1). Stubs for Outlook mail/calendar,
// Teams chat, SharePoint documents. Real Graph calls use the delegated
// access token from the Entra/MSAL login (req.user). Aider wires transport.
export interface GraphHealth {
  ok: boolean;
  detail: string;
}

export const m365 = {
  outlook: {
    async sendMail(_to: string, _subject: string, _html: string) {
      return { id: `graph-mail-stub-${Date.now()}`, sent: true };
    },
    async listInbox(_top = 25) {
      return { value: [] as unknown[] };
    },
  },
  calendar: {
    async listEvents(_from: string, _to: string) {
      return { value: [] as unknown[] };
    },
    async createEvent(_subject: string, _start: string, _end: string) {
      return { id: `graph-event-stub-${Date.now()}` };
    },
  },
  teams: {
    async postChannelMessage(_teamId: string, _channelId: string, _text: string) {
      return { id: `teams-msg-stub-${Date.now()}` };
    },
  },
  sharepoint: {
    async listDriveItems(_driveId: string) {
      return { value: [] as unknown[] };
    },
  },
  async status(): Promise<GraphHealth> {
    return { ok: true, detail: "stub adapter — delegated Graph token wired in Phase 5/Aider" };
  },
};
