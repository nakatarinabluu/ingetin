/**
 * 📱 APP COPY (Authenticated User)
 */

export const DASHBOARD_COPY = {
  sidebar: {
    overview: "Utama",
    reminders: "Agenda",
    finances: "Kas",
    profile: "Akun",
    logout: "Keluar",
    section_explore: "Navigasi",
    help_faq: "Bantuan & FAQ",
  },
  overview: {
    badge: "Layanan Aktif",
    greeting: "Selamat {time}",
    desc: "Berikut adalah ringkasan aktivitas asisten WhatsApp Anda hari ini.",
    btn_new: "Tambah Agenda",
    btn_config: "Konfigurasi",
    overview: {
      title: "Ringkasan Aktivitas",
      desc: "Pantau seluruh operasional asisten cerdas Anda secara real-time.",
      footer_secured: "Koneksi Dashboard Aman",
      greeting_prefix: "Selamat Datang",
      desc_addon: "Seluruh data Anda telah disinkronkan dengan aplikasi WhatsApp.",
      btn_connected: "WhatsApp Terhubung",
      btn_new_agenda: "Agenda Baru",
      main_bento_badge: "Status Terkini",
      live_badge: "Data Real-time",
      status_wa: "Status WhatsApp",
      status_cloud: "Server Ingetin",
      status_e2e: "Enkripsi Pesan",
      last_audit: "Pembaruan Terakhir",
      last_audit_now: "Baru saja",
      system_footer: "Asisten dalam mode siaga operasional penuh.",
      finance_badge: "Status Saldo",
      system_badge: "Status Sistem",
      main_title: "Jadwal Mendatang",
      system_status: "Seluruh sistem beroperasi normal.",
    },
    main_title: "Daftar Agenda",
    main_badge: "Status Pengingat",
    finance_badge: "Status Keuangan",
    system_badge: "Kesehatan Sistem",
    system_status: "Koneksi stabil dan operasional normal.",
  },
  reminders: {
    title: "Kelola Agenda",
    desc: "Daftar seluruh pengingat yang akan dikirimkan secara otomatis ke WhatsApp Anda.",
    empty: "Tidak ada agenda yang dijadwalkan saat ini.",
    sync: "Perbarui Data",
  },
  finances: {
    title: "Laporan Keuangan",
    desc: "Analisis riwayat pemasukan dan pengeluaran yang tercatat melalui asisten.",
    summary: "Ringkasan Periode Ini",
  }
};

export const ACTIVITY_COPY = {
  header: {
    badge: "Riwayat Aktivitas",
    title: "Riwayat Interaksi",
    desc: "Pantau seluruh log interaksi antara akun WhatsApp Anda dengan asisten.",
  },
  search_placeholder: "Cari riwayat aktivitas...",
  empty: {
    title: "Riwayat Kosong",
    desc: "Belum ada interaksi yang tercatat untuk periode ini.",
    button: "Dashboard Utama",
  },
  footer: {
    sync: "Perbarui Riwayat",
    secured: "Data riwayat dilindungi oleh kebijakan privasi.",
  }
};

export const FINANCE_COPY = {
  header: {
    badge: "Manajemen Keuangan",
    desc_addon: "Analisis laporan keuangan Anda untuk mengoptimalkan manajemen anggaran pribadi.",
    btn_export: "Unduh Laporan",
    btn_record: "Tambah Catatan",
  },
  metrics: {
    badge_live: "Data Terverifikasi",
    badge_integrity: "Akurasi Tinggi",
    income_title: "Total Pemasukan",
    income_sub: "Status: Tren Meningkat",
    expense_title: "Total Pengeluaran",
    expense_sub: "Status: Perlu Penyesuaian",
    balance_title: "Sisa Saldo",
    balance_sub: "Keuangan Terkendali",
  },
  tabs: {
    analytics: "Visualisasi Data",
    log: "Daftar Transaksi",
  },
  history: {
    badge_log: "Transaksi Hari Ini",
    entry_suffix: "Catatan",
    btn_archive: "Arsip",
    status_settled: "Selesai",
    status_pending: "Proses",
    footer_secured: "Data Keuangan Terenkripsi",
  },
  charts: {
    telemetry: "Sistem Analisis",
    cashflow_title: "Arus Kas Pengguna",
    cashflow_desc: "Perbandingan visual pemasukan dan pengeluaran",
    distribution: "Alokasi Sektor",
    composition_title: "Struktur Biaya",
    composition_desc: "Distribusi pengeluaran berdasarkan kategori",
    active_sector: "Kategori Dominan",
    tooltip_title: "Detail Transaksi",
    orbit_weekly: "Mingguan",
    orbit_monthly: "Bulanan",
  },
  modal: {
    title_income: "Catat Uang Masuk",
    title_expense: "Catat Pengeluaran",
    subtitle_income: "Tambahkan sumber pendapatan baru ke saldo kamu.",
    subtitle_expense: "Catat pengeluaran harian agar budget terkontrol.",
    type_expense: "Pengeluaran",
    type_income: "Pemasukan",
    input_title: "Keterangan (Contoh: Freelance Logo)",
    placeholder_title: "Apa nama transaksinya?",
    input_amount: "Nominal (Rp)",
    input_category: "Kategori",
    sync_wa: "Sync ke WhatsApp",
    btn_cancel: "Batal",
    btn_submit_income: "Simpan Pendapatan",
    btn_submit_expense: "Simpan Pengeluaran",
    toast: {
      success_title: (type: string) => `${type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran'} Tercatat`,
      success_desc: (title: string, amount: string) => `${title} sebesar Rp ${amount} berhasil disimpan.`,
      error_title: "Gagal Menyimpan Transaksi",
      error_desc: "Terjadi kesalahan pada sistem. Silakan coba lagi."
    },
    validation: {
      title_required: "Keterangan wajib diisi",
      amount_min: "Jumlah minimal Rp 1",
      category_required: "Kategori wajib diisi"
    }
  }
};

