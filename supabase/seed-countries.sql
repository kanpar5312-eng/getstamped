-- =====================================================================
-- GetStamped — visa country seed data (run after 0002_country_aware.sql)
-- =====================================================================
-- Idempotent: every insert uses ON CONFLICT … DO UPDATE so the seed can
-- be re-run safely to refresh fee amounts, URLs, or copy edits.
--
-- IMPORTANT: every fee, threshold, processing-time, and government URL
-- is marked with a TODO(verify-before-launch: YYYY-MM-DD) at the literal.
-- Re-confirm against the official source before each release cycle.
-- ---------------------------------------------------------------------

-- =====================================================================
-- visa_countries
-- =====================================================================
-- TODO(verify-before-launch: 2026-06-17): processing_time_weeks and
--   official_portal_url for all 5 countries. These shift every cycle.
insert into public.visa_countries (code, name, visa_type, flag_emoji, processing_time_weeks, official_portal_url, currency_code)
values
  ('US', 'United States',   'F-1 Student Visa',          '🇺🇸',  4, 'https://travel.state.gov/content/travel/en/us-visas/study/student-visa.html', 'USD'),
  ('UK', 'United Kingdom',  'Student Visa (Tier 4)',     '🇬🇧',  3, 'https://www.gov.uk/student-visa',                                              'GBP'),
  ('CA', 'Canada',          'Study Permit',              '🇨🇦', 10, 'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit.html', 'CAD'),
  ('AU', 'Australia',       'Student Visa (Subclass 500)','🇦🇺',  6, 'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500', 'AUD'),
  ('DE', 'Germany',         'Student Visa (§16b)',       '🇩🇪',  8, 'https://www.auswaertiges-amt.de/en/visa-service/-/231148',                       'EUR')
on conflict (code) do update set
  name                  = excluded.name,
  visa_type             = excluded.visa_type,
  flag_emoji            = excluded.flag_emoji,
  processing_time_weeks = excluded.processing_time_weeks,
  official_portal_url   = excluded.official_portal_url,
  currency_code         = excluded.currency_code;

-- =====================================================================
-- COUNTRY: US / F-1  — 47 steps mirroring lib/steps.ts canonical
-- ---------------------------------------------------------------------
-- The hardcoded /lib/steps.ts remains the runtime source for US flows.
-- These rows exist so the dashboard's country pill and switcher
-- behave consistently across countries.
-- =====================================================================
insert into public.visa_steps (country_code, step_number, phase, phase_name, title, description, what_to_upload, deadline_offset_days, is_free_tier) values
  ('US',  1, 1, 'Before your I-20', 'Pick 6–10 target universities',                   'Build a balanced list — reach, target, safety. Match to your GPA, test scores, and budget.',                                'University shortlist (spreadsheet or doc)',  365, true),
  ('US',  2, 1, 'Before your I-20', 'Take TOEFL / IELTS / Duolingo',                   'Score above each school''s minimum. Most masters require TOEFL 90+ / IELTS 6.5+. Schedule early — slots fill 4–6 weeks out.', 'Score report (PDF)',                          330, true),
  ('US',  3, 1, 'Before your I-20', 'Take GRE / GMAT (if required)',                   'Required for many MS/MBA programs. Check each school — some are test-optional. Score 2 months before applications.',          'Score report (PDF)',                          300, true),
  ('US',  4, 1, 'Before your I-20', 'Draft SOP and recommendation letters',             'Write a tailored SOP per school. Line up 3 recommenders early — give them your CV and a draft of each prompt.',                'SOP drafts, LOR drafts',                       270, true),
  ('US',  5, 1, 'Before your I-20', 'Submit university applications',                  'Apply by each program''s deadline. Most fall-intake deadlines fall between Dec 1 and Jan 15.',                                 'Application confirmations',                    210, true),
  ('US',  6, 1, 'Before your I-20', 'Accept admit and pay enrollment deposit',         'Once admitted, pay the enrollment deposit by the deadline (usually $200–$1,000). University then issues your I-20.',          'Admit letter + deposit receipt',               180, true),
  -- Phase 2
  ('US',  7, 2, 'After I-20 arrival',  'Receive I-20 from DSO',                         'University''s DSO mails or e-mails the I-20. Verify every field — name, DOB, SEVIS ID, program dates.',                       'I-20 (signed by DSO)',                         150, false),
  ('US',  8, 2, 'After I-20 arrival',  'Sign the I-20 in blue ink',                     'Student signs on page 1. Parents sign if student is under 18. Use blue ink, scan a clean copy.',                              'Signed I-20 scan',                              148, false),
  -- TODO(verify-before-launch: 2026-06-17): SEVIS I-901 fee — currently $350.
  ('US',  9, 2, 'After I-20 arrival',  'Pay SEVIS I-901 fee',                           'Pay $350 at fmjfee.com using the SEVIS ID from your I-20. Save the receipt — you''ll need it at the interview.',           'SEVIS fee receipt (PDF)',                      145, false),
  ('US', 10, 2, 'After I-20 arrival',  'Gather identity documents',                     'Passport (6+ months validity), birth certificate, national ID, all in one folder.',                                          'Passport bio page, birth certificate',         140, false),
  ('US', 11, 2, 'After I-20 arrival',  'Get passport photos (2x2)',                     'White background, taken in last 6 months, ears + forehead visible, no glasses.',                                              'Passport photo JPG',                            138, false),
  ('US', 12, 2, 'After I-20 arrival',  'Gather academic documents',                     'Final transcripts, degree certificates, mark sheets — original + notarized copies.',                                          'Transcripts, degrees, mark sheets',            135, false),
  ('US', 13, 2, 'After I-20 arrival',  'Gather financial documents',                    'Bank statements covering tuition + living for year 1. Most consulates expect $30k–$70k liquid.',                              'Last 6 months bank statements',                130, false),
  ('US', 14, 2, 'After I-20 arrival',  'Get sponsor affidavit + sponsor docs',          'If parents fund: affidavit of support, their bank statements, tax returns, employment letter.',                               'Affidavit, sponsor financials',                128, false),
  ('US', 15, 2, 'After I-20 arrival',  'Loan sanction letter (if applicable)',          'If financing through a loan: sanction letter + first disbursement proof.',                                                   'Loan sanction PDF',                            125, false),
  ('US', 16, 2, 'After I-20 arrival',  'Scholarship / TA letter (if applicable)',       'If receiving funding from the university: official letter on letterhead with amount and duration.',                          'Scholarship / TA letter',                       123, false),
  ('US', 17, 2, 'After I-20 arrival',  'Compile property + ties-to-home evidence',      'Family property papers, business documents, return-ticket plans, future-employment letters — evidence you''ll come home.',  'Ties-to-home doc folder',                       120, false),
  -- Phase 3
  ('US', 18, 3, 'DS-160 and fees',     'Create CEAC account',                           'Sign up at ceac.state.gov. Save the application ID — losing it means restarting.',                                            'CEAC account screenshot',                       115, false),
  ('US', 19, 3, 'DS-160 and fees',     'Fill DS-160 (91 fields)',                       'Use your I-20, passport, and academic history. Triple-check every spelling against your passport.',                          'DS-160 confirmation page',                      108, false),
  ('US', 20, 3, 'DS-160 and fees',     'Upload DS-160 photo',                           'Same 2x2 photo standard as for the passport step. Upload fails if compression artifacts are visible.',                       'Same photo as step 11',                         107, false),
  ('US', 21, 3, 'DS-160 and fees',     'Submit DS-160 and print confirmation',          'Submit only after every field is double-checked. Print the barcode confirmation in color.',                                  'DS-160 confirmation barcode',                   105, false),
  -- TODO(verify-before-launch: 2026-06-17): MRV fee — currently $185.
  ('US', 22, 3, 'DS-160 and fees',     'Pay MRV visa fee ($185)',                       'Pay the visa application fee at the country-specific portal. Save the receipt — you can''t book without it.',                'MRV fee receipt',                              100, false),
  ('US', 23, 3, 'DS-160 and fees',     'Create USTravelDocs / consular account',        'This is where you book the appointment and pay if you haven''t already.',                                                    'Account screenshot',                             98, false),
  ('US', 24, 3, 'DS-160 and fees',     'Book OFC biometrics appointment',               'Required at most posts. Slot may be days or weeks before the consular interview.',                                          'OFC appointment letter',                         95, false),
  ('US', 25, 3, 'DS-160 and fees',     'Book consular interview',                       'Slots disappear in minutes during peak season. Have two device tabs ready and refresh from May 1.',                          'Interview appointment letter',                   85, false),
  ('US', 26, 3, 'DS-160 and fees',     'Print appointment + DS-160 + fee receipts',     'Bring a printed packet to the consulate — phones get confiscated at the entrance.',                                          'Printed appointment packet',                     80, false),
  ('US', 27, 3, 'DS-160 and fees',     'Recheck I-20 program dates',                    'If your start date shifted or you deferred, request a fresh I-20 before the interview.',                                     'Latest signed I-20',                             78, false),
  ('US', 28, 3, 'DS-160 and fees',     'Make backup digital copies',                    'Scan everything to cloud storage. The consulate is not where you want to discover a missing page.',                          'Document vault complete',                       75, false),
  -- Phase 4
  ('US', 29, 4, 'Interview preparation', 'Practice "Why this university"',              'Be specific: program, faculty, research, courses. Vague answers signal lack of intent.',                                    'Voice mock #1',                                  60, false),
  ('US', 30, 4, 'Interview preparation', 'Practice "Why this program / field"',        'Connect your past work to the program. Officers want a coherent story, not buzzwords.',                                    'Voice mock #2',                                  58, false),
  ('US', 31, 4, 'Interview preparation', 'Practice "How will you fund this"',          'Know your sponsor''s salary, your tuition, your living costs, your funding ratio. Numbers, not vibes.',                       'Voice mock #3 — financials',                     55, false),
  ('US', 32, 4, 'Interview preparation', 'Practice "Will you return home"',            'Family ties, property, future job, family business — concrete things waiting back home.',                                   'Voice mock #4 — ties',                           52, false),
  ('US', 33, 4, 'Interview preparation', 'Practice "Have you been refused before"',    'If yes — answer plainly with what changed. Lying is an immediate denial.',                                                  'Voice mock #5 — history',                        50, false),
  ('US', 34, 4, 'Interview preparation', 'Practice short answers (under 30s)',         'Most interviews are 3–7 minutes total. Long monologues hurt — officers want crisp answers.',                                'Voice mock #6 — pacing',                         48, false),
  ('US', 35, 4, 'Interview preparation', 'Rehearse with cold, neutral officer tone',   'Officers don''t smile or react. Practice with that tone so you don''t panic on the day.',                                    'Voice mock #7 — cold tone',                      45, false),
  ('US', 36, 4, 'Interview preparation', 'Dress + body language run-through',          'Business casual, no flashy accessories, look at the officer (camera), don''t lean in.',                                      'Dress code checklist',                           42, false),
  ('US', 37, 4, 'Interview preparation', 'Review every doc you will hand over',        'Know what each page is and where in the stack. Officers won''t wait while you fumble.',                                     'Document handoff order',                         38, false),
  ('US', 38, 4, 'Interview preparation', 'Plan travel to consulate',                   'Book a hotel the night before if the post is in a different city. Cabs to the consulate go fast at 6am.',                  'Travel + stay confirmation',                     30, false),
  ('US', 39, 4, 'Interview preparation', 'Final mock, full simulation',                'End-to-end 7-minute mock with strict officer tone. Score yourself honestly.',                                              'Voice mock #8 — final',                          21, false),
  ('US', 40, 4, 'Interview preparation', 'Pack interview kit night before',            'Passport, I-20, DS-160 barcode, SEVIS receipt, MRV receipt, appointment letter, financials, photos.',                       'Interview-day bag photo',                        2, false),
  -- Phase 5
  ('US', 41, 5, 'Post-approval',       'Attend interview',                              'Arrive 30 min early. Phones in locker. Greet officer, answer crisply, hand documents when asked.',                          'Interview outcome (approved / 221g)',             0, false),
  ('US', 42, 5, 'Post-approval',       'Drop passport for visa stamp',                  'Pickup or courier — most posts give you a tracking link. Visa is usually delivered in 5–10 days.',                          'Passport collection receipt',                    -2, false),
  ('US', 43, 5, 'Post-approval',       'Verify visa details once stamped',              'Name, DOB, photo, expiry, F-1 class. Any typo means an immediate revisit before you travel.',                                'Stamped visa scan',                              -7, false),
  ('US', 44, 5, 'Post-approval',       'Book flight (not earlier than 30 days pre)',   'F-1 holders cannot enter the US more than 30 days before the I-20 program start date.',                                    'Flight itinerary',                              -14, false),
  ('US', 45, 5, 'Post-approval',       'Buy student health insurance',                  'Most schools require their plan or proof of equivalent coverage. Get it set up before you fly.',                            'Insurance confirmation',                        -18, false),
  ('US', 46, 5, 'Post-approval',       'Pack + carry essentials in hand luggage',       'Passport with visa, I-20, SEVIS receipt, admission letter, financials. CBP can ask for any of them.',                        'Carry-on checklist',                            -20, false),
  ('US', 47, 5, 'Post-approval',       'Land + complete CBP entry',                     'I-94 record auto-generated. Show I-20 and visa. Welcome — you''re on F-1 status.',                                          'I-94 print-out',                                -25, false)
