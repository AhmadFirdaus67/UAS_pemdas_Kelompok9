
 import * as readlineSync from "readline-sync";

// 1. STRUKTUR DATA 

interface TransaksiParkir {
    id: string;
    platNomor: string;
    jenisKendaraan: string;
    durasiJam: number;
    hari: number;
    isMember: boolean;
    metodeBayar: number;
    biayaParkir: number;
    kenaBatasHarian: boolean;
    diskonPersen: number;
    potonganDiskon: number;
    totalBayar: number;
}

// Menampung data input sebelum dihitung menjadi transaksi
interface InputParkir {
    platNomor: string;
    jenisKendaraan: string;
    durasiJam: number;
    hari: number;
    isMember: boolean;
    metodeBayar: number;
}


// 2. DATA TETAP DAN PENYIMPANAN

// Menentukan batas maksimal tarif dan pembulatan
const BATAS_TARIF_HARIAN: number = 40000;
const PEMBULATAN: number = 500;

// Array untuk menyimpan seluruh transaksi parkir
const daftarTransaksi: TransaksiParkir[] = [];

// Nomor urut untuk membuat ID transaksi
let nomorTransaksi: number = 1;

// 3. FUNGSI INPUT


// Membaca input teks dari pengguna
function inputTeks(pesan: string): string {
    return readlineSync.question(pesan).trim();
}

// Membaca input angka dan memeriksa batas nilainya
function inputAngka(
    pesan: string,
    minimal: number,
    maksimal: number
): number {
    while (true) {
        const jawaban: string = inputTeks(pesan);
        const angka: number = Number(jawaban);

        if (
            jawaban !== "" &&
            Number.isInteger(angka) &&
            angka >= minimal &&
            angka <= maksimal
        ) {
            return angka;
        }

        console.log("[ERROR] Masukkan angka yang sesuai!");
    }
}

// Membaca status member dengan pilihan Ya atau Tidak
function inputMember(): boolean {
    while (true) {
        const jawaban: string = inputTeks(
            "Apakah member? (ya/tidak): "
        ).toLowerCase();

        if (jawaban === "ya") {
            return true;
        } else if (jawaban === "tidak") {
            return false;
        }

        console.log("[ERROR] Masukkan ya atau tidak!");
    }
}


// 4. INPUT DATA TRANSAKSI


// Meminta data kendaraan dan detail parkir
function inputDataParkir(): InputParkir {
    console.log("\n========== INPUT DATA PARKIR ==========");

    let platNomor: string = "";

    // Plat nomor tidak boleh kosong
    while (platNomor === "") {
        platNomor = inputTeks("Plat nomor kendaraan: ");

        if (platNomor === "") {
            console.log("[ERROR] Plat nomor tidak boleh kosong!");
        }
    }

    const pilihanKendaraan: number = inputAngka(
        "Jenis kendaraan (1=Motor, 2=Mobil, 3=Truk): ",
        1,
        3
    );

    let jenisKendaraan: string = "";

    // Menentukan nama kendaraan berdasarkan pilihan
    switch (pilihanKendaraan) {
        case 1:
            jenisKendaraan = "Motor";
            break;
        case 2:
            jenisKendaraan = "Mobil";
            break;
        case 3:
            jenisKendaraan = "Truk";
            break;
    }

    const durasiJam: number = inputAngka(
        "Lama parkir (jam): ",
        1,
        100000
    );

    const hari: number = inputAngka(
        "Hari (1=Senin-Jumat, 2=Sabtu, 3=Minggu): ",
        1,
        3
    );

    const isMember: boolean = inputMember();

    const metodeBayar: number = inputAngka(
        "Metode bayar (1=Tunai, 2=E-Money, 3=QRIS): ",
        1,
        3
    );

    return {
        platNomor: platNomor.toUpperCase(),
        jenisKendaraan,
        durasiJam,
        hari,
        isMember,
        metodeBayar
    };
}


// 5. PERHITUNGAN TARIF PARKIR

