# واجهة إنشاء حساب - التوثيق التفصيلي

## نظرة عامة

واجهة إنشاء حساب متعددة الخطوات (Multi-Step Wizard) مصممة لجمع بيانات المستخدم بشكل تدريجي، مع دعم كامل للعربية والإنجليزية واتجاه RTL.

---

## الهيكل العام

```
┌─────────────────────────────────────────────────────┐
│  [AR/EN]                                             │
│ ┌──────────────────┐  ┌────────────────────────────┐ │
│ │                  │  │  إنشاء حساب                │ │
│ │   صورة ترحيبية   │  │  ─────────────             │ │
│ │                  │  │  [1]─[2]─[3]─[4]           │ │
│ │  ✦ انضم للشبكة  │  │  ┌──────────────────────┐  │ │
│ │                  │  │  │  محتوى الخطوة الحالية │  │ │
│ │  24k+ عضو نشط   │  │  └──────────────────────┘  │ │
│ │                  │  │  [رجوع]          [التالي]  │ │
│ └──────────────────┘  └────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### المكونات الرئيسية

| المكون | الملف | الوظيفة |
|--------|-------|---------|
| `SignUpView` | `sign-up/view/index.jsx` | الحاوية الرئيسية وتتبع الحالة |
| `StepPersonalInfo` | `components/StepPersonalInfo.jsx` | خطوة المعلومات الشخصية |
| `StepAccount` | `components/StepAccount.jsx` | خطوة إعداد الحساب |
| `StepProfessional` | `components/StepProfessional.jsx` | خطوة المعلومات المهنية |
| `StepCompanyInfo` | `components/StepCompanyInfo.jsx` | خطوة معلومات الشركة |
| `StepCompanyDetails` | `components/StepCompanyDetails.jsx` | خطوة تفاصيل الشركة |
| `StepAvatarReview` | `components/StepAvatarReview.jsx` | خطوة رفع الصورة |

---

## تدفق الخطوات

### للموظف الباحث عن عمل (JobSeeker)

```
المعلومات الشخصية → الحساب → المعلومات المهنية → الصورة
     ①              ②          ③               ④
```

### لصاحب العمل (Employer)

```
المعلومات الشخصية → الحساب → معلومات الشركة → تفاصيل الشركة → الصورة
     ①              ②          ③              ④            ⑤
```

### للعميل الحر (FreelanceClient)

```
المعلومات الشخصية → الحساب → المعلومات المهنية → الصورة
     ①              ②          ③               ④
