import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

interface SmsSettings {
  enabled: boolean;
  templateText: string;
  sendWindowStart: string; // e.g., "08:00"
  sendWindowEnd: string;   // e.g., "20:00"
}

const defaultSmsSettings: SmsSettings = {
  enabled: false,
  templateText: "Thank you for your donation of {{amount}} to {{churchName}} on {{date}}. God bless you!",
  sendWindowStart: "08:00",
  sendWindowEnd: "20:00",
};

export const useSmsSettings = () => {
  const { currentUser } = useAuth();
  const [smsSettings, setSmsSettings] = useState<SmsSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getSmsSettingsRef = useCallback(() => {
    if (!currentUser) return null;
    return doc(db, `users/${currentUser.uid}/settings/sms`);
  }, [currentUser]);

  useEffect(() => {
    const settingsRef = getSmsSettingsRef();
    if (!settingsRef) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(settingsRef, (docSnap) => {
      if (docSnap.exists()) {
        setSmsSettings({ ...defaultSmsSettings, ...docSnap.data() as SmsSettings });
      } else {
        // If no settings exist, set default settings and create the document
        setSmsSettings(defaultSmsSettings);
        setDoc(settingsRef, defaultSmsSettings).catch(e => {
          console.error("Error setting default SMS settings:", e);
          setError("Failed to set default SMS settings.");
        });
      }
      setLoading(false);
    }, (e) => {
      console.error("Error fetching SMS settings:", e);
      setError("Failed to load SMS settings.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser, getSmsSettingsRef]);

  const updateSmsSettings = useCallback(async (newSettings: Partial<SmsSettings>) => {
    if (!currentUser) {
      setError("No user logged in.");
      return;
    }
    setLoading(true);
    try {
      const settingsRef = getSmsSettingsRef();
      if (settingsRef) {
        await setDoc(settingsRef, { ...smsSettings, ...newSettings }, { merge: true });
        setSmsSettings(prev => ({ ...prev!, ...newSettings }));
      }
    } catch (e) {
      console.error("Error updating SMS settings:", e);
      setError("Failed to update SMS settings.");
    } finally {
      setLoading(false);
    }
  }, [currentUser, smsSettings, getSmsSettingsRef]);

  return {
    smsSettings,
    loading,
    error,
    updateSmsSettings,
  };
};