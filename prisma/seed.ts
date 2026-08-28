import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import regionsData from "./data/regions.json";
import institutionsData from "./data/institutions.json";

const prisma = new PrismaClient();

async function main() {
  console.log("Seed başladı...");

  // 1) Regionlar və rayonlar
  const regionMap = new Map<string, string>();
  const districtMap = new Map<string, string>(); // key: `${regionName}::${districtName}`

  for (const r of regionsData as any[]) {
    const region = await prisma.region.upsert({
      where: { name: r.name },
      update: { isCity: r.isCity },
      create: { name: r.name, isCity: r.isCity },
    });
    regionMap.set(r.name, region.id);

    for (const dName of r.districts ?? []) {
      const district = await prisma.district.upsert({
        where: { regionId_name: { regionId: region.id, name: dName } },
        update: {},
        create: { regionId: region.id, name: dName },
      });
      districtMap.set(`${r.name}::${dName}`, district.id);
    }
  }
  console.log(`${regionMap.size} region, ${districtMap.size} rayon yaradıldı.`);

  // 2) Təhsil müəssisələri
  let created = 0;
  for (const inst of institutionsData as any[]) {
    const regionId = regionMap.get(inst.region);
    if (!regionId) continue;
    const districtId = inst.district ? districtMap.get(`${inst.region}::${inst.district}`) ?? null : null;

    await prisma.educationInstitution.upsert({
      where: {
        name_type_regionId_districtId: {
          name: inst.name,
          type: inst.type,
          regionId,
          districtId: districtId ?? "",
        },
      } as any,
      update: {},
      create: {
        name: inst.name,
        type: inst.type,
        category: inst.category,
        regionId,
        districtId,
        address: inst.address ?? null,
        source: inst.source ?? null,
        sourceUpdatedAt: inst.sourceUpdatedAt ? new Date(inst.sourceUpdatedAt) : null,
      },
    }).catch(async () => {
      // unique constraint ilə uyğunlaşmayan hallar üçün (districtId null olduqda) findFirst + create fallback
      const exists = await prisma.educationInstitution.findFirst({
        where: { name: inst.name, type: inst.type, regionId, districtId },
      });
      if (!exists) {
        await prisma.educationInstitution.create({
          data: {
            name: inst.name,
            type: inst.type,
            category: inst.category,
            regionId,
            districtId,
            address: inst.address ?? null,
            source: inst.source ?? null,
            sourceUpdatedAt: inst.sourceUpdatedAt ? new Date(inst.sourceUpdatedAt) : null,
          },
        });
      }
    });
    created++;
  }
  console.log(`${created} təhsil müəssisəsi emal edildi.`);

  // 3) Demo admin
  const adminEmail = process.env.ADMIN_EMAIL || "admin@university.edu.az";
  const adminPassword = process.env.ADMIN_PASSWORD || "ChangeMe123!";
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.admin.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash,
      fullName: "Sistem Administratoru",
      role: "SUPERADMIN",
    },
  });
  console.log(`Admin yaradıldı: ${adminEmail}`);

  console.log("Seed tamamlandı.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
