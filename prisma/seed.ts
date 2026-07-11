import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ─────────────────────────────────────────────
// Helper: days-ago helper
// ─────────────────────────────────────────────
function daysAgo(days: number, hours = 0, minutes = 0): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

// ─────────────────────────────────────────────
// 1. USERS
// ─────────────────────────────────────────────
const users = [
  {
    email: "admin@newsportal.com",
    password: "Admin@123",
    name: "Super Admin",
    role: "super_admin",
    bio: "System administrator and chief editor of Ghana News Portal.",
  },
  {
    email: "editor@newsportal.com",
    password: "Editor@123",
    name: "John Editor",
    role: "editor",
    bio: "Senior editor with over 15 years of experience in Ghanaian media.",
  },
  {
    email: "reporter1@newsportal.com",
    password: "Reporter@123",
    name: "Jane Reporter",
    role: "reporter",
    bio: "Political and business correspondent based in Accra.",
  },
  {
    email: "reporter2@newsportal.com",
    password: "Reporter@123",
    name: "Kwame Asante",
    role: "reporter",
    bio: "Sports and entertainment journalist covering West Africa.",
  },
];

// ─────────────────────────────────────────────
// 2. CATEGORIES
// ─────────────────────────────────────────────
const categories = [
  {
    name: "Politics",
    slug: "politics",
    description: "Political news, governance, and policy updates from Ghana and across Africa.",
    color: "#dc2626",
    icon: "Landmark",
    order: 1,
    isFeatured: true,
  },
  {
    name: "Business",
    slug: "business",
    description: "Business news, financial markets, and economic analysis.",
    color: "#059669",
    icon: "TrendingUp",
    order: 2,
    isFeatured: true,
  },
  {
    name: "Sports",
    slug: "sports",
    description: "Sports news, match results, and athlete profiles.",
    color: "#d97706",
    icon: "Trophy",
    order: 3,
    isFeatured: true,
  },
  {
    name: "Entertainment",
    slug: "entertainment",
    description: "Music, film, arts, and celebrity news from Ghana and beyond.",
    color: "#9333ea",
    icon: "Clapperboard",
    order: 4,
    isFeatured: true,
  },
  {
    name: "Technology",
    slug: "technology",
    description: "Technology news, innovations, and digital trends.",
    color: "#0891b2",
    icon: "Cpu",
    order: 5,
    isFeatured: true,
  },
  {
    name: "Health",
    slug: "health",
    description: "Health news, medical breakthroughs, and public health updates.",
    color: "#16a34a",
    icon: "HeartPulse",
    order: 6,
    isFeatured: false,
  },
  {
    name: "Education",
    slug: "education",
    description: "Education sector news, school updates, and academic developments.",
    color: "#2563eb",
    icon: "GraduationCap",
    order: 7,
    isFeatured: false,
  },
  {
    name: "Opinion",
    slug: "opinion",
    description: "Op-eds, editorials, and expert analysis on current affairs.",
    color: "#ca8a04",
    icon: "MessageSquareText",
    order: 8,
    isFeatured: false,
  },
  {
    name: "Lifestyle",
    slug: "lifestyle",
    description: "Lifestyle, culture, food, and living in Ghana.",
    color: "#e11d48",
    icon: "Sparkles",
    order: 9,
    isFeatured: false,
  },
  {
    name: "Regional News",
    slug: "regional-news",
    description: "News from across Ghana's regions and neighbouring countries.",
    color: "#7c3aed",
    icon: "MapPin",
    order: 10,
    isFeatured: false,
  },
];

// ─────────────────────────────────────────────
// 3. TAGS
// ─────────────────────────────────────────────
const tagNames = [
  "Elections",
  "Economy",
  "Football",
  "Music",
  "Film",
  "AI",
  "Mobile",
  "COVID-19",
  "Education Reform",
  "Infrastructure",
  "Agriculture",
  "Climate",
  "Tourism",
  "Security",
  "Youth",
  "Gender",
  "Healthcare",
  "Technology Policy",
  "Trade",
  "Energy",
];

const tags = tagNames.map((name) => ({
  name,
  slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
}));

