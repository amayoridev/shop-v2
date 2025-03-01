document.addEventListener("DOMContentLoaded", () => {
  const cart = [];
  const cartButton = document.getElementById("cart-link");
  const cartCount = document.getElementById("cart-count");
  const popupModal = document.getElementById("popup-modal");
  const popupBody = document.getElementById("popup-body");
  const closePopup = document.getElementById("close-popup");

  // Get references to category containers
  const drinksContainer = document.getElementById("drinks-container");
  const foodContainer = document.getElementById("food-container");
  const dessertContainer = document.getElementById("dessert-container");
  const otherContainer = document.getElementById("other-container");

  // Show Cart in Popup
  function showCartPopup() {
    if (cart.length === 0) {
      popupBody.innerHTML = `<p>Your cart is empty!</p>`;
    } else {
      let cartHTML = `<h2>Your Cart</h2><ul>`;
      cart.forEach(
        (item) =>
          (cartHTML += `<li>${item.name} - VND${item.price.toFixed(2)} x ${item.quantity}</li>`)
      );
      cartHTML += `</ul><p>Total Price: VND${calculateTotalPrice().toFixed(2)}</p>
      <button id="checkout-button">Checkout</button>`;
      popupBody.innerHTML = cartHTML;

      // Attach checkout logic to the button
      document.getElementById("checkout-button").addEventListener("click", showCheckoutConfirmation);
    }
    popupModal.classList.remove("hidden");
  }

  function showCheckoutConfirmation() {
    const totalPrice = calculateTotalPrice().toFixed(2);
    popupBody.innerHTML = `
      <h2>Confirm Your Order</h2>
      <p>Total: VND${totalPrice}</p>
      <p>Please confirm your order!</p>
      <p>Note (optional): <input type="text" id="note-input" placeholder="Add a note..."></p>
      <button id="confirm-order">Confirm</button>
      <button id="cancel-order">Cancel</button>
    `;
  
    // Attach event listeners after the popup content is rendered
    const noteInput = document.getElementById("note-input"); // Make sure the input exists
    document.getElementById("confirm-order").addEventListener("click", async () => {
      const note = noteInput ? noteInput.value : ''; // Get the note if the input exists
      await checkout(note); // Pass the note to the checkout function
      popupModal.classList.add("hidden"); // Hide popup
    });
    document.getElementById("cancel-order").addEventListener("click", () => {
      popupModal.classList.add("hidden");
    });
  }
  

  // Calculate Total Price
  function calculateTotalPrice() {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  }

  // Add item to cart
  function addToCart(event) {
    const id = event.target.getAttribute("data-id");
    const name = event.target.getAttribute("data-name");
    const price = parseFloat(event.target.getAttribute("data-price"));
    
    console.log(`Adding to cart - ID: ${id}, Name: ${name}, Price: ${price}`);

    // If the name is undefined, it may indicate an issue with the data, so prevent adding to the cart
    if (!name) {
      console.error("Name is undefined for item with ID:", id);
      return;
    }

    // Find the item in the cart or add it as a new item
    const existingItem = cart.find((item) => item.id === id);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ id, name, price, quantity: 1 });
    }

    // Update cart display
    renderCart();
  }

  // Render Cart items
  function renderCart() {
    const cartItemsList = document.getElementById("cart-items");
    const cartCount = document.getElementById("cart-count");
    cartItemsList.innerHTML = "";

    let totalPrice = 0;

    cart.forEach((item) => {
      const cartItem = document.createElement("li");
      cartItem.textContent = `${item.name} - VND${item.price.toFixed(2)} x ${item.quantity}`;
      cartItemsList.appendChild(cartItem);

      // Accumulate total price
      totalPrice += item.price * item.quantity;
    });

    document.getElementById("total-price").textContent = totalPrice.toFixed(2);
    cartCount.textContent = cart.length;
  }

  // Checkout Logic
// Checkout Logic
async function checkout(note) {
  try {

    // Prepare the order data to match the Mongoose model
    const orderData = {
      items: cart.map(item => ({
        id: item.id,          // Ensure we include the 'id' of the item
        name: item.name,      // Item name
        price: item.price,    // Item price
        quantity: item.quantity // Item quantity
      })),
      note: note,         // Add the note
      payment: false,     // Set payment to false
      status: "pending",  // Set status to "pending"
      date: new Date()    // Current date
    };

    console.log("Order data to be sent:", orderData); // Log the order data

    // Send the order data to the backend
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData), // Send the prepared orderData to the backend
    });

    // Check if the response is successful
    if (response.ok) {
      alert("Order placed successfully!");
      cart.length = 0; // Clear cart
      cartCount.textContent = "0";
    } else {
      alert("Error placing order.");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}



  // Event Listeners
  cartButton.addEventListener("click", showCartPopup);

  // Close Popup
  closePopup.addEventListener("click", () => {
    popupModal.classList.add("hidden");
  });

  // Example of adding to the cart (attach to menu items)
  // For demonstration, manually add an item to the cart
  cartCount.textContent = cart.length.toString();

  async function fetchMenu() {
    try {
      const response = await fetch("/api/getMenu");
      if (!response.ok) throw new Error("Network response was not ok");

      const menuItems = await response.json();

      console.log("Menu items fetched:", menuItems); // Debug log

      renderMenu(menuItems);
    } catch (error) {
      console.error("Error fetching menu:", error);
    }
  }

  function renderMenu(menuItems) {
    drinksContainer.innerHTML = "";
    foodContainer.innerHTML = "";
    dessertContainer.innerHTML = "";
    otherContainer.innerHTML = "";

    menuItems.forEach((item) => {
      const menuDiv = document.createElement("div");
      menuDiv.className = "menu-item";
      menuDiv.innerHTML = `
        <img src="${item.img || "./img/logo.png"}" alt="${item.stockname}">
        <div class="info">
          <h3>${item.stockname}</h3>
          <p>Category: ${item.type}</p>
          <p>Price: VND${item.price}</p>
        </div>
        <button class="add-to-cart" data-id="${item._id}" data-name="${item.stockname}" data-price="${item.price}">Add to Cart</button>
      `;
      const container = getMenuContainer(item.type);
      container.appendChild(menuDiv);
    });

    // Attach event listener to Add to Cart buttons
    document.querySelectorAll(".add-to-cart").forEach((button) =>
      button.addEventListener("click", addToCart)
    );
  }

  // Helper to get container based on item type
  function getMenuContainer(type) {
    switch (type) {
      case "drink":
        return drinksContainer;
      case "food":
        return foodContainer;
      case "dessert":
        return dessertContainer;
      default:
        return otherContainer;
    }
  }

  // Fetch menu on page load
  fetchMenu();
});
