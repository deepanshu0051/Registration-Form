export const setToken = (token) => {
    localStorage.setItem("authToken", token);
};

export const getToken = () => {
    return localStorage.getItem("authToken");
};

export const removeToken = () => {
    localStorage.removeItem("authToken");
};

export const setUser = (user) => {
    localStorage.setItem("authUser", JSON.stringify(user));
};

export const getUser = () => {
    const userStr = localStorage.getItem("authUser");
    if (!userStr || userStr === "undefined") return null;
    try {
        return JSON.parse(userStr);
    } catch {
        return null;
    }
};

export const removeUser = () => {
    localStorage.removeItem("authUser");
};

export const logout = () => {
    removeToken();
    removeUser();
    sessionStorage.removeItem('tempAccess');
    window.location.href = "/register";
};