```

> **ملاحظة:** نوع الحساب (Step ②) يحدد تدفق الخطوات المتبقية. عند اختيار "صاحب عمل"، تظهر خطوات الشركة بدلاً من المهنية.

---

## تفاصيل كل خطوة

### الخطوة ①: المعلومات الشخصية

```
┌──────────────────────────────┐
│  الاسم الأول *               │
│  ┌──────────────────────────┐│
│  │                          ││
│  └──────────────────────────┘│
│  اسم العائلة *               │
│  ┌──────────────────────────┐│
│  │                          ││
│  └──────────────────────────┘│
│  البريد الإلكتروني *         │
│  ┌──────────────────────────┐│
│  │                          ││
│  └──────────────────────────┘│
│  الجنس                       │
│  ┌──────────────────────────┐│
│  │  ذكر ▾                   ││
│  └──────────────────────────┘│
│  رقم الهاتف (اختياري)        │
│  ┌──────────────────────────┐│
│  │                          ││
│  └──────────────────────────┘│
└──────────────────────────────┘
```

**الحقول:**

| الحقل | النوع | مطلوب | التحقق |
|-------|-------|-------|--------|
| firstName | نص | نعم | لا يُقبل فارغاً |
| lastName | نص | نعم | لا يُقبل فارغاً |
| email | بريد إلكتروني | نعم | يتحقق من التنسيق: `user@domain.ext` |
| gender | قائمة منسدلة | لا | خيارات: ذكر / أنثى |
| phoneNumber | نص | لا | حقل حر |

### الخطوة ②: إعداد الحساب

```
┌──────────────────────────────┐
│  كلمة المرور *               │
│  ┌──────────────────────[👁] │
│  │ 6 أحرف على الأقل          │
│  └──────────────────────────┘│
│  نوع الحساب                  │
│  ┌──────────────────────────┐│
│  │  باحث عن عمل ▾           ││
│  └──────────────────────────┘│
└──────────────────────────────┘
```

**الحقول:**

| الحقل | النوع | مطلوب | التحقق |
|-------|-------|-------|--------|
| password | نص (مخفي) | نعم | 6 أحرف على الأقل، زر إظهار/إخفاء |
| role | قائمة منسدلة | نعم | باحث عن عمل / صاحب عمل / عميل حر |

**تأثير نوع الحساب على التدفق:**

```
JobSeeker    ──→ StepProfessional ──→ StepAvatarReview
Employer     ──→ StepCompanyInfo  ──→ StepCompanyDetails ──→ StepAvatarReview
Freelance    ──→ StepProfessional ──→ StepAvatarReview
```

### الخطوة ③ (موظف): المعلومات المهنية

```
┌──────────────────────────────┐
│  المجال (اختياري)            │
│  ┌──────────────────────────┐│
│  │ التكنولوجيا، الصحة...    ││
│  └──────────────────────────┘│
│  سنوات الخبرة (اختياري)      │
│  ┌──────────────────────────┐│
│  │ 5                        ││
│  └──────────────────────────┘│
│  المهارات (انقر للتحديد)     │
│  ┌──────┐ ┌──────┐ ┌──────┐ │
│  │React │ │Python│ │AWS ▸ │ │
│  └──────┘ └──────┘ └──────┘ │
│  ┌──────┐ ┌──────┐ ┌──────┐ │
│  │Docker│ │Node  │ │المزيد│ │
│  └──────┘ └──────┘ └──────┘ │
└──────────────────────────────┘
```

**الحقول:**

| الحقل | النوع | مطلوب | ملاحظات |
|-------|-------|-------|---------|
| industry | نص حر | لا | يدوّن يدوياً |
| yearsOfExperience | رقم | لا | حقل رقمي |
| skills | مجموعة شرائح | لا | انقر للتحديد/الإلغاء، أو فتح نافذة المهارات |

**الorias_skills المُقترحة:**
React, Node.js, Python, UI/UX Design, Graphic Design, JavaScript, TypeScript, MongoDB, Docker, AWS, Flutter, React Native, Vue.js, Angular, PHP

**زر "المزيد..."** يفتح `SkillsModal` مع 24 فئة للمهارات.

### الخطوة ③ (صاحب عمل): معلومات الشركة

```
┌──────────────────────────────┐
│  أخبرنا عن شركتك             │
│  اسم الشركة *                │
│  ┌──────────────────────────┐│
│  │                          ││
│  └──────────────────────────┘│
│  وصف نشاط الشركة             │
│  ┌──────────────────────────┐│
│  │                          ││
│  │                          ││
│  └──────────────────────────┘│
│  مجال الشركة                 │
│  ┌──────────────────────────┐│
│  │  اختر المجال ▾           ││
│  └──────────────────────────┘│
│  مقر الشركة                  │
│  ┌──────────────────────────┐│
│  │                          ││
│  └──────────────────────────┘│
└──────────────────────────────┘
```

**الحقول:**

| الحقل | النوع | مطلوب | ملاحظات |
|-------|-------|-------|---------|
| companyName | نص | نعم | خطأ يظهر عند الإرسال إن فارغ |
| companyDescription | نص متعدد الأسطر | لا | 3 صفوف |
| companyIndustry | قائمة منسدلة | لا | 17 مجال (تطوير، تصميم، أمن، ذكاء اصطناعي...) |
| companyLocation | نص حر | لا | الموقع الجغرافي للشركة |

**المجالات المتاحة:**

| القيمة | العربية | الإنجليزية |
|--------|---------|-----------|
| web-development | تطوير المواقع | Web Development |
| mobile-development | تطوير تطبيقات الجوال | Mobile Development |
| frontend | تطوير الواجهات الأمامية | Frontend Development |
| backend | تطوير الخلفيات | Backend Development |
| fullstack | تطوير شامل | Full Stack Development |
| devops | DevOps والحوسبة السحابية | DevOps & Cloud |
| ai-ml | الذكاء الاصطناعي والتعلم الآلي | AI & Machine Learning |
| data-science | علوم البيانات والتحليلات | Data Science & Analytics |
| cybersecurity | الأمن السيبراني | Cybersecurity |
| ui-ux | تصميم واجهات وتجربة المستخدم | UI/UX Design |
| qa-testing | الجودة والاختبار | QA & Testing |
| game-dev | تطوير الألعاب | Game Development |
| blockchain | بلوكتشين وويب 3 | Blockchain & Web3 |
| iot | إنترنت الأشياء والأنظمة المدمجة | IoT & Embedded Systems |
| saas | منتجات SaaS | SaaS Products |
| ecommerce-tech | تقنيات التجارة الإلكترونية | E-commerce Tech |
| other | أخرى | Other |

### الخطوة ④ (صاحب عمل): تفاصيل الشركة

```
┌──────────────────────────────┐
│  تفاصيل إضافية عن الشركة    │
│  (اختياري)                   │
│  الموقع الإلكتروني           │
│  ┌──────────────────────────┐│
│  │ https://                 ││
│  └──────────────────────────┘│
│  حجم الشركة                  │
│  ┌──────────────────────────┐│
│  │  اختر الحجم ▾            ││
│  └──────────────────────────┘│
│  سنة التأسيس                │
│  ┌──────────────────────────┐│
│  │  اختر السنة ▾            ││
│  └──────────────────────────┘│
└──────────────────────────────┘
```

**الحقول:**

| الحقل | النوع | مطلوب | ملاحظات |
|-------|-------|-------|---------|
| website | نص | لا | يبدأ بـ `https://` |
| companySize | قائمة منسدلة | لا | 6 خيارات من 1-10 إلى 1000+ |
| foundedYear | قائمة منسدلة | لا | آخر 25 سنة |

