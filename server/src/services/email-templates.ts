import type { Mail } from "./mailer.ts";

type L = "en" | "fr" | "pt" | "es" | "ar";
type Txt = Record<L, string>;
const esc = (s: string) => s.replace(/[&<>"']/g, ch => `&#${ch.charCodeAt(0)};`);
const money = (cents: unknown, lang: L) => new Intl.NumberFormat(lang, { style: "currency", currency: "USD" }).format(Number(cents ?? 0) / 100);
const fill = (t: string, vars: Record<string, string>) => t.replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? "");

const STATUS: Record<string, Txt> = {
  pending: { en: "Payment in progress", fr: "Paiement en cours", pt: "Pagamento em andamento", es: "Pago en curso", ar: "الدفع قيد التنفيذ" },
  in_progress: { en: "Being sent", fr: "En cours d'envoi", pt: "Sendo enviado", es: "Enviándose", ar: "جارٍ الإرسال" },
  action_required: { en: "Action required", fr: "Action requise", pt: "Ação necessária", es: "Acción requerida", ar: "مطلوب إجراء" },
  paid: { en: "Paid", fr: "Payé", pt: "Pago", es: "Pagado", ar: "تم الدفع" },
  failed: { en: "Failed", fr: "Échoué", pt: "Falhou", es: "Fallido", ar: "فشل" },
  rejected: { en: "Rejected", fr: "Refusé", pt: "Recusado", es: "Rechazado", ar: "مرفوض" },
  completed: { en: "Delivered", fr: "Livré", pt: "Entregue", es: "Entregado", ar: "تم التسليم" },
};
const T: Record<string, { subject: Txt; body: Txt; cta: Txt; path: string }> = {
  reward_eligible: {
    subject: { en: "Reward earned: {amount}", fr: "Récompense obtenue : {amount}", pt: "Recompensa obtida: {amount}", es: "Recompensa obtenida: {amount}", ar: "تم الحصول على مكافأة: {amount}" },
    body: { en: "Your reward of {amount} has been added to your SYRIX VCF wallet. Payouts are reviewed and sent manually; you can follow every step in your wallet.", fr: "Votre récompense de {amount} a été ajoutée à votre portefeuille SYRIX VCF. Les paiements sont vérifiés puis envoyés manuellement ; suivez chaque étape dans votre portefeuille.", pt: "Sua recompensa de {amount} foi adicionada à sua carteira SYRIX VCF. Os pagamentos são revisados e enviados manualmente; acompanhe cada etapa na carteira.", es: "Tu recompensa de {amount} se añadió a tu billetera SYRIX VCF. Los pagos se revisan y se envían manualmente; sigue cada paso en tu billetera.", ar: "تمت إضافة مكافأتك البالغة {amount} إلى محفظة SYRIX VCF. تتم مراجعة الدفعات وإرسالها يدويًا؛ تابع كل خطوة في محفظتك." },
    cta: { en: "Open my wallet", fr: "Ouvrir mon portefeuille", pt: "Abrir minha carteira", es: "Abrir mi billetera", ar: "فتح محفظتي" }, path: "/app/#/wallet" },
  add_payout_method: {
    subject: { en: "Add your payout details to receive {amount}", fr: "Ajoutez vos coordonnées de paiement pour recevoir {amount}", pt: "Adicione seus dados de pagamento para receber {amount}", es: "Añade tus datos de pago para recibir {amount}", ar: "أضف بيانات الدفع لاستلام {amount}" },
    body: { en: "You reached a reward milestone. Add a PayPal, Binance Pay or Pix destination in your wallet and the payout request is created automatically. We never ask for a password or a private key.", fr: "Vous avez atteint un palier de récompense. Ajoutez une destination PayPal, Binance Pay ou Pix dans votre portefeuille : la demande de paiement est créée automatiquement. Nous ne demandons jamais de mot de passe ni de clé privée.", pt: "Você atingiu um marco de recompensa. Adicione um destino PayPal, Binance Pay ou Pix na carteira e o pedido de pagamento é criado automaticamente. Nunca pedimos senha nem chave privada.", es: "Alcanzaste un hito de recompensa. Añade un destino PayPal, Binance Pay o Pix en tu billetera y la solicitud de pago se crea automáticamente. Nunca pedimos contraseñas ni claves privadas.", ar: "لقد وصلت إلى مرحلة مكافأة. أضف وجهة PayPal أو Binance Pay أو Pix في محفظتك وسيُنشأ طلب الدفع تلقائيًا. لا نطلب أبدًا كلمة مرور أو مفتاحًا خاصًا." },
    cta: { en: "Add payout details", fr: "Ajouter mes coordonnées", pt: "Adicionar dados", es: "Añadir datos de pago", ar: "إضافة بيانات الدفع" }, path: "/app/#/wallet" },
  payout_update: {
    subject: { en: "Payout update: {status}", fr: "Mise à jour du paiement : {status}", pt: "Atualização do pagamento: {status}", es: "Actualización del pago: {status}", ar: "تحديث الدفع: {status}" },
    body: { en: "Your payout of {amount} is now: {status}. {reason}", fr: "Votre paiement de {amount} est maintenant : {status}. {reason}", pt: "Seu pagamento de {amount} agora está: {status}. {reason}", es: "Tu pago de {amount} ahora está: {status}. {reason}", ar: "حالة دفعتك البالغة {amount} الآن: {status}. {reason}" },
    cta: { en: "View details", fr: "Voir le détail", pt: "Ver detalhes", es: "Ver detalles", ar: "عرض التفاصيل" }, path: "/app/#/wallet" },
  fulfilment_update: {
    subject: { en: "Reward delivery: {status}", fr: "Livraison de la récompense : {status}", pt: "Entrega da recompensa: {status}", es: "Entrega de la recompensa: {status}", ar: "تسليم المكافأة: {status}" },
    body: { en: "The delivery of your reward ({kind}) is now: {status}.", fr: "La livraison de votre récompense ({kind}) est maintenant : {status}.", pt: "A entrega da sua recompensa ({kind}) agora está: {status}.", es: "La entrega de tu recompensa ({kind}) ahora está: {status}.", ar: "حالة تسليم مكافأتك ({kind}) الآن: {status}." },
    cta: { en: "View my rewards", fr: "Voir mes récompenses", pt: "Ver minhas recompensas", es: "Ver mis recompensas", ar: "عرض مكافآتي" }, path: "/app/#/wallet" },
  ticket_reply: {
    subject: { en: "Support replied: {subject}", fr: "Le support a répondu : {subject}", pt: "O suporte respondeu: {subject}", es: "Soporte respondió: {subject}", ar: "رد الدعم: {subject}" },
    body: { en: "Our team answered your ticket “{subject}”. Sign in to read the reply.", fr: "Notre équipe a répondu à votre demande « {subject} ». Connectez-vous pour lire la réponse.", pt: "Nossa equipe respondeu ao seu chamado “{subject}”. Entre para ler a resposta.", es: "Nuestro equipo respondió a tu ticket “{subject}”. Inicia sesión para leer la respuesta.", ar: "أجاب فريقنا على تذكرتك «{subject}». سجّل الدخول لقراءة الرد." },
    cta: { en: "Read the reply", fr: "Lire la réponse", pt: "Ler a resposta", es: "Leer la respuesta", ar: "قراءة الرد" }, path: "/app/#/support" },
  security: {
    subject: { en: "Security notice for your SYRIX VCF account", fr: "Avis de sécurité pour votre compte SYRIX VCF", pt: "Aviso de segurança da sua conta SYRIX VCF", es: "Aviso de seguridad de tu cuenta SYRIX VCF", ar: "إشعار أمني لحسابك في SYRIX VCF" },
    body: { en: "A security-related change was made to your account ({event}). If you did not expect it, contact support.", fr: "Une modification liée à la sécurité a été effectuée sur votre compte ({event}). Si vous ne l'attendiez pas, contactez le support.", pt: "Uma alteração de segurança foi feita na sua conta ({event}). Se não esperava, contate o suporte.", es: "Se realizó un cambio de seguridad en tu cuenta ({event}). Si no lo esperabas, contacta con soporte.", ar: "تم إجراء تغيير أمني على حسابك ({event}). إذا لم تكن تتوقعه، تواصل مع الدعم." },
    cta: { en: "Review my account", fr: "Vérifier mon compte", pt: "Revisar minha conta", es: "Revisar mi cuenta", ar: "مراجعة حسابي" }, path: "/app/#/settings" },
  account_deletion: {
    subject: { en: "Your account deletion request", fr: "Votre demande de suppression de compte", pt: "Seu pedido de exclusão de conta", es: "Tu solicitud de eliminación de cuenta", ar: "طلب حذف حسابك" },
    body: { en: "We received a request to delete your SYRIX VCF account. Your personal data will be erased after the 14-day grace period. Signing in and choosing “Keep my account” cancels it.", fr: "Nous avons reçu une demande de suppression de votre compte SYRIX VCF. Vos données personnelles seront effacées après un délai de 14 jours. Pour annuler, connectez-vous et choisissez « Conserver mon compte ».", pt: "Recebemos um pedido para excluir sua conta SYRIX VCF. Seus dados pessoais serão apagados após 14 dias. Para cancelar, entre e escolha “Manter minha conta”.", es: "Recibimos una solicitud para eliminar tu cuenta SYRIX VCF. Tus datos personales se borrarán tras un plazo de 14 días. Para cancelarla, inicia sesión y elige “Conservar mi cuenta”.", ar: "تلقينا طلبًا لحذف حسابك في SYRIX VCF. ستُمحى بياناتك الشخصية بعد مهلة 14 يومًا. لإلغاء الطلب، سجّل الدخول واختر «الاحتفاظ بحسابي»." },
    cta: { en: "Open SYRIX VCF", fr: "Ouvrir SYRIX VCF", pt: "Abrir SYRIX VCF", es: "Abrir SYRIX VCF", ar: "فتح SYRIX VCF" }, path: "/app/" },
};
const FOOTER: Txt = { en: "You receive this e-mail because of activity on your SYRIX VCF account. Reward e-mails can be turned off in Settings.", fr: "Vous recevez cet e-mail en raison d'une activité sur votre compte SYRIX VCF. Les e-mails de récompenses peuvent être désactivés dans les paramètres.", pt: "Você recebe este e-mail por causa de atividade na sua conta SYRIX VCF. E-mails de recompensas podem ser desativados nas configurações.", es: "Recibes este correo por actividad en tu cuenta SYRIX VCF. Los correos de recompensas se pueden desactivar en Ajustes.", ar: "تتلقى هذه الرسالة بسبب نشاط في حسابك على SYRIX VCF. يمكن إيقاف رسائل المكافآت من الإعدادات." };

export function hasTemplate(name: string): boolean { return name in T; }

export function renderEmail(name: string, rawVars: Record<string, unknown>, langIn: string, appUrl: string, to: string, supportEmail: string): Mail {
  const lang = (["en", "fr", "pt", "es", "ar"].includes(langIn) ? langIn : "en") as L;
  const t = T[name];
  if (!t) throw new Error(`unknown e-mail template ${name}`);
  const vars: Record<string, string> = {};
  for (const [k, x] of Object.entries(rawVars)) if (typeof x === "string" || typeof x === "number") vars[k] = String(x).slice(0, 300);
  if (rawVars["amountCents"] !== undefined) vars["amount"] = money(rawVars["amountCents"], lang);
  if (typeof rawVars["status"] === "string") vars["status"] = STATUS[rawVars["status"]]?.[lang] ?? rawVars["status"];
  if (typeof rawVars["kind"] === "string") vars["kind"] = rawVars["kind"].replace(/_/g, " ");
  vars["reason"] = typeof rawVars["reason"] === "string" ? rawVars["reason"].slice(0, 300) : "";
  const subject = fill(t.subject[lang], vars);
  const body = fill(t.body[lang], vars);
  const link = `${appUrl.replace(/\/$/, "")}${t.path}`;
  const dir = lang === "ar" ? "rtl" : "ltr";
  const html = `<!doctype html><html lang="${lang}" dir="${dir}"><body style="margin:0;background:#070B14;padding:32px 12px;font-family:Inter,Segoe UI,Arial,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#0E1526;border:1px solid #1E2A44;border-radius:16px">
<tr><td style="padding:28px 32px 8px"><div style="color:#E8EEF9;font-weight:800;letter-spacing:2px;font-size:18px">SYRIX VCF</div><div style="color:#7D8BA8;font-size:11px;letter-spacing:3px;margin-top:4px">BY SYRIX VISION COMPANY</div></td></tr>
<tr><td style="padding:16px 32px 0"><h1 style="color:#FFFFFF;font-size:22px;line-height:1.3;margin:0">${esc(subject)}</h1></td></tr>
<tr><td style="padding:12px 32px 0;color:#B5C1D9;font-size:15px;line-height:1.6">${esc(body)}</td></tr>
<tr><td style="padding:24px 32px"><a href="${esc(link)}" style="display:inline-block;background:#3D6BFF;color:#FFFFFF;text-decoration:none;font-weight:600;padding:12px 20px;border-radius:10px">${esc(t.cta[lang])}</a></td></tr>
<tr><td style="padding:0 32px 28px;color:#6B7894;font-size:12px;line-height:1.5;border-top:1px solid #1E2A44"><p style="margin:16px 0 0">${esc(FOOTER[lang])}</p><p style="margin:8px 0 0">${esc(supportEmail)}</p></td></tr>
</table></td></tr></table></body></html>`;
  const text = `SYRIX VCF — BY SYRIX VISION COMPANY\n\n${subject}\n\n${body}\n\n${t.cta[lang]}: ${link}\n\n${FOOTER[lang]}\n${supportEmail}\n`;
  return { to, subject, html, text };
}
