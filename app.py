import os
from pathlib import Path
from datetime import date, datetime
from flask import Flask, jsonify, request, send_from_directory
import psycopg
from psycopg.rows import dict_row
from psycopg import errors

BASE = Path(__file__).resolve().parent
app = Flask(__name__, static_folder=None)

def connection():
    url = os.environ.get('DATABASE_URL')
    if not url:
        raise RuntimeError('請先設定 DATABASE_URL 環境變數')
    return psycopg.connect(url, row_factory=dict_row)

def fail(message, status=400):
    return jsonify({'error': message}), status

@app.get('/')
def home():
    return send_from_directory(BASE, 'index.html')

@app.get('/<path:filename>')
def assets(filename):
    if not filename.startswith(('css/', 'js/')):
        return fail('Not found', 404)
    return send_from_directory(BASE, filename)

@app.get('/api/activities')
def list_activities():
    with connection() as db:
        rows = db.execute("""SELECT a.id, a.name, a.date, a.location,
              COUNT(r.id)::integer AS registration_count
              FROM activities a LEFT JOIN registrations r ON a.id=r.activity_id
              GROUP BY a.id ORDER BY a.id""").fetchall()
    for row in rows:
        row['date'] = row['date'].isoformat()
    return jsonify(rows)

@app.post('/api/activities')
def add_activity():
    data = request.get_json(silent=True) or {}
    name = str(data.get('name') or '').strip()
    location = str(data.get('location') or '').strip()
    date_text = str(data.get('date') or '')
    if not name or not location or len(name)>100 or len(location)>200:
        return fail('活動名稱與地點必填，且不可超過欄位長度')
    try:
        event_date = date.fromisoformat(date_text)
    except ValueError:
        return fail('日期格式必須為 YYYY-MM-DD')
    with connection() as db:
        row = db.execute('INSERT INTO activities(name,date,location) VALUES (%s,%s,%s) RETURNING id,name,date,location', (name,event_date,location)).fetchone()
        db.commit()
    row['date']=row['date'].isoformat()
    row['registration_count']=0
    return jsonify(row),201

@app.get('/api/activities/<int:activity_id>/registrations')
def list_registrations(activity_id):
    with connection() as db:
        exists=db.execute('SELECT 1 FROM activities WHERE id=%s',(activity_id,)).fetchone()
        if not exists:
            return fail('找不到活動',404)
        rows=db.execute('SELECT id,name,phone,signup_at FROM registrations WHERE activity_id=%s ORDER BY id',(activity_id,)).fetchall()
    for row in rows:
        row['signup_at']=row['signup_at'].isoformat(timespec='seconds')
    return jsonify(rows)

@app.post('/api/activities/<int:activity_id>/registrations')
def add_registration(activity_id):
    data=request.get_json(silent=True) or {}
    name=str(data.get('name') or '').strip()
    phone=str(data.get('phone') or '').strip()
    if not name or not phone or len(name)>100 or len(phone)>20:
        return fail('姓名及電話必填，且不可超過欄位長度')
    with connection() as db:
        exists=db.execute('SELECT 1 FROM activities WHERE id=%s',(activity_id,)).fetchone()
        if not exists:
            return fail('找不到活動',404)
        row=db.execute('INSERT INTO registrations(activity_id,name,phone) VALUES (%s,%s,%s) RETURNING id',(activity_id,name,phone)).fetchone()
        db.commit()
    return jsonify({'id':row['id'],'message':'報名成功'}),201

@app.errorhandler(psycopg.Error)
def db_error(error):
    app.logger.exception('Database error')
    return fail('資料庫操作失敗，請檢查資料表及連線設定',500)

if __name__=='__main__':
    app.run(host='127.0.0.1',port=5000,debug=False)
