# دليل المطور: واجهة إنشاء حساب

## كيف تبدأ

### 1. تشغيل المشروع

```bash
npm install
npm run dev
```

افتح المتصفح على `http://localhost:5173/sign-up`

### 2. هيكل الملفات

```
src/features/auth/sign-up/
├── view/
│   └── index.jsx              ← الصفحة الرئيسية (الحاوية + Stepper)
├── components/
│   ├── StepPersonalInfo.jsx   ← حقول المعلومات الشخصية
│   ├── StepAccount.jsx        ← كلمة المرور + نوع الحساب
│   ├── StepProfessional.jsx   ← المهارات + الخبرة
│   ├── StepCompanyInfo.jsx    ← معلومات الشركة (صاحب عمل فقط)
│   ├── StepCompanyDetails.jsx ← تفاصيل إضافية للشركة
│   └── StepAvatarReview.jsx   ← رفع صورة الملف الشخصي
```

---

## كيف يعمل التدفق

### تغيير نوع الحساب يُغيّر الخطوات

```
JobSeeker → 4 خطوات: شخصي → حساب → مهني → صورة
Employer  → 5 خطوات: شخصي → حساب → شركة → تفاصيل شركة → صورة
Freelance → 4 خطوات: شخصي → حساب → مهني → صورة
```

**الكود المسؤول عن هذا:**

```javascript
// في sign-up/view/index.jsx
const STEPS_BY_ROLE = {
  Employer: ['personal', 'account', 'companyInfo', 'companyDetails', 'photo'],
  default: ['personal', 'account', 'professional', 'photo'],
}

const isEmployer = form.role === 'Employer'
const stepKeys = isEmployer ? STEPS_BY_ROLE.Employer : STEPS_BY_ROLE.default
```

### إضافة خطوة جديدة

**الخطوة ①:** أنشئ المكون في `components/`

```jsx
// components/StepNewFeature.jsx
import { Stack, TextField, Box } from '@mui/material'
import { useTranslation } from 'react-i18next'

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    transition: 'all 0.25s ease',
    '&:hover': { boxShadow: '0 2px 8px rgba(61,28,110,0.08)' },
    '&.Mui-focused': { boxShadow: '0 2px 12px rgba(61,28,110,0.12)' },
  },
}

export default function StepNewFeature({ form, onChange, errors }) {
  const { t } = useTranslation()

  return (
    <Stack spacing={2.5}>
      <Box sx={{ animation: 'fadeUp 0.4s ease 0s both' }}>
        <TextField
          label={t('auth.newFeatureLabel')}
          value={form.newFeature || ''}
          onChange={onChange('newFeature')}
          fullWidth
          sx={fieldSx}
        />
      </Box>
    </Stack>
  )
}
```

**الخطوة ②:** أضف الحقل في State

```javascript
// في sign-up/view/index.jsx — state الافتراضي
const [form, setForm] = useState({
  // ... الحقول الموجودة
  newFeature: '',    // ← أضف هنا
})
```

**الخطوة ③:** أضف المكون في العرض

```jsx
// في sign-up/view/index.jsx — جزء العرض
{steps[activeStep]?.key === 'newFeature' && (
  <StepNewFeature form={form} onChange={handleChange} errors={errors} />
)}
```

**الخطوة ④:** أضف المفتاح في STEPS_BY_ROLE

```javascript
const STEPS_BY_ROLE = {
  Employer: ['personal', 'account', 'companyInfo', 'companyDetails', 'photo'],
  default: ['personal', 'account', 'professional', 'newFeature', 'photo'],  // ← أضف هنا
}
```

**الخطوة ⑥:** أضف تسمية الخطوة في STEP_TKEYS

```javascript
const STEP_TKEYS = {
  personal: 'auth.stepPersonal',
  // ...
  newFeature: 'auth.stepNewFeature',  // ← أضف هنا
}
```

**الخطوة ⑦:** أضف الترجمة في `ar.json` و `en.json`

```json
// ar.json
"auth": {
  "stepNewFeature": "ميزة جديدة",
  "newFeatureLabel": "تسمية الحقل"
}

// en.json
"auth": {
  "stepNewFeature": "New Feature",
  "newFeatureLabel": "Field Label"
}
```

---

## التحقق من الصحة (Validation)

### كيف يعمل التحقق

كل خطوة لها `validateStep()` يتحقق فقط من الحقول الخاصة بها:

```javascript
const validateStep = () => {
  const errors = {}
  const stepKey = steps[activeStep]?.key

  if (stepKey === 'personal') {
    if (!form.firstName.trim()) errors.firstName = t('auth.required')
    if (!form.lastName.trim()) errors.lastName = t('auth.required')
    if (!form.email.trim()) errors.email = t('auth.required')
    else if (!/\S+@\S+\.\S+/.test(form.email)) errors.email = t('auth.invalidEmail')
  }

  if (stepKey === 'account') {
    if (!form.password) errors.password = t('auth.required')
    else if (form.password.length < 6) errors.password = t('auth.minChars')
  }

  if (stepKey === 'companyInfo') {
    if (!form.companyName.trim()) errors.companyName = t('auth.companyNameRequired')
  }

  setErrors(errors)
  return Object.keys(errors).length === 0  // true = انتقل للخطوة التالية
}
```

