const fs = require("fs");
const path = "src/lib/i18n-dictionary.ts";
let src = fs.readFileSync(path, "utf8");

// Fix the Arabic block completely - reconstruct the responsibleAi section properly
const broken = `    responsibleAi: {\r
\r
    notFoundDesc: "الصفحة التي تبحث عنها غير موجودة أو تم نقلها.",\r
    errorTitle: "حدث خطأ ما",\r
    errorDesc: "واجهنا مشكلة غير متوقعة. يرجى المحاولة مرة أخرى أو العودة للرئيسية。",\r
    errorDetails: "تفاصيل الخطأ",\r
    errorReportNote: "تم تسجيل هذا الخطأ. إذا استمر، يرجى الاتصال بالدعم.",\r
      intro:\r
        "سكان رادار أداة تعليمية، وليست بنكاً ولا جهة رسمية. إليك بالضبط كيف يتعامل مع بياناتك وأين يمكن أن تكون نصائحه خاطئة."`;

const fixed = `    responsibleAi: {\n      title: "الذكاء الاصطناعي المسؤول وبياناتك",\n    }\n\n    notFoundTitle: "الصفحة غير موجودة",\n    notFoundDesc: "الصفحة التي تبحث عنها غير موجودة أو تم نقلها.",\r    errorTitle: "حدث خطأ ما",\r    errorDesc: "واجهنا مشكلة غير متوقعة. يرجى المحاولة مرة أخرى أو العودة للرئيسية。",\r    errorDetails: "تفاصيل الخطأ",\r    errorReportNote: "تم تسجيل هذا الخطأ. إذا استمر، يرجى الاتصال بالدعم。",`;

src = src.replace(broken, fixed);
fs.writeFileSync(path, src, "utf8");
console.log("Fixed Arabic block");