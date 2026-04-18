import type { Journal, MoodType } from "@shared/schema";

const STORAGE_KEYS = {
  JOURNALS: "lumi_guest_journals",
  MOODS: "lumi_guest_moods",
  ONBOARDING: "lumi_guest_onboarding",
};

export const guestData = {
  // Journals
  getJournals: (): Journal[] => {
    const data = localStorage.getItem(STORAGE_KEYS.JOURNALS);
    return data ? JSON.parse(data) : [];
  },

  saveJournal: (entry: Partial<Journal>): Journal => {
    const journals = guestData.getJournals();
    const newEntry: Journal = {
      id: Math.floor(Math.random() * 1000000),
      userId: -1,
      title: entry.title || "",
      content: entry.content || "",
      moodTag: entry.moodTag || null,
      createdAt: new Date().toISOString() as any,
      ...entry,
    } as Journal;
    
    journals.unshift(newEntry);
    localStorage.setItem(STORAGE_KEYS.JOURNALS, JSON.stringify(journals));
    return newEntry;
  },

  // Moods
  getMoods: () => {
    const data = localStorage.getItem(STORAGE_KEYS.MOODS);
    return data ? JSON.parse(data) : [];
  },

  saveMood: (mood: MoodType, confidence: number) => {
    const moods = guestData.getMoods();
    const newMood = {
      id: Math.floor(Math.random() * 1000000),
      userId: -1,
      mood,
      confidence,
      createdAt: new Date().toISOString(),
    };
    moods.unshift(newMood);
    localStorage.setItem(STORAGE_KEYS.MOODS, JSON.stringify(moods));
    return newMood;
  },

  // Onboarding
  getOnboarding: () => {
    const data = localStorage.getItem(STORAGE_KEYS.ONBOARDING);
    return data ? JSON.parse(data) : null;
  },

  saveOnboarding: (data: any) => {
    localStorage.setItem(STORAGE_KEYS.ONBOARDING, JSON.stringify(data));
  },
};
