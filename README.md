# Kampung Atuk

Permainan web 3D untuk sesi terapi carakerja (OT) kanak-kanak 4 hingga 7 tahun. Murid menghabiskan "sehari di kampung Atuk": semak perasaan, tiga misi harian, lima stesen aktiviti, dan kampung yang membesar setiap kali misi selesai. Ibu bapa dan OT melihat analisis kemajuan dalam Mod Induk yang dikunci dengan PIN.

*A 3D web game for paediatric occupational therapy (ages 4 to 7), in Bahasa Melayu and English. See [English summary](#english-summary).*

Main di sini / Play here: https://mohdikmalnasir-create.github.io/kampung-atuk/

> **Status: prototaip 0.10.1 untuk semakan pakar.** Bukan alat diagnosis. Analisis ialah pemerhatian daripada data permainan; keputusan klinikal dibuat oleh jurupulih carakerja bertauliah bersama penilaian formal.

## Ciri utama

| Bahagian | Kemahiran OT | Rangka rujukan |
| --- | --- | --- |
| Kutip buah: cari warna | Persepsi visual | OTPF-4 kemahiran proses, konstruk persepsi visual Beery VMI |
| Kutip buah: ikut arahan (2 hingga 3 langkah) | Memori kerja, arahan berurutan | Fungsi eksekutif, OTPF-4 *Heeds, Sequences* |
| Siram bunga (tekan, tahan, lepas) | Kawalan motor bergred, inhibisi | OTPF-4 *Calibrates, Terminates* |
| Bantu ibu ayam (seret ikut jejak) | Integrasi visual-motor, pra-menulis | Konstruk Beery VMI |
| Tangkap rama-rama (ketik sasaran bergerak; lebah di tahap 3) | Penjejakan visual, koordinasi mata-tangan, inhibisi | OTPF-4 *Reaches, Coordinates* |
| Pondok rehat (pernafasan belon) | Regulasi diri | Strategi bertenang, dicadangkan bila murid rasa risau atau marah |
| Semak perasaan masuk dan keluar | Regulasi emosi | Selari dengan konsep Zones of Regulation |

Turut disertakan:

- **Misi harian:** tiga aktiviti dipilih ikut nama murid dan tarikh. Bila ketiga-tiga selesai, Atuk memberi hadiah dan kampung bertambah satu item (10 item: pokok pisang hingga pokok rambutan besar).
- **Tempoh sesi** pendek, sederhana atau panjang (contohnya 5, 8 atau 12 pasu), dipilih di skrin mula.
- **Kesukaran adaptif:** dua kejayaan berturut-turut menaikkan tahap, dua kesukaran berturut-turut menurunkannya. Rekod menyimpan tahap mula, tertinggi dan akhir.

- Tujuh watak berbilang kaum berpakaian tradisional Malaysia.
- Dwibahasa BM / EN, dengan arahan suara mengikut suara yang ada pada peranti.
- Mod mesra buta warna (palet Okabe-Ito dan nama buah dalam arahan).
- Bunyi suasana kampung yang dijana kod, boleh dimatikan.
- Persetujuan ibu bapa PDPA, mod tanpa rekod, tarik balik dan padam.
- Mod Induk: analisis tujuh domain, cadangan aktiviti, catatan OT, salin laporan, eksport dan import sandaran.

## Cara menjalankan

Permainan ialah **satu fail `index.html`** di akar repositori, sama seperti Pulau Ilmu. Fon Baloo 2 dan Three.js r128 dibenam terus ke dalam fail, jadi ia berfungsi tanpa internet selepas dimuat. GitHub Pages menghoskan fail ini terus dari cabang `main`.

```bash
node scripts/build.mjs                # bina index.html daripada src/ (selepas mengubah kod)
python3 -m http.server 8080           # uji di http://localhost:8080
```

Selepas mengubah apa-apa dalam `src/`, jalankan `node scripts/build.mjs`, uji, kemudian commit `index.html` bersama perubahan `src/`.

### Three.js

Three.js **r128** disimpan dalam `vendor/three.r128.min.js` (lesen MIT, `vendor/LICENSE-three.txt`). Versi ini dikekalkan kerana versi terkemudian membuang binaan UMD yang digunakan. Jika fail vendor dibuang, skrip bina kembali kepada pemuat CDN.

## Struktur folder

```
index.html            hasil binaan, dihoskan oleh GitHub Pages (jangan edit terus)
src/index.html        templat HTML
src/style.css         gaya
src/fonts/            fon Baloo 2 (OFL) yang dibenam
src/js/00-...js       modul permainan, digabung ikut urutan nombor
scripts/build.mjs     membina index.html (tanpa pakej luaran)
tests/simulasi.js     simulasi satu hari permainan
vendor/               Three.js r128 dan lesennya
```

Modul `src/js`: `01-bahasa-dan-data` (kamus BM/EN, warna, tahap, stesen), `02` hingga `04` (bunyi dan suara), `05-dunia-3d`, `06-watak`, `07-buah`, `08-hab-kampung`, `09-rekod-dan-ringkasan`, `10` hingga `12` (tiga stesen), `13-semak-perasaan`, `14-kawalan`, `15-menu`, `16-persetujuan-pdpa`, `17-mod-induk`, `18-gelung`.

## Ujian

```bash
node scripts/build.mjs
node tests/simulasi.js                    # Bahasa Melayu, Three.js palsu (pantas)
LANGX=en node tests/simulasi.js           # English
REAL3=1 node tests/simulasi.js            # dengan Three.js r128 sebenar (hanya pemaparan digantikan)
```

Simulasi memainkan satu hari penuh: persetujuan, tiga stesen, mod buta warna, PIN Mod Induk, laporan, eksport dan import, serta tarik balik persetujuan.

## Menambah atau mengubah teks

Semua teks yang dilihat pengguna ditulis dalam Bahasa Melayu dan dibalut dengan `T('...')`. Terjemahan Inggeris berada dalam objek `EN` (teks dalam kod) dan `EN_HTML` (teks HTML statik) dalam `src/js/01-bahasa-dan-data.js`. Teks baru tanpa terjemahan akan dipaparkan dalam Bahasa Melayu dalam mod EN.

## Data dan privasi

- **Tiada data dihantar ke internet.** Polisi keselamatan kandungan (CSP) dalam `index.html` menyekat semua sambungan keluar, sama seperti Pulau Ilmu.
- Semua rekod disimpan dalam `localStorage` pelayar peranti itu sahaja.
- Rekod hanya disimpan selepas ibu bapa atau penjaga memberi persetujuan nyata. Lihat [PRIVASI.md](PRIVASI.md).
- PIN Mod Induk disimpan sebagai cincangan SHA-256. Ia menghalang kanak-kanak daripada membuka analisis, tetapi bukan perlindungan keselamatan sebenar terhadap orang yang mahir teknikal.
- Setiap rekod membawa nombor versi permainan (`v`).
- PIN dikunci 30 saat selepas 5 cubaan salah (berganda setiap kali, maksimum 1 jam).
- Fail import diperiksa: saiz maksimum 5 MB, maksimum 2000 rekod, medan tidak dikenali dibuang dan semua teks dipaparkan sebagai teks biasa.
- Nama kanak-kanak tidak dibacakan oleh suara, kerana sesetengah suara pelayar diproses di awan.
- Semakan keselamatan 0.10.1: tiada `eval`, tiada skrip luar, Three.js r128 tidak terjejas oleh CVE yang diketahui untuk ciri yang digunakan.

## Batasan diketahui

- Ambang status analisis belum disahkan secara empirik.
- Belum diuji meluas pada pelbagai jenis tablet.
- Tiada akaun atau pelayan; sandaran perlu dibuat secara manual melalui eksport.

## Pembangun

Mohd Ikmal (pembangun), dengan input klinikal daripada jurupulih carakerja. Dibina dengan bantuan Claude.

## Lesen

Kod permainan: hak cipta terpelihara, lihat [LICENSE](LICENSE). Three.js: MIT (`vendor/LICENSE-three.txt`). Fon Baloo 2: SIL Open Font License 1.1 (`src/fonts/OFL-Baloo2.txt`).

---

## English summary

Kampung Atuk is a 3D web game for paediatric occupational therapy. Children spend a day in Atuk's kampung: a feelings check-in, picking fruit by colour or by multi-step instructions, watering flowers (graded hold-and-release), and tracing a hen's footprints (visual-motor integration). A PIN-locked Parent Mode analyses each child across six domains guided by OTPF-4, Beery VMI constructs, executive function and the Zones of Regulation concept.

The whole game is one self-contained `index.html` (fonts and Three.js embedded, strict CSP, no outbound connections), served by GitHub Pages. Rebuild with `node scripts/build.mjs` and test with `node tests/simulasi.js`. Version 0.10.0 adds daily missions with a growing kampung, selectable session length, adaptive difficulty, a butterfly-catching station (visual tracking, eye-hand coordination, inhibition) and a breathing rest hut. The interface switches between Bahasa Melayu and English. This is a prototype for expert review, not a diagnostic tool. All rights reserved.
