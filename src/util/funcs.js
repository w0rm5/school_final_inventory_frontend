import serverConfig from "@/util/serverConfig";

export function textOverflow(text, maxLength) {
  if (text.length > maxLength) {
    return text.substring(0, maxLength) + "...";
  }
  return text;
}

export function getImage(image) {
  if (Array.isArray(image)) {
    if (image[0]) {
      return serverConfig.file_url + image[0];
    }
  } else {
    if (image) {
      return serverConfig.file_url + image;
    }
  }
  return serverConfig.no_image_url;
}
