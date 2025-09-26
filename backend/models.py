from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean , ForeignKey, Numeric, Text
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
    status = Column(String, default="active")
    stock = Column(Integer)
    category = Column(String)
    best_seller= Column(Boolean, default=False)
    new_in_stock= Column(Boolean, default=False)
    test_column = Column(String(50))
    paid = Column(Boolean, default=False)

    colors = db.relationship("ProductColor", backref="product", cascade="all, delete-orphan")
    lengths = db.relationship("ProductLength", backref="product", cascade="all, delete-orphan")

    cart_items = relationship("CartItem", back_populates="product")




    def to_dict(self):
        return {"id": self.id, "product_name": self.product_name, 
                "product_description": self.product_description,
                "stock": self.stock, "image_url": self.image_url, 
                "status":self.status, "product_price": self.product_price, 
                "category":self.category, "test_column":self.test_column,   "colors": [c.color for c in self.colors], "best_seller":self.best_seller, "new_in_stock":self.new_in_stock,  "lengths": [l.length for l in self.lengths],}



class ProductColor(db.Model):
    __tablename__ = 'product_colors'
    id = Column(Integer, primary_key=True)
    color = Column(String, nullable=False)
    product_id = Column(Integer, db.ForeignKey('products.id'), nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
             "color": self.color
        }


class ProductLength(db.Model):
    __tablename__ = 'product_lengths'
    id = Column(Integer, primary_key=True)
    length = Column(String, nullable=False)
    product_id = Column(Integer, db.ForeignKey('products.id'), nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "length": self.length
        }


class Order(db.Model):
    __tablename__ = 'orders'

    id = Column(Integer, primary_key=True)
    cart_id = Column(db.UUID(as_uuid=True), ForeignKey('carts.id', ondelete="CASCADE"), nullable=True)
    amount = Column(Float)
    status = Column(String, default="Processing")
    created_at = Column(DateTime, default=datetime.utcnow)
    paid = Column(Boolean, default=False)
    
    # Customer information
    fullname = Column(String, nullable=False)
    email = Column(String, nullable=False)
    address = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    order_summary = Column(Text)
    total_amount = Column(Float, default=0)

    # User relationship
    user_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    user = relationship('User', backref='orders')
    payments = relationship('Payment', back_populates='order', cascade="all, delete-orphan")

     # User relationship
    order_items = relationship('OrderItem', backref='order', cascade="all, delete-orphan")
    cart = relationship('Cart', back_populates='orders') 
    
    def to_dict(self):
        return {"id": self.id, "cart_id": self.cart_id, 
                "amount": self.amount,
               "status":self.status, "created_at": self.created_at, "paid":self.paid,
                "fullname": self.fullname, "email": self.email, "address": self.address, "phone": self.phone,
                "user_id": self.user_id, "user_email": 
                self.user.email if self.user else None
                }


class OrderItem(db.Model):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)  
    order_id = Column(Integer, ForeignKey("orders.id"))
    quantity = Column(Integer)
    price = Column(Float)
    selected_color = Column(String)
    selected_length = Column(String)
    
      
    product = relationship('Product')

class User(db.Model): 

    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    firstname= Column(String)
    lastname= Column(String)
    email = Column(String, unique=True, nullable=False)
    password = Column(String)
    confirm_password = Column(String)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    carts = relationship("Cart", back_populates="user", cascade="all, delete-orphan")

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
            'email':self.email,
            'is_admin': self.is_admin
        }
    
class Cart(db.Model):
    __tablename__ = 'carts'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    session_id =Column(String)

    # Relationships
    user = relationship("User", back_populates="carts")
    items = relationship("CartItem", back_populates="cart", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="cart", cascade="all, delete-orphan")

class CartItem(db.Model):
    __tablename__ = 'cart_items'

    id = Column(Integer, primary_key=True)
    cart_id = Column(UUID(as_uuid=True), ForeignKey('carts.id'), nullable=False)
    product_id = Column(Integer, ForeignKey('products.id'), nullable=False)
    quantity = Column(Integer, default=1)
    selected_color = Column(String)
    selected_length = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
  

    # Relationships
    cart = relationship("Cart", back_populates="items")
    product = relationship("Product", back_populates="cart_items")

    def to_dict(self):
        return {
        "cart_id": str(self.cart_id),
        "product_id": self.product_id,
        "quantity": self.quantity,
        "product_name": self.product.product_name,
        "product_price": self.product.product_price,
        "image_url": self.product.image_url,
        "stock": self.product.stock,
        "colors": [color.color for color in self.product.colors],
        "lengths": [length.length for length in self.product.lengths],
        "status": self.product.status,
        "category": self.product.category,
        "selected_color": self.selected_color,
        "selected_length": self.selected_length,
    }

class Payment(db.Model):
    __tablename__ = 'payments'

    id = Column(Integer, primary_key=True)
    order_id = Column(Integer, ForeignKey('orders.id'), nullable=False)
    reference = Column(String, nullable=False, unique=True)
    amount = Column(Numeric(precision=10, scale=2), nullable=False)
    paid = Column(Boolean, default=False, nullable=False)
    paid_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # optional back‑ref to the order
    order  = relationship('Order', back_populates='payments')

    def to_dict(self):
        return {
        "id": self.id,
        "order_id": self.order_id,
        "reference": self.reference,
        "amount": float(self.amount),  # Convert Decimal to float for JSON
        "paid": self.paid,
        "paid_at": self.paid_at.isoformat() if self.paid_at else None,
        "created_at": self.created_at.isoformat() if self.created_at else None,
    }
class Complaint(db.Model):
    __tablename__  = 'complaints'
    id = Column(Integer, primary_key=True)
    name = Column(String)
    email = Column(String, unique=True, nullable=False)
    message = Column(Text, nullable=False)
    subject = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved = Column(Boolean, default=False)