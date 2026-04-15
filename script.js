const users = [
    { id: 1, username: 'admin', password: 'admin123', role: 'admin', email: 'admin@techshop.com' },
    { id: 2, username: 'john', password: 'user123', role: 'user', email: 'john@example.com' },
    { id: 3, username: 'alice', password: 'alice456', role: 'user', email: 'alice@example.com' }
];

// --- AUTHENTICATION HELPERS ---
function setCookie(name, value, days = 7) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = name + "=" + value + ";expires=" + date.toUTCString() + ";path=/";
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

// --- VULNERABLE LOGIN FUNCTION ---
function login() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    // REMOVED: isValidUsername and isValidPassword checks. 
    // This allows special characters like ' OR 1=1

    // SIMULATING SQL INJECTION VULNERABILITY
    // In a real DB, string concatenation allows ' OR '1'='1 to bypass logic.
    // We simulate that "always true" logic here.
    let user;
    
    if (username.includes("' OR '1'='1") || username.includes('" OR "1"="1')) {
        // The "Injection" logic: If the payload is detected, we return the first user (admin)
        user = users[0];
        console.warn("SQL Injection detected (Simulation)");
    } else {
        // Normal find (Vulnerable to Brute Force because there is no rate limiting)
        user = users.find(u => u.username === username && u.password === password);
    }
    
    if (user) {
        setCookie('username', user.username);
        setCookie('role', user.role);
        setCookie('userId', user.id);
        
        // Note: In a true vulnerable app, we might even skip the signature 
        // to show how easy it is to spoof cookies!
        alert('Login successful! Welcome ' + user.username);
        location.reload();
    } else {
        // BRUTE FORCE VULNERABILITY: 
        // No delay, no lockout, no captcha. A script can spam this.
        alert('Invalid credentials!');
    }
}

// --- VULNERABLE SEARCH (XSS Potential) ---
function searchProducts() {
    const searchTerm = document.getElementById('searchInput').value;
    const resultsDiv = document.getElementById('searchResults');
    
    // REMOVED: sanitizeInput()
    // VULNERABILITY: Using innerHTML with raw user input allows for XSS.
    resultsDiv.innerHTML = '<h3>Search Results for: ' + searchTerm + '</h3>';
    
    const products = ['Smartphone Pro Max', 'Wireless Earbuds', 'Fast Charger', 'Laptop Ultra', 'Smart Watch', 'Wireless Mouse'];
    const foundProducts = products.filter(p => p.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (foundProducts.length > 0) {
        let listHtml = '<ul style="margin-top: 10px;">';
        foundProducts.forEach(product => {
            listHtml += `<li>${product}</li>`;
        });
        listHtml += '</ul>';
        resultsDiv.innerHTML += listHtml;
    }
}

function checkAuth() {
    const username = getCookie('username');
    const role = getCookie('role');

    if (username && role) {
        document.getElementById('username').textContent = username;
        
        if (role === 'admin') {
            document.getElementById('roleBadge').textContent = 'Admin';
            document.getElementById('roleBadge').className = 'badge badge-admin';
            document.getElementById('adminPanel').style.display = 'block';
            
            let userTable = '<table style="width: 100%; border-collapse: collapse;">';
            userTable += '<tr style="background: #f0f0f0;"><th style="padding: 10px; text-align: left;">ID</th><th style="padding: 10px; text-align: left;">Username</th><th style="padding: 10px; text-align: left;">Email</th></tr>';
            users.forEach(user => {
                userTable += `<tr style="border-bottom: 1px solid #ddd;"><td style="padding: 10px;">${user.id}</td><td style="padding: 10px;">${user.username}</td><td style="padding: 10px;">${user.email}</td></tr>`;
            });
            userTable += '</table>';
            document.getElementById('userDatabase').innerHTML = userTable;
        }
    }
}

function logout() {
    document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "userId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    location.reload();
}

checkAuth();
