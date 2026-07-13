const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function main() {
  const politics = await db.category.findFirst({ where: { slug: 'politics' } });
  const author = await db.user.findFirst({ where: { role: { in: ['super_admin', 'admin', 'editor'] } } });

  if (!politics || !author) {
    console.log('Missing category or author', { politics: !!politics, author: !!author });
    process.exit(1);
  }

  const content = [
    '<p>The Bole District Police Command has arrested two suspects after intercepting 73 parcels of a substance believed to be cannabis during a routine highway operation in the Savannah Region.</p>',
    '<p>The incident occurred along the Banda Nkwanta–Teslima road when officers stopped a commercial vehicle travelling from Techiman to Wa for inspection.</p>',
    '<p>According to a police statement, the vehicle, with registration number AS 4874-25, was searched after officers detected inconsistencies regarding the contents of some luggage onboard.</p>',
    '<p>A thorough search reportedly led to the discovery of 73 parcels of the suspected narcotic substance concealed in bags.</p>',
    '<p>The driver of the vehicle and a woman believed to be in her early 40s, who allegedly claimed ownership of the consignment, were arrested to assist with investigations.</p>',
    '<p>Police sources say the female suspect allegedly admitted responsibility for transporting the suspected cannabis to Sengye, a community near Bole.</p>',
    '<p>The destination is suspected to be linked to illegal mining activities, although investigators are yet to establish the intended purpose of the consignment.</p>',
    '<p>The police further stated that the suspects allegedly attempted to offer officers a GH¢300,000 bribe to secure their release, but the officers rejected the offer and proceeded with the arrest.</p>',
    '<p>The two suspects remain in police custody as investigations continue. The suspected substance will undergo forensic examination to confirm its composition before any charges are filed.</p>',
    '<p>The seizure comes as security agencies intensify efforts to combat the trafficking and distribution of illicit drugs across the country.</p>',
    '<p>The Ghana Police Service reiterated its commitment to fighting narcotics-related offences and corruption, urging the public to provide credible information to support law enforcement operations.</p>',
    '<p>"Investigations into the matter are ongoing, and the suspects are expected to be arraigned before court upon their completion. As with all criminal proceedings, the suspects are presumed innocent unless proven guilty by a court of competent jurisdiction," the statement concluded.</p>',
  ].join('\n');

  const article = await db.article.create({
    data: {
      title: 'Police intercept 73 parcels of suspected cannabis, reject GH¢300K bribe; two arrested',
      slug: 'police-intercept-73-parcels-suspected-cannabis-reject-gh300k-bribe-two-arrested',
      content: content,
      excerpt: 'The Bole District Police Command has arrested two suspects after intercepting 73 parcels of a substance believed to be cannabis during a routine highway operation in the Savannah Region.',
      featuredImage: '/articles/bole-cannabis.jpeg',
      status: 'published',
      isFeatured: true,
      isBreaking: true,
      viewCount: 0,
      authorId: author.id,
      categoryId: politics.id,
      source: undefined,
      publishedAt: new Date(),
    }
  });

  console.log('Created article:', article.id, article.slug);
  await db.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });