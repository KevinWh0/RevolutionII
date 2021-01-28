export function styleMessage(message, type, attachments) {
  let msg = message;
  //console.log(type);
  if (type != "SystemMessage") {
    msg = msg.replaceAll(/</gi, "&lt;");
    msg = msg.replaceAll(/>/gi, "&gt;");
  }
  //Make urls clickable
  if (msg.includes("http")) {
    let split = msg.split(" ");
    for (let i = 0; i < split.length; i++) {
      //Link youtube
      if (split[i].startsWith("https://www.youtube.com/watch")) {
        split[
          i
        ] = `<iframe width="560" height="315" src="https://www.youtube.com/embed/${
          split[i].split("=")[1].split("&")[0]
        }" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
      }

      //Make URLS clickable
      if (split[i].startsWith("http")) {
        let url = split[i];
        split[i] = `<a href = "${split[i]}", target = "_blank">${split[i]}</a>`;
        //}
        //if (!split[i].startsWith("https://www.youtube.com/watch")) {
        //https://api.apiflash.com/v1/urltoimage?access_key=d19c4430e3d54e00bc278876fa12b98e&url=http://google.com
        //alert(url);
        split[i] =
          split[i] +
          `
        </br>
        <image src = "https://api.apiflash.com/v1/urltoimage?access_key=d19c4430e3d54e00bc278876fa12b98e&height=480&width=640&url=${url}"></image>
        `;
        //https://api.apiflash.com/v1/urltoimage?access_key=d19c4430e3d54e00bc278876fa12b98e&url=
        //}
      }
    }
    msg = split.join(" ");
  }
  //Deal with attachments
  if (attachments != undefined) {
    if (attachments.includes("data:") || attachments.includes("cloudinary")) {
      msg += `<image src = "${attachments}" class = "ChatImg">`;
    }
  }
  return msg;
}
