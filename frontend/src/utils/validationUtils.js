export const getPasswordStrength = (password) => {
    if (!password) return { color: 'transparent', width: '0%' };
    
    const length = password.length;
    const hasLetters = /[a-zA-Z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (length < 6) {
        return { color: '#ef4444', width: '33%' }; // Weak (Red)
    } else if (length < 8 || !(hasLetters && hasNumbers)) {
        return { color: '#eab308', width: '66%' }; // Medium (Yellow)
    } else {
        return { color: '#22c55e', width: '100%' }; // Strong (Green)
    }
};