export const REMINDERS_COPY = {
  header: {
    badge: "Pusat Agenda",
    desc_addon: "Kelola seluruh notifikasi pengingat terjadwal yang terintegrasi dengan WhatsApp.",
  },
  search_placeholder: "Cari jadwal Anda...",
  list: {
    badge_active: "Agenda Aktif",
    btn_sort: "Urutkan",
    sync_status: "Sinkronisasi Otomatis",
  },
  footer: {
    secured: "Agenda dikelola secara aman oleh sistem Ingetin",
  },
  empty: {
    title: "Jadwal Kosong",
    desc: "Anda belum memiliki agenda. Mulai dengan membuat pengingat baru.",
    btn_init: "Buat Pengingat",
  },
  create_modal: {
    title: "Buat Pengingat Baru",
    input_title: "Nama Agenda",
    placeholder_title: "Contoh: Konsultasi medis, Bayar tagihan",
    label_message: "Konten Pesan WhatsApp",
    placeholder_message: "Tuliskan pesan yang ingin Anda terima sebagai notifikasi...",
    label_date_once: "Tanggal Pelaksanaan",
    label_date_recur: "Tanggal Dimulai",
    label_time: "Waktu Notifikasi",
    btn_submit: "Simpan Jadwal",
    footer_note: "Pesan akan otomatis dikirimkan ke nomor WhatsApp Anda sesuai waktu yang ditentukan.",
    toast: {
        create_success: "Agenda Berhasil Dibuat",
        create_desc: "Pengingat telah disimpan dan aktif.",
        update_success: "Agenda Berhasil Diperbarui",
        update_desc: "Perubahan pada pengingat telah disimpan.",
        delete_success: "Agenda Dihapus",
        delete_desc: (title: string) => `Agenda "${title}" telah dihapus.`,
        error_title: "Gagal Menyimpan",
        error_delete: "Gagal Menghapus",
        error_generic: "Terjadi kesalahan sistem."
    },
    validation: {
        title_min: "Judul minimal 3 karakter",
        message_min: "Pesan minimal 5 karakter",
        time_required: "Jam harus diisi"
    }
  }
};

export const PROFILE_COPY = {
  header: {
    badge: "Profil Pengguna",
    desc: "Kelola informasi identitas digital Anda dan pastikan pengaturan keamanan akun tetap optimal.",
    status_badge: "Status Akun",
    status_value: "Aktif",
  },
  security_card: {
    badge: "Keamanan Akun",
  },
  system_meta: {
    badge: "Status Sistem",
    desc: "Seluruh perubahan data profil akan dicatat dalam sistem keamanan untuk melindungi integritas akun Anda.",
    engine_label: "SISTEM UTAMA",
    status_label: "OPERASIONAL",
  },
  validation: {
    first_name_min: "Nama depan minimal 2 karakter",
    last_name_min: "Nama belakang minimal 2 karakter",
    email_invalid: "Alamat email tidak valid",
    username_min: "Username minimal 4 karakter",
    password_min: "Kata sandi minimal 8 karakter"
  }
};

export const SETTINGS_COPY = {
  header: {
    badge: "Pengaturan Asisten",
    title: "Konfigurasi Layanan",
    desc: "Sesuaikan parameter asisten cerdas untuk menyelaraskan dengan preferensi produktivitas harian Anda.",
    mode_label: "Mode Operasi",
    mode_value: "Kinerja Optimal",
  },
  tabs: {
    digest: "Ringkasan Pagi",
    security: "Keamanan Akun",
  },
  digest: {
    title: "Ringkasan Pagi",
    desc: "Aktifkan pengiriman ringkasan agenda harian dan status keuangan ke WhatsApp Anda setiap pagi.",
    sync_badge: "Layanan Aktif",
    encryption_badge: "Privasi Terjamin",
    time_label: "Waktu Pengiriman",
    btn_save: "Simpan Pengaturan",
    footer_secured: "Data konfigurasi disimpan dengan standar keamanan tinggi.",
  },
  security: {
    password_title: "Pembaruan Kata Sandi",
    password_desc: "Kami menyarankan pembaruan kata sandi secara berkala untuk menjaga keamanan data Anda.",
    password_btn: "Perbarui Kata Sandi",
    sessions_title: "Perangkat Terhubung",
    sessions_desc: "Daftar perangkat yang saat ini memiliki akses aktif ke akun Anda.",
    sessions_btn: "Kelola Perangkat",
    integrity_title: "Keamanan Informasi",
    integrity_desc: "Ingetin menggunakan teknologi enkripsi terkini untuk melindungi setiap transmisi data ke WhatsApp.",
  }
};
