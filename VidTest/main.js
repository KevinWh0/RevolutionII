// Generate random room name if needed
if (!location.hash) {
  location.hash.split("#")[0] = Math.floor(Math.random() * 0xffffff).toString(
    16
  );
}
const roomHash = location.hash.substring(1).split("/")[0];
let type = document.URL.split("#")[2];

let locallyMuted = false;

// TODO: Replace with your own channel ID
const drone = new ScaleDrone("ZG3sc4yONExFFmun");
// Room name needs to be prefixed with 'observable-'
const roomName = "observable-" + roomHash;
const configuration = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
  ],
};
let room;
let pc;

function onSuccess() {}
function onError(error) {
  console.error(error);
}
let isOfferer;
drone.on("open", (error) => {
  if (error) {
    return console.error(error);
  }
  room = drone.subscribe(roomName);
  room.on("open", (error) => {
    if (error) {
      console.error(error);
    }
  });
  // We're connected to the room and received an array of 'members'
  // connected to the room (including us). Signaling server is ready.
  room.on("members", (members) => {
    console.log("MEMBERS", members);
    // If we are the second user to connect to the room we will be creating the offer
    isOfferer = members.length === 2;
    startWebRTC(isOfferer);
  });
  room.on("message", (message) => {
    if (message.data.offerer != isOfferer)
      if (message.data.muted) {
        document.getElementById("remoteVideo").volume = 0;
      } else {
        if (!locallyMuted) document.getElementById("remoteVideo").volume = 1;
      }
  });
});

// Send signaling data via Scaledrone
function sendMessage(message) {
  drone.publish({
    room: roomName,
    message,
  });
}
let localStream;
let media;
function startWebRTC(isOfferer) {
  pc = new RTCPeerConnection(configuration);

  // 'onicecandidate' notifies us whenever an ICE agent needs to deliver a
  // message to the other peer through the signaling server
  pc.onicecandidate = (event) => {
    if (event.candidate) {
      sendMessage({ candidate: event.candidate });
    }
  };

  // If user is offerer let the 'negotiationneeded' event create the offer
  //This happens if you are the second user
  if (isOfferer) {
    pc.onnegotiationneeded = () => {
      pc.createOffer().then(localDescCreated).catch(console.error);
    };
  }

  //Reciving Data at start
  // When a remote stream arrives display it in the #remoteVideo element
  pc.ontrack = (event) => {
    const stream = event.streams[0];
    if (!remoteVideo.srcObject || remoteVideo.srcObject.id !== stream.id) {
      remoteVideo.srcObject = stream;
    }
  };

  if (type != "screenshare") {
    media = navigator.mediaDevices.getUserMedia({
      audio: true,
      video: { echoCancellation: true },
    });

    let localVideo = document.getElementById("localVideo");
    //Sending Data once at start
    media.then((stream) => {
      // Display your local video in #localVideo element
      localVideo.srcObject = stream;
      // Add your stream to be sent to the conneting peer
      localStream = stream;

      stream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });
    }, console.error);
  } else {
    //Screenshare!
    const gdmOptions = {
      video: {
        cursor: "always",
      },
      audio: {
        //echoCancellation: true,
        //noiseSuppression: true,
        sampleRate: 44100,
      },
    };
    async function startCapture(displayMediaOptions) {
      try {
        captureStream = await navigator.mediaDevices.getDisplayMedia(
          displayMediaOptions
        );
        localVideo.srcObject = captureStream;

        captureStream
          .getTracks()
          .forEach((track) => pc.addTrack(track, captureStream));
      } catch (err) {
        console.error("Error: " + err);
      }
    }
    startCapture(gdmOptions);
  }

  // Listen to signaling data from Scaledrone
  room.on("data", (message, client) => {
    // Message was sent by us
    if (client.id === drone.clientId) {
      return;
    }

    if (message.sdp) {
      // This is called after receiving an offer or answer from another peer
      pc.setRemoteDescription(
        new RTCSessionDescription(message.sdp),
        () => {
          // When receiving an offer lets answer it
          if (pc.remoteDescription.type === "offer") {
            pc.createAnswer().then(localDescCreated).catch(console.error);
          }
        },
        console.error
      );
    } else if (message.candidate) {
      // Add the new ICE candidate to our connections remote description
      pc.addIceCandidate(
        new RTCIceCandidate(message.candidate),
        onSuccess,
        console.error
      );
    }
  });
}

function localDescCreated(desc) {
  pc.setLocalDescription(
    desc,
    () => sendMessage({ sdp: pc.localDescription }),
    console.error
  );
}

//Setup Click Listeners
/*
function setupListeners() {
  
  document.getElementById("startCapture").onclick = function () {
    const gdmOptions = {
      video: {
        cursor: "always",
      },
      audio: {
        //echoCancellation: true,
        //noiseSuppression: true,
        sampleRate: 44100,
      },
    };
    startCapture(gdmOptions);
  };
}
setupListeners();
*/

//Screen Recording
/*
async function startCapture(displayMediaOptions) {
  //pc = new RTCPeerConnection(configuration);
  let captureStream = null;

  try {
    captureStream = await navigator.mediaDevices.getDisplayMedia(
      displayMediaOptions
    );

    captureStream
      .getTracks()
      .forEach((track) => pc.addTrack(track, captureStream));
    sendMessage({ streams: [captureStream.getTracks()] });
  } catch (err) {
    console.error("Error: " + err);
  }
  return captureStream;
}
*/

document.getElementById("Mute").onclick = function () {
  let icon = document.getElementById("muteIcon");
  if (icon.className == "fas fa-microphone") {
    icon.className = "fas fa-microphone-slash";
    sendMessage({ muted: true, offerer: isOfferer });
  } else {
    icon.className = "fas fa-microphone";
    sendMessage({ muted: false, offerer: isOfferer });
  }
};
document.getElementById("Deafen").onclick = function () {
  let icon = document.getElementById("DeafenIcon");
  if (icon.className == "fas fa-volume-up") {
    icon.className = "fas fa-volume-mute";
    locallyMuted = true;
    document.getElementById("remoteVideo").volume = 0;
  } else {
    icon.className = "fas fa-volume-up";
    locallyMuted = false;
    document.getElementById("remoteVideo").volume = 1;
  }
};