// ─────────────────────────────────────────────
// 4. ARTICLES (15 total: 12 published, 3 draft)
// ─────────────────────────────────────────────
const articles = [
  // ── PUBLISHED ──────────────────────────────
  {
    title: "Ghana's 2024 Election Results: A New Chapter in Democratic Governance",
    slug: "ghana-2024-election-results-new-chapter-democratic-governance",
    excerpt:
      "The Electoral Commission has officially declared the results of Ghana's tightly contested 2024 general elections, marking a significant moment in the nation's democratic journey.",
    content: `Ghana's Electoral Commission has officially declared the results of the 2024 general elections, bringing to a close what many observers have described as one of the most closely watched electoral processes in West Africa. The results, announced at the commission's headquarters in Accra, revealed a decisive mandate that has been widely praised by both domestic and international observers for its transparency and adherence to democratic principles.

The chairperson of the Electoral Commission, addressing a packed press conference flanked by representatives from various political parties and civil society organisations, confirmed that the elections were conducted in a free, fair, and credible manner. Voter turnout was recorded at approximately 72 percent, a figure that reflects the deep engagement of the Ghanaian electorate in shaping the future of their country.

Across the country's 275 constituencies, polling stations opened on time and the process was largely peaceful. The biometric verification system, introduced in previous election cycles, was deployed effectively across all 38,000 polling stations, significantly reducing incidents of voter fraud and ensuring the integrity of the ballot. International observer missions from the African Union, the Economic Community of West African States, and the European Union all issued preliminary statements commending the conduct of the elections.

However, the process was not without its challenges. In a few constituencies in the Northern and Volta Regions, technical difficulties with electronic transmission of results led to delays in collation. The Electoral Commission addressed these issues by deploying backup systems and extending the collation window by 24 hours. Political parties raised concerns in about 15 constituencies, but these were resolved through the established dispute resolution mechanisms.

The president-elect, in a victory speech delivered at the Independence Square, called for national unity and pledged to govern for all Ghanaians regardless of political affiliation. "Tonight, we celebrate not the victory of one party, but the victory of our democracy," the president-elect declared to thunderous applause from thousands of supporters. "The people have spoken, and their voice is clear. We must now come together to build the Ghana we all deserve."

The outgoing president conceded defeat in a televised address, congratulating the president-elect and urging supporters to accept the results peacefully. This graceful concession was hailed as a testament to the maturing of Ghana's democratic culture, which has seen peaceful transfers of power since the return to multi-party democracy in 1992.

Economic issues dominated the campaign, with voters expressing deep concern about inflation, the cost of living, and youth unemployment. The new administration will face immediate pressure to deliver on campaign promises related to economic recovery, job creation, and fiscal discipline. Analysts have noted that the incoming government inherits a challenging economic landscape, with public debt exceeding 80 percent of GDP and inflation still in double digits despite recent improvements.

Civil society organisations have called on the new government to prioritise anti-corruption measures and strengthen public institutions. "The expectations are enormous," said the executive director of a leading governance think tank. "Ghanaians want to see tangible improvements in their daily lives, and they will hold this government accountable from day one."

As the country prepares for the transition of power, attention now turns to the composition of the new cabinet and the policy direction the administration will take. The peaceful conclusion of these elections once again positions Ghana as a beacon of democratic stability on the African continent.`,
    status: "published",
    isFeatured: true,
    isPinned: false,
    isBreaking: true,
    publishedAt: daysAgo(0, 8, 30),
    categorySlug: "politics",
    authorEmail: "editor@newsportal.com",
    tagNames: ["Elections", "Security"],
  },
  {
    title: "Ghana's Economy Shows Signs of Recovery as GDP Growth Hits 4.2 Percent",
    slug: "ghana-economy-recovery-gdp-growth-4-2-percent",
    excerpt:
      "Latest figures from the Ghana Statistical Service show the economy growing at 4.2 percent in the third quarter, driven by agriculture and services sectors.",
    content: `Ghana's economy is showing encouraging signs of recovery, with the latest gross domestic product figures from the Ghana Statistical Service revealing a growth rate of 4.2 percent for the third quarter of 2024. This represents a notable improvement from the 3.1 percent recorded in the previous quarter and signals that the government's economic recovery programme may be gaining traction.

The services sector continued to be the largest contributor to GDP, accounting for approximately 48 percent of economic output. Within this sector, information and communications technology showed particularly strong growth, expanding by 12.3 percent year-on-year. The financial services sub-sector also performed well, benefiting from the Bank of Ghana's monetary policy adjustments and increased credit activity.

Agriculture, which employs nearly 40 percent of Ghana's workforce, grew by 5.8 percent, outpacing its historical average. This growth was driven by favourable weather conditions, improved access to fertiliser through government subsidy programmes, and expanding export markets for cocoa and other cash crops. The cocoa sub-sector benefited from higher international prices, with Ghana earning significantly more from cocoa exports compared to the same period last year.

The industrial sector, however, remained a mixed picture. While mining and quarrying activities increased by 3.5 percent, supported by strong gold prices on the international market, manufacturing growth was modest at 1.8 percent. Manufacturers have cited high energy costs, the depreciation of the cedi, and difficulties accessing affordable credit as persistent constraints on expansion and hiring.

Inflation continued its downward trajectory, falling to 18.4 percent in October from a peak of over 54 percent in late 2022. The Bank of Ghana's tight monetary policy stance, which has seen the policy rate maintained at relatively high levels, has been instrumental in bringing inflation under control. Food inflation, which had been the primary driver of overall price increases, has moderated significantly, though non-food inflation remains stubbornly high.

The cedi, Ghana's currency, has shown relative stability against the major trading currencies in recent months, a development that economists attribute to improved foreign exchange inflows from cocoa exports, remittances from the Ghanaian diaspora, and the International Monetary Fund programme. The current account deficit has narrowed to 2.1 percent of GDP, well below the 4.8 percent recorded a year earlier.

Government revenue collection has improved, with the Ghana Revenue Authority exceeding its quarterly target by 8 percent. The introduction of new digital tax administration tools and the broadening of the tax base have contributed to this improvement. However, government expenditure remains high, driven primarily by debt service obligations and public sector wages, and the fiscal deficit for the year is projected at around 5.5 percent of GDP.

Economists have welcomed the positive GDP numbers but caution that the recovery remains fragile. "We are seeing green shoots, but we are not out of the woods yet," said a senior economist at the Institute of Economic Affairs. "The key challenge now is to sustain this momentum while addressing the structural weaknesses that made the economy vulnerable in the first place. That means investing in infrastructure, improving the business environment, and building fiscal buffers for future shocks."

The Ministry of Finance has expressed optimism about the outlook for 2025, projecting GDP growth of between 4.5 and 5 percent if current trends continue and global economic conditions remain favourable. The government has also reaffirmed its commitment to the IMF-supported economic reform programme, which is entering its final year.`,
    status: "published",
    isFeatured: true,
    isPinned: true,
    isBreaking: false,
    publishedAt: daysAgo(1, 14, 15),
    categorySlug: "business",
    authorEmail: "reporter1@newsportal.com",
    tagNames: ["Economy", "Trade", "Infrastructure"],
  },
  {
    title: "Black Stars Secure Crucial AFCON Qualifier Win Against Nigeria in Accra",
    slug: "black-stars-crucial-afcon-qualifier-win-against-nigeria-accra",
    excerpt:
      "Ghana's national football team delivered a commanding performance at the Baba Yara Stadium, defeating Nigeria 2-1 to boost their Africa Cup of Nations qualification hopes.",
    content: `The Black Stars of Ghana delivered a performance of immense character and quality at the Baba Yara Stadium in Kumasi, defeating their West African rivals Nigeria 2-1 in a crucial Africa Cup of Nations qualifier that has reignited the nation's passion for football and boosted the team's chances of reaching the tournament proper.

A crowd of over 40,000 passionate fans created an electric atmosphere at the stadium, with the stands a sea of red, gold, and green from the first whistle to the last. The players fed off this energy, pressing Nigeria high up the pitch from the opening minutes and creating several early chances that tested the resolve of the Super Eagles' defence.

The opening goal came in the 23rd minute, following a sweeping counter-attack that showcased the growing understanding between Ghana's attacking players. A perfectly weighted through ball from the midfield found the streaking forward, who calmly slotted the ball past the Nigerian goalkeeper to send the stadium into raptures. The celebration was a display of pure joy, with players and fans united in a moment of shared euphoria.

Nigeria, to their credit, responded well and equalised just before half-time through a well-taken free kick that left Ghana's goalkeeper with no chance. The second half began with both teams trading blows in a thrilling end-to-end contest, but it was Ghana who found the decisive moment in the 72nd minute. A corner kick delivery was met powerfully by a towering header, and the ball cannoned off the crossbar and over the line, confirmed by goal-line technology.

The coach praised his players' resilience and tactical discipline in the post-match press conference. "This was a team performance in every sense of the word," he said. "Every player gave everything they had, and the fans were our twelfth man. We still have work to do to qualify, but this result gives us a tremendous platform to build on."

The victory moves Ghana to the top of their qualification group with two matches remaining. The team will face their remaining fixtures with renewed confidence, knowing that maximum points from those games would secure their place at the Africa Cup of Nations.

Off the pitch, the Ghana Football Association announced that ticket sales for the match had generated record revenue, with proceeds being directed towards youth football development programmes across the country. The association also revealed plans to upgrade training facilities at the national team's base in Accra, as part of a broader strategy to professionalise the sport in Ghana.

Football analysts have noted the emergence of several young players in the current squad, suggesting that the future of Ghanaian football is bright. "We are seeing a new generation of players who are technically gifted, physically strong, and mentally tough," said a respected football commentator. "If we can continue to develop these players and give them the right competitive environment, Ghana can once again become a force to be reckoned with on the continental and global stage."

The government has also pledged continued support for sports development, with the Minister of Youth and Sports announcing a new funding package for grassroots football academies. "Football is more than just a game in Ghana," the minister said. "It is a source of national pride, unity, and inspiration. We must invest in it accordingly."`,
    status: "published",
    isFeatured: true,
    isPinned: false,
    isBreaking: true,
    publishedAt: daysAgo(0, 20, 0),
    categorySlug: "sports",
    authorEmail: "reporter2@newsportal.com",
    tagNames: ["Football", "Youth"],
  },
  {
    title: "Stonebwoy Wins Best African Act at International Music Awards in London",
    slug: "stonebwoy-wins-best-african-act-international-music-awards-london",
    excerpt:
      "Ghanaian dancehall artist Stonebwoy has been crowned Best African Act at a prestigious international music ceremony, cementing Ghana's growing influence on the global music stage.",
    content: `Ghanaian dancehall and afrobeats sensation Stonebwoy has added another accolade to his already impressive collection, winning the Best African Act award at the International Music Awards ceremony held at the O2 Arena in London. The victory marks the second time the artist has won the award and underscores the growing global recognition of Ghanaian music on the world stage.

Stonebwoy, whose real name is Livingstone Etse Satekla, accepted the award in a ceremony attended by some of the biggest names in the global music industry. Dressed in a custom-designed outfit that blended traditional Kente cloth elements with contemporary streetwear, the artist delivered an acceptance speech that celebrated African creativity and called for greater investment in the continent's creative industries.

"This award is not just for me," Stonebwoy told the audience. "It is for every Ghanaian artist, every producer, every sound engineer, and every fan who has believed in our music. Africa is the future of music, and Ghana is leading the charge. We are not asking for a seat at the table anymore — we are building our own table."

The award comes at a time when Ghanaian music is experiencing unprecedented international attention. Artists such as Sarkodie, Shatta Wale, Amaarae, King Promise, and M.anifest have all achieved significant international recognition in recent years, contributing to what industry observers have termed the "Ghanaian music renaissance." The success of these artists has been driven by a unique sound that blends traditional Ghanaian rhythms with contemporary genres including dancehall, afrobeats, hip-hop, and R&B.

The Ghanaian music industry has also benefited from strategic partnerships with international record labels and streaming platforms. Data from leading streaming services shows that Ghanaian music has seen a 340 percent increase in global streams over the past three years, with significant growth in markets across Europe, North America, and Asia.

The Minister of Tourism, Arts and Culture congratulated Stonebwoy on the achievement and used the occasion to announce a new government initiative aimed at supporting the creative arts sector. The initiative, which includes a dedicated creative arts fund and the establishment of a national music archive, is expected to provide financial support and infrastructure for Ghanaian artists.

Music industry stakeholders have welcomed the announcement but called for more comprehensive reforms, including stronger copyright protection, improved royalty collection mechanisms, and investment in music education. "We have the talent, we have the creativity, and now we have the global attention," said the president of the Musicians Union of Ghana. "What we need is the institutional framework to ensure that our artists can build sustainable careers and that the industry contributes meaningfully to the national economy."

Back in Ghana, fans took to social media to celebrate Stonebwoy's victory, with the artist's name trending at number one on Twitter Ghana for over 12 hours. A victory concert is being planned for later this month at the Independence Square in Accra, which is expected to draw tens of thousands of fans.`,
    status: "published",
    isFeatured: true,
    isPinned: false,
    isBreaking: false,
    publishedAt: daysAgo(2, 10, 45),
    categorySlug: "entertainment",
    authorEmail: "reporter2@newsportal.com",
    tagNames: ["Music", "Film", "Tourism"],
  },
  {
    title: "Ghana Launches National AI Strategy to Drive Digital Transformation",
    slug: "ghana-launches-national-ai-strategy-digital-transformation",
    excerpt:
      "The government has unveiled a comprehensive national artificial intelligence strategy aimed at positioning Ghana as a leader in AI adoption and innovation across West Africa.",
    content: `The government of Ghana has launched an ambitious National Artificial Intelligence Strategy, a comprehensive blueprint designed to harness the transformative potential of AI technologies for economic growth, public service delivery, and social development. The strategy, developed over 18 months with input from academia, industry, and international partners, sets out a roadmap for AI adoption across key sectors including agriculture, healthcare, education, and governance.

The Vice President, who launched the strategy at a ceremony in Accra attended by technology leaders, diplomats, and academics, described AI as "the most consequential technology of our time" and pledged the government's full commitment to creating an enabling environment for AI innovation. "Ghana will not be a passive observer of the AI revolution," the Vice President declared. "We will be an active participant and, ultimately, a leader in developing AI solutions that address our unique challenges as a nation and a continent."

The strategy identifies five strategic pillars: building AI talent and capacity, strengthening data infrastructure and governance, fostering AI research and innovation, promoting responsible and ethical AI deployment, and creating an enabling regulatory and policy environment. Under each pillar, specific initiatives and targets have been outlined, with implementation timelines stretching to 2030.

A key component of the strategy is the establishment of a National AI Centre of Excellence, which will serve as a hub for AI research, development, and deployment. The centre, to be hosted at a leading university in collaboration with the private sector, will focus on developing AI applications tailored to Ghanaian and African contexts. Initial priority areas include AI-powered agricultural advisory systems, diagnostic tools for healthcare facilities in underserved areas, and intelligent transportation management systems for urban areas.

The strategy also addresses the critical need for AI talent development. Ghana currently faces a significant shortage of AI and data science professionals, a gap the strategy seeks to close through a combination of university curriculum reforms, vocational training programmes, and international partnerships. The government has announced scholarships for 500 Ghanaian students to pursue advanced degrees in AI and related fields over the next five years.

Recognising the importance of data as the foundation of AI, the strategy includes provisions for strengthening national data infrastructure, including the establishment of data sharing frameworks between government agencies and the creation of secure, interoperable data platforms. Privacy and data protection safeguards are prominently featured, with the strategy mandating adherence to the Data Protection Act and alignment with international best practices.

The private sector has responded positively to the strategy, with several major technology companies announcing planned investments in Ghana's AI ecosystem. A leading global technology firm has pledged to establish an AI research lab in Accra, creating an estimated 200 high-skilled jobs. Local startups working in the AI space have also welcomed the strategy, noting that it provides much-needed policy clarity and institutional support.

However, some critics have raised concerns about the practical challenges of implementation, particularly given the country's existing infrastructure constraints. "The strategy is well-conceived and ambitious, but the devil will be in the details of execution," said a technology policy analyst. "We need reliable electricity, affordable and fast internet connectivity, and sustained investment in education. Without these fundamentals, even the best AI strategy will struggle to deliver results."

The Ministry of Communications and Digitalisation, which will coordinate the strategy's implementation, has established a multi-stakeholder steering committee to oversee progress and ensure accountability. The first progress report is expected within six months.`,
    status: "published",
    isFeatured: false,
    isPinned: false,
    isBreaking: false,
    publishedAt: daysAgo(1, 9, 0),
    categorySlug: "technology",
    authorEmail: "reporter1@newsportal.com",
    tagNames: ["AI", "Technology Policy", "Education Reform"],
  },
  {
    title: "Mobile Money Transactions in Ghana Surpass GH¢1 Trillion Mark",
    slug: "mobile-money-transactions-ghana-surpass-1-trillion-cedis",
    excerpt:
      "The Bank of Ghana reports that mobile money transactions have exceeded one trillion cedis for the first time, highlighting the country's leadership in digital financial services in Africa.",
    content: `Mobile money transactions in Ghana have surpassed the historic milestone of one trillion Ghana cedis for the first time, according to data released by the Bank of Ghana. The achievement underscores Ghana's position as one of the leading markets for digital financial services in Africa and reflects the profound transformation of the country's financial landscape over the past decade.

The data, which covers the period from January to October 2024, shows that the total value of mobile money transactions reached approximately GH¢1.2 trillion, representing a year-on-year increase of 38 percent. The number of active mobile money accounts has also grown significantly, now exceeding 22 million registered accounts in a country with a population of approximately 33 million people.

Ghana's mobile money ecosystem is anchored by the country's telecommunications operators, with MTN Mobile Money remaining the dominant platform. However, competitors including Vodafone Cash, now rebranded as Telecel Cash, and AT Money have also seen substantial growth, contributing to a increasingly competitive and innovative market. The introduction of mobile money interoperability in 2023, which allows seamless transfers between different mobile money platforms and traditional bank accounts, has been a game-changer for financial inclusion.

The Central Bank governor attributed the growth to several factors, including the expansion of agent networks into rural and semi-urban areas, the introduction of new services such as savings and micro-loans on mobile money platforms, and the government's policy of digitising salary payments and social welfare disbursements. "Mobile money has moved beyond being just a payment tool," the governor said. "It has become a platform for savings, credit, insurance, and investment, bringing formal financial services to millions of Ghanaians who were previously excluded."

The impact on financial inclusion has been particularly notable. Data from the World Bank's Global Findex indicates that the proportion of Ghanaian adults with a formal financial account has increased from 41 percent in 2017 to over 68 percent in 2024, with mobile money being the primary driver of this expansion. Women, rural populations, and small business owners have been the biggest beneficiaries of this revolution.

Small and medium-sized enterprises have also embraced mobile money as a primary tool for receiving payments and managing their finances. A recent survey by the Ghana Chamber of Commerce found that 78 percent of SMEs now accept mobile money payments, up from 45 percent just three years ago. This has reduced the reliance on cash transactions, lowered the risk of theft, and improved business record-keeping.

Despite the impressive growth, challenges remain. Fraud and cybercrime targeting mobile money users have increased, with the Bank of Ghana reporting a 25 percent rise in reported incidents. The central bank has responded by strengthening KYC (Know Your Customer) requirements, introducing transaction limits, and working with telecommunications companies to enhance security features. Consumer education campaigns are also being conducted to raise awareness about common fraud schemes.

The government has announced plans to build on the success of mobile money by developing a comprehensive national digital payments strategy that will encompass not just mobile money but also digital banking, e-commerce payments, and central bank digital currencies. "Our vision is a Ghana where every transaction, no matter how small, can be conducted digitally, securely, and affordably," said the Minister of Finance.`,
    status: "published",
    isFeatured: false,
    isPinned: false,
    isBreaking: false,
    publishedAt: daysAgo(2, 16, 30),
    categorySlug: "business",
    authorEmail: "reporter1@newsportal.com",
    tagNames: ["Mobile", "Economy", "Technology Policy"],
  },
  {
    title: "Ghana Health Service Launches Nationwide Mental Health Awareness Campaign",
    slug: "ghana-health-service-launches-nationwide-mental-health-awareness-campaign",
    excerpt:
      "A groundbreaking mental health campaign is being rolled out across all 16 regions to combat stigma and improve access to mental healthcare services.",
    content: `The Ghana Health Service has launched a comprehensive nationwide mental health awareness campaign, the largest of its kind in the country's history, aimed at breaking down the stigma surrounding mental health conditions and improving access to care for millions of Ghanaians living with mental health disorders.

The campaign, themed "Your Mind Matters," was officially launched in Accra by the Director-General of the Ghana Health Service, with support from the World Health Organization, UNICEF, and several local mental health advocacy organisations. The initiative will run for an initial period of 18 months and will encompass community outreach programmes, media engagement, school-based interventions, and the training of primary healthcare workers in basic mental health screening and support.

Mental health remains one of the most neglected areas of healthcare in Ghana. Studies estimate that approximately 3.1 million Ghanaians suffer from some form of mental health condition, ranging from common mental disorders such as depression and anxiety to severe conditions including schizophrenia and bipolar disorder. Yet, the country has fewer than 40 psychiatrists and 500 psychiatric nurses serving a population of 33 million, a ratio that is grossly inadequate.

The stigma attached to mental illness in Ghanaian society means that many people suffering from mental health conditions do not seek help, often turning instead to traditional and faith-based healers. While these practitioners play an important cultural role, they are not equipped to provide evidence-based treatment for serious mental health conditions. The campaign seeks to change these attitudes by educating the public about the biological basis of mental illness and the effectiveness of available treatments.

A central component of the campaign is the integration of mental health services into primary healthcare. Under this model, community health nurses and other primary care providers will receive training in basic mental health screening, enabling them to identify potential cases early and refer patients to appropriate specialists. This approach is particularly important for reaching rural communities, where access to specialist mental health services is extremely limited.

The campaign also targets young people, who are disproportionately affected by mental health issues. Recent surveys have found that approximately 20 percent of Ghanaian adolescents report symptoms of depression, driven by academic pressure, social media use, economic hardship, and family instability. School-based counselling programmes will be established in 500 senior high schools across the country as part of the initiative.

Funding for the campaign has been provided through a combination of government allocation, donor support, and private sector partnerships. A leading telecommunications company has committed GH¢5 million to support the digital components of the campaign, including a mental health hotline and a mobile app that provides self-help resources and connects users with counsellors.

Mental health professionals have welcomed the campaign but emphasise that sustained investment in mental health infrastructure and human resources is essential for lasting change. "Awareness is the first step, but it cannot be the last," said the chief psychiatrist at the Accra Psychiatric Hospital. "We need more trained professionals, more facilities, better supply chains for essential medications, and a commitment from the government to make mental health a budgetary priority."`,
    status: "published",
    isFeatured: false,
    isPinned: false,
    isBreaking: false,
    publishedAt: daysAgo(3, 11, 0),
    categorySlug: "health",
    authorEmail: "reporter1@newsportal.com",
    tagNames: ["Healthcare", "Youth", "Gender"],
  },
  {
    title: "Free SHS Policy: Five Years On, What Has Changed for Ghanaian Students?",
    slug: "free-shs-policy-five-years-what-changed-ghanaian-students",
    excerpt:
      "As Ghana's flagship Free Senior High School policy marks its fifth anniversary, educators and analysts assess its impact on access, quality, and educational outcomes.",
    content: `Ghana's Free Senior High School (Free SHS) policy, one of the most ambitious educational interventions in the country's history, has marked its fifth anniversary, prompting a comprehensive assessment of its impact on educational access, quality, and outcomes. The policy, which was implemented in September 2017, eliminated tuition and other fees for all students enrolled in public senior high schools, dramatically expanding access to secondary education.

The numbers tell an impressive story of expanded access. Before the policy was introduced, approximately 800,000 students were enrolled in senior high schools across the country. Today, that figure stands at over 1.4 million, representing a 75 percent increase in enrollment. The policy has been particularly transformative for students from low-income families and rural communities, many of whom would previously have been unable to afford secondary education.

Gender parity in secondary school enrollment has also improved significantly. The ratio of girls to boys in senior high schools has moved from approximately 0.85 to 0.94 over the five-year period, narrowing the gender gap in educational attainment. In some regions, including the Northern and Upper East Regions, girls now outnumber boys in senior high school enrollment for the first time.

However, the rapid expansion of enrollment has placed enormous strain on the education system. Class sizes have increased dramatically, with some schools reporting student-to-teacher ratios exceeding 50:1, far above the recommended maximum of 25:1. Infrastructure has not kept pace with demand, and many schools are operating double-track systems, where students attend school in shifts to accommodate the increased numbers.

The quality of education delivered under the Free SHS policy has been a subject of intense debate. Results from the West African Senior School Certificate Examination (WASSCE) have been mixed, with the overall pass rate remaining relatively stable but concerns raised about declining performance in core subjects including mathematics and science. Educators argue that the pressure of large class sizes and inadequate teaching materials has made it difficult to maintain instructional quality.

The government has defended the policy, pointing to the fundamental importance of educational access. "Before Free SHS, hundreds of thousands of capable young Ghanaians were denied the opportunity to complete secondary education simply because their families could not afford it," said the Minister of Education. "Access must come first. We are now working systematically to address the quality challenges that come with expansion."

To address infrastructure gaps, the government has initiated a major school building programme, with 200 new senior high school projects at various stages of completion across the country. Additionally, a comprehensive teacher recruitment drive is underway, with the goal of hiring 15,000 new teachers over the next three years.

Education analysts have suggested several reforms to improve the policy's effectiveness, including targeted support for low-performing schools, the introduction of technology-assisted learning to supplement classroom instruction, and greater involvement of the private sector in educational delivery. "Free SHS has been a remarkable achievement in terms of access," said an education policy researcher at the University of Ghana. "The challenge now is to ensure that access translates into meaningful learning outcomes that prepare our young people for the future."`,
    status: "published",
    isFeatured: false,
    isPinned: false,
    isBreaking: false,
    publishedAt: daysAgo(4, 8, 15),
    categorySlug: "education",
    authorEmail: "reporter2@newsportal.com",
    tagNames: ["Education Reform", "Youth"],
  },
  {
    title: "Opinion: Why Ghana Must Lead the Climate Conversation in Africa",
    slug: "opinion-why-ghana-must-lead-climate-conversation-africa",
    excerpt:
      "As climate change intensifies its impact on African communities, Ghana has a unique opportunity to champion the continent's climate agenda on the global stage.",
    content: `As the world grapples with the escalating consequences of climate change, Africa finds itself on the front lines of a crisis it did little to create but is suffering the most from. Of all the nations on the continent, Ghana occupies a uniquely strategic position to lead Africa's climate conversation and advocate for the interests of vulnerable communities on the global stage.

Ghana's vulnerability to climate change is well documented. Rising sea levels threaten coastal communities, including parts of the capital city, Accra, where erosion has already destroyed homes and infrastructure. Changing rainfall patterns are disrupting agricultural cycles, threatening food security for millions of smallholder farmers who depend on predictable weather for their livelihoods. Increasing temperatures are exacerbating the spread of vector-borne diseases, placing additional strain on an already overburdened healthcare system.

Yet, Ghana also possesses significant strengths that position it for climate leadership. The country has a strong democratic tradition and a vibrant civil society that can drive accountability and public engagement on climate issues. Ghana was one of the first African countries to develop a National Climate Change Policy and has made notable commitments under the Paris Agreement, including a target to reduce greenhouse gas emissions by 64 percent by 2030.

The country's renewable energy potential is enormous. Ghana has abundant solar resources, with average daily solar radiation of 4.4 to 5.6 kilowatt-hours per square metre. Wind energy potential along the eastern coastline, hydroelectric power from the Volta River system, and growing interest in biomass energy all point to a future in which Ghana could meet a significant portion of its energy needs from renewable sources.

Ghana's position as a respected voice in international forums, including the United Nations, the African Union, and the Economic Community of West African States, gives it diplomatic leverage to advocate for climate justice. The principle of common but differentiated responsibilities — the idea that countries that have contributed most to global emissions should bear the greatest burden of addressing climate change — must remain at the heart of international climate negotiations.

At the national level, Ghana must accelerate the implementation of its climate commitments. This means investing in climate-resilient agriculture, expanding renewable energy infrastructure, protecting and restoring forests and wetlands, and building climate-resilient cities. The upcoming national climate adaptation plan provides a framework for these efforts, but its success will depend on adequate financing, effective coordination, and sustained political will.

The private sector also has a critical role to play. Ghanaian businesses must integrate climate considerations into their strategies and operations, not only because it is the right thing to do but because climate resilience is increasingly a competitive advantage. Investors worldwide are shifting capital towards sustainable businesses, and Ghanaian companies that fail to adapt risk being left behind.

Ghana's youth, who will inherit the consequences of the climate decisions made today, must be at the centre of the climate conversation. Young Ghanaians are already showing remarkable leadership on climate issues, organising awareness campaigns, developing innovative solutions, and holding leaders accountable. Their energy, creativity, and sense of urgency are exactly what the climate movement needs.

The time for incremental action has passed. Ghana must seize the moment and position itself as the voice of climate ambition in Africa. The world is watching, and the stakes have never been higher.`,
    status: "published",
    isFeatured: false,
    isPinned: false,
    isBreaking: false,
    publishedAt: daysAgo(5, 7, 0),
    categorySlug: "opinion",
    authorEmail: "editor@newsportal.com",
    tagNames: ["Climate", "Energy", "Agriculture"],
  },
  {
    title: "Accra's Emerging Food Scene: How Ghanaian Chefs Are Redefining West African Cuisine",
    slug: "accras-emerging-food-scene-ghanaian-chefs-redefining-west-african-cuisine",
    excerpt:
      "A new generation of Ghanaian chefs is putting the country on the global culinary map, blending traditional flavours with modern techniques and international influences.",
    content: `Accra is experiencing a culinary revolution that is transforming the city's food landscape and putting Ghanaian cuisine on the global map. A new generation of chefs, restaurateurs, and food entrepreneurs are reimagining traditional West African dishes, blending them with modern culinary techniques and international influences to create a dining scene that is vibrant, innovative, and uniquely Ghanaian.

The transformation is visible across the city. In neighbourhoods like Osu, Labone, and East Legon, new restaurants and cafes are opening at a rapid pace, each offering a distinct take on Ghanaian and pan-African cuisine. From upscale dining establishments that present traditional dishes like jollof rice, groundnut soup, and fufu in refined, contemporary settings to casual eateries that celebrate the rich diversity of Ghanaian street food, the options for diners have never been more exciting.

Several Ghanaian chefs have gained international recognition in recent years. One notable figure has been featured in international food publications and has hosted pop-up dinners in London, New York, and Paris, introducing global audiences to the depth and complexity of Ghanaian flavours. "Our cuisine has always been incredible," the chef said in a recent interview. "What is changing is that we are finally presenting it with the confidence and creativity it deserves. We are not apologising for our food anymore."

The movement is driven by a desire to preserve and elevate traditional culinary knowledge while embracing innovation. Many chefs are working directly with smallholder farmers and local producers to source indigenous ingredients that have been overlooked or undervalued. Ingredients like dawadawa (fermented locust beans), prekese (African pepper), and red palm oil are being used in new and unexpected ways, creating dishes that are rooted in tradition but forward-looking in their execution.

Food tourism is also benefiting from Accra's culinary renaissance. Visitors to the city are increasingly seeking out authentic food experiences, from guided street food tours in markets like Makola and Kejetia to cooking classes that teach the art of preparing traditional Ghanaian dishes. The Ghana Tourism Authority has identified food tourism as a key growth area and is developing a national gastronomy strategy to promote Ghana as a premier culinary destination in West Africa.

The business of food in Ghana is also evolving. Food delivery platforms have exploded in popularity, with several local startups competing for market share alongside international players. Cloud kitchens, also known as ghost kitchens, are emerging as a cost-effective way for aspiring chefs and food entrepreneurs to launch their businesses without the overhead of a full restaurant.

Social media has played a crucial role in the growth of Accra's food scene. Food bloggers and Instagram creators have built large followings by documenting the city's culinary offerings, creating buzz around new openings and driving foot traffic to restaurants. Hashtags related to Ghanaian food regularly trend on social media, both locally and among the diaspora community.

Despite the positive momentum, challenges persist. High import duties on kitchen equipment and specialised ingredients make it expensive to run a restaurant. Inconsistent power supply and water access add to operational costs. And while the middle class in Accra is growing, dining out remains a luxury for many Ghanaians, limiting the size of the potential market.

Nevertheless, the trajectory is clear. Accra's food scene is on an upward trajectory, and the chefs and entrepreneurs driving this transformation are just getting started.`,
    status: "published",
    isFeatured: false,
    isPinned: false,
    isBreaking: false,
    publishedAt: daysAgo(3, 18, 0),
    categorySlug: "lifestyle",
    authorEmail: "reporter2@newsportal.com",
    tagNames: ["Tourism", "Agriculture"],
  },
  {
    title: "Tamale Airport Expansion Set to Boost Northern Ghana's Economic Development",
    slug: "tamale-airport-expansion-boost-northern-ghana-economic-development",
    excerpt:
      "The Ghana Airports Authority has commenced work on a major expansion of Tamale Airport, a project expected to transform the economic landscape of the northern regions.",
    content: `The Ghana Airports Authority has commenced work on a major expansion and upgrade of the Tamale Airport, a project that is expected to transform the economic landscape of northern Ghana and open up the region to new investment, trade, and tourism opportunities. The project, which is being funded through a combination of government allocation and a concessionary loan from the African Development Bank, represents one of the largest infrastructure investments in the northern part of the country.

The expansion includes the construction of a new terminal building with a capacity of one million passengers per year, the extension and reinforcement of the runway to accommodate larger aircraft, the installation of modern navigation and lighting systems, and the development of a cargo terminal to facilitate the export of agricultural products from the region. The total cost of the project is estimated at $250 million, with completion expected within three years.

Tamale is the capital of the Northern Region and the largest city in northern Ghana, with a population of approximately 400,000. The city serves as a commercial and transportation hub for the northern half of the country, but its economic potential has been constrained by limited air connectivity and inadequate infrastructure. Currently, the airport handles only a handful of domestic flights per day, primarily to and from Accra and Kumasi.

The expansion is expected to have far-reaching economic benefits for the region. Improved air connectivity will make it easier for businesses to access the northern market, attracting investment in sectors such as agribusiness, manufacturing, and tourism. The cargo terminal will enable farmers in the region to export fresh produce, including mangoes, shea products, and cashew nuts, directly to international markets, bypassing the lengthy and costly overland journey to Tema or Takoradi harbours.

The tourism sector stands to benefit significantly. The northern regions are home to some of Ghana's most compelling cultural and natural attractions, including the Larabanga Mosque (one of the oldest mosques in West Africa), the Mole National Park, the Savannah landscapes of the Upper East and Upper West Regions, and the vibrant festivals of the various ethnic groups that call the region home. Improved air access is expected to boost tourist arrivals to the region by an estimated 40 percent within the first two years of the expanded airport's operation.

Local communities have expressed optimism about the project but have also raised concerns about land acquisition, displacement, and the equitable distribution of benefits. The Ghana Airports Authority has established a community liaison committee to address these concerns and ensure that affected communities are adequately compensated and supported throughout the construction process.

The Northern Regional Minister described the project as "a game-changer for the development of northern Ghana" and called on the private sector to begin planning investments that will take advantage of the improved infrastructure. "For too long, the northern regions have been left behind in terms of infrastructure and economic development," the minister said. "This airport expansion is a powerful signal that this is changing."

Construction is being carried out by a joint venture between a Ghanaian construction firm and an international aviation infrastructure company, creating an estimated 1,500 direct jobs during the construction phase and several hundred permanent jobs once the expanded airport is operational.`,
    status: "published",
    isFeatured: false,
    isPinned: false,
    isBreaking: false,
    publishedAt: daysAgo(6, 12, 0),
    categorySlug: "regional-news",
    authorEmail: "reporter1@newsportal.com",
    tagNames: ["Infrastructure", "Agriculture", "Tourism"],
  },
  {
    title: "COVID-19 Pandemic Lessons: Ghana's Health System Preparedness for Future Outbreaks",
    slug: "covid-19-pandemic-lessons-ghana-health-system-preparedness-future-outbreaks",
    excerpt:
      "Health officials review the lessons learned from the COVID-19 pandemic and outline measures being taken to strengthen Ghana's preparedness for future public health emergencies.",
    content: `Three years after the World Health Organization declared the COVID-19 pandemic, Ghana's health authorities are taking stock of the lessons learned and implementing comprehensive reforms to strengthen the country's preparedness for future public health emergencies. The pandemic, which claimed over 1,600 lives in Ghana and infected more than 170,000 people, exposed both strengths and critical weaknesses in the country's health system.

Ghana's initial response to the pandemic was widely praised. The country was among the first in Africa to implement comprehensive testing, contact tracing, and quarantine measures. The Ghana Health Service rapidly established testing centres across all 16 regions, leveraging the existing polio surveillance infrastructure. The government's aggressive public communication campaign, including regular televised addresses by the president, helped to build public trust and compliance with preventive measures.

The pandemic also catalysed innovation in Ghana's health sector. Local pharmaceutical companies began manufacturing personal protective equipment, hand sanitiser, and eventually participated in vaccine production discussions. Technology was deployed in novel ways, including the use of drones for delivering COVID-19 test samples from remote areas to testing laboratories in Accra, a partnership with Zipline that was later expanded to deliver blood products and essential medicines.

However, the pandemic also revealed deep structural weaknesses. Ghana's healthcare system, which spends approximately 4 percent of GDP on health (below the African Union's target of 15 percent), was quickly overwhelmed. Hospital bed capacity, intensive care unit beds, and ventilator supplies were insufficient to handle a major surge in cases. The dependence on imported medical supplies, including essential drugs and equipment, created dangerous vulnerabilities when global supply chains were disrupted.

The health workforce, already stretched thin before the pandemic, faced unprecedented pressure. Healthcare workers reported burnout, mental health challenges, and inadequate protection, particularly in the early months of the pandemic. Several healthcare workers lost their lives to COVID-19, highlighting the risks faced by those on the frontlines of the response.

In response to these challenges, the government has developed a National Health Security Action Plan that outlines a comprehensive set of reforms. Key elements include the establishment of a National Public Health Emergency Operations Centre, the expansion of intensive care capacity in regional hospitals, the development of local pharmaceutical manufacturing capabilities, and the creation of a strategic national stockpile of essential medical supplies.

The plan also emphasises the importance of data-driven decision-making in public health emergency response. A new electronic disease surveillance system is being deployed that will enable real-time monitoring of disease outbreaks across the country, with automated alert mechanisms that trigger rapid response protocols when threshold levels are reached.

Community engagement and trust-building are identified as critical success factors. The pandemic demonstrated that public compliance with health measures is heavily influenced by trust in government institutions and health authorities. Investment in community health education, the training of community health volunteers, and the strengthening of relationships between health facilities and the communities they serve are all prioritised in the new plan.

International partnerships remain essential. Ghana continues to work with the WHO, the Africa CDC, and bilateral partners to strengthen its health security capabilities. The country's participation in the COVAX facility for vaccine distribution, while not without challenges, provided valuable lessons in international health cooperation.

The Director General of the Ghana Health Service has emphasised that preparedness is an ongoing process, not a one-time achievement. "The next pandemic may not be like COVID-19," he said. "It could be a new influenza strain, a drug-resistant infection, or something entirely unexpected. Our health system must be resilient enough to adapt and respond effectively regardless of the nature of the threat."`,
    status: "published",
    isFeatured: false,
    isPinned: false,
    isBreaking: false,
    publishedAt: daysAgo(5, 15, 45),
    categorySlug: "health",
    authorEmail: "reporter1@newsportal.com",
    tagNames: ["COVID-19", "Healthcare"],
  },
  // ── DRAFT ARTICLES (3) ────────────────────
  {
    title: "Ghana's Renewable Energy Sector Attracts $500 Million in New Investments",
    slug: "ghana-renewable-energy-sector-attracts-500-million-new-investments",
    excerpt:
      "International investors are pouring money into Ghana's solar and wind energy projects as the country accelerates its transition to cleaner energy sources.",
    content: `Ghana's renewable energy sector is experiencing an unprecedented wave of investment, with over $500 million in new commitments announced in the past quarter alone. The investments, which span solar, wind, and biomass energy projects, reflect growing international confidence in Ghana's energy transition agenda and the country's vast untapped renewable energy potential.

The largest single investment comes from a consortium of European and Middle Eastern investors who have committed $300 million to develop a 250-megawatt solar farm in the Buipe area of the Savannah Region. The project, which will be one of the largest solar installations in West Africa, is expected to generate enough electricity to power approximately 200,000 homes and create over 500 jobs during the construction phase.

A separate $120 million investment will fund the development of wind energy infrastructure along the coast of the Greater Accra and Central Regions, where wind speed studies have identified excellent conditions for commercial wind power generation. The project includes the installation of 40 wind turbines with a combined capacity of 80 megawatts.

The government has welcomed the investments and reaffirmed its commitment to increasing the share of renewable energy in the national energy mix to 10 percent by 2030, up from the current level of approximately 2 percent. The Renewable Energy Act provides a framework for incentivising private sector investment in the sector, including feed-in tariffs, tax holidays, and streamlined licensing procedures.

However, experts have cautioned that realising the full potential of renewable energy in Ghana will require significant upgrades to the national grid infrastructure. The current grid was designed primarily for large-scale hydroelectric and thermal power generation and may require modifications to accommodate the intermittent nature of solar and wind power. Energy storage solutions, including battery technology, will also need to be deployed at scale.

This article is currently being developed and will include interviews with key stakeholders in the energy sector, detailed analysis of the economic impact of renewable energy investments, and a comparison of Ghana's renewable energy trajectory with that of other African countries.`,
    status: "draft",
    isFeatured: false,
    isPinned: false,
    isBreaking: false,
    publishedAt: null,
    categorySlug: "technology",
    authorEmail: "reporter1@newsportal.com",
    tagNames: ["Energy", "Climate", "Technology Policy"],
  },
  {
    title: "Women in Ghana's Tech Ecosystem: Breaking Barriers and Building the Future",
    slug: "women-ghana-tech-ecosystem-breaking-barriers-building-future",
    excerpt:
      "Despite significant progress, women remain underrepresented in Ghana's growing technology sector. This feature explores the challenges and celebrates the trailblazers leading change.",
    content: `Ghana's technology ecosystem is one of the fastest-growing in West Africa, but a significant gender gap persists. Women make up only about 30 percent of the technology workforce in Ghana, and the disparity is even more pronounced in leadership positions and technical roles. This feature examines the root causes of this imbalance and highlights the women who are working to change the narrative.

The gender gap in technology begins early. In Ghanaian senior high schools, significantly fewer girls than boys enrol in science, technology, engineering, and mathematics (STEM) programmes. Societal expectations, limited access to role models, and a lack of targeted encouragement all contribute to this disparity. By the time students reach the university level, women are significantly underrepresented in computer science, information technology, and engineering programmes.

Several organisations are working to address this imbalance at the grassroots level. Initiatives such as Girls in ICT, Tech Needs Girls, and the Women in Tech Africa network provide mentorship, training, and community support for young women and girls interested in technology. These programmes have reached thousands of participants across Ghana and have contributed to a gradual increase in female enrollment in STEM programmes at the tertiary level.

In the professional sphere, a growing number of women are making their mark in Ghana's tech ecosystem. Female founders have launched successful startups in areas ranging from fintech and healthtech to agritech and e-commerce. Women are also increasingly visible in corporate technology leadership roles, though progress remains slow.

The economic case for gender diversity in technology is compelling. Research consistently shows that diverse teams produce better outcomes, and companies with women in leadership positions tend to be more profitable and innovative. In a sector that is critical to Ghana's economic future, the exclusion of half the population represents a significant loss of talent and potential.

This article is a work in progress. Additional interviews with female tech leaders, data analysis on gender representation in Ghanaian tech companies, and policy recommendations will be added before publication.`,
    status: "draft",
    isFeatured: false,
    isPinned: false,
    isBreaking: false,
    publishedAt: null,
    categorySlug: "technology",
    authorEmail: "reporter2@newsportal.com",
    tagNames: ["Gender", "Youth", "Technology Policy"],
  },
  {
    title: "The Future of Ghana's Cocoa Industry in a Changing Climate",
    slug: "future-ghana-cocoa-industry-changing-climate",
    excerpt:
      "Climate change, ageing farms, and volatile global prices pose existential threats to Ghana's cocoa industry, the backbone of the rural economy for millions of families.",
    content: `Ghana is the world's second-largest cocoa producer after neighbouring Côte d'Ivoire, and the cocoa industry is a cornerstone of the Ghanaian economy. The crop contributes approximately $2 billion in export earnings annually and provides livelihoods for over 800,000 farming households. Yet, the industry faces a confluence of challenges that threaten its long-term viability and the millions of livelihoods that depend on it.

Climate change is perhaps the most existential of these threats. Rising temperatures and changing rainfall patterns are altering the climatic conditions in Ghana's cocoa-growing regions, which are concentrated in the forest belt of the Ashanti, Brong-Ahafo, Western, Central, and Eastern Regions. Studies project that under current climate trajectories, the area suitable for cocoa cultivation in Ghana could shrink by 30 to 50 percent by 2050.

The ageing of Ghana's cocoa farms is another critical concern. A significant proportion of the country's cocoa trees are over 30 years old, well beyond their peak productive years. Replanting programmes have been implemented by COCOBOD, the Ghana Cocoa Board, but the pace of replanting has not kept up with the rate of tree ageing. Many smallholder farmers, who produce approximately 70 percent of Ghana's cocoa, lack the resources and technical knowledge to undertake large-scale rehabilitation of their farms.

Global cocoa prices have been highly volatile in recent years, creating uncertainty for farmers and undermining investment in the sector. While prices surged to record levels in 2024, driven by supply deficits, the benefits have not always translated into higher incomes for smallholder farmers due to structural inefficiencies in the supply chain and the weakening of the cedi against major currencies.

COCOBOD has introduced several reforms aimed at addressing these challenges, including the Cocoa Forest Initiative, which promotes climate-smart cocoa production, and the Living Income Differential (LID) in partnership with Côte d'Ivoire, which adds a premium to the cocoa price to ensure farmers earn a living income.

This article requires additional research, including interviews with cocoa farmers, COCOBOD officials, and commodity market analysts. A comprehensive analysis of climate adaptation strategies and market dynamics will be included in the final version.`,
    status: "draft",
    isFeatured: false,
    isPinned: false,
    isBreaking: false,
    publishedAt: null,
    categorySlug: "business",
    authorEmail: "reporter1@newsportal.com",
    tagNames: ["Agriculture", "Climate", "Economy", "Trade"],
  },
];

