/**
 * Rule-based Smart Complaint Generator
 * Builds professional complaint text from structured inputs.
 */

export type ComplaintType =
  | "College"
  | "Bank"
  | "Workplace"
  | "Hospital"
  | "Restaurant"
  | "Government"
  | "OnlineShopping"
  | "Landlord"
  | "Telecom"
  | "Transport"
  | "Other";
export type Tone = "Polite" | "Strict" | "Urgent";
export type Severity = "Low" | "Medium" | "High";
export type OutputFormat = "Letter" | "Email";
export type Language =
  | "English"
  | "Tamil"
  | "Hindi"
  | "Telugu"
  | "Malayalam"
  | "Kannada"
  | "Spanish"
  | "French";

export interface ComplaintInput {
  issue: string;
  recipientName?: string;
  complaintType: ComplaintType;
  tone: Tone;
  severity: Severity;
  outputFormat: OutputFormat;
  language: Language;
  senderName?: string;
}

export interface GeneratedComplaint {
  subject: string;
  body: string;
  qualityScore: number;
  qualityNotes: string[];
}

/* -------- Quick Templates -------- */
export const QUICK_TEMPLATES = [
  { label: "Hostel water issue", value: "There has been no water supply in the hostel for the past 3 days, causing major inconvenience to all residents." },
  { label: "Wrong bank charge", value: "An unauthorized service charge of Rs. 500 was deducted from my account on the last statement without prior notification." },
  { label: "Workplace harassment", value: "I have been facing repeated unprofessional behavior from a colleague which is affecting my ability to work effectively." },
  { label: "Late salary", value: "My salary for the previous month has not been credited even though the payday was over a week ago." },
  { label: "Faulty product", value: "The product I purchased on [date] from your store stopped working within a week and is still under warranty." },
  { label: "Poor service", value: "The service I received at your branch was extremely slow and the staff was unresponsive to my queries." },
  { label: "Hospital negligence", value: "During my recent visit on [date], the medical staff was negligent in providing timely care, resulting in unnecessary suffering." },
  { label: "Restaurant hygiene", value: "I observed unhygienic conditions and stale food being served at your restaurant during my visit on [date]." },
  { label: "Wrong online order", value: "I received a completely different item from what I ordered, and customer support has not responded for over a week." },
  { label: "Landlord deposit", value: "My security deposit has not been refunded even after 60 days of vacating the property, despite multiple reminders." },
  { label: "Network outage", value: "My internet/mobile service has been disrupted for the past 5 days but charges are still being applied to my account." },
  { label: "Cab overcharge", value: "I was overcharged on a recent ride and the driver behaved rudely when I questioned the fare." },
  { label: "Power cut", value: "There have been frequent unscheduled power cuts in our area for the past 2 weeks, severely affecting daily life." },
  { label: "Garbage collection", value: "Garbage has not been collected from our street for over a week, creating unhygienic conditions and health hazards." },
] as const;

/* -------- Salutations / Sign-offs -------- */
const SALUTATIONS_EN: Record<ComplaintType, string> = {
  College: "Respected Principal/Dean",
  Bank: "Dear Branch Manager",
  Workplace: "Dear HR Manager",
  Hospital: "Dear Medical Superintendent",
  Restaurant: "Dear Restaurant Manager",
  Government: "Respected Officer-in-Charge",
  OnlineShopping: "Dear Customer Support Team",
  Landlord: "Dear Landlord",
  Telecom: "Dear Customer Care Manager",
  Transport: "Dear Transport Authority",
  Other: "Dear Sir/Madam",
};

const SALUTATIONS_TA: Record<ComplaintType, string> = {
  College: "மதிப்பிற்குரிய முதல்வர் அவர்களுக்கு",
  Bank: "மதிப்பிற்குரிய கிளை மேலாளர் அவர்களுக்கு",
  Workplace: "மதிப்பிற்குரிய மனிதவள மேலாளர் அவர்களுக்கு",
  Hospital: "மதிப்பிற்குரிய மருத்துவ மேற்பார்வையாளர் அவர்களுக்கு",
  Restaurant: "மதிப்பிற்குரிய உணவகத்தின் மேலாளர் அவர்களுக்கு",
  Government: "மதிப்பிற்குரிய பொறுப்பு அதிகாரி அவர்களுக்கு",
  OnlineShopping: "மதிப்பிற்குரிய வாடிக்கையாளர் சேவை குழு",
  Landlord: "மதிப்பிற்குரிய வீட்டு உரிமையாளர் அவர்களுக்கு",
  Telecom: "மதிப்பிற்குரிய வாடிக்கையாளர் சேவை மேலாளர் அவர்களுக்கு",
  Transport: "மதிப்பிற்குரிய போக்குவரத்து ஆணையம்",
  Other: "மதிப்பிற்குரிய ஐயா/அம்மா அவர்களுக்கு",
};

