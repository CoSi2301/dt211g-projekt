require("dotenv").config();
const apiKey = process.env.GOOGLE_API_KEY;

let jokeText;

document.addEventListener("DOMContentLoaded", (event) => {
  function fetchJoke() {
    return new Promise((resolve, reject) => {
      var baseURL = "https://v2.jokeapi.dev";
      var categories = "Any";
      var params = [
        "blacklistFlags=nsfw,religious,racist,sexist",
        "idRange=0-100",
      ];

      var xhr = new XMLHttpRequest();
      xhr.open("GET", `${baseURL}/joke/${categories}?${params.join("&")}`);

      xhr.onload = function () {
        if (xhr.status < 300) {
          var randomJoke = JSON.parse(xhr.responseText);
          resolve(randomJoke);
        } else {
          reject("Fel vid hämtning. Statuskod: " + xhr.status);
        }
      };

      xhr.onerror = function () {
        reject("Nätverksfel.");
      };

      xhr.send();
    });
  }

  async function startTranslation(apiKey) {
    try {
      const joke = await fetchJoke();

      if (joke.type == "single") {
        jokeText = joke.joke;
      } else {
        jokeText = `${joke.setup}\n\n${joke.delivery}`;
      }

      // console.log(jokeText);
      document.getElementById("main-text-box").textContent =
        "//lang: EN\n" + jokeText;

      const translationResult = await translateText(apiKey);

      // console.log(translationResult);
      document.getElementById("main-text-box").textContent +=
        "\n\n...\n\n//lang: SV\n" + translationResult;

      document.getElementById("main-text-box").innerHTML +=
        "<span>█</span><br><br>";

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
                audioEncoding: "MP3",
                effectsProfileId: ["small-bluetooth-speaker-class-device"],
                pitch: 10,
                speakingRate: 1,
              },
              input: {
                text: translationResult,
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
              throw new Error("Nätverksfel.");
            }
            return response.json();
          })
          .then((data) => {
            const audioBlob = new Blob(
              [
                Uint8Array.from(atob(data.audioContent), (c) =>
                  c.charCodeAt(0)
                ),
              ],
              { type: "audio/mp3" }
            );

            var audio = new Audio(URL.createObjectURL(audioBlob));
            audio.play();
            audio.onended = function () {
              document.getElementById("translate-btn").disabled = false;
            };
          })
          .catch((error) => console.error("Felmeddelande:", error));
      }, 1000);
    } catch (error) {
      console.error("Fel vid hämtning eller översättning:", error);
    }
  }

  async function translateText(apiKey) {
    try {
      const response = await fetch(
        `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            q: jokeText,
            source: "en",
            target: "sv",
            format: "text",
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Nätverksfel.");
      }

      const data = await response.json();
      const translatedText = data.data.translations[0].translatedText;
      return translatedText;
    } catch (error) {
      console.error("Kunde inte hämta översättningen:", error);
      throw error;
    }
  }

  document
    .getElementById("translate-btn")
    .addEventListener("click", function () {
      document.getElementById("translate-btn").disabled = true;
      startTranslation(apiKey);
      document.getElementById("home-btn").style.display = "inline-block";
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth",
      });
    });

  const hemButton = document.getElementById("home-btn");
  hemButton.addEventListener("click", function () {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
    window.location.reload();
    document.getElementById("home-btn").style.display = "none";
  });
});
