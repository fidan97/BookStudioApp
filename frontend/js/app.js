// Check if user info is present in localStorage, if not, redirect to the login page
const userInfo = JSON.parse(localStorage.getItem("userInfo"));

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

const welcomeUserTitle = document.querySelector(".welcome-user-title");

if (userInfo?.username) {
  welcomeUserTitle.innerHTML = userInfo.username;
}

if (!userInfo) {
  logoutBtn.style.display = "none";
} else {
  logoutBtn.style.display = "block";
}

// Store internet connection state
let isOffline;

const internetStatus = document.querySelector(".internet-status");

window.addEventListener("load", function (event) {
  detectInternet();
});
window.addEventListener("online", function (event) {
  detectInternet();
});
window.addEventListener("offline", function (event) {
  detectInternet();
});

function detectInternet() {
  if (!navigator.onLine) {
    isOffline = true;
    internetStatus.innerHTML = "Offline mode";
    internetStatus.style.color = "red";
  } else {
    isOffline = false;
    internetStatus.innerHTML = "Online mode";
    internetStatus.style.color = "green";
  }
}

// Store bookings list in this array. If no data in localStorage, initialize with an empty array
const localBookingList = JSON.parse(localStorage.getItem("bookingInfo")) || [];
const localSharedBookingList =
  JSON.parse(localStorage.getItem("sharedBookingInfo")) || [];
const localUsersData = JSON.parse(localStorage.getItem("usersData")) || [];

// DOMContentLoaded event listener: runs when the HTML document has been completely loaded and parsed
document.addEventListener("DOMContentLoaded", function () {
  // Update page translations based on user's language settings
  langModule.updatePageTranslations();

  // Data for rooms
  const roomsData = [
    {
      id: "room1",
      nameKey: "room1_name",
      descriptionKey: "room1_description",
    },
    {
      id: "room2",
      nameKey: "room2_name",
      descriptionKey: "room2_description",
    },
    {
      id: "room3",
      nameKey: "room3_name",
      descriptionKey: "room3_description",
    },
  ];

  // Get the list element to display rooms
  const roomsList = document.getElementById("rooms-list");
  // Get the room template
  const roomTemplate = document.getElementById("room-template").content;

  // Loop through each room data and create elements to display room information
  roomsData.forEach((roomData) => {
    const roomElement = roomTemplate.cloneNode(true);

    // Set attributes for translation
    roomElement
      .querySelector(".room-name-btn")
      .setAttribute("data-translate", roomData.nameKey);
    roomElement
      .querySelector(".room-description")
      .setAttribute("data-translate", roomData.descriptionKey);
    roomElement
      .querySelector(".form")
      .setAttribute("data-room-id", roomData.id);

    // Toggle room content visibility on room name button click
    const roomNameBtn = roomElement.querySelector(".room-name-btn");
    roomNameBtn.setAttribute("data-translate", roomData.nameKey);
    roomNameBtn.addEventListener("click", () => {
      const roomContent = roomNameBtn.nextElementSibling;

      if (roomContent.classList.contains("hidden")) {
        roomContent.classList.add("visible");
        roomContent.classList.remove("hidden");
      } else {
        roomContent.classList.add("hidden");
        roomContent.classList.remove("visible");
      }

      // Update page translations after toggling content visibility
      langModule.updatePageTranslations();
    });

    // Append each room element to the roomsList
    roomsList.appendChild(roomElement);
  });

  // Booking a Room

  // Get all room content elements
  const roomContents = document.querySelectorAll(".room-content");

  // Disable past date in date inputs for booking
  const today = new Date().toISOString().slice(0, 16);
  document
    .getElementsByName("startTime")
    .forEach((element) => (element.min = today));
  document
    .getElementsByName("endTime")
    .forEach((element) => (element.min = today));

  // Add event listener to each room form for booking submission
  document.querySelectorAll(".form").forEach(function (form) {
    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      // Get the room ID for the booking
      const roomId = form.getAttribute("data-room-id");
      const bookingStartTime = form.parentElement.querySelector(
        ".booking-start-time"
      ).value;
      const bookingEndTime =
        form.parentElement.querySelector(".booking-end-time").value;
      let errorMessage = form.parentElement.querySelector(".error-message");

      // Clear previous error message
      if (errorMessage.length) {
        errorMessage.innerHTML = "";
      }

      // If start time and end time not selected, return without booking
      if (!bookingStartTime && !bookingEndTime) return;

      // If start time and end time are equal, return with an error message
      if (new Date(bookingEndTime) - new Date(bookingStartTime) <= 0)
        return (errorMessage.innerHTML = "Please select different end time!");

      // Map room IDs to room names
      const roomMap = {
        room1: "photo studio",
        room2: "video studio",
        room3: "sound studio",
      };

      if (isOffline || !userInfo) {
        return (window.location.href = "/login.html");
      }

      try {
        // Send booking data to the server via a POST request
        const response = await fetch(`${baseUrl}/bookings`, {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            userId: userInfo?.id,
            room: roomMap[roomId],
            startTime: bookingStartTime,
            endTime: bookingEndTime,
          }),
        });

        // Parse the response data
        const data = await response.json();

        // Hide room content after successful booking
        roomContents.forEach((roomContent) => {
          roomContent.classList.add("hidden");
          roomContent.classList.remove("visible");
        });

        // Reset the form after successful booking
        e.target.reset();

        // Call the getBookings function to fetch updated bookings
        getBookings();

        // If there's an error in the server response, display it as an error message
        if (data.error) {
          return (errorMessage.innerHTML = data?.error);
        }
      } catch (error) {
        console.log(error);
        // If an error occurred during the fetch operation, display the error message
        if (error instanceof Error) {
          if (error.message === "Failed to fetch") {
            return (window.location.href = "/login.html");
          }
          errorMessage.innerHTML = error.message;
        }
      }
    });
  });

  // Update page translations after populating rooms and booking form
  langModule.updatePageTranslations();
});