on conflict (country_code, step_number) do update set
  phase = excluded.phase, phase_name = excluded.phase_name, title = excluded.title,
  description = excluded.description, what_to_upload = excluded.what_to_upload,
  deadline_offset_days = excluded.deadline_offset_days, is_free_tier = excluded.is_free_tier;

-- ---------------------------------------------------------------------
-- US documents
-- ---------------------------------------------------------------------
insert into public.visa_documents
  (country_code, document_key, display_name, description, is_mandatory, ai_review_rules, common_mistakes, official_source_url) values
  ('US','passport','Valid passport',
   'Machine-readable passport valid 6+ months beyond intended stay in the US.', true,
   '{"check_expiry":true,"min_months_valid":6,"check_photo_page":true,"check_signature":true}'::jsonb,
   array['Passport expires within 6 months','Signature missing on signature page','Damaged or laminated bio page'],
   'https://travel.state.gov/'),
  ('US','i20','Form I-20',
   'Issued by your SEVP-certified school. Verify name, DOB, SEVIS ID, program dates, and DSO signature.', true,
   '{"check_student_name_match":true,"check_program_dates":true,"check_dso_signature":true,"check_sevis_id":true}'::jsonb,
   array['Student signature missing on page 1','Program start date already passed','DSO signature missing'],
   'https://studyinthestates.dhs.gov/students/get-started/the-form-i-20'),
  ('US','ds160','DS-160 confirmation',
   'Confirmation page with barcode after submitting the online non-immigrant visa application.', true,
   '{"check_barcode_visible":true,"check_name_match":true}'::jsonb,
   array['Barcode not visible','Name does not match passport','Photo upload rejected'],
   'https://ceac.state.gov/genniv/'),
  ('US','sevis_receipt','SEVIS I-901 fee receipt',
   'Receipt confirming the $350 SEVIS fee payment. SEVIS ID on the receipt must match the I-20.', true,
   '{"check_sevis_id_match":true,"check_payment_status":true}'::jsonb,
   array['SEVIS ID mismatch with I-20','Receipt printed before payment cleared'],
   'https://www.fmjfee.com/'),
  ('US','financial_proof','Financial proof',
   -- TODO(verify-before-launch: 2026-06-17): consular posts informally expect $20k+ for year 1; verify per post.
   'Bank statements, sponsor letters, or scholarship letters covering tuition + living for at least year 1.', true,
   '{"check_sufficient_funds":true,"min_amount_usd":20000,"check_account_holder_name":true,"check_statement_recency_days":90}'::jsonb,
   array['Statement older than 90 days','Sponsor name unclear','Single large deposit without origin'],
   'https://travel.state.gov/content/travel/en/us-visas/study/student-visa.html'),
  ('US','academic_transcripts','Academic transcripts and degree certificates',
   'Final transcripts and degree certificates from prior institutions, original + notarized copies.', true, null,
   array['Sealed envelope opened before consulate','Translated copy without notarization'],
   null),
  ('US','english_proficiency','English proficiency score report',
   'TOEFL, IELTS, Duolingo, or equivalent score report meeting the school''s minimum.', true, null,
   array['Score below program minimum','Report expired (2-year validity)'],
   null),
  ('US','passport_photo','Passport photo (2x2 inch)',
   'White background, taken in last 6 months, no glasses, ears + forehead visible.', true,
   '{"check_background_color":"white","check_dimensions":"2x2_inch","check_recency_months":6}'::jsonb,
   array['Shadow on face','Glasses worn','Background not white'],
   'https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/photos.html'),
  ('US','interview_confirmation','Visa appointment confirmation letter',
   'Printed appointment confirmation from USTravelDocs or consular portal.', true, null,
   array['Wrong post selected','Date is past'], null)
on conflict (country_code, document_key) do update set
  display_name = excluded.display_name, description = excluded.description,
  is_mandatory = excluded.is_mandatory, ai_review_rules = excluded.ai_review_rules,
  common_mistakes = excluded.common_mistakes, official_source_url = excluded.official_source_url;

-- ---------------------------------------------------------------------
-- US interview questions (15)
-- ---------------------------------------------------------------------
insert into public.visa_interview_questions
  (country_code, question_text, category, difficulty, why_asked, good_answer_signals, red_flag_signals) values
  ('US','Why this university?','university_choice','easy',
   'Officer checks whether you researched the school beyond rankings — programs, faculty, fit.',
   array['Names a specific program, professor, or lab','Connects offering to past coursework or work','Mentions specific courses or research areas'],
   array['Generic "top university" answer','Cannot name a single professor or course','Says "my agent picked"']),
  ('US','Why study in the US?','study_plan','medium',
   'Tests whether your decision is intentional vs. social pressure or migration intent.',
   array['Specific to the US system (e.g. research depth, industry access)','Comparison to home-country options','Career link is clear'],
   array['"For better life" alone','Vague "American dream" language','No comparison made']),
  ('US','What will you do after graduation?','post_study_plans','medium',
   'Probes whether you intend to return home — the F-1 is a non-immigrant visa.',
   array['Names a role or industry back home','Specific company or sector','Family business / parent business mentioned'],
   array['"Stay in the US if I can"','"Apply for H-1B"','No home-country plan at all']),
  ('US','Who is funding your education?','finances','easy',
   'Verifies financial story matches the bank documents you presented.',
   array['Names sponsor, relationship, occupation, and income','Mentions specific bank where funds sit','Matches affidavit on file'],
   array['"Family will manage"','Cannot name sponsor''s job','Numbers contradict bank statements']),
  ('US','Do you have family in the US?','ties_to_home','easy',
   'Family in the US is not disqualifying but officer checks it''s declared and consistent with the DS-160.',
   array['Honest disclosure, matches DS-160','Brief, factual'],
   array['Hiding a US-citizen sibling or spouse','Inconsistent with what was filed']),
  ('US','What does your father do?','finances','easy',
   'Verifies the income story — sponsor occupation should plausibly fund tuition + living.',
   array['Specific occupation, employer, years','Income range plausible vs. tuition'],
   array['Vague "business"','Income claim implausible for the role']),
  ('US','Why not study in your home country?','university_choice','medium',
   'Officer checks whether you considered home-country options and made a deliberate choice.',
   array['Specific gap home programs do not fill','Industry concentration mentioned','Research depth gap explained'],
   array['Generic "better quality"','Dismissive of home country','No home-country alternative considered']),
  ('US','What is your GPA?','study_plan','easy',
   'Quick verification of your transcripts; consistency check.',
   array['Specific number, matches transcripts'],
   array['Cannot recall','Contradicts transcript']),
  ('US','Have you applied to other countries?','study_plan','medium',
   'Probes whether the US is your first or fallback choice and how serious your commitment is.',
   array['Honest — yes or no — with reasoning','Explains why US over the other'],
   array['Caught lying about other applications','"It''s my only choice" with no reason']),
  ('US','Where will you live?','study_plan','easy',
   'Basic intent check — have you thought through arrival logistics.',
   array['On-campus / specific neighborhood','Family friend in city of study'],
   array['"I will figure it out"','Address in a different city from school']),
  ('US','What is your study plan?','study_plan','medium',
   'Officer wants to see a coherent academic arc — courses, year-by-year intent, capstone.',
   array['Year 1 / Year 2 specifics','Names electives or research focus','Capstone or thesis topic'],
   array['Cannot name a single course','"I will see when I get there"']),
  ('US','Will you work in the US after graduating?','post_study_plans','hard',
   'Direct probe of immigrant intent. The honest answer is OPT then home — frame it as a step, not a stay.',
   array['Mentions OPT briefly, then return-home plan','Names a role / company back home'],
   array['"I want to stay long-term"','"Try for green card"','No mention of returning home']),
  ('US','What ties do you have to your home country?','ties_to_home','medium',
   'Officer evaluates your incentive to return — family, property, job, family business.',
   array['Family-run business','Property, land, family responsibilities','Job offer / family company role waiting'],
   array['No ties named','Only parents named (officers want more)']),
  ('US','Have you ever been denied a US visa?','study_plan','medium',
   'Verifies disclosure consistency with the DS-160 history. Lying here is an immediate denial.',
   array['Honest disclosure with what changed','Matches DS-160 history exactly'],
   array['Hides a prior denial','Inconsistent with what was filed']),
  ('US','Show me your I-20 — explain your program to me.','study_plan','hard',
   'Tests whether you actually know your I-20 — program code, dates, funding listed on the form.',
   array['Walks officer through program, dates, funding line','Knows DSO and school by name'],
   array['Cannot read program code','Wrong start date','Doesn''t know DSO''s school'])
