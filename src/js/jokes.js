require("dotenv").config();
const apiKey = process.env.GOOGLE_API_KEY;

const welcomeContainer = document.getElementById("welcome-text");
const titleContainer = document.getElementById("titlePic");
const footerNotes = document.getElementById("notes");
const welcomeText = `En revolutionerande webbupplevelse där banbrytande teknik möter humor på ett sätt som sällan skådats! Vår unika webbtjänst kombinerar kraften hos tre öppna API:er. Den unika algoritmen som tagits fram av våra skickliga programmerare hämtar ett slumpmässigt skämt och översätter detta med en otrolig precision. Skämtet läses sedan upp av den röststyrda Cloud Text-To-Speech som konfigurerats och optimerats till att kunna leverera skämt med maximal tajming och känsla.`;

const titlePic = `&nbsp;
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;██ ▄▄ ██▄██▀▄▄▀█▀███▀█ ▄▄▀█ ▄▄▀█ ▄▄▀██▄███ ▄▄▄ ██&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;██ █▀▀██ ▄█ ██ ██ ▀ ██ ▀▀ █ ██ █ ██ ██ ▄██▄▄▄▀▀██&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;██ ▀▀▄█▄▄▄██▄▄████▄███▄██▄█▄██▄█▄██▄█▄▄▄██ ▀▀▀ ██&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
&nbsp;▄▄▄▄▄▄█████▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄███████▄▄▄▄▄▄&nbsp;&nbsp;
██ ▄▄▄ █ █▀█ ▄▄▀█ ▄▄▀█▄ ▄█▄ ▄█ ▄▀▄ █ ▄▄▀█ ▄▄█ █▀██▄███ ▀██ ██&nbsp;
██▄▄▄▀▀█ ▄▀█ ▀▀▄█ ▀▀ ██ ███ ██ █▄█ █ ▀▀ █▄▄▀█ ▄▀██ ▄██ █ █ ██&nbsp;
██ ▀▀▀ █▄█▄█▄█▄▄█▄██▄██▄███▄██▄███▄█▄██▄█▄▄▄█▄█▄█▄▄▄██ ██▄ ██&nbsp;
&nbsp;▀▀▀▀▀▀▀&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;▀▀▀▀▀▀▀&nbsp;®`;

const notesText = `<span class="red">⚠</span> Trots att filter är på plats för att filtrera bort de grövsta skämten så kan en del av dem fortfarande upplevas som stötande för vissa individer. Vi ber om överseende med detta. <span class="red">⚠</span><br><br>Webbplatsen använder typsnitt från <a href='https://famfonts.com/compaq/' target='_blank'>| Famous Fonts |</a> och <a href='https://int10h.org/oldschool-pc-fonts/fontlist/font?ibm_vga_9x16' target='_blank'>| The Oldschool PC Font Resource |</a>.<br><br><hr><em class="footer-copy">> Projektuppgift DT211G<br>> Giovannis Skrattmaskin<br>> ©CoSi2301 VT2024</em>`;

let jokeText;

document.addEventListener("DOMContentLoaded", (event) => {
  welcomeContainer.innerHTML = welcomeText;
  titleContainer.innerHTML = titlePic;
  footerNotes.innerHTML = notesText;

  function fetchJoke() {
    return new Promise((resolve, reject) => {
      var baseURL = "https://v2.jokeapi.dev";
      var categories = "Any";
      var params = [
        "blacklistFlags=nsfw,religious,racist,sexist",
        "idRange=0-182",
      ];

      var xhr = new XMLHttpRequest();
      xhr.open("GET", `${baseURL}/joke/${categories}?${params.join("&")}`);

      xhr.onload = function () {
        if (xhr.status < 300) {
          var randomJoke = JSON.parse(xhr.responseText);
          resolve(randomJoke);
        } else {
          reject(`Fel vid hämtning. Statuskod: ${xhr.status}`);
        }
      };

      xhr.onerror = function () {
        reject(`Nätverksfel.`);
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
        jokeText = `${joke.setup} ${joke.delivery}`;
      }

      document.getElementById(
        "welcome-text"
      ).innerHTML = `> old lang: EN<br>--------------<br> ${jokeText}`;

      const translationResult = await translateText(apiKey);

      var i = 0;
      var speed = 50;

      document.getElementById(
        "welcome-text"
      ).innerHTML += `<br><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<em class="arrows">▼▼▼▼</em><br><br>> new lang: SV<br>--------------<br>`;
      function typeWriter() {
        if (i < translationResult.length) {
          document.getElementById("welcome-text").innerHTML +=
            translationResult.charAt(i);
          i++;
          setTimeout(typeWriter, speed);
        }
      }
      typeWriter();

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
              throw new Error(`Nätverksfel.`);
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
              document
                .getElementById("translate-btn")
                .classList.remove("disabled");
            };
          })
          .catch((error) => console.error(`Felmeddelande: ${error}`));
      }, 1000);
    } catch (error) {
      console.error(`Fel vid hämtning eller översättning: ${error}`);
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
        throw new Error(`Nätverksfel.`);
      }

      const data = await response.json();
      const translatedText = data.data.translations[0].translatedText;
      return translatedText;
    } catch (error) {
      console.error(`Kunde inte hämta översättningen: ${error}`);
      throw error;
    }
  }

  document
    .getElementById("translate-btn")
    .addEventListener("click", function () {
      document.getElementById("translate-btn").disabled = true;
      document.getElementById("translate-btn").classList.add("disabled");
      startTranslation(apiKey);
      document.getElementById("home-btn").style.display = "inline-block";
      const element = document.getElementById("welcome-text");
      let offsetTop;

      const smallDevice = window.matchMedia("(max-width: 760px)");
      const mediumDevice = window.matchMedia(
        "(min-width: 760.5px) and (max-width: 1180px)"
      );
      const largeDevice = window.matchMedia(
        "(min-width: 1180.5px) and (max-width: 2000px)"
      );
      const xxlDevice = window.matchMedia("(min-width: 2000.5px)");

      if (smallDevice.matches) {
        offsetTop = element.getBoundingClientRect().top + window.scrollY - 120;
      } else if (mediumDevice.matches) {
        offsetTop = element.getBoundingClientRect().top + window.scrollY - 100;
      } else if (largeDevice.matches) {
        offsetTop = element.getBoundingClientRect().top + window.scrollY - 150;
      } else if (xxlDevice.matches) {
        offsetTop = element.getBoundingClientRect().top + window.scrollY - 180;
      }

      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });
    });

  const hemButton = document.getElementById("home-btn");
  hemButton.addEventListener("click", function () {
    welcomeContainer.innerHTML = welcomeText;
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
    document.getElementById("home-btn").style.display = "none";
  });
});