// Function to get bookings details
const bookingContainer = document.querySelector(".bookings-container");
const bookingsWrapper = document.querySelector(".bookings-container-wrapper");

async function getBookings() {
  try {
    // Fetch bookings data from the server based on the user's ID
    const response = await fetch(`${baseUrl}/bookings/${userInfo?.id}`, {
      method: "GET",
    });

    // Parse the response data
    const data = await response.json();

    // Display the booking details
    showDetails(data);

    if (!data.error) {
      // Store the bookings data in localStorage
      localStorage.setItem("bookingInfo", JSON.stringify(data));
    }
  } catch (error) {
    console.log(error);
    // If an error occurred during the fetch operation, handle it
    if (error instanceof Error) {
      // If the error message is "Failed to fetch", set the server connection status to false
      if (error.message === "Failed to fetch") {
        // If there are bookings in the local storage, display them
        if (localBookingList.length >= 1) {
          showDetails(localBookingList);
        }
      }
    }
  }
}

// Fetch the bookings data on page load

if (!userInfo) {
  bookingsWrapper.style.display = "none";
} else {
  bookingsWrapper.style.display = "block";
  getBookings();
}

// Function to display booking details in the table
function showDetails(data) {
  bookingContainer.innerHTML = "";
  bookingContainer.classList.remove("error-message");

  // If there are no bookings, display an error message
  if (!data.length) {
    bookingContainer.classList.add("error-message");
    return (bookingContainer.innerHTML = "No booking found!");
  }

  // Create a table to display the booking details
  const table = document.createElement("table");
  table.classList.add("table");

  // Table header HTML
  const tableHeadHtml = `
    <tr>
      <th data-translate='booking_id'>Booking Id</th>
      <th data-translate='room' >Room</th>
      <th data-translate='start_time'>Start Time</th>
      <th data-translate='end_time'>End Time</th>
    </tr>`;

  // Loop through each booking data and create rows for the table
  data.forEach((item, index) => {
    // Format start and end time to a readable format
    const startTime = new Date(item.start_time).toLocaleString("en-US", {
      timeStyle: "medium",
      dateStyle: "long",
    });
    const endTime = new Date(item.end_time).toLocaleString("en-US", {
      timeStyle: "medium",
      dateStyle: "long",
    });

    // Create the row HTML for each booking
    const htmlData = `
    <tr>
      <td>${item.id}</td>
      <td class='booking-room'>${item.room}</td>
      <td>${startTime}</td>
      <td>${endTime}</td>
      <td>
        <button data-translate='edit' class='table-button edit-button'>
          Edit
        </button>
      </td>
      <td>
        <button data-translate='delete' class='table-button delete-button'>
          Delete
        </button>
      </td>
      <td>
        <button data-translate='share' class='table-button share-button'>
          Share
        </button>
      </td>
    </tr>`;

    // Insert the row HTML into the table
    table.insertAdjacentHTML("afterbegin", htmlData);
    bookingContainer.appendChild(table);

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

    // Disable edit, delete, and share buttons if the server is not connected
    // const tableButton = document.querySelectorAll(".table-button");
    // tableButton.forEach((element) => {
    //   if (isOffline) {
    //     return (window.location.href = "/login.html");
    //   }
    // });

    // Handle delete bookings onclick
    const deleteBtn = document.querySelector(".delete-button");
    deleteBtn.addEventListener("click", async () => {
      if (isOffline) {
        return (window.location.href = "/login.html");
      }

      // Send a DELETE request to the server to delete the booking
      try {
        const response = await fetch(`${baseUrl}/bookings/${item.id}`, {
          method: "DELETE",
        });
        const data = await response.json();
        // console.log(data);
        // Fetch updated bookings after deletion
        getBookings();
        getSharedBookings();
      } catch (error) {
        console.log(error);
      }
    });
    // Edit booking info
    const editBtn = document.querySelector(".edit-button");
    editBtn.addEventListener("click", async () => {
      if (isOffline) {
        return (window.location.href = "/login.html");
      }
      showEditModel(item);
      document.body.style.overflow = "hidden";
    });

    // share booking info
    const shareBtn = document.querySelector(".share-button");
    shareBtn.addEventListener("click", async () => {
      if (isOffline) {
        return (window.location.href = "/login.html");
      }
      showShareModel(item);
      document.body.style.overflow = "hidden";
    });
  });

  // Insert the table header into the table
  table.insertAdjacentHTML("afterbegin", tableHeadHtml);
  bookingContainer.appendChild(table);

  // Update page translations
  langModule.updatePageTranslations();
}

