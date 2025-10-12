import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Client, ClientStatus } from '../types';

interface ClientTableProps {
  clients: Client[];
}

const statusColorMap: Record<ClientStatus, string> = {
  [ClientStatus.Lead]: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  [ClientStatus.Quoted]: 'bg-blue-100 text-blue-800 border-blue-300',
  [ClientStatus.Booked]: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  [ClientStatus.InProgress]: 'bg-purple-100 text-purple-800 border-purple-300',
  [ClientStatus.Completed]: 'bg-green-100 text-green-800 border-green-300',
  [ClientStatus.Cancelled]: 'bg-red-100 text-red-800 border-red-300',
};

const getScoreColor = (score: number) => {
    if (score > 66) return 'bg-green-100 text-green-800';
    if (score > 33) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
}

const LeadScoreBadge: React.FC<{ score?: number }> = ({ score }) => {
    if (typeof score !== 'number') return null;
    return (
        <span className={`px-2 py-1 text-xs font-semibold leading-5 rounded-full ${getScoreColor(score)}`}>
            {score}
        </span>
    );
};


const StatusBadge: React.FC<{ status: ClientStatus }> = ({ status }) => (
  <span className={`px-2 py-1 text-xs font-semibold leading-5 rounded-full border ${statusColorMap[status]}`}>
    {status}
  </span>
);

const ClientTable: React.FC<ClientTableProps> = ({ clients }) => {
  const navigate = useNavigate();

  const handleRowClick = (clientId: string) => {
    navigate(`/crm/${clientId}`);
  };

  if (clients.length === 0) {
      return <div className="text-center p-8 bg-white rounded-lg shadow-md text-gray-500 dark:bg-gray-800 dark:text-gray-400">No clients found.</div>
  }
    
  return (
    <div className="w-full overflow-hidden rounded-lg shadow-lg">
      <div className="w-full overflow-x-auto">
        <table className="w-full whitespace-no-wrap">
          <thead>
            <tr className="text-xs font-semibold tracking-wide text-left text-gray-500 uppercase border-b bg-gray-50 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600">
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Move Date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Lead Score</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y dark:bg-gray-800 dark:divide-gray-700">
            {clients.map((client) => (
              <tr key={client.id} className="text-gray-700 hover:bg-gray-50 cursor-pointer dark:text-gray-400 dark:hover:bg-gray-700" onClick={() => handleRowClick(client.id)}>
                <td className="px-4 py-3">
                  <div className="flex items-center text-sm">
                    <div className="relative hidden w-8 h-8 mr-3 rounded-full md:block">
                      <img className="object-cover w-full h-full rounded-full" src={client.avatarUrl || `https://i.pravatar.cc/150?u=${client.id}`} alt="" loading="lazy" />
                    </div>
                    <div>
                      <p className="font-semibold dark:text-gray-200">{client.name}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{client.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">
                    {client.email}<br/>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{client.phone}</span>
                </td>
                <td className="px-4 py-3 text-sm">
                  {new Date(client.moveDate).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-xs">
                  <StatusBadge status={client.status} />
                </td>
                <td className="px-4 py-3 text-sm">
                    <LeadScoreBadge score={client.leadScore} />
                </td>
                <td className="px-4 py-3 text-sm">
                  <button className="px-3 py-1 text-sm font-medium leading-5 text-brand-primary transition-colors duration-150 bg-brand-light border border-transparent rounded-lg active:bg-brand-primary active:text-white hover:bg-brand-secondary hover:text-white focus:outline-none dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClientTable;