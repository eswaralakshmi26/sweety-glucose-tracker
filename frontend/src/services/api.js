const API_URL = import.meta.env.VITE_API_URL;

const handleResponse = async (response) => {
    console.log('HTTP Status:', response.status);

    const text = await response.text();

    console.log('Backend Response:', text);

    let data;

    try {
        data = text ? JSON.parse(text) : {};
    } catch {
        throw new Error('Backend returned an invalid response.');
    }

    if (!response.ok) {
        throw new Error(
            data.message || `Request failed with status ${response.status}`
        );
    }

    return data;
};
export const registerUser = async (userData) => {
    const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    });

    return handleResponse(response);
};

export const loginUser = async (userData) => {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    });

    return handleResponse(response);
};
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');

    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
    };
};

export const addGlucoseReading = async (readingData) => {
    const response = await fetch(`${API_URL}/glucose`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(readingData)
    });

    return handleResponse(response);
};

export const getGlucoseReadings = async () => {
    const response = await fetch(`${API_URL}/glucose`, {
        method: 'GET',
        headers: getAuthHeaders()
    });

    return handleResponse(response);
};


export const updateGlucoseReading = async (id, readingData) => {
    const response = await fetch(`${API_URL}/glucose/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(readingData)
    });

    return handleResponse(response);
};
export const deleteGlucoseReading = async (id) => {
    const response = await fetch(`${API_URL}/glucose/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });

    return handleResponse(response);
};