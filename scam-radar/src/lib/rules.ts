export type Language = "en" | "fr" | "ar";

export interface RulePattern {
  en: RegExp[];
  fr: RegExp[];
  ar: RegExp[];
}

export interface Rule {
  id: string;
  name: string;
  weight: number;
  patterns: RulePattern;
}

const FR_BOUNDARY = "(?:^|\\s|[,.;:!?])";
const FR_BOUNDARY_END = "(?:$|\\s|[,.;:!?])";

function fr(pattern: string): RegExp {
  return new RegExp(`${FR_BOUNDARY}(?:${pattern})${FR_BOUNDARY_END}`, "gi");
}

export const RULES: Rule[] = [
  {
    id: "urgency",
    name: "Urgency Pressure",
    weight: 15,
    patterns: {
      en: [
        /\b(urgent|immediately|right now|asap|hurry|quickly|within \d+ (hour|minute|day)s?|deadline|expire|last chance|act now|limited time|time sensitive)\b/gi,
        /\b(need (?:it|this|money) (?:today|now|urgently)|emergency|critical|pressing)\b/gi,
      ],
      fr: [
        fr("urgent|immédiatement|tout de suite|au plus vite|dépêchez|vite|dans \\d+ (heure|minute|jour)s?|échéance|expire|dernière chance|agissez maintenant|temps limité|pressant"),
        fr("besoin (?:d'argent|de cela) (?:aujourd'hui|maintenant|urgemment)|urgence|critique|pressant"),
      ],
      ar: [
        /(عاجل|عاجلاً|عاجلا|فوري|فوراً|فورا|فورًا|حالاً|حالا|بسرعة|الآن|خلال \d+ (?:ساعة|ساعتين|دقيقة|دقائق|يوم|أيام)|مهلة|ينتهي|فرصة أخيرة|تصرف الآن|وقت محدود|طارئ|مباشرة)/gi,
        /(?:لا تتأخر|لا تنتظر|آخر فرصة|سارع|بادر)/gi,
      ],
    },
  },
  {
    id: "credential_request",
    name: "Credential Request",
    weight: 20,
    patterns: {
      en: [
        /\b(password|pin|otp|verification code|security code|login credentials|username|account number|routing number|cvv|card number|expiry|social security|ssn|date of birth|mother'?s maiden name)\b/gi,
        /\b(send (?:me|us) (?:your|the) (?:password|pin|otp|code|credentials)|verify your (?:account|identity|password|pin))\b/gi,
      ],
      fr: [
        fr("mot de passe|code pin|otp|code de vérification|code sécurité|identifiants|nom d'utilisateur|numéro de compte|numéro de routage|cryptogramme|numéro de carte|date d'expiration|sécurité sociale|date de naissance|nom de jeune fille"),
        fr("envoyez (?:moi|nous) (?:votre|le) (?:mot de passe|pin|code|identifiants)|vérifiez votre (?:compte|identité|mot de passe|pin)"),
      ],
      ar: [
        /(الرقم السري|الرقم السرية|رقم سري|كلمة المرور|كلمة السر|كلمة سرية|رمز التحقق|رمز تحقق|رمز الأمان|رمز أمان|كود التحقق|كود تحقق|بيانات الدخول|رمز الدخول|رقم الحساب|اسم المستخدم|التوقيع الرقمي|سي في في|رقم البطاقة)/gi,
        /(?:[أا]رسل|اكتب|شاركنا|زودنا ب|حول لنا)\s*(?:لي|لنا|ب)?\s*(?:كلمة|الرمز|الكود|رمز|بيانات|رقم|الحساب)/gi,
        /(?:تحقق|اكد|أكد|تأكيد|تفعيل)\s*(?:من)?\s*(?:حسابك|هويتك|كلمة|الرمز|بيانات)/gi,
      ],
    },
  },
  {
    id: "suspicious_link",
    name: "Suspicious Link",
    weight: 18,
    patterns: {
      en: [
        /\b(click (?:here|this link|below|the link)|tap (?:here|this link|below)|follow (?:this link|the link)|visit (?:this|the) (?:link|site|website|page)|check (?:this|the) (?:link|site))\b/gi,
        /\b(bit\.ly|tinyurl|t\.co|goo\.gl|short\.link|cutt\.ly|rb\.gg|is\.gd|v\.gd|shorturl|link shortener)\b/gi,
        /https?:\/\/[^\s]+\.(?:tk|ml|ga|cf|xyz|top|club|work|date|bid|loan|racing|download|stream|review|party|science|cricket|accountant|faith|trade|gdn|men|win|click|link|country|market|center|online|site|website|web|page|info|xyz)[\/\s]/gi,
      ],
      fr: [
        fr("cliquez (?:ici|ce lien|ci-dessous)|appuyez (?:ici|ce lien|ci-dessous)|suivez (?:ce lien|le lien)|visitez (?:ce|le) (?:lien|site|page)|vérifiez (?:ce|le) (?:lien|site)"),
        /\b(bit\.ly|tinyurl|t\.co|goo\.gl|short\.link|cutt\.ly|rb\.gg|is\.gd|v\.gd|shorturl|raccourcisseur)\b/gi,
        /https?:\/\/[^\s]+\.(?:tk|ml|ga|cf|xyz|top|club|work|date|bid|loan|racing|download|stream|review|party|science|cricket|accountant|faith|trade|gdn|men|win|click|link|country|market|center|online|site|website|web|page|info|xyz)[\/\s]/gi,
      ],
      ar: [
        /(اضغط (?:هنا|هذا الرابط|أسفل)|انقر (?:هنا|هذا الرابط|أسفل)|تابع (?:هذا الرابط|الرابط)|قم بزيارة (?:هذا|الرابط|الموقع|الصفحة)|تحقق من (?:هذا|الرابط|الموقع))/gi,
        /(bit\.ly|tinyurl|t\.co|goo\.gl|short\.link|cutt\.ly|rb\.gg|is\.gd|v\.gd|shorturl|مختصر رابط)/gi,
        /https?:\/\/[^\s]+\.(?:tk|ml|ga|cf|xyz|top|club|work|date|bid|loan|racing|download|stream|review|party|science|cricket|accountant|faith|trade|gdn|men|win|click|link|country|market|center|online|site|website|web|page|info|xyz)[\/\s]/gi,
      ],
    },
  },
  {
    id: "prize_claim",
    name: "Prize/Lottery Claim",
    weight: 16,
    patterns: {
      en: [
        /\b(won|winner|congratulations|prize|lottery|jackpot|giveaway|reward|claim (?:your|the) (?:prize|reward|winnings)|you (?:have|'ve) won|selected (?:as|for) (?:a|the) winner)\b/gi,
        /\b(grand prize|cash prize|million|billion|lottery winner|lucky winner|sweepstakes|contest|drawing)\b/gi,
      ],
      fr: [
        fr("gagné|gagnant|félicitations|prix|loterie|jackpot|cadeau|récompense|réclamez (?:votre|le) (?:prix|récompense|gain)|vous avez gagné|sélectionné (?:comme|pour) (?:un|le) gagnant"),
        fr("grand prix|prix en argent|million|milliard|gagnant de loterie|gagnant chanceux|tirage au sort|concours|tirage"),
      ],
      ar: [
        /(فزت|فائز|تهانينا|جائزة|يانصيب|جائزة كبرى|هدية|مكافأة|اطلب (?:جائزتك|مكافأتك|أرباحك)|لقد فزت|تم اختيارك (?: كفائز|للفوز))/gi,
        /(الجائزة الكبرى|جائزة نقدية|مليون|مليار|فائز يانصيب|فائز محظوظ|سحب عشوائي|مسابقة|قرعة)/gi,
      ],
    },
  },
  {
    id: "upfront_fee",
    name: "Upfront Fee Required",
    weight: 18,
    patterns: {
      en: [
        /\b(processing fee|administrative fee|release fee|transfer fee|clearance fee|activation fee|registration fee|verification fee|deposit|upfront|advance payment|pay (?:to|for) (?:release|unlock|activate|verify|process|receive|claim))\b/gi,
        /\b(send (?:money|funds|payment) (?:to|first|before|upfront)|must pay|required to pay|fee (?:required|needed|must be paid))\b/gi,
      ],
      fr: [
        fr("frais de traitement|frais administratifs|frais de libération|frais de transfert|frais de dédouanement|frais d'activation|frais d'inscription|frais de vérification|dépôt|avance|paiement anticipé|payez (?:pour|afin de) (?:libérer|débloquer|activer|vérifier|traiter|recevoir|réclamer)"),
        fr("envoyez (?:de l'argent|des fonds|un paiement) (?:à|d'abord|avant|en avance)|doit payer|paiement requis|frais (?:requis|nécessaires|doivent être payés)"),
      ],
      ar: [
        /(رسوم معالجة|رسوم إدارية|رسوم تحرير|رسوم تحويل|رسوم تخليص|رسوم تفعيل|رسوم تسجيل|رسوم تحقق|إيداع|مقدم|دفعة مقدمة|ادفع (?:لإطلاق|لإلغاء قفل|لتفعيل|للتحقق|لمعالجة|لاستلام|للمطالبة))/gi,
        /(أرسل (?:مال|أموال|دفعة) (?:إلى|أولاً|قبل|مقدماً)|يجب الدفع|دفع مطلوب|رسوم (?:مطلوبة|ضرورية|يجب دفعها))/gi,
      ],
    },
  },
  {
    id: "threat",
    name: "Threat/Intimidation",
    weight: 17,
    patterns: {
      en: [
        /\b(arrest|legal action|lawsuit|court|police|authorities|jail|prison|fine|penalty|prosecution|legal consequences|warrant|summons|investigation|frozen|seized|confiscated|legal notice)\b/gi,
        /\b(will be (?:arrested|sued|prosecuted|fined|jailed)|face (?:legal|legal action|charges|consequences)|risk (?:arrest|prosecution|legal action))\b/gi,
      ],
      fr: [
        fr("arrestation|action en justice|poursuite|tribunal|police|autorités|prison|amende|pénalité|poursuite|conséquences juridiques|mandat|convocation|enquête|gelé|saisi|confisqué|avis légal"),
        fr("vous serez (?:arrêté|poursuivi|condamné|emprisonné)|encourez (?:des poursuites|des charges|des conséquences)|risquez (?:l'arrestation|la poursuite|une action en justice)"),
      ],
      ar: [
        /(اعتقال|إجراء قانوني|دعوى|محكمة|شرطة|سلطات|سجن|غرامة|عقوبة|ملاحقة|عواقب قانونية|مذكرة|استدعاء|تحقيق|مجمد|مصادرة|إشعار قانوني)/gi,
        /(ستكون (?:معتقل|مطلوب|مجرم|مسجون)|تواجه (?:إجراء قانوني|اتهامات|عواقب)|تخاطر (?:بالاعتقال|بالملاحقة|بإجراء قانوني))/gi,
      ],
    },
  },
  {
    id: "impersonation",
    name: "Impersonation",
    weight: 15,
    patterns: {
      en: [
        /\b(i am|i'm|this is|calling from|representing|on behalf of|official|agent|officer|representative|department|division|bureau|agency|organization|company|bank|government|irs|fbi|cia|homeland|social security|medicare|medicaid|tax|revenue|customs|immigration)\b/gi,
        /\b(verification department|security department|fraud department|compliance department|customer service|support team|technical support|help desk)\b/gi,
      ],
      fr: [
        fr("je suis|c'est|j'appelle de|représentant|au nom de|officiel|agent|officier|représentant|département|division|bureau|agence|organisation|entreprise|banque|gouvernement|impôts|police|douanes|immigration|sécurité sociale"),
        fr("département de vérification|département sécurité|département fraude|département conformité|service client|équipe support|support technique|assistance"),
      ],
      ar: [
        /(أنا|هذا|أتصل من|أمثل|باسم|رسمي|وكيل|ضابط|ممثل|قسم|إدارة|مكتب|وكالة|منظمة|شركة|بنك|حكومة|ضرائب|شرطة|جمارك|هجرة|ضمان اجتماعي)/gi,
        /(قسم التحقق|قسم الأمن|قسم الاحتيال|قسم الامتثال|خدمة العملاء|فريق الدعم|الدعم الفني|مساعدة)/gi,
      ],
    },
  },
  {
    id: "unusual_payment",
    name: "Unusual Payment Method",
    weight: 16,
    patterns: {
      en: [
        /\b(gift card|itunes|google play|steam|amazon|walmart|target|best buy|prepaid card|bitcoin|btc|crypto|cryptocurrency|ethereum|eth|usdt|tether|wallet|blockchain|moneygram|western union|wire transfer|bank transfer|zelle|venmo|cashapp|cash app|paypal friends|family and friends|money order|cashier'?s check)\b/gi,
        /\b(pay with (?:gift card|crypto|bitcoin|wire|moneygram|western union)|send (?:crypto|bitcoin|cash|gift card))\b/gi,
      ],
      fr: [
        fr("carte cadeau|itunes|google play|steam|amazon|walmart|target|best buy|carte prépayée|bitcoin|btc|crypto|cryptomonnaie|ethereum|eth|usdt|tether|portefeuille|blockchain|moneygram|western union|virement|zelle|venmo|cashapp|paypal entre amis|proches|mandat|chèque de banque"),
        fr("payez avec (?:carte cadeau|crypto|bitcoin|virement|moneygram|western union)|envoyez (?:crypto|bitcoin|espèces|carte cadeau)"),
      ],
      ar: [
        /(بطاقة هدية|آيتونز|جوجل بلاي|ستيم|أمازون|وول مارت|تارجت|بيست باي|بطاقة مسبقة الدفع|بيتكوين|بتكوين|كريبتو|عملة مشفرة|إيثيريوم|يو إس دي تي|تيثر|محفظة|بلوك تشين|موني جرام|ويسترن يونيون|تحويل بنكي|زيل|فينمو|كاش آب|باي بال أصدقاء|عائلة وأصدقاء|حوالة|شيك مصرفي)/gi,
        /(ادفع بـ (?:بطاقة هدية|كريبتو|بيتكوين|تحويل|موني جرام|ويسترن يونيون)|أرسل (?:كريبتو|بيتكوين|نقداً|بطاقة هدية))/gi,
      ],
    },
  },
  {
    id: "new_number_family",
    name: "New Number / Family Emergency",
    weight: 14,
    patterns: {
      en: [
        /\b(new (?:phone|number|mobile|cell|whatsapp|telegram|signal)|lost (?:phone|mobile|number)|changed (?:my|phone|number)|this is my new|temporary number|borrowed (?:phone|number)|family emergency|accident|hospital|emergency|urgent help|help me|stranded|stuck|in trouble|need help|desperate)\b/gi,
        /\b(mom|dad|mother|father|son|daughter|brother|sister|grandma|grandpa|aunt|uncle|cousin|family|relative)\b/gi,
      ],
      fr: [
        fr("nouveau (?:téléphone|numéro|mobile|portable|whatsapp|telegram|signal)|perdu (?:téléphone|mobile|numéro)|changé (?:mon|téléphone|numéro)|c'est mon nouveau|numéro temporaire|emprunté (?:téléphone|numéro)|urgence familiale|accident|hôpital|urgence|aide urgente|aidez-moi|bloqué|coincé|en difficulté|besoin d'aide|désespéré"),
        fr("maman|papa|mère|père|fils|fille|frère|sœur|grand-mère|grand-père|tante|oncle|cousin|cousine|famille|proche"),
      ],
      ar: [
        /(هاتف جديد|رقم جديد|موبايل جديد|واتساب جديد|تلجرام جديد|فقدت (?:هاتفي|رقمي)|غيرت (?:هاتفي|رقمي)|هذا رقمي الجديد|رقم مؤقت|هاتف مستعار|طوارئ عائلية|حادث|مستشفى|طوارئ|مساعدة عاجلة|ساعدني|عالق|في مشكلة|بحاجة مساعدة|يائس)/gi,
        /(أمي|أبي|أمي|أبي|ابني|ابنتي|أخي|أختي|جدتي|جدي|عمتي|عمي|ابن عمي|عائلتي|قريبي)/gi,
      ],
    },
  },
  {
    id: "secrecy",
    name: "Secrecy/Don't Tell Anyone",
    weight: 12,
    patterns: {
      en: [
        /\b(don'?t tell|don't share|keep (?:this|it) (?:secret|private|confidential|between us)|nobody (?:should|must|can) know|no one (?:should|must|can) know|tell no one|keep quiet|confidential|private matter|sensitive|discreet|hush|secret)\b/gi,
        /\b(only (?:you|I|we) (?:know|should know)|between you and me|just between us|off the record)\b/gi,
      ],
      fr: [
        fr("ne dites pas|ne partagez pas|gardez (?:ceci|ça) (?:secret|privé|confidentiel|entre nous)|personne (?:ne doit|ne peut) savoir|ne le dites à personne|taisez-vous|confidentiel|affaire privée|sensible|discret|chut|secret"),
        fr("seul(?:e)? (?:vous|je|nous) (?:sait|devrait savoir)|entre toi et moi|juste entre nous|hors enregistrement"),
      ],
      ar: [
        /(لا تخبر|لا تشارك|احتفظ (?:بهذا|بذلك) (?:سرياً|خاصاً|بيننا)|لا أحد (?:يجب|يمكن) أن يعرف|لا تقل لأحد|اصمت|سري|أمر خاص|حساس|مكتوم|سر)/gi,
        /(فقط (?:أنت|أنا|نحن) (?:نعرف|يجب أن نعرف)|بينك وبيني|فقط بيننا|غير مسجل)/gi,
      ],
    },
  },
  {
    id: "too_good",
    name: "Too Good to Be True",
    weight: 13,
    patterns: {
      en: [
        /\b(guaranteed|guarantee|risk.?free|no risk|100%|double your|triple your|multiply your|passive income|easy money|quick cash|get rich|financial freedom|work from home|be your own boss|unlimited|effortless|automatic|system|secret (?:method|formula|strategy|formula)|loophole|insider)\b/gi,
        /\b(invest (?:little|small|tiny|minimal) (?:and get|for|to get) (?:huge|big|large|massive) returns?|turn \$\d+ into \$\d+|make \$\d+ (?:per|a) (?:day|week|month|hour))\b/gi,
      ],
      fr: [
        fr("garanti|garantie|sans risque|100%|doublez|triplez|multipliez|revenu passif|argent facile|argent rapide|devenez riche|liberté financière|travaillez de chez vous|soyez votre propre patron|illimité|sans effort|automatique|système|secret (?:méthode|formule|stratégie)|faille|initié"),
        fr("investissez (?:peu|petit|minime) (?:et obtenez|pour obtenir) (?:énorme|gros|massif) rendements|transformez \$\d+ en \$\d+|gagnez \$\d+ (?:par|par) (?:jour|semaine|mois|heure)"),
      ],
      ar: [
        /(مضمون|ضمان|بدون مخاطر|100%|ضاعف|ثلاث أضعاف|اضرب|دخل سلبي|مال سهل|مال سريع|أصبح غني|حرية مالية|اعمل من المنزل|كن رئيس نفسك|غير محدود|بدون جهد|تلقائي|نظام|سر (?:طريقة|صيغة|استراتيجية)|ثغرة|داخلي)/gi,
        /(استثمر (?:قليل|صغير|بسيط) (?:واحصل على|للحصول على) (?:عائدات ضخمة|كبيرة|هائلة)|حول \$\d+ إلى \$\d+|اكسب \$\d+ (?:في|كل) (?:يوم|أسبوع|شهر|ساعة))/gi,
      ],
    },
  },
];

export const SAFE_PRACTICE_PATTERNS: Record<Language, RegExp[]> = {
  en: [
    /\b(verified|official|legitimate|authentic|confirmed|trusted|secure|encrypted|https|ssl|certified|authorized)\b/gi,
    /\b(contact (?:us|support|customer service) (?:directly|at|through|via)|visit (?:our|the) (?:official|verified) (?:website|site|page)|call (?:us|the number) (?:on|at)|official channels?)\b/gi,
  ],
  fr: [
    fr("vérifié|officiel|légitime|authentique|confirmé|fiable|sécurisé|crypté|https|ssl|certifié|autorisé"),
    fr("contactez (?:nous|le support|le service client) (?:directement|au|par|via)|visitez (?:notre|le) (?:site|page) officiel(?:le)?|appelez (?:nous|le numéro) (?:au|sur)|canaux officiels?"),
  ],
  ar: [
    /(موثق|رسمي|شرعي|أصلي|مؤكد|موثوق|آمن|مشفّر|https|ssl|معتمد|مصرح)/gi,
    /(اتصل (?:بنا|بالدعم|بخدمة العملاء) (?:مباشرة|على|عبر)|قم بزيارة (?:موقعنا|الموقع) الرسمي|اتصل (?:بنا|بالرقم) (?:على)|قنوات رسمية)/gi,
  ],
};

export function getRulesForLanguage(lang: Language): Rule[] {
  return RULES;
}

export function getSafePatternsForLanguage(lang: Language): RegExp[] {
  return SAFE_PRACTICE_PATTERNS[lang];
}