**أحجام الشركة:**

| القيمة | النص |
|--------|------|
| 1-10 | 1-10 موظفين |
| 11-50 | 11-50 موظف |
| 51-200 | 51-200 موظف |
| 201-500 | 201-500 موظف |
| 501-1000 | 501-1000 موظف |
| 1000+ | 1000+ موظف |

### الخطوة الأخيرة: رفع الصورة

```
┌──────────────────────────────┐
│         ┌──────────┐         │
│         │  [ A  L ]│         │
│         │  (صورة)  │         │
│         └──────────┘         │
│                              │
│      [ تغيير الصورة ]        │
│                              │
│  JPG، PNG أو WebP. حد 5MB.  │
└──────────────────────────────┘
```

**ال Salmonella:**

| العنصر | الوظيفة |
|--------|---------|
| Avatar | يعرض الأحرف الأولى من الاسم إن لم تُرفع صورة |
| زر التغيير | يفتح نافذة اختيار الملفات |
| المعاينة | يعرض الصورة فوراً بعد الاختيار |

**القيود على الصورة:**
- الصيغ المقبولة: `image/jpeg`, `image/png`, `image/webp`
- الحد الأقصى للحجم: 5 ميجابايت

---

## حالة النموذج (State Management)

### هيكل البيانات

```javascript
{
  // شخصي
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  gender: '',

  // حساب
  password: '',
  role: 'JobSeeker',  // JobSeeker | Employer | FreelanceClient

  // مهني
  industry: '',
  yearsOfExperience: '',
  skills: [],

  // شركة
  companyName: '',
  companyDescription: '',
  companyIndustry: '',
  companyLocation: '',
  website: '',
  companySize: '',
  foundedYear: '',

  // صورة
  avatar: null  // File object أو null
}
```

### التحقق من الصحة

```javascript
// الخطوة ①: المعلومات الشخصية
{
  firstName:  'Required'     // إن فارغ
  lastName:   'Required'     // إن فارغ
  email:      'Required'     // إن فارغ
  email:      'Invalid email' // إنتنسيق خاطئ
}

// الخطوة ②: الحساب
{
  password:   'Required'          // إن فارغ
  password:   'At least 6 chars'  // إن أقل من 6
}

// الخطوة ③ (صاحب عمل): معلومات الشركة
{
  companyName: 'Company name is required'  // إن فارغ
}
```

### تدفق الإرسال (Submit Flow)

