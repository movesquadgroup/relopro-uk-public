import React from 'react';
import { WhatsAppIcon, SmsIcon, LinkIcon, ApiKeyIcon, XeroIcon, QuickBooksIcon, GoogleCalendarIcon, GoogleMapsIcon } from '../components/icons/Icons';

interface IntegrationCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  isConnected: boolean;
}

const IntegrationCard: React.FC<IntegrationCardProps> = ({ icon, title, description, isConnected }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-start space-x-6 dark:bg-gray-800">
      <div className="text-brand-primary">{icon}</div>
      <div className="flex-grow">
        <h4 className="font-bold text-lg text-gray-800 dark:text-gray-200">{title}</h4>
        <p className="text-sm text-gray-600 mt-1 dark:text-gray-400">{description}</p>
      </div>
      <div className="flex-shrink-0">
        {isConnected ? (
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
             <span className="w-2 h-2 bg-green-500 rounded-full"></span>
             <span>Connected</span>
          </div>
        ) : (
          <button className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary transition-colors font-semibold text-sm shadow">
            Connect
          </button>
        )}
      </div>
    </div>
  );
};

const IntegrationsPage: React.FC = () => {
  return (
    <div>
      <h3 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Integrations</h3>
      <p className="text-gray-600 mt-1 dark:text-gray-400">Connect ReloPro with your favorite tools and services.</p>

      <div className="mt-8 space-y-6">
        {/* Communication Integrations */}
        <div>
          <h4 className="text-lg font-semibold text-gray-700 mb-3 ml-1 dark:text-gray-300">Communication</h4>
          <div className="space-y-4">
            <IntegrationCard
              icon={<WhatsAppIcon />}
              title="WhatsApp"
              description="Connect to send automated notifications and communicate with clients via WhatsApp."
              isConnected={false}
            />
            <IntegrationCard
              icon={<SmsIcon />}
              title="Twilio"
              description="Enable SMS notifications for job updates, reminders, and client communication."
              isConnected={true}
            />
          </div>
        </div>

        {/* ENHANCEMENT_integration_layer: Add Accounting and Productivity sections */}
        <div>
            <h4 className="text-lg font-semibold text-gray-700 mb-3 ml-1 dark:text-gray-300">Accounting</h4>
            <div className="space-y-4">
                <IntegrationCard
                    icon={<XeroIcon />}
                    title="Xero"
                    description="Sync invoices and payments directly to your Xero account."
                    isConnected={true}
                />
                <IntegrationCard
                    icon={<QuickBooksIcon />}
                    title="QuickBooks"
                    description="Automatically create invoices in QuickBooks when quotes are accepted."
                    isConnected={false}
                />
            </div>
        </div>

        <div>
            <h4 className="text-lg font-semibold text-gray-700 mb-3 ml-1 dark:text-gray-300">Productivity</h4>
            <div className="space-y-4">
                <IntegrationCard
                    icon={<GoogleCalendarIcon />}
                    title="Google Calendar"
                    description="Two-way sync of your ReloPro diary with a Google Calendar."
                    isConnected={false}
                />
                 <IntegrationCard
                    icon={<GoogleMapsIcon />}
                    title="Google Maps"
                    description="Used for distance calculations and route planning."
                    isConnected={true}
                />
            </div>
        </div>
        {/* END ENHANCEMENT */}


        {/* Field App Integrations */}
        <div>
          <h4 className="text-lg font-semibold text-gray-700 mb-3 ml-1 dark:text-gray-300">Field Operations</h4>
          <div className="space-y-4">
            <IntegrationCard
              icon={<LinkIcon />}
              title="Appenate"
              description="Sync job data and field reports from your Appenate forms directly into the CRM."
              isConnected={false}
            />
          </div>
        </div>
        
        {/* ReloPro API Section */}
        <div>
            <h4 className="text-lg font-semibold text-gray-700 mb-3 ml-1 dark:text-gray-300">ReloPro API</h4>
            <div className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800">
                <div className="flex items-start space-x-6">
                    <div className="text-brand-primary"><ApiKeyIcon /></div>
                     <div className="flex-grow">
                        <h4 className="font-bold text-lg text-gray-800 dark:text-gray-200">External API Access</h4>
                        <p className="text-sm text-gray-600 mt-1 dark:text-gray-400">Generate API keys to allow trusted external systems to interact with your ReloPro data.</p>
                        <div className="mt-4">
                            <label htmlFor="api-key" className="text-sm font-medium text-gray-700 dark:text-gray-300">Your API Key</label>
                            <div className="flex items-center space-x-2 mt-1">
                                <input
                                    id="api-key"
                                    type="text"
                                    readOnly
                                    value="****************************************"
                                    className="w-full max-w-md px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm text-gray-500 dark:bg-gray-700 dark:border-gray-600"
                                />
                                <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold text-sm shadow">
                                    Generate New Key
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default IntegrationsPage;