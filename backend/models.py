from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean , ForeignKey
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import relationship
import  bcrypt
from sqlalchemy.dialects.postgresql import UUID
import uuid 
from sqlalchemy import JSON


db = SQLAlchemy()

class Product(db.Model):

    __tablename__ = 'products'

    id = Column(Integer, primary_key=True)
    product_name = Column(String)
    product_price = Column(Float)
    product_description = Column(String)
    image_url = Column(String)
    length = Column(String)
    stock = Column(Integer)
    color = Column(String)
    status = Column(String)
    category = Column(String)

    def to_dict(self):
        return {"id": self.id, "product_name": self.product_name, 
                "product_description": self.product_description,
                "stock": self.stock, "image_url": self.image_url, "status":self.status, "product_price": self.product_price, "category":self.category,  "color":self.color,  "length":self.length }

class Order(db.Model):

    __tablename__ = 'orders'

    id = Column(Integer, primary_key=True)
    cart_id = Column(Integer)
    amount=Column(Float)
    reference = Column(String, unique=True, nullable=False)
    status  = Column(String, default= "Processing")
    created_at = Column(DateTime, default=datetime.utcnow)
    paid = Column(Boolean, default=False)
    items= Column(JSON, nullable=False)

    fullname = Column(String )
    email = Column(String)
    address = Column(String)
    phone = Column(String)

    # Foreign key to User table
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)

    # Relationship to access user details from an order
    user = relationship('User', backref='orders')
    items = db.relationship('OrderItem', backref='order', lazy=True)

    def to_dict(self):
        return {"id": self.id, "cart_id": self.cart_id, 
                "amount": self.amount,
                "reference": self.reference, "status":self.status, "created_at": self.created_at, "paid":self.paid,
                "fullname": self.fullname, "email": self.email, "address": self.address, "phone": self.phone,
                "user_id": self.user_id, "user_email": 
                self.user.email if self.user else None
                }


class OrderItem(db.Model):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    quantity = Column(Integer)
    price = Column(Float)

class User(db.Model): 

    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    firstname= Column(String)
    lastname= Column(String)
    email = Column(String, unique=True, nullable=False)
    password = Column(String)
    confirm_password = Column(String)

    def set_password(self, password):
        """hashes the password using and store it password field"""
        hashed_bytes = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        self.password =hashed_bytes.decode('utf-8')

    def check_password(self, password):
       """check the password against the stored bcrypt hash"""
       return bcrypt.checkpw(
            password.encode('utf-8'),
            self.password.encode('utf-8')
       )

    def to_dict(self):
        return {
            'id':self.id,
            'firstname':self.firstname,
            'lastname':self.lastname,
            'email':self.email
        }
    


class Cart(db.Model):
    __tablename__ = 'carts'

    cart_id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = Column(Integer, ForeignKey('products.id'), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    session_id = db.Column(db.String) 

    # Set up relationship to Product
    product = relationship("Product", backref="cart_items")

    def to_dict(self):
        return {
        "cart_id": str(self.cart_id),
        "product_id": self.product_id,
        "quantity": self.quantity,
        "product_name": self.product.product_name,
        "product_price": self.product.product_price,
        "image_url": self.product.image_url,
        "stock": self.product.stock,
        "color": self.product.color,
        "length": self.product.length,
        "status": self.product.status,
        "category": self.product.category,
    }
