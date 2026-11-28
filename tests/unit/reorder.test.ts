import { describe, expect, it } from "vitest";
import { moveItem } from "../../src/lib/reorder";

describe("moveItem", () => {
  it("moves items up and down", () => {
    expect(moveItem(["a", "b", "c"], "b", "up")).toEqual(["b", "a", "c"]);
    expect(moveItem(["a", "b", "c"], "b", "down")).toEqual(["a", "c", "b"]);
  });
  it("returns null at the edges or for unknown ids", () => {
    expect(moveItem(["a", "b"], "a", "up")).toBeNull();
    expect(moveItem(["a", "b"], "b", "down")).toBeNull();
    expect(moveItem(["a", "b"], "z", "up")).toBeNull();
  });
});