const SALUTATIONS_HI: Record<ComplaintType, string> = {
  College: "आदरणीय प्राचार्य/डीन महोदय",
  Bank: "आदरणीय शाखा प्रबंधक महोदय",
  Workplace: "आदरणीय एचआर प्रबंधक महोदय",
  Hospital: "आदरणीय चिकित्सा अधीक्षक महोदय",
  Restaurant: "आदरणीय रेस्तरां प्रबंधक महोदय",
  Government: "आदरणीय प्रभारी अधिकारी महोदय",
  OnlineShopping: "आदरणीय ग्राहक सहायता टीम",
  Landlord: "आदरणीय मकान मालिक",
  Telecom: "आदरणीय ग्राहक सेवा प्रबंधक",
  Transport: "आदरणीय परिवहन प्राधिकरण",
  Other: "आदरणीय महोदय/महोदया",
};

const SALUTATIONS_TE: Record<ComplaintType, string> = {
  College: "గౌరవనీయులైన ప్రిన్సిపాల్/డీన్ గారికి",
  Bank: "గౌరవనీయులైన బ్రాంచ్ మేనేజర్ గారికి",
  Workplace: "గౌరవనీయులైన హెచ్‌ఆర్ మేనేజర్ గారికి",
  Hospital: "గౌరవనీయులైన మెడికల్ సూపరింటెండెంట్ గారికి",
  Restaurant: "గౌరవనీయులైన రెస్టారెంట్ మేనేజర్ గారికి",
  Government: "గౌరవనీయులైన ఇన్‌ఛార్జ్ అధికారి గారికి",
  OnlineShopping: "గౌరవనీయులైన కస్టమర్ సపోర్ట్ టీం",
  Landlord: "గౌరవనీయులైన ఇంటి యజమానికి",
  Telecom: "గౌరవనీయులైన కస్టమర్ కేర్ మేనేజర్ గారికి",
  Transport: "గౌరవనీయులైన రవాణా అధికారం",
  Other: "గౌరవనీయులైన అయ్యా/అమ్మా",
};

const SALUTATIONS_ML: Record<ComplaintType, string> = {
  College: "ബഹുമാനപ്പെട്ട പ്രിൻസിപ്പൽ/ഡീൻ അവർകൾക്ക്",
  Bank: "ബഹുമാനപ്പെട്ട ബ്രാഞ്ച് മാനേജർക്ക്",
  Workplace: "ബഹുമാനപ്പെട്ട എച്ച്ആർ മാനേജർക്ക്",
  Hospital: "ബഹുമാനപ്പെട്ട മെഡിക്കൽ സൂപ്രണ്ടിന്",
  Restaurant: "ബഹുമാനപ്പെട്ട റെസ്റ്റോറന്റ് മാനേജർക്ക്",
  Government: "ബഹുമാനപ്പെട്ട ചുമതലയുള്ള ഉദ്യോഗസ്ഥന്",
  OnlineShopping: "ബഹുമാനപ്പെട്ട കസ്റ്റമർ സപ്പോർട്ട് ടീമിന്",
  Landlord: "ബഹുമാനപ്പെട്ട വീട്ടുടമയ്ക്ക്",
  Telecom: "ബഹുമാനപ്പെട്ട കസ്റ്റമർ കെയർ മാനേജർക്ക്",
  Transport: "ബഹുമാനപ്പെട്ട ഗതാഗത അതോറിറ്റിക്ക്",
  Other: "ബഹുമാനപ്പെട്ട സർ/മാഡം",
};

const SALUTATIONS_KN: Record<ComplaintType, string> = {
  College: "ಗೌರವಾನ್ವಿತ ಪ್ರಾಂಶುಪಾಲರು/ಡೀನ್ ಅವರಿಗೆ",
  Bank: "ಗೌರವಾನ್ವಿತ ಶಾಖಾ ವ್ಯವಸ್ಥಾಪಕರಿಗೆ",
  Workplace: "ಗೌರವಾನ್ವಿತ ಎಚ್‌ಆರ್ ವ್ಯವಸ್ಥಾಪಕರಿಗೆ",
  Hospital: "ಗೌರವಾನ್ವಿತ ವೈದ್ಯಕೀಯ ಮೇಲ್ವಿಚಾರಕರಿಗೆ",
  Restaurant: "ಗೌರವಾನ್ವಿತ ರೆಸ್ಟೋರೆಂಟ್ ವ್ಯವಸ್ಥಾಪಕರಿಗೆ",
  Government: "ಗೌರವಾನ್ವಿತ ಉಸ್ತುವಾರಿ ಅಧಿಕಾರಿಗಳಿಗೆ",
  OnlineShopping: "ಗೌರವಾನ್ವಿತ ಗ್ರಾಹಕ ಬೆಂಬಲ ತಂಡಕ್ಕೆ",
  Landlord: "ಗೌರವಾನ್ವಿತ ಮನೆ ಮಾಲೀಕರಿಗೆ",
  Telecom: "ಗೌರವಾನ್ವಿತ ಗ್ರಾಹಕ ಸೇವಾ ವ್ಯವಸ್ಥಾಪಕರಿಗೆ",
  Transport: "ಗೌರವಾನ್ವಿತ ಸಾರಿಗೆ ಪ್ರಾಧಿಕಾರಕ್ಕೆ",
  Other: "ಗೌರವಾನ್ವಿತ ಮಹಾಶಯ/ಮಹಾಶಯೆ",
};

