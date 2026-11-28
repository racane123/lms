import { describe, expect, it } from "vitest";
import { toEmbedUrl } from "../../src/lib/video";

describe("toEmbedUrl", () => {
  it("accepts YouTube and Vimeo links", () => {
    expect(toEmbedUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe("https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ");
    expect(toEmbedUrl("https://youtu.be/dQw4w9WgXcQ")).toBe("https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ");
    expect(toEmbedUrl("https://vimeo.com/123456")).toBe("https://player.vimeo.com/video/123456");
  });
  it("rejects other hosts, http, and junk", () => {
    expect(toEmbedUrl("https://evil.example.com/watch?v=dQw4w9WgXcQ")).toBeNull();
    expect(toEmbedUrl("http://youtu.be/dQw4w9WgXcQ")).toBeNull();
    expect(toEmbedUrl("javascript:alert(1)")).toBeNull();
    expect(toEmbedUrl("not a url")).toBeNull();
  });
});
