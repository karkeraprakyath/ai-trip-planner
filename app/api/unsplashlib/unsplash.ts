export async function getUnsplashImage(query: string): Promise<string | null> {
  const accessKey = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY || process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    console.error("Unsplash access key is missing (set NEXT_PUBLIC_UNSPLASH_ACCESS_KEY or UNSPLASH_ACCESS_KEY)");
    return null;
  }

  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&orientation=landscape&per_page=1`,
      {
        headers: { Authorization: `Client-ID ${accessKey}` },
        next: { revalidate: 60 * 60 },
      }
    );
    if (!res.ok) {
      console.error("Unsplash fetch failed with status:", res.status);
      return null;
    }
    const data = await res.json();
    return data?.results?.[0]?.urls?.regular ?? null;
  } catch (err) {
    console.error("Unsplash error:", err);
    return null;
  }
}