// Menghitung biaya parkir dan menghasilkan transaksi
function hitungTransaksi(
    data: InputParkir,
    id: string
): TransaksiParkir {
    let tarifJamPertama: number = 0;
    let tarifJamBerikut: number = 0;

    // Menentukan tarif berdasarkan jenis kendaraan
    switch (data.jenisKendaraan) {
        case "Motor":
            tarifJamPertama = 2000;
            tarifJamBerikut = 1000;
            break;
        case "Mobil":
            tarifJamPertama = 5000;
            tarifJamBerikut = 3000;
            break;
        case "Truk":
            tarifJamPertama = 8000;
            tarifJamBerikut = 5000;
            break;
    }

    // Menghitung biaya berdasarkan durasi parkir
    let biayaParkir: number = tarifJamPertama;

    if (data.durasiJam > 1) {
        biayaParkir +=
            (data.durasiJam - 1) * tarifJamBerikut;
    }

    // Membatasi biaya maksimal harian
    let kenaBatasHarian: boolean = false;

    if (biayaParkir > BATAS_TARIF_HARIAN) {
        biayaParkir = BATAS_TARIF_HARIAN;
        kenaBatasHarian = true;
    }

    // Menghitung persentase diskon
    let diskonPersen: number = 0;

    switch (data.hari) {
        case 1:
            if (data.isMember) {
                switch (data.metodeBayar) {
                    case 1:
                        diskonPersen += 5;
                        break;
                    case 2:
                        diskonPersen += 10;
                        break;
                    case 3:
                        diskonPersen += 8;
                        break;
                }

                if (
                    data.durasiJam >= 5 &&
                    biayaParkir >= 20000
                ) {
                    diskonPersen += 5;
                }
            } else {
                if (data.durasiJam >= 8) {
                    diskonPersen += 3;
                }
            }
            break;

        case 2:
            if (data.isMember) {
                diskonPersen += 5;
            }
            break;

        case 3:
            diskonPersen += 10;
            break;
    }

    // Menghitung nominal potongan diskon
    const potonganDiskon: number =
        (biayaParkir * diskonPersen) / 100;

    // Menghitung total pembayaran
    let totalBayar: number = biayaParkir;
    totalBayar -= potonganDiskon;

    // Membulatkan total ke bawah ke kelipatan Rp500
    const sisa: number = totalBayar % PEMBULATAN;
    totalBayar -= sisa;

    // Mengembalikan seluruh data transaksi
    return {
        id,
        platNomor: data.platNomor,
        jenisKendaraan: data.jenisKendaraan,
        durasiJam: data.durasiJam,
        hari: data.hari,
        isMember: data.isMember,
        metodeBayar: data.metodeBayar,
        biayaParkir,
        kenaBatasHarian,
        diskonPersen,
        potonganDiskon,
        totalBayar
    };
}


// 6. TAMPILAN DETAIL TRANSAKSI

// Menampilkan detail satu transaksi
function tampilkanDetail(
    transaksi: TransaksiParkir
): void {
    console.log("\n========== DETAIL TRANSAKSI ==========");
    console.log(`ID Transaksi   : ${transaksi.id}`);
    console.log(`Plat Nomor     : ${transaksi.platNomor}`);
    console.log(`Kendaraan      : ${transaksi.jenisKendaraan}`);
    console.log(`Durasi Parkir  : ${transaksi.durasiJam} jam`);

    let namaHari: string = "";

    switch (transaksi.hari) {
        case 1:
            namaHari = "Senin-Jumat";
            break;
        case 2:
            namaHari = "Sabtu";
            break;
        case 3:
            namaHari = "Minggu";
            break;
    }

    console.log(`Hari           : ${namaHari}`);
    console.log(
        `Status Member  : ${transaksi.isMember ? "Member" : "Non-member"}`
    );

    let namaMetode: string = "";

    switch (transaksi.metodeBayar) {
        case 1:
            namaMetode = "Tunai";
            break;
        case 2:
            namaMetode = "E-Money";
            break;
        case 3:
            namaMetode = "QRIS";
            break;
    }

    console.log(`Metode Bayar   : ${namaMetode}`);
    console.log(`Biaya Parkir   : Rp ${transaksi.biayaParkir}`);

    if (transaksi.kenaBatasHarian) {
        console.log(
            `(Terkena batas maksimal Rp ${BATAS_TARIF_HARIAN})`
        );
    }

    console.log(`Diskon         : ${transaksi.diskonPersen}%`);
    console.log(`Potongan       : Rp ${transaksi.potonganDiskon}`);
    console.log(`TOTAL BAYAR    : Rp ${transaksi.totalBayar}`);
    console.log("======================================");
}


// 7. FITUR CREATE


