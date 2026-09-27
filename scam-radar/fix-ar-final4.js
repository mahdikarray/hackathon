const fs = require("fs");
const path = "src/lib/i18n-dictionary.ts";
let src = fs.readFileSync(path, "utf8");

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
      intro:
        "سكان رادار أداة تعليمية، وليست بنكاً ولا جهة رسمية. إليك بالضبط كيف يتعامل مع بياناتك وأين يمكن أن تكون نصائحه خاطئة.",
    }

    notFoundTitle: "الصفحة غير موجودة",
    notFoundDesc: "الصفحة التي تبحث عنها غير موجودة أو تم نقلها.",
    errorTitle: "حدث خطأ ما",
    errorDesc: "واجهنا مشكلة غير متوقعة. يرجى المحاولة مرة أخرى أو العودة للرئيسية.",
    errorDetails: "تفاصيل الخطأ",
    errorReportNote: "تم تسجيل هذا الخطأ. إذا استمر، يرجى الاتصال بالدعم.",
      intro:`;

if (!src.includes(before)) {
  console.error("Pattern not found");
  process.exit(1);
}
src = src.replace(before, fixed);
fs.writeFileSync("src/lib/i18n-dictionary.ts", src, "utf8");
console.log("Fixed");