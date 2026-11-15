export interface MenteeTestimonial {
  id: string
  name: string
  univ: string
  prodi: string
  jalur: string
  quote: string
  photo: string
  isTopMentee?: boolean
  rating?: number
}

// Real Mentee submissions from OTWPTN Batch 2026
export const REAL_TOP_MENTEES: MenteeTestimonial[] = [
  {
    id: 'aisyah',
    name: 'Aisyah Shafa Rizkika',
    univ: 'Universitas Indonesia',
    prodi: 'Ilmu Psikologi',
    jalur: 'PPKB UI',
    quote:
      'Kesan mentor di OTWPTN sangat luar biasaaa Alhamdulillah perjuangan aku ga sia-sia. Aku cuma mau mengucapkan banyak terima kasih yang sebesar-besarnya kepada seluruh kakak pembimbing atas strategi serta support moral yang luar biasa selama ini. Thank you for helping me achieve my dream! Walaupun ikut mentor ini cuma sebentar, tapi bener-bener aku pakai juga buat esai beasiswa aku. Alhamdulillah aku bisa mendapatkan beasiswa sekaligus PTN dengan jurusan yang aku impikan selama ini di UI!',
    photo: '/mentees/aisyah.webp',
    isTopMentee: true,
    rating: 5,
  },
  {
    id: 'fahri',
    name: 'Fahri Amir Mahmud',
    univ: 'Universitas Indonesia',
    prodi: 'Ilmu Administrasi Niaga',
    jalur: 'PPKB UI',
    quote:
      'Mau terimakasih yang banyak untuk kakak-kakak mentor OTWPTN karena sudah membantu membimbing aku yang dulunya tuh masih bingung banget dalam membuat essay PPKB UI. Terimakasih juga buat kakak mentor aku yang kece Kak Salwa, thank you so much! Pokoknya Kak Salwa top markotop, sukses selalu untuk kakak-kakak mentor OTWPTN. Fiks ini bakal jadi momen yang gak bakal dilupain, nulis essay PPKB yang penuh struggle sampai akhirnya lolos! Nanti aku bakal promosiin ke adik-adik kelas kalau butuh dampingan buat essay harus cobain OTWPTN!',
    photo: '/mentees/fahri.webp',
    isTopMentee: true,
    rating: 5,
  },
  {
    id: 'dhea',
    name: 'Dhea Risma Nurmala',
    univ: 'Universitas Indonesia',
    prodi: 'Sastra Daerah Untuk Sastra Jawa',
    jalur: 'PPKB UI',
    quote:
      'Terimakasih banyak kaka sudah membantu akuu sampe lolos! Bener-bener ngebantu banget dari penataan berkas sampai draf esai siap dikumpul jauh-jauh hari. Alhamdulillah impian masuk UI akhirnya terwujud!',
    photo: '/mentees/dhea.webp',
    isTopMentee: true,
    rating: 5,
  },
  {
    id: 'assyfa',
    name: 'Assyfa',
    univ: 'Universitas Indonesia',
    prodi: 'D4 Bisnis Kreatif',
    jalur: 'PPKB UI',
    quote:
      'Bimbingan di OTWPTN keren banget! Mentornya super suportif, bener-bener ngarahin esai step-by-step sampai matang, dan alhamdulillah berhasil lolos di jurusan impianku di Universitas Indonesia.',
    photo: '/mentees/assyfa.webp',
    isTopMentee: true,
    rating: 5,
  },
  {
    id: 'shehnaz',
    name: 'Andi Shehnaz Rieandra Beiby',
    univ: 'Universitas Indonesia',
    prodi: 'Ilmu Hukum',
    jalur: 'PPKB UI',
    quote:
      'Seneng banget bisa kenal Kak Salwa dan tim OTWPTN yang selalu bantuin aku, aku tanya-tanya selalu dijawab detail dan beneran ngebantu aku banget. Terima kasih banyak Kak Salwa dan kakak-kakak OTWPTN!',
    photo: '/mentees/shehnaz.webp',
    isTopMentee: true,
    rating: 5,
  },
]

