from flask import Flask, jsonify, current_app, request, session, redirect, abort
from flask_session import Session 
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import func
from flask_migrate import Migrate, upgrade
from datetime import datetime
from werkzeug.utils import secure_filename
from flask_mail import Mail, Message
from uuid import UUID
import secrets
import requests
import bcrypt
import json
import re 
import traceback
import hashlib
import hmac
from flask_mail import Mail, Message
from models import db, Product, User,  Order,  OrderItem, Payment, Complaint, ProductColor, ProductLength, Cart, CartItem
from dotenv import load_dotenv
import os
import uuid
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from datetime import timedelta
from mailer import send_email

load_dotenv()

app = Flask(__name__, static_folder='static')
CORS(
    app,
    supports_credentials=True,
    resources={
        r"/*": {
            "origins": ["http://localhost:5173"],
            "methods": ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            
        }
    },
)

#  configurations jwt
app.config['JWT_SECRET_KEY'] = 'SECRET_KEY'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)  # Token expires in 24 hours
app.config['JWT_TOKEN_LOCATION'] = ['headers']  # Look for token in headers
app.config['JWT_HEADER_NAME'] = 'Authorization' 
app.config['JWT_HEADER_TYPE'] = 'Bearer'   

# Initialize JWT
jwt = JWTManager(app)