// ─────────────────────────────────────────────
// 5. COMMENTS (5)
// ─────────────────────────────────────────────
const comments = [
  {
    content:
      "This is a well-written and balanced article on the elections. I appreciate how you covered both the strengths of the process and the challenges that need to be addressed. Ghana continues to set an example for democratic governance in Africa.",
    status: "approved",
    authorName: "Emmanuel Mensah",
    authorEmail: "emmanuel.mensah@email.com",
    articleSlug: "ghana-2024-election-results-new-chapter-democratic-governance",
    userEmail: null,
  },
  {
    content:
      "As a small business owner who relies heavily on mobile money, I can attest to the transformative impact of digital financial services. However, the transaction fees have been increasing, and I hope the regulators will address this to protect consumers.",
    status: "approved",
    authorName: "Abena Konadu",
    authorEmail: "abena.k@email.com",
    articleSlug: "mobile-money-transactions-ghana-surpass-1-trillion-cedis",
    userEmail: null,
  },
  {
    content:
      "The Black Stars performance was truly inspiring! I was at the stadium and the atmosphere was incredible. Let's hope we can maintain this form and go all the way to the AFCON final. Go Black Stars!",
    status: "approved",
    authorName: "Kofi Boateng",
    authorEmail: "kofi.b@email.com",
    articleSlug: "black-stars-crucial-afcon-qualifier-win-against-nigeria-accra",
    userEmail: null,
  },
  {
    content:
      "While the economic numbers look promising, the reality on the ground for ordinary Ghanaians is still very tough. Prices in the market are still very high and salaries have not kept pace. I hope this growth translates into real improvements in people's lives soon.",
    status: "pending",
    authorName: "Nana Akua",
    authorEmail: "nana.akua@email.com",
    articleSlug: "ghana-economy-recovery-gdp-growth-4-2-percent",
    userEmail: null,
  },
  {
    content:
      "Stonebwoy deserves this and more! Ghanaian artists are putting us on the map globally. I would love to see more support from the government for the creative arts sector. We have so much talent that needs nurturing.",
    status: "approved",
    authorName: "David Osei",
    authorEmail: "david.osei@email.com",
    articleSlug: "stonebwoy-wins-best-african-act-international-music-awards-london",
    userEmail: null,
  },
];

