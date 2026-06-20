import { Instrument_Serif } from "next/font/google";

// Geist Sans (loaded directly in app/layout.tsx) is the body font — Inter
// was historically wired up as --font-sans but is no longer referenced in
// any component, so dropping it saves one Google Fonts request.
export const instrumentSerif = Instrument_Serif({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});
