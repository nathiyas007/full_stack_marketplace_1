document.addEventListener('DOMContentLoaded', async () => {
    loadFAQ();
    setupAskForm();
});

async function loadFAQ() {
    try {
        const faqs = await apiCall('/qfa/faq');
        const container = document.getElementById('faq-list');

        if (faqs.length === 0) {
            container.innerHTML = '<p>No questions answered yet. Be the first to ask!</p>';
            return;
        }

        container.innerHTML = faqs.map(f => `
            <div class="faq-item">
                <h3>${f.question}</h3>
                <p>${f.answer}</p>
            </div>
        `).join('');
    } catch (error) {
        console.error("Error loading FAQs:", error);
    }
}

function setupAskForm() {
    const form = document.getElementById('askForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const user = Auth.getCurrentUser();
        if (!user) {
            alert("Please login to ask a question.");
            window.location.href = 'login.html';
            return;
        }

        const question = document.getElementById('userQuestion').value;

        try {
            await apiCall('/qfa/ask', 'POST', {
                user_id: user.id,
                question: question
            });
            alert("Your question has been submitted! Our admin will answer it soon.");
            form.reset();
        } catch (error) {
            alert("Error submitting question: " + error.message);
        }
    });
}
