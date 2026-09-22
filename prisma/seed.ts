import { PrismaClient, UserRole, EventStatus, VendorVerificationStatus, EventVendorStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Memulai proses database seeding...');

  // 1. Bersihkan data lama jika ada (urutan penghapusan sesuai relasi)
  await prisma.eventVendorLog.deleteMany();
  await prisma.eventVendor.deleteMany();
  await prisma.eventSchedule.deleteMany();
  await prisma.event.deleteMany();
  await prisma.venue.deleteMany();
  await prisma.vendorProfile.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Data tabel lama berhasil dibersihkan.');

  // Password hash default untuk semua akun demo: 'password123'
  const passwordHash = bcrypt.hashSync('password123', 10);

  // 2. Buat Akun Event Manager (Admin EO)
  const eventManager = await prisma.user.create({
    data: {
      name: 'Budi Santoso (Event Manager)',
      email: 'manager@eo.com',
      password_hash: passwordHash,
      role: UserRole.event_manager,
      phone: '081234567890',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
  });
  console.log(`✅ Event Manager dibuat: ${eventManager.email}`);

  // 3. Buat Akun Vendor dengan Berbagai Kategori & Status Verifikasi
  // Vendor 1: Mega Sound & Lighting (Verified)
  const userVendor1 = await prisma.user.create({
    data: {
      name: 'Joko Sound Master',
      email: 'sound@vendor.com',
      password_hash: passwordHash,
      role: UserRole.vendor,
      phone: '081234567891',
      vendor_profile: {
        create: {
          company_name: 'Mega Sound & Lighting Pro',
          service_category: 'Sound System & Lighting',
          contact_person: 'Joko Purnomo',
          phone: '081234567891',
          address: 'Jl. Industri Kreatif No. 12, Jakarta Barat',
          description: 'Spesialis instalasi sound system line array hingga 40.000 watt, tata lampu panggung modern (moving head, beam, parled), serta genset cadangan untuk konser dan gathering.',
          verification_status: VendorVerificationStatus.verified,
          verified_at: new Date(),
          verified_by: eventManager.id,
        },
      },
    },
    include: { vendor_profile: true },
  });

  // Vendor 2: Delima Catering (Verified)
  const userVendor2 = await prisma.user.create({
    data: {
      name: 'Siti Rahmawati (Catering)',
      email: 'catering@vendor.com',
      password_hash: passwordHash,
      role: UserRole.vendor,
      phone: '081234567892',
      vendor_profile: {
        create: {
          company_name: 'Delima Catering & Buffet',
          service_category: 'Catering & Konsumsi',
          contact_person: 'Siti Rahmawati',
          phone: '081234567892',
          address: 'Jl. Kuliner No. 5, Jakarta Selatan',
          description: 'Penyedia menu prasmanan khas nusantara dan internasional, coffee break meeting, sertifikasi halal resmi, dan peralatan saji berstandar bintang lima.',
          verification_status: VendorVerificationStatus.verified,
          verified_at: new Date(),
          verified_by: eventManager.id,
        },
      },
    },
    include: { vendor_profile: true },
  });

  // Vendor 3: Pesona Dekorasi (Pending Verification)
  const userVendor3 = await prisma.user.create({
    data: {
      name: 'Rian Artistik',
      email: 'decor@vendor.com',
      password_hash: passwordHash,
      role: UserRole.vendor,
      phone: '081234567893',
      vendor_profile: {
        create: {
          company_name: 'Pesona Dekorasi Estetik',
          service_category: 'Dekorasi & Backdrop',
          contact_person: 'Rian Kusuma',
          phone: '081234567893',
          address: 'Jl. Bunga Melati No. 8, Bandung',
          description: 'Dekorasi panggung modern minimalis, pelaminan tematik, booth pameran, dan instalasi backdrop berbahan ramah lingkungan.',
          verification_status: VendorVerificationStatus.pending,
          verified_at: null,
          verified_by: null,
        },
      },
    },
    include: { vendor_profile: true },
  });

  // Vendor 4: Lensa Visual Media (Verified)
  const userVendor4 = await prisma.user.create({
    data: {
      name: 'Andi Lensa',
      email: 'photo@vendor.com',
      password_hash: passwordHash,
      role: UserRole.vendor,
      phone: '081234567894',
      vendor_profile: {
        create: {
          company_name: 'Lensa Visual Media Production',
          service_category: 'Dokumentasi & Live Streaming',
          contact_person: 'Andi Saputra',
          phone: '081234567894',
          address: 'Jl. Studio Foto No. 3, Jakarta Pusat',
          description: 'Layanan video sinematik 4K, fotografi liputan event, drone recording, dan multi-camera live streaming broadcast ke berbagai platform.',
          verification_status: VendorVerificationStatus.verified,
          verified_at: new Date(),
          verified_by: eventManager.id,
        },
      },
    },
    include: { vendor_profile: true },
  });

  console.log('✅ 4 Vendor dibuat (3 Terverifikasi, 1 Pending Verifikasi).');

  // 4. Buat 2 Akun Klien
  const client1 = await prisma.user.create({
    data: {
      name: 'Hendra Wijaya (PT Maju Mapan)',
      email: 'klien.hendra@gmail.com',
      password_hash: passwordHash,
      role: UserRole.client,
      phone: '081198765432',
    },
  });

  const client2 = await prisma.user.create({
    data: {
      name: 'Sarah Amelia',
      email: 'klien.sarah@gmail.com',
      password_hash: passwordHash,
      role: UserRole.client,
      phone: '081198765433',
    },
  });
  console.log('✅ 2 Klien dibuat.');

  // 5. Buat Master Data Venue / Lokasi
  const venue1 = await prisma.venue.create({
    data: {
      name: 'Grand Ballroom Nusantara',
      address: 'Jl. Jend. Sudirman Kav. 21, Senayan',
      city: 'Jakarta Pusat',
      capacity: 1500,
      facilities: 'Panggung hidrolik utama, VIP Holding Room, AC Central, Sound bawaan 10.000 watt, Area parkir kapasitas 350 mobil, Loading dock vendor terpisah.',
      contact_person: 'Bambang Irawan (Gedung Manager)',
      contact_phone: '021-5558899',
    },
  });

  const venue2 = await prisma.venue.create({
    data: {
      name: 'Skyline Rooftop Convention Hall',
      address: 'Jl. TB Simatupang No. 88',
      city: 'Jakarta Selatan',
      capacity: 500,
      facilities: 'Panoramic City View Jakarta 360°, Dinding panel akustik, Ruang transit panitia, Dapur saji pantry, Lift khusus logistik barang.',
      contact_person: 'Ibu Ratna',
      contact_phone: '021-7771234',
    },
  });

  const venue3 = await prisma.venue.create({
    data: {
      name: 'Pine Hill Eco Garden',
      address: 'Jl. Raya Maribaya No. 108, Lembang',
      city: 'Bandung Barat',
      capacity: 800,
      facilities: 'Halaman rumput outdoor luas, Gazebo VIP, Suplai daya genset 80kVA, Jalur akses trailer peralatan vendor.',
      contact_person: 'Kang Asep',
      contact_phone: '022-8889900',
    },
  });
  console.log('✅ 3 Venue berhasil dibuat.');

  // 6. Buat Contoh Event Utama (Status: In Planning) dengan Rundown & Penugasan Vendor
  const event1 = await prisma.event.create({
    data: {
      client_id: client1.id,
      venue_id: venue1.id,
      title: 'Annual Corporate Gala & Tech Awards 2026',
      event_type: 'Corporate Gathering',
      description: 'Pertemuan tahunan puncak seluruh cabang PT Maju Mapan disertai peluncuran inovasi teknologi dan penganugerahan karyawan berprestasi.',
      start_date: new Date('2026-10-15T08:00:00Z'),
      end_date: new Date('2026-10-15T17:00:00Z'),
      estimated_guests: 600,
      status: EventStatus.in_planning,
      approved_by: eventManager.id,
      approved_at: new Date('2026-09-01T09:30:00Z'),
    },
  });

  // Susun Jadwal / Rundown untuk Event 1
  await prisma.eventSchedule.createMany({
    data: [
      {
        event_id: event1.id,
        title: 'Registrasi Peserta & Morning Coffee Break',
        description: 'Penyambutan tamu undangan, pembagian name tag & goodie bag di lobby utama.',
        start_time: new Date('2026-10-15T07:30:00Z'),
        end_time: new Date('2026-10-15T08:30:00Z'),
        pic_name: 'Dina (Liaison Officer)',
        order_index: 1,
      },
      {
        event_id: event1.id,
        title: 'Opening Ceremony & Sambutan Direksi',
        description: 'Tarian pembuka tradisional-kontemporer dan kata sambutan pembuka dari Direktur Utama.',
        start_time: new Date('2026-10-15T08:30:00Z'),
        end_time: new Date('2026-10-15T09:30:00Z'),
        pic_name: 'MC & Show Director',
        order_index: 2,
      },
      {
        event_id: event1.id,
        title: 'Keynote Tech Presentation: Future Horizons',
        description: 'Paparan peta jalan inovasi digital dan transformasi bisnis perusahaan.',
        start_time: new Date('2026-10-15T09:30:00Z'),
        end_time: new Date('2026-10-15T12:00:00Z'),
        pic_name: 'Rudi (Operator AV Panggung)',
        order_index: 3,
      },
      {
        event_id: event1.id,
        title: 'Makan Siang Prasmanan & Live Acoustic',
        description: 'Sesi ramah tamah dan santap siang di area dining hall diiringi musik akustik santai.',
        start_time: new Date('2026-10-15T12:00:00Z'),
        end_time: new Date('2026-10-15T13:30:00Z'),
        pic_name: 'Vendor Catering PIC',
        order_index: 4,
      },
      {
        event_id: event1.id,
        title: 'Penganugerahan Penghargaan (Tech Awards)',
        description: 'Penyerahan plakat dan apresiasi kepada 12 kategori pemenang inovasi terbaik.',
        start_time: new Date('2026-10-15T13:30:00Z'),
        end_time: new Date('2026-10-15T16:30:00Z'),
        pic_name: 'Stage Manager',
        order_index: 5,
      },
      {
        event_id: event1.id,
        title: 'Closing Ceremony & Sesi Foto Bersama',
        description: 'Penutupan resmi acara oleh manajemen dan foto dokumentasi seluruh kontingen.',
        start_time: new Date('2026-10-15T16:30:00Z'),
        end_time: new Date('2026-10-15T17:00:00Z'),
        pic_name: 'Tim Dokumentasi',
        order_index: 6,
      },
    ],
  });
  console.log('✅ 6 Item Rundown Jadwal dibuat untuk Event 1.');

  // Penugasan Vendor ke Event 1
  // Assignment 1: Sound System
  const assignmentSound = await prisma.eventVendor.create({
    data: {
      event_id: event1.id,
      vendor_id: userVendor1.vendor_profile!.id,
      job_title: 'Penyedia Tata Suara & Pencahayaan Panggung Utama',
      scope_of_work: 'Menyediakan line array 20.000 watt, mixer digital 32 channel, 8 unit wireless microphone, lighting panggung (moving head, spotlight), dan standby gladi resik teknis H-1 pukul 19:00 WIB.',
      status: EventVendorStatus.in_progress,
      notes: 'Peralatan utama telah loading ke venue pada H-1. Tim sedang memasang instalasi kabel dan soundcheck.',
      assigned_by: eventManager.id,
    },
  });

  // Assignment 2: Catering
  await prisma.eventVendor.create({
    data: {
      event_id: event1.id,
      vendor_id: userVendor2.vendor_profile!.id,
      job_title: 'Penyedia Konsumsi Prasmanan & Coffee Break',
      scope_of_work: 'Menyiapkan prasmanan 600 porsi (menu paket A), 2 kali coffee break (pagi & sore), air mineral botol di setiap meja peserta, serta 15 staf pelayan berseragam rapi.',
      status: EventVendorStatus.accepted,
      notes: 'Menu dan jadwal drop konsumsi sudah dikonfirmasi. Masuk dapur persiapan pukul 06:00 WIB hari-H.',
      assigned_by: eventManager.id,
    },
  });

  // Assignment 3: Dokumentasi
  await prisma.eventVendor.create({
    data: {
      event_id: event1.id,
      vendor_id: userVendor4.vendor_profile!.id,
      job_title: 'Dokumentasi Foto, Video Highlight, & Live Feed Proyektor',
      scope_of_work: 'Menyediakan 3 fotografer liputan, 2 videografer, switcher kamera untuk tayangan live di LED display panggung, dan menyerahkan master foto & video highlight 1 menit.',
      status: EventVendorStatus.assigned,
      notes: 'Baru ditugaskan oleh Event Manager, menunggu konfirmasi kesiapan kru vendor.',
      assigned_by: eventManager.id,
    },
  });

  // Catat Riwayat Log Progres Vendor Tata Suara (Audit Trail)
  await prisma.eventVendorLog.createMany({
    data: [
      {
        event_vendor_id: assignmentSound.id,
        previous_status: null,
        new_status: EventVendorStatus.assigned,
        notes: 'Penugasan resmi diterbitkan oleh Event Manager.',
        updated_by: eventManager.id,
      },
      {
        event_vendor_id: assignmentSound.id,
        previous_status: EventVendorStatus.assigned,
        new_status: EventVendorStatus.accepted,
        notes: 'Vendor menyetujui penugasan dan mengalokasikan tim audio engineer.',
        updated_by: userVendor1.id,
      },
      {
        event_vendor_id: assignmentSound.id,
        previous_status: EventVendorStatus.accepted,
        new_status: EventVendorStatus.in_progress,
        notes: 'Peralatan masuk venue Grand Ballroom. Proses rigging panggung dan instalasi sistem tata suara sedang berjalan.',
        updated_by: userVendor1.id,
      },
    ],
  });
  console.log('✅ Penugasan Vendor & Event Vendor Log berhasil dibuat.');

  // 7. Buat Contoh Event 2 (Status: Submitted - Menunggu Review EM)
  await prisma.event.create({
    data: {
      client_id: client2.id,
      venue_id: null,
      title: 'Sarah & Reza Romantic Wedding Reception',
      event_type: 'Wedding Celebration',
      description: 'Resepsi pernikahan berkonsep botanical garden semi-outdoor. Membutuhkan bantuan EO untuk pemilihan venue rekanan dan koordinasi vendor vendor.',
      start_date: new Date('2026-11-20T10:00:00Z'),
      end_date: new Date('2026-11-20T16:00:00Z'),
      estimated_guests: 400,
      status: EventStatus.submitted,
    },
  });
  console.log('✅ Contoh Event 2 (Status: Submitted) berhasil dibuat.');

  console.log('🎉 Seeding database selesai dengan sukses!');
}

main()
  .catch((e) => {
    console.error('❌ Terjadi kesalahan saat seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
