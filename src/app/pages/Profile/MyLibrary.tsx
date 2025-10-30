import { useState, useEffect } from 'react';
import { useToast } from '../../contexts/ToastContext';
import {
  getCollections,
  createCollection,
  updateCollection,
  deleteCollection,
  removeTemplateFromCollection,
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
  const [expandedCollectionId, setExpandedCollectionId] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<null | Collection>(null);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDescription, setNewCollectionDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [removingTemplate, setRemovingTemplate] = useState<{collectionId: number, templateId: number} | null>(null);

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
    } catch {
      console.error('Error fetching purchased templates:');
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
    } catch {
      console.error('Error fetching collections:');
      toast.error('Error', 'Failed to fetch collections');
    } finally {
      setLoadingCollections(false);
    }
  };

  // CREATE
  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) {
      toast.warning('Missing Name', 'Name is required');
      return;
    }
    setIsSubmitting(true);
    try {
      await createCollection(newCollectionName.trim(), newCollectionDescription.trim());
      setShowCreateModal(false);
      setNewCollectionName('');
      setNewCollectionDescription('');
      toast.success('Created', 'Collection created successfully');
      fetchCollections();
    } catch {
      toast.error('Failed', 'Could not create collection');
    } finally {
      setIsSubmitting(false);
    }
  };

  // DELETE
  const handleDeleteCollection = async (id: number) => {
    if (!window.confirm('Delete this collection? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await deleteCollection(id);
      toast.success('Deleted', 'Collection deleted');
      fetchCollections();
    } catch {
      toast.error('Failed', 'Could not delete collection');
    } finally {
      setDeletingId(null);
    }
  };

  // EDIT
  const handleEditCollection = async () => {
    if (!showEditModal) return;
    if (!newCollectionName.trim()) {
      toast.warning('Missing Name', 'Name is required');
      return;
    }
    setIsSubmitting(true);
    try {
      await updateCollection(showEditModal.id, newCollectionName.trim(), newCollectionDescription.trim());
      setShowEditModal(null);
      setNewCollectionName('');
      setNewCollectionDescription('');
      toast.success('Updated', 'Collection updated');
      fetchCollections();
    } catch {
      toast.error('Failed', 'Could not update collection');
    } finally {
      setIsSubmitting(false);
    }
  };

  // REMOVE TEMPLATE
  const handleRemoveTemplate = async (collectionId: number, templateId: number) => {
    setRemovingTemplate({ collectionId, templateId });
    try {
      await removeTemplateFromCollection(collectionId, templateId);
      toast.success('Removed', 'Template removed from collection');
      fetchCollections();
    } catch {
      toast.error('Failed', 'Could not remove template');
    } finally {
      setRemovingTemplate(null);
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
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">My Collections</h2>
            <button onClick={() => setShowCreateModal(true)} className="bg-green-600 text-white font-semibold px-6 py-2 rounded-lg shadow hover:bg-green-700 focus:outline-none">+ Create Collection</button>
          </div>
          {loadingCollections ? (
            <div className="py-12 text-center">Loading collections…</div>
          ) : (
            <div className="space-y-6">
              {collections.map((collection) => {
                const isExpanded = expandedCollectionId === collection.id;
                return (
                  <div key={collection.id} className="bg-white shadow rounded-xl border border-gray-200 p-6 transition-all">
                    <div className="flex justify-between items-center ">
                      <div className="flex items-start flex-col">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-bold text-gray-900">{collection.name}</h3>
                          <span className="ml-3 px-3 py-0.5 rounded-full bg-gray-100 text-sm text-gray-700">{collection.templateCount} templates</span>
                        </div>
                        {collection.description && <div className="text-gray-600 mb-2 max-w-lg whitespace-pre-line">{collection.description}</div>}
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          className="px-3 py-1 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg"
                          onClick={() => {
                            setShowEditModal(collection);
                            setNewCollectionName(collection.name);
                            setNewCollectionDescription(collection.description);
                          }}
                        >Edit</button>
                        <button
                          className="px-3 py-1 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-lg"
                          disabled={Boolean(deletingId && deletingId === collection.id)}
                          onClick={() => handleDeleteCollection(collection.id)}
                        >{deletingId === collection.id ? 'Deleting...' : 'Delete'}</button>
                        <button
                          className="px-3 py-1 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                          onClick={() => setExpandedCollectionId(isExpanded ? null : collection.id)}
                        >{isExpanded ? 'Hide' : 'View Templates'}</button>
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="mt-6">
                        {collection.templates.length === 0 ? (
                          <div className="text-gray-500 italic">No templates in this collection.</div>
                        ) : (
                          <ul className="divide-y divide-gray-100">
                            {collection.templates.map((template) => (
                              <li key={template.id} className="flex items-center justify-between py-3">
                                <div>
                                  <span className="font-medium text-gray-800 mr-4">{template.title}</span>
                                  <span className="text-sm text-gray-500 mr-3">({template.category.name})</span>
                                  <Link className="text-green-600 hover:underline text-sm" to={`/templates/${template.id}`}>View</Link>
                                </div>
                                <button
                                  onClick={() => handleRemoveTemplate(collection.id, template.id)}
                                  disabled={!!(removingTemplate && removingTemplate.collectionId === collection.id && removingTemplate.templateId === template.id)}
                                  className="px-3 py-1 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-lg"
                                >
                                  {removingTemplate && removingTemplate.collectionId === collection.id && removingTemplate.templateId === template.id ? 'Removing...' : 'Remove'}
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              {collections.length === 0 && <div className="text-center text-gray-400 py-12">No collections.</div>}
            </div>
          )}
        </div>
      )}

      {/* CREATE COLLECTION MODAL */}
      {showCreateModal && (
        <div className="fixed z-30 inset-0 bg-gray-800 bg-opacity-35 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-8">
            <h3 className="text-lg font-bold mb-4">Create Collection</h3>
            <div className="mb-4">
              <label className="block text-sm mb-1 text-gray-700 font-medium">Name</label>
              <input
                type="text"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-green-500"
                maxLength={100}
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm mb-1 text-gray-700 font-medium">Description (optional)</label>
              <textarea
                value={newCollectionDescription}
                onChange={(e) => setNewCollectionDescription(e.target.value)}
                className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-green-500"
                maxLength={350}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-4 mt-4">
              <button onClick={() => setShowCreateModal(false)} disabled={isSubmitting}
                className="px-5 py-2 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleCreateCollection} disabled={isSubmitting || !newCollectionName.trim()}
                className="px-6 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 disabled:opacity-60">
                {isSubmitting ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* EDIT COLLECTION MODAL */}
      {showEditModal && (
        <div className="fixed z-30 inset-0 bg-gray-800 bg-opacity-35 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-8">
            <h3 className="text-lg font-bold mb-4">Edit Collection</h3>
            <div className="mb-4">
              <label className="block text-sm mb-1 text-gray-700 font-medium">Name</label>
              <input
                type="text"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-green-500"
                maxLength={100}
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm mb-1 text-gray-700 font-medium">Description (optional)</label>
              <textarea
                value={newCollectionDescription}
                onChange={(e) => setNewCollectionDescription(e.target.value)}
                className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-green-500"
                maxLength={350}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-4 mt-4">
              <button onClick={() => setShowEditModal(null)} disabled={isSubmitting}
                className="px-5 py-2 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleEditCollection} disabled={isSubmitting || !newCollectionName.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-60">
                {isSubmitting ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