// Menambahkan transaksi parkir baru
function tambahTransaksi(): void {
    console.log("\n========== TAMBAH TRANSAKSI ==========");

    const data: InputParkir = inputDataParkir();

    // Membuat ID transaksi secara otomatis
    let id: string = "";

    do {
        id = `PRK-${String(nomorTransaksi).padStart(3, "0")}`;
        nomorTransaksi++;
    } while (
        daftarTransaksi.find((item) => item.id === id)
    );

    // Menghitung dan menyimpan transaksi
    const transaksi: TransaksiParkir =
        hitungTransaksi(data, id);

    daftarTransaksi.push(transaksi);

    console.log("\n[BERHASIL] Transaksi berhasil disimpan!");
    tampilkanDetail(transaksi);
}

// 8. FITUR READ

// 8. FITUR READ

// Menampilkan seluruh transaksi yang tersimpan
function tampilkanSemuaTransaksi(): void {
    console.log("\n========== DAFTAR TRANSAKSI ==========");

    if (daftarTransaksi.length === 0) {
        console.log("Belum ada transaksi yang tersimpan.");
        return;
    }

    // Variabel untuk menghitung total pendapatan
    let totalPendapatan: number = 0;

    for (const transaksi of daftarTransaksi) {
        console.log("--------------------------------------");
        console.log(`ID           : ${transaksi.id}`);
        console.log(`Plat Nomor   : ${transaksi.platNomor}`);
        console.log(`Kendaraan    : ${transaksi.jenisKendaraan}`);
        console.log(`Durasi       : ${transaksi.durasiJam} jam`);
        console.log(`Total Bayar  : Rp ${transaksi.totalBayar}`);

        // Menjumlahkan seluruh total pembayaran
        totalPendapatan += transaksi.totalBayar;
    }

    console.log("--------------------------------------");
    console.log(`Jumlah transaksi : ${daftarTransaksi.length}`);
    console.log(`TOTAL PENDAPATAN : Rp ${totalPendapatan}`);
}

// Menampilkan detail transaksi berdasarkan ID
function cariDetailID(): void {
    const id: string = inputTeks(
        "Masukkan ID transaksi: "
    ).toUpperCase();

    const transaksi: TransaksiParkir | undefined =
        daftarTransaksi.find((item) => item.id === id);

    if (transaksi === undefined) {
        console.log("[ERROR] Transaksi tidak ditemukan!");
    } else {
        tampilkanDetail(transaksi);
    }
}
// 9. FITUR UPDATE

// Mengubah data transaksi berdasarkan ID
function ubahTransaksi(): void {
    console.log("\n========== UBAH TRANSAKSI ==========");

    const id: string = inputTeks(
        "Masukkan ID transaksi: "
    ).toUpperCase();

    const indeks: number = daftarTransaksi.findIndex(
        (item) => item.id === id
    );

    if (indeks === -1) {
        console.log("[ERROR] Transaksi tidak ditemukan!");
        return;
    }

    console.log("\nData transaksi lama:");
    tampilkanDetail(daftarTransaksi[indeks]);

    console.log("\nMasukkan data transaksi yang baru.");

    const dataBaru: InputParkir = inputDataParkir();

    // Menghitung ulang transaksi dengan ID yang sama
    daftarTransaksi[indeks] =
        hitungTransaksi(dataBaru, id);

    console.log("\n[BERHASIL] Data transaksi berhasil diperbarui!");
    tampilkanDetail(daftarTransaksi[indeks]);
}

// 10. FITUR DELETE

// Menghapus transaksi berdasarkan ID
function hapusTransaksi(): void {
    console.log("\n========== HAPUS TRANSAKSI ==========");

    const id: string = inputTeks(
        "Masukkan ID transaksi: "
    ).toUpperCase();

    const indeks: number = daftarTransaksi.findIndex(
        (item) => item.id === id
    );

    if (indeks === -1) {
        console.log("[ERROR] Transaksi tidak ditemukan!");
        return;
    }

    tampilkanDetail(daftarTransaksi[indeks]);

    const konfirmasi: string = inputTeks(
        "Yakin ingin menghapus? (y/n): "
    ).toLowerCase();

    if (konfirmasi === "y") {
        daftarTransaksi.splice(indeks, 1);
        console.log("[BERHASIL] Transaksi berhasil dihapus!");
    } else {
        console.log("Penghapusan transaksi dibatalkan.");
    }
}
// 11. FITUR SEARCH
    // 11. FITUR SEARCH

