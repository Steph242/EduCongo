-- =========================================================================
-- EDUCONGO - SCHÉMA DE BASE DE DONNÉES SUPABASE (PostgreSQL)
-- Ministère de l'Enseignement Préscolaire, Primaire, Secondaire et de l'Alphabétisation (MEPPSA)
-- =========================================================================

-- 1. Table des Établissements Scolaires (Schools)
CREATE TABLE IF NOT EXISTS public.schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_name VARCHAR(255) NOT NULL,
    school_code VARCHAR(50) UNIQUE NOT NULL,
    school_type VARCHAR(50) NOT NULL,
    department VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    arrondissement VARCHAR(100),
    director_name VARCHAR(255) NOT NULL,
    admin_full_name VARCHAR(255) NOT NULL,
    admin_role VARCHAR(100) NOT NULL,
    work_email VARCHAR(255) UNIQUE NOT NULL,
    personal_email VARCHAR(255),
    work_phone VARCHAR(50) NOT NULL,
    personal_phone VARCHAR(50),
    slogan VARCHAR(255) DEFAULT 'Discipline - Travail - Succès',
    logo_url TEXT,
    subdomain VARCHAR(100) UNIQUE,
    is_email_verified BOOLEAN DEFAULT TRUE,
    status VARCHAR(50) DEFAULT 'Actif',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Table des Élèves / Étudiants (Students)
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    school_code VARCHAR(50) NOT NULL,
    matricule VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(150) NOT NULL,
    last_name VARCHAR(150) NOT NULL,
    gender VARCHAR(1) CHECK (gender IN ('M', 'F')),
    birth_date DATE,
    birth_place VARCHAR(150),
    classroom VARCHAR(50) NOT NULL,
    parent_name VARCHAR(255),
    parent_phone VARCHAR(50),
    status VARCHAR(50) DEFAULT 'Inscrit',
    tuition_paid NUMERIC(12,2) DEFAULT 0,
    tuition_total NUMERIC(12,2) DEFAULT 150000,
    average_grade NUMERIC(4,2) DEFAULT 0.00,
    photo_url TEXT,
    student_type VARCHAR(50) DEFAULT 'eleve',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Table du Personnel & Enseignants (Staff / Teachers)
CREATE TABLE IF NOT EXISTS public.staff_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    school_code VARCHAR(50) NOT NULL,
    matricule VARCHAR(50) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    gender VARCHAR(1) CHECK (gender IN ('M', 'F')),
    role VARCHAR(50) NOT NULL,
    role_title VARCHAR(150) NOT NULL,
    department VARCHAR(100),
    subject VARCHAR(100),
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    access_status VARCHAR(50) DEFAULT 'Actif',
    permissions TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Table des Frais de Scolarité & Écolage (Payments)
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    school_code VARCHAR(50) NOT NULL,
    student_matricule VARCHAR(50) NOT NULL,
    student_name VARCHAR(255) NOT NULL,
    classroom VARCHAR(50) NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    reference VARCHAR(100) UNIQUE NOT NULL,
    month VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'Validé',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Table des Notes & Évaluations (Grades)
CREATE TABLE IF NOT EXISTS public.grades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_code VARCHAR(50) NOT NULL,
    student_matricule VARCHAR(50) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    coefficient INT DEFAULT 1,
    devoir1 NUMERIC(4,2),
    devoir2 NUMERIC(4,2),
    composition NUMERIC(4,2),
    appreciation TEXT,
    teacher_name VARCHAR(255),
    trimester INT DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Table du Réseau Social & Fil d'actualités (Social Posts)
CREATE TABLE IF NOT EXISTS public.social_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_code VARCHAR(50) NOT NULL,
    school_name VARCHAR(255) NOT NULL,
    author_name VARCHAR(255) NOT NULL,
    author_role VARCHAR(100) NOT NULL,
    author_avatar TEXT,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'annonce',
    audience VARCHAR(50) DEFAULT 'all',
    media_url TEXT,
    likes_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Row Level Security (RLS)
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;

-- Allow public read access to school posts and verified schools
CREATE POLICY "Public schools are viewable by everyone" ON public.schools FOR SELECT USING (true);
CREATE POLICY "Public posts are viewable by everyone" ON public.social_posts FOR SELECT USING (true);
