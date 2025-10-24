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
function generateSignature(data) {
    const SECRET_KEY = 'my-super-secret-key-12345'; 
    return simpleHash(data + SECRET_KEY);
}

function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString(36);
}
function isValidUsername(username) {
    const regex = /^[a-zA-Z0-9_]{3,20}$/;
    return regex.test(username);
}

function isValidPassword(password) {
    const regex = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{3,50}$/;
    return regex.test(password);
}

// This simulates an SQL query
function login() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!isValidUsername(username)) {
        alert('Invalid username! Only letters, numbers, and underscores allowed.');
        return;
    }
    
    if (!isValidPassword(password)) {
        alert('Invalid password format!');
        return;
    }
 
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        setCookie('username', user.username);
        setCookie('role', user.role);
        setCookie('userId', user.id);
        
        const signature = generateSignature(user.username + user.role);
        setCookie('signature', signature);
        
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
    
    // Sanitize input - remove dangerous HTML characters
    const sanitizedTerm = sanitizeInput(searchTerm);
    
    // Clear results safely
    resultsDiv.innerHTML = '';
    
    //  Use createElement() and textContent instead of innerHTML
    // textContent treats everything as plain text, not HTML code
    const heading = document.createElement('h3');
    heading.textContent = 'Search Results for: ' + sanitizedTerm; // Safe!
    
    const description = document.createElement('p');
    description.textContent = 'Searching in our product database...';
    
    resultsDiv.appendChild(heading);
    resultsDiv.appendChild(description);
    
    // Product search functionality
    const products = [
        'Smartphone Pro Max',
        'Wireless Earbuds', 
        'Fast Charger',
        'Laptop Ultra',
        'Smart Watch',
        'Wireless Mouse'
    ];
    
    const foundProducts = products.filter(p => 
        p.toLowerCase().includes(sanitizedTerm.toLowerCase())
    );
    
    if (foundProducts.length > 0) {
        resultsDiv.innerHTML = '';
        
        const resultHeading = document.createElement('h3');
        resultHeading.textContent = 'Found ' + foundProducts.length + ' product(s):';
        resultsDiv.appendChild(resultHeading);
        
        const list = document.createElement('ul');
        list.style.marginTop = '10px';
        
        foundProducts.forEach(product => {
            const item = document.createElement('li');
            item.textContent = product; // Safe - no HTML interpretation
            item.style.margin = '5px 0';
            list.appendChild(item);
        });
        
        resultsDiv.appendChild(list);
    } else if (sanitizedTerm) {
        const noResults = document.createElement('p');
        noResults.textContent = 'No products found matching "' + sanitizedTerm + '"';
        resultsDiv.appendChild(noResults);
    }
}

// Sanitization function
function sanitizeInput(input) {
    // Convert dangerous HTML characters to safe text
    return input.replace(/[<>\"'&]/g, function(match) {
        const escape = {
            '<': '&lt;',   // < becomes &lt; 
            '>': '&gt;',   // > becomes &gt;
            '"': '&quot;', // " becomes &quot;
            "'": '&#39;',  // ' becomes &#39;
            '&': '&amp;'   // & becomes &amp;
        };
        return escape[match];
    });
}

// Check authentication and role on page load
function checkAuth() {
    const username = getCookie('username');
    const role = getCookie('role');
    const signature = getCookie('signature'); // FIX #1: Get the signature

    if (username && role) {
        //Verify the signature before trusting the cookies
        const expectedSignature = generateSignature(username + role);
        
        if (signature !== expectedSignature) {
            alert('Security Alert: Cookie tampering detected!');
            logout();
            return;
        }
        
        // Only if signature is valid, proceed
        document.getElementById('username').textContent = username;
        
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
    document.cookie = "signature=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    location.reload();
}

// Initialize page
checkAuth();