const SALUTATIONS_ES: Record<ComplaintType, string> = {
  College: "Estimado/a Director/a",
  Bank: "Estimado/a Gerente de Sucursal",
  Workplace: "Estimado/a Gerente de Recursos Humanos",
  Hospital: "Estimado/a Director/a Médico/a",
  Restaurant: "Estimado/a Gerente del Restaurante",
  Government: "Estimado/a Funcionario/a a Cargo",
  OnlineShopping: "Estimado Equipo de Atención al Cliente",
  Landlord: "Estimado/a Propietario/a",
  Telecom: "Estimado/a Gerente de Atención al Cliente",
  Transport: "Estimada Autoridad de Transporte",
  Other: "Estimado/a Señor/a",
};

const SALUTATIONS_FR: Record<ComplaintType, string> = {
  College: "Monsieur/Madame le/la Directeur/Directrice",
  Bank: "Monsieur/Madame le/la Directeur/Directrice de l'Agence",
  Workplace: "Monsieur/Madame le/la Responsable des Ressources Humaines",
  Hospital: "Monsieur/Madame le/la Directeur/Directrice Médical(e)",
  Restaurant: "Monsieur/Madame le/la Gérant(e) du Restaurant",
  Government: "Monsieur/Madame le/la Responsable",
  OnlineShopping: "Cher Service Client",
  Landlord: "Monsieur/Madame le/la Propriétaire",
  Telecom: "Monsieur/Madame le/la Responsable du Service Client",
  Transport: "Monsieur/Madame de l'Autorité des Transports",
  Other: "Monsieur/Madame",
};

const TONE_OPENERS_EN: Record<Tone, string> = {
  Polite: "I hope this message finds you well. I am writing to respectfully bring to your attention",
  Strict: "I am writing to formally raise a serious concern regarding",
  Urgent: "I am writing to urgently report a critical matter that requires your immediate attention regarding",
};

const TONE_OPENERS_TA: Record<Tone, string> = {
  Polite: "தங்கள் கவனத்திற்கு பின்வரும் விஷயத்தை மரியாதையுடன் கொண்டு வர விரும்புகிறேன்:",
  Strict: "பின்வரும் கடுமையான பிரச்சினை குறித்து முறையாக பதிவு செய்ய விரும்புகிறேன்:",
  Urgent: "உடனடி கவனம் தேவைப்படும் அவசர பிரச்சினை குறித்து தங்கள் கவனத்திற்கு கொண்டு வருகிறேன்:",
};

const TONE_OPENERS_HI: Record<Tone, string> = {
  Polite: "मैं आपका ध्यान निम्नलिखित विषय की ओर सम्मानपूर्वक आकर्षित करना चाहता/चाहती हूं:",
  Strict: "मैं निम्नलिखित गंभीर समस्या के संबंध में औपचारिक शिकायत दर्ज करना चाहता/चाहती हूं:",
  Urgent: "मैं एक अत्यंत जरूरी मामले के संबंध में आपका तत्काल ध्यान आकर्षित करना चाहता/चाहती हूं:",
};

const TONE_OPENERS_TE: Record<Tone, string> = {
  Polite: "నేను ఈ క్రింది విషయాన్ని మీ దృష్టికి గౌరవంగా తీసుకురావాలనుకుంటున్నాను:",
  Strict: "ఈ క్రింది తీవ్రమైన సమస్య గురించి అధికారికంగా ఫిర్యాదు చేయాలనుకుంటున్నాను:",
  Urgent: "తక్షణ దృష్టి అవసరమైన అత్యవసర విషయంపై మీ దృష్టిని ఆకర్షిస్తున్నాను:",
};

const TONE_OPENERS_ML: Record<Tone, string> = {
  Polite: "ഇനിപ്പറയുന്ന വിഷയം താങ്കളുടെ ശ്രദ്ധയിൽപ്പെടുത്താൻ ഞാൻ ആഗ്രഹിക്കുന്നു:",
  Strict: "ഇനിപ്പറയുന്ന ഗുരുതരമായ പ്രശ്നത്തെക്കുറിച്ച് ഔദ്യോഗികമായി പരാതിപ്പെടുന്നു:",
  Urgent: "ഉടനടി ശ്രദ്ധ ആവശ്യമുള്ള അടിയന്തര വിഷയം താങ്കളുടെ ശ്രദ്ധയിൽപ്പെടുത്തുന്നു:",
};

