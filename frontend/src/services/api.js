const API_URL = import.meta.env.VITE_API_URL;

console.log("API URL:", API_URL);
const handleResponse = async (response) => {
    const text = await response.text();

    let data;

    try {
        data = text ? JSON.parse(text) : {};
    } catch {
        throw new Error('Server returned an invalid response.');
    }

    if (!response.ok) {
        throw new Error(data.message || 'Something went wrong.');
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