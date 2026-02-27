async function initEditProfile() {
    const user = Auth.getCurrentUser();
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    try {
        // Fetch full user details
        const userDetails = await apiCall(`/users/${user.id}/details`);

        // Populate form
        document.getElementById('fullName').value = userDetails.name || '';
        document.getElementById('email').value = userDetails.email || '';
        document.getElementById('mobile').value = userDetails.mobile || '';
        document.getElementById('address').value = userDetails.address || '';

        updateAvatarPreview(userDetails.name);

        // Add event listener for name change to update avatar preview
        document.getElementById('fullName').addEventListener('input', (e) => {
            updateAvatarPreview(e.target.value);
        });

    } catch (e) {
        console.error("Failed to load user details", e);
        alert("Error loading profile details.");
    }
}

function updateAvatarPreview(name) {
    const preview = document.getElementById('profileImagePreview');
    if (preview && name) {
        preview.innerText = name.charAt(0).toUpperCase();
    }
}

async function handleUpdateProfile(event) {
    event.preventDefault();
    const user = Auth.getCurrentUser();

    const saveBtn = document.getElementById('saveBtn');
    const originalBtnText = saveBtn.innerText;
    saveBtn.innerText = "Updating...";
    saveBtn.disabled = true;

    const formData = new FormData(event.target);
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        mobile: formData.get('mobile'),
        address: formData.get('address')
    };

    try {
        const response = await apiCall(`/users/${user.id}`, 'PUT', data);

        // Update local storage if name changed
        const currentUser = Auth.getCurrentUser();
        currentUser.name = response.name;
        localStorage.setItem('user', JSON.stringify(currentUser));

        alert("Profile updated successfully!");
        window.location.href = 'userprofile.html';
    } catch (e) {
        alert("Update failed: " + e.message);
    } finally {
        saveBtn.innerText = originalBtnText;
        saveBtn.disabled = false;
    }
}
