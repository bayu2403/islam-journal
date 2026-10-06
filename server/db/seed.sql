-- Seed: 8 duas + system templates. Run AFTER schema.sql. Idempotent via on conflict.

insert into public.duas (slug, arabic, latin, translations, time_category) values
('doa-bangun-tidur',
 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
 'Alhamdulillahilladzi ahyana ba''da ma amatana wa ilaihin nusyur',
 '{"id":"Segala puji bagi Allah yang telah menghidupkan kami setelah mematikan kami, dan kepada-Nya kami dibangkitkan.","en":"All praise is for Allah who gave us life after having taken it from us, and unto Him is the resurrection.","ms":"Segala puji bagi Allah yang menghidupkan kami selepas mematikan kami, dan kepada-Nya kami dibangkitkan."}',
 'morning'),
('doa-sebelum-makan',
 'اللَّهُمَّ بَارِكْ لَنَا فِيمَا رَزَقْتَنَا وَقِنَا عَذَابَ النَّارِ',
 'Allahumma barik lana fima razaqtana wa qina ''adzaban-nar',
 '{"id":"Ya Allah, berkahilah kami pada apa yang Engkau rezekikan kepada kami dan peliharalah kami dari siksa neraka.","en":"O Allah, bless us in what You have provided us and protect us from the punishment of the Fire.","ms":"Ya Allah, berkatilah kami pada rezeki yang Engkau kurniakan dan peliharalah kami daripada azab neraka."}',
 'any'),
('doa-belajar',
 'رَبِّ زِدْنِي عِلْمًا وَارْزُقْنِي فَهْمًا',
 'Rabbi zidni ''ilman warzuqni fahman',
 '{"id":"Ya Tuhanku, tambahkanlah ilmuku dan berilah aku pemahaman.","en":"My Lord, increase me in knowledge and grant me understanding.","ms":"Wahai Tuhanku, tambahkanlah ilmuku dan kurniakanlah aku kefahaman."}',
 'any'),
('dzikir-petang',
 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ',
 'Amsaina wa amsal mulku lillah walhamdulillah, la ilaha illallah wahdahu la syarika lah',
 '{"id":"Kami memasuki waktu petang dan kerajaan hanya milik Allah, segala puji bagi Allah. Tiada tuhan selain Allah semata, tiada sekutu bagi-Nya.","en":"We have entered the evening and the dominion belongs to Allah, and all praise is for Allah. None has the right to be worshipped except Allah alone, without partner.","ms":"Kami memasuki waktu petang dan kerajaan adalah milik Allah, segala puji bagi Allah. Tiada tuhan melainkan Allah yang Esa, tiada sekutu bagi-Nya."}',
 'evening'),
('doa-maghrib',
 'اللَّهُمَّ هَذَا إِقْبَالُ لَيْلِكَ وَإِدْبَارُ نَهَارِكَ وَأَصْوَاتُ دُعَاتِكَ فَاغْفِرْ لِي',
 'Allahumma hadza iqbalu lailika wa idbaru naharika wa ashwatu du''atika faghfir li',
 '{"id":"Ya Allah, inilah saat datangnya malam-Mu dan perginya siang-Mu serta suara para penyeru-Mu, maka ampunilah aku.","en":"O Allah, this is the approach of Your night and the retreat of Your day and the voices of Your callers, so forgive me.","ms":"Ya Allah, inilah kedatangan malam-Mu dan pemergian siang-Mu serta suara para penyeru-Mu, maka ampunilah aku."}',
 'evening'),
('doa-tidur',
 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
 'Bismika Allahumma amutu wa ahya',
 '{"id":"Dengan nama-Mu ya Allah aku mati dan aku hidup.","en":"In Your name, O Allah, I die and I live.","ms":"Dengan nama-Mu ya Allah aku mati dan aku hidup."}',
 'night'),
('doa-orang-tua',
 'رَبِّ اغْفِرْ لِي وَلِوَالِدَيَّ وَارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا',
 'Rabbighfir li wa liwalidayya warhamhuma kama rabbayani shaghira',
 '{"id":"Ya Tuhanku, ampunilah aku dan kedua orang tuaku, dan sayangilah keduanya sebagaimana mereka mendidikku waktu kecil.","en":"My Lord, forgive me and my parents, and have mercy upon them as they brought me up when I was small.","ms":"Wahai Tuhanku, ampunilah aku dan kedua ibu bapaku, dan rahmatilah mereka sebagaimana mereka memeliharaku sewaktu kecil."}',
 'any'),
('doa-masuk-masjid',
 'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ',
 'Allahummaftah li abwaba rahmatik',
 '{"id":"Ya Allah, bukakanlah untukku pintu-pintu rahmat-Mu.","en":"O Allah, open for me the doors of Your mercy.","ms":"Ya Allah, bukakanlah untukku pintu-pintu rahmat-Mu."}',
 'any')
on conflict (slug) do nothing;

-- System templates. name/title columns hold i18n keys (resolved client-side).
-- Fixed UUIDs so reseeding stays idempotent.
insert into public.templates (id, owner_id, kind, name) values
('00000000-0000-0000-0000-000000000001', null, 'group',  'SystemTemplates.subuhRoutine'),
('00000000-0000-0000-0000-000000000002', null, 'group',  'SystemTemplates.malamRoutine'),
('00000000-0000-0000-0000-000000000011', null, 'single', 'SystemTemplates.shalatDhuha'),
('00000000-0000-0000-0000-000000000012', null, 'single', 'SystemTemplates.tilawahQuran'),
('00000000-0000-0000-0000-000000000013', null, 'single', 'SystemTemplates.shalatTahajud'),
('00000000-0000-0000-0000-000000000014', null, 'single', 'SystemTemplates.bersedekah')
on conflict (id) do nothing;

insert into public.template_items (id, template_id, title, sort_order) values
('00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0000-000000000001', 'SystemTemplates.tahajud',      0),
('00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000001', 'SystemTemplates.subuh',        1),
('00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000001', 'SystemTemplates.dzikirPagi',   2),
('00000000-0000-0000-0001-000000000004', '00000000-0000-0000-0000-000000000001', 'SystemTemplates.bacaQuran',    3),
('00000000-0000-0000-0001-000000000005', '00000000-0000-0000-0000-000000000002', 'SystemTemplates.maghrib',      0),
('00000000-0000-0000-0001-000000000006', '00000000-0000-0000-0000-000000000002', 'SystemTemplates.dzikirPetang', 1),
('00000000-0000-0000-0001-000000000007', '00000000-0000-0000-0000-000000000002', 'SystemTemplates.isya',         2),
('00000000-0000-0000-0001-000000000008', '00000000-0000-0000-0000-000000000002', 'SystemTemplates.doaTidur',     3),
('00000000-0000-0000-0001-000000000011', '00000000-0000-0000-0000-000000000011', 'SystemTemplates.shalatDhuha',  0),
('00000000-0000-0000-0001-000000000012', '00000000-0000-0000-0000-000000000012', 'SystemTemplates.tilawahQuran', 0),
('00000000-0000-0000-0001-000000000013', '00000000-0000-0000-0000-000000000013', 'SystemTemplates.shalatTahajud',0),
('00000000-0000-0000-0001-000000000014', '00000000-0000-0000-0000-000000000014', 'SystemTemplates.bersedekah',   0)
on conflict (id) do nothing;
