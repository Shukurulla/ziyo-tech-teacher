import React, { useState, useRef, useEffect } from "react";

const GlossaryPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const contentRef = useRef(null);
  const [highlightedContent, setHighlightedContent] = useState("");

  const originalContent = `
## Microsoft Word

Microsoft Word (qisgacha MS Word, WinWord yoki Word) – matnii ma'lumotlarni yaratish, kofrish va tahrir qilish uchun mo'jjallangan matn muhariridir yoki matn prosessori. Microsoft kompaniyasi tomonidan Microsoft Office paketi tarkibida chiqariladi. Ilk versiyasi Richard Brodi tomonidan 1983-yil IBM PC uchun yozilgan. Keyinroq Apple Macintosh (1984), SCO UNIX va Microsoft Windows (1989) uchun ishlab chiqilgan. Amaldagi versiyasi Windows va MacOS uchun mo'jjallangan Microsoft Office Word 2016 hisoblanadi.

### Tarixi

Microsoft Word yaratilishida "Xerox PARC" tadqiqot markazi tomonidan ishlab chiqilgan Bravo - original grafik interfeysga ega matn prosessori katta o'rin tutadi. Bravo asoschisi Chantz Simoni PARCni 1981-yil tark etgan. Wordning MS-DOS uchun taqdimoti 1983-yil oxirida bo'lib o'tdi. Bu tovar bozorda yomon qabul qilindi.

Biroq 1985-yil Macintosh uchun mo'jjallangan versiyasi qo'lma-qo'l bo'lib keng tarqala boshladi. Ikki yildan so'ng Macintosh uchun Word 3.01 versiyasi ishlab chiqildi. Macintosh uchun mo'jjallangan boshqa dasturiy ta'minotlar kabi Word ham to'liq WYSIWYG-muharrir edi ("what you see is what you get" tamoyili - "nima ko'rsam, shuni olaman"). MS-DOS grafik qobiqdan mahrum matn operatsion tizimi bo'lsada, DOS uchun mo'jjalangan Word dasturi IBM PC ning tahrir vaqtida yarim qora yoki oq matn kabi matn belgilarini ko'rsata oluvchi matn prosessori edi. Biroq u ham to'liq WYSIWYG-muharrir edi. WordStar va WordPerfect kabi matn muharrirlari odatda matn ekranini belgi kodlari bilan ishlatishar edi, ba'zan matn rangli ham bo'lardi. Ammo ko'p holda DOS dasturiy ta'minotidagi dasturlarda har bir buyruq uchun shaxsiy klavish kombinatsiyalari qo'llanishi (DOS Wordda hujjat saqlashda ESC-T-S kombinatsiyasi ishlatilgan) va ko'p kotiblar faqat WordPerfectni ishlata olishi shu dasturni ishlatuvchi kompaniyalar ozroq ustunlikka ega yangi dasturga juda sekinlik bilan o'tishgan.
`;

  useEffect(() => {
    if (!searchTerm.trim()) {
      setHighlightedContent(originalContent);
      return;
    }

    const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, "gi");
    const highlighted = originalContent.replace(
      regex,
      '<mark class="bg-yellow-300">$1</mark>'
    );
    setHighlightedContent(highlighted);

    // Scroll to first match
    if (contentRef.current) {
      const firstMark = contentRef.current.querySelector("mark");
      if (firstMark) {
        firstMark.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [searchTerm, originalContent]);

  const escapeRegExp = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  };

  const formatContent = (content) => {
    return content
      .split("\n")
      .map((paragraph, index) => {
        if (paragraph.startsWith("## ")) {
          return `<h2 class="text-2xl text-gray-800 mt-6 mb-4 font-normal">${paragraph.substring(
            3
          )}</h2>`;
        } else if (paragraph.startsWith("### ")) {
          return `<h3 class="text-xl text-gray-800 mt-5 mb-3 font-normal">${paragraph.substring(
            4
          )}</h3>`;
        }
        return paragraph ? `<p class="mb-4">${paragraph}</p>` : "<br/>";
      })
      .join("");
  };

  return (
    <div className="font-sans leading-relaxed text-gray-800 p-5  mx-auto">
      <h1 className="text-3xl text-gray-800 border-b-2 border-blue-500 pb-3 mb-6 font-normal">
        Glossary
      </h1>

      <div className="mb-6 relative">
        <input
          type="text"
          placeholder="Search in glossary..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
        />
      </div>

      <div
        ref={contentRef}
        dangerouslySetInnerHTML={{ __html: formatContent(highlightedContent) }}
        className="whitespace-pre-wrap text-base leading-loose"
      />
    </div>
  );
};

export default GlossaryPage;
