export type ContentClassification = "EMPTY" | "COMMUNITY" | "SACA_GOVERNANCE" | "POLITICAL_PARTISAN" | "HARASSMENT" | "SPAM" | "PRIVACY" | "REVIEW";

const PARTISAN_PATTERNS = [
  /\b(vote for|elect|campaign for|support candidate|endorse)\b/i,
  /\b(party|political party|campaign|fundraiser|candidate)\b.*\b(donate|support|vote|elect|join)\b/i,
  /(انتخبوا|انتخب|صوتوا|الحملة الانتخابية|مرشحنا|حزب|تبرع للحملة|دعم المرشح)/i,
  /(صوت لصالح|صوتوا لصالح|دعم الحزب|انضموا للحملة)/i,
];
const HARASSMENT_PATTERNS = [/\b(threaten|kill you|shut up)\b/i, /(سأقتلك|تهديد|شتيمة|اسكت يا)/i];
const ALLOWED_SACA_ELECTION = /(انتخابات الجالية|انتخابات SACA|SACA election|general assembly election)/i;

export function classifyCommunityContent(text: string): { classification: ContentClassification; blocked: boolean; reason: string | null; matched: boolean } {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return { classification: "EMPTY", blocked: false, reason: null, matched: false };
  if (ALLOWED_SACA_ELECTION.test(normalized)) return { classification: "SACA_GOVERNANCE", blocked: false, reason: null, matched: true };
  if (PARTISAN_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return { classification: "POLITICAL_PARTISAN", blocked: true, reason: "الدعاية الحزبية أو الترويج لمرشح أو حملة سياسية خارجية غير مسموح به على منصة SACA.", matched: true };
  }
  if (HARASSMENT_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return { classification: "HARASSMENT", blocked: false, reason: "المحتوى يحتاج مراجعة بشرية وفق سياسة السلوك المجتمعي.", matched: true };
  }
  if (/سياسة|politic|government/i.test(normalized)) return { classification: "REVIEW", blocked: false, reason: "المحتوى يحتاج مراجعة سياقية قبل اتخاذ إجراء.", matched: true };
  return { classification: "COMMUNITY", blocked: false, reason: null, matched: false };
}