// ─────────────────────────────────────────────
// 6. ADVERTISEMENTS (3)
// ─────────────────────────────────────────────
const advertisements = [
  {
    title: "Ghana Commercial Bank - Smart Banking for Everyone",
    imageUrl: "https://picsum.photos/seed/gcb-banner-ad/1200/200",
    linkUrl: "https://example.com/gcb",
    position: "banner",
    isActive: true,
    startDate: daysAgo(2),
    endDate: daysAgo(-30),
    clicks: 1245,
    impressions: 85000,
  },
  {
    title: "Safari Tours Ghana - Explore the Beauty of West Africa",
    imageUrl: "https://picsum.photos/seed/safari-sidebar-ad/300/250",
    linkUrl: "https://example.com/safari-tours",
    position: "sidebar",
    isActive: true,
    startDate: daysAgo(5),
    endDate: daysAgo(-25),
    clicks: 432,
    impressions: 42000,
  },
  {
    title: "Voltic Water - Pure Refreshment from Nature",
    imageUrl: "https://picsum.photos/seed/voltic-footer-ad/728/90",
    linkUrl: "https://example.com/voltic",
    position: "footer",
    isActive: true,
    startDate: daysAgo(3),
    endDate: daysAgo(-20),
    clicks: 678,
    impressions: 65000,
  },
];

