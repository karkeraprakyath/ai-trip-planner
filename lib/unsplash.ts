export async function getUnsplashImage(query: string): Promise<string | null> {
  const accessKey = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    console.error("Unsplash access key is missing (NEXT_PUBLIC_UNSPLASH_ACCESS_KEY)");
    return null;
  }

  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&client_id=${accessKey}&orientation=landscape&per_page=1`,
      { next: { revalidate: 60 * 60 } } // cache 1h when called on server; ignored on client
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data?.results?.[0]?.urls?.regular ?? null;
  } catch (err) {
    console.error("Unsplash error:", err);
    return null;
  }
}


