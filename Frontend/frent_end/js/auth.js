async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    const user = await Auth.login(email, password);
    if (user) {
        if (user.role === 'admin') {
            window.location.href = 'admin.html';
        } else {
            window.location.href = '../../index.html';
        }
    }
}

async function handleSignup(event) {
    event.preventDefault();
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const mobile = document.getElementById('signupMobile').value;
    const address = document.getElementById('signupAddress').value;

    const success = await Auth.signup(name, email, password, mobile, address);
    if (success) {
        alert("Signup Successful! Please Login.");
        window.location.href = 'login.html';
    }
}
