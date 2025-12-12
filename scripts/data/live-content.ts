export const newsArticles = [
	{
		title:
			"NUPRC denies withholding Frontier Exploration Fund, says over $185m, N14.9bn released to NNPC",
		slug: "nuprc-denies-withholding-frontier-fund",
		excerpt:
			"The Nigerian Upstream Petroleum Regulatory Commission has clarified its stance on the Frontier Exploration Fund, detailing releases to NNPC.",
		content:
			"<p>The Nigerian Upstream Petroleum Regulatory Commission (NUPRC) has denied withholding the Frontier Exploration Fund, stating that over $185 million and N14.9 billion have been released to the Nigerian National Petroleum Company (NNPC) Limited for frontier exploration activities. The Commission emphasized its commitment to transparency and adherence to the Petroleum Industry Act (PIA).</p>",
		category: "Press Release",
		status: "published",
		author: "NUPRC Media",
		publishedAt: new Date("2024-12-04"),
		thumbnailUrl:
			"https://www.nuprc.gov.ng/wp-content/uploads/2023/10/NUPRC-Building.jpg", // Placeholder for real image
	},
	{
		title:
			"NUPRC enabling business, we are ready for Licensing Round, says Chevron",
		slug: "nuprc-enabling-business-chevron",
		excerpt:
			"Chevron has expressed confidence in NUPRC's regulatory environment and readiness for the upcoming licensing round.",
		content:
			"<p>Chevron Nigeria Limited has commended the NUPRC for fostering an enabling business environment in the Nigerian upstream oil and gas sector. The oil major confirmed its readiness to participate in the upcoming Licensing Round, citing the transparent guidelines and regulatory clarity provided by the Commission.</p>",
		category: "News",
		status: "published",
		author: "NUPRC Media",
		publishedAt: new Date("2024-12-02"),
		thumbnailUrl:
			"https://www.nuprc.gov.ng/wp-content/uploads/2023/05/Chevron-Lekki.jpg",
	},
	{
		title: "AFRIPERF adopts Nigeria as headquarters, elects Komolafe chairman",
		slug: "afriperf-adopts-nigeria-hq",
		excerpt:
			"The African Petroleum Regulators Forum (AFRIPERF) has elected NUPRC CCE Engr. Gbenga Komolafe as Chairman and adopted Nigeria as its HQ.",
		content:
			"<p>In a significant development for African energy regulation, the African Petroleum Regulators Forum (AFRIPERF) has adopted Nigeria as its permanent headquarters. Furthermore, the Forum has elected the Commission Chief Executive of NUPRC, Engr. Gbenga Komolafe, as its Chairman, recognizing his leadership in upstream regulation.</p>",
		category: "Events",
		status: "published",
		author: "NUPRC Media",
		publishedAt: new Date("2024-12-02"),
		thumbnailUrl:
			"https://www.nuprc.gov.ng/wp-content/uploads/2023/11/Komolafe-AFRIPERF.jpg",
	},
];

export const staticPages = [
	{
		title: "Mission & Vision",
		slug: "mission-vision",
		content: `
            <div class="space-y-8">
                <section>
                    <h2 class="text-3xl font-bold text-primary mb-4">Our Mission</h2>
                    <p class="text-xl leading-relaxed text-gray-700">Promoting sustainable value creation from Nigeria’s Petroleum Resources for shared prosperity.</p>
                </section>
                <section>
                    <h2 class="text-3xl font-bold text-primary mb-4">Our Vision</h2>
                    <p class="text-xl leading-relaxed text-gray-700">Be Africa’s leading Regulator.</p>
                </section>
                <section>
                    <h2 class="text-3xl font-bold text-primary mb-4">Core Values</h2>
                    <ul class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <li class="bg-gray-50 p-4 rounded-lg border-l-4 border-primary"><strong>Professionalism:</strong> We deliver quality service with precision.</li>
                        <li class="bg-gray-50 p-4 rounded-lg border-l-4 border-primary"><strong>Integrity:</strong> We act with honesty and transparency.</li>
                        <li class="bg-gray-50 p-4 rounded-lg border-l-4 border-primary"><strong>Safety:</strong> We prioritize safety in all operations.</li>
                         <li class="bg-gray-50 p-4 rounded-lg border-l-4 border-primary"><strong>Accountability:</strong> We are responsible for our actions.</li>
                    </ul>
                </section>
            </div>
        `,
		seoTitle: "Mission, Vision & Core Values - NUPRC",
		seoDescription:
			"NUPRC's mission to promote sustainable value creation and vision to be Africa's leading regulator.",
	},
	{
		title: "History of NUPRC",
		slug: "history",
		content: `
            <p>The Nigerian Upstream Petroleum Regulatory Commission (NUPRC) was established by the Petroleum Industry Act (PIA) of 2021. It replaced the defunct Department of Petroleum Resources (DPR) to ensure the technical and commercial regulation of upstream petroleum operations.</p>
            <p>The Commission is responsible for ensuring compliance with petroleum laws, regulations, and guidelines in the upstream sector.</p>
        `,
		seoTitle: "History of NUPRC",
		seoDescription:
			"The history and establishment of the NUPRC under the Petroleum Industry Act 2021.",
	},
];

export const portalLinks = [
	{
		name: "TSA Payment Portal",
		url: "https://login.remita.net/remita/onepage/biller/payment.spa",
		description: "Official portal for all NUPRC payments via Remita.",
		category: "finance",
		isExternal: true,
		order: 1,
	},
	{
		name: "NGFCP Portal",
		url: "https://ngfcp.nuprc.gov.ng/",
		description: "Nigerian Gas Flare Commercialisation Programme portal.",
		category: "technical",
		isExternal: true,
		order: 2,
	},
	{
		name: "National Production Monitoring System (NPMS)",
		url: "https://www.nuprc.gov.ng/national-production-monitoring-system-npms/",
		description: "Real-time production monitoring platform.",
		category: "technical",
		isExternal: true,
		order: 3,
	},
	{
		name: "OGISP",
		url: "https://ogisp.nuprc.gov.ng/",
		description: "Oil and Gas Industry Service Permit portal.",
		category: "permits",
		isExternal: true,
		order: 4,
	},
];
