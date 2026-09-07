export const sampleFiles = [
  {
    id: "01",
    name: "01-still-hero.png",
    title: "The hero",
    note: "Product portrait · studio composition",
    src: "/images/hero.png",
    hash: "147cc4617f8a071993ffeeaee375b9ab97e70a156bbb109e01b4eda1a539aeb1",
  },
  {
    id: "02",
    name: "02-still-detail.png",
    title: "The details",
    note: "Material study · close composition",
    src: "/images/detail.png",
    hash: "3e67a0f0b6773fdcff14179be61d18898a4434fd1d3e075477e04e69247d2c28",
  },
  {
    id: "03",
    name: "03-still-collection.png",
    title: "The collection",
    note: "Campaign composition · family portrait",
    src: "/images/collection.png",
    hash: "435f3d70cd82a623cd1ab65d174f57f47f7b5d1e59f55b60fbc9dd59a1f4a588",
  },
] as const;

export async function verifySampleFiles(
  signal: AbortSignal,
): Promise<string[]> {
  return Promise.all(
    sampleFiles.map(async (file) => {
      const response = await fetch(file.src, { signal, cache: "no-store" });
      if (!response.ok)
        throw new Error("A sample file is unavailable. Please try again.");
      const bytes = await response.arrayBuffer();
      const digest = await crypto.subtle.digest("SHA-256", bytes);
      const hash = Array.from(new Uint8Array(digest), (byte) =>
        byte.toString(16).padStart(2, "0"),
      ).join("");
      if (hash !== file.hash)
        throw new Error(
          "Sample bytes do not match the expected digest. Approval stays blocked.",
        );
      return file.id;
    }),
  );
}
