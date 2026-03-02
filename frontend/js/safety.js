document.addEventListener('DOMContentLoaded', async () => {
    try {
        const tips = await apiCall('/safety/tips');
        const container = document.getElementById('safety-tips-container');

        if (tips.length === 0) {
            container.innerHTML = '<p>No safety tips available at the moment.</p>';
            return;
        }

        container.innerHTML = tips.map(tip => `
            <div class="about-card">
                <h3>${tip.title}</h3>
                <p>${tip.description}</p>
            </div>
        `).join('');
    } catch (error) {
        console.error("Error loading safety tips:", error);
    }
});
