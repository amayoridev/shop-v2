document.addEventListener('DOMContentLoaded', () => {
    fetchUserData();
  
    async function fetchUserData() {
      try {
        const response = await fetch('/api/users'); // Replace with your actual API endpoint
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        const users = await response.json();
        populateTable(users);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    }
  
    function populateTable(users) {
      const tableBody = document.getElementById('userTable').getElementsByTagName('tbody')[0];
      tableBody.innerHTML = ''; // Clear existing content
  
      users.forEach(user => {
        const row = document.createElement('tr');
  
        row.innerHTML = `
          <td>${user.username}</td>
          <td>
            <select data-id="${user._id}">
              <option value="user" ${user.roles === 'user' ? 'selected' : ''}>User</option>
              <option value="saler" ${user.roles === 'saler' ? 'selected' : ''}>Saler</option>
              <option value="manager" ${user.roles === 'manager' ? 'selected' : ''}>Manager</option>
              <option value="administrator" ${user.roles === 'administrator' ? 'selected' : ''}>Administrator</option>
            </select>
          </td>
          <td>${new Date(user.createdTime).toLocaleString()}</td>
          <td>${user._id}</td>
        `;
  
        // Attach change event to the select element
        row.querySelector('select').addEventListener('change', async (event) => {
          const newRole = event.target.value;
          const userId = event.target.getAttribute('data-id');
  
          try {
            const response = await fetch('/api/userRolesUpdate', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ id: userId, role: newRole })
            });
  
            if (response.ok) {
              alert(`Role updated to ${newRole}`);
            } else {
              alert('Failed to update role');
            }
          } catch (error) {
            console.error('Error updating role:', error);
            alert('An error occurred while updating the role');
          }
        });
  
        tableBody.appendChild(row);
      });
    }
  });
  