/**
 * AI chat feature barrel.
 *
 * Fix bug #5 (prototype): `ChatPanel` (ported from prototype's `AiAssistant`)
 * sekarang memasang aria-live attrs di message log container. Lihat
 * ./ChatPanel.tsx untuk detail.
 */
export {
  ChatPanel,
  type ChatPanelProps,
  type ChatPanelContext,
  type ChatMessage,
  type ChatRole,
} from './ChatPanel';
