import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  doc,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { FeedItem } from '@/types/feed';

const COLLECTION_NAME = 'knowledge';

export interface FirebaseKnowledgeItem {
  id: string;
  type: FeedItem['type'];
  title: string;
  content: string;
  source: string;
  link?: string;
  createdAt: Timestamp;
  isManual: boolean;
}

/**
 * Add a knowledge item to Firebase
 */
export async function addKnowledgeItem(item: Omit<FeedItem, 'timestamp'> & { timestamp?: Date }) {
  try {
    const data = {
      type: item.type,
      title: item.title,
      content: item.content,
      source: item.source || 'UNKNOWN',
      link: item.link || null,
      createdAt: Timestamp.fromDate(item.timestamp || new Date()),
      isManual: item.isManual || false,
    };

    console.log('📤 Saving to Firebase:', { ...data, content: data.content.slice(0, 50) + '...' });

    const docRef = await addDoc(collection(db, COLLECTION_NAME), data);

    console.log('✅ Knowledge item saved to Firebase:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error saving to Firebase:', error);
    throw error;
  }
}

/**
 * Subscribe to real-time knowledge updates
 * Returns unsubscribe function
 */
export function subscribeToKnowledge(callback: (items: FeedItem[]) => void) {
  const q = query(
    collection(db, COLLECTION_NAME),
    orderBy('createdAt', 'desc')
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const items: FeedItem[] = snapshot.docs.map(doc => {
      const data = doc.data() as Omit<FirebaseKnowledgeItem, 'id'>;
      return {
        id: doc.id,
        type: data.type,
        title: data.title,
        content: data.content,
        source: data.source,
        link: data.link || undefined,
        timestamp: data.createdAt.toDate(),
        isNew: false, // Firebase items are not "new" visually
        isManual: data.isManual || false,
      };
    });

    console.log('🔥 Firebase update:', items.length, 'items');
    if (items.length > 0) {
      console.log('🔥 First item:', items[0].content.slice(0, 50), 'isManual:', items[0].isManual);
    }
    callback(items);
  }, (error) => {
    console.error('❌ Firebase subscription error:', error);
  });

  return unsubscribe;
}

/**
 * Delete a knowledge item from Firebase
 */
export async function deleteKnowledgeItem(id: string) {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
    console.log('🗑️ Knowledge item deleted from Firebase:', id);
  } catch (error) {
    console.error('❌ Error deleting from Firebase:', error);
    throw error;
  }
}
