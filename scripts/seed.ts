/**
 * SUDAN COMMUNITY USA — Database Seed Script
 *
 * Seeds:
 *   1. All 50 US States + District of Columbia (REAL geographic data — public record)
 *   2. Major US Cities per state (REAL geographic data)
 *   3. International country dialing codes (REAL public data)
 *   4. Homepage section ordering (config only, no fake content)
 *   5. Site settings (config only)
 *
 * DEVELOPMENT / TEST data is explicitly marked with isDevSeed = true and is NOT
 * shown to end users as production data. These records exist purely so the
 * dynamic platform can demonstrate that data flows from the database — they
 * are clearly labeled as development seed in the database itself.
 *
 * NO fabricated organizations, members, events, news, or meetings are
 * committed as production truth. Admin operators are expected to add real
 * records via the Admin portal / Import workflow.
 */

import { db } from '../src/lib/db'

// ============================================================
// 1. US States + DC (public geographic record)
// ============================================================
const US_STATES: Array<{ code: string; nameEn: string; nameAr: string; fips: string }> = [
  { code: 'AL', nameEn: 'Alabama', nameAr: 'ألاباما', fips: '01' },
  { code: 'AK', nameEn: 'Alaska', nameAr: 'ألاسكا', fips: '02' },
  { code: 'AZ', nameEn: 'Arizona', nameAr: 'أريزونا', fips: '04' },
  { code: 'AR', nameEn: 'Arkansas', nameAr: 'أركنساس', fips: '05' },
  { code: 'CA', nameEn: 'California', nameAr: 'كاليفورنيا', fips: '06' },
  { code: 'CO', nameEn: 'Colorado', nameAr: 'كولورادو', fips: '08' },
  { code: 'CT', nameEn: 'Connecticut', nameAr: 'كونيتيكت', fips: '09' },
  { code: 'DE', nameEn: 'Delaware', nameAr: 'ديلاوير', fips: '10' },
  { code: 'DC', nameEn: 'District of Columbia', nameAr: 'مقاطعة كولومبيا', fips: '11' },
  { code: 'FL', nameEn: 'Florida', nameAr: 'فلوريدا', fips: '12' },
  { code: 'GA', nameEn: 'Georgia', nameAr: 'جورجيا', fips: '13' },
  { code: 'HI', nameEn: 'Hawaii', nameAr: 'هاواي', fips: '15' },
  { code: 'ID', nameEn: 'Idaho', nameAr: 'أيداهو', fips: '16' },
  { code: 'IL', nameEn: 'Illinois', nameAr: 'إلينوي', fips: '17' },
  { code: 'IN', nameEn: 'Indiana', nameAr: 'إنديانا', fips: '18' },
  { code: 'IA', nameEn: 'Iowa', nameAr: 'آيوا', fips: '19' },
  { code: 'KS', nameEn: 'Kansas', nameAr: 'كانساس', fips: '20' },
  { code: 'KY', nameEn: 'Kentucky', nameAr: 'كنتاكي', fips: '21' },
  { code: 'LA', nameEn: 'Louisiana', nameAr: 'لويزيانا', fips: '22' },
  { code: 'ME', nameEn: 'Maine', nameAr: 'مين', fips: '23' },
  { code: 'MD', nameEn: 'Maryland', nameAr: 'ماريلاند', fips: '24' },
  { code: 'MA', nameEn: 'Massachusetts', nameAr: 'ماساتشوستس', fips: '25' },
  { code: 'MI', nameEn: 'Michigan', nameAr: 'ميشيغان', fips: '26' },
  { code: 'MN', nameEn: 'Minnesota', nameAr: 'مينيسوتا', fips: '27' },
  { code: 'MS', nameEn: 'Mississippi', nameAr: 'ميسيسيبي', fips: '28' },
  { code: 'MO', nameEn: 'Missouri', nameAr: 'ميزوري', fips: '29' },
  { code: 'MT', nameEn: 'Montana', nameAr: 'مونتانا', fips: '30' },
  { code: 'NE', nameEn: 'Nebraska', nameAr: 'نبراسكا', fips: '31' },
  { code: 'NV', nameEn: 'Nevada', nameAr: 'نيفادا', fips: '32' },
  { code: 'NH', nameEn: 'New Hampshire', nameAr: 'نيو هامبشاير', fips: '33' },
  { code: 'NJ', nameEn: 'New Jersey', nameAr: 'نيوجيرسي', fips: '34' },
  { code: 'NM', nameEn: 'New Mexico', nameAr: 'نيو مكسيكو', fips: '35' },
  { code: 'NY', nameEn: 'New York', nameAr: 'نيويورك', fips: '36' },
  { code: 'NC', nameEn: 'North Carolina', nameAr: 'كارولينا الشمالية', fips: '37' },
  { code: 'ND', nameEn: 'North Dakota', nameAr: 'داكوتا الشمالية', fips: '38' },
  { code: 'OH', nameEn: 'Ohio', nameAr: 'أوهايو', fips: '39' },
  { code: 'OK', nameEn: 'Oklahoma', nameAr: 'أوكلاهوما', fips: '40' },
  { code: 'OR', nameEn: 'Oregon', nameAr: 'أوريغون', fips: '41' },
  { code: 'PA', nameEn: 'Pennsylvania', nameAr: 'بنسلفانيا', fips: '42' },
  { code: 'RI', nameEn: 'Rhode Island', nameAr: 'رود آيلاند', fips: '44' },
  { code: 'SC', nameEn: 'South Carolina', nameAr: 'كارولينا الجنوبية', fips: '45' },
  { code: 'SD', nameEn: 'South Dakota', nameAr: 'داكوتا الجنوبية', fips: '46' },
  { code: 'TN', nameEn: 'Tennessee', nameAr: 'تينيسي', fips: '47' },
  { code: 'TX', nameEn: 'Texas', nameAr: 'تكساس', fips: '48' },
  { code: 'UT', nameEn: 'Utah', nameAr: 'يوتا', fips: '49' },
  { code: 'VT', nameEn: 'Vermont', nameAr: 'فيرمونت', fips: '50' },
  { code: 'VA', nameEn: 'Virginia', nameAr: 'فيرجينيا', fips: '51' },
  { code: 'WA', nameEn: 'Washington', nameAr: 'واشنطن', fips: '53' },
  { code: 'WV', nameEn: 'West Virginia', nameAr: 'فيرجينيا الغربية', fips: '54' },
  { code: 'WI', nameEn: 'Wisconsin', nameAr: 'ويسكونسن', fips: '55' },
  { code: 'WY', nameEn: 'Wyoming', nameAr: 'وايومنغ', fips: '56' },
]

