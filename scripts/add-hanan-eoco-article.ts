const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function main() {
  const politics = await db.category.findFirst({ where: { slug: 'politics' } });
  const author = await db.user.findFirst({ where: { role: { in: ['super_admin', 'admin', 'editor'] } } });

  if (!politics || !author) {
    console.log('Missing category or author');
    process.exit(1);
  }

  const paragraphs = [
    'Lawyers for the former Chief Executive Officer of the National Food Buffer Stock Company (NAFCO), Hanan Abdul-Wahab, have demanded the immediate return of his personal belongings, including cash, mobile phones and passport, following his release from the custody of the Economic and Organised Crime Office (EOCO).',
    'In a letter dated July 9, 2026, and addressed to the Attorney-General and EOCO, the lawyers argued that the continued detention of their client\'s property was unlawful and warned they could resort to legal action if the items were not returned.',
    'The demand follows Abdul-Wahab\'s rearrest by EOCO after the Attorney-General withdrew earlier charges against him and other accused persons, citing the emergence of fresh evidence.',
    'The former NAFCO CEO was arrested on July 4 at the Accra International Airport while preparing to travel to the United Kingdom for what his lawyers described as a scheduled medical appointment. He was subsequently detained by the Bureau of National Intelligence and EOCO before being released on the night of July 8 without conditions.',
    'According to the lawyers, Abdul-Wahab was carrying two mobile phones and three envelopes containing borrowed funds for his travel and medical treatment at the time of his arrest.',
    'The letter stated that the envelopes contained \u00a35,000, \u00a31,700 and GH\u00a212,750.',
    'The lawyers said although their client was directed to report to EOCO on July 9 to retrieve his belongings, he was only handed an empty purse, a wristwatch and his boarding pass.',
    'They alleged that the investigating officer informed Abdul-Wahab that he had not been authorised to release the seized cash and the two mobile phones.',
    '\u201cWe note, with serious concern, that EOCO continues to unlawfully retain the properties belonging to our client. We hereby demand the immediate release of the two mobile phones and the money seized from our client together with all other items unlawfully held in your custody. We also demand a full account of any data accessed from our client\'s phones. We hope we will not be compelled to resort to unnecessary litigation,\u201d the lawyers said.',
    'They argued that the money was borrowed solely to finance Abdul-Wahab\'s travel and medical treatment and was not linked to any account that had allegedly been frozen.',
    'The lawyers further alleged that EOCO unlawfully accessed data on their client\'s mobile phones without judicial authorisation while he was in custody.',
    'According to the letter, the phones were allegedly accessed on July 6 and again on July 7.',
    'They contended that the alleged actions constituted \u201ca grave invasion\u201d of Abdul-Wahab\'s constitutional right to privacy under Article 18(2) of the 1992 Constitution.',
    'The lawyers also accused EOCO of unlawfully retaining Abdul-Wahab\'s passport despite a High Court order issued on June 29, 2026, permitting him to travel outside the country and directing that the passport be returned to the court registrar upon his return.',
    'They argued that the continued seizure of the passport without a court order contravened Article 21(4) of the Constitution.',
    'The legal team, led by former Attorney-General Godfred Yeboah Dame, is demanding the immediate release of the seized cash, mobile phones and all other personal belongings, as well as a full account of any data allegedly accessed from the phones.',
    '\u201cWe hope we will not be compelled to resort to unnecessary litigation,\u201d the lawyers stated.',
  ];

  const content = paragraphs.map(p => `<p>${p}</p>`).join('\n');

  const article = await db.article.create({
    data: {
      title: "Return Hanan\u2019s belongings or face legal action \u2013 Lawyers warn EOCO",
      slug: 'return-hanans-belongings-or-face-legal-action-lawyers-warn-eoco',
      content: content,
      excerpt: 'Lawyers for the former CEO of NAFCO, Hanan Abdul-Wahab, have demanded the immediate return of his personal belongings following his release from EOCO custody.',
      status: 'published',
      isFeatured: false,
      isBreaking: false,
      viewCount: 7777,
      authorId: author.id,
      categoryId: politics.id,
      publishedAt: new Date(),
    }
  });

  console.log('Created article:', article.id, article.slug);
  await db.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });