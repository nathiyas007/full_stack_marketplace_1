document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('order_id');

    if (!orderId) {
        // Fallback or redirect if no order ID
        return;
    }

    try {
        const order = await apiCall(`/orders/${orderId}`);

        if (order) {
            if (document.getElementById('successProductName'))
                document.getElementById('successProductName').innerText = order.product_title;

            if (document.getElementById('successOrderId'))
                document.getElementById('successOrderId').innerText = `ORD-${order.id}`;

            if (document.getElementById('successPayment'))
                document.getElementById('successPayment').innerText = order.payment_method;

            if (document.getElementById('successDelivery'))
                document.getElementById('successDelivery').innerText = order.delivery_estimate;
        }
    } catch (e) {
        console.error("Failed to fetch order details", e);
        if (document.getElementById('successProductName'))
            document.getElementById('successProductName').innerText = "Error loading details";
    }
});
