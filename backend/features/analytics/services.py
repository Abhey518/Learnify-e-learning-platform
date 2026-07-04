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
            .select("course_id, id, rating, comment, created_at, profiles(name)") \
            .eq("course_id", course_id) \
            .order("created_at", desc=True) \
            .execute()
        
        reviews = response.data

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
            "reviews": reviews
        }
    
    except Exception as e:
        return {"success": False, "error": str(e)}
    




# Instructor Performance Metrics
def get_instructor_metrics(instructor_id, target_course_id=None):
    try:
        course_query = supabase.table("courses").select("id, title").eq("instructor_id", instructor_id)
        if target_course_id:
            course_query = course_query.eq("id", target_course_id)
        
        course_result = course_query.execute()
        courses = course_result.data

        if not courses:
            return {
                "success": True,
                "summary": {"total_courses": 0, "total_enrollments": 0, "avg_rating": 0.0, "avg_quiz_score": 0.0},
                "course_breakdown": []
            }
        
        course_ids = [c['id'] for c in courses]

        enroll_res = supabase.table("enrollments").select("id, course_id").in_("course_id", course_ids).execute()
        enrollments = enroll_res.data

        review_res = supabase.table("reviews").select("rating, course_id").in_("course_id", course_ids).execute()
        reviews = review_res.data

        quiz_res = supabase.table("quiz_score").select("score, quiz_id, quizzes(course_id)").execute()
        scores = [s for s in quiz_res.data if s.get('quizzes') and s['quizzes'].get('course_id') in course_ids]

        course_breakdown = []
        total_rating_sum = 0
        total_quiz_sum = 0

        for course in courses:
            c_id = course['id']
            c_enrolls = len([e for e in enrollments if e['course_id'] == c_id])

            c_reviews = [r['rating'] for r in reviews if r['course_id'] == c_id]
            c_avg_rating = round(sum(c_reviews) / len(c_reviews), 2) if c_reviews else 0.0
            total_rating_sum += c_avg_rating

            c_scores = [s['score'] for s in scores if s['quizzes']['course_id'] == c_id]
            c_avg_quiz = round(sum(c_scores) / len(c_scores), 2) if c_scores else 0.0
            total_quiz_sum += c_avg_quiz

            course_breakdown.append({
                "course_id": c_id,
                "title": course['title'],
                "enrollments_count": c_enrolls,
                "average_rating": c_avg_rating,
                "average_quiz_score": c_avg_quiz
            })

        total_active_courses = len(courses)
        summary = {
            "total_courses": total_active_courses,
            "total_enrollments": len(enrollments),
            "avg_rating": round(total_rating_sum / total_active_courses, 2) if total_active_courses else 0.0,
            "avg_quiz_score": round(total_quiz_sum / total_active_courses, 2) if total_active_courses else 0.0
        }

        return {"success": True, "summary": summary, "course_breakdown": course_breakdown}
    
    except Exception as e:
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
                "profiles (name)"
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