on conflict do nothing;

-- =====================================================================
-- COUNTRY: UK / Student Visa (Tier 4) — 38 steps
-- =====================================================================
insert into public.visa_steps (country_code, step_number, phase, phase_name, title, description, what_to_upload, deadline_offset_days, is_free_tier) values
  ('UK',  1, 1, 'Apply and get a CAS', 'Shortlist UK universities',                  'Pick a balanced list — Russell Group, post-92, conservatoires. Match programme, fees, and city budget.',         'University shortlist',                       280, true),
  ('UK',  2, 1, 'Apply and get a CAS', 'Take IELTS Academic / UKVI-approved test',   'Most undergrads need IELTS UKVI 6.0+, masters 6.5+. Use UKVI-approved centres for the SELT.',                     'IELTS UKVI score report (PDF)',              260, true),
  ('UK',  3, 1, 'Apply and get a CAS', 'Apply via UCAS (undergrad) or directly',     'UCAS deadlines: 15 Oct (Oxbridge/medicine) and 25 Jan (most). Postgrad applies directly to universities.',         'Application confirmations',                  220, true),
  ('UK',  4, 1, 'Apply and get a CAS', 'Receive offer and meet conditions',          'Conditional offers list what you must achieve before they convert to unconditional and issue a CAS.',             'Offer letter (PDF)',                         180, true),
  ('UK',  5, 1, 'Apply and get a CAS', 'Pay deposit and confirm acceptance',         'Deposit usually £1,000–£4,000. Once paid the university starts the CAS process.',                                 'Deposit receipt',                            160, true),
  ('UK',  6, 1, 'Apply and get a CAS', 'Receive CAS number',                         'CAS is your golden ticket. It expires 6 months from issue and can be used once. Verify every field.',             'CAS letter (PDF) with CAS number',           150, false),
  -- Phase 2
  -- TODO(verify-before-launch: 2026-06-17): IHS surcharge — currently £776/year for students.
  ('UK',  7, 2, 'Visa application', 'Calculate your IHS surcharge (£776/year)',     'Pay the Immigration Health Surcharge for the full visa length up front. Required before submitting application.',  'IHS calculation worksheet',                  140, false),
  -- TODO(verify-before-launch: 2026-06-17): student visa application fee — currently £524 (outside UK).
  ('UK',  8, 2, 'Visa application', 'Pay the £524 visa application fee',             'Pay during the online Student visa application. Save the receipt — needed at biometrics.',                         'Visa fee receipt',                           135, false),
  ('UK',  9, 2, 'Visa application', 'Start the Student visa application',           'Apply online at gov.uk/student-visa. You can submit up to 6 months before your course start date.',                 'Application reference (GWF/IHS)',            130, false),
  ('UK', 10, 2, 'Visa application', 'Pay IHS via the application portal',           'Pay the calculated IHS — gov.uk redirects you mid-application. Confirmation IHS number is stored on your account.',  'IHS confirmation number',                    128, false),
  -- Phase 3
  ('UK', 11, 3, 'Documents and biometrics', 'Gather identity documents',            'Passport, any prior BRPs, and national ID. Passport must be valid the entire intended stay.',                     'Passport bio scan',                          125, false),
  -- TODO(verify-before-launch: 2026-06-17): financial maintenance — £1,334/month London, £1,023 elsewhere, up to 9 months held 28 consecutive days.
  ('UK', 12, 3, 'Documents and biometrics', 'Save 28 days of financial maintenance', 'Hold the maintenance amount (£1,334 London / £1,023 elsewhere per month) for 28 consecutive days before applying.','Bank statement covering 28 days',            120, false),
  ('UK', 13, 3, 'Documents and biometrics', 'Print bank statements',                'Print statements showing the full 28-day window. Online screenshots are rejected — must be stamped or PDF from bank.','Stamped bank statements',                    118, false),
  ('UK', 14, 3, 'Documents and biometrics', 'Translate non-English documents',      'Any document not in English must come with a certified translation.',                                              'Translation certificates',                   115, false),
  ('UK', 15, 3, 'Documents and biometrics', 'Tuberculosis test (if listed country)','If you are from a TB-test-listed country, attend an IOM-approved clinic and get the cert.',                       'TB test certificate',                        110, false),
  ('UK', 16, 3, 'Documents and biometrics', 'ATAS clearance (if subject requires)', 'ATAS is required for some postgrad STEM subjects. Application takes 4–6 weeks — start early.',                     'ATAS certificate',                           105, false),
  ('UK', 17, 3, 'Documents and biometrics', 'Parental consent (if under 18)',       'Notarised parental consent letter + parent passport copies. Required only if you are under 18.',                   'Parental consent letter',                    100, false),
  ('UK', 18, 3, 'Documents and biometrics', 'Book biometrics / UKVCAS appointment', 'Book at a VFS or UKVCAS centre after submitting online. Bring printed application + all documents.',                'Biometrics confirmation',                     95, false),
  ('UK', 19, 3, 'Documents and biometrics', 'Attend biometrics appointment',        'Take fingerprints + photo. The centre uploads everything; you do not get documents back at the centre.',           'Submission acknowledgement',                  85, false),
  ('UK', 20, 3, 'Documents and biometrics', 'Upload supporting documents to UKVCAS','Some centres allow self-upload; others charge for assisted upload. Upload within 7 days of biometrics.',          'Upload confirmation',                         82, false),
  -- Phase 4
  ('UK', 21, 4, 'Decision and pre-departure', 'Track decision (3-week target)',      'Standard decisions are 3 weeks from biometrics. Priority/super-priority available for extra fee.',                'Status tracker screenshot',                   75, false),
  ('UK', 22, 4, 'Decision and pre-departure', 'Receive decision letter',             'You will receive a decision email + letter. If approved, the entry vignette is in your passport.',                 'Decision letter',                             60, false),
  ('UK', 23, 4, 'Decision and pre-departure', 'Review vignette accuracy',            'Vignette shows a 90-day travel window. Check name, DOB, dates — typos require return to UKVCAS.',                   'Vignette photo',                              55, false),
  ('UK', 24, 4, 'Decision and pre-departure', 'Arrange accommodation in the UK',     'Private rentals, university halls, or homestay. Confirm before booking flights.',                                    'Accommodation contract',                      45, false),
  ('UK', 25, 4, 'Decision and pre-departure', 'Set up GBP bank or wise account',     'Wise multi-currency is easiest pre-arrival; UK student accounts open on arrival with BRP.',                          'Wise / GBP account screenshot',               42, false),
  ('UK', 26, 4, 'Decision and pre-departure', 'Confirm flight inside 90-day window', 'You can enter the UK only inside the vignette window. Course start date is the latest you can land.',                  'Flight itinerary',                            40, false),
  ('UK', 27, 4, 'Decision and pre-departure', 'Pack documents for port of entry',    'Vignette passport, CAS letter, financials, accommodation. UK Border Force can ask for any of them.',                 'Carry-on document folder',                    30, false),
  ('UK', 28, 4, 'Decision and pre-departure', 'Plan BRP collection within 10 days',  'You must collect the BRP from the Post Office address on your decision letter within 10 days of arrival.',           'BRP collection plan',                         28, false),
  ('UK', 29, 4, 'Decision and pre-departure', 'Police registration (if required)',   'Some nationalities must register with the police within 7 days. Check the decision letter.',                          'Police-registration appointment',             26, false),
  ('UK', 30, 4, 'Decision and pre-departure', 'Pre-departure essentials list',       'Adaptor, warm clothing, 30-day medication, university documents, BRP collection letter.',                            'Packing list',                                24, false),
  -- Phase 5
  ('UK', 31, 5, 'Arrival and registration', 'Land at UK border',                     'Use the eGates if eligible or the staffed desk. Carry CAS + accommodation + financials in hand luggage.',             'Entry stamp / eGate screenshot',               0, false),
  ('UK', 32, 5, 'Arrival and registration', 'Collect BRP from the Post Office',      'Within 10 days of arrival, at the Post Office address on your decision letter. Bring passport.',                     'BRP collection receipt',                      -3, false),
  ('UK', 33, 5, 'Arrival and registration', 'Register with the university',          'Enrolment / induction at the international office. They confirm your visa with UKVI as your sponsor.',                'Enrolment confirmation',                      -7, false),
  ('UK', 34, 5, 'Arrival and registration', 'Police registration (if required)',     'Attend the booked appointment within 7 days of arrival. Bring passport + BRP.',                                      'Police registration certificate',             -10, false),
  ('UK', 35, 5, 'Arrival and registration', 'Open a UK student bank account',        'HSBC, Lloyds, Barclays student accounts — BRP + enrolment letter required.',                                         'Bank account confirmation',                   -12, false),
  ('UK', 36, 5, 'Arrival and registration', 'Register with a GP',                    'Register with a local NHS GP within the first 2 weeks. Take BRP + address proof.',                                   'GP registration confirmation',                -14, false),
  ('UK', 37, 5, 'Arrival and registration', 'Apply for National Insurance Number',   'Required if you plan to work part-time. Apply via gov.uk after arrival.',                                            'NINO application reference',                  -18, false),
  ('UK', 38, 5, 'Arrival and registration', 'Final BRP + status check',              'Verify BRP details, IHS coverage active in NHS records, sponsor relationship visible in your account.',               'Status verification screenshot',              -25, false)