const TONE_OPENERS_KN: Record<Tone, string> = {
  Polite: "ಈ ಕೆಳಗಿನ ವಿಷಯವನ್ನು ತಮ್ಮ ಗಮನಕ್ಕೆ ಗೌರವಪೂರ್ವಕವಾಗಿ ತರಲು ಬಯಸುತ್ತೇನೆ:",
  Strict: "ಈ ಕೆಳಗಿನ ಗಂಭೀರ ಸಮಸ್ಯೆಯ ಬಗ್ಗೆ ಔಪಚಾರಿಕವಾಗಿ ದೂರು ಸಲ್ಲಿಸುತ್ತಿದ್ದೇನೆ:",
  Urgent: "ತಕ್ಷಣದ ಗಮನ ಅಗತ್ಯವಿರುವ ತುರ್ತು ವಿಷಯದ ಬಗ್ಗೆ ತಮ್ಮ ಗಮನ ಸೆಳೆಯುತ್ತಿದ್ದೇನೆ:",
};

const TONE_OPENERS_ES: Record<Tone, string> = {
  Polite: "Espero que se encuentre bien. Le escribo para señalar respetuosamente a su atención",
  Strict: "Le escribo para presentar formalmente una queja seria con respecto a",
  Urgent: "Le escribo para informar urgentemente sobre un asunto crítico que requiere su atención inmediata respecto a",
};

const TONE_OPENERS_FR: Record<Tone, string> = {
  Polite: "J'espère que vous allez bien. Je vous écris pour porter respectueusement à votre attention",
  Strict: "Je vous écris pour soulever formellement une préoccupation sérieuse concernant",
  Urgent: "Je vous écris pour signaler de toute urgence un problème critique nécessitant votre attention immédiate concernant",
};

const SEVERITY_LINES_EN: Record<Severity, string> = {
  Low: "While not critical, I believe this issue warrants attention to maintain service standards.",
  Medium: "This issue is causing notable inconvenience and I would appreciate a timely resolution.",
  High: "This is a serious matter that is significantly impacting me and I request immediate action.",
};

const SEVERITY_LINES_TA: Record<Severity, string> = {
  Low: "இது அவசரமானது அல்ல என்றாலும், சேவைத் தரத்தை பராமரிக்க இதற்கு கவனம் தேவை.",
  Medium: "இந்த பிரச்சினை குறிப்பிடத்தக்க அசௌகரியத்தை ஏற்படுத்துகிறது, விரைவான தீர்வை எதிர்பார்க்கிறேன்.",
  High: "இது மிகவும் கடுமையான பிரச்சினை, உடனடி நடவடிக்கை எடுக்க கேட்டுக்கொள்கிறேன்.",
};

const SEVERITY_LINES_HI: Record<Severity, string> = {
  Low: "हालांकि यह गंभीर नहीं है, फिर भी सेवा मानकों को बनाए रखने के लिए इस पर ध्यान देना आवश्यक है।",
  Medium: "यह समस्या उल्लेखनीय असुविधा पैदा कर रही है और मैं शीघ्र समाधान की अपेक्षा करता/करती हूं।",
  High: "यह एक गंभीर मामला है जो मुझे काफी प्रभावित कर रहा है और मैं तत्काल कार्रवाई का अनुरोध करता/करती हूं।",
};

const SEVERITY_LINES_TE: Record<Severity, string> = {
  Low: "ఇది తీవ్రమైనది కానప్పటికీ, సేవా ప్రమాణాలను కాపాడటానికి దీనికి దృష్టి అవసరం.",
  Medium: "ఈ సమస్య గణనీయమైన అసౌకర్యాన్ని కలిగిస్తోంది, త్వరిత పరిష్కారాన్ని ఆశిస్తున్నాను.",
  High: "ఇది తీవ్రమైన విషయం, ఇది నన్ను గణనీయంగా ప్రభావితం చేస్తోంది, తక్షణ చర్య కోరుతున్నాను.",
};

const SEVERITY_LINES_ML: Record<Severity, string> = {
  Low: "ഇത് ഗുരുതരമല്ലെങ്കിലും, സേവന നിലവാരം നിലനിർത്താൻ ഇതിന് ശ്രദ്ധ ആവശ്യമാണ്.",
  Medium: "ഈ പ്രശ്നം ഗണ്യമായ അസൗകര്യം ഉണ്ടാക്കുന്നു, വേഗത്തിലുള്ള പരിഹാരം പ്രതീക്ഷിക്കുന്നു.",
  High: "ഇത് ഗുരുതരമായ വിഷയമാണ്, എനിക്ക് ഗണ്യമായ ബുദ്ധിമുട്ടുണ്ടാക്കുന്നു, ഉടനടി നടപടി അഭ്യർത്ഥിക്കുന്നു.",
};

