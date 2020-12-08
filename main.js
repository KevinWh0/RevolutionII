import { sha256 } from "./scripts/sha256.js";
import { generateSeededPassword } from "./scripts/security.js";

let roomName = "general-chat";
let roomID = "XbxzaEahrJlqOD0Q";
let password = "P4nfwSrq0xw9IZY9NI+eOHGZV4+ARvGrpXb59ylq+x0";
let drone = new ScaleDrone(roomID);
const room = drone.subscribe(roomName);

let localName = "";

//console.log(sha256.b64_hmac("e", "Secure Hash!"));

loadPassword();
//run this method when you load the website
function loadPassword() {
  //password = sha256.b64_hmac(generateSeededPassword(), "Secure Hash!");
  console.log(password);
  //clear the code in the security.js file so people using inspect can't reverse engineer it (if possible)
}

function login() {
  //document.getElementById("loginScreenHolder").style.display = "none";
  document.getElementById("loginScreenHolder").hidden = true;
  document.getElementById("ChatHolder").hidden = false;

  localName = document.getElementById("Username").value;
  //Add a room listener
  room.on("message", (message) => {
    let text = document.createElement("p");
    text.innerHTML = `${message.data.name} : ${message.data.content}`;
    document.getElementById("ChatContainer").appendChild(text);
  });
  //If enter is pressed inside the textbox, send the message by simulating a click
  document
    .getElementById("Chatbar")
    .addEventListener("keyup", function (event) {
      if (event.key == "Enter") document.getElementById("send").click();
    });

  //add the click listener to the send button
  document.getElementById("send").onclick = function () {
    sendMessage(document.getElementById("Chatbar").value, localName);
    document.getElementById("Chatbar").value = "";
  };
}

function sendMessage(message, user) {
  try {
    drone.publish({
      room: roomName,
      message: {
        type:
          "message" /* This will be for later when there are system messages and other things as well as dms */,
        name: user,
        content: message,
      },
    });
  } catch (error) {
    console.error(error);
  }
}
//Hide the chat stuff
document.getElementById("ChatHolder").hidden = true;
//Add the event listener to the login button
document.getElementById("loginButton").onclick = function () {
  if (
    sha256.b64_hmac(
      document.getElementById("Password").value,
      "Secure Hash!"
    ) == password
  ) {
    login();
  }
};
