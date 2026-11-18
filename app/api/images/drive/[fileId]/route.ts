export async function GET(
  _request: Request,
  { params }: { params: Promise<{ fileId: string }> },
) {
  const { fileId } = await params;
  if (!/^[A-Za-z0-9_-]{10,200}$/.test(fileId)) {
    return new Response("Invalid Google Drive file ID.", { status: 400 });
  }

  const driveFileId = encodeURIComponent(fileId);
  const imageSources = [
    `https://drive.google.com/thumbnail?id=${driveFileId}&sz=w2000`,
    `https://drive.google.com/uc?export=view&id=${driveFileId}`,
    `https://drive.usercontent.google.com/download?id=${driveFileId}&export=view`,
  ];
  let imageResponse: Response | null = null;
  for (const source of imageSources) {
    try {
      const upstream = await fetch(source, {
        headers: { Accept: "image/avif,image/webp,image/*,*/*;q=0.8" },
        cache: "no-store",
      });
      if (
        upstream.ok &&
        upstream.headers.get("content-type")?.toLowerCase().startsWith("image/")
      ) {
        imageResponse = upstream;
        break;
      }
    } catch {
      // Try the next Google Drive image endpoint.
    }
  }

  if (!imageResponse) {
    return new Response(
      "Google Drive did not return a public image. Set General access to Anyone with the link and Viewer, then try again.",
      { status: 502 },
    );
  }

  return new Response(imageResponse.body, {
    headers: {
      "Content-Type": imageResponse.headers.get("content-type") ?? "image/jpeg",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
