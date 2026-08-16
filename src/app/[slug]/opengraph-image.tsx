import { ImageResponse } from "next/og";
import type { CSSProperties } from "react";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getAllSlugs, getPost } from "@/lib/posts";
import { siteConfig } from "@/lib/site";

export const alt = "Pink Zap Blog";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export const dynamicParams = false;

const WIDTH = 1200;
const HEIGHT = 630;

const NOISE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
  <filter id="n">
    <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch"/>
    <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.05 0"/>
  </filter>
  <rect width="${WIDTH}" height="${HEIGHT}" filter="url(#n)"/>
</svg>`;

const NOISE_URI = `data:image/svg+xml,${encodeURIComponent(NOISE_SVG)}`;

function titleFontSize(title: string): number {
  const length = title.length;
  if (length <= 24) return 88;
  if (length <= 40) return 72;
  if (length <= 60) return 60;
  if (length <= 90) return 50;
  return 42;
}

function gradientLayer(
  horizontal: string,
  vertical: string,
  width: string,
  height: string,
  color: string,
): CSSProperties {
  return {
    position: "absolute",
    left: horizontal,
    top: vertical,
    width,
    height,
    backgroundImage: `radial-gradient(ellipse 70% 70% at 50% 50%, ${color} 0%, rgba(0,0,0,0) 72%)`,
  };
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  const title = post?.title ?? siteConfig.name;

  let fontData: ArrayBuffer | null = null;
  try {
    const buffer = await readFile(join(process.cwd(), "assets/fonts/Inter-SemiBold.ttf"));
    fontData = buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength,
    ) as ArrayBuffer;
  } catch {
    // Fall back to a system font stack if the bundled font is unavailable.
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          backgroundColor: "#161618",
        }}
      >
        <div style={gradientLayer("-15%", "-28%", "72%", "80%", "rgba(102,102,112,0.52)")} />
        <div style={gradientLayer("48%", "-12%", "66%", "72%", "rgba(80,80,90,0.5)")} />
        <div style={gradientLayer("62%", "52%", "78%", "82%", "rgba(96,96,106,0.46)")} />
        <div style={gradientLayer("-22%", "42%", "68%", "78%", "rgba(72,72,82,0.52)")} />
        <div
          style={{
            position: "absolute",
            left: "34%",
            top: "22%",
            width: "34%",
            height: "46%",
            backgroundImage:
              "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(150,150,164,0.16) 0%, rgba(0,0,0,0) 72%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: "100%",
            height: "100%",
            backgroundImage: `url("${NOISE_URI}")`,
          }}
        />
        <div
          style={{
            position: "relative",
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "70px 104px",
          }}
        >
          <div
            style={{
              color: "#ffffff",
              fontSize: titleFontSize(title),
              lineHeight: 1.14,
              letterSpacing: "-0.02em",
              fontWeight: 600,
              fontFamily: fontData ? "Inter" : undefined,
              textAlign: "center",
              maxWidth: 960,
            }}
          >
            {title}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: fontData
        ? [{ name: "Inter", data: fontData, weight: 600, style: "normal" }]
        : [],
    },
  );
}