```
المستخدم يضغط "إنشاء حساب"
         │
         ▼
   إنشاء FormData
         │
         ├── firstName, lastName, email, password, role
         ├── phoneNumber (إن موجود)
         ├── gender (إن موجود)
         ├── industry (إن موجود)
         ├── yearsOfExperience (إن موجود)
         ├── skills[] (كل مهارة)
         ├── companyName (إن صاحب عمل)
         ├── companyDescription (إن صاحب عمل)
         ├── companyIndustry (إن صاحب عمل)
         ├── companyLocation (إن صاحب عمل)
         ├── website (إن صاحب عمل)
         ├── companySize (إن صاحب عمل)
         ├── foundedYear (إن صاحب عمل)
         └── avatar (إن موجود)
              │
              ▼
     POST /auth/signup (FormData)
              │
              ▼
     ┌────────┴────────┐
     │                 │
  نجاح              خطأ
     │                 │
     ▼                 ▼
  حفظ التوكن      عرض الخطأ
  في localStorage   تحت النموذج
     │
     ▼
  التوجيه إلى /
```

---

## النماذج التقنية (Tech Stack)

| التقنية | الاستخدام |
|---------|----------|
| React 19 | بناء الواجهة |
| MUI (Material UI) v9 | مكتبة المكونات |
| react-i18next | الترجمة bilingual |
| react-router-dom | التوجيه |
| Redux Toolkit | إدارة الحالة العامة |
| FormData | إرسال الصورة مع البيانات |
| Framer Motion | الحركات والانتقالات |

---

## الترجمة (i18n)

### مفاتيح الترجمة المستخدمة

```json
{
  "auth": {
    "signInTitle": "تسجيل الدخول للمتابعة",
    "signUpTitle": "إنشاء حساب",
    "signUpSub": "املأ بياناتك للبدء",
    "firstName": "الاسم الأول",
    "lastName": "اسم العائلة",
    "email": "البريد الإلكتروني",
    "gender": "الجنس",
    "male": "ذكر",
    "female": "أنثى",
    "phoneOptional": "رقم الهاتف (اختياري)",
    "accountType": "نوع الحساب",
    "roleJobSeeker": "باحث عن عمل",
    "roleEmployer": "صاحب عمل",
    "roleFreelance": "عميل حر",
    "password": "كلمة المرور",
    "passwordHelper": "6 أحرف على الأقل",
    "companySubtitle": "أخبرنا عن شركتك",
    "companyName": "اسم الشركة",
    "companyDesc": "وصف نشاط الشركة",
    "companyIndustry": "مجال الشركة",
    "selectIndustry": "اختر المجال",
    "companyLocation": "مقر الشركة",
    "companyDetailsSubtitle": "تفاصيل إضافية عن الشركة (اختياري)",
    "website": "الموقع الإلكتروني",
    "companySize": "حجم الشركة",
    "selectSize": "اختر الحجم",
    "foundedYear": "سنة التأسيس",
    "selectYear": "اختر السنة",
    "industryOptional": "المجال (اختياري)",
    "yearsExpOptional": "سنوات الخبرة (اختياري)",
    "skillsLabel": "المهارات (انقر للتحديد)",
    "moreSkills": "المزيد...",
    "changePhoto": "تغيير الصورة",
    "uploadPhoto": "رفع صورة",
    "photoHint": "JPG، PNG أو WebP. حد أقصى 5 ميجا.",
    "back": "رجوع",
    "next": "التالي",
    "createAccount": "إنشاء حساب",
    "required": "مطلوب",
    "invalidEmail": "تنسيق البريد الإلكتروني غير صالح",
    "minChars": "6 أحرف على الأقل"
  }
}
```

### كيفية التبديل بين اللغات

```javascript
// في المكون الرئيسي
const { i18n } = useTranslation()

const toggleLang = () => {
  const next = i18n.language === 'en' ? 'ar' : 'en'
  i18n.changeLanguage(next)
  document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr'
}
```

---

## RTL (اتجاه من اليمين لليسار)

### الخصائص المُستخدمة

```css
/* بدلاً من left/right */
inset-inline-start: 16px    /* يطابق left في LTR و right في RTL */
inset-inline-end: 16px      /* يطابق right في LTR و left في RTL */

/* بدلاً من margin-left/margin-right */
mril: 1.5    /* margin-inline-start */
mlil: 1.5    /* margin-inline-end */

/* بدلاً من padding-left/padding-right */
paddingInlineStart: 8px
paddingInlineEnd: 8px
```

