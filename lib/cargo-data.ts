export type CargoStatus = "yuklenecek" | "giden" | "teslim" | "iptal"

export interface Cargo {
  id: string
  status: CargoStatus
  trackingNo: string
  pieces: number
  sender: string
  receiver: string
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
  createdAt?: string
}

export const statusLabels: Record<CargoStatus, string> = {
  yuklenecek: "Yuklenecek",
  giden: "Giden",
  teslim: "Teslim",
  iptal: "Iptal",
}

export const statusColors: Record<CargoStatus, { bg: string; text: string; border: string }> = {
  yuklenecek: { bg: "bg-card", text: "text-cargo-green", border: "border-cargo-green" },
  giden: { bg: "bg-cargo-dark", text: "text-white", border: "border-cargo-dark" },
  teslim: { bg: "bg-emerald-600", text: "text-white", border: "border-emerald-600" },
  iptal: { bg: "bg-red-500", text: "text-white", border: "border-red-500" },
}

// Turkey cities and districts for location picker
export const turkeyLocations: Record<string, string[]> = {
  "Adana": ["Seyhan", "Cukurova", "Yuregir", "Saricam", "Ceyhan", "Kozan"],
  "Adiyaman": ["Merkez", "Besni", "Kahta", "Golbasi"],
  "Afyonkarahisar": ["Merkez", "Sandikli", "Bolvadin", "Dinar"],
  "Agri": ["Merkez", "Dogubayazit", "Patnos", "Diyadin"],
  "Aksaray": ["Merkez", "Ortakoy", "Guzelyurt"],
  "Amasya": ["Merkez", "Merzifon", "Suluova"],
  "Ankara": ["Cankaya", "Kecioren", "Mamak", "Etimesgut", "Sincan", "Yenimahalle", "Altindag", "Polatli", "Pursaklar"],
  "Antalya": ["Muratpasa", "Konyaalti", "Kepez", "Aksu", "Alanya", "Manavgat", "Kemer", "Serik", "Kas", "Side"],
  "Ardahan": ["Merkez", "Gole", "Hanak"],
  "Artvin": ["Merkez", "Hopa", "Borcka", "Arhavi"],
  "Aydin": ["Efeler", "Nazilli", "Soke", "Kusadasi", "Didim", "Incirliova", "Germencik", "Bozdogan"],
  "Balikesir": ["Altieylul", "Karesi", "Bandirma", "Edremit", "Gonen", "Burhaniye", "Ayvalik"],
  "Bartin": ["Merkez", "Amasra"],
  "Batman": ["Merkez", "Kozluk", "Sason"],
  "Bayburt": ["Merkez"],
  "Bilecik": ["Merkez", "Bozuyuk", "Sogut"],
  "Bingol": ["Merkez", "Genc", "Karliova", "Solhan"],
  "Bitlis": ["Merkez", "Tatvan", "Ahlat"],
  "Bolu": ["Merkez", "Gerede", "Mudurnu"],
  "Burdur": ["Merkez", "Bucak", "Golhisar"],
  "Bursa": ["Osmangazi", "Nilufer", "Yildirim", "Gorukle", "Mudanya", "Gemlik", "Inegol", "Orhangazi", "Karacabey"],
  "Canakkale": ["Merkez", "Biga", "Can", "Gelibolu"],
  "Cankiri": ["Merkez", "Cerkes", "Ilgaz"],
  "Corum": ["Merkez", "Sungurlu", "Osmancik", "Iskilip", "Alaca"],
  "Denizli": ["Merkezefendi", "Pamukkale", "Acipayam", "Civril", "Tavas"],
  "Diyarbakir": ["Baglar", "Kayapinar", "Sur", "Yenisehir", "Ergani", "Bismil", "Silvan"],
  "Duzce": ["Merkez", "Akcakoca", "Golyaka"],
  "Edirne": ["Merkez", "Kesan", "Uzunkopru"],
  "Elazig": ["Merkez", "Karakocan", "Kovancılar"],
  "Erzincan": ["Merkez", "Uzumlu", "Tercan"],
  "Erzurum": ["Yakutiye", "Palandoken", "Aziziye", "Oltu", "Horasan", "Ispir"],
  "Eskisehir": ["Odunpazari", "Tepebasi", "Sivrihisar"],
  "Gaziantep": ["Sahinbey", "Sehitkamil", "Nizip", "Islahiye", "Oguzel"],
  "Giresun": ["Merkez", "Bulancak", "Gorele"],
  "Gumushane": ["Merkez", "Kelkit", "Torul"],
  "Hakkari": ["Merkez", "Yuksekova", "Semdinli", "Cukurca"],
  "Hatay": ["Antakya", "Iskenderun", "Defne", "Dortyol", "Samandag", "Reyhanli", "Kirikhan"],
  "Igdir": ["Merkez", "Tuzluca"],
  "Isparta": ["Merkez", "Egirdir", "Yalvac", "Senirkent"],
  "Istanbul": ["Kadikoy", "Besiktas", "Uskudar", "Fatih", "Bakirkoy", "Sisli", "Beyoglu", "Atasehir", "Maltepe", "Kartal", "Pendik", "Tuzla", "Sultanbeyli", "Umraniye", "Sancaktepe", "Cekmekoy", "Beylikduzu", "Esenyurt", "Avcilar", "Basaksehir", "Bahcelievler", "Bagcilar", "Esenler", "Gungoren", "Zeytinburnu", "Eyupsultan", "Kagithane", "Sariyer", "Beykoz", "Silivri", "Buyukcekmece", "Catalca"],
  "Izmir": ["Konak", "Karsiyaka", "Bornova", "Buca", "Bayrakli", "Cigli", "Gaziemir", "Karabaglar", "Menemen", "Torbali", "Odemis", "Tire", "Bergama", "Aliaga", "Urla", "Cesme", "Seferihisar"],
  "Kahramanmaras": ["Onikisubat", "Dulkadiroglu", "Elbistan", "Afsin", "Turkoglu"],
  "Karabuk": ["Merkez", "Safranbolu"],
  "Karaman": ["Merkez", "Ermenek"],
  "Kars": ["Merkez", "Sarikamis", "Kagizman"],
  "Kastamonu": ["Merkez", "Tosya", "Taskopru", "Inebolu"],
  "Kayseri": ["Melikgazi", "Kocasinan", "Talas", "Hacilar", "Incesu", "Develi"],
  "Kilis": ["Merkez"],
  "Kirikkale": ["Merkez", "Keskin", "Delice"],
  "Kirklareli": ["Merkez", "Luleburgaz", "Babaeski"],
  "Kirsehir": ["Merkez", "Kaman", "Mucur"],
  "Kocaeli": ["Izmit", "Gebze", "Darica", "Korfez", "Dilovasi", "Cayirova", "Golcuk", "Kartepe", "Basiskele", "Derince", "Kandira"],
  "Konya": ["Selcuklu", "Meram", "Karatay", "Eregli", "Aksehir", "Beyse", "Cihanbeyli", "Seydisehir"],
  "Kutahya": ["Merkez", "Tavsanli", "Simav", "Gediz"],
  "Malatya": ["Battalgazi", "Yesilyurt", "Dogansehir", "Akcadag"],
  "Manisa": ["Yunusemre", "Sehzadeler", "Akhisar", "Turgutlu", "Salihli", "Soma", "Alasehir"],
  "Mardin": ["Artuklu", "Kiziltepe", "Midyat", "Nusaybin", "Derik"],
  "Mersin": ["Akdeniz", "Mezitli", "Toroslar", "Yenisehir", "Tarsus", "Erdemli", "Silifke", "Anamur"],
  "Mugla": ["Mentese", "Bodrum", "Fethiye", "Marmaris", "Dalaman", "Milas", "Ortaca", "Datca", "Koycegiz"],
  "Mus": ["Merkez", "Bulanik", "Malazgirt", "Varto"],
  "Nevsehir": ["Merkez", "Urgup", "Avanos", "Kozakli"],
  "Nigde": ["Merkez", "Bor", "Ulukisla"],
  "Ordu": ["Altinordu", "Unye", "Fatsa", "Persembe"],
  "Osmaniye": ["Merkez", "Kadirli", "Duzici"],
  "Rize": ["Merkez", "Cayeli", "Ardeşen", "Pazar"],
  "Sakarya": ["Adapazari", "Serdivan", "Hendek", "Akyazi", "Geyve", "Sapanca"],
  "Samsun": ["Ilkadim", "Atakum", "Canik", "Tekkeköy", "Bafra", "Carsamba", "Terme", "Vezirkopru"],
  "Sanliurfa": ["Haliliye", "Eyubiye", "Karakopru", "Siverek", "Viransehir", "Suruc", "Akcakale"],
  "Siirt": ["Merkez", "Kurtalan", "Baykan"],
  "Sinop": ["Merkez", "Boyabat", "Gerze"],
  "Sivas": ["Merkez", "Sarkisla", "Susehri", "Zara", "Gemerek"],
  "Sirnak": ["Merkez", "Cizre", "Silopi", "Idil"],
  "Tekirdag": ["Suleymanpasa", "Corlu", "Cerkezkoy", "Kapaklı", "Malkara"],
  "Tokat": ["Merkez", "Turhal", "Erbaa", "Niksar", "Zile"],
  "Trabzon": ["Ortahisar", "Akcaabat", "Arakli", "Of", "Surmene", "Vakfikebir", "Macka"],
  "Tunceli": ["Merkez", "Pertek", "Hozat"],
  "Usak": ["Merkez", "Banaz", "Esme", "Sivasli"],
  "Van": ["Ipekyolu", "Tusba", "Edremit", "Ercis", "Baskale"],
  "Yalova": ["Merkez", "Termal", "Cinarcik", "Altinova"],
  "Yozgat": ["Merkez", "Sorgun", "Bogazliyan", "Akdagmadeni"],
  "Zonguldak": ["Merkez", "Eregli", "Devrek", "Caycuma", "Alaplı"],
}

// No mock data - start with empty cargos
export const mockCargos: Cargo[] = []