# Flask-Mail configuration using environment variables
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USE_SSL'] = False
MAIL_USERNAME = os.getenv('MAIL_USERNAME')
MAIL_PASSWORD= os.getenv('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = ('Your Shop Name', os.getenv('MAIL_USERNAME'))

mail = Mail(app)
#Function to send order emails

def sendorder_email(recipient, subject, body):
    """
    recipient: customer's email
    subject: email subject
    body: email content
    """
    try:
        msg = Message(
            subject=subject,
            recipients=[recipient],
            sender=app.config['MAIL_DEFAULT_SENDER']  # Use configured sender
        )
        msg.body = body
        
        # Add app context for Flask-Mail
        with app.app_context():
            mail.send(msg)
        
        app.logger.info(f"Email sent successfully to {recipient}")
        return True
        
    except Exception as e:
        # Log the detailed error
        app.logger.error(f"Failed to send email to {recipient}: {str(e)}")
        print(f"EMAIL ERROR: {e}")  # Also print to console for immediate visibility
        return False


    
#debugging helper  
@app.before_request
def debug_routes():
    print(f"Incoming request to: {request.path}")  # Check what path Flask sees
    print(f"Available routes: {[str(rule) for rule in app.url_map.iter_rules()]}")
    
app.secret_key = os.environ['SECRET_KEY']

#Configuration for the Postgre Database Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:password@localhost:5432/ecommerce_bd'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
# Enable cookie sharing across origins
app.config['SESSION_COOKIE_SAMESITE'] = 'None'
app.config['SESSION_COOKIE_SECURE'] = False
PAYSTACK_INIT_URL = "https://api.paystack.co/transaction/initialize"
PAYSTACK_KEY = os.getenv("PAYSTACK_SECRET_KEY")
app.config['SESSION_TYPE'] = 'filesystem'
Session(app)

if not PAYSTACK_KEY:
    print("⚠️ Warning: PAYSTACK_SECRET_KEY not found in environment variables")
else:
    print("✅ Paystack secret key loaded successfully")


#initilize flask-migrate 
db.init_app(app)
migrate =Migrate(app, db)
   

salt = bcrypt.gensalt()

#function for getting unique sesiion to identify carts 
def get_or_create_session_id():
    if 'session_id' not in session:
        session_id = str(uuid.uuid4())
        session['session_id'] =   session_id
        print (session['session_id'])
        print(session_id)
    return session['session_id']

@app.route("/test_session")
def test_session():
    session['test'] = 'hello'
    return f"Session set. Value: {session['test']}"

@app.route("/check_session")
def check_session():
    session_id = get_or_create_session_id()
    return f"Your session ID is: {session_id}"

@app.route("/cors_test", methods=["OPTIONS", "GET"])
def cors_test():
    # Create a test response
    response = jsonify({
        "message": "CORS test successful",
        "cors_headers": {
            "allowed_origin": "http://localhost:5173",
            "allowed_methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS"
        }
    })
    

@app.route('/')
def home():
    products = db.session.query(Product).all()
    return jsonify([product.to_dict() for product in products])

#get single product
@app.route("/products/<int:id>", methods = ["GET"])
def singleProduct(id):
    products = db.session.query(Product).filter_by(id=id).first()
    if products:
        return jsonify(products.to_dict())
    return jsonify({"error": "Product not found"}), 404 


#admin 
#add product
@app.route("/add_product", methods=["POST"])
@jwt_required()
def addProduct():
    try:
        print("Incoming request to: /add_product")
        print("Form data:", request.form)
        print("Files:", request.files)
    
        product_name = request.form.get("product_name")
        product_price = float(request.form.get("product_price"))
        product_description = request.form.get("product_description")
        stock = int(request.form.get("stock"))
        colors = request.form.getlist("color")  # Accepts multiple colors
        lengths = request.form.getlist("length") 
        status = request.form.get("status")
        category = request.form.get("category")
        best_seller = request.form.get("best_seller") == 'true'
        new_in_stock = request.form.get("new_in_stock") == 'true'
        image_url = request.files.get('image')

        
        if not all([product_name, product_price, product_description, stock, lengths, colors, status, category, image_url]):
            return jsonify({'error': 'Please provide all required fields'}), 400

        image_filename = secure_filename(image_url.filename)
        os.makedirs("static/uploads", exist_ok=True)
        image_path= os.path.join("static/uploads", image_filename)
        image_url.save(image_path)

        image_url = f"/static/uploads/{image_filename}" 

        product = Product(
            product_name=product_name, 
            product_price=product_price, 
            product_description=product_description, 
            stock=stock, 
            status=status,
            category= category, 
            best_seller = best_seller,
            new_in_stock = new_in_stock,
            image_url=image_url
)
        db.session.add(product)
        db.session.commit()

        for color in colors:
            db.session.add(ProductColor(color=color, product_id=product.id))

        
        for length in lengths:
            db.session.add(ProductLength(length=length, product_id=product.id))

        db.session.commit()

        print("product_name:", request.form.get("product_name"))

        

        return jsonify(product.to_dict()), 201
        

    except Exception as e:
        db.session.rollback()
        print("ERROR adding product:")
        traceback.print_exc()
        return jsonify({'error': 'An error occurred during adding' }), 500
    
    
@app.route("/best_seller", methods=["GET"])
def best_seller():
    try:
        best_sellers = Product.query.filter_by(best_seller=True).all()
        return jsonify([product.to_dict() for product in best_sellers]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@app.route('/new_stock')
def get_new_stock():
    new_products = Product.query.filter_by(new_in_stock=True).all()
    return jsonify([product.to_dict() for product in new_products])




#relatedproduct 
@app.route("/related_products/<int:id>/", methods=["GET"]) 
def related_products(id):
    current = Product.query.filter_by(id=id).first()
    if current is None:
        return jsonify({"error": "Product not found"}), 404
    
    related = (
    Product.query
           .filter_by(category=current.category)  
           .filter(Product.id != id)
           .limit(4)
           .all()
    )
    return jsonify([p.to_dict() for p in related]), 200


#delete all product
@app.route("/delete", methods=["DELETE", "OPTIONS"])
@jwt_required()
def delete_all_products():

    products = db.session.query(Product).all()

    if not products:
        return jsonify({"message":"products not found"})
    
    for p in products:   
        db.session.delete(p)
    db.session.commit()

    return jsonify({"message": f"Deleted {len(products)} products succesfully"}),200
 

 #delete  single product
@app.route("/delete_product/<int:id>", methods = ["DELETE"])
@jwt_required()
def delete_product(id):
    
    products = db.session.query(Product).filter_by(id=id).first()
    if not products:
        return jsonify({"message": "product not found"}), 400
    
    db.session.query(CartItem).filter_by(product_id=id).delete()

     
    db.session.delete(products)
    db.session.commit()
    return jsonify ({"message": "Product deleted succesfully"}), 200


@app.route("/update_product/<int:id>", methods=["OPTIONS"])
def update_product_options(id):
    response = jsonify({"message": "Preflight approved"})
    response.headers.add("Access-Control-Allow-Origin", "http://localhost:5173")
    response.headers.add("Access-Control-Allow-Methods", "PATCH, OPTIONS")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization")
    response.headers.add("Access-Control-Allow-Credentials", "true")
    return response

#update the product
@app.route("/update_product/<int:id>", methods=["PATCH"])
@jwt_required()
def update_product(id):
    print("request.form:", request.form)
    print("request.files:", request.files)
    product = db.session.query(Product).filter_by(id=id).first()

    if not product: 
        return jsonify({"message": "Product not found"}), 400    
    
  
    product_name = request.form.get("product_name")  
    product_price = request.form.get("product_price")  
    product_description = request.form.get("product_description")  
    stock = request.form.get("stock")  
    colors = request.form.getlist("color")  # multiple colors
    lengths = request.form.getlist("length")
    category= request.form.get("category")


    image_url = request.files.get("image_url")
    if image_url:
        upload_path =os.path.join("static/uploads", image_url.filename)
        image_url.save(upload_path)
        product.image_url = upload_path

    # Update only if values exist
    if product_name is not None:
        product.product_name = product_name
    if product_price is not None:
        product.product_price = product_price
    if product_description is not None:
        product.product_description = product_description  
    if stock is not None:
        product.stock = stock 
   
    if category is not None:
        product.category = category

    # Update colors — clear old ones first
    if colors:
        ProductColor.query.filter_by(product_id=product.id).delete()
        for color in colors:
            db.session.add(ProductColor(color=color, product_id=product.id))

    #Update lengths — clear old ones first
    if lengths:
        ProductLength.query.filter_by(product_id=product.id).delete()
        for length in lengths:
            db.session.add(ProductLength(length=length, product_id=product.id))


    print("product_name:", request.form.get("product_name"))

    # Add and commit changes
    db.session.add(product)
    db.session.commit()

    

    return jsonify({
        "message": "Product updated successfully",
        "product": product.to_dict()
            
    }),200
    

    
#####cart session ########

@app.route("/addto_cart", methods=["POST", "OPTIONS"])
def addtoCart():
    if request.method == "OPTIONS":
        return jsonify({}), 200

    try:
        data = request.get_json()
        if not data:
            return jsonify({"message": "Invalid or missing JSON"}), 400

        product_id = data.get("product_id")
        quantity = data.get("quantity", 1)
        session_id = data.get("session_id")
        selected_color = data.get('selected_color')
        selected_length = data.get('selected_length')

        
        if not session_id:
            session_id = str(uuid.uuid4())
            session['session_id']= session_id

        if not product_id:
            return jsonify({"message": "Product ID is required"}), 400

        product = Product.query.filter_by(id=product_id).first()
        if not product:
            return jsonify({"message": "Product not found"}), 404

        if quantity > product.stock:
            return jsonify({"message": "Not enough stock"}), 400

        # session_id = get_or_create_session_id()

        #Find or create a cart for this session
        cart = Cart.query.filter_by(session_id=session_id).first()
        if not cart:
            cart = Cart(session_id=session_id)
            db.session.add(cart)
            db.session.commit()

        # Check if product already exists in cart_items
        cart_item = CartItem.query.filter_by(cart_id=cart.id, product_id=product_id).first()
        if cart_item:
            if cart_item.quantity + quantity > product.stock:
                return jsonify({"message": "Not enough stock"}), 400
            cart_item.quantity += quantity
            if selected_color is not None:
                cart_item.selected_color = selected_color
            if selected_length is not None:
                cart_item.selected_length = selected_length
        else:
            #Create new cart item
            cart_item = CartItem(
                cart_id=cart.id,
                product_id=product_id,
                quantity=quantity,
                selected_color=selected_color,   
                selected_length=selected_length
            )
            db.session.add(cart_item)

        # Reduce stock
        product.stock -= quantity

        db.session.commit()

        return jsonify({
            "message": "Product added to cart",
            "success": True,
            "session_id": session_id
        }), 200

    except Exception as e:
        db.session.rollback()
        print("Error in addto_cart:", str(e))
        return jsonify({"message": "Server error", "error": str(e)}), 500


@app.route("/view_cart/<session_id>", methods=["GET", "OPTIONS"])
def view_cart(session_id):
    if request.method == "OPTIONS":
        return jsonify({}), 200

    try:
        print("view_cart called with session_id:", session_id)
        
        # First, find the cart for this session
        cart = Cart.query.filter_by(session_id=session_id).first()
        
        if not cart:
            return jsonify({
                "success": True,
                "cart": [],
                "message": "No cart found for this session"
            }), 200
        
        # Then get all cart items for this cart
        cart_items = CartItem.query.filter_by(cart_id=cart.id).all()
        cart_data = [item.to_dict() for item in cart_items]

        return jsonify({
            "success": True,
            "cart": cart_data,
            "cart_id": str(cart.id),
            "session_id": session_id
        }), 200

    except Exception as e:
        print(f"Error in view_cart: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route("/test_route_working")
def test_route():
    return "Routes are loading", 200

@app.route("/delete_Itemincart/<uuid:cart_id>/<int:product_id>", methods=["DELETE"])
def delete_item_in_cart(cart_id, product_id):
    if request.method == "OPTIONS":
        return jsonify({}), 200
    print(f"DELETE request received for cart_id: {cart_id}, product_id: {product_id}")
    
    try:
        
        # Verify the item exists
        cart_item = CartItem.query.filter_by(
            cart_id=(cart_id),
            product_id=product_id
        ).first()
        
        if not cart_item:
            return jsonify({"error": "Item not found"}), 404
            
        # Delete the item
        db.session.delete(cart_item)
        db.session.commit()
        
        return jsonify({"message": "Item deleted successfully"}), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting item: {str(e)}")
        return jsonify({"error": "Server error"}), 500

@app.route("/checkout/<int:cart_id>", methods=["POST"])
def checkout(cart_id):
    data = request.get_json()

    name = data.get('name')
    phone = data.get('phone')
    address = data.get('address')
    email = data.get('email')

    if not all([name, phone, address, email]):
        return jsonify({'message': 'Missing delivery information'}), 400

    cart_items = db.session.query(Cart).filter_by(cart_id=cart_id).all()
    if not cart_items:
        return jsonify({"message": "Cart is empty"}), 404

    total_amount = 0
    order_summary = ""

    try:
        print('mail failed')
        # Create the order
        new_order = Order(name=name, phone=phone, address=address, email=email)
        db.session.add(new_order)
        db.session.flush()

        # Process each cart item
        
        for cart in cart_items:
            product = db.session.query(Product).filter_by(id=cart.product_id).first()

            if not product:
                return jsonify({"message": f"Product with id {cart.product_id} not found"}), 404

            if cart.quantity > product.stock:
                return jsonify({"message": f"Not enough stock for {product.product_name}"}), 400

            # Update total
            total_amount += product.product_price * cart.quantity

            # Create order item
            order_item = OrderItem(
                order_id=new_order.id,
                product_id=cart.product_id,
                quantity=cart.quantity,
                price=product.product_price
            )
            db.session.add(order_item)

            # Update product stock
            product.stock -= cart.quantity

            # Add to order summary
            order_summary += f"{product.product_name} x {cart.quantity} = {product.product_price * cart.quantity}\n"
            
            # Delete ONLY this cart item (not all items)
            db.session.delete(cart)

        #save toatal and oreder summmary in the. order recor
        new_order.total_amount = total_amount
        new_order.order_summary = order_summary

        
        db.session.commit()

    
        return jsonify({
            "message": "Order placed successfully",
            "total_amount": total_amount,
            "cart_id": cart_id,
            "order_id": new_order.id
        }), 200

    except Exception as e:
        db.session.rollback()  # Rollback on error
        app.logger.error(f"Checkout error: {str(e)}")
        traceback.print_exc()
        return jsonify({"message": "Internal server error during checkout"}), 500
    

@app.route("/admin/login", methods=['POST'])
def admin_login():
    data = request.get_json()

    user = db.session.query(User).filter_by(email=data['email']).first()
    if not user:
        return jsonify ({"message": "Invalid email or password "}), 401
    
    if bcrypt.checkpw(data['password'].encode('utf-8'), user.password.encode('utf-8')):
        if not user.is_admin:
            return jsonify({"message": "Admin aces required"}), 403
        
        #create jwt token
        access_token = create_access_token(
            identity=str(user.id),
            additional_claims={'is_admin': True}
        )
         
        return jsonify({
            "message": "Admin login succesfull",
            "access_token": access_token,
            "user": user.to_dict()

        }), 200
    else:
        return jsonify({"message": "Invalid email or password"}), 401
    
#verify token 
@app.route('/api/admin/verify-token')
@jwt_required()
def verify_token():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user.is_admin:
        return jsonify({"valid": False, "error": "Not an admin"}), 403
    
    return jsonify({
        "valid": True,
        "user": user.to_dict()
    })

    #login 
@app.route("/login", methods=['POST'])
def login():

    data= request.get_json()
    
    user = db.session.query(User).filter_by(email=data['email']).first()
    if not user:
        return jsonify({"message":"Invalid email or password"}),401

    if bcrypt.checkpw(data['password'].encode('utf-8'),  user.password.encode('utf-8')):
        return jsonify({"message": "Login succesful"}),200
    else:
        return jsonify({"message": "Invalid email or password"}),401
    

#signup route for admin
@app.route("/signup", methods=["POST"])
def signup():
    
    data = request.get_json()
    print("Received signup data:", data)
    print("Keys received:", data.keys())
    print("Full data received:", data)

    if not data.get ('firstname') or  not data.get ('lastname') or not data.get('email')or not data.get('password') or not data.get('confirm_password'):
        return jsonify({"message" : "kindly provide required fields!"}), 400
    
    if data["password"] != data['confirm_password']:
        return jsonify({"message": "passwords do not match"}), 400
    
    existing_user = db.session.query(User).filter_by(email=data['email']).first()
    if existing_user:
        return jsonify({"message": "user already exist"}),409
    
    user = User(firstname=data['firstname'],  lastname=data['lastname'], email=data['email'])
    user.set_password(data['password'])
    db.session.add(user)
    db.session.commit()
    return  jsonify(user.to_dict()),201

def clear_cart(cart_id):
    try:
        cart = Cart.query.get(cart_id)
        if cart:
            # Delete all items inside the cart
            CartItem.query.filter_by(cart_id=cart_id).delete()
            db.session.commit()
    except Exception as e:
        db.session.rollback()
        print(f"Error clearing cart: {e}")

 
@app.route('/payment', methods=['POST'])
def payment():
    try:
        if not PAYSTACK_KEY:
            return jsonify({"status": "error", "message": "Payment service unavailable"}), 500

        data = request.get_json()
        required_fields = ['email', 'fullname', 'amount', 'order_id']
        missing = [field for field in required_fields if field not in data]
        if missing:
            return jsonify({
                "status": "error",
                "message": f"Missing fields: {', '.join(missing)}"
            }), 400

        # Fetch order
        order = Order.query.get(data['order_id'])
        if not order:
            return jsonify({"status": "error", "message": "Order not found"}), 404

        # Use amount from DB, fallback to frontend
        amount_value = getattr(order, "total_amount", None) or data['amount']
        amount = int(float(amount_value) * 100)
        if amount <= 0:
            return jsonify({"status": "error", "message": "Invalid amount"}), 400

        # Prepare Paystack payload
        payment_data = {
            "email": order.email,
            "amount": amount,
            "callback_url": "http://localhost:5173/success",
            "metadata": {
                "order_id": order.id,
                "customer_name": getattr(order, "fullname", None) or getattr(order, "name", ""),
                "custom_fields": [
                    {
                        "display_name": "Order Reference",
                        "variable_name": "order_ref",
                        "value": f"ORDER-{order.id}"
                    }
                ]
            }
        }

        headers = {"Authorization": f"Bearer {PAYSTACK_KEY}", "Content-Type": "application/json"}
        response = requests.post(PAYSTACK_INIT_URL, headers=headers, json=payment_data, timeout=10)
        response_data = response.json()

        if response.status_code != 200 or not response_data.get('status'):
            return jsonify({
                "status": "error",
                "message": response_data.get('message', 'Payment failed')
            }), 400
        # ✅ Send confirmation email (optional)
        try:
            email_body = f"""
            Hi {getattr(order, "fullname", None) or getattr(order, "name", "Customer")},

            Thank you for your order! Here are your order details:

            {order.order_summary or "No summary available"}

            Total Amount: {amount_value}
            """
            send_email(order.email, "Order Confirmation", email_body, MAIL_USERNAME, MAIL_PASSWORD)
        except Exception as e:
            current_app.logger.error(f"Email sending failed: {str(e)}")

        return jsonify({
            "status": "success",
            "message": "Payment initialized",
            "authorization_url": response_data['data']['authorization_url'],
            "reference": response_data['data']['reference']
        })
         

    except Exception as e:
        current_app.logger.error(f"Payment error: {str(e)}", exc_info=True)
        return jsonify({"status": "error", "message": "Unexpected error"}), 500 



@app.route('/admin/statistics', methods=['GET'])
@jwt_required()
def get_statistic():
    total_orders = db.session.query(func.count(Order.id)).scalar()
    total_revenue = db.session.query(func.sum(OrderItem.price * OrderItem.quantity)).join(Order).filter(Order.paid == True).scalar()
    total_customers = db.session.query(func.count(func.distinct(Order.email))).scalar()
    total_product = db.session.query(func.sum(Product.stock)).scalar() or 0

    return jsonify({
        "total_orders": total_orders,
        "total_revenue": total_revenue,
        "total_customers": total_customers,
        "total_product":total_product,
    }), 200

@app.route('/create_order', methods=['POST'])
def create_order():
    try:
        data = request.get_json()
        app.logger.info(f"Create order data: {data}")
        
        # Validate required fields
        required_fields = ['amount', 'fullname', 'email', 'address', 'phone', 'items']
        for field in required_fields:
            if field not in data:
                app.logger.error(f"Missing required field: {field}")
                return jsonify({"error": f"Missing required field: {field}"}), 400
            else:
                app.logger.info(f"Field {field}: {data[field]}")

        # Validate items array

        if not isinstance(data['items'], list) or len(data['items']) == 0:
            app.logger.error("Items must be a non-empty array")
            return jsonify({"error": "Items must be a non-empty array"}), 400

        # Validate each item
        for i, item in enumerate(data['items']):
            app.logger.info(f"Validating item {i}: {item}")
            if 'product_id' not in item or 'quantity' not in item:
                app.logger.error(f"Item {i} missing product_id or quantity: {item}")
                return jsonify({"error": f"Item {i} must have product_id and quantity"}), 400

        # Generate UUID for cart_id (or set to None)
        cart_id = None  # Since we're not providing cart_id

        # Create order
        new_order = Order(
            cart_id=cart_id,
            amount=float(data['amount']),
            fullname=data['fullname'],
            email=data['email'],
            address=data['address'],
            phone=data['phone'],
            status='pending',
            paid=False
        )
        
        app.logger.info(f"Creating order: {new_order.__dict__}")
        
        db.session.add(new_order)
        db.session.flush()
        app.logger.info(f"Order created with ID: {new_order.id}")

        # Add order items
        for item_data in data['items']:
            order_item = OrderItem(
                order_id=new_order.id,
                product_id=item_data['product_id'],
                quantity=item_data['quantity'],
                price=float(item_data.get('price', 0)),
                selected_color=item_data.get('selected_color'),
                selected_length=item_data.get('selected_length')
            )
            app.logger.info(f"Adding order item: {order_item.__dict__}")
            db.session.add(order_item)

        db.session.commit()
        app.logger.info(f"Order {new_order.id} committed successfully")
        
        return jsonify({
            "success": True,
            "message": "Order created successfully",
            "order_id": new_order.id
        }), 201

    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Order creation failed: {str(e)}", exc_info=True)
        return jsonify({"error": f"Failed to create order: {str(e)}"}), 500
    


    
@app.route('/submit_complain', methods=['POST'])
def submit_complain():
    try: 
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400

        required_fields = ['name', 'email', 'message', 'subject']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
            
        new_complaint = Complaint(
            name =  data['name'],
            email =  data['email'],
            message =  data['message'],
            subject =  data['subject'],
        )
        db.session.add(new_complaint)
        db.session.commit()

        return jsonify({
            "message": "complaint succesfully created", 
            "complaint":{
                "id": str(new_complaint.id), 
                "name": new_complaint.name,
                "email": new_complaint.email,
                "message": new_complaint.message, 
                "subject": new_complaint.subject
        
            }
        }),201
    except Exception as e: 
        db.session.rollback()
        import traceback
        print("❌ Error in submit_complain route:")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500
    



# GET single complain
@app.route('/complaints/<int:complain_id>', methods=['GET'])
@jwt_required()
def get_complaint(complain_id):
    try:
        complaint = Complaint.query.get(complain_id)
        if not complaint:
            return jsonify({"error": "Complaint not found"}), 404

        return jsonify({
            "id": complaint.id,
            "name": complaint.name,
            "email": complaint.email,
            "message": complaint.message,
            "subject": complaint.subject
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
  

 # GET /complaints — retrieve all complaints
@app.route('/complaints', methods=['GET'])
@jwt_required()
def get_all_complaints():
    try:
        complaints = Complaint.query.all()
        return jsonify([
            {
                "id": c.id,
                "name": c.name,
                "email": c.email,
                "message": c.message,
                "subject": c.subject
            }
            for c in complaints
        ]), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500 


@app.route('/orders', methods=['GET'])
@jwt_required()
def get_orders():
    try:
        # Get query parameters
        status = request.args.get('status')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)

        # Base query with eager loading
        query = Order.query.options(
            db.joinedload(Order.payments),
            db.joinedload(Order.user),
            db.joinedload(Order.order_items).joinedload(OrderItem.product)
        ).order_by(Order.created_at.desc())

        # Filter by status if provided
        if status:
            query = query.filter(Order.status == status)

        # Pagination
        paginated_orders = query.paginate(page=page, per_page=per_page, error_out=False)
        orders = paginated_orders.items

        # Build response
        result = {
            "page": paginated_orders.page,
            "per_page": paginated_orders.per_page,
            "total_pages": paginated_orders.pages,
            "total_orders": paginated_orders.total,
            "orders": [{
                "id": order.id,
                "amount": order.amount,
                "status": order.status,
                "paid": order.paid,
                "reference": order.payments[0].reference if order.payments else None,
                "created_at": order.created_at.strftime("%Y-%m-%d %H:%M:%S"),
                "user_id": order.user_id,
                "user_email": order.user.email if order.user else None,
                "fullname": order.fullname,
                "email": order.email,
                "address": order.address,
                "phone": order.phone,
                "items": [{
                    "id": item.id,
                    "product_id": item.product_id,
                    "quantity": item.quantity,
                    "price": item.price,
                    "product_name": item.product.product_name if item.product else None,
                    "image_url": item.product.image_url if item.product else None,
                    "selected_color": item.selected_color,
                    "selected_length": item.selected_length
                } for item in order.order_items]
            } for order in orders]
        }

        # Log successful request
        app.logger.info(f"Successfully fetched {len(orders)} orders")
        return jsonify(result)

    except Exception as e:
        app.logger.error(f"Error in /orders endpoint: {str(e)}", exc_info=True)
        return jsonify({
            "success": False,
            "error": "Failed to fetch orders",
            "message": str(e)
        }), 500

@app.route('/orders/<int:order_id>', methods=['GET'])
@jwt_required()
def get_singleorder(order_id):
    try:
        # Updated to use Session.get() instead of Query.get()
        order = db.session.get(Order, order_id)
        
        if not order:
            return jsonify({"error": "Order not found"}), 404

        # Get payment reference if exists
        payment_ref = order.payments[0].reference if order.payments else None

        # Build response using order_items relationship
        order_data = {
            "id": order.id,
            "cart_id": str(order.cart_id),
            "amount": order.amount,
            "status": order.status,
            "paid": order.paid,
            "created_at": order.created_at.strftime("%Y-%m-%d %H:%M:%S"),
            "fullname": order.fullname,
            "email": order.email,
            "address": order.address,
            "phone": order.phone,
            "user_id": order.user_id,
            "user_email": order.user.email if order.user else None,
            "reference": payment_ref,
            # Use order_items relationship instead of items
            "items": [{
                "id": item.id,
                "product_id": item.product_id,
                "quantity": item.quantity,
                "price": item.price,
                "product_name": item.product.product_name if item.product else None,
                "image_url": item.product.image_url if item.product else None,
                "selected_color": item.selected_color,
                "selected_length": item.selected_length
            } for item in order.order_items]
        }

        return jsonify(order_data)

    except Exception as e:
        app.logger.error(f"Error fetching order {order_id}: {str(e)}")
        return jsonify({"error": "Failed to fetch order"}), 500

#update status route
@app.route('/orders/<int:order_id>/status', methods=['PUT'])
@jwt_required()
def update_orderstatus(order_id):
    data = request.get_json()
    new_status = data.get('status')

    order = db.session.query(Order).filter(Order.id == order_id).first()
    if not order:
        return jsonify({'error':'order not found'}), 404
    
    order.status = new_status
    db.session.commit()
    
    return jsonify({
        'message': 'order status updated',
        'order': {
            'id': order.status,
            'status':order.status,
        }
    })
    


@app.route('/recent_orders', methods=['GET'])
@jwt_required()
def recent_orders():
    status = request.args.get('status')
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)

    # Eager load payments and user to avoid N+1 queries
    query = db.session.query(Order).options(
        db.joinedload(Order.payments),
        db.joinedload(Order.user)
    ).order_by(Order.created_at.desc())

    if status:
        query = query.filter(Order.status == status)

    # Pagination
    query = query.offset((page - 1) * per_page).limit(per_page)
    orders = query.all()

    result = [{
        "id": order.id,
        "amount": order.amount,
        "status": order.status,
        "paid": order.paid,
        # Get reference from the first payment (if exists)
        "reference": order.payments[0].reference if order.payments else None,
        "created_at": order.created_at.strftime("%Y-%m-%d %H:%M:%S"),
        "user_id": order.user_id,
        "user_email": order.user.email if order.user else None,
        "fullname": order.fullname,
        "email": order.email,
        "address": order.address,
        "items": json.loads(order.items),  # Assuming items is stored as JSON string
        "phone": order.phone,
    } for order in orders]

    return jsonify({
        "page": page,
        "per_page": per_page,
        "orders": result
    }) 

@app.route('/paystack/webhook', methods=['POST'])
def paystack_webhook():
    secret = bytes(PAYSTACK_KEY, 'utf-8')
    signature = request.headers.get('x-paystack-signature', '')
    body = request.get_data()

    hashed = hmac.new(secret,body,  hashlib.sha512).hexdigest()
    if hashed != signature:
        return 'Invalid signature', 400
    
    data = request.get_json()

    if data['event'] == 'charge.success':
        order_id = data['data']['metadata'].get('order_id')

        order = Order.query.get(order_id)
        if order:
            order.paid = True
            cart  = Cart.query.get(order.cart_id)
            if cart:
                 CartItem.query.filter_by(cart_id=cart.id).delete()
                 db.session.delete(cart)

            db.session.commit()

        return jsonify({'status': 'ok'}), 200

    return jsonify({'status': 'ignored'}), 200

# Debug Endpoint to see all orders
@app.route('/debug/orders')
def debug_orders():
    orders = Order.query.order_by(Order.created_at.desc()).all()
    result = [{
        'id': o.id, 
        'paid': o.paid, 
        'status': o.status,
        'amount': o.amount,
        'email': o.email,
        'created_at': o.created_at.isoformat() if o.created_at else None
    } for o in orders]
    return jsonify(result)

# Test webhook endpoint
@app.route('/test_webhook/<int:order_id>', methods=['POST'])
def test_webhook(order_id):
    try:
        print(f"🔄 TEST WEBHOOK: Processing order {order_id}")
        
        order = Order.query.get(order_id)
        if not order:
            return jsonify({'status': 'error', 'message': 'Order not found'}), 404

        order.paid = True
        
        cart = Cart.query.get(order.cart_id)
        if cart:
            CartItem.query.filter_by(cart_id=cart.id).delete()
            db.session.delete(cart)

        db.session.commit()
        return jsonify({'status': 'success', 'message': f'Order {order_id} marked as paid'})

    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 500

# Manual mark as paid endpoint
@app.route('/mark_order_paid/<int:order_id>', methods=['POST'])
def mark_order_paid(order_id):
    try:
        order = Order.query.get(order_id)
        if order:
            order.paid = True
            db.session.commit()
            return jsonify({'message': f'Order {order_id} marked as paid'})
        return jsonify({'error': 'Order not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route("/debug/images")
def debug_images():
    images_dir = os.path.join(app.root_path, "static", "images")
    try:
        files = os.listdir(images_dir)
        return jsonify({ "images": files }), 200
    except Exception as e:
        return jsonify({ "error": str(e) }), 500


    
@app.route('/test_real_email')
def test_real_email():
    try:
        # Send a real test email
        success = sendorder_email(
            recipient="kazeemjumoke12@gmail.com",  # Send to yourself
            subject="📧 Test Email from Your Flask App",
            body="Hello! This is a test email from your Flask application."
        )
        
        if success:
            return jsonify({
                "status": "success", 
                "message": "Test email sent successfully!"
            })
        else:
            return jsonify({
                "status": "error",
                "message": "Failed to send email. Check server logs."
            })
            
    except Exception as e:
        # This will catch any errors and show them in the response
        return jsonify({
            "status": "error",
            "message": f"Error: {str(e)}"
        }), 500

if __name__ == "__main__":
    with app.app_context():
        upgrade() 
        print("Database migrated")
    app.run(debug=True, port=5002)
