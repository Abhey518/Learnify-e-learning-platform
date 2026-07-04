def validate_date_range(start_date, end_date):
    from datetime import datetime
    try:
        start = datetime.fromisoformat(start_date)
        end = datetime.fromisoformat(end_date)
        return start <= end
    except:
        return False

def validate_report_type(report_type):
    valid_types = ['daily', 'weekly', 'monthly', 'custom']
    return report_type in valid_types
