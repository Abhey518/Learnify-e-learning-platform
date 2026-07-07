import os
from supabase import create_client, Client
from core.supabase_client import supabase


class QuizService:
    @staticmethod
    def get_quizzes_by_course(course_id):
        response = supabase.table('quizzes').select('*').eq('course_id', course_id).execute()
        return response.data

    @staticmethod
    def create_quiz(course_id, data):
        raw_module_id = data.get("module_id")
        processed_module_id = int(raw_module_id) if raw_module_id and str(raw_module_id).strip().lower() != 'null' else None

        new_quiz = {
            "title": data.get("title"),
            "course_id": int(course_id),
            "module_id": processed_module_id
        }
        
        response = supabase.table('quizzes').insert(new_quiz).execute()
        return response.data[0] if response.data else new_quiz

    @staticmethod
    def get_questions_by_quiz(quiz_id):
        response = supabase.table('questions').select('*').eq('quiz_id', quiz_id).execute()
        
        formatted_questions = []
        for q in response.data:
            correct_opt = q.get("correct_option", "A") if q.get("correct_option") else "A"
            formatted_questions.append({
                "id": q.get("id"),
                "quiz_id": q.get("quiz_id"),
                "text": q.get("question_text") or q.get("text") or "",
                "question_text": q.get("question_text") or q.get("text") or "",
                "title": q.get("question_text") or q.get("text") or "",
                "option_a": q.get("option_a", ""),
                "option_b": q.get("option_b", ""),
                "option_c": q.get("option_c", ""),
                "option_d": q.get("option_d", ""),
                "option_e": q.get("option_e") if q.get("option_e") is not None else "",
                "correct_option": correct_opt,
                "correct_index": ord(correct_opt.upper()) - ord('A')
            })
        return formatted_questions

    @staticmethod
    def create_question(quiz_id, data):
        opt_e_value = data.get("option_e") if data.get("option_e") is not None else "N/A"
        if opt_e_value == "":
            opt_e_value = "N/A"

        new_row = {
            "quiz_id": quiz_id,
            "question_text": data.get("question_text"),
            "text": data.get("question_text"),  
            "option_a": data.get("option_a"),
            "option_b": data.get("option_b"),
            "option_c": data.get("option_c"),
            "option_d": data.get("option_d"),
            "option_e": opt_e_value,  
            "correct_option": data.get("correct_option", "A")
        }
        
        try:
            db_response = supabase.table('questions').insert(new_row).execute()
        except Exception as primary_err:
            stripped_row = {k: v for k, v in new_row.items() if k != "text"}
            if "question_text" in str(primary_err):
                stripped_row["text"] = data.get("question_text")
                if "question_text" in stripped_row: del stripped_row["question_text"]
            db_response = supabase.table('questions').insert(stripped_row).execute()

        saved_data = db_response.data[0] if db_response.data else new_row
        return {
            "id": saved_data.get("id"),
            "quiz_id": saved_data.get("quiz_id"),
            "text": saved_data.get("question_text") or saved_data.get("text") or "",
            "question_text": saved_data.get("question_text") or saved_data.get("text") or "",
            "option_a": saved_data.get("option_a", ""),
            "option_b": saved_data.get("option_b", ""),
            "option_c": saved_data.get("option_c", ""),
            "option_d": saved_data.get("option_d", ""),
            "correct_option": saved_data.get("correct_option", "A")
        }

    @staticmethod
    def get_active_student_id():
        try:
            profile_check = supabase.table('profiles').select('id').limit(1).execute()
            if profile_check.data:
                return profile_check.data[0]['id']
        except Exception:
            pass
        return "00000000-0000-0000-0000-000000000000"

    @staticmethod
    def submit_quiz_answers(quiz_id, user_answers):
        normalized_answers = {}
        if isinstance(user_answers, list):
            for item in user_answers:
                if isinstance(item, dict) and "question_id" in item:
                    q_id = str(item["question_id"])
                    ans = item.get("selected_index") if item.get("selected_index") is not None else item.get("answer")
                    normalized_answers[q_id] = ans
        elif isinstance(user_answers, dict):
            normalized_answers = {str(k): v for k, v in user_answers.items()}

        q_response = supabase.table('questions').select('id', 'correct_option').eq('quiz_id', quiz_id).execute()
        db_questions = q_response.data
        active_student_id = QuizService.get_active_student_id()

        calculated_score = 0
        total_questions = len(db_questions)
        
        for q in db_questions:
            q_id_str = str(q["id"])
            if q_id_str in normalized_answers:
                raw_ans = normalized_answers[q_id_str]
                
                if isinstance(raw_ans, int):
                    selected_letter = chr(ord('A') + raw_ans)
                elif isinstance(raw_ans, str) and len(raw_ans) == 1:
                    selected_letter = raw_ans.upper()
                else:
                    selected_letter = "A"
                
                is_correct = (selected_letter == q["correct_option"])
                if is_correct:
                    calculated_score += 1
                
                try:
                    supabase.table('student_answers').upsert({
                        "student_id": active_student_id,
                        "question_id": q["id"],
                        "selected_option": selected_letter,
                        "is_correct": is_correct
                    }, on_conflict="student_id,question_id").execute()
                except Exception as table_err:
                    print(f"⚠️ Warning saving answer for question {q['id']}: {str(table_err)}")

        try:

            supabase.table('quiz_score').insert({
                "quiz_id": quiz_id,
                "student_id": active_student_id,
                "score": calculated_score
            }).execute()
        except Exception as table_err:
            print(f"Warning saving total score: {str(table_err)}")

        return calculated_score, total_questions