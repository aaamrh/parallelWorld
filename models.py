# coding:utf8
import pymysql
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate, MigrateCommand
from flask_script import Manager
from sqlalchemy import create_engine

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "mysql+pymysql://war:ruisfree.com@yrwxss.ruisfree.com:3306/war"
# app.config["SQLALCHEMY_DATABASE_URI"] = "mysql+pymysql://root:root@192.168.0.102:3306/demo1"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = True
# engine = create_engine("mysql+pymysql://root:root@192.168.1.103:3308/demo1", pool_pre_ping=True)

db = SQLAlchemy(app)
app.config['DEBUG'] = True

migrate = Migrate(app, db)
manager = Manager(app)
manager.add_command('db', MigrateCommand)

registrations = db.Table('registrations',
                     db.Column('charts_id', db.Integer, db.ForeignKey('charts.id')),
                     db.Column('inf_id', db.Integer, db.ForeignKey('inf.id'))
)

class Charts(db.Model):
    __tablename__ = "charts"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(20), nullable=False)
    tit = db.Column(db.String(50))
    is_show = db.Column(db.Boolean, default=False)
    formula = db.Column(db.String(30), nullable = False, default='')


class Msg(db.Model):
    __tablename__ = "inf"
    id = db.Column(db.Integer, primary_key=True)
    info_name = db.Column(db.String(20), nullable=False)
    info_value = db.Column(db.Integer, nullable=False)
    para = db.relationship('Charts', secondary=registrations, backref=db.backref('inf', lazy='dynamic'), lazy='dynamic')


if __name__ == "__main__":
    db.create_all()
    manager.run()
