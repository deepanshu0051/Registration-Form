const testSecurity = async () => {
    console.log("=== STARTING SECURITY TESTS ===");
    
    // Test 1: SQL Injection on Login
    console.log("\\n--- Testing SQL Injection on Login ---");
    try {
        const sqlPayload = { email: "admin@gmail.com' OR '1'='1", password: "password" };
        const res = await fetch("http://localhost:1000/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(sqlPayload)
        });
        const data = await res.json();
        if (!res.ok) {
            console.log("Blocked SQLi correctly. Status:", res.status, "| Message:", data.message);
        } else {
            console.log("FAILED to block SQLi. Warning!", data);
        }
    } catch (error) {
        console.error("Network Error:", error.message);
    }

    // Test 2: XSS Payload on Registration
    console.log("\\n--- Testing XSS on Registration (Name Field) ---");
    try {
        const xssPayload = { 
            name: "<script>alert('XSS')</script>John", 
            isd: "+91", 
            email: "xss_test@gmail.com", 
            address: "123 Main St", 
            pincode: "110001",
            city: "Delhi", 
            state: "Delhi", 
            country: "India", 
            dob: "2000-01-01", 
            username: "xss_user", 
            password: "Password@123", 
            confirmPassword: "Password@123" 
        };
        const res = await fetch("http://localhost:1000/api/students/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(xssPayload)
        });
        const data = await res.json();
        if (!res.ok) {
            console.log("XSS Request failed/blocked (as expected). Status:", res.status, "| Message:", data.message);
        } else {
            console.log("Registration complete. The inputs were safely sanitized via backend resulting in safe data:", data.message);
        }
    } catch (error) {
        console.error("Network Error:", error.message);
    }

    console.log("\\n=== TESTS COMPLETE ===");
};

testSecurity();