export const DUMMY_MENTEES: MenteeTestimonial[] = [
  {
    id: 'caca',
    name: 'Caca Evelyn',
    univ: 'Universitas Indonesia',
    prodi: 'Pendidikan Dokter (FK)',
    jalur: 'PPKB UI',
    quote:
      'Awalnya skeptis sama essay AI review, tapi pas dicoba feedback-nya detail bgt sampe ke tone kalimat & struktur motivasi. Skor esaiku naik dr 72 ke 94 dan alhamdulillah tembus FK UI!',
    photo: '/avatars/avatar-1.png',
    rating: 5,
  },
  {
    id: 'ibrahim',
    name: 'Ibrahim Wongso',
    univ: 'Institut Teknologi Bandung',
    prodi: 'STEI-R',
    jalur: 'SSU ITB',
    quote:
      'Kalkulator peluangnya beneran ngasih insight realistis soal indeks sekolah & rerata mapel pendukung. Jadi gak asal nekat milih prodi, fix kebantu bgt!',
    photo: '/avatars/avatar-2.png',
    rating: 5,
  },
  {
    id: 'nayla',
    name: 'Nayla Andhara',
    univ: 'Universitas Gadjah Mada',
    prodi: 'Ilmu Hubungan Internasional',
    jalur: 'SNBP 2026',
    quote:
      'Sesi 1-on-1 bareng mentor alumni UGM ngebuka mataku bgt. Esai personal statement-ku dibedah langsung kalimat per kalimat di GDocs sampe bener-bener solid.',
    photo: '/avatars/avatar-3.png',
    rating: 5,
  },
  {
    id: 'kevin',
    name: 'Kevin Reynard',
    univ: 'Institut Teknologi Sepuluh Nopember',
    prodi: 'Aktuaria',
    jalur: 'SNBP 2026',
    quote:
      'Fitur kurasi sertifikatnya ngebantu milih 3 piagam terbaik yg bener-bener diakui Puspresnas. Gak sia-sia langganan Paket Honeycomb!',
    photo: '/avatars/avatar-4.png',
    rating: 5,
  },
  {
    id: 'rafif',
    name: 'Rafif Al-Ghifari',
    univ: 'Universitas Indonesia',
    prodi: 'Teknik Mesin',
    jalur: 'PPKB UI',
    quote:
      'Modul videonya daging semua, gak bertele-tele. Terutama materi cara nulis esai tanpa klise "sejak kecil saya bercita-cita". Berkat ini lolos pilihan 1!',
    photo: '/avatars/avatar-5.png',
    rating: 5,
  },
  {
    id: 'tasya',
    name: 'Tasya Kamila Putri',
    univ: 'Universitas Airlangga',
    prodi: 'Psikologi',
    jalur: 'SBUB UNDIP',
    quote:
      'Suka bgt sama Otbee AI, fast response dan selalu ngasih saran taktis tiap kali overthinking mikirin persaingan kuota satu sekolah.',
    photo: '/avatars/avatar-6.png',
    rating: 5,
  },
  {
    id: 'darryl',
    name: 'Darryl Pratama',
    univ: 'Institut Teknologi Bandung',
    prodi: 'DKV FSRD',
    jalur: 'SMUP UNPAD',
    quote:
      'Review portofolio dan esai dari mentor senior alumni ITB beneran detail. Dikasih tau apa yg dicari dosen penilai dan cara menonjolkan keunikan karya.',
    photo: '/avatars/avatar-7.png',
    rating: 5,
  },
  {
    id: 'celine',
    name: 'Celine Jessica',
    univ: 'Universitas Brawijaya',
    prodi: 'Manajemen',
    jalur: 'PBUB UGM',
    quote:
      'Tracking jalurnya ngebantu bgt biar gak kelewat deadline berkas PPKB sama SNBP. Semua dokumen rapi tersimpan di satu dashboard.',
    photo: '/avatars/avatar-8.png',
    rating: 5,
  },
]