// ─────────────────────────────────────────────
// 7. ACTIVITIES (10)
// ─────────────────────────────────────────────
const activities = [
  {
    type: "view",
    metadata: JSON.stringify({ ip: "41.58.12.90", userAgent: "Mozilla/5.0" }),
    createdAt: daysAgo(0, 10, 0),
    userEmail: null,
    articleSlug: "ghana-2024-election-results-new-chapter-democratic-governance",
  },
  {
    type: "view",
    metadata: JSON.stringify({ ip: "102.156.88.44", userAgent: "Mozilla/5.0" }),
    createdAt: daysAgo(0, 9, 30),
    userEmail: null,
    articleSlug: "black-stars-crucial-afcon-qualifier-win-against-nigeria-accra",
  },
  {
    type: "comment",
    metadata: JSON.stringify({ commentId: "pending" }),
    createdAt: daysAgo(0, 8, 15),
    userEmail: "emmanuel.mensah@email.com",
    articleSlug: "ghana-2024-election-results-new-chapter-democratic-governance",
  },
  {
    type: "view",
    metadata: JSON.stringify({ ip: "197.251.44.12", userAgent: "Mozilla/5.0" }),
    createdAt: daysAgo(1, 14, 0),
    userEmail: null,
    articleSlug: "ghana-economy-recovery-gdp-growth-4-2-percent",
  },
  {
    type: "view",
    metadata: JSON.stringify({ ip: "41.203.67.89", userAgent: "Mozilla/5.0" }),
    createdAt: daysAgo(1, 10, 0),
    userEmail: null,
    articleSlug: "ghana-launches-national-ai-strategy-digital-transformation",
  },
  {
    type: "login",
    metadata: JSON.stringify({ ip: "41.58.12.90", provider: "credentials" }),
    createdAt: daysAgo(1, 8, 0),
    userEmail: "admin@newsportal.com",
    articleSlug: null,
  },
  {
    type: "view",
    metadata: JSON.stringify({ ip: "102.156.77.33", userAgent: "Mozilla/5.0" }),
    createdAt: daysAgo(2, 11, 0),
    userEmail: null,
    articleSlug: "stonebwoy-wins-best-african-act-international-music-awards-london",
  },
  {
    type: "create",
    metadata: JSON.stringify({ model: "Article", title: "Ghana Launches National AI Strategy" }),
    createdAt: daysAgo(1, 9, 0),
    userEmail: "reporter1@newsportal.com",
    articleSlug: "ghana-launches-national-ai-strategy-digital-transformation",
  },
  {
    type: "comment",
    metadata: JSON.stringify({ commentId: "pending" }),
    createdAt: daysAgo(0, 20, 30),
    userEmail: "kofi.b@email.com",
    articleSlug: "black-stars-crucial-afcon-qualifier-win-against-nigeria-accra",
  },
  {
    type: "view",
    metadata: JSON.stringify({ ip: "197.251.66.21", userAgent: "Mozilla/5.0" }),
    createdAt: daysAgo(3, 18, 0),
    userEmail: null,
    articleSlug: "accras-emerging-food-scene-ghanaian-chefs-redefining-west-african-cuisine",
  },
];

