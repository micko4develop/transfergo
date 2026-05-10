import { type FormEvent, useState } from "react";
import backgroundImage from "../bannerr.png";
import logoImage from "../image-logoo.png";
import heroVehicle from "../imagee.png";
import transferPrices from "./data/transferPrices.js";

const contactPhoneNumber = "+38268672825";
const contactPhoneDigits = contactPhoneNumber.replace(/\D/g, "");

const translations = {
  en: {
    nav: {
      home: "Home",
      destinations: "Destinations",
      fleet: "Fleet",
      about: "About",
      bookNow: "Book Now",
    },
    hero: {
      eyebrow: "Airport Transfers and Private Rides",
      title: "Airport transfers and private rides in Montenegro.",
      lead: "Comfortable. Reliable. On time. Book your ride from the airport or across the coast with a fixed price and friendly local drivers.",
      badges: ["Fixed Prices", "No Hidden Fees", "24/7 Support"],
    },
    form: {
      from: "From",
      to: "To",
      date: "Date",
      time: "Time",
      passengers: "Passengers",
      fullName: "Full Name",
      email: "Email",
      phone: "Phone",
      note: "Pickup address, flight number or note",
      chooseRoute: "Choose route to see the fixed price.",
      differentDestinations: "Choose two different destinations.",
      fixedPrice: "Fixed price",
      priceOnRequest: "Price available on request.",
      validRoute: "Choose a valid route first.",
      sent: "Your ride request has been sent. We will contact you shortly.",
      sendError: "Order could not be sent.",
      sending: "Sending...",
      orderRide: "Order Ride",
    },
    trust: [
      ["Free Waiting Time", "Up to 60 minutes"],
      ["Free Cancellation", "Up to 24h before"],
      ["24/7 Support", "We are always here"],
      ["Top Rated Service", "Hundreds of happy clients"],
    ],
    sections: {
      destinations: {
        title: "Popular Destinations",
        cards: [
          ["Tivat Airport", "Fast pickups and direct transfers"],
          ["Podgorica Airport", "Reliable transfers to the coast and city"],
          ["Budva", "Transfers to hotels and resorts"],
          ["Kotor", "Old town and cruise transfers"],
        ],
      },
      fleet: {
        title: "Our Fleet",
        cards: [
          ["Premium Vans", "Perfect for families and groups"],
          ["Private Sedans", "Comfortable airport transfers"],
          ["Luxury Vehicles", "VIP transfers with style"],
        ],
      },
      about: {
        title: "Why TransferGo",
        cards: [
          ["Reliable Service", "Always on time with professional drivers"],
          ["Fixed Prices", "No hidden costs or surprises"],
          ["24/7 Support", "We are always here for you"],
        ],
      },
    },
  },
  mne: {
    nav: {
      home: "Početna",
      destinations: "Destinacije",
      fleet: "Vozila",
      about: "O nama",
      bookNow: "Rezerviši",
    },
    hero: {
      eyebrow: "Aerodromski transferi i privatne vožnje",
      title: "Aerodromski transferi i privatne vožnje u Crnoj Gori.",
      lead: "Udobno. Pouzdano. Na vrijeme. Rezervišite vožnju od aerodroma ili duž obale uz fiksnu cijenu i ljubazne lokalne vozače.",
      badges: ["Fiksne cijene", "Bez skrivenih troškova", "Podrška 24/7"],
    },
    form: {
      from: "Od",
      to: "Do",
      date: "Datum",
      time: "Vrijeme",
      passengers: "Putnici",
      fullName: "Ime i prezime",
      email: "Email",
      phone: "Telefon",
      note: "Adresa preuzimanja, broj leta ili napomena",
      chooseRoute: "Izaberite rutu da vidite fiksnu cijenu.",
      differentDestinations: "Izaberite dvije različite destinacije.",
      fixedPrice: "Fiksna cijena",
      priceOnRequest: "Cijena dostupna na upit.",
      validRoute: "Prvo izaberite validnu rutu.",
      sent: "Vaš zahtjev za vožnju je poslat. Kontaktiraćemo vas uskoro.",
      sendError: "Narudžbina nije mogla biti poslata.",
      sending: "Šalje se...",
      orderRide: "Order Ride",
    },
    trust: [
      ["Besplatno čekanje", "Do 60 minuta"],
      ["Besplatno otkazivanje", "Do 24h ranije"],
      ["Podrška 24/7", "Uvijek smo tu"],
      ["Najbolje ocijenjena usluga", "Stotine zadovoljnih klijenata"],
    ],
    sections: {
      destinations: {
        title: "Popularne destinacije",
        cards: [
          ["Aerodrom Tivat", "Brza preuzimanja i direktni transferi"],
          ["Aerodrom Podgorica", "Pouzdani transferi do obale i grada"],
          ["Budva", "Transferi do hotela i rizorta"],
          ["Kotor", "Transferi do Starog grada i kruzera"],
        ],
      },
      fleet: {
        title: "Naša vozila",
        cards: [
          ["Premium kombiji", "Idealno za porodice i grupe"],
          ["Privatni sedani", "Udobni aerodromski transferi"],
          ["Luksuzna vozila", "VIP transferi sa stilom"],
        ],
      },
      about: {
        title: "Zašto TransferGo",
        cards: [
          ["Pouzdana usluga", "Uvijek na vrijeme uz profesionalne vozače"],
          ["Fiksne cijene", "Bez skrivenih troškova i iznenađenja"],
          ["Podrška 24/7", "Uvijek smo tu za vas"],
        ],
      },
    },
  },
} as const;

