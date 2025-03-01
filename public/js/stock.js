

document.addEventListener("DOMContentLoaded", () => {
  const stockTable = document
    .getElementById("stock-table")
    .getElementsByTagName("tbody")[0];

  const stockData = [];

  async function getMenu() {
    try {
      const response = await fetch("/api/getMenu");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const menu = await response.json();

      // Clear the existing data in stockData
      stockData.length = 0;

      // Populate the stockData array with the menu data
      menu.forEach((item) => {
        stockData.push(item);
      });

      console.log("Stock data:", stockData); // Debugging line to see the data

      // Render the stock data
      renderStockData();
    } catch (error) {
      console.error("Error fetching menu data:", error);
    }
  }

  function renderStockData() {
    stockTable.innerHTML = "";
    stockData.forEach((stock) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${stock.id}</td>
        <td>${stock.stockname}</td>
        <td>$${stock.price.toFixed(2)}</td>
        <td><button class="delete-btn" data-id="${
          stock.id
        }">Delete</button></td>
      `;
      stockTable.appendChild(row);
    });
  }

  async function addStock(event) {
    event.preventDefault(); // Prevent form from submitting and reloading the page

    const productId = document.getElementById("product-id").value;
    const productName = document.getElementById("product-name").value;
    const type = document.getElementById("type").value;
    const price = parseFloat(document.getElementById("product-price").value);
    const img = document.getElementById("img").value;

    if (!productId || !productName || !type || isNaN(price)) {
      console.error("All fields are required and must be valid.");
      return;
    }

    try {
      const response = await fetch("/api/addMenu", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: productId,
          stockname: productName,
          type,
          price,
          img,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add stock");
      }

      const result = await response.json();
      console.log("Stock added:", result);

      // Add new stock to the local stockData array and render it
      stockData.push({
        id: productId,
        stockname: productName,
        type,
        price,
        img,
      });
      renderStockData();

      // Clear form inputs
      document.getElementById("stock-form").reset();
    } catch (error) {
      console.error("Error adding stock:", error);
    }
  }

  async function deleteStock(event) {
    if (event.target.classList.contains("delete-btn")) {
      const productId = event.target.getAttribute("data-id");
      const index = stockData.findIndex((stock) => stock.id === productId);
      try {
        const response = await fetch("/api/deleteMenu", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            delID: productId,
          }),
        });
  
        if (!response.ok) {
          throw new Error("Failed to remove stock");
        }
  
        const result = await response.json();
  
      } catch (error) {
        console.error("Error deleting stock:", error);
      }
      if (index > -1) {
        stockData.splice(index, 1);
        renderStockData();
      }
    }
  }

  document.getElementById("stock-form").addEventListener("submit", addStock);
  stockTable.addEventListener("click", deleteStock);

  // Initial render
  getMenu();
});

// Select all buttons with the data-id attribute
const buttons = document.querySelectorAll('button[data-id]');

// Add a click event listener to each button