function showEditModel(item) {
  // Create a container to edit the booking details
  const model = document.createElement("div");
  model.classList.add("model");

  const modelHtml = `
   <div class='model-wrapper'>
   <h4 data-translate='edit_model_title'>Update start and end time</h4>
   <button type='button' class='close-btn'>X</button>
   <h4 class='model-room-title' >${item.room}</h4>
   <div class='model-booking-id-wrapper'>
   <p data-translate='booking_id'>Booking id:- </p>
   <p class='model-booking-id'>:- ${item.id}</p>
   </div>
   <form class="model-form">
   <input
     type="datetime-local"
     placeholder="Starting Date & Time"
     class="model-start-time"
     name= startTime
     title="Start Time"
     aria-placeholder="select startTime time"
     required
   />
   <span>-</span>
   <input
     type="datetime-local"
     placeholder="Ending Date & Time"
     class="model-end-time"
     name=endTime
     aria-placeholder="select startTime time"
     title="End Time"
     required
   />
   <button
     type="submit"
     data-translate="update"
     class="book-now-btn"
   >
     Update
   </button>
   <p class="model-error-message"></p>
 </form>

   </div>
   `;

  // Insert the model HTML into the booking container
  model.insertAdjacentHTML("afterbegin", modelHtml);
  bookingContainer.appendChild(model);

  const modelRoom = document.querySelector(".model-room-title");
  if (modelRoom.innerHTML === "photo studio") {
    modelRoom.setAttribute("data-translate", "room1_name");
  } else if (modelRoom.innerHTML === "video studio") {
    modelRoom.setAttribute("data-translate", "room2_name");
  } else if (modelRoom.innerHTML === "sound studio") {
    modelRoom.setAttribute("data-translate", "room3_name");
  }

  // close button click
  const closeBtn = document.querySelector(".close-btn");
  closeBtn.addEventListener("click", () => {
    bookingContainer.removeChild(model);
    document.body.style.overflow = "auto";
  });

  // Edit booking on server

  const editForm = document.querySelector(".model-form");
  // Disable past date in date inputs for booking
  const today = new Date().toISOString().slice(0, 16);
  document
    .getElementsByName("startTime")
    .forEach((element) => (element.min = today));
  document
    .getElementsByName("endTime")
    .forEach((element) => (element.min = today));

  editForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const editEndTime = document.querySelector(".model-end-time").value;
    const editStartTime = document.querySelector(".model-start-time").value;
    let errorMessage = document.querySelector(".model-error-message");

    // Clear previous error message
    if (errorMessage.innerHTML.length) {
      errorMessage.innerHTML = "";
    }

    try {
      // If start time and end time are equal, return with an error message
      if (new Date(editEndTime) - new Date(editStartTime) <= 0)
        return (
          errorMessage.classList.add("error-message"),
          (errorMessage.innerHTML = "Please select different end time!")
        );

      // Send booking data to the server via a PUT request
      const response = await fetch(`${baseUrl}/bookings/${item.id}`, {
        method: "PUT",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          room: item.room,
          startTime: editStartTime,
          endTime: editEndTime,
        }),
      });

      // Parse the response data
      const data = await response.json();
      // console.log(data);
      // Reset the form after successful booking
      e.target.reset();

      // Call the getBookings function to fetch updated bookings
      getBookings();
      // auto body overflow after update
      document.body.style.overflow = "auto";
      // Hide edit model after successful update
      bookingContainer.removeChild(model);
      // If there's an error in the server response, display it as an error message
      if (data.error) {
        return (errorMessage.innerHTML = data?.error);
      }
    } catch (error) {
      console.log(error);
      // If an error occurred during the fetch operation, display the error message
      if (error instanceof Error) {
        errorMessage.innerHTML = error.message;
      }
    }
  });

  // Update page translations
  langModule.updatePageTranslations();
}
async function showShareModel(item) {
  // get all users details
  const response = await fetch(`${baseUrl}/users`, {
    method: "GET",
  });
  // Parse the response data
  const usersData = await response.json();

  // Create a container to share the booking details
  const model = document.createElement("div");
  model.classList.add("model");

  const modelHtml = `
   <div class='model-wrapper'>
   <h4 data-translate='share_model_title'>Share booking with other</h4>
   <button type='button' class='close-btn'>X</button>
   <h4 class='model-room-title' >${item.room}</h4>
   <div class='model-booking-id-wrapper'>
   <p data-translate='booking_id'>Booking id:- </p>
   <p class='model-booking-id'>:- ${item.id}</p>
   </div>
   <form class="share-form model-form">
 
   <button
     type="submit"
     class="book-now-btn"
     data-translate='share'
   >
     Share
   </button>
   <p class="model-error-message"></p>
 </form>

   </div>
   `;

  // Insert the model HTML into the booking container
  model.insertAdjacentHTML("afterbegin", modelHtml);
  bookingContainer.appendChild(model);

  const modelRoom = document.querySelector(".model-room-title");
  if (modelRoom.innerHTML === "photo studio") {
    modelRoom.setAttribute("data-translate", "room1_name");
  } else if (modelRoom.innerHTML === "video studio") {
    modelRoom.setAttribute("data-translate", "room2_name");
  } else if (modelRoom.innerHTML === "sound studio") {
    modelRoom.setAttribute("data-translate", "room3_name");
  }

  // close button click
  const closeBtn = document.querySelector(".close-btn");
  closeBtn.addEventListener("click", () => {
    bookingContainer.removeChild(model);
    document.body.style.overflow = "auto";
  });

  // share booking on server

  const shareForm = document.querySelector(".share-form");
  const select = document.createElement("select");
  select.classList.add("user-selection");
  // remove current user from selection options
  const filterUser = usersData.filter((user) => user.id !== userInfo?.id);
  filterUser.forEach((users) => {
    const selectionHtml = `
    <option value=${users.id}>${users.username}</option>
    `;

    // Insert the selection HTML into the booking container
    select.insertAdjacentHTML("afterbegin", selectionHtml);
    shareForm.insertAdjacentElement("afterbegin", select);
  });

  shareForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const selectedValue = document.querySelector(".user-selection").value;
    let errorMessage = document.querySelector(".model-error-message");

    // Clear previous error message
    if (errorMessage.innerHTML.length) {
      errorMessage.innerHTML = "";
    }

    try {
      // Send share data to the server via a Post request
      const response = await fetch(`${baseUrl}/bookings/${item.id}/share`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          senderUserId: userInfo?.id,
          receiverUserId: selectedValue,
        }),
      });

      // Parse the response data
      const data = await response.json();
      // console.log(data);
      // Reset the form after successful booking
      e.target.reset();
      if (data.error) {
        return (
          errorMessage.classList.add("error-message"),
          (errorMessage.innerHTML = data?.error)
        );
      }
      // Call the getSharedBookings function to fetch updated share bookings
      getSharedBookings();
      // auto body overflow after update
      document.body.style.overflow = "auto";
      // Hide edit model after successful update
      bookingContainer.removeChild(model);
      // If there's an error in the server response, display it as an error message
    } catch (error) {
      console.log(error);
      // If an error occurred during the fetch operation, display the error message
      if (error instanceof Error) {
        errorMessage.innerHTML = error.message;
      }
    }
  });

  // Update page translations
  langModule.updatePageTranslations();
}

