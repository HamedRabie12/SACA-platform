import { db } from "@/lib/db";

const services = [
  ["education", "التعليم", "Education", "تعليم ودعم دراسي", "Education and academic support"],
  ["jobs", "الوظائف", "Jobs", "فرص عمل وربط مهني", "Job opportunities and career support"],
  ["legal", "الخدمات القانونية", "Legal", "إرشاد وإحالات قانونية", "Legal information and referrals"],
  ["immigration", "الهجرة", "Immigration", "إحالات ومصادر هجرة موثوقة", "Immigration resources and referrals"],
  ["family", "الأسرة", "Family", "دعم أسري واجتماعي", "Family and social support"],
  ["youth", "الشباب", "Youth", "برامج الشباب", "Youth programs"],
  ["women", "المرأة", "Women", "برامج وتمكين المرأة", "Women programs and empowerment"],
  ["seniors", "كبار السن", "Seniors", "دعم وبرامج كبار السن", "Senior support and programs"],
  ["health", "الصحة", "Health", "مصادر صحية وإحالات", "Health resources and referrals"],
  ["training", "التدريب", "Training", "تدريب وتطوير مهني", "Training and professional development"],
  ["business", "الأعمال", "Business", "دعم رواد الأعمال", "Business and entrepreneurship support"],
  ["social", "الدعم الاجتماعي", "Social Support", "دعم اجتماعي ومجتمعي", "Community social support"],
] as const;

for (const [code, nameAr, nameEn, descriptionAr, descriptionEn] of services) {
  await db.service.upsert({
    where: { code },
    update: { nameAr, nameEn, descriptionAr, descriptionEn, status: "ACTIVE" },
    create: { code, nameAr, nameEn, descriptionAr, descriptionEn, category: code, status: "ACTIVE" },
  });
}
console.log(`Seeded ${services.length} community services.`);
await db.$disconnect();
