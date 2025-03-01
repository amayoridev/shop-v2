async function fetchOrders() {
  try {
    const response = await fetch('/api/show-orders');
    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }
    const orders = await response.json();

    // Sort orders with the most recent first
    orders.sort((a, b) => new Date(b.date) - new Date(a.date));

    const ordersContainer = document.getElementById('ordersContainer');
    ordersContainer.innerHTML = ''; // Clear any existing content

    orders.forEach(order => {
      const orderElement = document.createElement('div');
      orderElement.classList.add('order');

      const itemsList = order.items.map(item => 
        `<li>${item.name} (Quantity: ${item.quantity}, Price: ${item.price})</li>`
      ).join('');

      // Calculate total price
      const totalPrice = order.items.reduce((total, item) => 
        total + (item.price * item.quantity), 0
      );

      // Determine the color of the payment status
      const paymentColor = order.payment ? 'green' : 'red';

      // Determine the color of the order status
      const statusColor = order.status === 'done' ? 'green' : 'red';

      // Add the Done, Mark as Paid, and Delete buttons
      orderElement.innerHTML = `
        <h3><a href="/order/${order._id}">Order ID: ${order._id}</a></h3>
        <ul>${itemsList}</ul>
        <li>Table number: ${order.note}</li>
        <li>Payment: <span style="color: ${paymentColor};">${order.payment}</span></li>
        <li>Status: <span style="color: ${statusColor};">${order.status}</span></li>
        <p><strong>Total Price:</strong> ${totalPrice}</p>
        <button class="mark-paid-btn" data-id="${order._id}">Mark as Paid</button>
        <button class="finish-order-btn" data-id="${order._id}">Finish Order</button>
        <button class="delete-order-btn" data-id="${order._id}">Delete Order</button>
      `;
      console.log(order)
      ordersContainer.appendChild(orderElement);
    });

    // Attach event listeners to buttons
    document.querySelectorAll('.mark-paid-btn').forEach(button => {
      button.addEventListener('click', async function() {
        const orderId = this.getAttribute('data-id');
        try {
          const response = await fetch('/api/ordersAPI', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: orderId })
          });

          if (response.ok) {
            alert(`Order ID ${orderId} marked as paid.`);
            fetchOrders(); // Refresh the orders list after marking
          } else {
            alert('Failed to mark order as paid.');
          }
        } catch (error) {
          console.error('Error:', error);
          alert('An error occurred while marking the order as paid.');
        }
      });
    });

    document.querySelectorAll('.finish-order-btn').forEach(button => {
      button.addEventListener('click', async function() {
        const orderId = this.getAttribute('data-id');
        try {
          const response = await fetch('/api/finishAPI', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ _id: orderId })
          });

          if (response.ok) {
            alert(`Order ID ${orderId} marked as finished.`);
            fetchOrders(); // Refresh the orders list after marking
          } else {
            alert('Failed to mark order as finished.');
          }
        } catch (error) {
          console.error('Error:', error);
          alert('An error occurred while marking the order as finished.');
        }
      });
    });

    document.querySelectorAll('.delete-order-btn').forEach(button => {
      button.addEventListener('click', async function() {
        const orderId = this.getAttribute('data-id');
        const confirmDelete = confirm(`Are you sure you want to delete Order ID ${orderId}?`);
        if (!confirmDelete) return;

        try {
          const response = await fetch(`/api/orders/${orderId}`, {
            method: 'DELETE'
          });

          if (response.ok) {
            alert(`Order ID ${orderId} deleted successfully.`);
            fetchOrders(); // Refresh the orders list after deletion
          } else {
            alert('Failed to delete order.');
          }
        } catch (error) {
          console.error('Error:', error);
          alert('An error occurred while deleting the order.');
        }
      });
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

// Call fetchOrders when the page loads
document.addEventListener('DOMContentLoaded', () => {
  fetchOrders();
  setInterval(fetchOrders, 4000); // Auto-refresh every 4 seconds
});