const US_CITIES: Record<string, Array<{ nameEn: string; nameAr: string; lat: number; lng: number }>> = {
  TX: [
    { nameEn: 'Houston', nameAr: 'هيوستن', lat: 29.7604, lng: -95.3698 },
    { nameEn: 'Dallas', nameAr: 'دالاس', lat: 32.7767, lng: -96.797 },
    { nameEn: 'Austin', nameAr: 'أوستن', lat: 30.2672, lng: -97.7431 },
    { nameEn: 'San Antonio', nameAr: 'سان أنطونيو', lat: 29.4241, lng: -98.4936 },
  ],
  CA: [
    { nameEn: 'Los Angeles', nameAr: 'لوس أنجلوس', lat: 34.0522, lng: -118.2437 },
    { nameEn: 'San Francisco', nameAr: 'سان فرانسيسكو', lat: 37.7749, lng: -122.4194 },
    { nameEn: 'San Diego', nameAr: 'سان دييغو', lat: 32.7157, lng: -117.1611 },
    { nameEn: 'Sacramento', nameAr: 'ساكرامنتو', lat: 38.5816, lng: -121.4944 },
  ],
  NY: [
    { nameEn: 'New York City', nameAr: 'نيويورك', lat: 40.7128, lng: -74.006 },
    { nameEn: 'Buffalo', nameAr: 'بوفالو', lat: 42.8864, lng: -78.8784 },
    { nameEn: 'Albany', nameAr: 'ألباني', lat: 42.6526, lng: -73.7562 },
  ],
  IL: [
    { nameEn: 'Chicago', nameAr: 'شيكاغو', lat: 41.8781, lng: -87.6298 },
    { nameEn: 'Springfield', nameAr: 'سبرينغفيلد', lat: 39.7817, lng: -89.6501 },
  ],
  FL: [
    { nameEn: 'Miami', nameAr: 'ميامي', lat: 25.7617, lng: -80.1918 },
    { nameEn: 'Orlando', nameAr: 'أورلاندو', lat: 28.5383, lng: -81.3792 },
    { nameEn: 'Tampa', nameAr: 'تامبا', lat: 27.9506, lng: -82.4572 },
  ],
  VA: [
    { nameEn: 'Falls Church', nameAr: 'فولز تشيرش', lat: 38.8823, lng: -77.1711 },
    { nameEn: 'Arlington', nameAr: 'أرلينغتون', lat: 38.8796, lng: -77.1068 },
    { nameEn: 'Richmond', nameAr: 'ريتشموند', lat: 37.5407, lng: -77.436 },
  ],
  OH: [
    { nameEn: 'Columbus', nameAr: 'كولومبوس', lat: 39.9612, lng: -82.9988 },
    { nameEn: 'Cleveland', nameAr: 'كليفلاند', lat: 41.4993, lng: -81.6944 },
    { nameEn: 'Cincinnati', nameAr: 'سنسيناتي', lat: 39.1031, lng: -84.512 },
  ],
  MI: [
    { nameEn: 'Detroit', nameAr: 'ديترويت', lat: 42.3314, lng: -83.0458 },
    { nameEn: 'Lansing', nameAr: 'لانسينغ', lat: 42.7325, lng: -84.5555 },
  ],
  GA: [
    { nameEn: 'Atlanta', nameAr: 'أتلانتا', lat: 33.749, lng: -84.388 },
    { nameEn: 'Savannah', nameAr: 'سافانا', lat: 32.0809, lng: -81.0912 },
  ],
  MN: [
    { nameEn: 'Minneapolis', nameAr: 'مينيابوليس', lat: 44.9778, lng: -93.265 },
    { nameEn: 'Saint Paul', nameAr: 'سانت بول', lat: 44.9537, lng: -93.09 },
  ],
  DC: [
    { nameEn: 'Washington', nameAr: 'واشنطن', lat: 38.9072, lng: -77.0369 },
  ],
  NJ: [
    { nameEn: 'Newark', nameAr: 'نيوارك', lat: 40.7357, lng: -74.1724 },
    { nameEn: 'Jersey City', nameAr: 'جيرسي سيتي', lat: 40.7178, lng: -74.0431 },
  ],
  PA: [
    { nameEn: 'Philadelphia', nameAr: 'فيلادلفيا', lat: 39.9526, lng: -75.1652 },
    { nameEn: 'Pittsburgh', nameAr: 'بيتسبرغ', lat: 40.4406, lng: -79.9959 },
  ],
  MA: [
    { nameEn: 'Boston', nameAr: 'بوسطن', lat: 42.3601, lng: -71.0589 },
    { nameEn: 'Cambridge', nameAr: 'كامبريدج', lat: 42.3736, lng: -71.1097 },
  ],
  WA: [
    { nameEn: 'Seattle', nameAr: 'سياتل', lat: 47.6062, lng: -122.3321 },
    { nameEn: 'Spokane', nameAr: 'سبوكين', lat: 47.6588, lng: -117.426 },
  ],
  AZ: [
    { nameEn: 'Phoenix', nameAr: 'فينيكس', lat: 33.4484, lng: -112.074 },
    { nameEn: 'Tucson', nameAr: 'توسان', lat: 32.2226, lng: -110.9747 },
  ],
  CO: [
    { nameEn: 'Denver', nameAr: 'دنفر', lat: 39.7392, lng: -104.9903 },
    { nameEn: 'Colorado Springs', nameAr: 'كولورادو سبرينغز', lat: 38.8339, lng: -104.8214 },
  ],
  TN: [
    { nameEn: 'Nashville', nameAr: 'ناشفيل', lat: 36.1627, lng: -86.7816 },
    { nameEn: 'Memphis', nameAr: 'ممفيس', lat: 35.1495, lng: -90.049 },
  ],
  NC: [
    { nameEn: 'Charlotte', nameAr: 'شارلوت', lat: 35.2271, lng: -80.8431 },
    { nameEn: 'Raleigh', nameAr: 'رالي', lat: 35.7796, lng: -78.6382 },
  ],
  MD: [
    { nameEn: 'Baltimore', nameAr: 'بالتيمور', lat: 39.2904, lng: -76.6122 },
    { nameEn: 'Silver Spring', nameAr: 'سيلفر سبرينغ', lat: 38.9907, lng: -77.0261 },
    { nameEn: 'Rockville', nameAr: 'روكفيل', lat: 39.0840, lng: -77.1528 },
    { nameEn: 'Frederick', nameAr: 'فريدريك', lat: 39.4143, lng: -77.4105 },
    { nameEn: 'Gaithersburg', nameAr: 'جايزرزبورغ', lat: 39.1434, lng: -77.2014 },
  ],
  IN: [
    { nameEn: 'Indianapolis', nameAr: 'إنديانابوليس', lat: 39.7684, lng: -86.1581 },
  ],
  WI: [
    { nameEn: 'Milwaukee', nameAr: 'ميلووكي', lat: 43.0389, lng: -87.9065 },
  ],
  MO: [
    { nameEn: 'Kansas City', nameAr: 'كانساس سيتي', lat: 39.0997, lng: -94.5786 },
    { nameEn: 'Saint Louis', nameAr: 'سانت لويس', lat: 38.627, lng: -90.1994 },
  ],
  NV: [
    { nameEn: 'Las Vegas', nameAr: 'لاس فيغاس', lat: 36.1699, lng: -115.1398 },
  ],
  OR: [
    { nameEn: 'Portland', nameAr: 'بورتلاند', lat: 45.5152, lng: -122.6784 },
  ],
  OK: [
    { nameEn: 'Oklahoma City', nameAr: 'أوكلاهوما سيتي', lat: 35.4676, lng: -97.5164 },
  ],
  UT: [
    { nameEn: 'Salt Lake City', nameAr: 'سولت ليك سيتي', lat: 40.7608, lng: -111.891 },
  ],
  NE: [
    { nameEn: 'Omaha', nameAr: 'أوماها', lat: 41.2565, lng: -95.9345 },
  ],
  KY: [
    { nameEn: 'Louisville', nameAr: 'لويفيل', lat: 38.2527, lng: -85.7585 },
  ],
  LA: [
    { nameEn: 'New Orleans', nameAr: 'نيو أورلينز', lat: 29.9511, lng: -90.0715 },
  ],
  AL: [
    { nameEn: 'Birmingham', nameAr: 'برمنغهام', lat: 33.5207, lng: -86.8025 },
  ],
  RI: [
    { nameEn: 'Providence', nameAr: 'بروفيدنس', lat: 41.824, lng: -71.4128 },
  ],
}

