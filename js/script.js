"use strict";

// ========================================
// KONFIGURASI TOKO
// ========================================

const nomorWhatsApp = "6285270051074";

// Ganti dengan email toko yang sebenarnya.
const emailToko = "makansapiikanemas@gmail.com";

const produkToko = [
    {
        id: "1",
        nama: "Pisang Cokelat",
        harga: 5000
    },
    {
        id: "2",
        nama: "Pisang Matcha",
        harga: 10000
    },
    {
        id: "3",
        nama: "Pisang Taro",
        harga: 15000
    }
];

const KUNCI_KERANJANG = "piscokDelightKeranjang";

let keranjang = muatKeranjang();
let timerNotifikasi;


// ========================================
// FORMAT RUPIAH
// ========================================

function rupiah(angka) {
    return "Rp" + angka.toLocaleString("id-ID");
}


// ========================================
// SIMPAN DAN MUAT KERANJANG
// ========================================

function simpanKeranjang() {
    try {
        localStorage.setItem(
            KUNCI_KERANJANG,
            JSON.stringify(keranjang)
        );
    } catch (error) {
        console.warn("Keranjang tidak dapat disimpan.", error);
    }
}

function muatKeranjang() {
    try {
        const data = localStorage.getItem(KUNCI_KERANJANG);

        if (!data) return {};

        const hasil = JSON.parse(data);

        if (
            !hasil ||
            typeof hasil !== "object" ||
            Array.isArray(hasil)
        ) {
            return {};
        }

        const keranjangValid = {};

        Object.keys(hasil).forEach(function (id) {
            const produk = produkToko.find(function (item) {
                return item.id === id;
            });

            const jumlah = Number(hasil[id]?.jumlah);

            if (
                produk &&
                Number.isSafeInteger(jumlah) &&
                jumlah > 0
            ) {
                keranjangValid[id] = {
                    ...produk,
                    jumlah: Math.min(jumlah, 999)
                };
            }
        });

        return keranjangValid;
    } catch (error) {
        console.warn("Data keranjang tidak dapat dibaca.", error);
        return {};
    }
}


// ========================================
// NOTIFIKASI
// ========================================

function tampilkanNotifikasi(pesan) {
    const notifikasi = document.getElementById("notifikasi");

    if (!notifikasi) return;

    notifikasi.textContent = pesan;
    notifikasi.classList.add("aktif");

    clearTimeout(timerNotifikasi);

    timerNotifikasi = setTimeout(function () {
        notifikasi.classList.remove("aktif");
    }, 2500);
}


// ========================================
// TAMBAH PRODUK
// ========================================

function tambahProduk(id) {
    const produk = produkToko.find(function (item) {
        return item.id === String(id);
    });

    if (!produk) {
        tampilkanNotifikasi("Produk tidak ditemukan!");
        return;
    }

    if (!keranjang[id]) {
        keranjang[id] = {
            ...produk,
            jumlah: 0
        };
    }

    if (keranjang[id].jumlah >= 999) {
        tampilkanNotifikasi("Jumlah maksimum produk tercapai.");
        return;
    }

    keranjang[id].jumlah += 1;

    simpanKeranjang();
    tampilkanKeranjang();

    tampilkanNotifikasi(
        produk.nama + " berhasil ditambahkan!"
    );
}


// ========================================
// TAMBAH JUMLAH
// ========================================

function tambahJumlah(id) {
    if (!keranjang[id]) return;

    if (keranjang[id].jumlah >= 999) {
        tampilkanNotifikasi("Jumlah maksimum produk tercapai.");
        return;
    }

    keranjang[id].jumlah += 1;

    simpanKeranjang();
    tampilkanKeranjang();
}


// ========================================
// KURANGI JUMLAH
// ========================================

function kurangiJumlah(id) {
    if (!keranjang[id]) return;

    keranjang[id].jumlah -= 1;

    if (keranjang[id].jumlah <= 0) {
        delete keranjang[id];
    }

    simpanKeranjang();
    tampilkanKeranjang();
}


// ========================================
// HITUNG TOTAL
// ========================================

function hitungTotal() {
    return Object.values(keranjang).reduce(
        function (total, item) {
            return total + item.harga * item.jumlah;
        },
        0
    );
}

function hitungJumlahProduk() {
    return Object.values(keranjang).reduce(
        function (jumlah, item) {
            return jumlah + item.jumlah;
        },
        0
    );
}


// ========================================
// TAMPILKAN KERANJANG
// ========================================

