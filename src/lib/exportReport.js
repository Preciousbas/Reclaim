import { computeRIFromStats, getRILabel } from './resilience.js';
import { computeConfidence, computeReward } from '../features/checkin/logic.js';
import { getJourneyDay } from './dates.js';

export function buildExportReport(stats, userEmail) {
  const name = stats.reclaimName || 'Member';
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const checkinEntries = Object.entries(stats.checkins || {}).sort(([a], [b]) => {
    const na = Number(String(a).replace(/\D/g, '')) || 0;
    const nb = Number(String(b).replace(/\D/g, '')) || 0;
    return na - nb;
  });
  const journeyDay = getJourneyDay(stats.startDate);
  const ri = computeRIFromStats({
    streak: stats.streak,
    wins: stats.wins,
    losses: stats.losses,
    checkins: stats.checkins || {},
  });
  const conf = computeConfidence(stats, journeyDay);
  const rew = computeReward(stats, journeyDay);

  const checkinRows = checkinEntries.map(([day, ci]) => `
    <tr>
      <td>${escapeHtml(String(day).replace('day-', 'Day '))}</td>
      <td>${ci.result === 'win' ? 'Win' : 'Loss'}</td>
      <td>${escapeHtml(ci.intensity || '—')}</td>
      <td>${escapeHtml(ci.mood || '—')}</td>
      <td>${escapeHtml(ci.trigger || '—')}</td>
      <td>${escapeHtml(ci.action || '—')}</td>
    </tr>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>ReClaim Journey Report — ${escapeHtml(name)}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Georgia, serif; color: #2a261c; padding: 48px; max-width: 800px; margin: 0 auto; }
    .header { text-align: center; margin-bottom: 40px; border-bottom: 1px solid #d2b48a; padding-bottom: 24px; }
    .logo { font-size: 32px; font-weight: 900; letter-spacing: -1px; }
    .logo-re { color: #161410; }
    .logo-claim { color: #b8956a; }
    h1 { font-size: 24px; margin: 16px 0 8px; color: #161410; }
    .meta { font-size: 14px; color: #666; }
    .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin: 32px 0; }
    .stat-box { background: #f3efe6; border-radius: 12px; padding: 16px; text-align: center; }
    .stat-val { font-size: 28px; font-weight: 900; color: #6b5340; }
    .stat-lbl { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #888; margin-top: 4px; }
    h2 { font-size: 18px; color: #161410; margin: 32px 0 16px; border-bottom: 1px solid #e8e0d4; padding-bottom: 8px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th { background: #1f1b17; color: #efe8dc; padding: 10px 8px; text-align: left; }
    td { padding: 10px 8px; border-bottom: 1px solid #e8e0d4; vertical-align: top; }
    tr:nth-child(even) td { background: #f3efe6; }
    .footer { margin-top: 48px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #e8e8f0; padding-top: 24px; }
    @media print { body { padding: 24px; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo"><span class="logo-re">Re</span><span class="logo-claim">Claim</span></div>
    <h1>Personal Recovery Journey Report</h1>
    <p class="meta">Prepared for <strong>${escapeHtml(name)}</strong> · ${date}</p>
    ${userEmail ? `<p class="meta">Account: ${escapeHtml(userEmail)}</p>` : '<p class="meta">Anonymous session</p>'}
  </div>

  <div class="stats-grid">
    <div class="stat-box"><div class="stat-val">${stats.streak}</div><div class="stat-lbl">Day Streak</div></div>
    <div class="stat-box"><div class="stat-val">${stats.wins}</div><div class="stat-lbl">Total Wins</div></div>
    <div class="stat-box"><div class="stat-val">${stats.losses}</div><div class="stat-lbl">Relapses</div></div>
  </div>

  <h2>Recovery Metrics</h2>
  <div class="stats-grid">
    <div class="stat-box"><div class="stat-val">${ri.ri.toFixed(4)}</div><div class="stat-lbl">RI · ${escapeHtml(getRILabel(ri.ri))}</div></div>
    <div class="stat-box"><div class="stat-val">${conf}%</div><div class="stat-lbl">Confidence Level</div></div>
    <div class="stat-box"><div class="stat-val">${rew}%</div><div class="stat-lbl">Brain Rewiring</div></div>
  </div>

  <h2>Check-In History</h2>
  ${checkinEntries.length === 0 ? '<p>No check-ins recorded yet.</p>' : `
  <table>
    <thead>
      <tr><th>Day</th><th>Result</th><th>Intensity</th><th>Mood</th><th>Trigger</th><th>Action</th></tr>
    </thead>
    <tbody>${checkinRows}</tbody>
  </table>`}

  <div class="footer">
    <p>ReClaim — A M. Peters Group Initiative</p>
    <p>This report is private and belongs to you. Exported ${new Date().toISOString()}</p>
  </div>
</body>
</html>`;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function downloadExportReport(stats, userEmail) {
  const html = buildExportReport(stats, userEmail);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ReClaim-Report-${stats.reclaimName || 'journey'}-${new Date().toISOString().slice(0, 10)}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

export function printExportReport(stats, userEmail) {
  const html = buildExportReport(stats, userEmail);
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.onload = () => win.print();
}
