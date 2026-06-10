/**
 * Extended step content (Steps 8–47). Loaded by getStepContent() as an
 * overlay on top of the original RICH map in step-content.ts. Kept in a
 * separate file purely to keep step-content.ts navigable.
 *
 * Voice rules:
 *   • Short, declarative. No "you'll want to" — say what to do.
 *   • Mention specific fees in USD/INR, exact form fields, real URLs.
 *   • Mistakes describe consequences, not just "don't do this".
 */

import type { StepRichContent } from "@/lib/step-content";

/**
 * Entries may omit `documents` when the step needs none — step-content.ts
 * normalises with an empty array at lookup time. The rest of the shape is
 * required.
 */
type ExtendedEntry = Omit<StepRichContent, "documents"> & {
  documents?: StepRichContent["documents"];
};

export const EXTENDED_RICH: Record<number, ExtendedEntry> = {
  /* ------------------------------ PHASE 2 ------------------------------ */

  8: {
    intro:
      "The SEVIS I-901 fee funds the system that tracks every F/M/J student in the US. You pay it once per SEVIS ID — not per visa attempt.",
    subSteps: [
      { title: "Find your SEVIS ID on the I-20",
        body: "Top-right corner: 'N' followed by 10 digits (e.g. N0012345678). Type it exactly — a single wrong digit means your fee won't link to your record." },
      { title: "Go to fmjfee.com",
        body: "Bookmark this URL — it's the only legitimate payer.",
        link: { label: "fmjfee.com", href: "https://www.fmjfee.com" } },
      { title: "Choose Form I-901 (F or M)",
        body: "F-1 students pick I-901 for F or M visas. Fee is $350 USD as of 2026. Pay by credit card, Western Union, or check (cards are fastest — receipt is instant)." },
      { title: "Save the receipt as PDF",
        body: "After payment you get an electronic receipt. Save it three places: download, email it to yourself, print one paper copy. You'll need it for Step 9 and at the interview." },
    ],
    outro: "If your I-20 is reissued (school transfer, level change), check whether you need to pay again — usually no, but verify on fmjfee.com.",
    documents: [
      { name: "SEVIS I-901 receipt (PDF)", description: "Electronic receipt downloaded from fmjfee.com after payment.", required: true },
    ],
    mistakes: [
      { title: "Paying from a third-party site", body: "Scam sites mimic fmjfee.com. Only the .com domain is real. Wrong site = lost $350 and no SEVIS record." },
      { title: "Wrong SEVIS ID typed", body: "If the ID doesn't match, payment sits unlinked. Officer can't find proof. Always copy-paste from I-20." },
      { title: "Losing the receipt", body: "Without the printed receipt, some consulates refuse the interview entirely. Print, save, email." },
    ],
    whyItMatters:
      "No SEVIS receipt = no interview. The fee proves you're a real student in the federal tracking system. Consulates verify the number live before they let you in.",
    relatedSteps: [6, 9, 26],
  },

  9: {
    intro: "Printing the receipt is the safety net for everything that comes next.",
    subSteps: [
      { title: "Open the PDF you saved", body: "From fmjfee.com confirmation. Make sure the SEVIS ID and your name are clearly readable." },
      { title: "Print two color copies", body: "One for your interview folder, one as backup at home. Black-and-white is fine if color isn't available — clarity matters more." },
      { title: "Place in interview folder, top of stack", body: "The officer often glances at the SEVIS receipt before opening anything else. Top of the folder, after the DS-160 confirmation, is the order most officers expect." },
    ],
    documents: [
      { name: "SEVIS I-901 receipt (printed)", description: "Two clean printouts. Officer keeps one for some cases.", required: true },
    ],
    mistakes: [
      { title: "Showing it on your phone", body: "Phones are banned inside consulate windows. You must have paper." },
      { title: "Faded thermal print", body: "Receipts printed on receipt-tape paper fade in days. Use a regular laser/inkjet printer." },
    ],
    whyItMatters: "This is the single piece of paper that proves $350 reached the federal system. Without it, the visa officer cannot verify you exist in SEVIS.",
    relatedSteps: [8, 27],
  },

  10: {
    intro: "Your passport is the document everything else attaches to. Validity, blank pages, and condition all matter.",
    subSteps: [
      { title: "Check passport validity ≥ 6 months past intended stay", body: "Standard rule across most consulates. If your passport expires within 6 months of your F-1 end date, renew now — renewal can take 4–8 weeks in many countries." },
      { title: "Verify two blank visa pages", body: "Visa stamp goes on a full blank page. Some consulates also need a blank page next to it for stamps." },
      { title: "Inspect for damage", body: "Water marks, torn pages, peeling laminate — any of these can void the document. Replace before applying." },
      { title: "Gather supporting IDs", body: "National ID card, birth certificate (with translated English version if not English), any name-change documents." },
    ],
    documents: [
      { name: "Passport (current)", description: "Valid 6+ months past intended stay, 2 blank pages.", required: true },
      { name: "National ID / Aadhaar / equivalent", description: "Government photo ID matching the passport.", required: true },
      { name: "Birth certificate", description: "With certified English translation if not already in English.", required: false },
    ],
    mistakes: [
      { title: "Passport expiring soon", body: "If your passport expires within your intended F-1 stay, the consulate often issues a shorter visa or refuses." },
      { title: "Damaged passport", body: "Water-damaged or torn passports get rejected at the window. The interview never starts." },
    ],
    whyItMatters: "Your passport binds you to the visa. Any defect cascades into delays, partial visas, or refusal.",
    relatedSteps: [11, 14],
  },

  11: {
    intro: "Financial proof answers the officer's loudest question: who's paying, and is the money real?",
    subSteps: [
      { title: "Pull 6 months of bank statements", body: "Sponsor account (parent / self). Statements must show the account holder's full name, address, and a stable balance — not a spike right before applying." },
      { title: "Show ≥ 120% of the I-20 cost-of-attendance", body: "For one year of study (year 1 is the only year required). 120% buffer covers FX swings and unexpected fees." },
      { title: "Get an affidavit of support if not self-funded", body: "I-134 (US sponsor) or country-equivalent affidavit. Sponsor signs, swears to fund, attaches bank proof." },
      { title: "Liquid first, illiquid second", body: "Bank balances and FDs count strongly. Real estate, gold, or pension funds count weakly. Don't lead with illiquid assets." },
    ],
    documents: [
      { name: "Bank statements (6 months)", description: "Sponsor's account. PDF from the bank, not screenshots.", required: true },
      { name: "Affidavit of support", description: "Sponsor's notarized financial commitment.", required: true },
      { name: "Sponsor's salary / income proof", description: "Salary slips, ITRs, business income statements.", required: false },
      { name: "Loan sanction letter (if applicable)", description: "Education loan from a bank — must show approval and amount.", required: false },
    ],
    mistakes: [
      { title: "Last-minute balance dump", body: "A balance that jumps right before you apply screams 'borrowed for show'. Officers check trend, not just total." },
      { title: "Only illiquid assets", body: "Property worth $200k won't pay tuition next month. Officers want liquidity for at least year 1." },
      { title: "Mismatched name", body: "Sponsor's name must match passport, ITR, and bank statement exactly. Even a missing initial triggers questions." },
    ],
    whyItMatters: "Money problems are the #1 reason for F-1 refusals. A clean financial story removes the officer's biggest doubt before they have to ask.",
    relatedSteps: [13, 30],
  },

  12: {
    intro: "Academic records prove you're a real student, not a visa shopper.",
    subSteps: [
      { title: "Collect every transcript", body: "10th grade, 12th grade, undergrad (if applying for grad). Official copies — sealed by the institution if possible." },
      { title: "Get test scorecards", body: "TOEFL, IELTS, GRE, GMAT, SAT — original PDFs from the testing service. Print clean copies." },
      { title: "Translate non-English documents", body: "Use a certified translator. Attach the original + the translation, both signed by the translator with their stamp." },
      { title: "Organize chronologically", body: "Earliest to latest. Officer scans for trajectory: improving grades, consistent academic seriousness." },
    ],
    documents: [
      { name: "10th + 12th grade transcripts", description: "Or country equivalents. Sealed if possible.", required: true },
      { name: "Undergraduate transcript", description: "For grad applicants only.", required: false },
      { name: "TOEFL/IELTS scorecard", description: "Official PDF or paper, not a screenshot.", required: true },
      { name: "GRE/GMAT/SAT scorecard", description: "If your program required it.", required: false },
    ],
    mistakes: [
      { title: "Translation by a friend", body: "Officers want a certified translator's stamp. Friend translations get rejected." },
      { title: "Photocopies of photocopies", body: "Bring fresh prints. Faded copies suggest carelessness." },
    ],
    whyItMatters: "The officer needs a 30-second story: 'this student earned their way to this program'. Transcripts tell that story without you saying a word.",
    relatedSteps: [11, 28],
  },

  13: {
    intro: "Ties-to-home-country is the officer's other loud question: will you actually leave when school ends?",
    subSteps: [
      { title: "Document family ties", body: "Parents' employment letters, sibling school enrollments, marriage certificate (if applicable). Shows immediate-family roots staying behind." },
      { title: "Document economic ties", body: "Family business documents, owned property deeds, joint bank accounts, any future job offer or LOI tied to your return." },
      { title: "Document academic / professional ties", body: "Pre-acceptance letter to a home-country master's program (for undergrads). Employer's leave-of-absence letter (for working students)." },
      { title: "Prepare a 30-second 'why I return' story", body: "Specific: who you'll work for, where, doing what. Vague 'I love my country' fails." },
    ],
    documents: [
      { name: "Family property deeds", description: "Owned property in your home country.", required: false },
      { name: "Family employment proof", description: "Parents' / spouse's employment letters.", required: false },
      { name: "Return-job LOI or future-school admit", description: "Anything concrete tying you to a post-graduation plan at home.", required: false },
    ],
    mistakes: [
      { title: "Only listing 'family'", body: "Every applicant has family. Officers need specifics — what they do, where they live, why they matter to your return." },
      { title: "No economic anchor", body: "Without owned property, future job, or family business — the officer assumes you'll stay in the US." },
    ],
    whyItMatters: "F-1 is officially a non-immigrant visa. Without strong ties, the officer is legally required to assume immigrant intent and refuse.",
    relatedSteps: [11, 31],
  },

  14: {
    intro: "Visa photo specs are unforgiving. Wrong photo = no interview that day.",
    subSteps: [
      { title: "Find a US-visa-spec photo studio", body: "Studios near consulates know the spec by heart. Ask: '2x2 inch US visa photo, white background, taken within 6 months'." },
      { title: "Specifications to verify on print", body: "2×2 inches (51×51 mm). White or off-white background. Face direct to camera, neutral expression. Eyes open, mouth closed. No glasses. Head 1–1.375 inches from chin to crown." },
      { title: "Take 4 prints + the digital file", body: "Two paper copies for the interview folder, two backups. Digital JPEG (600×600 px min, < 240 KB) for the DS-160 upload." },
      { title: "Photo must be < 6 months old", body: "Same face the officer sees that day." },
    ],
    documents: [
      { name: "Visa photos (printed)", description: "4 prints, US-spec, taken within 6 months.", required: true },
      { name: "Visa photo (digital)", description: "JPEG for DS-160 upload.", required: true },
    ],
    mistakes: [
      { title: "Glasses on", body: "Universally rejected since 2016. Even thin frames cause re-takes." },
      { title: "Wrong size", body: "Many countries use 2×2 inch; some use 35×45 mm. US visa is the 2×2." },
      { title: "Old photo", body: "If you look meaningfully different than the photo, officer asks for a new one — costs you the day." },
    ],
    whyItMatters: "The photo is on every form. It's the first thing the officer sees on the DS-160 screen and the visa stamp. One bad shot delays everything.",
    relatedSteps: [20],
  },

  /* ------------------------------ PHASE 3 ------------------------------ */

  15: {
    intro: "CEAC (Consular Electronic Application Center) is the State Department portal that hosts the DS-160. One account per applicant.",
    subSteps: [
      { title: "Go to ceac.state.gov/genniv",
        body: "Bookmark this. It's the only correct URL.",
        link: { label: "CEAC DS-160", href: "https://ceac.state.gov/genniv" } },
      { title: "Pick the consulate location now", body: "First dropdown asks 'Location'. Choose the consulate you'll interview at (e.g. Mumbai, Chennai). Wrong consulate = restart the form." },
      { title: "Save your Application ID immediately", body: "Format: AA00ABC123. Write it down + save in three places. You'll need it every time you log back in." },
      { title: "Pick a security question you'll remember", body: "Mother's maiden name is the most-used. Whatever you pick — store the exact answer. Recovery without it is painful." },
    ],
    documents: [
      { name: "CEAC Application ID", description: "Saved + backed up. You can't recover the in-progress form without it.", required: true },
    ],
    mistakes: [
      { title: "Forgetting Application ID", body: "Without it, you can't resume the DS-160 and have to start over." },
      { title: "Wrong consulate", body: "If you pick the wrong city, you have to start a new DS-160 with the right one before scheduling." },
    ],
    whyItMatters: "CEAC is the federal portal — there is no offline DS-160. A bad account setup blocks every Phase 3 step.",
    relatedSteps: [16, 26],
  },

  16: {
    intro: "Personal info on the DS-160 must match your passport exactly. Every field.",
    subSteps: [
      { title: "Name fields", body: "Surname = last name as printed on passport. Given names = everything else, including middle names, exactly as printed. Don't 'normalize' spelling." },
      { title: "Date and place of birth", body: "Match your passport's data page exactly. If passport says 'INDIA', don't write 'IN' or 'Bharat'." },
      { title: "Other names used", body: "If you've ever gone by a different name (marriage, nickname formally used) — list it. Hiding triggers a fraud flag." },
      { title: "Sex marker", body: "Match your passport. Officers verify against the passport, not the DS-160." },
    ],
    mistakes: [
      { title: "Initials instead of full name", body: "If passport says 'AARAV KUMAR PATEL', the DS-160 must say so too — not 'A K Patel'." },
      { title: "Auto-translate", body: "Don't let translation tools alter your name. Write it manually, letter by letter, from passport." },
    ],
    whyItMatters: "Officers compare the DS-160 to your passport line by line. A mismatch is grounds for re-doing the form on the spot.",
    relatedSteps: [15, 17],
  },

  17: {
    intro: "Travel and US contact sections tell the officer where you'll be — fund, study, live.",
    subSteps: [
      { title: "Purpose of trip", body: "Select 'Academic / Language Student (F)'. F-1 specifically. F-2 is for dependents." },
      { title: "Intended date of arrival", body: "Use the program start date from your I-20 (or up to 30 days earlier — the legal entry window)." },
      { title: "Address where you'll stay in the US", body: "On-campus housing address, or the off-campus address you've locked. If unsure, use the university's main address — but be ready to explain at the interview." },
      { title: "Person/organization in the US who's paying", body: "Pick 'Self' if you're funded by family; pick the school if you have a full assistantship or scholarship." },
      { title: "Have you been to the US before?", body: "List every prior visit with dates. If you overstayed even once, talk to a lawyer before submitting — overstays trigger denials." },
    ],
    mistakes: [
      { title: "Vague address", body: "'University area' isn't an address. Pick a specific street and zip." },
      { title: "Forgetting old visits", body: "CBP keeps records. Lying about a prior visit is grounds for permanent bar." },
    ],
    whyItMatters: "Travel section drives the visa's validity dates. Errors mean a visa that doesn't cover your program.",
    relatedSteps: [16, 18],
  },

  18: {
    intro: "Family and education sections build the officer's picture of who you are.",
    subSteps: [
      { title: "Parents' info", body: "Names, dates of birth, current address. If a parent is deceased or estranged, mark that — don't leave blank." },
      { title: "Spouse / dependents", body: "If married, list spouse's full name and DOB. If they're applying for F-2, that's a separate DS-160 — but you both list each other." },
      { title: "Educational history", body: "Every institution since secondary school. Dates attended, course of study, address of institution. Match transcripts." },
      { title: "Current employer or school", body: "Most recent. If you're a fresh grad, list your most recent school again." },
    ],
    mistakes: [
      { title: "Skipping a degree", body: "If you have a diploma or short program, list it. Officers cross-check with transcripts." },
      { title: "Wrong dates", body: "Off-by-a-month dates are common but problematic — they suggest you don't know your own record." },
    ],
    whyItMatters: "Family + education tell the officer your story arc. A clean continuous story builds trust before you say a word.",
    relatedSteps: [17, 19],
  },

  19: {
    intro: "Work, training, and security questions are the most sensitive. Honesty is non-negotiable here.",
    subSteps: [
      { title: "Work history", body: "Last two employers with dates, role, address. For students, list internships and TA roles too." },
      { title: "Specialized skills", body: "Programming languages, lab techniques, manufacturing — list anything your program will build on." },
      { title: "Security questions: arrests, drug use, terrorism", body: "Answer truthfully. A 'yes' triggers extra processing, not automatic refusal. A 'no' followed by discovery = lifetime bar." },
      { title: "Prior visa refusals", body: "If you've been refused a US visa before — even a B1/B2 years ago — say yes and explain. Hiding it is the worst mistake possible." },
    ],
    mistakes: [
      { title: "Lying about prior refusal", body: "CCD keeps every refusal forever. Officers see them instantly. Lying = permanent bar." },
      { title: "'Forgetting' a minor arrest", body: "Even sealed/expunged records can show up. Disclose, explain — usually fine. Hide — always fatal." },
    ],
    whyItMatters: "This section is where most fraud denials originate. Truthful disclosure rarely refuses; lying always does.",
    relatedSteps: [18, 20],
  },

  20: {
    intro: "Upload the digital photo you took in Step 14. The form rejects most photos for spec reasons.",
    subSteps: [
      { title: "Format requirements", body: "JPEG, square, minimum 600×600 px, maximum 1200×1200 px, under 240 KB." },
      { title: "If rejected, request alternative path", body: "When CEAC rejects the digital upload, you can bring a printed photo to the interview instead. Mark the form's photo waiver checkbox." },
      { title: "Verify the photo on the next screen", body: "CEAC shows your uploaded photo. Look for crop issues — head must be centered, shoulders visible." },
    ],
    documents: [
      { name: "Visa photo (digital JPEG)", description: "From Step 14. < 240 KB, 600×600+.", required: true },
    ],
    mistakes: [
      { title: "Phone screenshot", body: "Compressed and color-shifted. Use the original from the photo studio." },
      { title: "Old photo", body: "If you look different, officer asks for a re-take on interview day." },
    ],
    whyItMatters: "The DS-160 photo prints on the confirmation page the officer holds. A bad photo means a bad first impression.",
    relatedSteps: [14, 21],
  },

  21: {
    intro: "Submit only when you've reviewed every page. After submit, fixing a field means starting a new DS-160.",
    subSteps: [
      { title: "Read the full preview", body: "Click 'Review' before submit. Scan all 12+ pages, especially name, DOB, and address." },
      { title: "Check spelling field by field", body: "Officers reject for spelling mismatches with passport. Catch them now." },
      { title: "Confirm consulate", body: "The consulate dropdown on page 1 — if wrong, do not submit. Make a new DS-160 with the correct one." },
      { title: "Submit + screenshot confirmation", body: "After submit, you get a confirmation page with a barcode. Screenshot it AND download the PDF AND print." },
    ],
    mistakes: [
      { title: "Submitting before review", body: "Once submitted, fields lock. A spelling error means starting over and re-uploading the photo." },
      { title: "Lost barcode page", body: "The barcode page is what the consulate scans. Without it the interview won't proceed." },
    ],
    whyItMatters: "A submitted DS-160 is a federal record. Errors are not just inconvenient — they're tied to your identity in the system.",
    relatedSteps: [22],
  },

  22: {
    intro: "The barcode page is what the consulate scans at the window. It's small but mission-critical.",
    subSteps: [
      { title: "Download the confirmation PDF", body: "After submit, CEAC offers a PDF labeled 'DS-160 Confirmation'. Save it." },
      { title: "Print two color copies", body: "Color printer preferred — the barcode reads better than black-and-white. Place the print at the top of your interview folder." },
      { title: "Verify the barcode scans", body: "Use any free barcode scanner app on a phone to confirm the barcode is readable before interview day." },
    ],
    documents: [
      { name: "DS-160 confirmation page (barcode)", description: "Two color printouts.", required: true },
    ],
    mistakes: [
      { title: "Faded barcode", body: "Low-ink prints fail at the scanner. Officer asks for a fresh print — costs you the day." },
      { title: "Wrong DS-160", body: "If you submitted multiple drafts, make sure the printed barcode matches your scheduled appointment's DS-160." },
    ],
    whyItMatters: "No barcode = no interview. This page is the consulate's primary lookup mechanism.",
    relatedSteps: [21, 23],
  },

  23: {
    intro: "Each country has its own visa-service contractor (CGI Federal in India, VFS Global elsewhere). Profile creation is separate from CEAC.",
    subSteps: [
      { title: "Find the right site for your country", body: "India: ais.usvisa-info.com/en-in. Brazil: ais.usvisa-info.com/en-br. UAE: similar structure. Search 'US visa appointment [country]' to find yours." },
      { title: "Create a profile with passport details", body: "Use the same name + DOB as on passport + DS-160. Mismatches block appointment booking." },
      { title: "Link your DS-160 barcode", body: "The site asks for your DS-160 confirmation number. Have the barcode page open." },
      { title: "Choose document delivery address", body: "Pick where your passport (with visa stamp) ships after approval. Home is most common; some pick a parent's office." },
    ],
    mistakes: [
      { title: "Using the wrong country site", body: "Profile won't link to a consulate in another country. Verify the URL ends with your country code." },
      { title: "Two profiles", body: "If you create a duplicate, fees get split and appointments fail to book." },
    ],
    whyItMatters: "This account is the only way to pay MRV fees, schedule biometrics, and book the interview. No account = stuck at Step 24.",
    relatedSteps: [24, 26],
  },

  24: {
    intro: "The MRV fee is the visa application fee. $185 USD for most non-immigrant visas as of 2026.",
    subSteps: [
      { title: "Generate the deposit slip from your profile", body: "On the visa appointment site, click 'Pay MRV fee'. Site generates a payment slip with a unique CGI/transaction reference." },
      { title: "Pick a payment method", body: "Bank deposit (NEFT in India, EFT abroad), credit card online, or in-person at partner banks. Card is fastest; settles in 4 hours." },
      { title: "Save the reference and receipt", body: "Reference number links your payment to the appointment. Receipt is the proof." },
      { title: "Wait 4+ hours after card payment, 1 business day after bank", body: "Booking the appointment before payment clears = 'No fee on file' error." },
    ],
    documents: [
      { name: "MRV fee receipt", description: "From the visa-info site or your bank.", required: true },
    ],
    mistakes: [
      { title: "Paying via wrong reference", body: "If the reference doesn't match your profile, the fee isn't credited. Re-pay needed." },
      { title: "Booking too soon", body: "Card payments take ~4 hours to reflect; bank deposits 1 business day. Booking before clearance fails." },
    ],
    whyItMatters: "Unpaid MRV = no appointment. You cannot interview without this fee cleared in the system.",
    relatedSteps: [25, 26],
  },

  25: {
    intro: "Some consulates require biometrics (fingerprints + photo) at a separate facility days before the interview.",
    subSteps: [
      { title: "Check if your country/age requires biometrics", body: "Most adult applicants in India, Brazil, China, Nigeria do. Some EU/UK consulates skip for repeat applicants." },
      { title: "Schedule biometrics from your profile", body: "On the same visa-info site, click 'Schedule appointment'. Biometrics goes first." },
      { title: "Pick a date 2+ days before interview", body: "Biometrics record must be in the system before the interview. Same-day biometrics is rarely allowed." },
      { title: "Print the biometrics appointment letter", body: "Bring it on the biometrics day with your passport." },
    ],
    documents: [
      { name: "Biometrics appointment letter", description: "Printed from the visa appointment site.", required: true },
    ],
    mistakes: [
      { title: "Booking biometrics after interview", body: "Wrong order — biometrics record must exist before the interview opens." },
      { title: "Forgetting passport at the biometrics center", body: "No passport, no biometrics. They turn you away." },
    ],
    whyItMatters: "Without biometrics on file, the interview is automatically cancelled.",
    relatedSteps: [40],
  },

  26: {
    intro: "The interview slot is the bottleneck. In peak months (May–August) consulates run out of slots weeks ahead.",
    subSteps: [
      { title: "Book as early as legally allowed", body: "Most consulates open the interview slot 120 days before your I-20 start date. Book the moment you can." },
      { title: "Choose morning slots if available", body: "Officers are fresher. Lines are shorter. Documents are reviewed more thoroughly (which is good when you've prepared)." },
      { title: "Confirm consulate matches DS-160", body: "If your DS-160 says Mumbai but you book Chennai — you'll be turned away. The two must match." },
      { title: "Print the appointment confirmation", body: "Two color prints. The barcode on this page is also scanned at the window." },
    ],
    documents: [
      { name: "Interview appointment confirmation", description: "Two color printouts.", required: true },
    ],
    mistakes: [
      { title: "Late booking", body: "In peak season, late = no slots. Apply for an emergency appointment only if you have a real emergency." },
      { title: "Mismatched consulate", body: "DS-160 + visa-info site + appointment letter must all show the same city." },
    ],
    whyItMatters: "No slot, no interview. No interview, no visa. This step gates everything downstream.",
    relatedSteps: [23, 24, 27],
  },

  /* ------------------------------ PHASE 4 ------------------------------ */

  27: {
    intro: "Folder order is the silent first impression. A messy folder makes the officer think your story is messy too.",
    subSteps: [
      { title: "Stack order, top to bottom", body: "1) DS-160 confirmation page. 2) Interview appointment confirmation. 3) SEVIS I-901 receipt. 4) I-20 (signed). 5) Passport on top of a separate pocket." },
      { title: "Second stack: financials", body: "Bank statements (oldest to newest), affidavit of support, sponsor's salary/ITR, loan letter if any." },
      { title: "Third stack: academic", body: "Admit letter, transcripts (10th, 12th, undergrad), test scorecards." },
      { title: "Fourth stack: ties-to-home + extras", body: "Property docs, return-job LOI, photos of family if culturally relevant. Officer rarely asks for these — but having them is the safety net." },
      { title: "Use a clear A4 folder with dividers", body: "Plastic file with tabbed dividers. Officer should be able to find any doc in 3 seconds." },
    ],
    documents: [
      { name: "Interview folder (organized)", description: "A4 plastic file with tabbed dividers, four stacks in order.", required: true },
    ],
    mistakes: [
      { title: "Stapled stacks", body: "Officers hate staples — they unstack the wrong way and waste time. Use paper clips at most." },
      { title: "No order", body: "If you fumble, the officer assumes you don't know your own application." },
    ],
    whyItMatters: "Officers have 90 seconds per applicant. A clean folder lets them find what they need fast. Fumbling = doubt.",
    relatedSteps: [39],
  },

  28: {
    intro: "The academic statement is a 30-second answer to: why this program, why this school, why now.",
    subSteps: [
      { title: "Open with the program, not the school", body: "'I'm pursuing an MS in Computer Science at NC State because their distributed-systems lab works on the exact problem I want to solve' — specific from word one." },
      { title: "Name two faculty + their work", body: "Mention two professors and one paper or project each. Shows real research, not ranking-chasing." },
      { title: "Tie to your prior work", body: "Connect your undergrad project / job to the program's strength. The officer sees continuity." },
      { title: "Keep it to 60 seconds spoken", body: "Officers cut you off after a minute. Make every second count." },
    ],
    documents: [
      { name: "Academic statement (notes)", description: "Bullet points — don't read from a script.", required: false },
    ],
    mistakes: [
      { title: "Generic 'good university'", body: "Every applicant says this. Means nothing. Officer tunes out." },
      { title: "Wrong faculty names", body: "If you can't pronounce them, don't name-drop. Officer will ask follow-up." },
    ],
    whyItMatters: "A specific academic statement separates real students from visa shoppers. Officers reward specificity.",
    relatedSteps: [29, 32],
  },

  29: {
    intro: "'Why this school over the others?' is the most-asked DS interview question. Document your reasoning.",
    subSteps: [
      { title: "Write a one-page comparison", body: "Top 3 schools that admitted you. Columns: program strength, cost, faculty match, location, funding. Marks where this school wins." },
      { title: "Lead with the unique-strength of your school", body: "The differentiator — capstone with regional industry, top-3 ranked lab in your subfield, professor whose work you cite." },
      { title: "Address the obvious counter", body: "If a more famous school admitted you, have a 5-second answer: 'X is broader; this school's program matches my goal more precisely'." },
    ],
    documents: [
      { name: "School comparison (one page)", description: "Your reasoning, in writing, in your interview folder.", required: false },
    ],
    mistakes: [
      { title: "'Ranking' as the only reason", body: "Officers reject ranking-only reasoning — it suggests poor fit." },
      { title: "Picking a school you can't defend", body: "If you can't articulate why this one, the officer wonders if you're really going to enroll." },
    ],
    whyItMatters: "The officer's job is to distinguish committed students from US-shoppers. A defended choice signals commitment.",
    relatedSteps: [28, 32],
  },

  30: {
    intro: "Funding is the officer's most-probed area. Your sponsor docs must answer who, how much, for how long.",
    subSteps: [
      { title: "Sponsor cover letter", body: "One page from your primary sponsor (usually a parent): 'I, [name], commit to funding [your name]'s F-1 studies for the full duration. Total commitment: $X. Source: [salary + savings + assets]'." },
      { title: "Bank balance summary", body: "Most-recent balance + 6-month average. If the average is much lower than the latest balance, that's a red flag — explain it (sale of FD, etc.)." },
      { title: "Salary + ITR", body: "Last 2 years of salary slips + 3 years of tax returns. Officers check trend more than peak." },
      { title: "Optional: education loan letter", body: "If using a loan, attach the bank's sanction letter. Loans often impress more than personal savings — they signal external validation." },
    ],
    documents: [
      { name: "Sponsor cover letter", description: "One page, signed.", required: true },
      { name: "Bank statements (6 months)", description: "Same as Step 11.", required: true },
      { name: "Salary / ITR", description: "Last 2 years salary + 3 years tax returns.", required: true },
      { name: "Loan sanction letter", description: "If applicable.", required: false },
    ],
    mistakes: [
      { title: "Mismatched names", body: "Sponsor's name on ITR, salary, bank — must all match. One missing initial triggers questions." },
      { title: "Borrowed balance", body: "A 6-month low balance with a spike right before applying screams 'borrowed for show'." },
    ],
    whyItMatters: "Officers refuse for 'insufficient financial evidence' more than any other reason. A clean sponsor file removes that risk.",
    relatedSteps: [11, 31],
  },

  31: {
    intro: "Return-to-home-country ties are the immigration intent question. Officers must see real anchors.",
    subSteps: [
      { title: "Document a concrete return plan", body: "Future-job LOI from a home-country employer. Acceptance to a home-country master's after the F-1 (for undergrads). Family business succession plan." },
      { title: "Document family + property", body: "Owned property in your name or parents'. Family business documents. Joint accounts. These read as 'roots'." },
      { title: "Prepare the 30-second 'why I return' answer", body: "Specific person, specific role, specific location. 'I'll work for my father's Mumbai-based manufacturing business as operations lead' beats 'I love India'." },
    ],
    documents: [
      { name: "Future-job LOI / home-country admit", description: "Concrete return commitment.", required: false },
      { name: "Property deeds", description: "Owned property at home.", required: false },
    ],
    mistakes: [
      { title: "Generic 'family' answer", body: "Every applicant has family. Officer needs specifics — what they do, where, why they matter to your return." },
      { title: "No tangible plan", body: "Without concrete return anchors, the officer is legally required to assume immigrant intent." },
    ],
    whyItMatters: "F-1 is non-immigrant. No ties = no visa. Period.",
    relatedSteps: [13, 30],
  },

  32: {
    intro: "Practice answering questions out loud. Reading them silently isn't practice.",
    subSteps: [
      { title: "Drill the 10 most-asked", body: "Why this school? Who's funding? What after graduation? Why this major? Why not study in home country? Have you been to the US? Family in the US? Plan B if visa refused? Ties to home? Plans after the program?" },
      { title: "Record yourself", body: "Phone voice memo. Listen back. Cut filler ('basically', 'you know'). Cut starts that don't answer ('so, like, when I was...')." },
      { title: "First sentence rule", body: "The first sentence must contain the answer. Backstory comes after." },
      { title: "Time yourself", body: "Most answers should be 20–40 seconds. Anything over a minute and the officer loses interest." },
    ],
    mistakes: [
      { title: "Memorizing scripts", body: "Officers spot scripted answers in 5 seconds. Practice the *content*, not the words." },
      { title: "No practice with strangers", body: "Practice with your bathroom mirror isn't real practice. Speak to friends, parents, a tutor." },
    ],
    whyItMatters: "The interview is 60–90 seconds. Practice turns it from a panic into a routine.",
    relatedSteps: [33, 34, 35],
  },

  33: {
    intro: "First mock interview reveals where your story falls apart. The goal isn't to pass — it's to find your weak spots.",
    subSteps: [
      { title: "Use GetStamped's voice mock", body: "Open the Mock Interview tool. Pick your scenario, length, officer style. Speak — don't type." },
      { title: "Don't skip questions you don't like", body: "The ones you avoid are the ones the real officer will ask." },
      { title: "Read the feedback report", body: "Three sections per answer: what worked, what to fix, a stronger rewrite. Take notes." },
      { title: "Identify your top 3 weak areas", body: "Common ones: vague funding, generic 'why this school', no concrete return plan." },
    ],
    mistakes: [
      { title: "Treating it as a one-and-done", body: "First mock should expose problems. Don't be discouraged — refine and run again." },
      { title: "Skipping silence", body: "If you don't know an answer, say so. 'Let me think' is better than a stumbling guess." },
    ],
    whyItMatters: "You only get one real interview. Mocks are the only place to fail cheaply.",
    relatedSteps: [32, 34, 35],
  },

  34: {
    intro: "Refining is where progress happens. Take the mock feedback and rewrite your weakest answers.",
    subSteps: [
      { title: "Rewrite your weakest 3 answers", body: "Funding, school choice, return plan — the most-probed three. Aim for the GetStamped 'better answer' style: one direct sentence + a concrete fact." },
      { title: "Cut every filler word", body: "'Basically', 'like', 'you know', 'so'. Each one signals nervousness. Officers hear them as uncertainty." },
      { title: "Tighten your funding story", body: "From 'my parents will pay' to 'my parents have funded both years from documented family savings; bank statements show 6-month stable balance of $X'." },
      { title: "Test out loud again", body: "Re-record. Listen. Tighten. Refining 3 answers tightens all of them." },
    ],
    mistakes: [
      { title: "Only re-reading, not re-speaking", body: "Reading a tighter answer doesn't put it in your mouth. Speak it 10 times." },
    ],
    whyItMatters: "The first draft of any answer is usually 30% too long. Refining is what makes it interview-grade.",
    relatedSteps: [33, 35],
  },

  35: {
    intro: "Second mock proves you've actually improved. Take it with a tougher officer style.",
    subSteps: [
      { title: "Set difficulty to 'tough' + officer to 'skeptical'", body: "Mirror the worst-case interview. If you pass this, the real one feels easy." },
      { title: "Re-run the same 10 questions", body: "Compare scores to mock 1. Look for: shorter answers, fewer fillers, sharper first sentences." },
      { title: "Stop refining once you score 70+ on all metrics", body: "Past 70 is diminishing returns. Sleep well instead." },
    ],
    mistakes: [
      { title: "Endless mocking", body: "After 3–4 sessions, marginal improvement drops to near-zero. Stop and rest." },
    ],
    whyItMatters: "Confidence comes from preparation, not from believing you're ready. Mocks build the muscle.",
    relatedSteps: [32, 33, 34],
  },

  36: {
    intro: "Interview-day logistics are the boring problems that ruin good preparation.",
    subSteps: [
      { title: "Map the consulate route + arrival time", body: "Arrive 30 minutes before appointment. Plan transport with traffic buffer. Most consulates open early — being late = automatic re-schedule." },
      { title: "Print the appointment letter + bring backup ID", body: "Don't rely on phone screenshots. Phones get confiscated at entry." },
      { title: "Know what you cannot bring", body: "Phones, smartwatches, USB drives, food, water bottles, large bags. All confiscated. Bring only the folder + passport + small wallet." },
      { title: "Plan a meal + bathroom before entry", body: "Once inside, you may wait 1–3 hours with no facilities." },
    ],
    mistakes: [
      { title: "Bringing a phone", body: "Most consulates have no locker. You leave it across the street, hope to find it later." },
      { title: "Cutting it close on time", body: "Late arrivals are sent home and forced to re-book." },
    ],
    whyItMatters: "Logistics failures can void months of prep in 30 minutes.",
    relatedSteps: [37, 41],
  },

  37: {
    intro: "Verify your consulate location and exact timing 48 hours before. Times sometimes change.",
    subSteps: [
      { title: "Log into the visa-info site", body: "Confirm the appointment is still listed at the same date + time + location." },
      { title: "Check the consulate's news page", body: "Strikes, weather, security incidents can shift appointments. The consulate's own site posts updates." },
      { title: "Save the consulate's emergency line", body: "If something happens day-of, you need a number to call." },
    ],
    mistakes: [
      { title: "Skipping the 48-hour check", body: "Consulates occasionally shift times by hours. Showing up at the old time = re-book." },
    ],
    whyItMatters: "A no-show wastes the MRV fee and adds weeks. A 48-hour verify takes 2 minutes.",
    relatedSteps: [26, 36],
  },

  38: {
    intro: "Dress like the role you're applying for: a serious student.",
    subSteps: [
      { title: "Business casual, conservative", body: "Collared shirt + trousers + closed shoes for men. Modest top + trousers/long skirt for women. Avoid bright logos." },
      { title: "Country-appropriate adjustments", body: "Some consulates expect formal (suit). Others accept smart-casual. Check your specific consulate's norms in advance — Mumbai is more relaxed than Chennai." },
      { title: "Test the outfit once", body: "Wear it for 4 hours sitting and standing. If something pinches or wrinkles, fix it now." },
      { title: "No jewelry beyond minimal", body: "Earrings + watch (analog only — smartwatches confiscated) are fine. Avoid statement pieces." },
    ],
    mistakes: [
      { title: "Brand-heavy attire", body: "Luxury logos can read as 'rich enough to immigrate'. Counter-intuitive but real." },
      { title: "Casual clothes", body: "T-shirts + jeans + sneakers tell the officer you don't take this seriously." },
    ],
    whyItMatters: "Officers form a first impression in 5 seconds. Clothing is half of that.",
    relatedSteps: [36],
  },

  39: {
    intro: "The night before — one last document sweep.",
    subSteps: [
      { title: "Top of folder: passport + DS-160 barcode + appointment letter + SEVIS receipt + I-20", body: "These five must be on top. The officer asks for them in this order most days." },
      { title: "Run the 4-stack check", body: "Originals + folder · Financials · Academic · Ties. Each stack has its divider tab visible." },
      { title: "Test the barcode", body: "Scan with a phone barcode app. If it doesn't read, re-print color." },
      { title: "Charge nothing — phones stay home", body: "Phones aren't allowed in. Leaving phones home prevents the temptation to bring them." },
    ],
    documents: [
      { name: "Complete interview folder", description: "Final, verified, organized.", required: true },
    ],
    mistakes: [
      { title: "Last-minute add", body: "Officers notice papers stuffed in at angles. Re-organize cleanly." },
    ],
    whyItMatters: "By tomorrow morning you should think about answers, not paperwork.",
    relatedSteps: [27, 40],
  },

  40: {
    intro: "Biometrics is short — fingerprints + photo. But it has its own checklist.",
    subSteps: [
      { title: "Bring the biometrics appointment letter + passport", body: "Both required. Other docs not needed." },
      { title: "Arrive 15 minutes early", body: "Centers are busy. Late arrivals often re-book." },
      { title: "No nail polish, no rings", body: "Rings can interfere with fingerprint scans. Nail polish doesn't matter at most centers but some flag it." },
      { title: "The whole thing takes 15–30 minutes", body: "Photo + 10 fingerprints + signature. You leave when done." },
    ],
    documents: [
      { name: "Biometrics appointment letter", description: "Printed.", required: true },
      { name: "Passport", description: "Same as visa appointment.", required: true },
    ],
    mistakes: [
      { title: "Bringing the full interview folder", body: "Not needed. Just the appointment letter + passport. Leave the rest at home." },
    ],
    whyItMatters: "Biometrics must be in the system before the interview. A failed biometrics = no interview.",
    relatedSteps: [25, 41],
  },

  /* ------------------------------ PHASE 5 ------------------------------ */

  41: {
    intro: "Interview day. The decision happens in 60–90 seconds.",
    subSteps: [
      { title: "Arrive 30 minutes early", body: "Pass through security, queue check-in, then biometrics verify, then to the interview window." },
      { title: "Hand the officer your DS-160 barcode + passport first", body: "These two open the system on their side. The rest you offer only when asked." },
      { title: "Make eye contact, answer the question asked", body: "Don't volunteer extra info. If asked 'why this school' answer that — don't drift into 'and also my parents...'." },
      { title: "Listen for the verdict words", body: "'Your visa is approved' = passport stays at consulate. '221(g) — we need more docs' = administrative processing, 1–8 weeks. 'I'm sorry, I can't approve' = refused — ask for the reason letter." },
    ],
    mistakes: [
      { title: "Over-explaining", body: "Long answers signal nervousness. Officer cuts you off after 60 seconds either way." },
      { title: "Arguing", body: "Officer's decision is final at the window. Arguing makes it worse. Take the refusal letter, leave, regroup." },
    ],
    whyItMatters: "This is the moment everything else was for. Be calm, direct, honest.",
    relatedSteps: [42],
  },

  42: {
    intro: "After approval, your passport goes to the consulate's printer. Track it through the visa-info site.",
    subSteps: [
      { title: "Note the tracking number", body: "Officer hands you a slip with a tracking reference. Save it." },
      { title: "Log into the visa-info site daily", body: "Status moves: 'At Embassy' → 'Issued' → 'Sent to Courier' → 'Out for Delivery'." },
      { title: "Expect 5–10 business days", body: "Faster in non-peak months. Up to 3 weeks in summer." },
      { title: "Plan to be at the delivery address", body: "Couriers require a signature. Missed delivery = re-attempt or pickup at depot." },
    ],
    mistakes: [
      { title: "Wrong delivery address", body: "If you set the wrong pickup address back in Step 23, contact the courier service ASAP — sometimes they redirect." },
    ],
    whyItMatters: "The passport is your physical proof. Without it you can't board the flight to the US.",
    relatedSteps: [43],
  },

  43: {
    intro: "Passport arrives with the visa stamped inside. Open it carefully — defects matter.",
    subSteps: [
      { title: "Verify the visa is present", body: "Look for the full-page color stamp with your photo, classification (F-1), validity dates, and number of entries." },
      { title: "Check the name spelling", body: "Letter by letter against your passport. Mismatches are rare but happen." },
      { title: "Check entry count", body: "Most F-1 visas are 'M' = multiple entries. Some are 'S' = single. Single-entry means you can't leave and re-enter without re-applying." },
      { title: "Check validity end date", body: "Must extend at least past your I-20 program start date. Ideally covers the full program." },
    ],
    mistakes: [
      { title: "Not checking immediately", body: "Errors are fixable within days. Catch them late and you may need a new appointment." },
    ],
    whyItMatters: "A typo on the visa is a federal record. Fix it now or live with it.",
    relatedSteps: [44],
  },

  44: {
    intro: "Verify every detail on the visa against your I-20 and passport.",
    subSteps: [
      { title: "Photo matches you", body: "Sometimes the wrong photo prints. Rare but it happens." },
      { title: "Surname + given names match passport exactly", body: "Same word order, same spellings." },
      { title: "Date of birth + place of birth", body: "Same as passport." },
      { title: "Visa classification = F-1", body: "Not F-2 (dependent) or J-1 (exchange)." },
      { title: "If anything is wrong, contact the consulate within 7 days", body: "Most consulates have a contact form on their visa-info site for 'visa stamp error'. Errors found within a week are usually fixed free." },
    ],
    mistakes: [
      { title: "Travelling on a wrong visa", body: "Even a typo can cause CBP issues at US entry. Fix at the consulate before you fly." },
    ],
    whyItMatters: "Visa errors detected at US entry = secondary inspection or refused entry. Catch them now.",
    relatedSteps: [43, 45],
  },

  45: {
    intro: "Pre-departure prep — book the flight, ship checked items, confirm housing.",
    subSteps: [
      { title: "Book your flight to arrive ≤ 30 days before program start", body: "F-1 holders may enter the US no earlier than 30 days before the I-20 start date. Earlier = denied entry." },
      { title: "Confirm housing", body: "On-campus contracts signed. Off-campus lease finalized. Have address printed for CBP entry." },
      { title: "Ship belongings or carry-on only", body: "Shipping books and clothes by sea = $300–$1000 depending on volume. Carry-on only = simpler." },
      { title: "Notify your bank you'll be in the US", body: "Otherwise foreign-card transactions get blocked on arrival." },
      { title: "Pack the immigration-day pouch", body: "Passport + visa + I-20 + SEVIS receipt + admission letter + financial proof + emergency cash. Carry-on, not checked. CBP can ask for any of these." },
    ],
    documents: [
      { name: "Flight booking", description: "Arrival ≤ 30 days before program start.", required: true },
      { name: "Housing confirmation", description: "Lease or on-campus contract.", required: true },
    ],
    mistakes: [
      { title: "Arriving too early", body: "31+ days before program start = denied entry. CBP enforces the 30-day rule strictly." },
      { title: "Packing visa documents in checked baggage", body: "Lost luggage = no documents at the CBP window = secondary inspection." },
    ],
    whyItMatters: "The visa gets you to the airport. Logistics get you across the line.",
    relatedSteps: [46],
  },

  46: {
    intro: "SEVIS validation is the federal check that you arrived and enrolled. Your DSO (Designated School Official) handles it.",
    subSteps: [
      { title: "Report to your school's DSO within 30 days of program start", body: "Most schools require check-in via an online portal or in-person at the international office." },
      { title: "Bring your passport, visa, I-20, and I-94", body: "I-94 is the digital arrival record. Print it from i94.cbp.dhs.gov after entry." },
      { title: "DSO marks you 'active' in SEVIS", body: "Until they do this, you're 'initial' status — and technically out of compliance if past 30 days." },
      { title: "Update SEVIS with your US address immediately", body: "Federal requirement: F-1 students must report address changes to SEVIS within 10 days." },
    ],
    documents: [
      { name: "I-94 record", description: "Print from i94.cbp.dhs.gov after US entry.", required: true },
    ],
    mistakes: [
      { title: "Skipping DSO check-in", body: "After 30 days, your SEVIS record auto-terminates. Re-instatement is painful." },
      { title: "Not updating address", body: "Address violations are minor on their own but compound — and immigration looks at the whole record at OPT/H1B time." },
    ],
    whyItMatters: "SEVIS validation is the federal record that you actually arrived and enrolled. Without it, your status lapses.",
    relatedSteps: [47],
  },

  47: {
    intro: "First-week-in-US essentials. The legal and practical setup that makes everything else work.",
    subSteps: [
      { title: "Apply for an SSN if you have on-campus employment", body: "Required for paid TA/RA roles, on-campus work. Bring offer letter + I-20 + passport to the local SSA office." },
      { title: "Open a US bank account", body: "Bring passport, I-20, proof of US address (lease, utility bill, school letter). Most major banks (Chase, BofA, Wells Fargo) offer student accounts." },
      { title: "Get a US phone number", body: "Mint Mobile / US Mobile / Visible give cheap plans. Some students keep their home number on roaming for the first week." },
      { title: "Activate health insurance", body: "Most schools auto-enroll. Verify with the international office. Without insurance, a single ER visit can run $10k+." },
      { title: "Attend international student orientation", body: "Usually mandatory in the first week. Covers SEVIS rules, work limits, travel rules. Skip it and you can lose status." },
    ],
    mistakes: [
      { title: "Delaying SSN application", body: "Without SSN, you can't be paid. On-campus jobs sit empty while paperwork drags." },
      { title: "Travelling outside the US in the first 30 days", body: "Risky. If your I-20 hasn't been signed for re-entry by your DSO, you may not be let back in." },
    ],
    whyItMatters: "Your first week sets the foundation. Skip the boring stuff and you'll fight for it later — when you have classes, work, and exams stacked on top.",
    relatedSteps: [46],
  },
};