// Mencari transaksi berdasarkan keyword dan filter
function cariTransaksi(): void {
    console.log("\n========== CARI TRANSAKSI ==========");

    // Memeriksa apakah data transaksi masih kosong
    if (daftarTransaksi.length === 0) {
        console.log("Data transaksi masih kosong.");
        return;
    }

    const keyword: string = inputTeks(
        "Masukkan keyword (plat/jenis kendaraan/ID): "
    ).toLowerCase();

    console.log("\nFilter jenis kendaraan:");
    console.log("0. Semua kendaraan");
    console.log("1. Motor");
    console.log("2. Mobil");
    console.log("3. Truk");

    const filter: number = inputAngka(
        "Pilih filter: ",
        0,
        3
    );

    let jenisFilter: string = "";

    switch (filter) {
        case 1:
            jenisFilter = "Motor";
            break;
        case 2:
            jenisFilter = "Mobil";
            break;
        case 3:
            jenisFilter = "Truk";
            break;
    }

    // Mencari transaksi berdasarkan keyword dan jenis kendaraan
    const hasil: TransaksiParkir[] =
        daftarTransaksi.filter((item) => {
            const cocokKeyword: boolean =
                item.platNomor.toLowerCase().includes(keyword) ||
                item.jenisKendaraan.toLowerCase().includes(keyword) ||
                item.id.toLowerCase().includes(keyword);

            const cocokJenis: boolean =
                filter === 0 ||
                item.jenisKendaraan.toLowerCase() ===
                jenisFilter.toLowerCase();

            return cocokKeyword && cocokJenis;
        });

    console.log("\n========== HASIL PENCARIAN ==========");

    if (hasil.length === 0) {
        console.log("Tidak ada transaksi yang cocok.");
        console.log("Jumlah data ditemukan: 0");
        return;
    }

    for (const transaksi of hasil) {
        console.log("--------------------------------------");
        console.log(`ID          : ${transaksi.id}`);
        console.log(`Plat Nomor  : ${transaksi.platNomor}`);
        console.log(`Kendaraan   : ${transaksi.jenisKendaraan}`);
        console.log(`Total Bayar : Rp ${transaksi.totalBayar}`);
    }

    console.log("--------------------------------------");
    console.log(`Jumlah data ditemukan: ${hasil.length}`);
}
// 12. MENU UTAMA

// Menampilkan pilihan menu aplikasi
function tampilkanMenu(): void {
    console.log("\n======================================");
    console.log("       SISTEM MANAJEMEN PARKIR        ");
    console.log(`   Total Transaksi Tersimpan: ${daftarTransaksi.length} data`);
    console.log("======================================");
    console.log("1. Tambah Transaksi (Create)");
    console.log("2. Lihat Transaksi (Read)");
    console.log("3. Ubah Transaksi (Update)");
    console.log("4. Hapus Transaksi (Delete)");
    console.log("5. Cari Transaksi (Search)");
    console.log("6. Keluar");
    console.log("======================================");
}

// Memeriksa apakah pilihan menu valid
function validasiMenu(pilihan: string): boolean {
    return ["1", "2", "3", "4", "5", "6"].includes(pilihan);
}

// 13. PROGRAM UTAMA


// Menjalankan aplikasi dan mengatur perulangan menu
function main(): void {
    console.log("======================================");
    console.log("       KASIR TARIF PARKIR KAMPUS      ");
    console.log("======================================");
    console.log("Selamat datang di aplikasi parkir!");

    let berjalan: boolean = true;

    // Menu akan terus ditampilkan selama berjalan bernilai true
    while (berjalan) {
        tampilkanMenu();

        const pilihan: string = inputTeks(
            "Pilih menu (1-6): "
        );

        // Memeriksa pilihan menu
        if (!validasiMenu(pilihan)) {
            console.log(`[ERROR] Pilihan menu "${pilihan}" tidak valid! Silakan pilih 1-6.`);
            continue;
        }

        // Menjalankan fitur sesuai pilihan pengguna
        switch (pilihan) {
            case "1":
                tambahTransaksi();
                break;

            case "2":
                tampilkanSemuaTransaksi();

                if (daftarTransaksi.length > 0) {
                    const lihatDetail: string = inputTeks(
                        "Lihat detail transaksi berdasarkan ID? (y/n): "
                    ).toLowerCase();

                    if (lihatDetail === "y") {
                        cariDetailID();
                    }
                }
                break;

            case "3":
                ubahTransaksi();
                break;

            case "4":
                hapusTransaksi();
                break;

            case "5":
                cariTransaksi();
                break;

            case "6":
                berjalan = false;
                console.log(`\nTotal transaksi sesi ini: ${daftarTransaksi.length} data`);
                console.log("\nTerima kasih telah menggunakan aplikasi!");
                break;
        }
    }
}

// Memulai program
main();