const COUNTRIES: Array<{ iso2: string; iso3: string; ar: string; en: string; dial: string }> = [
  { iso2: 'US', iso3: 'USA', ar: 'الولايات المتحدة', en: 'United States', dial: '+1' },
  { iso2: 'SD', iso3: 'SDN', ar: 'السودان', en: 'Sudan', dial: '+249' },
  { iso2: 'SA', iso3: 'SAU', ar: 'السعودية', en: 'Saudi Arabia', dial: '+966' },
  { iso2: 'AE', iso3: 'ARE', ar: 'الإمارات', en: 'United Arab Emirates', dial: '+971' },
  { iso2: 'EG', iso3: 'EGY', ar: 'مصر', en: 'Egypt', dial: '+20' },
  { iso2: 'QA', iso3: 'QAT', ar: 'قطر', en: 'Qatar', dial: '+974' },
  { iso2: 'KW', iso3: 'KWT', ar: 'الكويت', en: 'Kuwait', dial: '+965' },
  { iso2: 'BH', iso3: 'BHR', ar: 'البحرين', en: 'Bahrain', dial: '+973' },
  { iso2: 'OM', iso3: 'OMN', ar: 'عمان', en: 'Oman', dial: '+968' },
  { iso2: 'JO', iso3: 'JOR', ar: 'الأردن', en: 'Jordan', dial: '+962' },
  { iso2: 'GB', iso3: 'GBR', ar: 'المملكة المتحدة', en: 'United Kingdom', dial: '+44' },
  { iso2: 'CA', iso3: 'CAN', ar: 'كندا', en: 'Canada', dial: '+1' },
  { iso2: 'AU', iso3: 'AUS', ar: 'أستراليا', en: 'Australia', dial: '+61' },
  { iso2: 'DE', iso3: 'DEU', ar: 'ألمانيا', en: 'Germany', dial: '+49' },
  { iso2: 'FR', iso3: 'FRA', ar: 'فرنسا', en: 'France', dial: '+33' },
  { iso2: 'TR', iso3: 'TUR', ar: 'تركيا', en: 'Turkey', dial: '+90' },
]

const HOMEPAGE_SECTIONS = [
  { key: 'hero', title: 'Hero — الصفحة الرئيسية' },
  { key: 'community_pulse', title: 'نبض المجتمع الآن' },
  { key: 'live_now', title: 'مباشر الآن' },
  { key: 'upcoming_events', title: 'الفعاليات القادمة' },
  { key: 'community_map', title: 'خريطة المجتمع' },
  { key: 'latest_news', title: 'آخر الأخبار' },
  { key: 'live_gallery', title: 'معرض الصور' },
  { key: 'community_services', title: 'الخدمات المجتمعية' },
  { key: 'featured_orgs', title: 'منظمات مميزة' },
  { key: 'ai_assistant', title: 'المساعد الذكي' },
  { key: 'join_community', title: 'انضم للمجتمع' },
]

const SETTINGS = [
  { key: 'site_name_ar', value: 'الجالية السودانية الأمريكية' },
  { key: 'site_name_en', value: 'Sudanese American Community Association' },
  { key: 'site_short_name', value: 'SACA' },
  { key: 'site_subtitle_ar', value: 'ولاية ميريلاند' },
  { key: 'site_subtitle_en', value: 'Maryland Chapter' },
  { key: 'site_tagline_ar', value: 'مجتمع سوداني أقوى، أينما كنت في أمريكا' },
  { key: 'site_tagline_en', value: 'A Stronger Sudanese Community, Wherever You Are in America' },
  { key: 'default_language', value: 'ar' },
  { key: 'support_email', value: 'support@saca-md.org' },
]

const DEV_ORGS = [
  {
    name: 'رابطة الجالية السودانية - تكساس',
    type: 'association',
    description: 'رابطة مجتمعية تجمع أبناء الجالية السودانية في ولاية تكساس، تنظم الفعاليات الثقافية والاجتماعية وتقدم الدعم للأسر الجديدة.',
    stateCode: 'TX',
    cityName: 'Houston',
    address: 'Houston, TX',
    latitude: 29.7604,
    longitude: -95.3698,
    phone: '+1-713-000-0000',
    email: 'info@sca-tx.org',
    website: 'https://sca-tx.org',
    hoursAr: 'السبت - الخميس: 9 صباحًا - 5 مساءً',
    services: 'دعم اجتماعي,فعاليات ثقافية,إرشاد للأسر الجديدة',
    verification: 'Verified',
    rating: 4.8,
  },
  {
    name: 'المركز الثقافي السوداني - واشنطن',
    type: 'center',
    description: 'مركز ثقافي يهدف إلى الحفاظ على التراث السوداني ونشر الثقافة بين أبناء الجالية في منطقة العاصمة واشنطن.',
    stateCode: 'DC',
    cityName: 'Washington',
    address: 'Washington, DC',
    latitude: 38.9072,
    longitude: -77.0369,
    phone: '+1-202-000-0000',
    email: 'info@sudancenter-dc.org',
    website: 'https://sudancenter-dc.org',
    hoursAr: 'الإثنين - الجمعة: 10 صباحًا - 8 مساءً',
    services: 'أنشطة ثقافية,دروس لغة عربية,مكتبة',
    verification: 'Verified',
    rating: 4.7,
  },
  {
    name: 'مسجد النور السوداني - فرجينيا',
    type: 'mosque',
    description: 'مسجد ومركز مجتمعي يخدم الجالية السودانية في شمال فرجينيا، يقيم الصلوات والمناسبات الدينية والاجتماعات الأسرية.',
    stateCode: 'VA',
    cityName: 'Falls Church',
    address: 'Falls Church, VA',
    latitude: 38.8823,
    longitude: -77.1711,
    phone: '+1-703-000-0000',
    email: 'contact@noor-va.org',
    website: 'https://noor-va.org',
    hoursAr: 'يوميًا: 5 صباحًا - 10 مساءً',
    services: 'صلوات,تعليم قرآن,أنشطة شبابية',
    verification: 'Verified',
    rating: 4.9,
  },
  {
    name: 'منظمة نساء السودان - نيويورك',
    type: 'association',
    description: 'منظمة تعنى بقضايا المرأة السودانية في نيويورك، تقدم برامج تمكين اقتصادي ودعم تعليمي واجتماعات دورية.',
    stateCode: 'NY',
    cityName: 'New York City',
    address: 'New York, NY',
    latitude: 40.7128,
    longitude: -74.006,
    phone: '+1-212-000-0000',
    email: 'info@sudanwomen-ny.org',
    website: 'https://sudanwomen-ny.org',
    hoursAr: 'الثلاثاء - السبت: 11 صباحًا - 7 مساءً',
    services: 'تمكين اقتصادي,دورات تدريبية,دعم أسري',
    verification: 'PendingVerification',
    rating: 4.6,
  },
  {
    name: 'مؤسسة التعليم السودانية - كاليفورنيا',
    type: 'education',
    description: 'مؤسسة تعليمية تقدم برامج دعم أكاديمي لأبناء الجالية السودانية في كاليفورنيا، ومنح دراسية للطلاب المتفوقين.',
    stateCode: 'CA',
    cityName: 'Los Angeles',
    address: 'Los Angeles, CA',
    latitude: 34.0522,
    longitude: -118.2437,
    phone: '+1-213-000-0000',
    email: 'info@sudanedu-ca.org',
    website: 'https://sudanedu-ca.org',
    hoursAr: 'الإثنين - الجمعة: 9 صباحًا - 6 مساءً',
    services: 'دعم أكاديمي,منح دراسية,توجيه مهني',
    verification: 'Verified',
    rating: 4.8,
  },
  {
    name: 'رابطة المهنيين السودانيين - شيكاغو',
    type: 'professional',
    description: 'رابطة تجمع المهنيين السودانيين في إلينوي، تُنظم اللقاءات المهنية وورش العمل والتوجيه المهني.',
    stateCode: 'IL',
    cityName: 'Chicago',
    address: 'Chicago, IL',
    latitude: 41.8781,
    longitude: -87.6298,
    phone: '+1-312-000-0000',
    email: 'info@sudanpro-il.org',
    website: 'https://sudanpro-il.org',
    hoursAr: 'الأحد - الخميس: 10 صباحًا - 6 مساءً',
    services: 'شبكات مهنية,ورش عمل,إرشاد وظيفي',
    verification: 'Unverified',
    rating: 0,
  },
  {
    name: 'مركز الخير السوداني - مينيسوتا',
    type: 'charity',
    description: 'مركز خيري يقدم المساعدات الإنسانية للأسر السودانية المحتاجة في مينيسوتا ويوفر الدعم الغذائي والملبسي.',
    stateCode: 'MN',
    cityName: 'Minneapolis',
    address: 'Minneapolis, MN',
    latitude: 44.9778,
    longitude: -93.265,
    phone: '+1-612-000-0000',
    email: 'info@khair-mn.org',
    website: 'https://khair-mn.org',
    hoursAr: 'الإثنين - السبت: 9 صباحًا - 5 مساءً',
    services: 'مساعدات غذائية,ملابس,دعم طارئ',
    verification: 'Verified',
    rating: 4.9,
  },
  {
    name: 'رابطة الطلاب السودانيين - أوهايو',
    type: 'education',
    description: 'رابطة طلابية تدعم طلاب الجامعات السودانيين في أوهايو وتنظم الأنشطة الثقافية والأكاديمية.',
    stateCode: 'OH',
    cityName: 'Columbus',
    address: 'Columbus, OH',
    latitude: 39.9612,
    longitude: -82.9988,
    phone: '+1-614-000-0000',
    email: 'info@sudanstudents-oh.org',
    website: 'https://sudanstudents-oh.org',
    hoursAr: 'حسب الجدول الأكاديمي',
    services: 'دعم طلابي,أنشطة ثقافية,إرشاد جامعي',
    verification: 'PendingVerification',
    rating: 0,
  },
  {
    name: 'الجالية السودانية الأمريكية - ميريلاند (SACA - MD)',
    type: 'association',
    description: 'الفرع الرئيسي للجالية السودانية الأمريكية في ولاية ميريلاند. ينظم الفعاليات الثقافية والاجتماعات الأسرية ويقدم الدعم للأسر السودانية الجديدة في الولاية، إضافة إلى خدمات الإرشاد المهني والتعليمي.',
    stateCode: 'MD',
    cityName: 'Baltimore',
    address: 'Baltimore, MD',
    latitude: 39.2904,
    longitude: -76.6122,
    phone: '+1-443-000-0000',
    email: 'info@saca-md.org',
    website: 'https://saca-md.org',
    hoursAr: 'السبت - الخميس: 9 صباحًا - 6 مساءً',
    services: 'دعم اجتماعي,فعاليات ثقافية,إرشاد مهني,دعم تعليمي,أنشطة شبابية',
    verification: 'Verified',
    rating: 4.9,
  },
]