/** Shared booking list */

// Function to get shared bookings details
const shareBookingContainer = document.querySelector(
  ".shared-bookings-container"
);
const shareBookingsWrapper = document.querySelector(
  ".shared-bookings-container-wrapper"
);

async function getSharedBookings() {
  try {
    // Fetch bookings data from the server based on the user's ID
    const response = await fetch(`${baseUrl}/shared-bookings/${userInfo?.id}`, {
      method: "GET",
    });

    // Parse the response data
    const data = await response.json();

    // Display the booking details
    showSahredDetails(data);

    if (!data.error) {
      // Store the bookings data in localStorage
      localStorage.setItem("sharedBookingInfo", JSON.stringify(data));
    }
  } catch (error) {
    console.log(error);
    // If an error occurred during the fetch operation, handle it
    if (error instanceof Error) {
      // If the error message is "Failed to fetch", set the server connection status to false
      if (error.message === "Failed to fetch") {
        // If there are bookings in the local storage, display them
        if (localSharedBookingList.length >= 1) {
          showSahredDetails(localSharedBookingList);
        }
      }
    }
  }
}

// Fetch the bookings data on page load

if (!userInfo) {
  shareBookingsWrapper.style.display = "none";
} else {
  shareBookingsWrapper.style.display = "block";
  getSharedBookings();
}