on conflict (country_code, step_number) do update set
  phase = excluded.phase, phase_name = excluded.phase_name, title = excluded.title,
  description = excluded.description, what_to_upload = excluded.what_to_upload,
  deadline_offset_days = excluded.deadline_offset_days, is_free_tier = excluded.is_free_tier;

-- ---------------------------------------------------------------------
-- UK documents
-- ---------------------------------------------------------------------
insert into public.visa_documents
  (country_code, document_key, display_name, description, is_mandatory, ai_review_rules, common_mistakes, official_source_url) values
  ('UK','passport','Valid passport',
   'Passport must be valid for the entire intended stay in the UK.', true,
   '{"check_expiry":true,"check_photo_page":true,"check_signature":true}'::jsonb,
   array['Passport expires mid-course','Damaged bio page'],
   'https://www.gov.uk/student-visa'),
  ('UK','cas_letter','CAS letter',
   'Confirmation of Acceptance for Studies issued by your sponsor with a unique CAS number.', true,
   '{"check_cas_number_format":true,"check_expiry":true,"check_sponsor_licence":true}'::jsonb,
   array['CAS expired (6-month window)','CAS used for a previous unsuccessful application','Course start date passed'],
   'https://www.gov.uk/student-visa'),
  ('UK','financial_proof','Financial maintenance proof',
   -- TODO(verify-before-launch: 2026-06-17): £1,334 London / £1,023 elsewhere — confirm yearly.
   'Maintenance funds held for 28 consecutive days, ending no more than 31 days before application: £1,334/month London or £1,023/month elsewhere.',
   true,
   '{"check_28_day_rule":true,"check_sufficient_funds":true,"check_account_holder":true,"london_amount_gbp":1334,"non_london_amount_gbp":1023}'::jsonb,
   array['28-day rule not met','Statement older than 31 days at submission','Account not in applicant or parent name'],
   'https://www.gov.uk/student-visa/money'),
  ('UK','english_proficiency','English language proof',
   'IELTS UKVI Academic or equivalent Secure English Language Test (SELT) from an approved provider.', true,
   '{"check_test_type":"UKVI","check_score_minimum":true}'::jsonb,
   array['Non-UKVI IELTS submitted','Score below course requirement','Test more than 2 years old'],
   'https://www.gov.uk/government/publications/guidance-on-applying-for-uk-visa-approved-english-language-tests'),
  ('UK','atas_certificate','ATAS certificate',
   'Academic Technology Approval Scheme certificate — required for certain postgrad STEM subjects.', false,
   '{"check_subject_match":true,"check_validity_period":true}'::jsonb,
   array['Wrong subject code','Certificate expired'],
   'https://www.gov.uk/guidance/academic-technology-approval-scheme'),
  ('UK','tb_test','Tuberculosis test certificate',
   'Required for applicants from the TB-test-listed countries. Valid 6 months from issue.', false,
   '{"check_clinic_approval":true,"check_certificate_validity_days":180}'::jsonb,
   array['Test done at non-approved clinic','Certificate older than 6 months'],
   'https://www.gov.uk/tb-test-visa'),
  ('UK','academic_qualifications','Academic qualifications',
   'Degree certificates, transcripts, and any other qualifications the CAS lists as required.', true, null,
   array['Missing degree certificate','Transcript without seal'], null),
  ('UK','parental_consent','Parental consent (under 18)',
   'Notarised letter from both parents/guardians consenting to study + travel. Only required if applicant is under 18.', false,
   '{"required_if_age_under":18}'::jsonb,
   array['Single parent consent without sole-custody proof'], null)
on conflict (country_code, document_key) do update set
  display_name = excluded.display_name, description = excluded.description,
  is_mandatory = excluded.is_mandatory, ai_review_rules = excluded.ai_review_rules,
  common_mistakes = excluded.common_mistakes, official_source_url = excluded.official_source_url;

-- ---------------------------------------------------------------------
-- UK interview questions (12)
-- ---------------------------------------------------------------------
insert into public.visa_interview_questions
  (country_code, question_text, category, difficulty, why_asked, good_answer_signals, red_flag_signals) values
  ('UK','What is your CAS number?','study_plan','easy',
   'Verifies you know your own CAS and have not mixed up sponsors.',
   array['Exact CAS number, confirms sponsor'], array['Cannot recall','Wrong sponsor']),
  ('UK','What course are you studying?','study_plan','easy',
   'Quick verification of the offer.',
   array['Exact course title, mode, level'], array['Vague subject area','Wrong level']),
  ('UK','How long is your course?','study_plan','easy',
   'Tests whether you understand the visa duration.',
   array['Specific months/years matching CAS'], array['Cannot say','Mismatch with CAS']),
  ('UK','Where will you live in the UK?','study_plan','easy',
   'Tests practical preparation.',
   array['Named neighborhood / halls','Address confirmed in writing'], array['"I will figure it out"']),
  ('UK','How are you funding your studies?','finances','medium',
   'Verifies maintenance funds match the 28-day rule.',
   array['Specific monthly figure','Sponsor named with relationship','Bank holding funds'], array['Vague sources','Mismatch with statements']),
  ('UK','Have you studied in the UK before?','study_plan','medium',
   'History check — short-term studies can affect future Student visa cap.',
   array['Honest, with prior CAS / sponsor mentioned'], array['Hides previous study']),
  ('UK','What are your plans after your course ends?','post_study_plans','medium',
   'Officer wants to see a coherent post-study plan that includes returning home (or Graduate route briefly).',
   array['Mentions Graduate route + return-home plan','Names role / industry back home'], array['Open-ended "stay long-term" with no plan']),
  ('UK','Why did you choose this UK university?','university_choice','medium',
   'Tests genuine engagement vs. cheapest CAS available.',
   array['Specific programme strength, faculty, city'], array['"Easiest to get into"','No comparison vs. home']),
  ('UK','Do you have family in the UK?','ties_to_home','easy',
   'Disclosure check matching the application.',
   array['Honest, matches application'], array['Hidden family in the UK']),
  ('UK','What is your English language qualification?','english_proficiency','easy',
   'Verifies SELT type and score.',
   array['IELTS UKVI Academic with exact score','Above CAS minimum'], array['Non-UKVI test submitted']),
  ('UK','Have you ever been refused a UK visa?','study_plan','medium',
   'Disclosure consistency vs. immigration history.',
   array['Honest, explains what changed'], array['Hides prior refusal']),
  ('UK','What is your intended career after graduation?','post_study_plans','hard',
   'Probes credibility of the return / Graduate route plan.',
   array['Specific role + industry + market','Mentions home-country labour market'], array['"Whatever job I can get"'])
on conflict do nothing;

