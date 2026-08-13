"""Menyiapkan foto tim untuk halaman Tentang Kami.

Masukan berupa pas foto studio mentah; keluarannya berkas WebP ber-alpha di
public/team/ yang siap dipakai langsung oleh AboutView.

Empat tahap:

1. Pangkas ke 3:4 dengan bingkai setengah badan. Kotak pangkasnya ditulis
   eksplisit per orang — tidak ada deteksi wajah di sini, angkanya diukur
   manual dan boleh digeser kalau hasilnya meleset.
2. Lepas latar studio. Latar merah dipisah lewat kejenuhan warna; latar putih
   lewat rona, karena kecerahannya nyaris sama dengan jas krem. Sumber yang
   sudah ber-alpha (bg "alpha") melewati tahap ini.
3. Rapikan matte: ratakan gerigi, kikis tepi, buang bercak yang tidak menempel
   ke badan, lalu redam tumpahan warna latar di piksel tepi.
4. Samakan bingkai: lebar kepala diseragamkan dan ubun-ubun ditaruh pada tinggi
   yang sama, di kanvas 4:5. Tanpa tahap ini ukuran kepala di ketiga kartu
   tidak sepadan, karena proporsi badan tiap foto berbeda.

Jalankan:  python scripts/prepare-team-photos.py [folder-sumber]
"""

import os
import sys

import numpy as np
from PIL import Image, ImageFilter

SRC = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser("~/Downloads")
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "team")

# Kanvas keluaran, 4:5. Lebar kepala disamakan ke HEAD_W, ubun-ubun di HEAD_TOP.
CANVAS_W, CANVAS_H = 640, 800
HEAD_W, HEAD_TOP = 250, 58

JOBS = [
    {
        "src": "Zefania Priscila.jpeg",
        "slug": "zefania-priscila",
        "crop": (55, 191, 2261, 3132),  # dari sumber 2316x3480
        "width": 720,
        "bg": "red",
        "smooth": 0.0,  # rambut halus — perataan agresif akan menggumpalkannya
    },
    {
        # Sumber ini sudah dilepas latarnya di luar skrip, jadi tahap matte
        # dilewati. Hasilnya jauh lebih bersih di tepi hijab daripada saat kami
        # memisahkan latar putihnya sendiri — margin rona di sana cuma 1-2 poin.
        "src": "risyahhdnobg.png",
        "slug": "risyah-eka-setyaningrum",
        "crop": None,  # sumber 2706x3480, nyaris 3:4
        # Pose berdiri sebadan penuh: kepalanya kecil terhadap bingkai, jadi
        # resolusi kerja dinaikkan sampai lebar kepala mendekati HEAD_W. Kalau
        # dirender di 640 seperti kanvas, penyeragaman kepala harus memperbesar
        # ~1,9x dan tepinya jadi lunak.
        "width": 1200,
        "bg": "alpha",
        "smooth": 0.0,
    },
    {
        "src": "Sarah Putri Nashira.png",
        "slug": "sarah-putri-nashira",
        "crop": None,  # sumber 354x472 sudah tepat 3:4
        "width": 354,
        "bg": "red",
        "smooth": 0.0,
        # Kepalanya kecil terhadap badan, jadi menyamakan lebar kepala ke ukuran
        # penuh membuat bahunya terpotong kedua tepi kanvas. Dikecilkan sedikit
        # supaya bahu masuk utuh; kepala jadi ~10% lebih kecil dari dua kartu
        # lain, dan itu pilihan yang disengaja.
        "zoom": 0.88,
    },
    {
        # Sumber lama foto ruangan berlatar dinding, dan pemisahannya di sini
        # menyisakan gerigi di bahu. Diganti sumber yang sudah ber-alpha dan
        # jauh lebih besar, jadi seluruh tahap matte dilewati.
        "src": "maspipinobg.png",
        "slug": "satriyo-priyo-adi",
        "crop": None,  # sumber 1118x1484, praktis 3:4
        "width": 620,  # dipilih supaya lebar kepala x zoom jatuh dekat HEAD_W
        "bg": "alpha",
        "smooth": 0.0,
        # Kebalikan dari Sarah: ini potret sebatas dada, bukan setengah badan.
        # Pada ukuran kepala yang sama, badannya berhenti seperempat kanvas dari
        # dasar dan kartunya jadi banyak ruang kosong. Dibesarkan sampai penuh —
        # bahunya sedikit terpotong tepi, sama seperti di foto aslinya.
        "zoom": 1.32,
    },
]


# --------------------------------------------------------------------------- #
# Masker latar
# --------------------------------------------------------------------------- #


