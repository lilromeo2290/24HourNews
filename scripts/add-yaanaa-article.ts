const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function main() {
  const generalNews = await db.category.findFirst({ where: { slug: 'general-news' } });
  const author = await db.user.findFirst({ where: { role: { in: ['super_admin', 'admin', 'editor'] } } });

  if (!generalNews || !author) {
    console.log('Missing category or author');
    process.exit(1);
  }

  const content = [
    '<p>The Government of Ghana has expressed its condolences to the people of Dagbon following the death of Yaa-Naa Abukari Mahama II, describing the late overlord as a distinguished traditional ruler whose reign brought healing, reconciliation and lasting peace to the kingdom.</p>',
    '<p>In a statement issued on Monday, July 13, on behalf of President John Dramani Mahama, the government extended its sympathies to the Royal Family, the people of Dagbon and the nation.</p>',
    '<p>"The Government of Ghana has received with profound sadness the news of the passing of His Majesty Yaa Naa Abukari Mahama II," the statement said.</p>',
    '<p>"On behalf of the Government of Ghana, His Excellency President John Dramani Mahama extends his deepest condolences to the Royal Family, the people of Dagbon, and the entire nation during this period of immense grief."</p>',
    '<p>The government credited the late Yaa-Naa with leading Dagbon through a period of reconciliation after years of conflict, saying his leadership fostered unity, stability and development.</p>',
    '<p>"His Majesty will be remembered as a distinguished traditional ruler whose reign brought healing, reconciliation, and lasting peace to Dagbon following years of conflict," the statement said.</p>',
    '<p>"His unwavering commitment to unity, stability, and the welfare of his people created an enabling environment for development and strengthened the enduring partnership between the traditional authorities and the Government in advancing progress across Dagbon and Ghana."</p>',
    '<p>The government also paid tribute to the late king\'s contribution to national development, describing his service as invaluable.</p>',
    '<p>"The Government pays tribute to the life and legacy of Yaa Naa Abukari Mahama II and honours his invaluable service to the nation," the statement said.</p>',
    '<p>"May his wisdom, leadership, and dedication to peace continue to inspire future generations."</p>',
    '<p>The statement concluded with a prayer for the late monarch, saying, "May his soul rest in perfect peace."</p>',
  ].join('\n');

  const article = await db.article.create({
    data: {
      title: 'Yaa-Naa Abukari II brought healing and reconciliation to Dagbon \u2014 Gov\u2019t',
      slug: 'yaa-naa-abukari-ii-brought-healing-reconciliation-dagbon-govt',
      content: content,
      excerpt: 'The Government of Ghana has expressed its condolences to the people of Dagbon following the death of Yaa-Naa Abukari Mahama II.',
      featuredImage: '/articles/yaanaa-abukari.jpg',
      status: 'published',
      isFeatured: false,
      isBreaking: false,
      viewCount: 8888,
      authorId: author.id,
      categoryId: generalNews.id,
      publishedAt: new Date(),
    }
  });

  console.log('Created article:', article.id, article.slug);
  await db.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });