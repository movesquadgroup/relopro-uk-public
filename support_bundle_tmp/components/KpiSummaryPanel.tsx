import React, { useMemo } from "react";
import { Client, Quote, QuoteStatus, DiaryEvent, DiaryActivityType } from "../types";

type Props = {
  className?: string;
};

function readLS<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

const KpiTile: React.FC<{ label: string; value: string | number; note?: string }> = ({ label, value, note }) => (
  <div className="p-4 bg-white rounded-lg shadow dark:bg-gray-800">
    <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</p>
    <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
    {note && <p className="text-xs text-gray-500 dark:text-gray-400">{note}</p>}
  </div>
);

const KpiSummaryPanel: React.FC<Props> = ({ className }) => {
  const clients = readLS<Client[]>("clients", []);
  const quotes = readLS<Quote[]>("quotes", []);
  const diary = readLS<DiaryEvent[]>("diaryEvents", []);

  const { leads, quotesSent, bookedJobs, revenueYTD } = useMemo(() => {
    const leadsCount = clients.length;
    const quotesSentCount = quotes.filter(q => q.status === QuoteStatus.Sent || q.status === QuoteStatus.Accepted || q.status === QuoteStatus.Rejected).length;
    const booked = diary.filter(d => d.activityType === DiaryActivityType.BookJob).length;

    // If your quotes have currency totals, sum those accepted this calendar year:
    const y = new Date().getFullYear();
    const ytd = quotes
      .filter(q => q.status === QuoteStatus.Accepted)
      .filter(q => {
        const dt = q.quoteDate ? new Date(q.quoteDate) : null;
        return dt ? dt.getFullYear() === y : false;
      })
      .reduce((acc, q) => acc + (q.total || 0), 0);

    return { leads: leadsCount, quotesSent: quotesSentCount, bookedJobs: booked, revenueYTD: ytd };
  }, [clients, quotes, diary]);

  return (
    <div className={className} data-testid="kpi-summary-panel">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiTile label="Clients" value={leads} />
        <KpiTile label="Quotes Sent" value={quotesSent} />
        <KpiTile label="Booked Jobs" value={bookedJobs} />
        <KpiTile label="Revenue YTD" value={new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(revenueYTD)} />
      </div>
    </div>
  );
};

export default KpiSummaryPanel;