type Language = keyof typeof translations;
type RouteForm = {
  from: string;
  to: string;
  date: string;
  time: string;
  passengers: string;
  name: string;
  email: string;
  phone: string;
  note: string;
};
type RouteFormField = keyof RouteForm;
type OrderStatus = {
  type: "" | "success" | "error";
  message: string;
};
type TransferRoute = (typeof transferPrices.routes)[number];

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12.04 2C6.55 2 2.1 6.45 2.1 11.93c0 1.75.46 3.46 1.33 4.96L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.48 0 9.93-4.45 9.93-9.93C21.98 6.45 17.53 2 12.04 2Zm5.78 14.19c-.24.68-1.39 1.3-1.94 1.38-.5.08-1.13.11-1.82-.11-.42-.13-.96-.31-1.65-.61-2.9-1.25-4.8-4.15-4.95-4.34-.15-.19-1.18-1.57-1.18-3s.75-2.13 1.02-2.42c.27-.3.59-.37.79-.37h.57c.18.01.43-.07.67.51.24.58.81 2.01.88 2.16.07.15.12.33.02.52-.1.2-.15.32-.3.49-.15.17-.31.38-.45.51-.15.15-.3.31-.13.61.17.3.76 1.25 1.62 2.02 1.11.99 2.05 1.3 2.35 1.45.3.15.47.13.64-.08.2-.23.74-.86.94-1.16.2-.3.39-.25.67-.15.27.1 1.72.81 2.02.96.3.15.5.22.57.34.07.13.07.73-.17 1.41Z" />
  </svg>
);

const ViberIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M17.8 2.9C14 2.1 10 2.1 6.2 2.9 4 3.4 2.5 5 2.1 7.2c-.5 3-.5 5.6 0 8.6.35 2 1.65 3.45 3.55 4.05v2.25c0 .72.87 1.08 1.38.57l2.25-2.25c2.85.27 5.7.08 8.52-.52 2.2-.47 3.7-2.1 4.08-4.3.48-2.85.48-5.55 0-8.4-.38-2.2-1.88-3.83-4.08-4.3ZM8.2 7.03c.2-.2.48-.27.75-.18.63.2 1.2.52 1.7.95.3.25.35.7.1 1l-.38.48c-.2.25-.23.6-.06.88.42.68.94 1.3 1.56 1.82.26.22.64.25.94.08l.53-.32c.34-.2.78-.1 1 .2.36.54.62 1.14.78 1.78.07.28-.03.57-.25.75l-.45.37c-.5.4-1.17.55-1.78.35-2.52-.8-4.5-2.78-5.3-5.3-.2-.62-.07-1.28.35-1.78l.51-.57Zm7.95 4.62c-.27 0-.5-.2-.53-.48-.12-1.48-1.03-2.37-2.52-2.5-.3-.03-.5-.28-.48-.58.03-.3.28-.5.58-.48 2.02.17 3.32 1.47 3.5 3.47.02.3-.2.55-.5.57h-.05Zm1.78 0c-.28 0-.52-.22-.54-.5-.14-1.8-.73-3.25-1.75-4.27-1.02-1.02-2.46-1.6-4.25-1.73-.3-.02-.52-.28-.5-.58.03-.3.28-.52.58-.5 2.05.15 3.74.85 4.94 2.05 1.2 1.2 1.9 2.9 2.05 4.96.02.3-.2.55-.5.57h-.03Z" />
  </svg>
);

const normalizeRouteValue = (value: string) => value.trim().toLowerCase();

const getRoutePrice = (from: string, to: string): TransferRoute | null => {
  if (!from || !to || from === to) {
    return null;
  }

  return transferPrices.routes.find((route) => {
    const routeFrom = normalizeRouteValue(route.from);
    const routeTo = normalizeRouteValue(route.to);
    const selectedFrom = normalizeRouteValue(from);
    const selectedTo = normalizeRouteValue(to);

    return (
      (routeFrom === selectedFrom && routeTo === selectedTo) ||
      (routeFrom === selectedTo && routeTo === selectedFrom)
    );
  }) ?? null;
};

