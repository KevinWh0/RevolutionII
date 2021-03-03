import { sha256 } from "./scripts/sha256.js";
import { generateSeededPassword } from "./scripts/security.js";
import { styleMessage } from "./scripts/styleChat.js";
import { getImageData, setupUploader } from "./scripts/imageUpload.js";
//import * as sjcl from "https://bitwiseshiftleft.github.io/sjcl/sjcl.js";

let roomName = "general-chat";
let roomID = "XbxzaEahrJlqOD0Q";
let password = "P4nfwSrq0xw9IZY9NI+eOHGZV4+ARvGrpXb59ylq+x0";
let testerPassword = "0GPGyaNxWWucWWJP0YaRrs5ymPLgS35MwZXuOQ5kht4";
let drone;
let room;

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
  if (
    sha256.b64_hmac(
      document.getElementById("Password").value,
      "Secure Hash!"
    ) == testerPassword
  ) {
    drone = new ScaleDrone("YAQN5ZkBe6gqOlkf");

    room = drone.subscribe(roomName);
    console.log("logged into tester side");
  } else {
    drone = new ScaleDrone(roomID);

    room = drone.subscribe(roomName);
  }

  //document.getElementById("loginScreenHolder").style.display = "none";
  document.getElementById("loginScreenHolder").hidden = true;
  document.getElementById("ChatHolder").hidden = false;

  localName = document.getElementById("Username").value;
  //Add a room listener
  room.on("message", (message) => {
    let text = document.createElement("p");
    text.innerHTML = styleMessage(
      `${atob(message.data.name)} : ${sjcl.decrypt(
        "password" + new Date().getDay(),
        JSON.parse(atob(message.data.content))
      )}`,
      atob(message.data.type),
      atob(message.data.attachments)
    );
    document.getElementById("ChatContainer").appendChild(text);
    /*document
      .getElementById("ChatContainer")
      .scrollTo(0, document.getElementById("ChatContainer").scrollHeight);
*/
    document.getElementById("ChatContainer").scrollTo({
      top: document.getElementById("ChatContainer").scrollHeight,
      behavior: "smooth",
    });
  });
  //If enter is pressed inside the textbox, send the message by simulating a click
  document
    .getElementById("Chatbar")
    .addEventListener("keyup", function (event) {
      if (event.key == "Enter") document.getElementById("send").click();
    });

  //add the click listener to the send button
  document.getElementById("send").onclick = function () {
    if (document.getElementById("Chatbar").value != "") {
      sendMessage(document.getElementById("Chatbar").value, localName);
      document.getElementById("Chatbar").value = "";
    }
  };

  //Add the call button functionality
  document.getElementById("VideoCall").onclick = function () {
    let callRoomID = Math.floor(Math.random() * 0xffffff).toString(16);
    let params = `scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,
width=0,height=0,left=-1000,top=-1000`;

    let openedWindow = window.open(
      `./VidTest/#${callRoomID}`,
      "Video Call",
      params
    );

    document.getElementById(
      "Chatbar"
    ).value = `<a href = "./VidTest/#${callRoomID}", target = "_blank">Join The Video Call!</a>`;
    sendMessage(
      document.getElementById("Chatbar").value,
      "System",
      "SystemMessage"
    );
    document.getElementById("Chatbar").value = "";
  };
  //Add file upload listener
  setupUploader();
  //document.getElementById("fileinput").addEventListener("change", function () {
  //getImageData();
  //});
}
export function safeSendAttachment(attachments) {
  sendMessage("", localName, "User", attachments);
}
function sendMessage(message, user, metadata, attachments) {
  let meta = "";
  if (metadata) meta = metadata;
  if (!attachments) attachments = null;

  try {
    var encrypted = sjcl.encrypt("password" + new Date().getDay(), message);

    drone.publish({
      room: roomName,
      message: {
        type: btoa(
          meta != "" ? meta : "message"
        ) /* This will be for later when there are system messages and other things as well as dms */,
        name: btoa(user),
        content: btoa(JSON.stringify(encrypted)),
        attachments: btoa(attachments == null ? "" : attachments),
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
    ) == password ||
    sha256.b64_hmac(
      document.getElementById("Password").value,
      "Secure Hash!"
    ) == testerPassword
  ) {
    login();
  }
};
