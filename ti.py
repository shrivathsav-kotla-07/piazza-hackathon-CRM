import datetime

def get_date():
    """
    Returns the current date and time in ISO format.
    """
    return datetime.datetime.now().isoformat()
