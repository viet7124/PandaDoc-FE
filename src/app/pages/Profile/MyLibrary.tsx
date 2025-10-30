import { useState, useEffect } from 'react';
import { useToast } from '../../contexts/ToastContext';
import {
  getCollections,
  type Collection,
} from './services/collectionsAPI';
import {
  getPurchasedTemplates,
  type PurchasedTemplate,
} from './services/purchasesAPI';
import { Link } from 'react-router-dom';

export default function MyLibrary() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'purchased' | 'collections'>('purchased');
  const [purchasedTemplates, setPurchasedTemplates] = useState<PurchasedTemplate[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loadingPurchases, setLoadingPurchases] = useState(false);
  const [loadingCollections, setLoadingCollections] = useState(false);

  useEffect(() => {
    if (activeTab === 'purchased') {
      fetchPurchases();
    } else {
      fetchCollections();
    }
    // eslint-disable-next-line
  }, [activeTab]);

  const fetchPurchases = async () => {
    try {
      setLoadingPurchases(true);
      const data = await getPurchasedTemplates();
      setPurchasedTemplates(data);
    } catch (error) {
      console.error('Error fetching purchased templates:', error);
      toast.error('Error', 'Failed to fetch purchased templates');
    } finally {
      setLoadingPurchases(false);
    }
  };

  const fetchCollections = async () => {
    try {
      setLoadingCollections(true);
      const data = await getCollections();
      setCollections(data);
    } catch (error) {
      console.error('Error fetching collections:', error);
      toast.error('Error', 'Failed to fetch collections');
    } finally {
      setLoadingCollections(false);
    }
  };

  return (
    <div className="my-library-page max-w-6xl mx-auto p-8">
      <div className="flex mb-6 gap-4">
        <button
          className={`px-6 py-3 rounded-lg font-medium transition ${activeTab === 'purchased' ? 'bg-green-600 text-white shadow-md' : 'bg-white text-gray-700 border border-gray-300'}`}
          onClick={() => setActiveTab('purchased')}
        >
          Templates Purchased
        </button>
        <button
          className={`px-6 py-3 rounded-lg font-medium transition ${activeTab === 'collections' ? 'bg-green-600 text-white shadow-md' : 'bg-white text-gray-700 border border-gray-300'}`}
          onClick={() => setActiveTab('collections')}
        >
          My Collections
        </button>
      </div>

      {activeTab === 'purchased' && (
        <div>
          {loadingPurchases ? (
            <div className="py-12 text-center">Loading purchases…</div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {purchasedTemplates.map((purchase) => (
                <li key={purchase.libraryId} className="py-4 flex items-center gap-4">
                  <div className="flex-1">
                    <div className="font-semibold">{purchase.template.title}</div>
                    <div className="text-gray-500 text-sm">{purchase.template.category?.name}</div>
                  </div>
                  <Link className="text-green-600 hover:underline" to={`/templates/${purchase.template.id}`}>View</Link>
                </li>
              ))}
              {purchasedTemplates.length === 0 && <li className="text-gray-400 text-center py-12">No purchased templates.</li>}
            </ul>
          )}
        </div>
      )}

      {activeTab === 'collections' && (
        <div>
          {loadingCollections ? (
            <div className="py-12 text-center">Loading collections…</div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {collections.map((collection) => (
                <li key={collection.id} className="py-4 flex items-center gap-4">
                  <div className="flex-1">
                    <div className="font-semibold">{collection.name}</div>
                    <div className="text-gray-500 text-sm">{collection.description}</div>
                  </div>
                </li>
              ))}
              {collections.length === 0 && <li className="text-gray-400 text-center py-12">No collections.</li>}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
