// Country → State (governorate/province) → City cascading data.
// Coverage: Arab countries (full) + major countries. Easily extensible by adding entries.
// Shape: { value, en, ar, states: [{ value, en, ar, cities: [{ value, en, ar }] }] }

export const COUNTRIES = [
  {
    value: 'SA', en: 'Saudi Arabia', ar: 'المملكة العربية السعودية',
    states: [
      { value: 'riyadh', en: 'Riyadh', ar: 'منطقة الرياض', cities: [
        { value: 'riyadh', en: 'Riyadh', ar: 'الرياض' },
        { value: 'diriyah', en: 'Diriyah', ar: 'الدرعية' },
        { value: 'al_kharj', en: 'Al Kharj', ar: 'الخرج' },
        { value: 'al_majmaah', en: 'Al Majma`ah', ar: 'المجمعة' },
      ] },
      { value: 'makkah', en: 'Makkah', ar: 'منطقة مكة المكرمة', cities: [
        { value: 'makkah', en: 'Makkah', ar: 'مكة المكرمة' },
        { value: 'jeddah', en: 'Jeddah', ar: 'جدة' },
        { value: 'taif', en: 'Taif', ar: 'الطائف' },
        { value: 'rabigh', en: 'Rabigh', ar: 'رابغ' },
      ] },
      { value: 'madinah', en: 'Madinah', ar: 'منطقة المدينة المنورة', cities: [
        { value: 'madinah', en: 'Madinah', ar: 'المدينة المنورة' },
        { value: 'yanbu', en: 'Yanbu', ar: 'ينبع' },
        { value: 'badr', en: 'Badr', ar: 'بدر' },
      ] },
      { value: 'eastern', en: 'Eastern', ar: 'المنطقة الشرقية', cities: [
        { value: 'dammam', en: 'Dammam', ar: 'الدمام' },
        { value: 'khobar', en: 'Khobar', ar: 'الخبر' },
        { value: 'dhahran', en: 'Dhahran', ar: 'الظهران' },
        { value: 'al_jubail', en: 'Al Jubail', ar: 'الجبيل' },
        { value: 'al_ahsa', en: 'Al Ahsa', ar: 'الأحساء' },
        { value: 'qatif', en: 'Qatif', ar: 'القطيف' },
      ] },
      { value: 'asir', en: 'Asir', ar: 'منطقة عسير', cities: [
        { value: 'abha', en: 'Abha', ar: 'أبها' },
        { value: 'khamis_mushait', en: 'Khamis Mushait', ar: 'خميس مشيط' },
        { value: 'bisha', en: 'Bisha', ar: 'بيشة' },
      ] },
      { value: 'qassim', en: 'Qassim', ar: 'منطقة القصيم', cities: [
        { value: 'buraidah', en: 'Buraidah', ar: 'بريدة' },
        { value: 'unaizah', en: 'Unaizah', ar: 'عنيزة' },
        { value: 'al_rass', en: 'Al Rass', ar: 'الرس' },
      ] },
      { value: 'tabuk', en: 'Tabuk', ar: 'منطقة تبوك', cities: [
        { value: 'tabuk', en: 'Tabuk', ar: 'تبوك' },
        { value: 'duba', en: 'Duba', ar: 'ضبا' },
      ] },
      { value: 'hail', en: 'Hail', ar: 'منطقة حائل', cities: [
        { value: 'hail', en: 'Hail', ar: 'حائل' },
      ] },
      { value: 'jazan', en: 'Jazan', ar: 'منطقة جازان', cities: [
        { value: 'jazan', en: 'Jazan', ar: 'جازان' },
        { value: 'sabiya', en: 'Sabya', ar: 'صبية' },
      ] },
      { value: 'najran', en: 'Najran', ar: 'منطقة نجران', cities: [
        { value: 'najran', en: 'Najran', ar: 'نجران' },
      ] },
      { value: 'northern', en: 'Northern Borders', ar: 'منطقة الحدود الشمالية', cities: [
        { value: 'arar', en: 'Arar', ar: 'عرعر' },
      ] },
      { value: 'al_jouf', en: 'Al Jouf', ar: 'منطقة الجوف', cities: [
        { value: 'sakaka', en: 'Sakaka', ar: 'سكاكا' },
      ] },
      { value: 'al_bahah', en: 'Al Bahah', ar: 'منطقة الباحة', cities: [
        { value: 'al_bahah', en: 'Al Bahah', ar: 'الباحة' },
      ] },
    ],
  },
  {
    value: 'AE', en: 'United Arab Emirates', ar: 'الإمارات العربية المتحدة',
    states: [
      { value: 'abu_dhabi', en: 'Abu Dhabi', ar: 'إمارة أبوظبي', cities: [
        { value: 'abu_dhabi', en: 'Abu Dhabi', ar: 'أبو ظبي' },
        { value: 'al_ain', en: 'Al Ain', ar: 'العين' },
      ] },
      { value: 'dubai', en: 'Dubai', ar: 'إمارة دبي', cities: [
        { value: 'dubai', en: 'Dubai', ar: 'دبي' },
      ] },
      { value: 'sharjah', en: 'Sharjah', ar: 'إمارة الشارقة', cities: [
        { value: 'sharjah', en: 'Sharjah', ar: 'الشارقة' },
      ] },
      { value: 'ajman', en: 'Ajman', ar: 'إمارة عجمان', cities: [
        { value: 'ajman', en: 'Ajman', ar: 'عجمان' },
      ] },
      { value: 'ras_al_khaimah', en: 'Ras Al Khaimah', ar: 'إمارة رأس الخيمة', cities: [
        { value: 'ras_al_khaimah', en: 'Ras Al Khaimah', ar: 'رأس الخيمة' },
      ] },
      { value: 'fujairah', en: 'Fujairah', ar: 'إمارة الفجيرة', cities: [
        { value: 'fujairah', en: 'Fujairah', ar: 'الفجيرة' },
      ] },
      { value: 'umm_al_quwain', en: 'Umm Al Quwain', ar: 'إمارة أم القيوين', cities: [
        { value: 'umm_al_quwain', en: 'Umm Al Quwain', ar: 'أم القيوين' },
      ] },
    ],
  },
  {
    value: 'EG', en: 'Egypt', ar: 'مصر',
    states: [
      { value: 'cairo', en: 'Cairo', ar: 'القاهرة', cities: [
        { value: 'cairo', en: 'Cairo', ar: 'القاهرة' },
        { value: 'giza', en: 'Giza', ar: 'الجيزة' },
      ] },
      { value: 'alexandria', en: 'Alexandria', ar: 'الإسكندرية', cities: [
        { value: 'alexandria', en: 'Alexandria', ar: 'الإسكندرية' },
      ] },
      { value: 'giza_gov', en: 'Giza', ar: 'الجيزة', cities: [
        { value: 'sheikh_zayed', en: 'Sheikh Zayed', ar: 'الشيخ زايد' },
      ] },
      { value: 'south_sinai', en: 'South Sinai', ar: 'جنوب سيناء', cities: [
        { value: 'sharm_el_sheikh', en: 'Sharm El Sheikh', ar: 'شرم الشيخ' },
      ] },
      { value: 'luxor', en: 'Luxor', ar: 'الأقصر', cities: [
        { value: 'luxor', en: 'Luxor', ar: 'الأقصر' },
      ] },
      { value: 'aswan', en: 'Aswan', ar: 'أسوان', cities: [
        { value: 'aswan', en: 'Aswan', ar: 'أسوان' },
      ] },
      { value: 'port_said', en: 'Port Said', ar: 'بورسعيد', cities: [
        { value: 'port_said', en: 'Port Said', ar: 'بورسعيد' },
      ] },
      { value: 'suez', en: 'Suez', ar: 'السويس', cities: [
        { value: 'suez', en: 'Suez', ar: 'السويس' },
      ] },
    ],
  },
  {
    value: 'JO', en: 'Jordan', ar: 'الأردن',
    states: [
      { value: 'amman', en: 'Amman', ar: 'محافظة العاصمة', cities: [
        { value: 'amman', en: 'Amman', ar: 'عمّان' },
      ] },
      { value: 'irbid', en: 'Irbid', ar: 'محافظة إربد', cities: [
        { value: 'irbid', en: 'Irbid', ar: 'إربد' },
      ] },
      { value: 'zarqa', en: 'Zarqa', ar: 'محافظة الزرقاء', cities: [
        { value: 'zarqa', en: 'Zarqa', ar: 'الزرقاء' },
      ] },
      { value: 'aqaba', en: 'Aqaba', ar: 'محافظة العقبة', cities: [
        { value: 'aqaba', en: 'Aqaba', ar: 'العقبة' },
      ] },
      { value: 'maan', en: 'Ma`an', ar: 'محافظة معان', cities: [
        { value: 'maan', en: "Ma'an", ar: 'معان' },
      ] },
      { value: 'balqa', en: 'Balqa', ar: 'محافظة البلقاء', cities: [
        { value: 'salt', en: 'Salt', ar: 'السلط' },
      ] },
    ],
  },
  {
    value: 'IQ', en: 'Iraq', ar: 'العراق',
    states: [
      { value: 'baghdad', en: 'Baghdad', ar: 'بغداد', cities: [
        { value: 'baghdad', en: 'Baghdad', ar: 'بغداد' },
      ] },
      { value: 'basra', en: 'Basra', ar: 'البصرة', cities: [
        { value: 'basra', en: 'Basra', ar: 'البصرة' },
      ] },
      { value: 'erbil', en: 'Erbil', ar: 'أربيل', cities: [
        { value: 'erbil', en: 'Erbil', ar: 'أربيل' },
      ] },
      { value: 'sulaymaniyah', en: 'Sulaymaniyah', ar: 'السليمانية', cities: [
        { value: 'sulaymaniyah', en: 'Sulaymaniyah', ar: 'السليمانية' },
      ] },
      { value: 'nineveh', en: 'Nineveh', ar: 'نينوى', cities: [
        { value: 'mosul', en: 'Mosul', ar: 'الموصل' },
      ] },
    ],
  },
  {
    value: 'SY', en: 'Syria', ar: 'سوريا',
    states: [
      { value: 'damascus', en: 'Damascus', ar: 'دمشق', cities: [
        { value: 'damascus', en: 'Damascus', ar: 'دمشق' },
      ] },
      { value: 'aleppo', en: 'Aleppo', ar: 'حلب', cities: [
        { value: 'aleppo', en: 'Aleppo', ar: 'حلب' },
      ] },
      { value: 'homs', en: 'Homs', ar: 'حمص', cities: [
        { value: 'homs', en: 'Homs', ar: 'حمص' },
      ] },
      { value: 'latakia', en: 'Latakia', ar: 'اللاذقية', cities: [
        { value: 'latakia', en: 'Latakia', ar: 'اللاذقية' },
      ] },
    ],
  },
  {
    value: 'LB', en: 'Lebanon', ar: 'لبنان',
    states: [
      { value: 'beirut', en: 'Beirut', ar: 'محافظة بيروت', cities: [
        { value: 'beirut', en: 'Beirut', ar: 'بيروت' },
      ] },
      { value: 'north', en: 'North', ar: 'محافظة الشمال', cities: [
        { value: 'tripoli', en: 'Tripoli', ar: 'طرابلس' },
      ] },
      { value: 'south', en: 'South', ar: 'محافظة الجنوب', cities: [
        { value: 'sidon', en: 'Sidon', ar: 'صيدا' },
        { value: 'tyre', en: 'Tyre', ar: 'صور' },
      ] },
      { value: 'mount_lebanon', en: 'Mount Lebanon', ar: 'محافظة جبل لبنان', cities: [
        { value: 'byblos', en: 'Byblos', ar: 'جبيل' },
      ] },
    ],
  },
  {
    value: 'PS', en: 'Palestine', ar: 'فلسطين',
    states: [
      { value: 'west_bank', en: 'West Bank', ar: 'الضفة الغربية', cities: [
        { value: 'ramallah', en: 'Ramallah', ar: 'رام الله' },
        { value: 'nablus', en: 'Nablus', ar: 'نابلس' },
        { value: 'bethlehem', en: 'Bethlehem', ar: 'بيت لحم' },
      ] },
      { value: 'gaza', en: 'Gaza', ar: 'قطاع غزة', cities: [
        { value: 'gaza', en: 'Gaza', ar: 'غزة' },
      ] },
    ],
  },
  {
    value: 'KW', en: 'Kuwait', ar: 'الكويت',
    states: [
      { value: 'hawalli', en: 'Hawalli', ar: 'محافظة حولي', cities: [
        { value: 'salmiya', en: 'Salmiya', ar: 'السالمية' },
        { value: 'hawalli', en: 'Hawalli', ar: 'حولي' },
      ] },
      { value: 'capital', en: 'Capital', ar: 'محافظة العاصمة', cities: [
        { value: 'kuwait_city', en: 'Kuwait City', ar: 'مدينة الكويت' },
      ] },
      { value: 'farwaniya', en: 'Farwaniya', ar: 'محافظة الفروانية', cities: [
        { value: 'farwaniya', en: 'Farwaniya', ar: 'الفروانية' },
      ] },
      { value: 'jahra', en: 'Jahra', ar: 'محافظة الجهراء', cities: [
        { value: 'jahra', en: 'Jahra', ar: 'الجهراء' },
      ] },
    ],
  },
  {
    value: 'QA', en: 'Qatar', ar: 'قطر',
    states: [
      { value: 'doha', en: 'Doha', ar: 'بلدية الدوحة', cities: [
        { value: 'doha', en: 'Doha', ar: 'الدوحة' },
      ] },
      { value: 'al_wakrah', en: 'Al Wakrah', ar: 'بلدية الوكرة', cities: [
        { value: 'al_wakrah', en: 'Al Wakrah', ar: 'الوكرة' },
      ] },
      { value: 'al_khor', en: 'Al Khor', ar: 'بلدية الخور', cities: [
        { value: 'al_khor', en: 'Al Khor', ar: 'الخور' },
      ] },
    ],
  },
  {
    value: 'BH', en: 'Bahrain', ar: 'البحرين',
    states: [
      { value: 'capital', en: 'Capital', ar: 'محافظة العاصمة', cities: [
        { value: 'manama', en: 'Manama', ar: 'المنامة' },
      ] },
      { value: 'muharraq', en: 'Muharraq', ar: 'محافظة المحرق', cities: [
        { value: 'muharraq', en: 'Muharraq', ar: 'المحرق' },
      ] },
      { value: 'north', en: 'Northern', ar: 'المحافظة الشمالية', cities: [
        { value: 'riffa', en: 'Riffa', ar: 'الريف' },
      ] },
    ],
  },
  {
    value: 'OM', en: 'Oman', ar: 'عُمان',
    states: [
      { value: 'muscat', en: 'Muscat', ar: 'محافظة مسقط', cities: [
        { value: 'muscat', en: 'Muscat', ar: 'مسقط' },
      ] },
      { value: 'dhofar', en: 'Dhofar', ar: 'محافظة ظفار', cities: [
        { value: 'salalah', en: 'Salalah', ar: 'صلالة' },
      ] },
      { value: 'al_batinah', en: 'Al Batinah', ar: 'محافظة الباطنة', cities: [
        { value: 'sohar', en: 'Sohar', ar: 'صحار' },
        { value: 'suhar', en: 'Suhar', ar: 'صحار' },
      ] },
      { value: 'ad_dakhiliyah', en: 'Ad Dakhiliyah', ar: 'محافظة الداخلية', cities: [
        { value: 'nizwa', en: 'Nizwa', ar: 'نزوى' },
      ] },
      { value: 'ash_sharqiyah', en: 'Ash Sharqiyah', ar: 'محافظة الشرقية', cities: [
        { value: 'sur', en: 'Sur', ar: 'صور' },
      ] },
    ],
  },
  {
    value: 'YE', en: 'Yemen', ar: 'اليمن',
    states: [
      { value: 'sanaa', en: 'Sanaa', ar: 'صنعاء', cities: [
        { value: 'sanaa', en: 'Sanaa', ar: 'صنعاء' },
      ] },
      { value: 'aden', en: 'Aden', ar: 'عدن', cities: [
        { value: 'aden', en: 'Aden', ar: 'عدن' },
      ] },
      { value: 'hadramaut', en: 'Hadramaut', ar: 'حضرموت', cities: [
        { value: 'mukalla', en: 'Mukalla', ar: 'المكلا' },
      ] },
    ],
  },
  {
    value: 'MA', en: 'Morocco', ar: 'المغرب',
    states: [
      { value: 'casablanca', en: 'Casablanca-Settat', ar: 'الدار البيضاء-سطات', cities: [
        { value: 'casablanca', en: 'Casablanca', ar: 'الدار البيضاء' },
      ] },
      { value: 'rabat', en: 'Rabat-Salé-Kénitra', ar: 'الرباط-سلا-القنيطرة', cities: [
        { value: 'rabat', en: 'Rabat', ar: 'الرباط' },
      ] },
      { value: 'marrakech', en: 'Marrakech-Safi', ar: 'مراكش-آسفي', cities: [
        { value: 'marrakech', en: 'Marrakech', ar: 'مراكش' },
      ] },
      { value: 'fes', en: 'Fès-Meknès', ar: 'فاس-مكناس', cities: [
        { value: 'fes', en: 'Fes', ar: 'فاس' },
      ] },
      { value: 'tangier', en: 'Tanger-Tétouan', ar: 'طنجة-تطوان', cities: [
        { value: 'tangier', en: 'Tangier', ar: 'طنجة' },
      ] },
    ],
  },
  {
    value: 'TN', en: 'Tunisia', ar: 'تونس',
    states: [
      { value: 'tunis', en: 'Tunis', ar: 'تونس', cities: [
        { value: 'tunis', en: 'Tunis', ar: 'تونس' },
      ] },
      { value: 'sfax', en: 'Sfax', ar: 'صفاقس', cities: [
        { value: 'sfax', en: 'Sfax', ar: 'صفاقس' },
      ] },
      { value: 'sousse', en: 'Sousse', ar: 'سوسة', cities: [
        { value: 'sousse', en: 'Sousse', ar: 'سوسة' },
      ] },
    ],
  },
  {
    value: 'DZ', en: 'Algeria', ar: 'الجزائر',
    states: [
      { value: 'algiers', en: 'Algiers', ar: 'الجزائر', cities: [
        { value: 'algiers', en: 'Algiers', ar: 'الجزائر' },
      ] },
      { value: 'oran', en: 'Oran', ar: 'وهران', cities: [
        { value: 'oran', en: 'Oran', ar: 'وهران' },
      ] },
      { value: 'constantine', en: 'Constantine', ar: 'قسنطينة', cities: [
        { value: 'constantine', en: 'Constantine', ar: 'قسنطينة' },
      ] },
    ],
  },
  {
    value: 'LY', en: 'Libya', ar: 'ليبيا',
    states: [
      { value: 'tripoli', en: 'Tripoli', ar: 'طرابلس', cities: [
        { value: 'tripoli', en: 'Tripoli', ar: 'طرابلس' },
      ] },
      { value: 'benghazi', en: 'Benghazi', ar: 'بنغازي', cities: [
        { value: 'benghazi', en: 'Benghazi', ar: 'بنغازي' },
      ] },
    ],
  },
  {
    value: 'SD', en: 'Sudan', ar: 'السودان',
    states: [
      { value: 'khartoum', en: 'Khartoum', ar: 'الخرطوم', cities: [
        { value: 'khartoum', en: 'Khartoum', ar: 'الخرطوم' },
        { value: 'omdurman', en: 'Omdurman', ar: 'أم درمان' },
      ] },
    ],
  },

  // ===== Major non-Arab countries =====
  {
    value: 'US', en: 'United States', ar: 'الولايات المتحدة',
    states: [
      { value: 'CA', en: 'California', ar: 'كاليفورنيا', cities: [
        { value: 'los_angeles', en: 'Los Angeles', ar: 'لوس أنجلوس' },
        { value: 'san_francisco', en: 'San Francisco', ar: 'سان فرانسيسكو' },
      ] },
      { value: 'NY', en: 'New York', ar: 'نيويورك', cities: [
        { value: 'new_york_city', en: 'New York City', ar: 'مدينة نيويورك' },
      ] },
      { value: 'TX', en: 'Texas', ar: 'تكساس', cities: [
        { value: 'houston', en: 'Houston', ar: 'هيوستن' },
        { value: 'dallas', en: 'Dallas', ar: 'دالاس' },
      ] },
      { value: 'FL', en: 'Florida', ar: 'فلوريدا', cities: [
        { value: 'miami', en: 'Miami', ar: 'ميامي' },
      ] },
      { value: 'IL', en: 'Illinois', ar: 'إلينوي', cities: [
        { value: 'chicago', en: 'Chicago', ar: 'شيكاغو' },
      ] },
    ],
  },
  {
    value: 'GB', en: 'United Kingdom', ar: 'المملكة المتحدة',
    states: [
      { value: 'england', en: 'England', ar: 'إنجلترا', cities: [
        { value: 'london', en: 'London', ar: 'لندن' },
        { value: 'manchester', en: 'Manchester', ar: 'مانشستر' },
      ] },
      { value: 'scotland', en: 'Scotland', ar: 'أسكتلندا', cities: [
        { value: 'edinburgh', en: 'Edinburgh', ar: 'إدنبرة' },
      ] },
      { value: 'wales', en: 'Wales', ar: 'ويلز', cities: [
        { value: 'cardiff', en: 'Cardiff', ar: 'كارديف' },
      ] },
    ],
  },
  {
    value: 'CA', en: 'Canada', ar: 'كندا',
    states: [
      { value: 'ON', en: 'Ontario', ar: 'أونتاريو', cities: [
        { value: 'toronto', en: 'Toronto', ar: 'تورونتو' },
        { value: 'ottawa', en: 'Ottawa', ar: 'أوتاوا' },
      ] },
      { value: 'QC', en: 'Quebec', ar: 'كيبك', cities: [
        { value: 'montreal', en: 'Montreal', ar: 'مونتريال' },
      ] },
      { value: 'BC', en: 'British Columbia', ar: 'كولومبيا البريطانية', cities: [
        { value: 'vancouver', en: 'Vancouver', ar: 'فانكوفر' },
      ] },
    ],
  },
  {
    value: 'FR', en: 'France', ar: 'فرنسا',
    states: [
      { value: 'idf', en: 'Île-de-France', ar: 'إيل-دو-فرانس', cities: [
        { value: 'paris', en: 'Paris', ar: 'باريس' },
      ] },
      { value: 'paca', en: 'Provence-Alpes-Côte d’Azur', ar: 'بروفانس-ألب-كوت دازور', cities: [
        { value: 'marseille', en: 'Marseille', ar: 'مرسيليا' },
        { value: 'nice', en: 'Nice', ar: 'نيس' },
      ] },
      { value: 'aura', en: 'Auvergne-Rhône-Alpes', ar: 'أوفيرن-رون-ألب', cities: [
        { value: 'lyon', en: 'Lyon', ar: 'ليون' },
      ] },
    ],
  },
  {
    value: 'DE', en: 'Germany', ar: 'ألمانيا',
    states: [
      { value: 'bayern', en: 'Bavaria', ar: 'بافاريا', cities: [
        { value: 'munich', en: 'Munich', ar: 'ميونخ' },
      ] },
      { value: 'berlin', en: 'Berlin', ar: 'برلين', cities: [
        { value: 'berlin', en: 'Berlin', ar: 'برلين' },
      ] },
      { value: 'hh', en: 'Hamburg', ar: 'هامبورغ', cities: [
        { value: 'hamburg', en: 'Hamburg', ar: 'هامبورغ' },
      ] },
      { value: 'nordrhein', en: 'North Rhine-Westphalia', ar: 'شمال الراين-وستفاليا', cities: [
        { value: 'cologne', en: 'Cologne', ar: 'كولونيا' },
      ] },
    ],
  },
  {
    value: 'IN', en: 'India', ar: 'الهند',
    states: [
      { value: 'MH', en: 'Maharashtra', ar: 'مهاراشترا', cities: [
        { value: 'mumbai', en: 'Mumbai', ar: 'مومباي' },
        { value: 'pune', en: 'Pune', ar: 'بونه' },
      ] },
      { value: 'KA', en: 'Karnataka', ar: 'كارناتاكا', cities: [
        { value: 'bengaluru', en: 'Bengaluru', ar: 'بنغالورو' },
      ] },
      { value: 'DL', en: 'Delhi', ar: 'دلهي', cities: [
        { value: 'new_delhi', en: 'New Delhi', ar: 'نيودلهي' },
      ] },
    ],
  },
  {
    value: 'BR', en: 'Brazil', ar: 'البرازيل',
    states: [
      { value: 'SP', en: 'São Paulo', ar: 'ساو باولو', cities: [
        { value: 'sao_paulo', en: 'São Paulo', ar: 'ساو باولو' },
      ] },
      { value: 'RJ', en: 'Rio de Janeiro', ar: 'ريو دي جانيرو', cities: [
        { value: 'rio_de_janeiro', en: 'Rio de Janeiro', ar: 'ريو دي جانيرو' },
      ] },
    ],
  },
  {
    value: 'RU', en: 'Russia', ar: 'روسيا',
    states: [
      { value: 'moscow', en: 'Moscow', ar: 'موسكو', cities: [
        { value: 'moscow', en: 'Moscow', ar: 'موسكو' },
      ] },
      { value: 'spb', en: 'Saint Petersburg', ar: 'سانت بطرسبرغ', cities: [
        { value: 'saint_petersburg', en: 'Saint Petersburg', ar: 'سانت بطرسبرغ' },
      ] },
    ],
  },
  {
    value: 'CN', en: 'China', ar: 'الصين',
    states: [
      { value: 'beijing', en: 'Beijing', ar: 'بكين', cities: [
        { value: 'beijing', en: 'Beijing', ar: 'بكين' },
      ] },
      { value: 'shanghai', en: 'Shanghai', ar: 'شنغهاي', cities: [
        { value: 'shanghai', en: 'Shanghai', ar: 'شنغهاي' },
      ] },
      { value: 'guangdong', en: 'Guangdong', ar: 'غوانغدونغ', cities: [
        { value: 'shenzhen', en: 'Shenzhen', ar: 'شنتشن' },
      ] },
    ],
  },
  {
    value: 'AU', en: 'Australia', ar: 'أستراليا',
    states: [
      { value: 'nsw', en: 'New South Wales', ar: 'نيو ساوث ويلز', cities: [
        { value: 'sydney', en: 'Sydney', ar: 'سيدني' },
      ] },
      { value: 'vic', en: 'Victoria', ar: 'فيكتوريا', cities: [
        { value: 'melbourne', en: 'Melbourne', ar: 'ملبورن' },
      ] },
      { value: 'qld', en: 'Queensland', ar: 'كوينزلاند', cities: [
        { value: 'brisbane', en: 'Brisbane', ar: 'بريزبين' },
      ] },
    ],
  },
  {
    value: 'TR', en: 'Turkey', ar: 'تركيا',
    states: [
      { value: 'istanbul', en: 'Istanbul', ar: 'إسطنبول', cities: [
        { value: 'istanbul', en: 'Istanbul', ar: 'إسطنبول' },
      ] },
      { value: 'ankara', en: 'Ankara', ar: 'أنقرة', cities: [
        { value: 'ankara', en: 'Ankara', ar: 'أنقرة' },
      ] },
    ],
  },
  { value: 'other', en: 'Other', ar: 'أخرى', states: [] },
]

export function getCountry(value) {
  return COUNTRIES.find((c) => c.value === value || c.en === value || c.ar === value) || null
}

export function getStates(countryValue) {
  return getCountry(countryValue)?.states || []
}

export function getCities(countryValue, stateValue) {
  const country = getCountry(countryValue)
  const state = country?.states?.find((s) => s.value === stateValue || s.en === stateValue || s.ar === stateValue)
  return state?.cities || []
}
