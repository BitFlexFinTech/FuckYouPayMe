import { PayoutMethod } from "./types";

export interface CountryConfig {
  code: string; name: string; flag: string; language: string; locale: string;
  currency: string; currencySymbol: string;
  bankingRails: {
    method: PayoutMethod; label: string; icon: string;
    instant: boolean; maxAmount: number;
    setupFields: { key: string; label: string; type: "text" | "number" | "select"; placeholder: string }[];
  }[];
  translations: Record<string, string>;
  welcomeMessage: string;
}

export function mkC(
  code: string, name: string, flag: string, lang: string, loc: string,
  cur: string, sym: string, rails: any[], tr: any, wmsg: string
): CountryConfig {
  return { code, name, flag, language: lang, locale: loc, currency: cur, currencySymbol: sym, bankingRails: rails, translations: tr, welcomeMessage: wmsg };
}


export const COUNTRIES: CountryConfig[] = [];

// === EUROPE ===
// Germany
COUNTRIES.push(mkC("DE","Germany","🇩🇪","Deutsch","de-DE","EUR","€",[
  {method:"sepa",label:"SEPA Instant",icon:"🏦",instant:true,maxAmount:100000,setupFields:[{key:"iban",label:"IBAN",type:"text",placeholder:"DE89 3704 0044 0532 0130 00"},{key:"holder",label:"Kontoinhaber",type:"text",placeholder:"Max Mustermann"}]},
  {method:"wise",label:"Wise",icon:"🌍",instant:false,maxAmount:50000,setupFields:[{key:"email",label:"Wise Email",type:"text",placeholder:"meine@email.de"}]}
],{h1:"FICK DICH.",h2:"ZAHL MICH.",da:"Freelancer Dashboard",inv:"Neue Rechnung",ea:"Gesamteinnahmen",pe:"Ausstehend",ac:"Aktive Rechnungen",fe:"Plattformgebühr",yo:"Du erhältst",ba:"Bank verbinden",bd:"Klicke einmal, um dein Konto zu verbinden.",pa:"Auszahlungsmethode",de:"🔥 Investoren-Demo-Modus",en:"→ Zum Dashboard",ge:"→ Bezahlt werden — Kostenlose Demo",bu:"Gebaut für",se:"ernsthafte",fr:"Freelancer.",st:"HÖR AUF",pm:"ZAHLUNGEN",ch:"ZU JAGEN",tg:"v1.0 · Ephemeral Vault Escrow",ft:"© 2026 FuckYouPayMe · Alle Rechte vorbehalten."},"Willkommen bei FuckYouPayMe. SEPA-Instant-Auszahlungen sind für dich bereit."));