### مثال على الزر前景 للتغريد

```jsx
// ✅ صحيح
<IconButton sx={{ position: 'fixed', top: 16, insetInlineEnd: 16 }}>

// ❌ خطأ
<IconButton sx={{ position: 'fixed', top: 16, right: 16 }}>
```

---

## الأنيميشن

### مراحل التحميل

| التأخير | التأثير |
|---------|---------|
| `0s` | ظهور أول حقل |
| `0.08s` | ظهور الحقل الثاني |
| `0.16s` | ظهور الحقل الثالث |
| `0.24s` | ظهور الحقل الرابع |
| `0.32s` | ظهور الحقل الخامس |
| `0.5s` | ظهور زر التبديل |

### انتقالات الخطوات

```javascript
// للخلف
{ animation: 'slideInRight 0.35s ease both' }

// للأمام
{ animation: 'slideInLeft 0.35s ease both' }
```

```css
@keyframes slideInRight {
  from { opacity: 0; transform: translateX(24px); }
  to   { opacity: 1; transform: translateX(0); }
}

@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(-24px); }
  to   { opacity: 1; transform: translateX(0); }
}
```

### تأثير النبض على الخطوة النشطة

```css
@keyframes pulse {
  0%, 100% { transform: scale(1);   opacity: 0.15; }
  50%      { transform: scale(1.08); opacity: 0.25; }
}
```

---

## الوصول (Accessibility)

| الخاصية | المكون | القيمة |
|---------|--------|--------|
| `aria-label` | زر تبديل اللغة | وصف للحالة الحالية |
| `role="alert"` | رسالة الخطأ | يُقرأ تلقائياً by screen readers |
| `required` | الحقول المطلوبة | يُحدد للقارئ أن الحقل إجباري |
| `error` | TextField | يُظهر حدود حمراء + نص مساعد |
| `aria-busy` | زر الإرسال | عند التحميل |

---

## أخطاء شائعة وكيفية تجنبها

### 1. استخدام `left`/`right` بدلاً من `insetInline`

```jsx
// ❌ لا يعمل في RTL
<Box sx={{ left: 0, right: 0 }}>

// ✅ يعمل في RTL
<Box sx={{ insetInline: 0 }}>
```

### 2. استخدام `lang` state بدلاً من `t()`

```jsx
// ❌ يدوي ويجب ترجمته يدوياً
<Typography>{lang === 'ar' ? 'الاسم' : 'Name'}</Typography>

// ✅ تلقائي مع i18n
<Typography>{t('auth.firstName')}</Typography>
```

### 3. إجبار الاتجاه LTR

```jsx
// ❌ يكسر RTL
useEffect(() => {
  document.documentElement.dir = 'ltr'
}, [])

// ✅ يترتب على اللغة المحددة
const toggleLang = () => {
  document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr'
}
```

### 4. استخدام ألوان ثابتة بدلاً من ثيم

```jsx
// ❌ لا يتغير مع Dark Mode
<Typography sx={{ color: '#1F0A3B' }}>

// ✅ يتغير مع الثيم
<Typography sx={{ color: 'text.primary' }}>
```

---

## الملفات المرجعية

| الملف | المسار |
|-------|--------|
| الصفحة الرئيسية | `src/features/auth/sign-up/view/index.jsx` |
| الخطوة الشخصية | `src/features/auth/sign-up/components/StepPersonalInfo.jsx` |
| خطوة الحساب | `src/features/auth/sign-up/components/StepAccount.jsx` |
| الخطوة المهنية | `src/features/auth/sign-up/components/StepProfessional.jsx` |
| معلومات الشركة | `src/features/auth/sign-up/components/StepCompanyInfo.jsx` |
| تفاصيل الشركة | `src/features/auth/sign-up/components/StepCompanyDetails.jsx` |
| رفع الصورة | `src/features/auth/sign-up/components/StepAvatarReview.jsx` |
| الترجمة العربية | `src/i18n/locales/ar.json` |
| الترجمة الإنجليزية | `src/i18n/locales/en.json` |
| الثيم | `src/theme/index.js` |