function tampilkanKeranjang() {
    const daftar = document.getElementById("daftar-keranjang");
    const totalElement = document.getElementById("total");
    const jumlahItemElement = document.getElementById("jumlah-item");
    const jumlahKeranjangElement = document.getElementById("jumlah-keranjang");

    if (
        !daftar ||
        !totalElement ||
        !jumlahItemElement ||
        !jumlahKeranjangElement
    ) {
        console.error("Elemen keranjang tidak ditemukan.");
        return;
    }

    daftar.replaceChildren();

    const isiKeranjang = Object.values(keranjang);
    const jumlahSemua = hitungJumlahProduk();

    jumlahKeranjangElement.textContent = jumlahSemua;
    jumlahItemElement.textContent = jumlahSemua + " produk";
    totalElement.textContent = rupiah(hitungTotal());

    if (isiKeranjang.length === 0) {
        const kosong = document.createElement("div");
        kosong.className = "keranjang-kosong";

        const ikon = document.createElement("span");
        ikon.textContent = "🛍️";

        const judul = document.createElement("h3");
        judul.textContent = "Keranjang masih kosong";

        const deskripsi = document.createElement("p");
        deskripsi.textContent = "Yuk, pilih piscok favoritmu!";

        const tombol = document.createElement("a");
        tombol.href = "#produk";
        tombol.className = "btn-primary";
        tombol.textContent = "Pilih Produk";

        kosong.append(ikon, judul, deskripsi, tombol);
        daftar.appendChild(kosong);

        return;
    }

    isiKeranjang.forEach(function (item) {
        const baris = document.createElement("div");
        baris.className = "item-keranjang";

        const info = document.createElement("div");
        info.className = "item-info";

        const nama = document.createElement("h4");
        nama.textContent = item.nama;

        const harga = document.createElement("p");
        harga.textContent =
            rupiah(item.harga) + " × " + item.jumlah;

        const subtotal = document.createElement("strong");
        subtotal.className = "item-subtotal";
        subtotal.textContent =
            rupiah(item.harga * item.jumlah);

        info.append(nama, harga, subtotal);

        const kontrol = document.createElement("div");
        kontrol.className = "kontrol";

        const tombolKurang = document.createElement("button");
        tombolKurang.type = "button";
        tombolKurang.textContent = "−";
        tombolKurang.setAttribute(
            "aria-label",
            "Kurangi " + item.nama
        );

        tombolKurang.addEventListener("click", function () {
            kurangiJumlah(item.id);
        });

        const jumlah = document.createElement("span");
        jumlah.className = "jumlah";
        jumlah.textContent = item.jumlah;

        const tombolTambah = document.createElement("button");
        tombolTambah.type = "button";
        tombolTambah.textContent = "+";
        tombolTambah.setAttribute(
            "aria-label",
            "Tambah " + item.nama
        );

        tombolTambah.addEventListener("click", function () {
            tambahJumlah(item.id);
        });

        kontrol.append(
            tombolKurang,
            jumlah,
            tombolTambah
        );

        baris.append(info, kontrol);
        daftar.appendChild(baris);
    });
}


// ========================================
// HAPUS SEMUA KERANJANG
// ========================================

function hapusKeranjang() {
    if (Object.keys(keranjang).length === 0) {
        tampilkanNotifikasi("Keranjang sudah kosong.");
        return;
    }

    const yakin = window.confirm(
        "Apakah kamu yakin ingin mengosongkan keranjang?"
    );

    if (!yakin) return;

    keranjang = {};

    simpanKeranjang();
    tampilkanKeranjang();

    tampilkanNotifikasi("Keranjang berhasil dikosongkan.");
}


// ========================================
// CHECKOUT WHATSAPP
// ========================================

function checkout() {
    const isiKeranjang = Object.values(keranjang);

    if (isiKeranjang.length === 0) {
        tampilkanNotifikasi(
            "Tambahkan produk sebelum checkout!"
        );
        return;
    }

    let pesan =
        "Halo Piscok Delight, saya ingin memesan:\n\n";

    isiKeranjang.forEach(function (item, index) {
        pesan +=
            (index + 1) + ". " + item.nama + "\n" +
            "   Harga: " + rupiah(item.harga) + "\n" +
            "   Jumlah: " + item.jumlah + "\n" +
            "   Subtotal: " +
            rupiah(item.harga * item.jumlah) + "\n\n";
    });

    pesan +=
        "Total pembayaran: " + rupiah(hitungTotal()) +
        "\n\nMohon konfirmasi pesanan saya." +
        "\nTerima kasih.";

    const url =
        "https://wa.me/" +
        nomorWhatsApp +
        "?text=" +
        encodeURIComponent(pesan);

    window.location.assign(url);
}


// ========================================
// AKTIFKAN WEBSITE
// ========================================

function jalankanToko() {
    document.querySelectorAll(".btn-tambah").forEach(
        function (tombol) {
            tombol.addEventListener("click", function () {
                tambahProduk(this.dataset.id);
            });
        }
    );

    const tombolHapus = document.getElementById("hapus");

    if (tombolHapus) {
        tombolHapus.addEventListener(
            "click",
            hapusKeranjang
        );
    }

    const tombolCheckout = document.getElementById("checkout");

    if (tombolCheckout) {
        tombolCheckout.addEventListener(
            "click",
            checkout
        );
    }

    // Pastikan email menggunakan alamat yang sama.
    document.querySelectorAll('a[href^="mailto:"]').forEach(
        function (tautan) {
            tautan.href = "mailto:" + emailToko;
            tautan.textContent = emailToko;
        }
    );

    tampilkanKeranjang();

    console.log("Piscok Delight berhasil dijalankan!");
}

jalankanToko();