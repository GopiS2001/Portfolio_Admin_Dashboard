// A Google Drive "share" link (…/file/d/<id>/view) opens a web page, not an image. For image
// previews use Drive's direct image address instead — same conversion as the website's.
// The file must be shared with "Anyone with the link", or Drive answers with a sign-in page.
const DRIVE_FILE = /^https:\/\/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=\w+&)?id=)([\w-]{10,})/;

export function driveImage(url?: string | null) {
  if (!url) return undefined;
  const match = url.match(DRIVE_FILE);
  return match ? `https://drive.google.com/thumbnail?id=${match[1]}&sz=w800` : url;
}