def mask_red(a):
    """Merah studio sangat jenuh; kulit, rambut, dan jas krem tidak. Batas kedua
    (kanal lain harus gelap) menjaga warna bibir dan logo tetap aman."""
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    mx = np.maximum(g, b)
    return (r - mx > 100) & (mx < 120)


def mask_white(a, th=(210, 5, 200, 0)):
    """Latar putih studio hampir sama terangnya dengan jas krem, jadi kecerahan
    saja tidak memisahkan. Pembedanya rona: latar condong biru (B > R),
    sedangkan jas, hijab, dan kulit selalu condong hangat (R > B).

    Marginnya tipis. Latar terukur b - r = +6 hampir rata di seluruh bidang,
    sedangkan sorot paling terang di mahkota hijab mentok di +4. Ambang +5
    memisahkan keduanya; di bawah itu mahkota hijab ikut terpotong.

    Dikembalikan dua ambang: yang ketat dipakai sebagai benih, yang longgar
    sebagai batas tumbuh untuk menghabisi bayangan latar di dekat bahu.

    Angkanya di atas berlaku untuk latar studio yang terang benderang. Foto
    dengan latar lebih redup memberi ambangnya sendiri lewat `th`.
    """
    smin, shue, lmin, lhue = th
    r, b = a[..., 0], a[..., 2]
    mn = a.min(axis=2)
    strict = (mn > smin) & (b - r >= shue)
    loose = (mn > lmin) & (b - r >= lhue)
    return strict, loose


# --------------------------------------------------------------------------- #
# Operasi biner
# --------------------------------------------------------------------------- #


def dilate(m):
    d = m.copy()
    d[1:, :] |= m[:-1, :]
    d[:-1, :] |= m[1:, :]
    d[:, 1:] |= m[:, :-1]
    d[:, :-1] |= m[:, 1:]
    return d


def erode(m):
    return ~dilate(~m)


def grow_from(seed, limit):
    """Tumbuhkan benih sampai berhenti, dibatasi masker `limit`."""
    while True:
        before = int(seed.sum())
        seed = dilate(seed) & limit
        if int(seed.sum()) == before:
            return seed


def border_connected(mask):
    """Hanya bagian masker yang menyentuh tepi bingkai yang dianggap latar.
    Kemeja putih di dalam jas dan merah pada logo tidak menyentuh tepi, jadi
    keduanya selamat."""
    seed = np.zeros_like(mask)
    seed[0, :] = mask[0, :]
    seed[-1, :] = mask[-1, :]
    seed[:, 0] = mask[:, 0]
    seed[:, -1] = mask[:, -1]
    return grow_from(seed, mask)


def keep_main(subj):
    """Ambil gumpalan subjek yang menyentuh tepi bawah — di ketiga foto badan
    selalu terpotong bingkai bawah. Bercak derau di bidang latar dibuang."""
    seed = np.zeros_like(subj)
    seed[-1, :] = subj[-1, :]
    return grow_from(seed, subj)


# --------------------------------------------------------------------------- #


def crop_34(im, box, width):
    """Pangkas ke kotak yang diminta lalu rapatkan ke 3:4 dan skalakan."""
    if box:
        im = im.crop(box)

    cw, ch = im.size
    target_h = round(cw * 4 / 3)
    if target_h <= ch:
        top = (ch - target_h) // 2
        im = im.crop((0, top, cw, top + target_h))
    else:
        target_w = round(ch * 3 / 4)
        left = (cw - target_w) // 2
        im = im.crop((left, 0, left + target_w, ch))

    return im.resize((width, round(width * 4 / 3)), Image.LANCZOS)