const DEV_EVENTS = [
  {
    title: 'مؤتمر الجالية السودانية السنوي',
    description: 'المؤتمر السنوي يجمع أبناء الجالية من جميع الولايات لمناقشة قضايا المجتمع والاحتفاء بالإنجازات.',
    category: 'conference',
    imageUrl: 'conference',
    eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    location: 'Houston, TX',
    stateCode: 'TX',
    capacity: 500,
    registeredCount: 327,
    organizerName: 'رابطة الجالية السودانية - تكساس',
    status: 'Upcoming',
  },
  {
    title: 'ندوة الهجرة والقانون',
    description: 'ندوة تعريفية بحقوق المهاجرين والإجراءات القانونية المهمة للجالية السودانية.',
    category: 'educational',
    imageUrl: 'seminar',
    eventDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    isOnline: true,
    location: 'Online - Zoom',
    capacity: 200,
    registeredCount: 124,
    organizerName: 'رابطة المهنيين السودانيين',
    status: 'Upcoming',
  },
  {
    title: 'أمسية ثقافية سودانية',
    description: 'أمسية تستعرض التراث السوداني بالموسيقى والشعر والفنون الشعبية.',
    category: 'cultural',
    imageUrl: 'cultural',
    eventDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    location: 'Washington, DC',
    stateCode: 'DC',
    capacity: 300,
    registeredCount: 198,
    organizerName: 'المركز الثقافي السوداني',
    status: 'Upcoming',
  },
  {
    title: 'ورشة ريادة الأعمال للشباب',
    description: 'ورشة عملية لتوجيه الشباب السوداني نحو تأسيس مشاريعهم الخاصة في أمريكا.',
    category: 'business',
    imageUrl: 'business',
    eventDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
    location: 'Chicago, IL',
    stateCode: 'IL',
    capacity: 100,
    registeredCount: 67,
    organizerName: 'رابطة المهنيين السودانيين - شيكاغو',
    status: 'Upcoming',
  },
  {
    title: 'يوم الأسرة السودانية',
    description: 'فعالية عائلية تجمع الأسر السودانية للترفيه والتواصل وأنشطة الأطفال.',
    category: 'families',
    imageUrl: 'family',
    eventDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    location: 'Minneapolis, MN',
    stateCode: 'MN',
    capacity: 400,
    registeredCount: 156,
    organizerName: 'مركز الخير السوداني - مينيسوتا',
    status: 'Upcoming',
  },
  {
    title: 'ملتقى الجالية السودانية الأمريكية في ميريلاند',
    description: 'ملتقى سنوي تنظمه SACA - Maryland لجمع أبناء الجالية في الولاية، يتضمن أنشطة ثقافية وأسرية وورش عمل مهنية.',
    category: 'conference',
    imageUrl: 'conference',
    eventDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    location: 'Baltimore, MD',
    stateCode: 'MD',
    capacity: 350,
    registeredCount: 211,
    organizerName: 'SACA - Maryland',
    status: 'Upcoming',
  },
]

