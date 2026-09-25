export const SUPPORT_EMAIL = 'reclaimhello@gmail.com';

export function gmailComposeUrl(to = SUPPORT_EMAIL, subject = 'ReClaim support') {
  const params = new URLSearchParams({
    view: 'cm',
    fs: '1',
    to,
    su: subject,
  });
  return `https://mail.google.com/mail/?${params.toString()}`;
}

export function mailtoUrl(to = SUPPORT_EMAIL, subject = 'ReClaim support') {
  return `mailto:${to}?subject=${encodeURIComponent(subject)}`;
}

/** Opens Gmail compose when possible, otherwise the device mail app. */
export function openSupportEmail(event) {
  if (event) event.preventDefault();
  const gmail = gmailComposeUrl();
  const mail = mailtoUrl();
  const popup = window.open(gmail, '_blank', 'noopener,noreferrer');
  if (!popup) {
    window.location.href = mail;
  }
}
