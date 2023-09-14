// Check if user info is present in localStorage, if not, redirect to the login page
const userInfo = JSON.parse(localStorage.getItem("userInfo"));
if (!userInfo) {
  window.location.replace("/login.html");
}

// backend base url
const baseUrl = "https://booking-backend-mhb1.onrender.com";

// Logout button function
const logoutBtn = document.getElementById("logout-btn");
logoutBtn.addEventListener("click", () => {
  // Remove user info from localStorage
  localStorage.removeItem("userInfo");
  // Redirect to the login page after logout
  window.location.href = "/login.html";
});

// DOMContentLoaded event listener: runs when the HTML document has been completely loaded and parsed
document.addEventListener("DOMContentLoaded", function () {
  // Update page translations based on user's language settings
  langModule.updatePageTranslations();
});

// Function to get bookings details
const adminContainer = document.querySelector(".admin-container");
const welcomeUserTitle = document.querySelector(".welcome-user-title");

if (userInfo?.username) {
  welcomeUserTitle.innerHTML = userInfo.username;
}

async function getAllBookings() {
  try {
    // Fetch all bookings data from the server based for admin user
    const response = await fetch(`${baseUrl}/users/admin`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ role: userInfo?.role }),
    });

    // Parse the response data
    const data = await response.json();
    // console.log(data);
    if (data?.error) {
      return (
        (adminContainer.innerHTML = data.error),
        adminContainer.classList.add("error-message")
      );
    }
    // Display the booking details
    showDetails(data);
  } catch (error) {
    console.log(error);
    // If an error occurred during the fetch operation, handle it
    if (error instanceof Error) {
      // If the error message is "Failed to fetch", set the server connection status to false
      if (error.message === "Failed to fetch") {
        adminContainer.innerHTML = error.message;
        adminContainer.classList.add("error-message");
      }
    }
  }
}

// Fetch the bookings data on page load
getAllBookings();

// Function to display booking details in the table
async function showDetails(data) {
  adminContainer.innerHTML = "";
  adminContainer.classList.remove("error-message");
  // console.log(data);
  // get all users details
  const response = await fetch(`${baseUrl}/users`, {
    method: "GET",
  });
  // Parse the response data
  usersData = await response.json();

  // If there are no bookings, display an error message
  if (!data.bookingInfo.length) {
    adminContainer.classList.add("error-message");
    return (adminContainer.innerHTML = "No booking found!");
  }

  // Create a table to display the booking details
  const table = document.createElement("table");
  table.classList.add("table");

  // Table header HTML
  const tableHeadHtml = `
    <tr>
      <th data-translate='booking_id'>Booking Id</th>
      <th data-translate='user_id' >User Id</th>
      <th data-translate='username'>Username</th>
      <th data-translate='room' >Room</th>
      <th data-translate='start_time'>Start Time</th>
      <th data-translate='end_time'>End Time</th>
    </tr>`;

  // Loop through each booking data and create rows for the table
  data.bookingInfo.forEach((item, index) => {
    // Format start and end time to a readable format
    const startTime = new Date(item.start_time).toLocaleString("en-US", {
      timeStyle: "medium",
      dateStyle: "long",
    });
    const endTime = new Date(item.end_time).toLocaleString("en-US", {
      timeStyle: "medium",
      dateStyle: "long",
    });

    //  find username with receiver user id
    const username = usersData.find(
      (user) => user.id === item.user_id
    )?.username;
    // Create the row HTML for each booking
    const htmlData = `
    <tr>
      <td>${item.id}</td>
      <td>${item.user_id}</td>
      <td>${username}</td>
      <td class='booking-room'>${item.room}</td>
      <td>${startTime}</td>
      <td>${endTime}</td>
      <td>
        <button data-translate='delete' class='table-button delete-button'>
          Delete
        </button>
      </td>
      
    </tr>`;

    // Insert the row HTML into the table
    table.insertAdjacentHTML("afterbegin", htmlData);
    adminContainer.appendChild(table);

    // set data-translate attribute
    const bookingRooms = document.querySelectorAll(".booking-room");
    bookingRooms.forEach((bookingRoom) => {
      if (bookingRoom.innerHTML === "photo studio") {
        bookingRoom.setAttribute("data-translate", "room1_name");
      } else if (bookingRoom.innerHTML === "video studio") {
        bookingRoom.setAttribute("data-translate", "room2_name");
      } else if (bookingRoom.innerHTML === "sound studio") {
        bookingRoom.setAttribute("data-translate", "room3_name");
      }
    });

    // Handle delete bookings onclick
    const deleteBtn = document.querySelector(".delete-button");
    deleteBtn.addEventListener("click", async () => {
      // Send a DELETE request to the server to delete the booking
      try {
        const response = await fetch(`${baseUrl}/bookings/${item.id}`, {
          method: "DELETE",
        });
        const data = await response.json();
        // console.log(data);
        // Fetch updated bookings after deletion
        getAllBookings();
      } catch (error) {
        console.log(error);
      }
    });
  });

  // Insert the table header into the table
  table.insertAdjacentHTML("afterbegin", tableHeadHtml);
  adminContainer.appendChild(table);

  // Update page translations
  langModule.updatePageTranslations();
}
