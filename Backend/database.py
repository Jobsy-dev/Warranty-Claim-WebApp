import pyodbc

CONNECTION_STRING = (
    "DRIVER={ODBC Driver 17 for SQL Server};"
    "SERVER=localhost;"          # change if your server name is different
    "DATABASE=Databasename;"
    "Trusted_Connection=yes;"    # Windows Authentication
)

def get_db():
    conn = pyodbc.connect(CONNECTION_STRING)
    try:
        yield conn
    finally:
        conn.close()