-- =====================================================================
-- COUNTRY: CA / Study Permit — 35 steps
-- =====================================================================
insert into public.visa_steps (country_code, step_number, phase, phase_name, title, description, what_to_upload, deadline_offset_days, is_free_tier) values
  ('CA',  1, 1, 'Apply and get an LOA',  'Shortlist DLIs (Designated Learning Institutions)', 'Only DLIs can sponsor a study permit. Check the DLI list before applying.',                                       'DLI shortlist (with DLI #s)',           260, true),
  ('CA',  2, 1, 'Apply and get an LOA',  'Take English / French proficiency test',            'IELTS / TOEFL / TEF / TCF. Match each school''s minimum and the program language.',                                'Score report',                          240, true),
  ('CA',  3, 1, 'Apply and get an LOA',  'Apply to DLIs',                                     'Apply directly to schools or via OUAC (Ontario undergrad). Most fall deadlines fall Dec–Mar.',                      'Application confirmations',             210, true),
  ('CA',  4, 1, 'Apply and get an LOA',  'Receive Letter of Acceptance (LOA)',                'LOA includes DLI number, program, start date, and tuition. Verify every field.',                                  'LOA (PDF)',                             180, false),
  ('CA',  5, 1, 'Apply and get an LOA',  'Quebec — apply for CAQ',                            'Only if studying in Quebec: apply via MIFI for the Certificate of Acceptance.',                                   'CAQ certificate',                       170, false),
  ('CA',  6, 1, 'Apply and get an LOA',  'Pay tuition deposit / first semester',              'Required for study-permit application strength; also feeds the PAL workflow.',                                    'Tuition payment receipt',               165, false),
  ('CA',  7, 1, 'Apply and get an LOA',  'Request Provincial Attestation Letter (PAL)',       'Most provinces require a PAL alongside the LOA — your DLI submits the request.',                                  'PAL / ePAL document',                   160, false),
  -- Phase 2
  ('CA',  8, 2, 'Online application',    'Create an IRCC online account',                     'Sign up at canada.ca/IRCC. Save the GCKey — losing it locks the file.',                                            'GCKey account screenshot',              150, false),
  ('CA',  9, 2, 'Online application',    'Complete IMM forms (1294, IMM 5645, etc.)',         'Fill electronically — typos cause processing delays.',                                                            'Completed IMM forms',                   145, false),
  ('CA', 10, 2, 'Online application',    'Write Statement of Purpose (SOP)',                  'Most provincial visas weight the SOP heavily — explain choice of program, school, and return-home plan.',          'SOP PDF',                               140, false),
  -- TODO(verify-before-launch: 2026-06-17): study permit processing fee — currently CAD $150.
  ('CA', 11, 2, 'Online application',    'Pay processing fee (CAD $150)',                     'Pay during submission. Biometrics fee is separate (CAD $85).',                                                    'Fee receipt',                           138, false),
  ('CA', 12, 2, 'Online application',    'Submit study permit application',                   'Upload LOA, PAL, SOP, financials, biometrics consent.',                                                           'Submission receipt',                    135, false),
  ('CA', 13, 2, 'Online application',    'Receive biometrics instructions',                   'IRCC emails the BIL (Biometric Instruction Letter) within days. Validity 30 days.',                                'BIL (PDF)',                             130, false),
  -- Phase 3
  ('CA', 14, 3, 'Biometrics + medical',  'Pay biometrics fee (CAD $85)',                      'Required for first-time applicants. Family rates apply.',                                                         'Biometrics receipt',                    125, false),
  ('CA', 15, 3, 'Biometrics + medical',  'Book biometrics at VAC',                            'Book at the closest Visa Application Centre. Bring BIL and passport.',                                            'Biometrics appointment',                120, false),
  ('CA', 16, 3, 'Biometrics + medical',  'Attend biometrics',                                 'Fingerprints + photo. Slot is ~15 minutes.',                                                                      'Biometrics confirmation',               110, false),
  ('CA', 17, 3, 'Biometrics + medical',  'Complete upfront medical exam (if required)',       'Required from designated countries. Use IRCC-panel physicians only.',                                            'Medical receipt + IMM 1017',            105, false),
  -- TODO(verify-before-launch: 2026-06-17): minimum CAD 20,635 outside Quebec; CAD 4,000 first dependent. Confirm each year.
  ('CA', 18, 3, 'Biometrics + medical',  'Prove funds — CAD 20,635 minimum',                  'Hold tuition + first-year living (CAD 20,635 outside Quebec). Bank statements or GIC.',                          'Bank statements / GIC certificate',     100, false),
  ('CA', 19, 3, 'Biometrics + medical',  'GIC for SDS — CAD 20,635',                          'Students Direct Stream uses a Guaranteed Investment Certificate at a designated bank.',                           'GIC purchase confirmation',              98, false),
  ('CA', 20, 3, 'Biometrics + medical',  'Police clearance (if requested)',                   'Some nationalities required to submit police certificates. Upload if requested by IRCC.',                          'Police clearance scan',                  90, false),
  ('CA', 21, 3, 'Biometrics + medical',  'Translate non-English/French documents',            'Use a certified translator; affidavit required for non-bilingual translators.',                                    'Translation certifications',             85, false),
  ('CA', 22, 3, 'Biometrics + medical',  'Final document review',                             'Make sure every page is legible, named, and complete before the IRCC officer reviews.',                            'Document checklist',                     80, false),
  -- Phase 4
  ('CA', 23, 4, 'Approval + arrival',    'Receive Port of Entry letter',                      'Approval letter (PoE letter) authorizing you to enter Canada and convert to study-permit.',                       'PoE letter (PDF)',                       65, false),
  ('CA', 24, 4, 'Approval + arrival',    'Update passport with visa counterfoil (if needed)', 'Visa-required nationals get a TRV counterfoil in their passport. Photo-required nationals: re-send passport.',     'Counterfoil scan',                       55, false),
  ('CA', 25, 4, 'Approval + arrival',    'Confirm accommodation',                             'On-campus, homestay, or off-campus rental. Lock before flying.',                                                  'Accommodation contract',                 45, false),
  ('CA', 26, 4, 'Approval + arrival',    'Book flight inside PoE validity',                   'Land in Canada before the PoE letter expires (commonly aligned with program start).',                              'Flight itinerary',                       40, false),
  ('CA', 27, 4, 'Approval + arrival',    'Get provincial health insurance gap coverage',      'Provincial coverage starts after a waiting period — bridge with private plan for first 3 months.',                  'Private health insurance confirmation',  35, false),
  ('CA', 28, 4, 'Approval + arrival',    'Pre-departure document pack',                       'PoE letter, LOA, PAL, financials, accommodation. Carry on the plane — checked bags get lost.',                     'Carry-on pack',                          25, false),
  -- Phase 5
  ('CA', 29, 5, 'Settling in',           'Land + activate study permit at PoE',               'Show PoE letter + LOA + PAL at CBSA. Officer prints and hands you the actual study permit.',                       'Study permit (printed at PoE)',           0, false),
  ('CA', 30, 5, 'Settling in',           'Activate GIC at the bank',                          'Visit the GIC bank branch with permit + passport to release funds in monthly installments.',                       'GIC activation receipt',                 -3, false),
  ('CA', 31, 5, 'Settling in',           'Apply for SIN',                                     'Required if working on/off campus. Apply at a Service Canada office.',                                              'SIN confirmation',                       -7, false),
  ('CA', 32, 5, 'Settling in',           'Register at the DLI',                               'Enrol formally so IRCC compliance reporting reflects your active status.',                                         'Enrolment confirmation',                -10, false),
  ('CA', 33, 5, 'Settling in',           'Open a CAD bank account',                           'Major banks have international student accounts. Use SIN + permit + ID.',                                          'Bank account confirmation',              -14, false),
  ('CA', 34, 5, 'Settling in',           'Apply for provincial health card',                  'Each province has its own application. Some have a waiting period from arrival.',                                 'Provincial health card application',     -18, false),
  ('CA', 35, 5, 'Settling in',           'Set up tax / CRA my-account',                       'Required for filing taxes, T2202, and tuition tax credits.',                                                       'CRA account confirmation',               -25, false)
on conflict (country_code, step_number) do update set
  phase = excluded.phase, phase_name = excluded.phase_name, title = excluded.title,
  description = excluded.description, what_to_upload = excluded.what_to_upload,
  deadline_offset_days = excluded.deadline_offset_days, is_free_tier = excluded.is_free_tier;

-- ---------------------------------------------------------------------
-- CA documents
-- ---------------------------------------------------------------------
insert into public.visa_documents
  (country_code, document_key, display_name, description, is_mandatory, ai_review_rules, common_mistakes, official_source_url) values
  ('CA','passport','Valid passport',
   'Passport valid for the entire intended study period in Canada.', true,
   '{"check_expiry":true,"check_photo_page":true}'::jsonb,
   array['Passport expires mid-permit','Damaged bio page'],
   'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit.html'),
  ('CA','loa','Letter of Acceptance (LOA)',
   'Issued by a DLI (Designated Learning Institution). DLI number, student name, and program dates must match the application.', true,
   '{"check_dli_number":true,"check_student_name":true,"check_program_start":true}'::jsonb,
   array['LOA from a non-DLI school','DLI number missing','Program start passed'],
   'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit/eligibility.html'),
  ('CA','pal','Provincial Attestation Letter (PAL/ePAL)',
   'Required by most provinces. Issued by the province/territory; some DLIs request on your behalf.', true,
   '{"check_province_code":true,"check_validity_period":true}'::jsonb,
   array['PAL not requested','Wrong province on the PAL'],
   'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit/get-documents.html'),
  ('CA','financial_proof','Proof of financial support',
   -- TODO(verify-before-launch: 2026-06-17): CAD $20,635 outside Quebec; CAD $4,000 first dependent.
   'Tuition + CAD $20,635 first-year living (outside Quebec). + CAD $4,000 per dependent. Statements within 90 days.',
   true,
   '{"check_sufficient_funds":true,"check_currency":"CAD","check_recency_days":90,"min_amount_cad":20635}'::jsonb,
   array['Funds in non-CAD without conversion proof','Statements older than 90 days','Single large deposit unexplained'],
   'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit/get-documents.html'),
  ('CA','sop','Statement of Purpose',
   'Written essay explaining program choice, school choice, and ties to home country.', true,
   '{"check_length_min_words":600,"check_personalisation":true}'::jsonb,
   array['Generic template SOP','No home-country plan'], null),
  ('CA','biometrics','Biometrics confirmation',
   'BIL + completed VAC biometrics. Required for first-time applicants.', true, null,
   array['BIL expired','Biometrics not yet completed'], null),
  ('CA','caq','Quebec Acceptance Certificate (CAQ)',
   'Required only if studying in Quebec. Issued by MIFI.', false,
   '{"required_if_province":"QC"}'::jsonb, array['Wrong issue date','Mismatch with LOA program'],
   'https://www.quebec.ca/en/immigration/students'),
  ('CA','medical','Medical exam results',
   'Upfront medical from IRCC panel physician if from designated country or applying for 6+ months.', false,
   '{"check_panel_physician":true,"check_validity_period":true}'::jsonb,
   array['Medical from non-panel physician','Older than 12 months'],
   'https://www.canada.ca/en/immigration-refugees-citizenship/services/protected-persons-asylum-claimants/medical-exams.html'),
  ('CA','police_clearance','Police clearance certificate',
   'Required if requested by IRCC; some nationalities required by default.', false, null,
   array['Local clearance instead of national','Older than 6 months'], null),
  ('CA','language_proof','English/French proficiency',
   'IELTS/TOEFL/TEF/TCF score report. SDS stream requires IELTS overall 6.0+ (per band).', true,
   '{"check_test_type":true,"check_score_minimum":true}'::jsonb,
   array['Below SDS minimum','Test expired'], null)
on conflict (country_code, document_key) do update set
  display_name = excluded.display_name, description = excluded.description,
  is_mandatory = excluded.is_mandatory, ai_review_rules = excluded.ai_review_rules,
  common_mistakes = excluded.common_mistakes, official_source_url = excluded.official_source_url;