export default function App() {
  const [navOpen, setNavOpen] = useState(false);
  const [language, setLanguage] = useState<Language>("en");
  const [routeForm, setRouteForm] = useState<RouteForm>({
    from: "",
    to: "",
    date: "",
    time: "",
    passengers: "1",
    name: "",
    email: "",
    phone: "",
    note: "",
  });
  const [orderStatus, setOrderStatus] = useState<OrderStatus>({ type: "", message: "" });
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  const t = translations[language];
  const selectedRoute = getRoutePrice(routeForm.from, routeForm.to);

  const updateRouteForm = (field: RouteFormField, value: string) => {
    setRouteForm((current) => ({
      ...current,
      [field]: value,
    }));
    setOrderStatus({ type: "", message: "" });
  };

  const handleOrderSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedRoute) {
      setOrderStatus({ type: "error", message: t.form.validRoute });
      return;
    }

    setIsSubmittingOrder(true);
    setOrderStatus({ type: "", message: "" });

    try {
      const response = await fetch("/api/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(routeForm),
      });
      const result = await parseJsonResponse(response);

      if (!response.ok) {
        throw new Error(result.error || "Order could not be sent.");
      }

      setOrderStatus({
        type: "success",
        message: t.form.sent,
      });
      setRouteForm((current) => ({
        ...current,
        name: "",
        email: "",
        phone: "",
        note: "",
      }));
    } catch (error) {
      setOrderStatus({
        type: "error",
        message: error instanceof Error ? error.message : t.form.sendError,
      });
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  return (
    <div className="site">
      <header className="header">
        <div className="container header-inner">
          <a className="brand" href="#home" aria-label="TransferGo home">
            <img src={logoImage} alt="TransferGo logo" />
            <span>TransferGo</span>
          </a>

          <nav className={`nav ${navOpen ? "is-open" : ""}`} aria-label="Primary navigation">
            <a href="#home">{t.nav.home}</a>
            <a href="#destinations">{t.nav.destinations}</a>
            <a href="#fleet">{t.nav.fleet}</a>
            <a href="#about">{t.nav.about}</a>
          </nav>

          <div className="header-actions">
            <a className="button button-primary" href="#home">
              {t.nav.bookNow}
            </a>
            <button
              className="button button-secondary lang-switch"
              type="button"
              onClick={() => setLanguage((current) => (current === "en" ? "mne" : "en"))}
            >
              {language === "en" ? "MNE" : "EN"}
            </button>
            <button
              className="menu-toggle"
              type="button"
              aria-expanded={navOpen}
              aria-label="Toggle navigation"
              onClick={() => setNavOpen((open) => !open)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <section
        className="hero"
        id="home"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="hero-overlay" />

        <div className="container hero-inner">
          <div className="hero-copy">
            <p className="eyebrow">{t.hero.eyebrow}</p>
            <h1>{t.hero.title}</h1>
            <p className="hero-lead">{t.hero.lead}</p>
            <div className="hero-badges">
              {t.hero.badges.map((badge) => (
                <span key={badge}>{badge}</span>
              ))}
            </div>

            <form className="hero-search-form" onSubmit={handleOrderSubmit}>
              <label>
                <span className="sr-only">{t.form.from}</span>
                <select
                  value={routeForm.from}
                  required
                  onChange={(event) => updateRouteForm("from", event.target.value)}
                >
                  <option value="" disabled>
                    {t.form.from}
                  </option>
                  {transferPrices.destinations.map((destination) => (
                    <option key={destination} value={destination}>
                      {destination}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="sr-only">{t.form.to}</span>
                <select
                  value={routeForm.to}
                  required
                  onChange={(event) => updateRouteForm("to", event.target.value)}
                >
                  <option value="" disabled>
                    {t.form.to}
                  </option>
                  {transferPrices.destinations.map((destination) => (
                    <option key={destination} value={destination}>
                      {destination}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="sr-only">{t.form.date}</span>
                <input
                  type="text"
                  inputMode="none"
                  value={routeForm.date}
                  placeholder={t.form.date}
                  required
                  onFocus={(event) => {
                    event.currentTarget.type = "date";
                    event.currentTarget.showPicker?.();
                  }}
                  onBlur={(event) => {
                    if (!event.currentTarget.value) {
                      event.currentTarget.type = "text";
                    }
                  }}
                  onChange={(event) => updateRouteForm("date", event.target.value)}
                />
              </label>
              <label>
                <span className="sr-only">{t.form.time}</span>
                <input
                  type="text"
                  inputMode="none"
                  value={routeForm.time}
                  placeholder={t.form.time}
                  required
                  onFocus={(event) => {
                    event.currentTarget.type = "time";
                    event.currentTarget.showPicker?.();
                  }}
                  onBlur={(event) => {
                    if (!event.currentTarget.value) {
                      event.currentTarget.type = "text";
                    }
                  }}
                  onChange={(event) => updateRouteForm("time", event.target.value)}
                />
              </label>
              <label>
                <span className="sr-only">{t.form.passengers}</span>
                <input
                  type="number"
                  min="1"
                  value={routeForm.passengers}
                  placeholder={t.form.passengers}
                  required
                  onChange={(event) => updateRouteForm("passengers", event.target.value)}
                />
              </label>
              <div className="route-price" aria-live="polite">
                {!routeForm.from || !routeForm.to ? (
                  <span>{t.form.chooseRoute}</span>
                ) : routeForm.from === routeForm.to ? (
                  <span>{t.form.differentDestinations}</span>
                ) : selectedRoute ? (
                  <>
                    <span>{t.form.fixedPrice}</span>
                    <strong>
                      {selectedRoute.price} {transferPrices.currency}
                    </strong>
                  </>
                ) : (
                  <span>{t.form.priceOnRequest}</span>
                )}
              </div>
              <div className="booking-fields">
                <label>
                  <span className="sr-only">{t.form.fullName}</span>
                  <input
                    type="text"
                    value={routeForm.name}
                    placeholder={t.form.fullName}
                    required
                    onChange={(event) => updateRouteForm("name", event.target.value)}
                  />
                </label>
                <label>
                  <span className="sr-only">{t.form.email}</span>
                  <input
                    type="email"
                    value={routeForm.email}
                    placeholder={t.form.email}
                    required
                    onChange={(event) => updateRouteForm("email", event.target.value)}
                  />
                </label>
                <label>
                  <span className="sr-only">{t.form.phone}</span>
                  <input
                    type="tel"
                    value={routeForm.phone}
                    placeholder={t.form.phone}
                    required
                    onChange={(event) => updateRouteForm("phone", event.target.value)}
                  />
                </label>
                <label>
                  <span className="sr-only">{t.form.note}</span>
                  <input
                    type="text"
                    value={routeForm.note}
                    placeholder={t.form.note}
                    onChange={(event) => updateRouteForm("note", event.target.value)}
                  />
                </label>
              </div>
              {orderStatus.message ? (
                <p className={`order-status ${orderStatus.type}`} aria-live="polite">
                  {orderStatus.message}
                </p>
              ) : null}
              <button
                className="button button-primary search-button"
                type="submit"
                disabled={isSubmittingOrder || !selectedRoute || routeForm.from === routeForm.to}
              >
                {isSubmittingOrder ? t.form.sending : t.form.orderRide}
              </button>
            </form>
          </div>

          <div className="hero-side">
            <div className="hero-media">
              <img src={heroVehicle} alt="TransferGo vehicle" />
            </div>
            <div className="messenger-links" aria-label="Quick contact">
              <a
                className="messenger-link whatsapp"
                href={`https://wa.me/${contactPhoneDigits}`}
                target="_blank"
                rel="noreferrer"
              >
                <span className="messenger-icon">
                  <WhatsAppIcon />
                </span>
                WhatsApp
              </a>
              <a className="messenger-link viber" href={`viber://chat?number=${contactPhoneNumber}`}>
                <span className="messenger-icon">
                  <ViberIcon />
                </span>
                Viber
              </a>
            </div>
          </div>
        </div>

        <div className="hero-trust">
          {t.trust.map(([title, text]) => (
            <div key={title}>
              <strong>{title}</strong>
              <span>{text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* DESTINATIONS */}
      <section className="section" id="destinations">
        <div className="container">
          <h2>{t.sections.destinations.title}</h2>

          <div className="grid">
            {t.sections.destinations.cards.map(([title, text]) => (
              <div className="card" key={title}>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FLEET */}
      <section className="section dark" id="fleet">
        <div className="container">
          <h2>{t.sections.fleet.title}</h2>

          <div className="grid">
            {t.sections.fleet.cards.map(([title, text]) => (
              <div className="card" key={title}>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="section" id="about">
        <div className="container">
          <h2>{t.sections.about.title}</h2>

          <div className="grid">
            {t.sections.about.cards.map(([title, text]) => (
              <div className="card" key={title}>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <p>© TransferGo 2026</p>
      </footer>
    </div>
  );
}

async function parseJsonResponse(response: Response): Promise<{ error?: string; ok?: boolean }> {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text) as { error?: string; ok?: boolean };
  } catch {
    return {
      error: response.ok ? undefined : "Server trenutno ne moze da obradi zahtjev.",
    };
  }
}
