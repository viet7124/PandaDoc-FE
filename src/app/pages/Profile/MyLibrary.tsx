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

// Type fix to allow previewImages and images

type PurchasedT = PurchasedTemplate & { template: PurchasedTemplate["template"] & { previewImages?: string[]; images?: string[] } };
type CollectionT = Collection & { templates: (Collection["templates"][0] & { previewImages?: string[]; images?: string[] })[] };

export default function MyLibrary() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'purchased' | 'collections'>('purchased');
  const [purchasedTemplates, setPurchasedTemplates] = useState<PurchasedT[]>([]);
  const [collections, setCollections] = useState<CollectionT[]>([]);
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
      <h1 className="text-2xl font-bold">My Library</h1>
      <p className="text-gray-600">Manage your purchased templates and collections</p>
      <div className="flex mb-8 gap-3 rounded-full bg-gray-50 shadow px-2 py-1 w-fit mx-auto">
        <button
          className={`px-6 py-2.5 rounded-full font-semibold transition-all duration-200 shadow-sm ${activeTab === 'purchased' ? 'bg-green-600 text-white scale-105' : 'text-gray-800 hover:bg-green-50 hover:text-green-700'}`}
          style={{boxShadow: activeTab === 'purchased' ? '0 2px 8px rgba(16,185,129,.16)' : undefined}}
          onClick={() => setActiveTab('purchased')}>
          Templates Purchased
        </button>
        <button
          className={`px-6 py-2.5 rounded-full font-semibold transition-all duration-200 shadow-sm ${activeTab === 'collections' ? 'bg-green-600 text-white scale-105' : 'text-gray-800 hover:bg-green-50 hover:text-green-700'}`}
          style={{boxShadow: activeTab === 'collections' ? '0 2px 8px rgba(16,185,129,.16)' : undefined}}
          onClick={() => setActiveTab('collections')}>
          My Collections
        </button>
      </div>

      {activeTab === 'purchased' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loadingPurchases ? (
            <div className="col-span-2 py-16 text-center"><div className="animate-spin rounded-full h-9 w-9 border-b-2 border-green-600 mx-auto mb-3" /> Loading purchases…</div>
          ) : purchasedTemplates.length === 0 ? (
            <div className="col-span-2 text-center py-24 opacity-60">
              <svg className="w-14 h-14 text-green-300 mx-auto mb-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0V7a2 2 0 00-2-2H7a2 2 0 00-2 2v4m14 0v6a2 2 0 01-2 2H7a2 2 0 01-2-2v-6" /></svg>
              <div className="font-semibold text-lg">No purchased templates</div>
              <p className="text-gray-500">Buy a template to see it here.</p>
            </div>
          ) : purchasedTemplates.map((purchase) => {
            const t = purchase.template as typeof purchase.template & { previewImages?: string[]; images?: string[] };
            const previewSrc = t.previewImages?.[0] || t.images?.[0] || null;
            return (
              <div key={purchase.libraryId} className="bg-white shadow rounded-xl border border-gray-100 p-4 flex items-center gap-5 hover:shadow-md transition">
                <div className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
                  {previewSrc ? (
                    <img src={previewSrc} alt={t.title + ' preview'} className="object-cover w-full h-full" />
                  ) : (
                    <svg className="w-10 h-10 text-gray-300" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-lg text-gray-900 mb-1 line-clamp-1">{t.title}</div>
                  <span className="inline-block mb-1 bg-green-50 text-green-700 text-xs font-semibold px-3 py-1 rounded-full max-w-xs truncate">{t.category?.name || 'No category'}</span>
                  <div className="text-gray-500 text-sm mt-0.5 line-clamp-2">{t.description?.slice(0,80)}{t.description?.length > 80 ? '…' : ''}</div>
                </div>
                <Link to={`/templates/${t.id}`}
                  className="ml-2 text-white bg-green-600 font-semibold px-5 py-2 rounded-lg shadow hover:bg-green-700 transition-all duration-200 focus:outline-none whitespace-nowrap">View</Link>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'collections' && (
        <div className="space-y-7">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">My Collections</h2>
            <button onClick={() => setShowCreateModal(true)} className="bg-green-600 text-white font-bold px-6 py-2 rounded-xl shadow hover:bg-green-700 focus:outline-none transition">+ Create Collection</button>
          </div>
          {loadingCollections ? (
            <div className="py-16 text-center">
              <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-green-600 mx-auto mb-3" /> Loading collections…
            </div>
          ) : collections.length === 0 ? (
            <div className="text-center py-24 opacity-60">
              <svg className="w-16 h-16 text-green-200 mx-auto mb-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeDasharray="4" /></svg>
              <div className="font-semibold text-lg">No collections yet</div>
              <p className="text-gray-500">Click "+ Create Collection" to start organizing your templates.</p>
            </div>
          ) : collections.map((collection) => {
            const isExpanded = expandedCollectionId === collection.id;
            return (
              <div key={collection.id} className="bg-white shadow-lg rounded-2xl border flex flex-col gap-2 border-gray-100 p-6 transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="inline-block w-1 h-7 bg-green-400 rounded-lg mr-4 align-middle" />
                    <span className="font-bold text-lg text-gray-900 align-middle">{collection.name}</span>
                    <span className="ml-4 px-3 py-1 rounded-full bg-gray-50 border text-xs text-gray-500">{collection.templateCount} templates</span>
                    {collection.description && <div className="text-gray-500 text-sm mt-2 mb-1 max-w-xl">{collection.description}</div>}
                  </div>
                  <div className="flex gap-3 items-start">
                    <button className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg transition" onClick={() => {setShowEditModal(collection);setNewCollectionName(collection.name);setNewCollectionDescription(collection.description);}}>Edit</button>
                    <button className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg transition" disabled={Boolean(deletingId && deletingId === collection.id)} onClick={() => handleDeleteCollection(collection.id)}>{deletingId === collection.id ? 'Deleting…' : 'Delete'}</button>
                    <button className="px-3 py-1 text-gray-700 hover:bg-gray-100 rounded-lg transition" onClick={() => setExpandedCollectionId(isExpanded ? null : collection.id)}>{isExpanded ? 'Hide' : 'View Templates'}</button>
                  </div>
                </div>
                {isExpanded && (
                  <div className="mt-5 p-4 rounded-xl bg-gray-50">
                    {collection.templates.length === 0 ? (
                      <div className="text-gray-400 py-10 text-center">No templates in this collection.</div>
                    ) : (
                      <ul className="divide-y divide-gray-100">
                        {collection.templates.map((template) => {
                          const tpl = template as typeof template & { previewImages?: string[]; images?: string[] };
                          const previewSrc = tpl.previewImages?.[0] || tpl.images?.[0] || null;
                          return (
                            <li key={template.id} className="flex items-center gap-4 py-3 hover:bg-white group">
                              <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                                {previewSrc ? (
                                  <img src={previewSrc} alt={template.title + ' preview'} className="object-cover w-full h-full" />
                                ) : (
                                  <svg className="w-8 h-8 text-gray-300" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-bold text-gray-900 mb-1 line-clamp-1">{template.title || 'Untitled'}</div>
                                <span className="inline-block mb-1 bg-green-100 text-green-700 font-mono text-xs rounded-full px-3 py-1 max-w-xs truncate">{template.category?.name || 'No category'}</span>
                                <div className="text-gray-500 text-xs mt-0.5 line-clamp-2">{template.description?.slice(0,70)}{template.description?.length > 70 ? '…' : ''}</div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Link to={`/templates/${template.id}`} className="text-green-600 hover:text-green-800 font-medium px-4 py-2 rounded-lg transition whitespace-nowrap">View</Link>
                                <button onClick={() => handleRemoveTemplate(collection.id, template.id)} disabled={!!(removingTemplate && removingTemplate.collectionId === collection.id && removingTemplate.templateId === template.id)} className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50 whitespace-nowrap">
                                  {removingTemplate && removingTemplate.collectionId === collection.id && removingTemplate.templateId === template.id ? 'Removing…' : 'Remove'}
                                </button>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            );
          })}
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
