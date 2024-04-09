require("dotenv").config();
const apiKey = process.env.GOOGLE_API_KEY;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

document.addEventListener("DOMContentLoaded", (event) => {
  document
    .getElementById("translate-btn")

    .addEventListener("click", function () {
      var translatedText = "";
      this.disabled = true;

      var baseURL = "https://v2.jokeapi.dev";
      var categories = ["Programming", "Misc", "Pun", "Spooky", "Christmas"];
      var params = [
        "blacklistFlags=nsfw,religious,racist,sexist",
        "idRange=0-100",
      ];

      var xhr = new XMLHttpRequest();
      xhr.open(
        "GET",
        baseURL + "/joke/" + categories.join(",") + "?" + params.join("&")
      );

      xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status < 300) {
          var randomJoke = JSON.parse(xhr.responseText);

          if (randomJoke.type == "single") {
            document.getElementById(
              "main-text-box"
            ).textContent = `> ${randomJoke.joke}`;
          } else {
            document.getElementById(
              "main-text-box"
            ).textContent = `> ${randomJoke.setup}`;
            setTimeout(() => {
              document.getElementById(
                "main-text-box"
              ).textContent += `\n\n> ${randomJoke.delivery}`;
            }, 3000);
          }
        } else if (xhr.readyState == 4) {
          alert(
            "Error while requesting joke.\n\nStatus code: " +
              xhr.status +
              "\nServer response: " +
              xhr.responseText
          );
        }
      };

      xhr.send();

      setTimeout(function () {
        fetch(
          "https://translation.googleapis.com/language/translate/v2?key=" +
            apiKey,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              q: document.getElementById("main-text-box").textContent,
              source: "en",
              target: "sv",
              format: "text",
            }),
          }
        )
          .then((response) => response.json())
          .then((data) => {
            // Observera att vi nu först navigerar till 'data' innan vi försöker åtkomma 'translations'
            const translationsArray = data.data.translations; // Dubbel 'data' baserat på strukturen du angav
            if (translationsArray && translationsArray.length > 0) {
              translatedText = translationsArray[0].translatedText;
              console.log(translatedText);
              document.getElementById(
                "main-text-box"
              ).textContent += `\n\n${translatedText}`;
              document.getElementById("main-text-box").innerHTML +=
                "<span>█</span><span id='audio'></span><br><br>";
            } else {
              console.log(
                "Inga översättningar hittades eller translations-arrayen är tom."
              );
            }
          })
          .catch((error) => console.error("Error:", error));
        document.getElementById("translate-btn").disabled = false;
      }, 3200);

      setTimeout(function () {
        fetch(
          "https://texttospeech.googleapis.com/v1/text:synthesize?key=" +
            apiKey,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              audioConfig: {
                audioEncoding: "MP3", // Ändrat till MP3 för enklare hantering i webbläsare
                effectsProfileId: ["small-bluetooth-speaker-class-device"],
                pitch: 10,
                speakingRate: 1,
              },
              input: {
                text: translatedText,
              },
              voice: {
                languageCode: "it-IT",
                name: "it-IT-Wavenet-D",
              },
            }),
          }
        )
          .then((response) => {
            if (!response.ok) {
              throw new Error("Network response was not ok");
            }
            return response.json(); // or .json(), .text(), etc., based on the expected response type
          })
          .then((data) => {
            // Konvertera base64-strängen till en Blob
            const audioBlob = new Blob(
              [
                Uint8Array.from(atob(data.audioContent), (c) =>
                  c.charCodeAt(0)
                ),
              ],
              { type: "audio/mp3" }
            );
            // Skapa en URL för Blob
            var audio = new Audio(URL.createObjectURL(audioBlob));
            audio.play();
          })
          .catch((error) => console.error("Error:", error));
      }, 3500);
    });
});
