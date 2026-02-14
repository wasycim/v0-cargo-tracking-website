export type CargoStatus = "yuklenecek" | "giden" | "teslim" | "iptal"

export interface Cargo {
  id: string
  status: CargoStatus
  trackingNo: string
  pieces: number
  sender: string
  senderTelefon?: string
  receiver: string
  receiverTelefon?: string
  from: string
  fromCity: string
  to: string
  toCity: string
  amount: number
  departureDate: string
  departureTime: string
  arrivalDate: string
  arrivalTime: string
  plate: string
  firma?: string
  aracTelefon?: string
  createdAt?: string
}

export const statusLabels: Record<CargoStatus, string> = {
  yuklenecek: "Yüklenecek",
  giden: "Giden",
  teslim: "Teslim",
  iptal: "İptal",
}

export const statusColors: Record<CargoStatus, { bg: string; text: string; border: string }> = {
  yuklenecek: { bg: "bg-card", text: "text-cargo-green", border: "border-cargo-green" },
  giden: { bg: "bg-cargo-dark", text: "text-white", border: "border-cargo-dark" },
  teslim: { bg: "bg-emerald-600", text: "text-white", border: "border-emerald-600" },
  iptal: { bg: "bg-red-500", text: "text-white", border: "border-red-500" },
}

