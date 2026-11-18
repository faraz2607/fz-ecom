export function getDriveFileId(value: string): string | null {
  try {
    const parsedUrl = new URL(value);
    if (
      !["drive.google.com", "www.drive.google.com"].includes(parsedUrl.hostname)
    )
      return null;
    const fileId =
      parsedUrl.pathname.match(/\/file\/d\/([^/]+)/)?.[1] ??
      parsedUrl.searchParams.get("id");
    return fileId && /^[A-Za-z0-9_-]{10,200}$/.test(fileId) ? fileId : null;
  } catch {
    return null;
  }
}

export function toDisplayImageUrl(value: string): string {
  const fileId = getDriveFileId(value);
  return fileId ? `/api/images/drive/${encodeURIComponent(fileId)}` : value;
}
