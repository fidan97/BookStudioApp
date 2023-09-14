class LanguageModule {
  constructor(defaultLanguage) {
    this.defaultLanguage = defaultLanguage;
    this.languageResources = {
      en: {
        welcome: "Welcome to the Studio Booking",
        book_now: "Book Now",
        room1_name: "Photo Studio",
        room1_description:
          "A professional photo studio with lighting equipment.",
        room2_name: "Video Studio",
        room2_description:
          "A video studio with green screen and high-quality cameras.",
        room3_name: "Sound Studio",
        room3_description:
          "A professional Sound Studio with all studio instruments.",
        mybookings: "My Bookings",
        mysharebookings: "My Shared Bookings",
        booking_id: "Bookings Id",
        room: "room",
        start_time: "start time",
        end_time: "end time",
        edit: "Edit",
        delete: "delete",
        share: "share",
        user_id: "User Id",
        username: "Username",
        edit_model_title: "Update start and end time",
        update: "Update",
        share_model_title: "Share booking with other",
        share: "Share",
        welcome_title: "Welcome",
      },
      no: {
        welcome: "Velkommen til Studio booking",
        book_now: "Bestill nå",
        room1_name: "Fotostudio",
        room1_description: "Et profesjonelt fotostudio med belysningsutstyr.",
        room2_name: "Videostudio",
        room2_description:
          "Et videostudio med grønn skjerm og høykvalitetskameraer.",
        room3_name: "Lyd Studio",
        room3_description:
          "Et profesjonelt fotostudio med alle studio verktøy.",
        mybookings: "mine bestillinger",
        mysharebookings: "Mine delte bestillinger",
        booking_id: "Bestillings-ID",
        room: "rom",
        start_time: "starttid",
        end_time: "sluttid",
        edit: "redigere",
        delete: "slette",
        share: "dele",
        user_id: "Bruker-ID",
        username: "Brukernavn",
        edit_model_title: "Oppdater start- og sluttid",
        update: "Oppdater",
        share_model_title: "Del booking med andre",
        share: "Dele",
        welcome_title: "Velkommen",
      },
    };
  }

  setLanguage(language) {
    console.log("Setting language to", language); // Debugging
    this.defaultLanguage = language;
    this.updatePageTranslations();
  }

  getTranslation(key) {
    return this.languageResources[this.defaultLanguage][key];
  }

  updatePageTranslations() {
    console.log("Updating page translations"); // Debugging
    document.querySelectorAll("[data-translate]").forEach((element) => {
      const key = element.getAttribute("data-translate");
      const translation = this.getTranslation(key);
      element.textContent = translation;
    });
  }
}

// Initialize the language module and set the default language
const langModule = new LanguageModule("en");

// Add an event listener to the language selector
const languageSelector = document.getElementById("language-selector");
languageSelector.addEventListener("change", (event) => {
  langModule.setLanguage(event.target.value);
});
langModule.updatePageTranslations();
