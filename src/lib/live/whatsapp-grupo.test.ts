import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { urlGrupoWhatsappAvisosLive } from "./whatsapp-grupo";

describe("urlGrupoWhatsappAvisosLive — F082", () => {
  it("vazio → null", () => {
    const prev = process.env.NEXT_PUBLIC_WHATSAPP_AVISOS_LIVE_URL;
    delete process.env.NEXT_PUBLIC_WHATSAPP_AVISOS_LIVE_URL;
    assert.equal(urlGrupoWhatsappAvisosLive(), null);
    process.env.NEXT_PUBLIC_WHATSAPP_AVISOS_LIVE_URL = prev;
  });

  it("https válido → string", () => {
    const prev = process.env.NEXT_PUBLIC_WHATSAPP_AVISOS_LIVE_URL;
    process.env.NEXT_PUBLIC_WHATSAPP_AVISOS_LIVE_URL =
      "https://chat.whatsapp.com/ExemploConvite";
    assert.equal(
      urlGrupoWhatsappAvisosLive(),
      "https://chat.whatsapp.com/ExemploConvite",
    );
    process.env.NEXT_PUBLIC_WHATSAPP_AVISOS_LIVE_URL = prev;
  });

  it("javascript: → null", () => {
    const prev = process.env.NEXT_PUBLIC_WHATSAPP_AVISOS_LIVE_URL;
    process.env.NEXT_PUBLIC_WHATSAPP_AVISOS_LIVE_URL = "javascript:alert(1)";
    assert.equal(urlGrupoWhatsappAvisosLive(), null);
    process.env.NEXT_PUBLIC_WHATSAPP_AVISOS_LIVE_URL = prev;
  });
});