### إضافة تحقق جديد

```javascript
// في validateStep()
if (stepKey === 'newFeature') {
  if (!form.newFeature.trim()) {
    errors.newFeature = t('auth.required')
  }
}
```

### عرض الخطأ

الخطأ يظهر تلقائياً لأن المكونات تستخدم:

```jsx
<TextField
  error={!!errors[fieldName]}           // ← حدود حمراء
  helperText={errors[fieldName]}        // ← نص الخطأ تحت الحقل
/>
```

---

## الترجمة (i18n)

### إضافة حقل جديد بالترجمة

**القاعدة:** كل نص يظهر في الواجهة يجب أن يستخدم `t()`

```jsx
// ❌ خطأ - نص ثابت
<TextField label="First Name" />

// ✅ صحيح - مع الترجمة
<TextField label={t('auth.firstName')} />
```

### قائمة مفاتيح الترجمة الأساسية

```json
{
  "auth": {
    "firstName": "الاسم الأول",
    "lastName": "اسم العائلة",
    "email": "البريد الإلكتروني",
    "password": "كلمة المرور",
    "gender": "الجنس",
    "male": "ذكر",
    "female": "أنثى",
    "phoneOptional": "رقم الهاتف (اختياري)",
    "accountType": "نوع الحساب",
    "roleJobSeeker": "باحث عن عمل",
    "roleEmployer": "صاحب عمل",
    "roleFreelance": "عميل حر",
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
    "industryPlaceholder": "مثال: التكنولوجيا، الصحة، المالية",
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

---

## الألوان والثيم

### القاعدة

لا تستخدم ألوان ثابتة مثل `#3D1C6E`. استخدم رموز الثيم بدلاً منها:

```jsx
// ❌ لا تستخدم ألوان ثابتة
<Typography sx={{ color: '#1F0A3B' }}>
<Box sx={{ bgcolor: '#3D1C6E' }}>

// ✅ استخدم رموز الثيم
<Typography sx={{ color: 'text.primary' }}>
<Box sx={{ bgcolor: 'primary.main' }}>
```

### الرموز المتاحة

```javascript
// الألوان الأساسية
primary.main      // #3D1C6E (بنفسجي)
primary.light     // #5C3594
secondary.main    // #1F3670 (أزرق غامق)

// النصوص
text.primary       // #1F0A3B
text.secondary     // #5C5580
text.disabled      // #B5AECB

// الخلفيات
background.default // #F6F4FA
background.paper   // #FFFFFF

// الحالة
error.main         // خطأ
success.main       // نجاح
warning.main       // تحذير
info.main          // معلومات

// الحدود
divider            // لون الفواصل
```

---

## RTL (اتجاه من اليمين لليسار)

### القاعدة

استخدم الخصائص المضمنة (Logical Properties) بدلاً من الفيزيائية:

```jsx
// ❌ لا يعمل في RTL
<Box sx={{ left: 16, right: 16 }}>
<Box sx={{ marginLeft: 8, marginRight: 8 }}>
<Box sx={{ paddingLeft: 16, paddingRight: 16 }}>

// ✅ يعمل في RTL و LTR
<Box sx={{ insetInlineStart: 16, insetInlineEnd: 16 }}>
<Box sx={{ mlil: 8, mril: 8 }}>    {/* margin-inline-end */}
<Box sx={{ paddingInline: 16 }}>    {/* padding-inline-start + end */}
```

### الجدول المرجعي

| ❌ فيزيائي | ✅ مضمن | يطابق |
|-----------|---------|-------|
| `left` | `insetInlineStart` | left (LTR) / right (RTL) |
| `right` | `insetInlineEnd` | right (LTR) / left (RTL) |
| `marginLeft` | `mlil` | margin-inline-end |
| `marginRight` | `mril` | margin-inline-start |
| `paddingLeft` | `paddingInlineStart` | padding-left (LTR) / right (RTL) |
| `paddingRight` | `paddingInlineEnd` | padding-right (LTR) / left (RTL) |
| `borderLeft` | `borderInlineStart` | border-left (LTR) / right (RTL) |
| `textAlign: 'left'` | `textAlign: 'start'` | left (LTR) / right (RTL) |
| `textAlign: 'right'` | `textAlign: 'end'` | right (LTR) / left (RTL) |

---

## الأنيميشن

### إضافة حقل بأنيميشن تدريجي

```jsx
// كل حقل يظهر بعد سابقه بـ 0.08 ثانية
<Box sx={{ animation: 'fadeUp 0.4s ease 0s both' }}>
  <TextField label="الحقل الأول" />
</Box>

<Box sx={{ animation: 'fadeUp 0.4s ease 0.08s both' }}>
  <TextField label="الحقل الثاني" />
</Box>

<Box sx={{ animation: 'fadeUp 0.4s ease 0.16s both' }}>
  <TextField label="الحقل الثالث" />
</Box>
```