const SEVERITY_LINES_KN: Record<Severity, string> = {
  Low: "ಇದು ಗಂಭೀರವಲ್ಲದಿದ್ದರೂ, ಸೇವಾ ಗುಣಮಟ್ಟವನ್ನು ಕಾಪಾಡಲು ಇದಕ್ಕೆ ಗಮನ ಅಗತ್ಯವಿದೆ.",
  Medium: "ಈ ಸಮಸ್ಯೆ ಗಮನಾರ್ಹ ಅನಾನುಕೂಲತೆಯನ್ನು ಉಂಟುಮಾಡುತ್ತಿದೆ, ತ್ವರಿತ ಪರಿಹಾರವನ್ನು ನಿರೀಕ್ಷಿಸುತ್ತೇನೆ.",
  High: "ಇದು ಗಂಭೀರ ವಿಷಯವಾಗಿದೆ, ನನ್ನ ಮೇಲೆ ಗಮನಾರ್ಹವಾಗಿ ಪರಿಣಾಮ ಬೀರುತ್ತಿದೆ, ತಕ್ಷಣದ ಕ್ರಮವನ್ನು ಕೋರುತ್ತೇನೆ.",
};

const SEVERITY_LINES_ES: Record<Severity, string> = {
  Low: "Aunque no es crítico, creo que este asunto merece atención para mantener los estándares de servicio.",
  Medium: "Este problema está causando notables inconvenientes y agradecería una pronta resolución.",
  High: "Este es un asunto serio que me está afectando significativamente y solicito acción inmediata.",
};

const SEVERITY_LINES_FR: Record<Severity, string> = {
  Low: "Bien que non critique, je pense que cette question mérite une attention pour maintenir les normes de service.",
  Medium: "Ce problème cause des désagréments notables et j'apprécierais une résolution rapide.",
  High: "Il s'agit d'une affaire sérieuse qui m'affecte considérablement et je demande une action immédiate.",
};

const CLOSERS_EN: Record<Tone, string> = {
  Polite: "I would be grateful for your kind consideration and a positive resolution at your earliest convenience. Thank you for your time and support.",
  Strict: "I expect this matter to be addressed promptly and a written response outlining the action taken. Failing which, I may be compelled to escalate this further.",
  Urgent: "Given the urgency, I request immediate intervention and a confirmation of the steps being taken within 24 to 48 hours.",
};

const CLOSERS_TA: Record<Tone, string> = {
  Polite: "தங்களின் கருணைக்கு நன்றி. விரைவில் சாதகமான பதிலை எதிர்பார்க்கிறேன்.",
  Strict: "இந்த விஷயம் உடனடியாக தீர்க்கப்பட வேண்டும், எடுக்கப்பட்ட நடவடிக்கை குறித்து எழுத்துப்பூர்வமாக பதில் எதிர்பார்க்கிறேன்.",
  Urgent: "அவசரத்தை கருத்தில் கொண்டு, 24 முதல் 48 மணி நேரத்திற்குள் உடனடி நடவடிக்கை எடுக்க கேட்டுக்கொள்கிறேன்.",
};

const CLOSERS_HI: Record<Tone, string> = {
  Polite: "आपकी कृपा और शीघ्र सकारात्मक समाधान के लिए मैं आभारी रहूंगा/रहूंगी। आपके समय और सहयोग के लिए धन्यवाद।",
  Strict: "मैं अपेक्षा करता/करती हूं कि इस मामले का तुरंत समाधान किया जाए और की गई कार्रवाई का लिखित जवाब दिया जाए।",
  Urgent: "तात्कालिकता को देखते हुए, मैं 24 से 48 घंटों के भीतर तत्काल हस्तक्षेप और उठाए गए कदमों की पुष्टि का अनुरोध करता/करती हूं।",
};

const CLOSERS_TE: Record<Tone, string> = {
  Polite: "మీ దయ మరియు త్వరిత సానుకూల పరిష్కారానికి నేను కృతజ్ఞుడిని/కృతజ్ఞురాలిని. మీ సమయం మరియు మద్దతుకు ధన్యవాదాలు.",
  Strict: "ఈ విషయాన్ని వెంటనే పరిష్కరించాలని మరియు తీసుకున్న చర్యను వివరిస్తూ లిఖిత ప్రతిస్పందన ఇవ్వాలని ఆశిస్తున్నాను.",
  Urgent: "అత్యవసరాన్ని దృష్టిలో ఉంచుకుని, 24 నుండి 48 గంటల్లో తక్షణ జోక్యం మరియు తీసుకుంటున్న చర్యల నిర్ధారణ కోరుతున్నాను.",
};