-- ---------------------------------------------------------------------
-- CA interview questions (12)
-- ---------------------------------------------------------------------
insert into public.visa_interview_questions
  (country_code, question_text, category, difficulty, why_asked, good_answer_signals, red_flag_signals) values
  ('CA','Why Canada for your studies?','study_plan','medium',
   'Officer wants to see deliberate choice over alternatives, with specifics.',
   array['Names program strength / co-op / research','Specific to Canada vs. US/UK'], array['"Easier to get PR"','Generic answer']),
  ('CA','Which DLI are you attending?','study_plan','easy',
   'Verifies you know the school + DLI number.',
   array['Exact DLI name + number'], array['Cannot recall','Wrong DLI']),
  ('CA','What is your study program and duration?','study_plan','easy',
   'Quick verification of LOA.',
   array['Exact program + length matching LOA'], array['Vague program','Wrong duration']),
  ('CA','How will you fund your education and living expenses?','finances','medium',
   'Tests that financial plan covers tuition + CAD $20,635 + dependents.',
   array['Tuition + GIC + sponsor income with numbers'], array['"Family will figure it out"','Single deposit unexplained']),
  ('CA','What are your ties to your home country?','ties_to_home','medium',
   'Officer checks intent to return after studies.',
   array['Family business / property / job waiting','Specific roles back home'], array['"Nothing keeping me there"','No ties named']),
  ('CA','Do you plan to apply for PR after studying?','post_study_plans','hard',
   'Direct probe of immigration intent. Mention PGWP briefly + home-return plan is safer.',
   array['Mentions PGWP as a step + return-home plan','Specific role back home'], array['"My main goal is PR"','No mention of returning home']),
  ('CA','Where will you live in Canada?','study_plan','easy',
   'Tests preparation.',
   array['Named neighborhood / residence / homestay'], array['"I will find on arrival"']),
  ('CA','Do you have family in Canada?','ties_to_home','easy',
   'Disclosure check.',
   array['Honest, matches application'], array['Hides family in Canada']),
  ('CA','Have you studied abroad before?','study_plan','medium',
   'History check.',
   array['Honest disclosure with school + dates'], array['Hides prior studies']),
  ('CA','What will you do with your degree back home?','post_study_plans','medium',
   'Tests coherence of return plan.',
   array['Specific role / industry / family business'], array['"I will see"']),
  ('CA','Have you ever been refused a Canadian visa?','study_plan','medium',
   'Disclosure consistency.',
   array['Honest, explains what changed'], array['Hides prior refusal']),
  ('CA','Do you speak French?','english_proficiency','easy',
   'Relevant for Quebec applicants and bilingual programs.',
   array['Honest level — DELF / TEF score if any'], array['Overclaims fluency without proof'])
on conflict do nothing;

-- =====================================================================
-- COUNTRY: AU / Student Visa Subclass 500 — 32 steps
-- =====================================================================
insert into public.visa_steps (country_code, step_number, phase, phase_name, title, description, what_to_upload, deadline_offset_days, is_free_tier) values
  ('AU',  1, 1, 'Apply and get a CoE',  'Shortlist CRICOS-registered providers',     'Only CRICOS providers can sponsor Subclass 500. Verify the CRICOS code on each shortlist entry.',                'Provider shortlist (with CRICOS codes)', 250, true),
  ('AU',  2, 1, 'Apply and get a CoE',  'Take English proficiency test',             'IELTS 5.5+ / TOEFL iBT 46+ / PTE Academic 42+. Bands matter — many providers want 6.0 per band.',                'Score report',                           230, true),
  ('AU',  3, 1, 'Apply and get a CoE',  'Apply to CRICOS providers',                 'Apply directly or via an agent. Provide academic transcripts + English score + passport.',                       'Application confirmations',              210, true),
  ('AU',  4, 1, 'Apply and get a CoE',  'Receive offer letter',                      'Conditional or unconditional offer. Conditions usually involve final scores or OSHC.',                            'Offer letter (PDF)',                     180, true),
  ('AU',  5, 1, 'Apply and get a CoE',  'Accept offer + pay deposit',                'Deposit varies AUD 4,000–10,000 typically. Provider issues CoE after deposit clears.',                            'Deposit receipt',                        165, true),
  ('AU',  6, 1, 'Apply and get a CoE',  'Receive Confirmation of Enrolment (CoE)',   'CoE includes CoE number, course start/end, tuition, and CRICOS code. Verify everything.',                          'CoE (PDF)',                              150, false),
  -- Phase 2
  ('AU',  7, 2, 'ImmiAccount + GTE',     'Create an ImmiAccount',                     'Sign up at immi.homeaffairs.gov.au. ImmiAccount is the home for the application + documents + decisions.',     'ImmiAccount screenshot',                 140, false),
  ('AU',  8, 2, 'ImmiAccount + GTE',     'Write your Genuine Temporary Entrant (GTE) statement', 'Address ties to home, choice of course, choice of provider, value of course, and post-study plan. 300+ words.', 'GTE statement (PDF)',                    135, false),
  -- TODO(verify-before-launch: 2026-06-17): Subclass 500 visa application charge — currently AUD $1,600.
  ('AU',  9, 2, 'ImmiAccount + GTE',     'Pay visa application charge (AUD $1,600)',  'Pay during application submission. Family members add additional charges.',                                       'Visa fee receipt',                       130, false),
  ('AU', 10, 2, 'ImmiAccount + GTE',     'Complete Subclass 500 online form',         'Fill carefully — the form auto-checks CoE + provider + dates.',                                                  'Application reference',                  128, false),
  -- Phase 3
  ('AU', 11, 3, 'Health + biometrics',   'Generate HAP ID',                            'Health Assessment ID issued by Home Affairs. Use it at a panel clinic for the medical exam.',                    'HAP ID confirmation',                   120, false),
  ('AU', 12, 3, 'Health + biometrics',   'Complete health examination',                'Panel-physician exam: chest X-ray + medical. Required from most countries.',                                     'Medical receipt + HAP results',          115, false),
  ('AU', 13, 3, 'Health + biometrics',   'Attend biometrics (if requested)',          'Biometrics required from certain countries. Use a VFS centre.',                                                  'Biometrics receipt',                     110, false),
  ('AU', 14, 3, 'Health + biometrics',   'Purchase Overseas Student Health Cover (OSHC)','Mandatory for the duration of the visa. Buy from Bupa / Medibank / Allianz / nib / AHM.',                       'OSHC certificate',                       105, false),
  -- TODO(verify-before-launch: 2026-06-17): financial capacity — AUD $29,710 living/year + AUD $10,394 partner + AUD $4,449 child. Confirm.
  ('AU', 15, 3, 'Health + biometrics',   'Prove financial capacity',                   'Tuition + AUD $29,710 living / year + dependents. Bank statements or scholarship letter.',                       'Bank statement / scholarship letter',    100, false),
  ('AU', 16, 3, 'Health + biometrics',   'Upload supporting documents',                'CoE, GTE, OSHC, financials, English score, transcripts, passport, birth certificate.',                            'Document upload confirmation',            95, false),
  ('AU', 17, 3, 'Health + biometrics',   'Police clearance (if requested)',           'Required from some nationalities.',                                                                              'Police clearance scan',                   90, false),
  ('AU', 18, 3, 'Health + biometrics',   'Translate non-English documents',           'NAATI-certified translation for any non-English document.',                                                      'Translation certifications',              85, false),
  -- Phase 4
  ('AU', 19, 4, 'Decision + pre-departure', 'Track decision in ImmiAccount',          'Standard processing ~6 weeks; can be faster.',                                                                  'Status screenshot',                       75, false),
  ('AU', 20, 4, 'Decision + pre-departure', 'Receive grant notification',             'Grant letter is digital — your visa is electronically linked to the passport (no sticker).',                    'Grant letter (PDF)',                      65, false),
  ('AU', 21, 4, 'Decision + pre-departure', 'Check visa conditions (8105, 8202, etc.)','Conditions limit working hours, course changes, and notification rules. Read them.',                              'Conditions checklist',                    55, false),
  ('AU', 22, 4, 'Decision + pre-departure', 'Lock accommodation',                     'On-campus, homestay, or share-house. Confirm before flying.',                                                    'Accommodation contract',                  45, false),
  ('AU', 23, 4, 'Decision + pre-departure', 'Book flight inside visa start',          'Most visas allow entry ~90 days before course start.',                                                            'Flight itinerary',                        40, false),
  ('AU', 24, 4, 'Decision + pre-departure', 'Pre-departure document folder',          'Grant letter, CoE, OSHC, financials, accommodation. Border Force can ask for any of them.',                       'Carry-on folder',                         30, false),
  ('AU', 25, 4, 'Decision + pre-departure', 'Set up AU bank account (online)',        'Most majors allow online opening from overseas — activate on arrival with passport.',                            'Bank account confirmation',               25, false),
  -- Phase 5
  ('AU', 26, 5, 'Arrival + setup',       'Land + clear SmartGate / officer',          'eVisitor / Subclass 500 use SmartGate for many nationalities. Otherwise show grant letter + CoE.',               'Entry stamp / eGate screenshot',           0, false),
  ('AU', 27, 5, 'Arrival + setup',       'Activate OSHC card',                        'Visit health-fund app/site to activate. OSHC card required for Medicare-style claims.',                          'OSHC activation screenshot',              -3, false),
  ('AU', 28, 5, 'Arrival + setup',       'Get a TFN (Tax File Number)',               'Required if working part-time. Apply via ATO website after arrival.',                                            'TFN confirmation',                        -7, false),
  ('AU', 29, 5, 'Arrival + setup',       'Activate bank account at branch',           'Walk into the chosen bank branch with passport + grant letter. Get the debit card.',                            'Bank activation receipt',                -10, false),
  ('AU', 30, 5, 'Arrival + setup',       'Register at provider',                      'Enrol formally so Home Affairs sees you as actively studying.',                                                 'Enrolment confirmation',                 -14, false),
  ('AU', 31, 5, 'Arrival + setup',       'Buy a local SIM',                           'Optus / Telstra / Vodafone — passport + accommodation address.',                                                'SIM activation screenshot',              -18, false),
  ('AU', 32, 5, 'Arrival + setup',       'Final visa-conditions checklist',           'Re-read 8202 (full-time study) and 8501 (health cover). Stay compliant from day 1.',                            'Conditions sign-off',                    -25, false)
