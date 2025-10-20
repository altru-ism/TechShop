const users = [
    { id: 1, username: 'admin', password: 'admin123', role: 'admin', email: 'admin@techshop.com' },
    { id: 2, username: 'john', password: 'user123', role: 'user', email: 'john@example.com' },
    { id: 3, username: 'alice', password: 'alice456', role: 'user', email: 'alice@example.com' }
];

// Cookies are used for authentication
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

// This simulates an SQL query
function login() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    if (username.includes("' OR '1'='1") || username.includes("' or '1'='1") || 
        username.includes("' OR 1=1") || username.includes("' or 1=1") ||
        username.includes("'OR'1'='1") || username.includes("admin'--")) {
        // SQL injection successful!
        alert('SQL Injection Successful! Logged in as admin.');
        setCookie('username', 'admin');
        setCookie('role', 'admin');
        setCookie('userId', '1');
        location.reload();
        return;
    }

    // Normal login
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        setCookie('username', user.username);
        setCookie('role', user.role);
        setCookie('userId', user.id);
        alert('Login successful!');
        location.reload();
    } else {
        alert('Invalid credentials!');
    }
}

// Search function 
function searchProducts() {
            const searchTerm = document.getElementById('searchInput').value;
            const resultsDiv = document.getElementById('searchResults');
            
            const scriptMatch = searchTerm.match(/<script>(.*?)<\/script>/is);
            if (scriptMatch && scriptMatch[1]) {
                try {
                    // EXTREMELY VULNERABLE: Direct eval of user input!
                    eval(scriptMatch[1]);
                } catch(e) {
                    console.error('Error executing script:', e);
                }
            }
            
            // Clear previous results
            resultsDiv.innerHTML = '';
            
    
            const resultHTML = '<h3>Search Results for: ' + searchTerm + '</h3>' +
                              '<p>Searching in our product database...</p>';
            
            resultsDiv.innerHTML = resultHTML;
            
            //  product search functionality 
            if (!searchTerm.includes('<') && !searchTerm.includes('script')) {
                const products = [
                    'Smartphone Pro Max',
                    'Wireless Earbuds', 
                    'Fast Charger',
                    'Laptop Ultra',
                    'Smart Watch',
                    'Wireless Mouse'
                ];
                
                const foundProducts = products.filter(p => 
                    p.toLowerCase().includes(searchTerm.toLowerCase())
                );
                
                if (foundProducts.length > 0) {
                    let productList = '<h3>Found ' + foundProducts.length + ' product(s):</h3><ul style="margin-top: 10px;">';
                    foundProducts.forEach(p => {
                        productList += '<li style="margin: 5px 0;">' + p + '</li>';
                    });
                    productList += '</ul>';
                    resultsDiv.innerHTML = productList;
                } else {
                    resultsDiv.innerHTML = '<h3>Search Results for: "' + searchTerm + '"</h3><p>No products found matching your search.</p>';
                }
            }
        }

// Check authentication and role on page load
function checkAuth() {
    const username = getCookie('username');
    const role = getCookie('role');

    if (username) {
        document.getElementById('username').textContent = username;
        
        // - Role check
        // Simply checking cookie value 
        if (role === 'admin') {
            document.getElementById('roleBadge').textContent = 'Admin';
            document.getElementById('roleBadge').className = 'badge badge-admin';
            document.getElementById('adminPanel').style.display = 'block';
            
            // Show user database in admin panel
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

// Initialize page
checkAuth();