const CLOSERS_ML: Record<Tone, string> = {
  Polite: "താങ്കളുടെ ദയയ്ക്കും വേഗത്തിലുള്ള പരിഹാരത്തിനും ഞാൻ നന്ദിയുള്ളവനാകും. താങ്കളുടെ സമയത്തിനും പിന്തുണയ്ക്കും നന്ദി.",
  Strict: "ഈ വിഷയം ഉടനടി പരിഹരിക്കപ്പെടണമെന്നും എടുത്ത നടപടിയെക്കുറിച്ച് രേഖാമൂലം മറുപടി ലഭിക്കണമെന്നും ഞാൻ പ്രതീക്ഷിക്കുന്നു.",
  Urgent: "അടിയന്തരാവസ്ഥ കണക്കിലെടുത്ത്, 24 മുതൽ 48 മണിക്കൂറിനുള്ളിൽ ഉടനടി ഇടപെടലും നടപടികളുടെ സ്ഥിരീകരണവും അഭ്യർത്ഥിക്കുന്നു.",
};

const CLOSERS_KN: Record<Tone, string> = {
  Polite: "ತಮ್ಮ ದಯೆ ಮತ್ತು ತ್ವರಿತ ಸಕಾರಾತ್ಮಕ ಪರಿಹಾರಕ್ಕಾಗಿ ನಾನು ಕೃತಜ್ಞನಾಗಿರುತ್ತೇನೆ. ತಮ್ಮ ಸಮಯ ಮತ್ತು ಬೆಂಬಲಕ್ಕಾಗಿ ಧನ್ಯವಾದಗಳು.",
  Strict: "ಈ ವಿಷಯವನ್ನು ತಕ್ಷಣ ಪರಿಹರಿಸಬೇಕೆಂದು ಮತ್ತು ತೆಗೆದುಕೊಂಡ ಕ್ರಮವನ್ನು ವಿವರಿಸುವ ಲಿಖಿತ ಪ್ರತಿಕ್ರಿಯೆಯನ್ನು ನಿರೀಕ್ಷಿಸುತ್ತೇನೆ.",
  Urgent: "ತುರ್ತುಪರಿಸ್ಥಿತಿಯನ್ನು ಗಮನದಲ್ಲಿಟ್ಟುಕೊಂಡು, 24 ರಿಂದ 48 ಗಂಟೆಗಳಲ್ಲಿ ತಕ್ಷಣದ ಮಧ್ಯಸ್ಥಿಕೆ ಮತ್ತು ತೆಗೆದುಕೊಳ್ಳುತ್ತಿರುವ ಕ್ರಮಗಳ ದೃಢೀಕರಣವನ್ನು ಕೋರುತ್ತೇನೆ.",
};

const CLOSERS_ES: Record<Tone, string> = {
  Polite: "Le agradecería su amable consideración y una resolución positiva a la mayor brevedad posible. Gracias por su tiempo y apoyo.",
  Strict: "Espero que este asunto se aborde rápidamente y una respuesta por escrito que detalle las medidas tomadas. De lo contrario, podría verme obligado/a a escalar este asunto.",
  Urgent: "Dada la urgencia, solicito intervención inmediata y una confirmación de las medidas que se están tomando en un plazo de 24 a 48 horas.",
};

const CLOSERS_FR: Record<Tone, string> = {
  Polite: "Je vous serais reconnaissant(e) de votre aimable considération et d'une résolution positive dans les meilleurs délais. Merci pour votre temps et votre soutien.",
  Strict: "Je m'attends à ce que cette question soit traitée rapidement et à recevoir une réponse écrite décrivant les mesures prises. À défaut, je pourrais être contraint(e) d'escalader cette affaire.",
  Urgent: "Compte tenu de l'urgence, je demande une intervention immédiate et une confirmation des mesures prises dans les 24 à 48 heures.",
};

/* -------- Per-language packs -------- */
interface LangPack {
  salutations: Record<ComplaintType, string>;
  openers: Record<Tone, string>;
  severity: Record<Severity, string>;
  closers: Record<Tone, string>;
  defaultSender: string;
  signOffEmail: string;
  signOffLetter: string;
  recipientPrefix: (name: string) => string;
  matterConnector: string; // word(s) between opener and issue
  requestLine: string;
  subjectLabel: string;
  urgentLabel: string;
  formalLabel: string;
}