def matte(a, job):
    """Kembalikan alpha 0..255 untuk siluet subjek."""
    if job["bg"] == "red":
        bg = border_connected(mask_red(a))
    else:
        strict, loose = mask_white(a, job.get("white_th", (210, 5, 200, 0)))

        # Kotak sapuan: di dalamnya, apa pun yang tidak gelap dan tidak hangat
        # dianggap latar. Dipakai untuk satu-dua bercak latar yang warnanya
        # kebetulan jatuh di luar ambang — sama seperti kotak pangkas di atas,
        # angkanya diukur manual pada resolusi kerja (`width` x 4/3 width).
        wipe = job.get("wipe", [])
        if wipe:
            free = (a.min(axis=2) > 85) & (a[..., 0] - a[..., 2] < 25)
            for x0, y0, x1, y1 in wipe:
                strict[y0:y1, x0:x1] |= free[y0:y1, x0:x1]
                loose[y0:y1, x0:x1] |= free[y0:y1, x0:x1]

        bg = border_connected(strict)
        # Rambatan longgar dibatasi jarak dari hasil ketat. Tanpa batas itu,
        # sorot cahaya di hijab lolos ambang longgar dan ikut terhapus — dan
        # pada foto berlatar ruangan, rambatannya menembus wajah lewat piksel
        # tepi yang nyaris netral lalu menghabiskan seluruh kepala.
        for _ in range(job.get("grow", 2)):
            bg = dilate(bg) & loose

    bg = ~keep_main(~bg)
    alpha = Image.fromarray(((~bg) * 255).astype(np.uint8), "L")

    smooth = job["smooth"]
    if smooth:
        # Sorot cahaya di mahkota hijab nyaris seterang latarnya, jadi batasnya
        # di sana penuh gerigi. Blur lalu ambang-ulang membuang tonjolan yang
        # lebih kecil dari radiusnya tanpa menggeser garis besar bentuknya.
        sm = np.asarray(alpha.filter(ImageFilter.GaussianBlur(smooth))) > 128
        # Kikis dua piksel: batas kain dan latar putih melewati beberapa piksel
        # campuran yang tetap terang, dan sisanya terbaca sebagai garis putih
        # mengelilingi siluet.
        sm = erode(erode(sm))
        alpha = Image.fromarray((sm * 255).astype(np.uint8), "L")

    # Lembutkan lalu tarik masuk sedikit, supaya tepi rambut tidak menyisakan
    # garis warna latar selebar satu-dua piksel.
    alpha = alpha.filter(ImageFilter.GaussianBlur(1.1))
    return np.clip((np.asarray(alpha).astype(np.float32) - 92) * 1.9, 0, 255)


def normalize(cut, zoom=1.0):
    """Paskan siluet ke kanvas seragam, berpatokan pada kepala."""
    cut = cut.crop(cut.getchannel("A").getbbox())

    m = np.asarray(cut.getchannel("A")) > 128
    # Baris teratas hasil bbox masih tepi yang dilembutkan, alpha-nya di bawah
    # ambang. Pita kepala diukur dari baris padat pertama, bukan dari baris nol.
    top = int(np.argmax(m.any(axis=1)))
    band = m[top : top + max(2, round(m.shape[0] * 0.17))]
    cols = np.where(band.any(axis=0))[0]
    head_w = cols[-1] - cols[0] + 1
    head_cx = (cols[-1] + cols[0]) / 2

    scale = HEAD_W * zoom / head_w
    cut = cut.resize(
        (max(1, round(cut.width * scale)), max(1, round(cut.height * scale))),
        Image.LANCZOS,
    )

    y = HEAD_TOP - round(top * scale)
    # Kartu memasang foto dengan object-bottom, jadi sisa ruang di kaki kanvas
    # akan terbaca sebagai siluet yang melayang. Untuk yang diperkecil, badannya
    # digeser turun sampai menyentuh dasar; kepala ikut turun, dan justru itu
    # yang membuatnya terbaca sebagai bingkai yang lebih lebar, bukan foto kecil.
    y += max(0, CANVAS_H - (y + cut.height))

    # paste, bukan alpha_composite: hanya paste yang menerima koordinat negatif,
    # dan siluet memang boleh terpotong tepi kanvas.
    canvas = Image.new("RGBA", (CANVAS_W, CANVAS_H), (0, 0, 0, 0))
    canvas.paste(cut, (round(CANVAS_W / 2 - head_cx * scale), y), cut)
    return canvas


def main():
    os.makedirs(OUT, exist_ok=True)

    for job in JOBS:
        path = os.path.join(SRC, job["src"])
        if not os.path.exists(path):
            print(f"lewat: {job['src']} tidak ada di {SRC}")
            continue

        im = crop_34(Image.open(path).convert("RGBA"), job["crop"], job["width"])
        a = np.asarray(im).astype(np.int16)[..., :3]

        if job["bg"] == "alpha":
            av = np.asarray(im.getchannel("A")).astype(np.float32)
        else:
            av = matte(a, job)

        rgb = a.astype(np.float32)
        if job["bg"] == "red":
            # Redam tumpahan merah di pita tepi: merah tidak boleh jauh
            # melampaui kanal lain pada piksel yang setengah tembus.
            edge = (av > 4) & (av < 250)
            mx = np.maximum(rgb[..., 1], rgb[..., 2])
            rgb[..., 0] = np.where(edge, np.minimum(rgb[..., 0], mx * 1.18 + 10), rgb[..., 0])

        cut = Image.fromarray(np.dstack([np.clip(rgb, 0, 255), av]).astype(np.uint8), "RGBA")
        out = os.path.join(OUT, job["slug"] + ".webp")
        normalize(cut, job.get("zoom", 1.0)).save(out, "WEBP", quality=90, method=6)
        print(f"{job['slug']:26s} -> public/team/{job['slug']}.webp  {os.path.getsize(out)//1024} KB")


if __name__ == "__main__":
    main()
