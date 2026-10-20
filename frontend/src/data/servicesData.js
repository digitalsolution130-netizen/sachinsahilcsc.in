export const SERVICES_LIST = [
  // 1. User Requested Services (With Exact Requested Prices)
  {
    id: "new-voter-card",
    name: "New Voter Card Apply",
    nameHi: "नया वोटर कार्ड आवेदन",
    fee: 99,
    icon: "🗳️",
    desc: "Apply fresh EPIC voter identity card online (Election Commission Form 6)",
    requiredDocs: [
      "पासपोर्ट साइज रंगीन फोटो (Passport Size Photo)",
      "आयु प्रमाण पत्र (आधार कार्ड / 10वीं मार्कशीट / जन्म प्रमाण पत्र - Age Proof)",
      "पते का प्रमाण पत्र (बिजली बिल / पानी बिल / राशन कार्ड / आधार - Address Proof)",
      "परिवार के किसी सदस्य का वोटर कार्ड नंबर (Family Member's EPIC / Voter Card No)"
    ]
  },
  {
    id: "voter-card-correction",
    name: "Voter Card Correction",
    nameHi: "वोटर कार्ड सुधार / संशोधन",
    fee: 99,
    icon: "✏️",
    desc: "Correction in voter card name, photo, age or address (Form 8 online)",
    requiredDocs: [
      "मौजूदा वोटर आईडी कार्ड की कॉपी (Existing Voter ID Copy)",
      "आधार कार्ड (Aadhaar Card)",
      "सुधार संबंधित वैध प्रमाण (10वीं मार्कशीट / नया पता प्रमाण / गजट नोटिफिकेशन)",
      "नवीनतम पासपोर्ट साइज फोटो (यदि फोटो बदलनी हो)"
    ]
  },
  {
    id: "aadhar-address-change",
    name: "Aadhar Card Address Change",
    nameHi: "आधार कार्ड पता परिवर्तन",
    fee: 140,
    icon: "🆔",
    desc: "Online address update & correction in Aadhaar with valid proof of residence",
    requiredDocs: [
      "आधार कार्ड की दोनों तरफ की कॉपी (Aadhaar Card Front & Back)",
      "नया पता प्रमाण (बिजली बिल / बैंक पासबुक / रेंट एग्रीमेंट / वोटर कार्ड / पासपोर्ट)",
      "आधार से लिंक्ड सक्रिय मोबाइल नंबर (OTP सत्यापन अनिवार्य है)"
    ]
  },
  {
    id: "new-pan-card",
    name: "New PAN Card Apply",
    nameHi: "नया पैन कार्ड आवेदन",
    fee: 180,
    icon: "🪪",
    desc: "Fresh NSDL / UTI PAN card application with physical PVC card delivery",
    requiredDocs: [
      "आधार कार्ड (Aadhaar Card with correct Name & DOB)",
      "2 पासपोर्ट साइज रंगीन फोटो (2 Passport Size Color Photos)",
      "सादे सफेद कागज पर आवेदक के हस्ताक्षर (Applicant Signature on White Paper)"
    ]
  },
  {
    id: "pan-card-correction",
    name: "PAN Card Correction",
    nameHi: "पैन कार्ड सुधार / संशोधन",
    fee: 180,
    icon: "📝",
    desc: "Correction in PAN card name, date of birth, father name or photo",
    requiredDocs: [
      "मौजूदा पैन कार्ड की प्रति (Existing PAN Card Copy)",
      "आधार कार्ड (Aadhaar Card)",
      "आवेदक का पासपोर्ट साइज फोटो व हस्ताक्षर (Photo & Signature)",
      "नाम / जन्मतिथि / पिता के नाम में सुधार हेतु वैध प्रमाण (10वीं मार्कशीट / गजट)"
    ]
  },
  {
    id: "ration-card-apply",
    name: "Ration Card Apply",
    nameHi: "नया राशन कार्ड आवेदन",
    fee: 99,
    icon: "🌾",
    desc: "Apply online for new family ration card & digitized food safety slip",
    requiredDocs: [
      "परिवार के मुखिया की पासपोर्ट साइज फोटो (Head of Family Photo)",
      "परिवार के सभी सदस्यों के आधार कार्ड (All Family Members' Aadhaar Cards)",
      "आय प्रमाण पत्र या वेतन पर्ची (Income Certificate / Salary Slip)",
      "निवास प्रमाण पत्र / बिजली बिल / गैस कनेक्शन कॉपी (Residence Proof / Electricity Bill)",
      "बैंक खाता पासबुक की प्रथम पृष्ठ की प्रति (Bank Passbook Copy)"
    ]
  },
  {
    id: "udyam-registration",
    name: "Udyam Registration",
    nameHi: "उद्यम पंजीकरण (MSME)",
    fee: 99,
    icon: "🏭",
    desc: "Government MSME business enterprise registration & official certificate",
    requiredDocs: [
      "व्यापार मालिक/प्रोपराइटर का आधार कार्ड (Owner Aadhaar Card)",
      "मालिक या फर्म का पैन कार्ड (Owner / Firm PAN Card)",
      "बैंक खाता विवरण या कैंसिल्ड चेक (Bank Account Details / Cancelled Cheque)",
      "दुकान/कार्यालय का बिजली बिल या रेंट एग्रीमेंट (Business Address Proof)"
    ]
  },
  {
    id: "gst-no-apply",
    name: "GST No Apply",
    nameHi: "जीएसटी नंबर आवेदन",
    fee: 499,
    icon: "📊",
    desc: "New GST registration application, documentation & tax profile creation",
    requiredDocs: [
      "प्रोपराइटर/पार्टनर का पैन कार्ड एवं आधार कार्ड (PAN & Aadhaar Card)",
      "पासपोर्ट साइज रंगीन फोटो (Passport Size Photo)",
      "व्यावसायिक स्थल का स्वामित्व प्रमाण / बिजली बिल / रेंट एग्रीमेंट (Business Premises Proof)",
      "बैंक खाता पासबुक या कैंसिल्ड चेक (Bank Passbook / Cancelled Cheque)",
      "व्यापार का नाम व व्यापारिक वस्तुओं/सेवाओं की सूची (Trade Name & Activities)"
    ]
  },
  {
    id: "itr-filing",
    name: "ITR Filing",
    nameHi: "आईटीआर फाइलिंग (Income Tax Return)",
    fee: 599,
    icon: "📑",
    desc: "Income tax e-filing for salary, business, traders with instant ITR-V receipt",
    requiredDocs: [
      "पैन कार्ड एवं आधार कार्ड (PAN & Aadhaar Card)",
      "फॉर्म 16 / वेतन पर्ची (Form 16 / Salary Slips for Salaried)",
      "सभी सक्रिय बैंक खातों का पिछले 1 वर्ष का स्टेटमेंट (1 Year Bank Statement)",
      "निवेश बचत रसीदें / एलआईसी / होम लोन ब्याज प्रमाण पत्र (Tax Saving 80C/80D Proofs)",
      "व्यापारिक आय हेतु खाता-बही / बिक्री विवरण (यदि लागू हो)"
    ]
  },
  {
    id: "loan-apply",
    name: "Loan Apply",
    nameHi: "लोन आवेदन (Personal / Business / Mudra)",
    fee: 99,
    icon: "💰",
    desc: "Mudra loan, business loan, personal loan application & document assistance",
    requiredDocs: [
      "आवेदक का आधार कार्ड एवं पैन कार्ड (Aadhaar & PAN Card)",
      "पिछले 6 महीने का बैंक स्टेटमेंट (Last 6 Months Bank Statement)",
      "पिछले 2 वर्षों की ITR या वेतन पर्ची (2 Years ITR / Salary Slips)",
      "निवास प्रमाण पत्र (बिजली बिल / वोटर कार्ड / राशन कार्ड)",
      "2 पासपोर्ट साइज फोटो (2 Passport Size Photos)"
    ]
  },
  {
    id: "create-property-id",
    name: "Create New Property ID",
    nameHi: "नई प्रॉपर्टी आईडी बनाएं",
    fee: 199,
    icon: "🏠",
    desc: "Municipal corporation / ULB new property ID creation & registration",
    requiredDocs: [
      "रजिस्ट्री / सेल डीड / बैनामा की प्रति (Property Registry / Sale Deed / Ownership Proof)",
      "संपत्ति मालिक का आधार कार्ड एवं पैन कार्ड (Owner Aadhaar & PAN Card)",
      "संपत्ति/मकान के मुख्य द्वार की नवीनतम फोटो (Property Front Photo)",
      "पुराना बिजली बिल या नगर निगम हाउस टैक्स रसीद (Electricity Bill / Old Tax Slip)"
    ]
  },
  {
    id: "property-id-correction",
    name: "Correction in Property ID",
    nameHi: "प्रॉपर्टी आईडी में सुधार",
    fee: 99,
    icon: "🛠️",
    desc: "Correction of name, area, address or details in registered property ID",
    requiredDocs: [
      "मौजूदा प्रॉपर्टी आईडी बिल/रसीद (Current Property ID Bill / Receipt)",
      "रजिस्ट्री / सेल डीड / इंतकाल की प्रति (Registry / Sale Deed / Mutation Copy)",
      "संपत्ति मालिक का आधार कार्ड (Owner Aadhaar Card)",
      "नाम/क्षेत्रफल/पता सुधार संबंधित वैध प्रमाण (Correction Supporting Document)"
    ]
  },
  {
    id: "rent-agreement",
    name: "Rent Agreement",
    nameHi: "रेंट एग्रीमेंट (किरायानामा)",
    fee: 199,
    icon: "📜",
    desc: "Legal online rent agreement drafting, verification & e-stamp format",
    requiredDocs: [
      "मकान मालिक का आधार कार्ड एवं पैन कार्ड (Landlord Aadhaar & PAN Card)",
      "किरायेदार का आधार कार्ड एवं पैन कार्ड (Tenant Aadhaar & PAN Card)",
      "किराये की संपत्ति का बिजली बिल या म्युनिसिपल टैक्स रसीद (Property Electricity Bill)",
      "2 गवाहों के आधार कार्ड की प्रतियां (2 Witnesses Aadhaar Cards)"
    ]
  },
  {
    id: "other-agreement",
    name: "Other Agreement",
    nameHi: "अन्य एग्रीमेंट / शपथ पत्र",
    fee: 199,
    icon: "⚖️",
    desc: "Affidavit, partnership deed, declaration & customized legal agreements",
    requiredDocs: [
      "प्रथम एवं द्वितीय पक्ष के आधार कार्ड (Both Parties Aadhaar Cards)",
      "दोनों पक्षों के पैन कार्ड (Both Parties PAN Cards)",
      "एग्रीमेंट का प्रारूप / मुख्य शर्तें (Draft Agreement / Key Terms & Conditions)",
      "2 गवाहों के पहचान पत्र (Witness ID Proofs)"
    ]
  },
  {
    id: "epfo-withdrawal-kyc",
    name: "EPFO (Withdrawal & KYC)",
    nameHi: "ईपीएफओ (पीएफ निकासी एवं केवाईसी)",
    fee: 99,
    icon: "🏦",
    desc: "PF advance withdrawal claim (Form 19/31), bank KYC update & UAN help",
    requiredDocs: [
      "यूनिवर्सल अकाउंट नंबर (UAN Number) एवं पासवर्ड",
      "आधार कार्ड एवं पैन कार्ड (Aadhaar & PAN Card)",
      "बैंक पासबुक या कैंसिल्ड चेक (जिसमें नाम, खाता सं. व IFSC स्पष्ट अंकित हो)",
      "कंपनी छोड़ने की तिथि (Date of Exit, पूर्ण पीएफ निकासी हेतु आवश्यक)"
    ]
  },
  {
    id: "esic-hakdari",
    name: "ESIC (Hakdari)",
    nameHi: "ईएसआईसी (हकदारी एवं मेडिकल क्लेम)",
    fee: 99,
    icon: "🏥",
    desc: "Employees State Insurance eligibility verification, Pehchan card & claims",
    requiredDocs: [
      "ईएसआईसी बीमा नंबर / ई-पहचान पत्र (ESIC Insurance No / Pehchan Card)",
      "कर्मचारी एवं आश्रित परिवारजनों के आधार कार्ड (Aadhaar of Employee & Dependents)",
      "बैंक खाता पासबुक की प्रति (Bank Passbook Copy)",
      "कंपनी जॉइनिंग स्लिप / मेडिकल उपचार पर्ची (Joining Slip / Medical Papers)"
    ]
  },

  // 2. Additional Essential Citizen & E-Governance Services
  {
    id: "voter-id",
    name: "Voter ID Card Download",
    nameHi: "वोटर आईडी कार्ड डाउनलोड",
    fee: 100,
    icon: "🗳️",
    desc: "Download digital EPIC voter slip & official election card",
    requiredDocs: [
      "वोटर कार्ड नंबर (EPIC Number) या आवेदक का नाम, पिता का नाम व विधानसभा",
      "वोटर आईडी में पंजीकृत मोबाइल नंबर (OTP सत्यापन के लिए)"
    ]
  },
  {
    id: "lost-id",
    name: "Lost ID Card Search & Download",
    nameHi: "खोया हुआ पहचान पत्र खोजें",
    fee: 500,
    icon: "🆔",
    desc: "Search & download lost government identity card",
    requiredDocs: [
      "संबंधित पहचान पत्र का प्रकार (आधार / पैन / वोटर / राशन / आरसी)",
      "पहचान पत्र धारक का नाम, जन्मतिथि व पिता का नाम",
      "पुराने पहचान पत्र की प्रति या कोई भी संदर्भ नंबर (यदि उपलब्ध हो)"
    ]
  },
  {
    id: "ration-card",
    name: "Ration Card Download",
    nameHi: "राशन कार्ड डाउनलोड",
    fee: 100,
    icon: "🌾",
    desc: "Find & download digitized family ration card slip",
    requiredDocs: [
      "राशन कार्ड नंबर (Ration Card No) या परिवार पहचान पत्र (Family ID / PPP)",
      "परिवार के मुखिया का आधार कार्ड (Head of Family Aadhaar)"
    ]
  },
  {
    id: "find-pan",
    name: "Find Linked PAN Card Number",
    nameHi: "लिंक्ड पैन कार्ड नंबर खोजें",
    fee: 150,
    icon: "🔍",
    desc: "Locate linked PAN card number via Aadhaar/Records",
    requiredDocs: [
      "आधार कार्ड नंबर (Aadhaar Card Number)",
      "आधार कार्ड के अनुसार पूरा नाम एवं जन्मतिथि (Full Name & DOB)",
      "पिता का पूरा नाम (Father's Full Name)"
    ]
  },
  {
    id: "family-id",
    name: "Family ID Download (Without OTP)",
    nameHi: "फैमिली आईडी (बिना OTP)",
    fee: 50,
    icon: "👨‍👩‍👧‍👦",
    desc: "Parivar Pehchan Patra instant copy without OTP",
    requiredDocs: [
      "आधार कार्ड नंबर (Aadhaar Card Number) या 8-अंकों का Family ID नंबर",
      "परिवार के किसी सदस्य का नाम व मोबाइल नंबर"
    ]
  },
  {
    id: "passport",
    name: "Passport Application Service",
    nameHi: "पासपोर्ट सेवा आवेदन",
    fee: 250,
    icon: "🛂",
    desc: "Fresh & reissue passport appointment and application",
    requiredDocs: [
      "आधार कार्ड (Aadhaar Card)",
      "पैन कार्ड / वोटर पहचान पत्र (PAN or Voter ID)",
      "10वीं की अंकतालिका / Non-ECR प्रमाण पत्र (10th Board Certificate)",
      "जन्म प्रमाण पत्र (Birth Certificate) या जन्मतिथि प्रमाण"
    ]
  },
  {
    id: "income-cert",
    name: "Income Certificate",
    nameHi: "आय प्रमाण पत्र",
    fee: 100,
    icon: "📄",
    desc: "Official state government income verification certificate",
    requiredDocs: [
      "आवेदक का आधार कार्ड (Aadhaar Card)",
      "परिवार पहचान पत्र (Family ID / PPP)",
      "राशन कार्ड / बिजली बिल (Residence Proof)",
      "पटवारी रिपोर्ट / वेतन पर्ची / आय स्व-घोषणा पत्र (Salary Slip / Patwari Verification)"
    ]
  },
  {
    id: "caste-cert",
    name: "Caste Certificate",
    nameHi: "जाति प्रमाण पत्र",
    fee: 100,
    icon: "📜",
    desc: "SC / BC / OBC caste document verification & application",
    requiredDocs: [
      "आवेदक का आधार कार्ड (Aadhaar Card)",
      "परिवार पहचान पत्र (Family ID / PPP)",
      "पिता या दादा का पुराना जाति प्रमाण पत्र (Father/Family Caste Certificate)",
      "पटवारी या स्थानीय पार्षद की सत्यापन रिपोर्ट (Local Authority Verification)"
    ]
  },
  {
    id: "ews-cert",
    name: "EWS Certificate",
    nameHi: "ईडब्ल्यूएस प्रमाण पत्र",
    fee: 100,
    icon: "🏛️",
    desc: "Economically Weaker Section citizen certificate",
    requiredDocs: [
      "आवेदक का आधार कार्ड एवं पैन कार्ड (Aadhaar & PAN Card)",
      "नवीनतम आय प्रमाण पत्र (Latest Income Certificate)",
      "जमीन की फर्द / मकान संपत्ति दस्तावेज (Land / Property Ownership Document)",
      "परिवार पहचान पत्र (Family ID) एवं स्व-घोषणा पत्र"
    ]
  },
  {
    id: "water-bill",
    name: "Water Bill Payment & Receipt",
    nameHi: "पानी का बिल भुगतान",
    fee: 10,
    icon: "💧",
    desc: "Jal board water bill payment & instant e-receipt",
    requiredDocs: [
      "जल बोर्ड उपभोक्ता खाता संख्या (Water Consumer / Account Number)",
      "पुराना पानी का बिल (यदि उपलब्ध हो)"
    ]
  },
  {
    id: "electricity-bill",
    name: "Electricity Bill Payment",
    nameHi: "बिजली बिल भुगतान",
    fee: 10,
    icon: "⚡",
    desc: "Bijli bill pay & download certified transaction receipt",
    requiredDocs: [
      "बिजली उपभोक्ता खाता संख्या / के-नंबर (Electricity Consumer / Account No)",
      "बिजली वितरण निगम का नाम (DHBVN / UHBVN / State Electricity Board)"
    ]
  },
  {
    id: "senior-card",
    name: "Senior Citizen Card Apply",
    nameHi: "वरिष्ठ नागरिक पहचान पत्र",
    fee: 50,
    icon: "👴",
    desc: "Official application for senior citizen identity card",
    requiredDocs: [
      "आधार कार्ड (उम्र 60 वर्ष या अधिक प्रमाणित - Age Proof 60+ Years)",
      "पासपोर्ट साइज रंगीन फोटो (Passport Size Photo)",
      "निवास प्रमाण पत्र (बिजली बिल / राशन कार्ड)",
      "ब्लड ग्रुप रिपोर्ट (यदि उपलब्ध हो)"
    ]
  },
  {
    id: "pvc-card",
    name: "PVC Smart Card Order",
    nameHi: "पीवीसी स्मार्ट कार्ड ऑर्डर",
    fee: 100,
    icon: "💳",
    desc: "High durability plastic smart card door-step delivery",
    requiredDocs: [
      "प्रिंट किए जाने वाले कार्ड की ओरिजिनल पीडीएफ या स्पष्ट फोटो (Original PDF/Photo)",
      "संबंधित कार्ड नंबर (आधार / पैन / वोटर / आयुष्मान)",
      "कार्ड डिलीवरी हेतु पिन कोड सहित पूरा डाक पता (Delivery Address with PIN)"
    ]
  },
  {
    id: "farmer-id",
    name: "Farmer ID Download",
    nameHi: "किसान आईडी / पीएम किसान",
    fee: 150,
    icon: "🌾",
    desc: "Kisan ID / PM Kisan registration record copy",
    requiredDocs: [
      "किसान का आधार कार्ड (Farmer Aadhaar Card)",
      "बैंक खाता पासबुक (Bank Passbook Copy for DBT)",
      "जमीन की जमाबंदी / फर्द / खसरा-खतौनी नकल (Land Ownership Documents)"
    ]
  },
  {
    id: "rc-print",
    name: "RC Print / Download",
    nameHi: "गाड़ी की आरसी (RC) प्रिंट",
    fee: 150,
    icon: "🚗",
    desc: "Vehicle registration certificate print & download",
    requiredDocs: [
      "गाड़ी का रजिस्ट्रेशन नंबर (Vehicle Registration / Plate Number)",
      "चेसिस नंबर के अंतिम 5 अंक (Last 5 Digits of Chassis Number)"
    ]
  },
  {
    id: "dl-print",
    name: "Driving Licence (DL) Print",
    nameHi: "ड्राइविंग लाइसेंस (DL) प्रिंट",
    fee: 100,
    icon: "🪪",
    desc: "Sarathi driving licence digital PDF card copy",
    requiredDocs: [
      "ड्राइविंग लाइसेंस नंबर (Driving Licence Number)",
      "जन्मतिथि (Date of Birth as per DL records)",
      "या सारथी आवेदन संख्या (Sarathi Application Number)"
    ]
  },
  {
    id: "voter-mobile",
    name: "Voter ID Mobile Link",
    nameHi: "वोटर आईडी में मोबाइल लिंक",
    fee: 100,
    icon: "📱",
    desc: "Mobile number update & correction service in voter card",
    requiredDocs: [
      "वोटर कार्ड नंबर (EPIC / Voter Card Number)",
      "लिंक करने हेतु सक्रिय नया मोबाइल नंबर (Mobile Number for OTP)",
      "सत्यापन हेतु आधार कार्ड (Aadhaar Card for Verification)"
    ]
  }
];