const PACKS: Record<Language, LangPack> = {
  English: {
    salutations: SALUTATIONS_EN,
    openers: TONE_OPENERS_EN,
    severity: SEVERITY_LINES_EN,
    closers: CLOSERS_EN,
    defaultSender: "Concerned Individual",
    signOffEmail: "Best regards,",
    signOffLetter: "Yours sincerely,",
    recipientPrefix: (n) => `Dear ${n}`,
    matterConnector: " the following matter:",
    requestLine: "I kindly request you to look into this issue at the earliest and provide a suitable resolution.",
    subjectLabel: "Complaint Regarding",
    urgentLabel: "URGENT: ",
    formalLabel: "Formal Complaint: ",
  },
  Tamil: {
    salutations: SALUTATIONS_TA,
    openers: TONE_OPENERS_TA,
    severity: SEVERITY_LINES_TA,
    closers: CLOSERS_TA,
    defaultSender: "புகார் தெரிவிப்பவர்",
    signOffEmail: "அன்புடன்,",
    signOffLetter: "நன்றியுடன்,",
    recipientPrefix: (n) => `மதிப்பிற்குரிய ${n} அவர்களுக்கு`,
    matterConnector: "",
    requestLine: "இந்த பிரச்சினையை விரைவில் கவனித்து பொருத்தமான தீர்வை வழங்க தாழ்மையுடன் கேட்டுக்கொள்கிறேன்.",
    subjectLabel: "புகார் —",
    urgentLabel: "அவசரம்: ",
    formalLabel: "முறையான புகார்: ",
  },
  Hindi: {
    salutations: SALUTATIONS_HI,
    openers: TONE_OPENERS_HI,
    severity: SEVERITY_LINES_HI,
    closers: CLOSERS_HI,
    defaultSender: "शिकायतकर्ता",
    signOffEmail: "सादर,",
    signOffLetter: "भवदीय,",
    recipientPrefix: (n) => `आदरणीय ${n} जी`,
    matterConnector: "",
    requestLine: "कृपया इस समस्या पर शीघ्र ध्यान दें और उपयुक्त समाधान प्रदान करें।",
    subjectLabel: "शिकायत —",
    urgentLabel: "अत्यावश्यक: ",
    formalLabel: "औपचारिक शिकायत: ",
  },
  Telugu: {
    salutations: SALUTATIONS_TE,
    openers: TONE_OPENERS_TE,
    severity: SEVERITY_LINES_TE,
    closers: CLOSERS_TE,
    defaultSender: "ఫిర్యాదుదారు",
    signOffEmail: "శుభాకాంక్షలతో,",
    signOffLetter: "ధన్యవాదాలతో,",
    recipientPrefix: (n) => `గౌరవనీయులైన ${n} గారికి`,
    matterConnector: "",
    requestLine: "దయచేసి ఈ సమస్యను త్వరగా పరిశీలించి తగిన పరిష్కారాన్ని అందించమని కోరుతున్నాను.",
    subjectLabel: "ఫిర్యాదు —",
    urgentLabel: "అత్యవసరం: ",
    formalLabel: "అధికారిక ఫిర్యాదు: ",
  },
  Malayalam: {
    salutations: SALUTATIONS_ML,
    openers: TONE_OPENERS_ML,
    severity: SEVERITY_LINES_ML,
    closers: CLOSERS_ML,
    defaultSender: "പരാതിക്കാരൻ",
    signOffEmail: "സ്നേഹപൂർവ്വം,",
    signOffLetter: "വിശ്വാസപൂർവ്വം,",
    recipientPrefix: (n) => `ബഹുമാനപ്പെട്ട ${n} അവർകൾക്ക്`,
    matterConnector: "",
    requestLine: "ഈ പ്രശ്നം എത്രയും വേഗം പരിശോധിച്ച് അനുയോജ്യമായ പരിഹാരം നൽകണമെന്ന് വിനയപൂർവ്വം അഭ്യർത്ഥിക്കുന്നു.",
    subjectLabel: "പരാതി —",
    urgentLabel: "അടിയന്തരം: ",
    formalLabel: "ഔദ്യോഗിക പരാതി: ",
  },
  Kannada: {
    salutations: SALUTATIONS_KN,
    openers: TONE_OPENERS_KN,
    severity: SEVERITY_LINES_KN,
    closers: CLOSERS_KN,
    defaultSender: "ದೂರುದಾರ",
    signOffEmail: "ಶುಭಾಶಯಗಳೊಂದಿಗೆ,",
    signOffLetter: "ತಮ್ಮ ವಿಧೇಯ,",
    recipientPrefix: (n) => `ಗೌರವಾನ್ವಿತ ${n} ಅವರಿಗೆ`,
    matterConnector: "",
    requestLine: "ದಯವಿಟ್ಟು ಈ ಸಮಸ್ಯೆಯನ್ನು ಆದಷ್ಟು ಬೇಗ ಪರಿಶೀಲಿಸಿ ಸೂಕ್ತ ಪರಿಹಾರವನ್ನು ಒದಗಿಸಬೇಕೆಂದು ವಿನಮ್ರವಾಗಿ ಕೋರುತ್ತೇನೆ.",
    subjectLabel: "ದೂರು —",
    urgentLabel: "ತುರ್ತು: ",
    formalLabel: "ಔಪಚಾರಿಕ ದೂರು: ",
  },
  Spanish: {
    salutations: SALUTATIONS_ES,
    openers: TONE_OPENERS_ES,
    severity: SEVERITY_LINES_ES,
    closers: CLOSERS_ES,
    defaultSender: "Persona Afectada",
    signOffEmail: "Atentamente,",
    signOffLetter: "Cordialmente,",
    recipientPrefix: (n) => `Estimado/a ${n}`,
    matterConnector: " el siguiente asunto:",
    requestLine: "Le solicito amablemente que revise este problema lo antes posible y proporcione una solución adecuada.",
    subjectLabel: "Queja sobre",
    urgentLabel: "URGENTE: ",
    formalLabel: "Queja Formal: ",
  },
  French: {
    salutations: SALUTATIONS_FR,
    openers: TONE_OPENERS_FR,
    severity: SEVERITY_LINES_FR,
    closers: CLOSERS_FR,
    defaultSender: "Personne Concernée",
    signOffEmail: "Cordialement,",
    signOffLetter: "Veuillez agréer mes salutations distinguées,",
    recipientPrefix: (n) => `Cher/Chère ${n}`,
    matterConnector: " la question suivante :",
    requestLine: "Je vous demande aimablement de bien vouloir examiner ce problème dans les meilleurs délais et de fournir une solution appropriée.",
    subjectLabel: "Réclamation concernant",
    urgentLabel: "URGENT : ",
    formalLabel: "Réclamation Formelle : ",
  },
};

