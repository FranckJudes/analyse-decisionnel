const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const getCustomizerPreferences = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return { success: false, message: 'Not authenticated' };
    }

    const response = await fetch(`${API_BASE_URL}/api/users/preferences`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch preferences');
    }

    const data = await response.json();
    return { success: true, preferences: data };
  } catch (error) {
    console.error('Error fetching preferences:', error);
    return { success: false, message: error.message };
  }
};

export const saveCustomizerPreferences = async (settings) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      localStorage.setItem('customizer-settings', JSON.stringify(settings));
      return { success: true };
    }

    const response = await fetch(`${API_BASE_URL}/api/users/preferences`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    });

    if (!response.ok) {
      throw new Error('Failed to save preferences');
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error saving preferences:', error);
    localStorage.setItem('customizer-settings', JSON.stringify(settings));
    return { success: false, message: error.message };
  }
};
