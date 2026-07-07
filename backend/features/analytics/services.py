from core.supabase_client import supabase



# Course Review Pipeline
def create_course_review(student_id, course_id, rating, comment):
    try:
        response = supabase.table("reviews").insert({
            "course_id": course_id,
            "student_id": student_id,
            "rating": int(rating),
            "comment": comment
        }).execute()

        return {"success": True, "data": response.data[0]}
    
    except Exception as e:
        if "unique_violation" in str(e).lower() or "duplicate key" in str(e).lower():
            return {"success": False, "error": "You have already submitted a review for this course."}
        return {"success": False, "error": str(e)}
 

def get_course_reviews_and_average(course_id):
    try:
        response = supabase.table("reviews") \
            .select("course_id, id, rating, comment, created_at, profiles(name), courses(title)") \
            .eq("course_id", course_id) \
            .order("created_at", desc=True) \
            .execute()
        
        reviews = response.data

        course_response = supabase.table("courses").select("title").eq("id", course_id).execute()
        course_title = course_response.data[0]['title'] if course_response.data else "Unknown Course"

        

        if reviews:
            total_rating = sum(item['rating'] for item in reviews)
            average_rating = round(total_rating / len(reviews), 2)
        else:
            average_rating = 0.0

        return {
            "success": True,
            "course_id": course_id,
            "average_rating": average_rating,
            "total_reviews": len(reviews),
            "course_title": course_title,
            "reviews": reviews
        }
    
    except Exception as e:
        return {"success": False, "error": str(e)}
    




def get_instructor_metrics(instructor_id, target_course_id=None):
    try:
        # Gather all instructor courses
        course_query = supabase.table("courses").select("id, title").eq("instructor_id", instructor_id)
        if target_course_id:
            course_query = course_query.eq("id", target_course_id)
        
        course_result = course_query.execute()
        courses = course_result.data or []

        if not courses:
            return {
                "success": True,
                "total_students": 0,
                "average_rating": 0.0,
                "total_courses": 0,
                "total_reviews": 0,
                "my_courses": [],
                "recent_reviews": []
            }
        
        course_ids = [c['id'] for c in courses]

        # Defensive lookups for enrollments, reviews, and quizzes
        enroll_res = supabase.table("enrollments").select("id, course_id").in_("course_id", course_ids).execute()
        enrollments = enroll_res.data or []

        review_res = supabase.table("reviews").select("id, rating, comment, course_id, created_at").in_("course_id", course_ids).order("created_at", desc=True).execute()
        reviews = review_res.data or []

        # Safe fallback block execution for quiz scores tracking
        scores = []
        try:
            quiz_res = supabase.table("quiz_score").select("score, quiz_id, quizzes(course_id)").execute()
            raw_scores = quiz_res.data or []
            scores = [s for s in raw_scores if isinstance(s.get('quizzes'), dict) and s['quizzes'].get('course_id') in course_ids]
        except Exception as qe:
            print(f"Quiz metrics collection bypass: {str(qe)}")

        # Compile the per-course loop breakdown records
        my_courses_payload = []
        total_rating_sum = 0
        review_count_total = 0

        for course in courses:
            c_id = course['id']
            c_enrolls = len([e for e in enrollments if e.get('course_id') == c_id])

            c_reviews = [r['rating'] for r in reviews if r.get('course_id') == c_id]
            c_avg_rating = round(sum(c_reviews) / len(c_reviews), 2) if c_reviews else 0.0
            
            if c_reviews:
                total_rating_sum += sum(c_reviews)
                review_count_total += len(c_reviews)

            my_courses_payload.append({
                "id": c_id,
                "title": course.get('title', f"Course ID: {c_id}"),
                "student_count": c_enrolls,
                "average_rating": c_avg_rating
            })

        # Calculate final dashboard aggregate averages
        global_avg_rating = round(total_rating_sum / review_count_total, 2) if review_count_total > 0 else 0.0

        # Construct response mapping payload to match React state expectations perfectly
        return {
            "success": True,
            "total_students": len(enrollments),
            "average_rating": global_avg_rating,
            "total_courses": len(courses),
            "total_reviews": len(reviews),
            "my_courses": my_courses_payload,
            "recent_reviews": reviews[:10] # Return top 10 recent reviews cleanly
        }
    
    except Exception as e:
        print(f" Error compiling dashboard metrics framework: {str(e)}")
        return {"success": False, "error": str(e)}





# Admin Platform Instructer and Student Management
def get_pending_instructors():
    try:
        response = supabase.table("profiles") \
            .select("id, name, email, resume_url, created_at") \
            .eq("role", "instructor") \
            .eq("status", "pending") \
            .order("created_at", desc=True) \
            .execute()
        return {"success": True, "applications": response.data}

    except Exception as e:
        return {"success": False, "error": str(e)}

def update_instructor_status(user_id, status):
    try:
        response = supabase.table("profiles") \
            .update({"status": status}) \
            .eq("id", user_id) \
            .execute()
        
        if not response.data:
            return {"success": False, "error": "No instructor matching that ID was found."}
        
        return {"success": True, "profile": response.data[0]}
    
    except Exception as e:
        return {"success": False, "error": str(e)}
    

def fetch_all_reviews():
    try:
        response = supabase.table("reviews") \
            .select(
                "id",
                "rating",
                "comment",
                "created_at",
                "course_id",
                "student_id",
                "profiles (name)",
                "courses (title)"
            ) \
            .order("created_at", desc=True) \
            .execute()
            
        return {"success": True, "data": response.data}
        
    except Exception as e:
        print(f"Error fetching reviews with profiles: {str(e)}")
        fallback = supabase.table("reviews").select("*").order("created_at", desc=True).execute()
        return {"success": True, "data": fallback.data}


def delete_review_by_admin(review_id):
    try:
        response = supabase.table("reviews") \
            .delete() \
            .eq("id", review_id) \
            .execute()
        
        if not response.data:
            return {"success": False, "error": "Review not found or already removed."}
        
        return {"success": True}
    
    except Exception as e:
        return {"success": False, "error": str(e)}


    
# Admin users controller
def get_all_instructors():
    try:
        response = supabase.table("profiles") \
            .select("id, name, email, created_at") \
            .eq("role", "instructor") \
            .eq("status", "approved") \
            .order("created_at", desc=True) \
            .execute()
        return {"success": True, "data": response.data}
    
    except Exception as e:
        print(f"Error fetching instructors with profiles: {str(e)}")
        fallback = supabase.table("profiles").select("*").order("created_at", desc=True).execute()
        return {"success": True, "data": fallback.data}

def get_all_students():
    try:
        response = supabase.table("profiles") \
            .select("id, name, email, created_at") \
            .eq("role", "student") \
            .execute()
        return {"success": True, "data": response.data}
    
    except Exception as e:
        print(f"Error fetching students with profiles: {str(e)}")
        fallback = supabase.table("profiles").select("*").order("created_at", desc=True).execute()
        return {"success": True, "data": fallback.data}
    

def delete_user_by_admin(id):
    try:
        response = supabase.table("profiles") \
            .delete() \
            .eq("id", id) \
            .execute()
        
        if not response.data:
            return {"success": False, "error": "user not found or already removed."}
        
        return {"success": True}
    
    except Exception as e:
        return {"success": False, "error": str(e)}