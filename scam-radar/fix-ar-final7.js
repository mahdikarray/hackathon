const fs = require("fs");
const path = "src/lib/i18n-dictionary.ts";
let src = fs.readFileSync(path, "utf8");

const before = `    responsibleAi: {\r
      title: "الذكاء الاصطناعي المسؤول وبياناتك",\r
    }\r
\r
\r\n    notFoundDesc: "الصفحة التي تبحث عنها غير موجودة أو تم نقلها.",\r
    errorTitle: "حدث خطأ ما",\r
    errorDesc: "واجهنا مشكلة غير متوقعة. يرجى المحاولة مرة أخرى أو العودة للرئيسية。",\r
    errorDetails: "تفاصيل الخطأ",\r
    errorReportNote: "تم تسجيل هذا الخطأ. إذا استمر، يرجى الاتصال بالدعم.",\r
      intro:\r
        "سكان رادار أداة تعليمية، وليست بنكاً ولا جهة رسمية. إليك بالضبط كيف يتعامل مع بياناتك وأين يمكن أن تكون نصائحه خاطئة.",\r
      sendTitle:`;

const fixed = `    responsibleAi: {\r
      title: "الذكاء الاصطناعي المسؤول وبياناتك",\r
      intro:\r
        "سكان رادار أداة تعليمية، وليست بنكاً ولا جهة رسمية. إليك بالضبط كيف يتعامل مع بياناتك وأين يمكن أن تكون نصائحه خاطئة.",\r
    }\r
\r
    notFoundTitle: "الصفحة غير موجودة",\r
    notFoundDesc: "الصفحة التي تبحث عنها غير موجودة أو تم نقلها.",\r
    errorTitle: "حدث خطأ ما",\r
    errorDesc: "واجهنا مشكلة غير متوقعة. يرجى المحاولة مرة أخرى أو العودة للرئيسية。",\r
    errorDetails: "تفاصيل الخطأ",\r
    errorReportNote: "تم تسجيل هذا الخطأ. إذا استمر، يرجى الاتصال بالدعم.",\r
      sendTitle:`;

if (!src.includes(before)) {
  console.error("Pattern not found");
  process.exit(1);
}
src = src.replace(before, fixed);
fs.writeFileSync("src/lib/i18n-dictionary.ts", src, "utf8");
console.log("Fixed");