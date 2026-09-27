const fs = require("fs");
const path = "src/lib/i18n-dictionary.ts";
let src = fs.readFileSync(path, "utf8");

// Find and replace the entire Arabic responsibleAi section
const before = `    responsibleAi: {
      title: "الذكاء الاصطناعي المسؤول وبياناتك",
    }

    notFoundDesc: "الصفحة التي تبحث عنها غير موجودة أو تم نقلها.",
    errorTitle: "حدث خطأ ما",
    errorDesc: "واجهنا مشكلة غير متوقعة. يرجى المحاولة مرة أخرى أو العودة للرئيسية。",
    errorDetails: "تفاصيل الخطأ",
    errorReportNote: "تم تسجيل هذا الخطأ. إذا استمر، يرجى الاتصال بالدعم.",
      intro:`;

const fixed = `    responsibleAi: {
      title: "الذكاء الاصطناعي المسؤول وبياناتك",
    }

    notFoundTitle: "الصفحة غير موجودة",
    notFoundDesc: "الصفحة التي تبحث عنها غير موجودة أو تم نقلها.",
    errorTitle: "حدث خطأ ما",
    errorDesc: "واجهنا مشكلة غير متوقعة. يرجى المحاولة مرة أخرى أو العودة للرئيسية。",
    errorDetails: "تفاصيل الخطأ",
    errorReportNote: "تم تسجيل هذا الخطأ. إذا استمر، يرجى الاتصال بالدعم."`;

src = src.replace(/responsibleAi: \{\s+title: "الذكاء الاصطناعي المسؤول وبياناتك",\s*\}\s*\r?\n\s*\r?\n\s*notFoundDesc: "الصفحة التي تبحث عنها غير موجودة أو تم نقلها\.",/,
  `responsibleAi: {\n      title: "الذكاء الاصطناعي المسؤول وبياناتك",\n    }\n\n    notFoundTitle: "الصفحة غير موجودة",\n    notFoundDesc: "الصفحة التي تبحث عنها غير موجودة أو تم نقلها.",`);

fs.writeFileSync("src/lib/i18n-dictionary.ts", src, "utf8");
console.log("Fixed Arabic block");