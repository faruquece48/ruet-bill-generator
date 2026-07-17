// lib/storage/draft.ts

const STORAGE_KEY = "ruet-bill-draft";

// =======================
// Save Draft
// =======================

export function saveDraft(data: unknown) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(data)
    );

    alert("Draft saved successfully.");
  } catch (error) {
    console.error(error);
    alert("Failed to save draft.");
  }
}

// =======================
// Load Draft
// =======================

export function loadDraft() {
  try {
    const data = localStorage.getItem(
      STORAGE_KEY
    );

    if (!data) {
      alert("No saved draft found.");
      return null;
    }

    return JSON.parse(data);
  } catch (error) {
    console.error(error);
    alert("Failed to load draft.");
    return null;
  }
}

// =======================
// Delete Draft
// =======================

export function deleteDraft() {
  localStorage.removeItem(STORAGE_KEY);
}