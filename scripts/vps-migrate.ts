/**
 * VPS Database Migration Script
 * Run this ONCE on the VPS after deploy to add new content
 * that was added directly to the local database.
 *
 * Usage: npx tsx scripts/vps-migrate.ts
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const db = new PrismaClient();

async function main() {
  console.log('Starting VPS database migration...');

  // 0. Ensure admin user exists (self-contained, no seed dependency)
  let author = await db.user.findFirst({ where: { role: { in: ['super_admin', 'admin', 'editor'] } } });
  if (!author) {
    const hashedPassword = await bcrypt.hash('Admin@123', 12);
    author = await db.user.create({
      data: {
        email: 'admin@24hournews.com',
        passwordHash: hashedPassword,
        name: 'Super Admin',
        role: 'super_admin',
        bio: 'System administrator of 24Hour News.',
      }
    });
    console.log('  Created admin user: admin@24hournews.com');
  } else {
    console.log(`  Using author: ${author.email}`);
  }

  // 1. Create General News category
  let generalNews = await db.category.findFirst({ where: { slug: 'general-news' } });
  if (!generalNews) {
    generalNews = await db.category.create({
      data: {
        name: 'General News',
        slug: 'general-news',
        description: 'General news and current affairs',
        color: '#50a020',
        order: 0,
      }
    });
    console.log('  Created category: General News');
  } else {
    console.log('  Category General News already exists, skipping.');
  }

  // 3. Update trending ad to Clipe233 image
  const trendingAd = await db.advertisement.findFirst({ where: { position: 'trending' } });
  if (trendingAd) {
    await db.advertisement.update({
      where: { id: trendingAd.id },
      data: {
        title: 'Trending Ad',
        imageUrl: '/ads/trending-ad.png',
        isActive: true,
      }
    });
    console.log('  Updated trending ad image');
  } else {
    await db.advertisement.create({
      data: {
        title: 'Trending Ad',
        imageUrl: '/ads/trending-ad.png',
        position: 'trending',
        isActive: true,
      }
    });
    console.log('  Created trending ad');
  }

  // 4. Update sidebar ad to Clips
  const sidebarAd = await db.advertisement.findFirst({ where: { position: 'sidebar' } });
  if (sidebarAd) {
    await db.advertisement.update({
      where: { id: sidebarAd.id },
      data: {
        title: 'Clips',
        imageUrl: '/ads/clips-ad.png',
      }
    });
    console.log('  Updated sidebar ad to Clips');
  }

  // 5. Add Bole cannabis article
  const boleSlug = 'police-intercept-73-parcels-suspected-cannabis-reject-gh300k-bribe-two-arrested';
  let boleArticle = await db.article.findFirst({ where: { slug: boleSlug } });
  if (!boleArticle) {
    await db.article.create({
      data: {
        title: 'Police intercept 73 parcels of suspected cannabis, reject GH\u00a2300K bribe; two arrested',
        slug: boleSlug,
        content: '<p>The Bole District Police Command has arrested two suspects after intercepting 73 parcels of a substance believed to be cannabis during a routine highway operation in the Savannah Region.</p><p>The incident occurred along the Banda Nkwanta\u2013Teslima road when officers stopped a commercial vehicle travelling from Techiman to Wa for inspection.</p><p>According to a police statement, the vehicle, with registration number AS 4874-25, was searched after officers detected inconsistencies regarding the contents of some luggage onboard.</p><p>A thorough search reportedly led to the discovery of 73 parcels of the suspected narcotic substance concealed in bags.</p><p>The driver of the vehicle and a woman believed to be in her early 40s, who allegedly claimed ownership of the consignment, were arrested to assist with investigations.</p><p>Police sources say the female suspect allegedly admitted responsibility for transporting the suspected cannabis to Sengye, a community near Bole.</p><p>The destination is suspected to be linked to illegal mining activities, although investigators are yet to establish the intended purpose of the consignment.</p><p>The police further stated that the suspects allegedly attempted to offer officers a GH\u00a2300,000 bribe to secure their release, but the officers rejected the offer and proceeded with the arrest.</p><p>The two suspects remain in police custody as investigations continue. The suspected substance will undergo forensic examination to confirm its composition before any charges are filed.</p><p>The seizure comes as security agencies intensify efforts to combat the trafficking and distribution of illicit drugs across the country.</p><p>The Ghana Police Service reiterated its commitment to fighting narcotics-related offences and corruption, urging the public to provide credible information to support law enforcement operations.</p><p>\u201cInvestigations into the matter are ongoing, and the suspects are expected to be arraigned before court upon their completion. As with all criminal proceedings, the suspects are presumed innocent unless proven guilty by a court of competent jurisdiction,\u201d the statement concluded.</p>',
        excerpt: 'The Bole District Police Command has arrested two suspects after intercepting 73 parcels of a substance believed to be cannabis during a routine highway operation in the Savannah Region.',
        featuredImage: '/articles/bole-cannabis.jpeg',
        status: 'published',
        isFeatured: false,
        isBreaking: true,
        viewCount: 9000,
        authorId: author.id,
        categoryId: generalNews.id,
        publishedAt: new Date(),
      }
    });
    console.log('  Created article: Bole cannabis seizure');
  } else {
    // Just update its category and viewCount
    await db.article.update({
      where: { id: boleArticle.id },
      data: {
        categoryId: generalNews.id,
        viewCount: 9000,
        isFeatured: false,
        isBreaking: true,
        featuredImage: boleArticle.featuredImage || '/articles/bole-cannabis.jpeg',
      }
    });
    console.log('  Updated article: Bole cannabis seizure');
  }

  // 6. Add Yaa-Naa Abukari article
  const yaanaaSlug = 'yaa-naa-abukari-ii-brought-healing-reconciliation-dagbon-govt';
  let yaanaaArticle = await db.article.findFirst({ where: { slug: yaanaaSlug } });
  if (!yaanaaArticle) {
    await db.article.create({
      data: {
        title: 'Yaa-Naa Abukari II brought healing and reconciliation to Dagbon \u2014 Gov\u2019t',
        slug: yaanaaSlug,
        content: '<p>The Government of Ghana has expressed its condolences to the people of Dagbon following the death of Yaa-Naa Abukari Mahama II, describing the late overlord as a distinguished traditional ruler whose reign brought healing, reconciliation and lasting peace to the kingdom.</p><p>In a statement issued on Monday, July 13, on behalf of President John Dramani Mahama, the government extended its sympathies to the Royal Family, the people of Dagbon and the nation.</p><p>\u201cThe Government of Ghana has received with profound sadness the news of the passing of His Majesty Yaa Naa Abukari Mahama II,\u201d the statement said.</p><p>\u201cOn behalf of the Government of Ghana, His Excellency President John Dramani Mahama extends his deepest condolences to the Royal Family, the people of Dagbon, and the entire nation during this period of immense grief.\u201d</p><p>The government credited the late Yaa-Naa with leading Dagbon through a period of reconciliation after years of conflict, saying his leadership fostered unity, stability and development.</p><p>\u201cHis Majesty will be remembered as a distinguished traditional ruler whose reign brought healing, reconciliation, and lasting peace to Dagbon following years of conflict,\u201d the statement said.</p><p>\u201cHis unwavering commitment to unity, stability, and the welfare of his people created an enabling environment for development and strengthened the enduring partnership between the traditional authorities and the Government in advancing progress across Dagbon and Ghana.\u201d</p><p>The government also paid tribute to the late king\u2019s contribution to national development, describing his service as invaluable.</p><p>\u201cThe Government pays tribute to the life and legacy of Yaa Naa Abukari Mahama II and honours his invaluable service to the nation,\u201d the statement said.</p><p>\u201cMay his wisdom, leadership, and dedication to peace continue to inspire future generations.\u201d</p><p>The statement concluded with a prayer for the late monarch, saying, \u201cMay his soul rest in perfect peace.\u201d</p>',
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
    console.log('  Created article: Yaa-Naa Abukari');
  } else {
    await db.article.update({
      where: { id: yaanaaArticle.id },
      data: {
        categoryId: generalNews.id,
        viewCount: 8888,
        isFeatured: false,
      }
    });
    console.log('  Updated article: Yaa-Naa Abukari');
  }

  // 7. Ensure Politics category exists
  let politics = await db.category.findFirst({ where: { slug: 'politics' } });
  if (!politics) {
    politics = await db.category.create({
      data: {
        name: 'Politics',
        slug: 'politics',
        description: 'Political news, governance, and policy updates from Ghana and across Africa.',
        color: '#003050',
        order: 1,
      }
    });
    console.log('  Created category: Politics');
  }

  // 8. Add Hanan EOCO article
  const hananSlug = 'return-hanans-belongings-or-face-legal-action-lawyers-warn-eoco';
  let hananArticle = await db.article.findFirst({ where: { slug: hananSlug } });
  if (!hananArticle) {
    await db.article.create({
      data: {
        title: "Return Hanan\u2019s belongings or face legal action \u2013 Lawyers warn EOCO",
        slug: hananSlug,
        content: '<p>Lawyers for the former Chief Executive Officer of the National Food Buffer Stock Company (NAFCO), Hanan Abdul-Wahab, have demanded the immediate return of his personal belongings, including cash, mobile phones and passport, following his release from the custody of the Economic and Organised Crime Office (EOCO).</p><p>In a letter dated July 9, 2026, and addressed to the Attorney-General and EOCO, the lawyers argued that the continued detention of their client\u2019s property was unlawful and warned they could resort to legal action if the items were not returned.</p><p>The demand follows Abdul-Wahab\u2019s rearrest by EOCO after the Attorney-General withdrew earlier charges against him and other accused persons, citing the emergence of fresh evidence.</p><p>The former NAFCO CEO was arrested on July 4 at the Accra International Airport while preparing to travel to the United Kingdom for what his lawyers described as a scheduled medical appointment. He was subsequently detained by the Bureau of National Intelligence and EOCO before being released on the night of July 8 without conditions.</p><p>According to the lawyers, Abdul-Wahab was carrying two mobile phones and three envelopes containing borrowed funds for his travel and medical treatment at the time of his arrest.</p><p>The letter stated that the envelopes contained \u00a35,000, \u00a31,700 and GH\u00a212,750.</p><p>The lawyers said although their client was directed to report to EOCO on July 9 to retrieve his belongings, he was only handed an empty purse, a wristwatch and his boarding pass.</p><p>They alleged that the investigating officer informed Abdul-Wahab that he had not been authorised to release the seized cash and the two mobile phones.</p><p>\u201cWe note, with serious concern, that EOCO continues to unlawfully retain the properties belonging to our client. We hereby demand the immediate release of the two mobile phones and the money seized from our client together with all other items unlawfully held in your custody. We also demand a full account of any data accessed from our client\u2019s phones. We hope we will not be compelled to resort to unnecessary litigation,\u201d the lawyers said.</p><p>They argued that the money was borrowed solely to finance Abdul-Wahab\u2019s travel and medical treatment and was not linked to any account that had allegedly been frozen.</p><p>The lawyers further alleged that EOCO unlawfully accessed data on their client\u2019s mobile phones without judicial authorisation while he was in custody.</p><p>According to the letter, the phones were allegedly accessed on July 6 and again on July 7.</p><p>They contended that the alleged actions constituted \u201ca grave invasion\u201d of Abdul-Wahab\u2019s constitutional right to privacy under Article 18(2) of the 1992 Constitution.</p><p>The lawyers also accused EOCO of unlawfully retaining Abdul-Wahab\u2019s passport despite a High Court order issued on June 29, 2026, permitting him to travel outside the country and directing that the passport be returned to the court registrar upon his return.</p><p>They argued that the continued seizure of the passport without a court order contravened Article 21(4) of the Constitution.</p><p>The legal team, led by former Attorney-General Godfred Yeboah Dame, is demanding the immediate release of the seized cash, mobile phones and all other personal belongings, as well as a full account of any data allegedly accessed from the phones.</p><p>\u201cWe hope we will not be compelled to resort to unnecessary litigation,\u201d the lawyers stated.</p>',
        excerpt: 'Lawyers for the former CEO of NAFCO, Hanan Abdul-Wahab, have demanded the immediate return of his personal belongings following his release from EOCO custody.',
        featuredImage: '/articles/hanan-eoco.jpg',
        status: 'published',
        isFeatured: true,
        isBreaking: true,
        viewCount: 10000,
        authorId: author.id,
        categoryId: politics.id,
        publishedAt: new Date(),
      }
    });
    console.log('  Created article: Hanan EOCO');
  } else {
    await db.article.update({
      where: { id: hananArticle.id },
      data: {
        viewCount: 10000,
        isFeatured: true,
        isBreaking: true,
        featuredImage: hananArticle.featuredImage || '/articles/hanan-eoco.jpg',
      }
    });
    console.log('  Updated article: Hanan EOCO');
  }

  // 9. Ensure Sports category exists
  let sports = await db.category.findFirst({ where: { slug: 'sports' } });
  if (!sports) {
    sports = await db.category.create({
      data: {
        name: 'Sports',
        slug: 'sports',
        description: 'Sports news, match reports, transfers and scores from Ghana and across the world.',
        color: '#0060a0',
        order: 2,
      }
    });
    console.log('  Created category: Sports');
  }

  // 10. Add Nukunu FC article (Sports)
  const nukunuSlug = 'nukunu-fc-appoints-steve-puro-general-manager';
  let nukunuArticle = await db.article.findFirst({ where: { slug: nukunuSlug } });
  if (!nukunuArticle) {
    // Create in Sports category
    await db.article.create({
      data: {
        title: 'Nukunu Football Club Appoints Steve Puro as General Manager',
        slug: nukunuSlug,
        content: '<p>Nukunu FC is pleased to announce the appointment of Mr. Steve Puro as the club\'s new General Manager, effective immediately.</p><p>Mr. Puro brings a wealth of experience in football administration and management, having previously served as the Chief Executive Officer of Techiman Eleven Wonders. Throughout his career, he has also worked with Wa Power SC and served as the Bono Regional Secretary of Accra Hearts of Oak\'s Regional Chapters Committee.</p><p>The Board is confident that his experience, leadership, and deep understanding of Ghanaian football will play a vital role in advancing the club\'s strategic objectives and strengthening its operations both on and off the pitch.</p><p>The appointment forms part of the club\'s ongoing commitment to building a strong administrative structure capable of driving sustained growth, professionalism, and long-term success.</p><p>The Board, Management, technical team, players, and the entire Nukunu FC family warmly welcome Mr. Steve Puro and wish him every success in his new role.</p>',
        excerpt: 'Nukunu FC has announced the appointment of Mr. Steve Puro as the club\'s new General Manager, bringing a wealth of experience from Techiman Eleven Wonders, Wa Power SC, and Hearts of Oak.',
        status: 'published',
        isFeatured: false,
        isBreaking: false,
        viewCount: 5000,
        authorId: author.id,
        categoryId: sports.id,
        publishedAt: new Date(),
      }
    });
    console.log('  Created article: Nukunu FC appoints Steve Puro (Sports)');
  }

  // 12. Add Anloga DCE article (Politics + General News)
  const anlogaSlug = 'anloga-dce-sandra-kpedor-thanks-residents-turnout-national-clean-up';
  let anlogaArticle = await db.article.findFirst({ where: { slug: anlogaSlug } });
  if (!anlogaArticle) {
    await db.article.create({
      data: {
        title: 'Anloga DCE Sandra Kpedor Thanks Residents for Turnout in National Clean-Up, Urges Massive Participation on Day 2',
        slug: anlogaSlug,
        content: '<p>ANLOGA, VOLTA REGION, July 10, 2026 - The District Chief Executive for Anloga, Hon. Sandra Seyram Kpedor, has expressed gratitude to institutions and individuals who took part in today\'s National General Cleaning Exercise.</p><p>In a statement, Hon. Kpedor commended participants for their commitment, noting that the turnout reflects a shared responsibility to keep the district clean and healthy.</p><p>She is calling on all residents of the Anloga District to join tomorrow\'s exercise in large numbers.</p><p>\u201cTogether, we can build a cleaner, healthier, and safer environment for all,\u201d she said.</p><p>The two-day national exercise is being held under the theme \u201cOur Actions, Our Future: Cleaning Ghana after the Floods.\u201d</p>',
        excerpt: 'The DCE for Anloga, Hon. Sandra Seyram Kpedor, has commended participants in the National General Cleaning Exercise and is calling on all residents to join Day 2 of the exercise.',
        status: 'published',
        isFeatured: false,
        isBreaking: false,
        viewCount: 3000,
        authorId: author.id,
        categoryId: politics.id,
        publishedAt: new Date(),
      }
    });
    console.log('  Created article: Anloga DCE Clean-Up (Politics)');
  }

  // 13. Copy Anloga DCE article to General News
  const anlogaGNSlug = 'anloga-dce-sandra-kpedor-thanks-residents-turnout-national-clean-up-general-news';
  let anlogaGNArticle = await db.article.findFirst({ where: { slug: anlogaGNSlug } });
  if (!anlogaGNArticle) {
    await db.article.create({
      data: {
        title: 'Anloga DCE Sandra Kpedor Thanks Residents for Turnout in National Clean-Up, Urges Massive Participation on Day 2',
        slug: anlogaGNSlug,
        content: '<p>ANLOGA, VOLTA REGION, July 10, 2026 - The District Chief Executive for Anloga, Hon. Sandra Seyram Kpedor, has expressed gratitude to institutions and individuals who took part in today\'s National General Cleaning Exercise.</p><p>In a statement, Hon. Kpedor commended participants for their commitment, noting that the turnout reflects a shared responsibility to keep the district clean and healthy.</p><p>She is calling on all residents of the Anloga District to join tomorrow\'s exercise in large numbers.</p><p>\u201cTogether, we can build a cleaner, healthier, and safer environment for all,\u201d she said.</p><p>The two-day national exercise is being held under the theme \u201cOur Actions, Our Future: Cleaning Ghana after the Floods.\u201d</p>',
        excerpt: 'The DCE for Anloga, Hon. Sandra Seyram Kpedor, has commended participants in the National General Cleaning Exercise and is calling on all residents to join Day 2 of the exercise.',
        status: 'published',
        isFeatured: false,
        isBreaking: false,
        viewCount: 3000,
        authorId: author.id,
        categoryId: generalNews.id,
        publishedAt: new Date(),
      }
    });
    console.log('  Created article: Anloga DCE Clean-Up (General News)');
  }

  // 15. Add Klikor Chiefs article (General News)
  const klikorSlug = 'klikor-chiefs-lobby-government-roads-development-paramount-chiefs-funeral';
  let klikorArticle = await db.article.findFirst({ where: { slug: klikorSlug } });
  if (!klikorArticle) {
    await db.article.create({
      data: {
        title: 'Klikor Chiefs Lobby Government for Roads and Development Ahead of Paramount Chief\u2019s Funeral',
        slug: klikorSlug,
        content: '<p>ACCRA, July 10, 2026 - The Klikor Traditional Council has appealed to the government for urgent infrastructure support as preparations begin for the final funeral rites of the late Paramount Chief, Torgbuiga Addo VIII.</p><p>A delegation led by the new Paramount Chief, Torgbuiga Addo IX, met officials at the Presidency on Tuesday. They included Chief of Staff Julius Debrah, Presidential Legal Adviser Marietta Brew Oppong, and Minister for Presidential Special Projects Michael Agyekum.</p><p>The Council announced that the funeral is scheduled for October 24, 2026 in Klikor, Ketu South Municipality, with activities starting October 1. Thousands of guests are expected.</p><p>The chiefs requested that major roads into Klikor be rehabilitated before the event to allow smooth movement of mourners. They also called for more government investment in health, education and other projects in Ketu South.</p><p>Torgbuiga Addo VIII died on January 14, 2026 at age 93 after 42 years on the throne. He has been succeeded by Dr. Frank Hukporti, now Torgbuiga Addo IX, a retired Deputy Commissioner of Police.</p>',
        excerpt: 'The Klikor Traditional Council has appealed to the government for urgent road rehabilitation and infrastructure support ahead of the final funeral rites of the late Paramount Chief, Torgbuiga Addo VIII, scheduled for October 24, 2026.',
        status: 'published',
        isFeatured: false,
        isBreaking: false,
        viewCount: 4000,
        authorId: author.id,
        categoryId: generalNews.id,
        publishedAt: new Date(),
      }
    });
    console.log('  Created article: Klikor Chiefs (General News)');
  }

  // 16. Update admin email if still old one
  const admin = await db.user.findFirst({ where: { role: 'super_admin' } });
  if (admin && admin.email === 'admin@newsportal.com') {
    await db.user.update({
      where: { id: admin.id },
      data: { email: 'admin@24hournews.com' }
    });
    console.log('  Updated admin email to admin@24hournews.com');
  }

  console.log('\n  Migration complete!');
  await db.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });