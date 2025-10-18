import React, { useState } from 'react';
import { Quote, QuoteStatus } from '../types';
import { generatePublicQuoteLink } from '../lib/quoting/doc';

interface QuoteTableProps {
  quotes: Quote[];
}

const statusColorMap: Record<QuoteStatus, string> = {
  [QuoteStatus.Draft]: 'bg-gray-100 text-gray-800 border-gray-300',
  [QuoteStatus.Sent]: 'bg-blue-100 text-blue-800 border-blue-300',
  [QuoteStatus.Accepted]: 'bg-green-100 text-green-800 border-green-300',
  [QuoteStatus.Rejected]: 'bg-red-100 text-red-800 border-red-300',
};

const StatusBadge: React.FC<{ status: QuoteStatus }> = ({ status }) => (
  <span className={`px-2 py-1 text-xs font-semibold leading-5 rounded-full border ${statusColorMap[status]}`}>
    {status}
  </span>
);

const QuoteTable: React.FC<QuoteTableProps> = ({ quotes }) => {
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const handleShareLink = (quoteId: string) => {
    const link = generatePublicQuoteLink(quoteId);
    // Construct full URL for clipboard
    const fullUrl = `${window.location.origin}${window.location.pathname}${link}`;
    navigator.clipboard.writeText(fullUrl).then(() => {
        setCopiedLink(quoteId);
        setTimeout(() => setCopiedLink(null), 2000); // Reset after 2 seconds
    });
  };

  if (quotes.length === 0) {
      return <div className="text-center p-8 bg-white rounded-lg shadow-md text-gray-500">No quotes found.</div>
  }
    
  return (
    <div className="w-full overflow-hidden rounded-lg shadow-lg">
      <div className="w-full overflow-x-auto">
        <table className="w-full whitespace-no-wrap">
          <thead>
            <tr className="text-xs font-semibold tracking-wide text-left text-gray-500 uppercase border-b bg-gray-50">
              <th className="px-4 py-3">Quote ID</th>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y">
            {quotes.map((quote) => (
              <tr key={quote.id} className="text-gray-700 hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-semibold">{quote.id}</td>
                <td className="px-4 py-3 text-sm">{quote.clientName}</td>
                <td className="px-4 py-3 text-sm">
                    <p>Issued: {new Date(quote.quoteDate).toLocaleDateString()}</p>
                    <p className="text-xs text-gray-500">Expires: {new Date(quote.expiryDate).toLocaleDateString()}</p>
                </td>
                <td className="px-4 py-3 text-sm font-bold">
                    {new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(quote.total)}
                </td>
                <td className="px-4 py-3 text-xs">
                  <StatusBadge status={quote.status} />
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <button onClick={() => handleShareLink(quote.id)} className="p-2 text-gray-500 bg-gray-100 rounded-md hover:text-brand-primary hover:bg-brand-light focus:outline-none" title="Get Public Link">
                        {copiedLink === quote.id ? 
                          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> :
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342A2 2 0 0110 14.5a2 2 0 011.316-1.158l3.23-1.615a2.5 2.5 0 000-4.462l-3.23-1.615a2 2 0 01-1.316-1.158 2 2 0 010-1.684 2 2 0 011.316-1.158l3.23 1.615a6.5 6.5 0 010 11.6l-3.23 1.615a2 2 0 01-1.316-1.158 2 2 0 010-1.684z"></path></svg>
                        }
                    </button>
                    <button className="p-2 text-gray-500 bg-gray-100 rounded-md hover:text-brand-primary hover:bg-brand-light focus:outline-none" title="Edit Quote">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z"></path></svg>
                    </button>
                    <button className="p-2 text-gray-500 bg-gray-100 rounded-md hover:text-brand-primary hover:bg-brand-light focus:outline-none" title="View Details">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default QuoteTable;