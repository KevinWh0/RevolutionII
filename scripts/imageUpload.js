import { safeSendAttachment } from "../main.js";

function getDataUrl(img) {
  // Create canvas
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  // Set width and height
  canvas.width = img.width;
  canvas.height = img.height;
  // Draw the image
  ctx.drawImage(img, 0, 0);
  return canvas.toDataURL("image/jpeg");
}

export function getImageData() {
  let file = document.getElementById("fileinput").files[0];
  let fileName = file.name;

  /*let image = false;
  let imageFileTypes = [".png", ".jpg", ".jpeg", ".tif", "bmp", ".svg"];
  imageFileTypes.forEach((e) => {
    if (fileName.includes(e)) image = true;
  });
  if (image) {
    console.log("attachment is a image file");
    // encode the file using the FileReader API
    const reader = new FileReader();
    reader.addEventListener(
      "load",
      function () {
        console.log("image data extrated");
        // convert image file to base64 string
        //console.log(reader.result);
        safeSendAttachment(reader.result);
      },
      false
    );

    if (file) {
      reader.readAsDataURL(file);
    }
  }*/
}

export function setupUploader() {
  document.getElementById("fileinput").addEventListener("change", function () {
    handleFiles(document.getElementById("fileinput").files);
  });
}

const cloudName = "kevinwho";
const unsignedUploadPreset = "xyjvrlmj";

var fileSelect = document.getElementById("fileSelect"),
  fileElem = document.getElementById("fileUpload"),
  urlSelect = document.getElementById("urlSelect");

fileSelect.addEventListener(
  "click",
  function (e) {
    if (fileElem) {
      fileElem.click();
    }
    e.preventDefault(); // prevent navigation to "#"
  },
  false
);

urlSelect.addEventListener(
  "click",
  function (e) {
    uploadFile("https://res.cloudinary.com/demo/image/upload/sample.jpg");
    e.preventDefault(); // prevent navigation to "#"
  },
  false
);

// ************************ Drag and drop ***************** //
function dragenter(e) {
  e.stopPropagation();
  e.preventDefault();
}

function dragover(e) {
  e.stopPropagation();
  e.preventDefault();
}

let dropbox = document.getElementById("dropbox");
dropbox.addEventListener("dragenter", dragenter, false);
dropbox.addEventListener("dragover", dragover, false);
dropbox.addEventListener("drop", drop, false);

function drop(e) {
  e.stopPropagation();
  e.preventDefault();

  var dt = e.dataTransfer;
  var files = dt.files;

  handleFiles(files);
}

// *********** Upload file to Cloudinary ******************** //
function uploadFile(file) {
  var url = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;
  var xhr = new XMLHttpRequest();
  var fd = new FormData();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");

  // Reset the upload progress bar
  document.getElementById("progress").style.width = 0;

  // Update progress (can be used to show progress indicator)
  xhr.upload.addEventListener("progress", function (e) {
    var progress = Math.round((e.loaded * 100.0) / e.total);
    document.getElementById("progress").style.width = progress + "%";

    console.log(`fileuploadprogress data.loaded: ${e.loaded},
  data.total: ${e.total}`);
  });

  xhr.onreadystatechange = function (e) {
    if (xhr.readyState == 4 && xhr.status == 200) {
      // File uploaded successfully
      var response = JSON.parse(xhr.responseText);
      // https://res.cloudinary.com/cloudName/image/upload/v1483481128/public_id.jpg
      var url = response.secure_url;
      // Create a thumbnail of the uploaded image, with 150px width
      var tokens = url.split("/");
      tokens.splice(-2, 0, "w_550,c_scale");
      var img = new Image(); // HTML5 Constructor
      img.src = tokens.join("/");

      console.log(img.src);
      safeSendAttachment(img.src);
    }
  };

  fd.append("upload_preset", unsignedUploadPreset);
  fd.append("tags", "browser_upload"); // Optional - add tag for image admin in Cloudinary
  fd.append("file", file);
  xhr.send(fd);
}

// *********** Handle selected files ******************** //
var handleFiles = function (files) {
  for (var i = 0; i < files.length; i++) {
    uploadFile(files[i]); // call the function to upload the file
  }
};
