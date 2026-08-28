import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { offerIdsDoEvento } from "./normalizar";
import { planoDoEventoHubla } from "./produtos";

const CLUB = "prod-club";
const OFFER_PRO = "offer-pro";
const OFFER_ELITE = "offer-elite";

const productMap = new Map([[CLUB, "pro" as const]]);
const offerMap = new Map([
  [OFFER_PRO, "pro" as const],
  [OFFER_ELITE, "elite" as const],
]);

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