### انتقال بين الخطوات

```javascript
// للأمام
{ animation: 'slideInRight 0.35s ease both' }

// للخلف
{ animation: 'slideInLeft 0.35s ease both' }
```

---

## إرسال البيانات

### كيف تُرسل الصورة مع باقي البيانات

```javascript
const handleSubmit = async () => {
  const fd = new FormData()

  // النصوص العادية
  fd.append('firstName', form.firstName.trim())
  fd.append('lastName', form.lastName.trim())
  fd.append('email', form.email.trim())
  fd.append('password', form.password)
  fd.append('role', form.role)

  // الحقول الاختيارية - فقط إن موجودة
  if (form.phoneNumber) fd.append('phoneNumber', form.phoneNumber)
  if (form.gender) fd.append('gender', form.gender)
  if (form.industry) fd.append('industry', form.industry)
  if (form.yearsOfExperience) fd.append('yearsOfExperience', String(form.yearsOfExperience))

  // المهارات - كمصفوفة
  form.skills.forEach((skill) => fd.append('skills[]', skill))

  // معلومات الشركة - فقط إن كان صاحب عمل
  if (isEmployer) {
    if (form.companyName.trim()) fd.append('companyName', form.companyName.trim())
    // ... باقي حقول الشركة
  }

  // الصورة - كملف
  if (form.avatar) fd.append('avatar', form.avatar)

  const data = await signup(fd)  // ← POST /auth/signup
}
```

### نقطة الاتصال (API Endpoint)

```
POST /auth/signup
Content-Type: multipart/form-data

الاستجابة الناجحة:
{
  "token": "eyJhbGciOiJIUzI1...",
  "refreshToken": "dGhpcyBpcyBh...",
  "user": {
    "_id": "...",
    "firstName": "...",
    "lastName": "...",
    "email": "...",
    "role": "JobSeeker"
  }
}
```

---

## المشاكل الشائعة

### 1. الخطأ "companyInfo is not defined"

**السبب:** `stepKeys` تحتوي على `'companyInfo'` لكن `STEP_TKEYS` لا يحتوي عليه.

**الحل:** تأكد من إضافة المفتاح في `STEP_TKEYS`:

```javascript
const STEP_TKEYS = {
  companyInfo: 'auth.stepCompanyInfo',  // ← تحقق من وجوده
}
```

### 2. الترجمة لا تعمل

**السبب:** المفتاح غير موجود في `ar.json` أو `en.json`.

**الحل:** افتح الملف وتأكد من وجود المفتاح:

```bash
grep "auth.firstName" src/i18n/locales/ar.json
```

### 3. الألوان لا تتغير مع Dark Mode

**السبب:** استخدام ألوان ثابتة مثل `#3D1C6E`.

**الحل:** استخدم رموز الثيم:

```jsx
// بدلاً من
sx={{ bgcolor: '#3D1C6E' }}

// استخدم
sx={{ bgcolor: 'primary.main' }}
```

### 4. الأيقونات في الجهة الخاطئة في RTL

**السبب:** استخدام `left`/`right`.

**الحل:** استخدم `insetInlineStart`/`insetInlineEnd`:

```jsx
// بدلاً من
sx={{ right: 16 }}

// استخدم
sx={{ insetInlineEnd: 16 }}
```

### 5. الخطوة تظهر بدون ترجمة

**السبب:** `STEP_TKEYS` يحتوي على مفتاح خطأ.

**الحل:** اطبع المفتاح للتأكد:

```javascript
console.log(STEP_TKEYS[key])  // يجب أن يطبع: "auth.stepCompanyInfo"
```

---

## اختبار التدفق

### اختبار سريع

1. افتح `/sign-up`
2. اختر "باحث عن عمل" → يجب أن تظهر 4 خطوات
3. عدّل إلى "صاحب عمل" → يجب أن تظهر 5 خطوات
4. املأ الحقول واختبر التحقق
5. غيّر اللغة إلى العربية → تأكد من RTL
6. ارفع صورة وتأكد من المعاينة

### اختبار التحقق

```
الخطوة ①: اترك كل الحقول فارغة → اضغط "التالي"
         → يجب أن تظهر أخطاء: "مطلوب" تحت كل حقل

الخطوة ②: اكتب كلمة مرور قصيرة (3 أحرف) → اضغط "التالي"
         → يجب أن يظهر: "6 أحرف على الأقل"

الخطوة ③ (صاحب عمل): اترك اسم الشركة فارغاً → اضغط "التالي"
         → يجب أن يظهر: "اسم الشركة مطلوب"
```

---

## الملفات الرئيسية

| الملف | المهمة |
|-------|--------|
| `sign-up/view/index.jsx` | الصفحة الرئيسية + state + تدفق الخطوات |
| `sign-up/components/Step*.jsx` | حقول كل خطوة |
| `src/i18n/locales/ar.json` | الترجمة العربية |
| `src/i18n/locales/en.json` | الترجمة الإنجليزية |
| `src/theme/index.js` | الثيم والألوان |
| `src/services/authService.js` | دالة `signup()` للاتصال بالخادم |
