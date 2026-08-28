/**
 * Seed albums + media items for the media library.
 * Run after main seed.ts.
 */
import { db } from "../src/lib/db";

async function main() {
  console.log('🖼️  Seeding albums + media...')

  // Clear existing
  await db.mediaItem.deleteMany({})
  await db.album.deleteMany({})

  // Create albums
  const albums = [
    { name: 'SACA-MD Events', nameAr: 'فعاليات SACA - ميريلاند', description: 'صور من فعاليات فرع ميريلاند' },
    { name: 'Cultural Events', nameAr: 'فعاليات ثقافية', description: 'أمسيات ثقافية سودانية' },
    { name: 'Conferences', nameAr: 'مؤتمرات', description: 'مؤتمرات الجالية السودانية السنوية' },
    { name: 'Workshops', nameAr: 'ورش عمل', description: 'ورش عمل مهنية وتعليمية' },
    { name: 'Family Events', nameAr: 'فعاليات أسرية', description: 'يوم الأسرة السودانية' },
    { name: 'Documents', nameAr: 'مستندات', description: 'مستندات وتقارير رسمية' },
  ]

  const createdAlbums: Array<{ id: string; name: string; nameAr: string | null; createdAt: Date; updatedAt: Date; sortOrder: number; description: string | null; coverUrl: string | null; isPublic: boolean }> = []
  for (const a of albums) {
    const album = await db.album.create({ data: a })
    createdAlbums.push(album)
    console.log(`  ✓ Album: ${album.name}`)
  }

  // Create media items
  const mediaItems = [
    // SACA-MD Events album (index 0)
    { name: 'SACA-MD Conference 2026.jpg', type: 'image', url: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=800&auto=format&fit=crop', thumbnailUrl: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=300&auto=format&fit=crop', size: 2400000, mimeType: 'image/jpeg', description: 'مؤتمر SACA السنوي في ميريلاند', tags: 'مؤتمر,ميريلاند,2026', albumId: createdAlbums[0].id },
    { name: 'Baltimore Community Gathering.jpg', type: 'image', url: 'https://images.unsplash.com/photo-1499488935264-8d2d6d92e26c?q=80&w=800&auto=format&fit=crop', thumbnailUrl: 'https://images.unsplash.com/photo-1499488935264-8d2d6d92e26c?q=80&w=300&auto=format&fit=crop', size: 1800000, mimeType: 'image/jpeg', description: 'تجمع مجتمعي في بالتيمور', tags: 'بالتيمور,تجمع', albumId: createdAlbums[0].id },
    { name: 'SACA-MD Meeting Highlights.mp4', type: 'video', url: 'https://images.unsplash.com/photo-1499488935264-8d2d6d92e26c?q=80&w=800&auto=format&fit=crop', thumbnailUrl: 'https://images.unsplash.com/photo-1499488935264-8d2d6d92e26c?q=80&w=300&auto=format&fit=crop', size: 45000000, mimeType: 'video/mp4', description: 'ملخص اجتماع SACA-MD', tags: 'اجتماع,ميريلاند', albumId: createdAlbums[0].id },

    // Cultural Events album (index 1)
    { name: 'Cultural Evening.jpg', type: 'image', url: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?q=80&w=800&auto=format&fit=crop', thumbnailUrl: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?q=80&w=300&auto=format&fit=crop', size: 1600000, mimeType: 'image/jpeg', description: 'أمسية ثقافية سودانية', tags: 'ثقافة,أمسية', albumId: createdAlbums[1].id },
    { name: 'Sudanese Traditional Music.jpg', type: 'image', url: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=800&auto=format&fit=crop', thumbnailUrl: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=300&auto=format&fit=crop', size: 1400000, mimeType: 'image/jpeg', description: 'موسيقى سودانية تقليدية', tags: 'موسيقى,تراث', albumId: createdAlbums[1].id },

    // Conferences album (index 2)
    { name: 'Annual Conference 2026.jpg', type: 'image', url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&auto=format&fit=crop', thumbnailUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=300&auto=format&fit=crop', size: 2400000, mimeType: 'image/jpeg', description: 'المؤتمر السنوي 2026', tags: 'مؤتمر,2026', albumId: createdAlbums[2].id },
    { name: 'Houston Conference.jpg', type: 'image', url: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=800&auto=format&fit=crop', thumbnailUrl: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=300&auto=format&fit=crop', size: 2200000, mimeType: 'image/jpeg', description: 'مؤتمر الجالية في هيوستن', tags: 'هيوستن,مؤتمر', albumId: createdAlbums[2].id },
    { name: 'Conference Speech.mp4', type: 'video', url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=800&auto=format&fit=crop', thumbnailUrl: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=300&auto=format&fit=crop', size: 35000000, mimeType: 'video/mp4', description: 'كلمة في المؤتمر السنوي', tags: 'كلمة,مؤتمر', albumId: createdAlbums[2].id },

    // Workshops album (index 3)
    { name: 'Entrepreneurship Workshop.jpg', type: 'image', url: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=800&auto=format&fit=crop', thumbnailUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=300&auto=format&fit=crop', size: 2000000, mimeType: 'image/jpeg', description: 'ورشة ريادة الأعمال', tags: 'ورشة,أعمال', albumId: createdAlbums[3].id },
    { name: 'Team Building.jpg', type: 'image', url: 'https://images.unsplash.com/photo-1529390079861-591de354faf5?q=80&w=800&auto=format&fit=crop', thumbnailUrl: 'https://images.unsplash.com/photo-1529390079861-591de354faf5?q=80&w=300&auto=format&fit=crop', size: 1800000, mimeType: 'image/jpeg', description: 'ورشة بناء فرق العمل', tags: 'ورشة,فرق', albumId: createdAlbums[3].id },

    // Family Events album (index 4)
    { name: 'Family Day.jpg', type: 'image', url: 'https://images.unsplash.com/photo-1609220136736-443140cffec6?q=80&w=800&auto=format&fit=crop', thumbnailUrl: 'https://images.unsplash.com/photo-1609220136736-443140cffec6?q=80&w=300&auto=format&fit=crop', size: 3100000, mimeType: 'image/jpeg', description: 'يوم الأسرة السودانية', tags: 'أسرة,يوم,فعالية', albumId: createdAlbums[4].id },
    { name: 'Kids Activities.jpg', type: 'image', url: 'https://images.unsplash.com/photo-1503454537195-1dcabb17ffb9?q=80&w=800&auto=format&fit=crop', thumbnailUrl: 'https://images.unsplash.com/photo-1503454537195-1dcabb17ffb9?q=80&w=300&auto=format&fit=crop', size: 1500000, mimeType: 'image/jpeg', description: 'أنشطة الأطفال', tags: 'أطفال,أنشطة', albumId: createdAlbums[4].id },

    // Documents album (index 5)
    { name: 'Annual Report 2026.pdf', type: 'pdf', url: '#', thumbnailUrl: null, size: 800000, mimeType: 'application/pdf', description: 'التقرير السنوي 2026', tags: 'تقرير,2026', albumId: createdAlbums[5].id },
    { name: 'Bylaws.pdf', type: 'pdf', url: '#', thumbnailUrl: null, size: 600000, mimeType: 'application/pdf', description: 'اللائحة الداخلية', tags: 'لائحة,قانون', albumId: createdAlbums[5].id },
    { name: 'Strategic Plan.docx', type: 'doc', url: '#', thumbnailUrl: null, size: 1200000, mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', description: 'الخطة الاستراتيجية', tags: 'خطة,استراتيجية', albumId: createdAlbums[5].id },
  ]

  for (const item of mediaItems) {
    await db.mediaItem.create({ data: item })
  }

  // Update album covers
  for (const album of createdAlbums) {
    const firstItem = await db.mediaItem.findFirst({
      where: { albumId: album.id, type: 'image' },
    })
    if (firstItem) {
      await db.album.update({
        where: { id: album.id },
        data: { coverUrl: firstItem.url },
      })
    }
  }

  console.log(`\n✅ Seed complete.`)
  console.log(`   - Albums: ${createdAlbums.length}`)
  console.log(`   - Media items: ${mediaItems.length}`)
}

main()
  .then(async () => await db.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await db.$disconnect()
    process.exit(1)
  })
