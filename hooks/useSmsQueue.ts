import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

export type SmsQueueStatus = {
  id: string;
  transactionId: string;
  status: 'queued' | 'processing' | 'sent' | 'failed';
  deliveryStatus?: string;
  lastError?: string | null;
  attempts?: number;
  messageSid?: string;
  updatedAt?: any;
};

export const useSmsQueue = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<SmsQueueStatus[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setItems([]);
      return;
    }
    setLoading(true);
    const ref = collection(db, 'users', user.uid, 'smsQueue');
    const q = query(ref, orderBy('updatedAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const arr: SmsQueueStatus[] = snap.docs.map(d => {
        const data = d.data() as any;
        return {
          id: d.id,
          transactionId: data.transactionId,
          status: data.status,
          deliveryStatus: data.deliveryStatus,
          lastError: data.lastError,
          attempts: data.attempts,
          messageSid: data.messageSid,
          updatedAt: data.updatedAt,
        };
      });
      setItems(arr);
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, [user]);

  const byTransactionId = useMemo(() => {
    const map = new Map<string, SmsQueueStatus>();
    for (const item of items) {
      // Keep the latest status per transaction
      if (!map.has(item.transactionId)) map.set(item.transactionId, item);
    }
    return map;
  }, [items]);

  return { items, byTransactionId, loading };
};