on conflict (country_code, step_number) do update set
  phase = excluded.phase, phase_name = excluded.phase_name, title = excluded.title,
  description = excluded.description, what_to_upload = excluded.what_to_upload,
  deadline_offset_days = excluded.deadline_offset_days, is_free_tier = excluded.is_free_tier;

-- ---------------------------------------------------------------------
-- AU documents
-- ---------------------------------------------------------------------
insert into public.visa_documents
  (country_code, document_key, display_name, description, is_mandatory, ai_review_rules, common_mistakes, official_source_url) values
  ('AU','passport','Valid passport',
   'Passport valid for the visa''s full intended duration.', true,
   '{"check_expiry":true,"check_photo_page":true}'::jsonb,
   array['Passport expires mid-course','Damaged bio page'],
   'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500'),
  ('AU','coe','Confirmation of Enrolment (CoE)',
   'Issued by your CRICOS-registered provider. CoE number + provider CRICOS + dates must match.', true,
   '{"check_coe_number":true,"check_provider_cricos":true,"check_student_name":true}'::jsonb,
   array['CoE expired','Wrong CRICOS code','Course start date passed'], null),
  ('AU','gte_statement','GTE statement',
   'Genuine Temporary Entrant statement — written. Address ties, course choice, provider choice, post-study plan.', true,
   '{"check_length_min_words":300,"check_personalisation":true}'::jsonb,
   array['Generic template','No home-country plan','Less than 300 words'],
   'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500/genuine-temporary-entrant'),
  ('AU','financial_proof','Financial capacity proof',
   -- TODO(verify-before-launch: 2026-06-17): AUD $29,710 living/year + AUD $10,394 partner + AUD $4,449 child. Confirm.
   'Tuition + AUD $29,710 living/year + dependent costs. Bank statements or scholarship letter.', true,
   '{"check_sufficient_funds":true,"check_currency":"AUD","min_living_amount_aud":29710}'::jsonb,
   array['Single large deposit unexplained','Statement older than 90 days'],
   'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500'),
  ('AU','oshc','Overseas Student Health Cover (OSHC)',
   'Mandatory health cover for the visa''s full duration.', true,
   '{"check_coverage_start_before_arrival":true,"check_coverage_duration":true}'::jsonb,
   array['OSHC short of visa duration','Wrong start date'], null),
  ('AU','health_examination','Health examination results',
   'Panel-physician exam tied to your HAP ID.', true,
   '{"check_panel_physician":true,"check_hap_id_match":true}'::jsonb,
   array['Non-panel physician used','HAP ID mismatch'],
   'https://immi.homeaffairs.gov.au/help-support/meeting-our-requirements/health'),
  ('AU','english_proficiency','English proficiency score report',
   'IELTS 5.5+ / TOEFL 46+ / PTE 42+ per Home Affairs. Provider minimum can be higher.', true,
   '{"check_test_type":true,"check_score_minimum":true}'::jsonb,
   array['Test expired','Score below provider minimum'], null),
  ('AU','academic_transcripts','Academic transcripts',
   'Final transcripts + degree certificates from prior institutions.', true, null,
   array['Missing official seal','Translation without NAATI cert'], null),
  ('AU','birth_certificate','Birth certificate',
   'Required for identity confirmation and family unit checks.', true, null,
   array['Sibling/parent details missing','Translation without NAATI cert'], null)
on conflict (country_code, document_key) do update set
  display_name = excluded.display_name, description = excluded.description,
  is_mandatory = excluded.is_mandatory, ai_review_rules = excluded.ai_review_rules,
  common_mistakes = excluded.common_mistakes, official_source_url = excluded.official_source_url;

-- ---------------------------------------------------------------------
-- AU interview questions (12)
-- ---------------------------------------------------------------------
insert into public.visa_interview_questions
  (country_code, question_text, category, difficulty, why_asked, good_answer_signals, red_flag_signals) values
  ('AU','What is your GTE statement?','study_plan','medium',
   'Officer wants to see you know your own GTE — ties, course, provider, post-study plan.',
   array['Summarises GTE clearly','Matches what was submitted'], array['Cannot describe','Mismatches submission']),
  ('AU','Why Australia over other study destinations?','study_plan','medium',
   'Tests considered choice vs. visa convenience.',
   array['Specific reasons — industry / research / lifestyle','Comparison made'], array['"PR pathway" alone']),
  ('AU','Which university and course are you enrolled in?','study_plan','easy',
   'Verifies CoE.',
   array['Exact provider + course + level'], array['Vague program']),
  ('AU','What is your CoE number?','study_plan','easy',
   'Quick verification.',
   array['Exact CoE number'], array['Cannot recall']),
  ('AU','How are you financing your studies?','finances','medium',
   'Tests financial capacity calculation matches docs.',
   array['Tuition + AUD 29,710 living + scholarship/loan/sponsor with numbers'], array['Vague sources','Mismatch with statements']),
  ('AU','What are your career plans after graduation?','post_study_plans','medium',
   'Probes return intent vs. permanent move.',
   array['Specific role in home country + sector'], array['"Stay long-term"']),
  ('AU','Do you intend to remain in Australia after your visa expires?','post_study_plans','hard',
   'Direct GTE probe.',
   array['No — names return-home job/family','Mentions Temporary Graduate visa briefly'], array['"Yes, I want PR"','No return plan']),
  ('AU','Have you arranged health insurance (OSHC)?','study_plan','easy',
   'Verifies condition 8501 compliance.',
   array['OSHC purchased + provider + dates'], array['Not yet arranged']),
  ('AU','Do you have family in Australia?','ties_to_home','easy',
   'Disclosure check.',
   array['Honest, matches application'], array['Hides family']),
  ('AU','What ties do you have to your home country?','ties_to_home','medium',
   'Officer checks return incentive.',
   array['Family business / property / job waiting'], array['No ties named']),
  ('AU','Have you lived abroad before?','study_plan','medium',
   'History check.',
   array['Honest with country + duration'], array['Hides prior stays']),
  ('AU','What is your English language test score?','english_proficiency','easy',
   'Quick verification of test type and score.',
   array['Exact test + score + band breakdown'], array['Cannot recall'])
on conflict do nothing;

-- =====================================================================
-- COUNTRY: DE / §16b Student Visa — 30 steps
-- =====================================================================
insert into public.visa_steps (country_code, step_number, phase, phase_name, title, description, what_to_upload, deadline_offset_days, is_free_tier) values
  ('DE',  1, 1, 'Apply and get admission', 'Shortlist German universities',          'Public unis = no/low tuition; private = higher fees. Use Hochschulkompass for the canonical list.',                'University shortlist',                240, true),
  ('DE',  2, 1, 'Apply and get admission', 'Take TestDaF / DSH or English test',     'German-taught programs: TestDaF 4x4 or DSH-2. English programs: IELTS / TOEFL.',                                   'Score report',                        220, true),
  ('DE',  3, 1, 'Apply and get admission', 'Apply via uni-assist or directly',       'Many unis use uni-assist; others accept direct applications. Deadlines: 15 July (winter), 15 Jan (summer).',         'Application confirmations',           200, true),
  ('DE',  4, 1, 'Apply and get admission', 'Receive Zulassungsbescheid (admission)','Verify name, program, semester, language, and any conditions on the admission letter.',                            'Admission letter (PDF)',              170, false),
  -- Phase 2
  -- TODO(verify-before-launch: 2026-06-17): Sperrkonto minimum — currently €11,208/year.
  ('DE',  5, 2, 'Sperrkonto + insurance', 'Open a blocked account (€11,208)',         'Open a Sperrkonto at Expatrio / Fintiba / Deutsche Bank. Deposit €11,208 for the year (~€934/month).',           'Sperrkonto certificate',              160, false),
  ('DE',  6, 2, 'Sperrkonto + insurance', 'Buy German health insurance',              'Public (TK, AOK) or private (DR-WALTER, Care Concept). Must cover from arrival.',                                   'Insurance confirmation',             150, false),
  ('DE',  7, 2, 'Sperrkonto + insurance', 'Get incoming-blocked-funds confirmation', 'Sperrkonto provider issues confirmation accepted by the embassy.',                                                  'Funds confirmation (PDF)',           145, false),
  -- Phase 3
  ('DE',  8, 3, 'Embassy appointment',    'Book embassy / consulate appointment',    'Embassy waits are 4–8 weeks. Book the moment you have the admission letter.',                                       'Embassy appointment confirmation',   140, false),
  ('DE',  9, 3, 'Embassy appointment',    'Pay visa fee (€75)',                       'Some embassies pay-in-advance; others pay at appointment. Bring receipt.',                                          'Visa fee receipt',                   135, false),
  ('DE', 10, 3, 'Embassy appointment',    'Complete VIDEX online form',              'VIDEX prefills the national-visa application. Save the QR-code page.',                                              'VIDEX form (printed)',               130, false),
  ('DE', 11, 3, 'Embassy appointment',    'Write Motivationsschreiben',              'Motivation letter: choice of program, choice of Germany, post-study plan. 1 page typical.',                          'Motivationsschreiben (PDF)',          125, false),
  ('DE', 12, 3, 'Embassy appointment',    'Update CV (German / English)',            'Tabellarischer Lebenslauf — chronological, signed, dated.',                                                          'CV (PDF)',                            122, false),
  ('DE', 13, 3, 'Embassy appointment',    'Get certified translations',              'All non-German documents need certified German (preferred) or English translation.',                                'Translation certifications',          118, false),
  ('DE', 14, 3, 'Embassy appointment',    'Order biometric photos (35x45mm)',        'Biometric standard for German visas — most photo studios know the spec.',                                            'Biometric photos',                    115, false),
  ('DE', 15, 3, 'Embassy appointment',    'Arrange initial accommodation',           'Studentenwerk dorm, private rental, or short-term until Anmeldung.',                                                'Accommodation proof',                 105, false),
  ('DE', 16, 3, 'Embassy appointment',    'Compile complete document folder',        'Passport, admission, Sperrkonto, insurance, Motivation, CV, transcripts, photos, accommodation.',                  'Document checklist',                  100, false),
  ('DE', 17, 3, 'Embassy appointment',    'Attend embassy visa interview',           'Short interview at the consulate; officer asks about Sperrkonto + program + return plan.',                          'Interview outcome',                    90, false),
  ('DE', 18, 3, 'Embassy appointment',    'Receive visa decision',                   'Decisions take 4–12 weeks. National visa sticker placed in passport.',                                              'Visa decision letter',                 60, false),
  -- Phase 4
  ('DE', 19, 4, 'Pre-departure',          'Book flight inside visa start',            'National visa is typically valid for 3 months from issue — arrive within that window.',                              'Flight itinerary',                     45, false),
  ('DE', 20, 4, 'Pre-departure',          'Buy initial travel insurance',            'Bridge cover from departure date to public-insurance activation.',                                                 'Travel insurance certificate',         42, false),
  ('DE', 21, 4, 'Pre-departure',          'Book initial accommodation (14 days min)',  'Anmeldung requires a fixed address — short-term lets accepted in many cities.',                                  'Accommodation booking',                35, false),
  ('DE', 22, 4, 'Pre-departure',          'Prepare carry-on document pack',          'Passport with visa, admission, Sperrkonto, insurance, accommodation. Border control can ask for any.',                'Carry-on folder',                      28, false),
  ('DE', 23, 4, 'Pre-departure',          'Arrange first month of cash',             'Most rentals + utilities want SEPA — bring some euros for the first 7 days.',                                       'Cash + travel-card screenshot',        25, false),
  -- Phase 5
  ('DE', 24, 5, 'Arrival + registration', 'Land + clear EU border',                  'Show visa sticker + admission + accommodation. Border officer can ask for proof of funds.',                          'Entry stamp',                          0, false),
  ('DE', 25, 5, 'Arrival + registration', 'Complete Anmeldung within 14 days',        'Register your address at the Bürgeramt within 14 days. Required for everything that follows.',                       'Anmeldebestätigung',                  -7, false),
  ('DE', 26, 5, 'Arrival + registration', 'Open a German bank account',              'Public bank or N26/Sparkasse — required to activate Sperrkonto monthly transfers.',                                  'Bank account confirmation',           -10, false),
  ('DE', 27, 5, 'Arrival + registration', 'Activate Sperrkonto monthly transfers',   'Set up the standing monthly transfer from Sperrkonto to your German account.',                                       'Transfer confirmation',                -14, false),
  ('DE', 28, 5, 'Arrival + registration', 'Get residence permit (Aufenthaltstitel)', 'Book at the Ausländerbehörde within first 3 months. Bring Anmeldung, insurance, admission, Sperrkonto.',              'Residence permit',                     -18, false),
  ('DE', 29, 5, 'Arrival + registration', 'Enrol at the university',                  'Pay the semester fee, present Anmeldung + insurance, get student card + matriculation.',                            'Enrolment confirmation',               -22, false),
  ('DE', 30, 5, 'Arrival + registration', 'GEZ / Rundfunk + tax registration',       'Register for the German broadcasting fee + apply for a tax ID for part-time work.',                                  'GEZ + tax ID confirmation',            -28, false)