// Function to display booking details in the table
async function showSahredDetails(data) {
  shareBookingContainer.innerHTML = "";
  shareBookingContainer.classList.remove("error-message");
  let usersData = [];

  // if server connected then run this users api
  if (!isOffline) {
    // get all users details
    const response = await fetch(`${baseUrl}/users`, {
      method: "GET",
    });

    // Parse the response data
    usersData = await response.json();
    localStorage.setItem("usersData", JSON.stringify(usersData));
  }
  // If there are no bookings, display an error message
  if (!data.length) {
    shareBookingContainer.classList.add("error-message");
    return (shareBookingContainer.innerHTML = "No booking found!");
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
    </tr>`;

  // Loop through each booking data and create rows for the table
  data.forEach((item, index) => {
    //  find username with receiver user id
    const username = !isOffline
      ? usersData.find((user) => user.id === item.receiver_user_id)?.username
      : localUsersData.find((user) => user.id === item.receiver_user_id)
          ?.username;

    // Create the row HTML for each booking
    const htmlData = `
    <tr>
      <td>${item.booking_id}</td>
      <td>${item.receiver_user_id}</td>
      <td>${username}</td>
      <td>
        <button data-translate='delete' class='table-button delete-button share-delete-button'>
          Delete
        </button>
      </td>
    </tr>`;

    // Insert the row HTML into the table
    table.insertAdjacentHTML("afterbegin", htmlData);
    shareBookingContainer.appendChild(table);

    // Disable edit, delete, and share buttons if the server is not connected
    const tableButton = document.querySelectorAll(".table-button");
    // disabled button in offline mode
    // tableButton.forEach((element) => {
    //   if (isOffline) {
    //     return (window.location.href = "/login.html");
    //   }
    // });

    // Handle delete bookings onclick
    const shareDeleteBtn = document.querySelector(".share-delete-button");
    shareDeleteBtn.addEventListener("click", async () => {
      if (isOffline) {
        return (window.location.href = "/login.html");
      }

      // Send a DELETE request to the server to delete the booking
      try {
        const response = await fetch(
          `${baseUrl}/shared-bookings/${item.booking_id}/${item.receiver_user_id}`,
          { method: "DELETE" }
        );
        const data = await response.json();
        // console.log(data);
        // Fetch updated bookings after deletion
        getSharedBookings();
      } catch (error) {
        console.log(error);
      }
    });
  });

  // Insert the table header into the table
  table.insertAdjacentHTML("afterbegin", tableHeadHtml);
  shareBookingContainer.appendChild(table);

  // Update page translations
  langModule.updatePageTranslations();
}