/* -------- Text polishing (English only) -------- */
function polishText(raw: string, language: Language): string {
  let t = raw.trim().replace(/\s+/g, " ");
  if (language === "English") {
    t = t.replace(/(^|[.!?]\s+)([a-z])/g, (_, p1, p2) => p1 + p2.toUpperCase());
    const map: Record<string, string> = {
      "dont": "do not", "doesnt": "does not", "didnt": "did not",
      "cant": "cannot", "wont": "will not", "isnt": "is not",
      "wasnt": "was not", "werent": "were not", "havent": "have not",
      "hasnt": "has not", "hadnt": "had not", "im": "I am",
      "ive": "I have", "id": "I would", "ill": "I will",
      "u": "you", "ur": "your", "pls": "please", "plz": "please",
      "thx": "thank you", "tnx": "thank you", "asap": "as soon as possible",
    };
    t = t.replace(/\b([a-zA-Z]+)\b/g, (m) => {
      const low = m.toLowerCase();
      return map[low] ? (m[0] === m[0].toUpperCase() ? map[low][0].toUpperCase() + map[low].slice(1) : map[low]) : m;
    });
    t = t.replace(/\bi\b/g, "I");
  }
  if (!/[.!?。।]$/.test(t)) t += language === "Hindi" ? "।" : ".";
  return t;
}

function buildSubject(input: ComplaintInput): string {
  const pack = PACKS[input.language];
  const polished = polishText(input.issue, input.language);
  const short = polished.length > 80 ? polished.slice(0, 77) + "..." : polished.replace(/[.।]$/, "");
  const prefix =
    input.severity === "High" ? pack.urgentLabel : input.tone === "Strict" ? pack.formalLabel : "";
  return `${prefix}${pack.subjectLabel} ${short}`;
}

function buildBody(input: ComplaintInput): string {
  const pack = PACKS[input.language];
  const sal = pack.salutations[input.complaintType];
  const opener = pack.openers[input.tone];
  const sev = pack.severity[input.severity];
  const close = pack.closers[input.tone];
  const issue = polishText(input.issue, input.language);
  const sender = input.senderName?.trim() || pack.defaultSender;
  const recipient = input.recipientName?.trim();
  const greet = recipient ? pack.recipientPrefix(recipient) : sal;

  const para1 = `${opener}${pack.matterConnector} ${issue}`;
  const para2 = sev;
  const para3 = `${pack.requestLine} ${close}`;

  return [
    `${greet},`,
    "",
    para1,
    "",
    para2,
    "",
    para3,
    "",
    input.outputFormat === "Letter" ? pack.signOffLetter : pack.signOffEmail,
    sender,
  ].join("\n");
}

function calculateScore(input: ComplaintInput, body: string): { score: number; notes: string[] } {
  const notes: string[] = [];
  let score = 50;
  const wordCount = input.issue.trim().split(/\s+/).filter(Boolean).length;

  if (wordCount >= 8) { score += 15; notes.push("Good issue length"); }
  else { notes.push("Issue is brief — add more details for clarity"); }

  if (wordCount >= 20) score += 5;
  if (/\d/.test(input.issue)) { score += 8; notes.push("Includes specific numbers/dates"); }
  else { notes.push("Tip: include dates or amounts for stronger complaint"); }

  if (input.recipientName) { score += 7; notes.push("Recipient personalized"); }
  if (input.senderName) { score += 5; notes.push("Sender identified"); }

  if (body.length > 400) score += 5;
  if (input.tone === "Polite") { score += 5; notes.push("Professional polite tone"); }
  if (input.severity === "High" && input.tone === "Polite") {
    notes.push("Tip: a stricter tone may suit High severity");
  }

  score = Math.min(100, Math.max(0, score));
  return { score, notes };
}

export function generateComplaint(input: ComplaintInput): GeneratedComplaint {
  const subject = buildSubject(input);
  const body = buildBody(input);
  const { score, notes } = calculateScore(input, body);
  return { subject, body, qualityScore: score, qualityNotes: notes };
}