on conflict (country_code, step_number) do update set
  phase = excluded.phase, phase_name = excluded.phase_name, title = excluded.title,
  description = excluded.description, what_to_upload = excluded.what_to_upload,
  deadline_offset_days = excluded.deadline_offset_days, is_free_tier = excluded.is_free_tier;

-- ---------------------------------------------------------------------
-- DE documents
-- ---------------------------------------------------------------------
insert into public.visa_documents
  (country_code, document_key, display_name, description, is_mandatory, ai_review_rules, common_mistakes, official_source_url) values
  ('DE','passport','Valid passport',
   'Passport valid 6+ months beyond intended stay.', true,
   '{"check_expiry":true,"min_months_valid":6,"check_photo_page":true}'::jsonb,
   array['Passport expires within 6 months','Damaged bio page'],
   'https://www.auswaertiges-amt.de/en/visa-service/-/231148'),
  ('DE','admission_letter','University admission letter',
   'Zulassungsbescheid or conditional admission. Includes program, semester, language, conditions.', true,
   '{"check_university_name":true,"check_program_name":true,"check_student_name":true,"check_semester_date":true}'::jsonb,
   array['Conditional admission missing language proof','Wrong semester','Name mismatch with passport'], null),
  ('DE','sperrkonto','Blocked account (Sperrkonto) proof',
   -- TODO(verify-before-launch: 2026-06-17): €11,208/year minimum. Confirm vs. BAMF tables.
   'Sperrkonto with €11,208 minimum deposited. Confirmation from approved provider (Expatrio, Fintiba, Deutsche Bank, etc.).', true,
   '{"check_amount_eur":11208,"check_account_type":"blocked","check_provider_approved":true}'::jsonb,
   array['Under €11,208 deposited','Non-approved provider','Wrong account type'],
   'https://www.auswaertiges-amt.de/en/visa-service/-/231148'),
  ('DE','health_insurance','German health insurance proof',
   'Public (TK, AOK) or approved private (DR-WALTER, Care Concept). Coverage must start from arrival.', true,
   '{"check_coverage_start":true,"check_coverage_type":"public_or_private","check_minimum_coverage":true}'::jsonb,
   array['Travel insurance only','Coverage starts after arrival','Not valid for residence-permit'], null),
  ('DE','academic_transcripts','Academic transcripts (translated)',
   'Final transcripts + degree certificates. Certified German (preferred) or English translation.', true,
   '{"check_translation_certified":true}'::jsonb,
   array['Translation not certified','Missing seal'], null),
  ('DE','language_proof','Language proficiency proof',
   'TestDaF / DSH for German-taught; IELTS / TOEFL for English-taught. Match program language.', true,
   '{"check_test_type":true,"check_score_minimum":true,"check_program_language_match":true}'::jsonb,
   array['Wrong test type for program language','Score below minimum'], null),
  ('DE','motivation_letter','Motivation letter (Motivationsschreiben)',
   'One-page letter: program choice, choice of Germany, return-home plan.', true,
   '{"check_length_min_words":250,"check_personalisation":true}'::jsonb,
   array['Generic template','No personal connection'], null),
  ('DE','cv','CV / Lebenslauf',
   'Chronological, signed, dated. German or English.', true, null,
   array['Unsigned','Gaps unexplained'], null),
  ('DE','biometric_photos','Biometric passport photos (35x45mm)',
   'Biometric standard, white or light grey background.', true,
   '{"check_dimensions":"35x45mm","check_background":"white_or_light_grey","check_recency_months":6}'::jsonb,
   array['Wrong dimensions','Background not biometric-grey'], null),
  ('DE','accommodation_proof','Proof of accommodation',
   'Booking confirmation or rental contract covering arrival period.', true, null,
   array['No accommodation lined up','Booking shorter than 14 days'], null)
on conflict (country_code, document_key) do update set
  display_name = excluded.display_name, description = excluded.description,
  is_mandatory = excluded.is_mandatory, ai_review_rules = excluded.ai_review_rules,
  common_mistakes = excluded.common_mistakes, official_source_url = excluded.official_source_url;

-- ---------------------------------------------------------------------
-- DE interview questions (12)
-- ---------------------------------------------------------------------
insert into public.visa_interview_questions
  (country_code, question_text, category, difficulty, why_asked, good_answer_signals, red_flag_signals) values
  ('DE','Why Germany for your studies?','study_plan','medium',
   'Officer wants deliberate choice — industry / research / language / cost — not just Schengen access.',
   array['Specific reasons — industry, research strength, Mittelstand, language fit','Comparison vs. home / other countries'],
   array['"Free education" alone','"Easier to get PR"']),
  ('DE','Which university and program are you attending?','study_plan','easy',
   'Verifies admission letter.',
   array['Exact university + program + language'], array['Cannot recall','Wrong language']),
  ('DE','Do you speak German?','english_proficiency','medium',
   'Tests honesty + integration intent. Honest level — A1/A2/B1 with proof — is fine.',
   array['Honest CEFR level + plan to improve'], array['Overclaims fluency','No plan to learn']),
  ('DE','How will you finance your studies — show your blocked account?','finances','easy',
   'Direct verification of the Sperrkonto.',
   array['Names provider + €11,208 + monthly release'], array['Cannot explain Sperrkonto','Funds under threshold']),
  ('DE','What is a Sperrkonto and how much have you deposited?','finances','medium',
   'Tests financial preparation.',
   array['Specific: €11,208/year ≈ €934/month, named provider'], array['Vague','Wrong amount']),
  ('DE','What are your plans after graduation?','post_study_plans','medium',
   'Tests intent — Jobsuchaufenthalt then return-home or career back home.',
   array['Mentions 18-month job-search stay + return-home plan'], array['"Permanent stay" without plan']),
  ('DE','Will you return to your home country after your degree?','post_study_plans','hard',
   'Direct intent probe.',
   array['Yes — named role/sector/employer back home','Family business / property mentioned'],
   array['Open-ended stay','No return plan']),
  ('DE','Why did you choose this specific program?','university_choice','medium',
   'Probes deliberate program choice vs. random admission.',
   array['Specific modules / professors / lab match','Tied to prior education'], array['"Highest ranked"','No connection to past work']),
  ('DE','Do you have accommodation arranged in Germany?','study_plan','easy',
   'Verifies you can complete Anmeldung.',
   array['Named district + landlord + duration'], array['"Will find on arrival"']),
  ('DE','Have you studied abroad before?','study_plan','medium',
   'History check.',
   array['Honest with country + duration'], array['Hides prior stays']),
  ('DE','What ties do you have to your home country?','ties_to_home','medium',
   'Officer evaluates return incentive.',
   array['Family business / property / job waiting'], array['No ties named']),
  ('DE','Have you ever been refused a German or Schengen visa?','study_plan','medium',
   'Disclosure consistency.',
   array['Honest, explains what changed'], array['Hides prior Schengen refusal'])
on conflict do nothing;

-- =====================================================================
-- END OF SEED
-- =====================================================================
