/**
 * 👑 ADMIN COPY (Administrator Only)
 */

export const ADMIN_COPY = {
  sidebar: {
    monitor: "Monitor Sistem",
    members: "Daftar Pengguna",
    license: "Manajemen Lisensi",
    profile: "Profil Administrator",
  },
  user_audit: {
    badge: "Audit Pengguna",
    title: "Pemantauan Aktivitas",
    desc: "Analisis operasional sistem untuk memastikan ketersediaan layanan yang berkelanjutan.",
    btn_registry: "Daftar Log",
    btn_sync: "Sinkronisasi Data",
    kpi: {
      account: "Informasi Akun",
      wa_link: "Status Koneksi",
      registry_load: "Beban Data",
      signal_load: "Beban Pengiriman",
    },
    filter: {
      pending: "Menunggu",
      success: "Berhasil",
      cancelled: "Dibatalkan",
      history: "Riwayat",
    },
    empty: "Tidak ada data aktivitas yang tersedia.",
    revoke_modal: {
      title: "Hapus Catatan?",
      desc: "Apakah Anda yakin ingin menghapus data riwayat ini secara permanen? Tindakan ini tidak dapat dibatalkan.",
      btn_cancel: "Batalkan",
      btn_confirm: "Konfirmasi Hapus",
    }
  },
  license_manager: {
    badge: "Manajemen Akses",
    title: "Aktivasi Layanan",
    desc: "Pembuatan dan pemantauan kode akses resmi untuk registrasi pengguna baru.",
    btn_generate: "Buat Kode Baru",
    filters: {
      all: "Seluruh Kode",
      available: "Tersedia",
      consumed: "Terpakai",
    },
    directory_title: "Daftar Kode Akses",
    op_log: "Log Aktivitas Lisensi",
    keys_detected: "Kode Teridentifikasi",
    empty: "Belum ada kode akses yang dihasilkan.",
    card: {
      layer: "Lapisan Keamanan",
      persistence: "Ketahanan Data",
      identity: "Pemilik Lisensi",
      waiting: "Menunggu Aktivasi Pengguna",
    }
  },
  event_audit: {
    badge: "Audit Sistem",
    btn_back: "Kembali",
    btn_sync: "Perbarui Sistem",
    empty: "Log sistem kosong.",
    toast: {
      sync_success: "Sinkronisasi sistem berhasil diselesaikan.",
      sync_fail: "Gagal melakukan sinkronisasi. Silakan periksa koneksi.",
      delete_success: "Data berhasil dihapus dari sistem.",
      delete_fail: "Gagal menghapus data. Terjadi kesalahan internal.",
    }
  }
};
