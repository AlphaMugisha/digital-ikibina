import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#2F6D4F",
          color: "#FBF8F1",
          fontSize: 72,
          fontWeight: 600,
        }}
      >
        <div
          style={{
            width: 140,
            height: 140,
            borderRadius: 32,
            background: "#E7A94C",
            color: "#2F1B05",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 64,
            marginBottom: 32,
          }}
        >
          DI
        </div>
        Digital Ibimina
      </div>
    ),
    size,
  );
}
