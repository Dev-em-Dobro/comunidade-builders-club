import { describe, expect, it, afterEach } from "vitest";
import { whatsappEliteUrl } from "./suporte";

describe("whatsappEliteUrl", () => {
  afterEach(() => {
    delete process.env.WHATSAPP_ELITE_URL;
    delete process.env.NEXT_PUBLIC_WHATSAPP_ELITE_URL;
  });

  it("remove <> de colagem e exige http(s)", () => {
    process.env.NEXT_PUBLIC_WHATSAPP_ELITE_URL =
      "<https://chat.whatsapp.com/CMs0aHkzP6734UQJo6sYUK>";
    expect(whatsappEliteUrl()).toBe(
      "https://chat.whatsapp.com/CMs0aHkzP6734UQJo6sYUK",
    );
  });

  it("rejeita valor sem protocolo", () => {
    process.env.NEXT_PUBLIC_WHATSAPP_ELITE_URL = "chat.whatsapp.com/abc";
    expect(whatsappEliteUrl()).toBeNull();
  });
});
