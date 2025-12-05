from flask import render_template
from appNIRD.app import app

@app.route('/')
@app.route('/index')
def index():
    return render_template("index.html")

@app.route('/install/')
def install_linux():
    return render_template("install_linux.html")