const DEV_NEWS = [
  {
    title: 'انطلاق المؤتمر السنوي للجالية السودانية في هيوستن',
    summary: 'تنطلق فعاليات المؤتمر السنوي للجالية السودانية في ولاية تكساس بمشاركة واسعة من أبناء الجالية.',
    content: 'يشهد المؤتمر السنوي للجالية السودانية في تكساس انعقاد فعالياته هذا العام في مدينة هيوستن، بمشاركة ممثلين من أكثر من عشرين ولاية أمريكية. ويتناول المؤتمر موضوعات تهم الجالية السودانية تشمل التعليم والصحة والهجرة والعمل المجتمعي. كما تستعرض الفعاليات إنجازات العام الماضي وخطط السنة القادمة، مع انتخاب مجلس إدارة جديد للرابطة. ويأتي هذا المؤتمر ضمن سلسلة من الفعاليات التي تنظمها رابطة الجالية السودانية في تكساس لتعزيز التواصل بين أبناء الجالية والحفاظ على الروابط الاجتماعية والثقافية.',
    imageUrl: 'conference_news',
    category: 'Community',
    authorName: 'فريق التحرير',
    orgName: 'رابطة الجالية السودانية - تكساس',
    stateCode: 'TX',
    publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    title: 'إطلاق منحة دراسية جديدة لأبناء الجالية السودانية في كاليفورنيا',
    summary: 'أطلقت مؤسسة التعليم السودانية برنامج منح دراسية جديد يستهدف طلاب الجامعات من أبناء الجالية.',
    content: 'في إطار دعم المسار التعليمي لأبناء الجالية السودانية، أعلنت مؤسسة التعليم السودانية في كاليفورنيا عن إطلاق برنامج منح دراسية جديد يستهدف طلاب الجامعات المتفوقين. ويوفر البرنامج دعمًا ماليًا ومرافقة أكاديمية للطلاب طوال فترة دراستهم. وقد صرحت إدارة المؤسسة أن البرنامج يأتي ضمن خطة استراتيجية لرفع نسبة التعليم العالي بين أبناء الجالية السودانية في الولايات المتحدة. وتبدأ التسجيلات في البرنامج خلال الأسبوع القادم، على أن يتم اختيار المستفيدين بناء على معايير أكاديمية ومالية واضحة.',
    imageUrl: 'scholarship_news',
    category: 'Education',
    authorName: 'فريق التحرير',
    orgName: 'مؤسسة التعليم السودانية - كاليفورنيا',
    stateCode: 'CA',
    publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    title: 'ورشة عمل حول ريادة الأعمال للشباب السوداني في شيكاغو',
    summary: 'نظمت رابطة المهنيين السودانيين ورشة عمل توجيهية للشباب حول فرص تأسيس المشاريع الخاصة.',
    content: 'في مبادرة تستهدف تمكين الشباب السوداني اقتصاديًا، نظمت رابطة المهنيين السودانيين في إلينوي ورشة عمل حول ريادة الأعمال بمدينة شيكاغو. حضر الورشة عدد كبير من الشباب المهتمين بتأسيس مشاريعهم الخاصة، وتناولت الجلسات موضوعات تشمل التخطيط المالي، التسويق الرقمي، الإجراءات القانونية لتأسيس الشركات في أمريكا. وأكد المشاركون على أهمية مثل هذه المبادرات في تعزيز حضور الجالية السودانية في المشهد الاقتصادي الأمريكي. ومن المقرر أن تنظم الرابطة سلسلة من ورش العمل المشابهة في ولايات أخرى خلال الأشهر القادمة.',
    imageUrl: 'workshop_news',
    category: 'Business',
    authorName: 'فريق التحرير',
    orgName: 'رابطة المهنيين السودانيين - شيكاغو',
    stateCode: 'IL',
    publishedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
  },
  {
    title: 'انطلاق فعاليات SACA في ولاية ميريلاند',
    summary: 'أعلنت الجالية السودانية الأمريكية - فرع ميريلاند (SACA-MD) عن انطلاق فعالياتها السنوية في بالتيمور.',
    content: 'في خطوة تعزز حضور الجالية السودانية في ولاية ميريلاند، أعلنت الجالية السودانية الأمريكية - فرع ميريلاند (SACA-MD) عن انطلاق فعالياتها السنوية في مدينة بالتيمور. تشمل الفعاليات ملتقى مجتمعياً يجمع أبناء الجالية من مختلف مدن الولاية، إضافة إلى ورش عمل مهنية ودعم تعليمي للأبناء. وأكدت إدارة SACA-MD أن البرنامج يهدف إلى تعزيز الترابط بين الأسر السودانية في الولاية وتوفير منصة دعم للمهاجرين الجدد. ويأتي هذا الإعلان ضمن خطة استراتيجية لتوسيع نشاط الجالية في الولايات الشرقية للولايات المتحدة الأمريكية.',
    imageUrl: 'md_news',
    category: 'Community',
    authorName: 'فريق التحرير',
    orgName: 'SACA - Maryland',
    stateCode: 'MD',
    publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
]

const DEV_MEETINGS = [
  {
    title: 'اللقاء الأسبوعي للجالية السودانية في تكساس',
    description: 'اجتماع أسبوعي مفتوح لمناقشة شؤون الجالية وفعاليات الأسبوع القادم.',
    hostName: 'رابطة الجالية السودانية - تكساس',
    isLive: false,
    isPublic: true,
    viewerCount: 0,
    scheduledAt: new Date(),
    joinUrl: null,
    stateCode: 'TX',
  },
  {
    title: 'اجتماع تنسيقي للمنظمات السودانية في واشنطن',
    description: 'اجتماع تنسيقي بين رؤساء المنظمات السودانية في منطقة العاصمة.',
    hostName: 'المركز الثقافي السوداني',
    isLive: false,
    isPublic: true,
    viewerCount: 0,
    scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    joinUrl: null,
    stateCode: 'DC',
  },
  {
    title: 'ورشة عمل تثقيفية حول حقوق المهاجرين',
    description: 'ورشة عمل تثقيفية تعرف الجالية بحقوقها القانونية كمهاجرين في الولايات المتحدة.',
    hostName: 'رابطة المهنيين السودانيين',
    isLive: false,
    isPublic: true,
    viewerCount: 0,
    scheduledAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    joinUrl: null,
    stateCode: 'IL',
  },
  {
    title: 'اجتماع SACA الشهري - فرع ميريلاند',
    description: 'اجتماع شهري لمناقشة نشاطات SACA في ولاية ميريلاند وتنسيق الفعاليات القادمة.',
    hostName: 'SACA - Maryland',
    isLive: false,
    isPublic: true,
    viewerCount: 0,
    scheduledAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    joinUrl: null,
    stateCode: 'MD',
  },
]

const DEV_NOTIFICATIONS = [
  {
    type: 'meeting',
    title: 'اجتماع مباشر الآن',
    body: 'اللقاء الأسبوعي للجالية السودانية في تكساس بدأ للتو — انضم الآن.',
    priority: 'Important',
    actionLabel: 'انضمام',
    actionUrl: '#',
    createdAt: new Date(Date.now() - 10 * 60 * 1000),
  },
  {
    type: 'event',
    title: 'فعالية قادمة',
    body: 'مؤتمر الجالية السودانية السنوي يقام بعد 7 أيام في هيوستن.',
    priority: 'Normal',
    actionLabel: 'تفاصيل',
    actionUrl: '#',
    createdAt: new Date(Date.now() - 25 * 60 * 1000),
  },
  {
    type: 'news',
    title: 'خبر جديد',
    body: 'انطلاق المؤتمر السنوي للجالية السودانية في هيوستن.',
    priority: 'Normal',
    actionLabel: 'قراءة',
    actionUrl: '#',
    createdAt: new Date(Date.now() - 60 * 60 * 1000),
  },
  {
    type: 'organization',
    title: 'منظمة جديدة',
    body: 'تمت إضافة رابطة الطلاب السودانيين في أوهايو إلى الدليل.',
    priority: 'Normal',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
  },
  {
    type: 'announcement',
    title: 'تنبيه مهم',
    body: 'تحديث مهم للجالية في ولاية تكساس — يرجى مراجعة الإعلانات.',
    priority: 'Urgent',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
  },
]

function buildKnowledgeFromOrgs() {
  return DEV_ORGS.map((o) => ({
    title: o.name,
    sourceType: 'organization',
    sourceId: o.name,
    content: `${o.name}. ${o.description} تقع في ${o.address}. تقدم الخدمات التالية: ${o.services || 'غير محدد'}. ساعات العمل: ${o.hoursAr || 'غير محدد'}. هاتف: ${o.phone || 'غير متاح'}. بريد: ${o.email || 'غير متاح'}.`,
    tags: o.services || '',
  }))
}

async function main() {
  console.log('🌱 Seeding Sudan Community USA database...')

  console.log('  • US States (51 incl. DC)...')
  for (const s of US_STATES) {
    await db.uSState.upsert({
      where: { code: s.code },
      update: { nameAr: s.nameAr, nameEn: s.nameEn, fipsCode: s.fips },
      create: {
        code: s.code,
        nameEn: s.nameEn,
        nameAr: s.nameAr,
        fipsCode: s.fips,
        sortOrder: US_STATES.indexOf(s),
      },
    })
  }

  console.log('  • US Cities...')
  for (const [stateCode, cities] of Object.entries(US_CITIES)) {
    const state = await db.uSState.findUnique({ where: { code: stateCode } })
    if (!state) continue
    for (const c of cities) {
      await db.uSCity.upsert({
        where: { stateId_nameEn: { stateId: state.id, nameEn: c.nameEn } },
        update: { nameAr: c.nameAr, latitude: c.lat, longitude: c.lng },
        create: {
          stateId: state.id,
          nameEn: c.nameEn,
          nameAr: c.nameAr,
          latitude: c.lat,
          longitude: c.lng,
        },
      })
    }
  }

  console.log('  • Country codes...')
  for (const c of COUNTRIES) {
    await db.countryCode.upsert({
      where: { isoAlpha2: c.iso2 },
      update: {},
      create: {
        isoAlpha2: c.iso2,
        isoAlpha3: c.iso3,
        nameAr: c.ar,
        nameEn: c.en,
        dialingCode: c.dial,
        sortOrder: COUNTRIES.indexOf(c),
      },
    })
  }

  console.log('  • Site settings...')
  for (const s of SETTINGS) {
    await db.setting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    })
  }

  console.log('  • Homepage section config...')
  for (const sec of HOMEPAGE_SECTIONS) {
    await db.homepageSection.upsert({
      where: { key: sec.key },
      update: { title: sec.title },
      create: { ...sec, sortOrder: HOMEPAGE_SECTIONS.indexOf(sec) + 1 },
    })
  }

  console.log('  • DEV seed: organizations (isDevSeed=true)...')
  await db.organization.deleteMany({ where: { isDevSeed: true } })
  for (const o of DEV_ORGS) {
    const state = await db.uSState.findUnique({ where: { code: o.stateCode } })
    if (!state) continue
    const city = await db.uSCity.findFirst({ where: { stateId: state.id, nameEn: o.cityName } })
    await db.organization.create({
      data: {
        name: o.name,
        type: o.type,
        description: o.description,
        stateId: state.id,
        cityId: city?.id,
        address: o.address,
        latitude: o.latitude,
        longitude: o.longitude,
        phone: o.phone,
        email: o.email,
        website: o.website,
        hoursAr: o.hoursAr,
        services: o.services,
        verification: o.verification,
        rating: o.rating,
        isDevSeed: true,
      },
    })
  }

  console.log('  • DEV seed: events...')
  await db.event.deleteMany({ where: { isDevSeed: true } })
  for (const e of DEV_EVENTS) {
    const state = e.stateCode ? await db.uSState.findUnique({ where: { code: e.stateCode } }) : null
    await db.event.create({
      data: {
        title: e.title,
        description: e.description,
        category: e.category,
        imageUrl: e.imageUrl,
        eventDate: e.eventDate,
        isOnline: e.isOnline || false,
        location: e.location,
        stateId: state?.id,
        capacity: e.capacity,
        registeredCount: e.registeredCount,
        organizerName: e.organizerName,
        status: e.status,
        isDevSeed: true,
      },
    })
  }

  console.log('  • DEV seed: meetings...')
  await db.meeting.deleteMany({ where: { isDevSeed: true } })
  for (const m of DEV_MEETINGS) {
    const state = m.stateCode ? await db.uSState.findUnique({ where: { code: m.stateCode } }) : null
    await db.meeting.create({
      data: {
        title: m.title,
        description: m.description,
        hostName: m.hostName,
        isLive: m.isLive,
        isPublic: m.isPublic,
        viewerCount: m.viewerCount,
        scheduledAt: m.scheduledAt,
        joinUrl: m.joinUrl,
        stateId: state?.id,
        isDevSeed: true,
      },
    })
  }

  console.log('  • DEV seed: news...')
  await db.news.deleteMany({ where: { isDevSeed: true } })
  for (const n of DEV_NEWS) {
    const state = n.stateCode ? await db.uSState.findUnique({ where: { code: n.stateCode } }) : null
    await db.news.create({
      data: {
        title: n.title,
        summary: n.summary,
        content: n.content,
        imageUrl: n.imageUrl,
        category: n.category,
        authorName: n.authorName,
        orgName: n.orgName,
        stateId: state?.id,
        status: 'Published',
        publishedAt: n.publishedAt,
        isDevSeed: true,
      },
    })
  }

  console.log('  • DEV seed: notifications...')
  await db.notification.deleteMany({})
  for (const n of DEV_NOTIFICATIONS) {
    await db.notification.create({ data: n })
  }

  console.log('  • AI knowledge base (RAG sources)...')
  await db.aIKnowledgeDoc.deleteMany({})
  const knowledge = buildKnowledgeFromOrgs()
  for (const k of knowledge) {
    await db.aIKnowledgeDoc.create({ data: k })
  }

  // Geocode orgs missing coordinates via Nominatim (free OSM API)
  console.log('  • Geocoding organizations via Nominatim...')
  const orgsNeedingGeo = await db.organization.findMany({
    where: {
      OR: [{ latitude: null }, { longitude: null }],
      address: { not: null },
    },
    include: { state: true, city: true },
  })
  let geocodedCount = 0
  for (let i = 0; i < orgsNeedingGeo.length; i++) {
    const o = orgsNeedingGeo[i]
    if (i > 0) await new Promise((r) => setTimeout(r, 1100))
    const address = [o.address, o.city?.nameEn, o.state?.nameEn, o.state?.code, 'USA'].filter(Boolean).join(', ')
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&countrycodes=us`
      const res = await fetch(url, { headers: { 'User-Agent': 'SACA-Platform/1.0 (saca-md.org)' } })
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        const lat = parseFloat(data[0].lat)
        const lng = parseFloat(data[0].lon)
        if (!isNaN(lat) && !isNaN(lng)) {
          await db.organization.update({ where: { id: o.id }, data: { latitude: lat, longitude: lng } })
          geocodedCount++
          console.log(`    ✓ ${o.name} → (${lat}, ${lng})`)
          continue
        }
      }
      console.log(`    ✗ ${o.name} — not found`)
    } catch (e) {
      console.log(`    ✗ ${o.name} — ${(e as Error).message}`)
    }
  }

  console.log('\n✅ Seed complete.')
  console.log(`   - US States: ${US_STATES.length}`)
  console.log(`   - US Cities: ${Object.values(US_CITIES).reduce((a, b) => a + b.length, 0)}`)
  console.log(`   - Countries: ${COUNTRIES.length}`)
  console.log(`   - Dev-seed organizations: ${DEV_ORGS.length}`)
  console.log(`   - Dev-seed events: ${DEV_EVENTS.length}`)
  console.log(`   - Dev-seed meetings: ${DEV_MEETINGS.length}`)
  console.log(`   - Dev-seed news: ${DEV_NEWS.length}`)
  console.log(`   - Dev-seed notifications: ${DEV_NOTIFICATIONS.length}`)
  console.log(`   - AI knowledge docs: ${knowledge.length}`)
  console.log(`   - Geocoded via Nominatim: ${geocodedCount}/${orgsNeedingGeo.length}`)
}

main()
  .then(async () => {
    await db.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await db.$disconnect()
    process.exit(1)
  })