// Turkey cities and districts for location picker
export const turkeyLocations: Record<string, string[]> = {
  "Adana": ["Seyhan", "Çukurova", "Yüreğir", "Sarıçam", "Ceyhan", "Kozan"],
  "Adıyaman": ["Merkez", "Besni", "Kahta", "Gölbaşı"],
  "Afyonkarahisar": ["Merkez", "Sandıklı", "Bolvadin", "Dinar"],
  "Ağrı": ["Merkez", "Doğubayazıt", "Patnos", "Diyadin"],
  "Aksaray": ["Merkez", "Ortaköy", "Güzelyurt"],
  "Amasya": ["Merkez", "Merzifon", "Suluova"],
  "Ankara": ["Çankaya", "Keçiören", "Mamak", "Etimesgut", "Sincan", "Yenimahalle", "Altındağ", "Polatlı", "Pursaklar"],
  "Antalya": ["Muratpaşa", "Konyaaltı", "Kepez", "Aksu", "Alanya", "Manavgat", "Kemer", "Serik", "Kaş", "Side"],
  "Ardahan": ["Merkez", "Göle", "Hanak"],
  "Artvin": ["Merkez", "Hopa", "Borçka", "Arhavi"],
  "Aydın": ["Efeler", "Nazilli", "Söke", "Kuşadası", "Didim", "İncirliova", "Germencik", "Bozdoğan"],
  "Balıkesir": ["Altıeylül", "Karesi", "Bandırma", "Edremit", "Gönen", "Burhaniye", "Ayvalık"],
  "Bartın": ["Merkez", "Amasra"],
  "Batman": ["Merkez", "Kozluk", "Sason"],
  "Bayburt": ["Merkez"],
  "Bilecik": ["Merkez", "Bozüyük", "Söğüt"],
  "Bingöl": ["Merkez", "Genç", "Karlıova", "Solhan"],
  "Bitlis": ["Merkez", "Tatvan", "Ahlat"],
  "Bolu": ["Merkez", "Gerede", "Mudurnu"],
  "Burdur": ["Merkez", "Bucak", "Gölhisar"],
  "Bursa": ["Osmangazi", "Nilüfer", "Yıldırım", "Görükle", "Mudanya", "Gemlik", "İnegöl", "Orhangazi", "Karacabey"],
  "Çanakkale": ["Merkez", "Biga", "Çan", "Gelibolu"],
  "Çankırı": ["Merkez", "Çerkeş", "Ilgaz"],
  "Çorum": ["Merkez", "Sungurlu", "Osmancık", "İskilip", "Alaca"],
  "Denizli": ["Merkezefendi", "Pamukkale", "Acıpayam", "Çivril", "Tavas"],
  "Diyarbakır": ["Bağlar", "Kayapınar", "Sur", "Yenişehir", "Ergani", "Bismil", "Silvan"],
  "Düzce": ["Merkez", "Akçakoca", "Gölyaka"],
  "Edirne": ["Merkez", "Keşan", "Uzunköprü"],
  "Elazığ": ["Merkez", "Karakoçan", "Kovancılar"],
  "Erzincan": ["Merkez", "Üzümlü", "Tercan"],
  "Erzurum": ["Yakutiye", "Palandöken", "Aziziye", "Oltu", "Horasan", "İspir"],
  "Eskişehir": ["Odunpazarı", "Tepebaşı", "Sivrihisar"],
  "Gaziantep": ["Şahinbey", "Şehitkâmil", "Nizip", "İslahiye", "Oğuzeli"],
  "Giresun": ["Merkez", "Bulancak", "Görele"],
  "Gümüşhane": ["Merkez", "Kelkit", "Torul"],
  "Hakkâri": ["Merkez", "Yüksekova", "Şemdinli", "Çukurca"],
  "Hatay": ["Antakya", "İskenderun", "Defne", "Dörtyol", "Samandağ", "Reyhanlı", "Kırıkhan"],
  "Iğdır": ["Merkez", "Tuzluca"],
  "Isparta": ["Merkez", "Eğirdir", "Yalvaç", "Şarkikaraağaç"],
  "İstanbul": ["Kadıköy", "Beşiktaş", "Üsküdar", "Fatih", "Bakırköy", "Şişli", "Beyoğlu", "Ataşehir", "Maltepe", "Kartal", "Pendik", "Tuzla", "Sultanbeyli", "Ümraniye", "Sancaktepe", "Çekmeköy", "Beylikdüzü", "Esenyurt", "Avcılar", "Başakşehir", "Bahçelievler", "Bağcılar", "Esenler", "Güngören", "Zeytinburnu", "Eyüpsultan", "Kâğıthane", "Sarıyer", "Beykoz", "Silivri", "Büyükçekmece", "Çatalca"],
  "İzmir": ["Konak", "Karşıyaka", "Bornova", "Buca", "Bayraklı", "Çiğli", "Gaziemir", "Karabağlar", "Menemen", "Torbalı", "Ödemiş", "Tire", "Bergama", "Aliağa", "Urla", "Çeşme", "Seferihisar"],
  "Kahramanmaraş": ["Onikişubat", "Dulkadiroğlu", "Elbistan", "Afşin", "Türkoğlu"],
  "Karabük": ["Merkez", "Safranbolu"],
  "Karaman": ["Merkez", "Ermenek"],
  "Kars": ["Merkez", "Sarıkamış", "Kağızman"],
  "Kastamonu": ["Merkez", "Tosya", "Taşköprü", "İnebolu"],
  "Kayseri": ["Melikgazi", "Kocasinan", "Talas", "Hacılar", "İncesu", "Develi"],
  "Kilis": ["Merkez"],
  "Kırıkkale": ["Merkez", "Keskin", "Delice"],
  "Kırklareli": ["Merkez", "Lüleburgaz", "Babaeski"],
  "Kırşehir": ["Merkez", "Kaman", "Mucur"],
  "Kocaeli": ["İzmit", "Gebze", "Darıca", "Körfez", "Dilovası", "Çayırova", "Gölcük", "Kartepe", "Başiskele", "Derince", "Kandıra"],
  "Konya": ["Selçuklu", "Meram", "Karatay", "Ereğli", "Akşehir", "Beyşehir", "Cihanbeyli", "Seydişehir"],
  "Kütahya": ["Merkez", "Tavşanlı", "Simav", "Gediz"],
  "Malatya": ["Battalgazi", "Yeşilyurt", "Doğanşehir", "Akçadağ"],
  "Manisa": ["Yunusemre", "Şehzadeler", "Akhisar", "Turgutlu", "Salihli", "Soma", "Alaşehir"],
  "Mardin": ["Artuklu", "Kızıltepe", "Midyat", "Nusaybin", "Derik"],
  "Mersin": ["Akdeniz", "Mezitli", "Toroslar", "Yenişehir", "Tarsus", "Erdemli", "Silifke", "Anamur"],
  "Muğla": ["Menteşe", "Bodrum", "Fethiye", "Marmaris", "Dalaman", "Milas", "Ortaca", "Datça", "Köyceğiz"],
  "Muş": ["Merkez", "Bulanık", "Malazgirt", "Varto"],
  "Nevşehir": ["Merkez", "Ürgüp", "Avanos", "Kozaklı"],
  "Niğde": ["Merkez", "Bor", "Ulukışla"],
  "Ordu": ["Altınordu", "Ünye", "Fatsa", "Perşembe"],
  "Osmaniye": ["Merkez", "Kadirli", "Düziçi"],
  "Rize": ["Merkez", "Çayeli", "Ardeşen", "Pazar"],
  "Sakarya": ["Adapazarı", "Serdivan", "Hendek", "Akyazı", "Geyve", "Sapanca"],
  "Samsun": ["İlkadım", "Atakum", "Canik", "Tekkeköy", "Bafra", "Çarşamba", "Terme", "Vezirköprü"],
  "Şanlıurfa": ["Haliliye", "Eyyübiye", "Karaköprü", "Siverek", "Viranşehir", "Suruç", "Akçakale"],
  "Siirt": ["Merkez", "Kurtalan", "Baykan"],
  "Sinop": ["Merkez", "Boyabat", "Gerze"],
  "Sivas": ["Merkez", "Şarkışla", "Suşehri", "Zara", "Gemerek"],
  "Şırnak": ["Merkez", "Cizre", "Silopi", "İdil"],
  "Tekirdağ": ["Süleymanpaşa", "Çorlu", "Çerkezköy", "Kapaklı", "Malkara"],
  "Tokat": ["Merkez", "Turhal", "Erbaa", "Niksar", "Zile"],
  "Trabzon": ["Ortahisar", "Akçaabat", "Araklı", "Of", "Sürmene", "Vakfıkebir", "Maçka"],
  "Tunceli": ["Merkez", "Pertek", "Hozat"],
  "Uşak": ["Merkez", "Banaz", "Eşme", "Sivaslı"],
  "Van": ["İpekyolu", "Tuşba", "Edremit", "Erciş", "Başkale"],
  "Yalova": ["Merkez", "Termal", "Çınarcık", "Altınova"],
  "Yozgat": ["Merkez", "Sorgun", "Boğazlıyan", "Akdağmadeni"],
  "Zonguldak": ["Merkez", "Ereğli", "Devrek", "Çaycuma", "Alaplı"],
}

// No mock data - start with empty cargos
export const mockCargos: Cargo[] = []
