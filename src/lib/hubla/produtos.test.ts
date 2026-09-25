import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { offerIdsDoEvento } from "./normalizar";
import { mapaOfertasHubla, planoDoEventoHubla } from "./produtos";

const CLUB = "prod-club";
const OFFER_PRO = "offer-pro";
const OFFER_ELITE = "offer-elite";

const productMap = new Map([[CLUB, "pro" as const]]);
const offerMap = new Map([
  [OFFER_PRO, "pro" as const],
  [OFFER_ELITE, "elite" as const],
]);

describe("mapaOfertasHubla — fallback oficial", () => {
  it("casa Elite sem HUBLA_OFFER_ID_ELITE", () => {
    const prevElite = process.env.HUBLA_OFFER_ID_ELITE;
    const prevPro = process.env.HUBLA_OFFER_ID_PRO;
    delete process.env.HUBLA_OFFER_ID_ELITE;
    delete process.env.HUBLA_OFFER_ID_PRO;
    try {
      const offerMap = mapaOfertasHubla();
      assert.equal(
        planoDoEventoHubla({
          productId: "VL3e0iDO3A32SyjJWr9S",
          offerIds: ["v1SsMcVXNip7Mn5A2pNH"],
          productMap: new Map([["VL3e0iDO3A32SyjJWr9S", "pro"]]),
          offerMap,
        }),
        "elite",
      );
      assert.equal(
        planoDoEventoHubla({
          productId: "VL3e0iDO3A32SyjJWr9S",
          offerIds: ["SFykfBk80jkM1sAVJKxV"],
          productMap: new Map([["VL3e0iDO3A32SyjJWr9S", "pro"]]),
          offerMap,
        }),
        "elite",
      );
      assert.equal(
        planoDoEventoHubla({
          productId: "VL3e0iDO3A32SyjJWr9S",
          offerIds: ["1mGgy9MVD11CJdnsLEov"],
          productMap: new Map([["VL3e0iDO3A32SyjJWr9S", "pro"]]),
          offerMap,
        }),
        "pro",
      );
      assert.equal(
        planoDoEventoHubla({
          productId: "VL3e0iDO3A32SyjJWr9S",
          offerIds: ["cXqc4mz6YZFE4GKjGFUz"],
          productMap: new Map([["VL3e0iDO3A32SyjJWr9S", "pro"]]),
          offerMap,
        }),
        "elite",
      );
    } finally {
      if (prevElite !== undefined) process.env.HUBLA_OFFER_ID_ELITE = prevElite;
      if (prevPro !== undefined) process.env.HUBLA_OFFER_ID_PRO = prevPro;
    }
  });
});

describe("planoDoEventoHubla — F053", () => {
  it("checkout PRO casa pro", () => {
    assert.equal(
      planoDoEventoHubla({
        productId: CLUB,
        offerIds: [OFFER_PRO],
        productMap,
        offerMap,
      }),
      "pro",
    );
  });

  it("checkout Elite casa elite", () => {
    assert.equal(
      planoDoEventoHubla({
        productId: CLUB,
        offerIds: [OFFER_ELITE],
        productMap,
        offerMap,
      }),
      "elite",
    );
  });

  it("catálogo com as duas ofertas não promove PRO a elite", () => {
    assert.equal(
      planoDoEventoHubla({
        productId: CLUB,
        offerIds: [OFFER_PRO, OFFER_ELITE],
        productMap,
        offerMap,
      }),
      "pro",
    );
  });

  it("oferta desconhecida no produto Club não vira elite", () => {
    const soPro = new Map([[OFFER_PRO, "pro" as const]]);
    assert.equal(
      planoDoEventoHubla({
        productId: CLUB,
        offerIds: ["offer-teste-10-reais"],
        productMap,
        offerMap: soPro,
      }),
      "pro",
    );
  });
});

describe("offerIdsDoEvento — F053", () => {
  it("ignora catálogo em product.offers e usa a compra em products[].offers", () => {
    const ids = offerIdsDoEvento({
      product: {
        offers: [{ id: OFFER_PRO }, { id: OFFER_ELITE }],
      },
      products: [{ offers: [{ id: OFFER_PRO }] }],
    });
    assert.deepEqual(ids, [OFFER_PRO]);
  });

  it("order bump: fica a oferta principal", () => {
    const ids = offerIdsDoEvento({
      products: [
        {
          offers: [
            { id: OFFER_PRO, isOrderBump: false },
            { id: OFFER_ELITE, isOrderBump: true },
          ],
        },
      ],
    });
    assert.deepEqual(ids, [OFFER_PRO]);
  });
});
