-- Extensions and Enums

-- Enable UUID extension if not already present
create extension if not exists "uuid-ossp";

-- Global Custom Enums
create type user_role as enum ('student', 'instructor', 'admin');
create type account_status as enum ('pending', 'approved');
create type quiz_option as enum ('A', 'B', 'C', 'D', 'E');

-- Table Schemas (In Correct Dependency Order)

-- Core Profiles Table (Links directly to Supabase Auth)
create table public.profiles (
    id uuid references auth.users(id) on delete cascade primary key,
    email varchar(255) not null,
    name varchar(100) not null,
    role user_role not null default 'student',
    status account_status not null default 'approved',
    resume_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Trigger to automatically create a profile when a new user signs up via Supabase Auth
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $mysub$
DECLARE
    assigned_role user_role;
    initial_status account_status;
    input_role text;
BEGIN
    input_role := NEW.raw_user_meta_data->>'role';
    
    -- Strict validation logic
    IF input_role = 'instructor' THEN
        assigned_role := 'instructor'::user_role;
        initial_status := 'pending'::account_status;
    ELSIF input_role = 'admin' THEN
        assigned_role := 'admin'::user_role;
        initial_status := 'approved'::account_status;
    ELSIF input_role = 'student' OR input_role IS NULL THEN
        -- Safely handle standard student requests or blank/missing fields
        assigned_role := 'student'::user_role;
        initial_status := 'approved'::account_status;
    ELSE
        -- Intentionally block and crash the transaction if the string is invalid
        RAISE EXCEPTION 'Invalid account role requested: %', input_role;
    END IF;

    INSERT INTO public.profiles (id, email, name, role, status, resume_url)
    VALUES (
        NEW.id, 
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', 'New User'),
        assigned_role,
        initial_status,
        NEW.raw_user_meta_data->>'resume_url'
    );
    
    RETURN NEW;
END;
$mysub$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Courses
create table public.courses (
    id bigint generated always as identity primary key,
    instructor_id uuid references public.profiles(id) on delete restrict not null,
    title varchar(255) not null,
    description text,
    category varchar(100) not null,
    is_published boolean default false not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Modules
create table public.modules (
    id bigint generated always as identity primary key,
    course_id bigint references public.courses(id) on delete cascade not null,
    title varchar(255) not null,
    description text,
    order_no int not null
);

-- Lessons
create table public.lessons (
    id bigint generated always as identity primary key,
    module_id bigint references public.modules(id) on delete cascade not null,
    title varchar(255) not null,
    body text,             -- Nullable: Text or Markdown content
    video_url text,        -- Nullable: YouTube/Vimeo video link
    file_url text,         -- Nullable: Supabase Storage public URL (PDF, images, etc.)
    order_no int not null
);

-- Enrollments
create table public.enrollments (
    id bigint generated always as identity primary key,
    student_id uuid references public.profiles(id) on delete cascade not null,
    course_id bigint references public.courses(id) on delete cascade not null,
    enrolled_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(student_id, course_id)
);

-- Student Progress
create table public.student_progress (
    id bigint generated always as identity primary key,
    student_id uuid references public.profiles(id) on delete cascade not null,
    lesson_id bigint references public.lessons(id) on delete cascade not null,
    is_completed boolean default false not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(student_id, lesson_id)
);

-- Quizzes
create table public.quizzes (
    id bigint generated always as identity primary key,
    course_id bigint references public.courses(id) on delete cascade not null,
    module_id bigint references public.modules(id) on delete cascade not null,
    title varchar(255) not null
);

-- Questions
create table public.questions (
    id bigint generated always as identity primary key,
    quiz_id bigint references public.quizzes(id) on delete cascade not null,
    question_text text not null,
    option_a varchar(255) not null,
    option_b varchar(255) not null,
    option_c varchar(255) not null,
    option_d varchar(255) not null,
    option_e varchar(255) not null,
    correct_option quiz_option not null
);

-- Quiz Scores
create table public.quiz_scores (
    id bigint generated always as identity primary key,
    quiz_id bigint references public.quizzes(id) on delete cascade not null,
    student_id uuid references public.profiles(id) on delete cascade not null,
    score int not null,
    submitted_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Student Answers
create table public.student_answers (
    id bigint generated always as identity primary key,
    student_id uuid references public.profiles(id) on delete cascade not null,
    question_id bigint references public.questions(id) on delete cascade not null,
    selected_option quiz_option not null,
    is_correct boolean not null,
    unique(student_id, question_id)
);

-- Forum Threads
create table public.forum_threads (
    id bigint generated always as identity primary key,
    course_id bigint references public.courses(id) on delete cascade not null,
    user_id uuid references public.profiles(id) on delete cascade not null,
    title varchar(255) not null,
    description text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Forum Replies
create table public.forum_replies (
    id bigint generated always as identity primary key,
    thread_id bigint references public.forum_threads(id) on delete cascade not null,
    user_id uuid references public.profiles(id) on delete cascade not null,
    reply_message text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Reviews and Ratings
create table public.reviews (
    id bigint generated always as identity primary key,
    course_id bigint references public.courses(id) on delete cascade not null,
    student_id uuid references public.profiles(id) on delete cascade not null,
    rating int not null check (rating between 1 and 5),
    comment text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(student_id, course_id)
);