// ─────────────────────────────────────────────
// Helper: calculate reading time from word count
// ─────────────────────────────────────────────
function calculateReadingTime(content: string): number {
  const words = content.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

// ─────────────────────────────────────────────
// MAIN SEED FUNCTION
// ─────────────────────────────────────────────
async function main() {
  console.log("🌱 Seeding database...\n");

  // Clean up existing data (order matters due to relations)
  console.log("🗑️  Cleaning existing data...");
  await prisma.activity.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.articleTag.deleteMany();
  await prisma.article.deleteMany();
  await prisma.advertisement.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.category.deleteMany();
  await prisma.media.deleteMany();
  await prisma.user.deleteMany();
  console.log("✅ Existing data cleaned.\n");

  // ── 1. Seed Users ─────────────────────────
  console.log("👤 Seeding users...");
  const createdUsers: Record<string, { id: string; email: string }> = {};
  for (const user of users) {
    const passwordHash = await bcrypt.hash(user.password, 12);
    const created = await prisma.user.create({
      data: {
        email: user.email,
        name: user.name,
        passwordHash,
        role: user.role,
        bio: user.bio,
        isActive: true,
      },
    });
    createdUsers[created.email] = created;
    console.log(`   ✅ ${created.name} (${created.role})`);
  }
  console.log("");

  // ── 2. Seed Categories ────────────────────
  console.log("📂 Seeding categories...");
  const createdCategories: Record<string, { id: string; slug: string }> = {};
  for (const cat of categories) {
    const created = await prisma.category.create({
      data: cat,
    });
    createdCategories[created.slug] = created;
    console.log(`   ✅ ${created.name} (${created.color})`);
  }
  console.log("");

  // ── 3. Seed Tags ──────────────────────────
  console.log("🏷️  Seeding tags...");
  const createdTags: Record<string, { id: string; name: string }> = {};
  for (const tag of tags) {
    const created = await prisma.tag.create({
      data: tag,
    });
    createdTags[created.name] = created;
  }
  console.log(`   ✅ ${tags.length} tags created.\n`);

  // ── 4. Seed Articles ──────────────────────
  console.log("📰 Seeding articles...");
  for (const article of articles) {
    const author = createdUsers[article.authorEmail];
    const category = createdCategories[article.categorySlug];

    const readingTime = calculateReadingTime(article.content);
    const featuredImage = `https://picsum.photos/seed/${article.slug}/1200/600`;

    const createdArticle = await prisma.article.create({
      data: {
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        content: article.content,
        featuredImage,
        status: article.status,
        isFeatured: article.isFeatured,
        isPinned: article.isPinned,
        isBreaking: article.isBreaking,
        publishedAt: article.publishedAt,
        readingTime,
        authorId: author.id,
        categoryId: category.id,
        seoTitle: article.title,
        seoDescription: article.excerpt,
      },
    });

    // Connect tags
    for (const tagName of article.tagNames) {
      const tag = createdTags[tagName];
      if (tag) {
        await prisma.articleTag.create({
          data: {
            articleId: createdArticle.id,
            tagId: tag.id,
          },
        });
      }
    }

    const statusLabel = article.status === "published" ? "🟢" : "📝";
    const extras = [];
    if (article.isFeatured) extras.push("featured");
    if (article.isPinned) extras.push("pinned");
    if (article.isBreaking) extras.push("⚡breaking");
    const extrasStr = extras.length > 0 ? ` [${extras.join(", ")}]` : "";
    console.log(
      `   ${statusLabel} "${article.title.substring(0, 60)}..."${extrasStr}`
    );
  }
  console.log("");

  // ── 5. Seed Comments ──────────────────────
  console.log("💬 Seeding comments...");
  for (const comment of comments) {
    const article = await prisma.article.findUnique({
      where: { slug: comment.articleSlug },
    });

    let userId: string | null = null;
    if (comment.userEmail) {
      const user = await prisma.user.findUnique({
        where: { email: comment.userEmail },
      });
      if (user) userId = user.id;
    }

    if (article) {
      await prisma.comment.create({
        data: {
          content: comment.content,
          status: comment.status,
          authorName: comment.authorName,
          authorEmail: comment.authorEmail,
          articleId: article.id,
          userId,
        },
      });
      console.log(
        `   ✅ ${comment.authorName} on "${comment.articleSlug.substring(0, 50)}..." [${comment.status}]`
      );
    }
  }
  console.log("");

  // ── 6. Seed Advertisements ────────────────
  console.log("📢 Seeding advertisements...");
  for (const ad of advertisements) {
    await prisma.advertisement.create({
      data: ad,
    });
    console.log(`   ✅ "${ad.title}" [${ad.position}]`);
  }
  console.log("");

  // ── 7. Seed Activities ────────────────────
  console.log("📊 Seeding activities...");
  for (const activity of activities) {
    let userId: string | null = null;
    if (activity.userEmail) {
      const user = await prisma.user.findUnique({
        where: { email: activity.userEmail },
      });
      if (user) userId = user.id;
    }

    let articleId: string | null = null;
    if (activity.articleSlug) {
      const article = await prisma.article.findUnique({
        where: { slug: activity.articleSlug },
      });
      if (article) articleId = article.id;
    }

    await prisma.activity.create({
      data: {
        type: activity.type,
        metadata: activity.metadata,
        createdAt: activity.createdAt,
        userId,
        articleId,
      },
    });
    console.log(`   ✅ ${activity.type} at ${activity.createdAt.toISOString()}`);
  }
  console.log("");

  // ── Summary ───────────────────────────────
  const userCount = await prisma.user.count();
  const categoryCount = await prisma.category.count();
  const tagCount = await prisma.tag.count();
  const articleCount = await prisma.article.count();
  const commentCount = await prisma.comment.count();
  const adCount = await prisma.advertisement.count();
  const activityCount = await prisma.activity.count();

  console.log("═══════════════════════════════════════");
  console.log("          SEED COMPLETE                ");
  console.log("═══════════════════════════════════════");
  console.log(`  👤 Users:          ${userCount}`);
  console.log(`  📂 Categories:     ${categoryCount}`);
  console.log(`  🏷️  Tags:           ${tagCount}`);
  console.log(`  📰 Articles:       ${articleCount}`);
  console.log(`  💬 Comments:       ${commentCount}`);
  console.log(`  📢 Advertisements: ${adCount}`);
  console.log(`  📊 Activities:     ${activityCount}`);
  console.log("═══════════════════════════════════════\n");
}

// ── Run ──────────────────────────────────────
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });