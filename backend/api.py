from flask import Flask, jsonify, request, session, redirect, abort
from flask_session import Session 
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import func
from flask_migrate import Migrate
from datetime import datetime
from werkzeug.utils import secure_filename
import uuid
import secrets
import requests
import bcrypt
import json



from models import db, Product, User,  Order, Cart, OrderItem
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__, static_folder='static')
CORS(
    app,
    supports_credentials=True,
    resources={
        r"/*": {
            "origins": ["http://localhost:5173"],
            "methods": ["GET", "POST", "PUT", "DELETE", "PATCH" "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            
        }
    },
)


# Handle OPTIONS requests for CORS preflight

    
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
def addProduct():
    try:
        product_name = request.form.get("product_name")
        product_price = float(request.form.get("product_price"))
        product_description = request.form.get("product_description")
        stock = int(request.form.get("stock"))
        length = request.form.get("length")
        color = request.form.get("color")
        status = request.form.get("status")
        category = request.form.get("category")
        image_url = request.files.get('image')
        
        if not all([product_name, product_price, product_description, stock, length, color, status, category, image_url]):
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
            length=length, 
            color=color,
            status=status,
            category= category, 
            image_url=image_url
)
        db.session.add(product)
        db.session.commit()

        print("product_name:", request.form.get("product_name"))

        return jsonify(product.to_dict()), 201
        

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'An error occurred during adding' }), 500
    
    


@app.route("/edit_product/<int:id>", methods=["PUT", "OPTIONS"])
def editProduct(id):
    product = Product.query.get_or_404(id)
    data = request.get_json()

    product.product_name = data.get('product_name', product.product_name)
    product.product_price = data.get('product_price', product.product_price)
    product.color = data.get('color', product.color)
    product.length = data.get('category', product.length)
    product.product_descripton = data.get('product_description', product.product_description)
    product.stock = data.get('stock', product.stock)
    product.image_url = data.get('image_url', product.image_url)
    

    db.session.commit()

    return jsonify({
        "message": "product updated sucessfully",
        "product":product.to_dict()
}),200

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
def delete_all_products():

    products = db.session.query(Product).all()

    if not products:
        return jsonify({"message":"products not found"})
    
    for p in products:   
        db.session.delete(p)
    db.session.commit()

    return jsonify({"message": f"Deleted {len(products)} products succesfully"}),200
 

 #delete  single product
@app.route("/delete_product/<int:id>", methods = ["DELETE", "OPTIONS"])
def delete_post(id):
    
    products = db.session.query(Product).filter_by(id=id).first()
    if not products:
        return jsonify({"message": "product not found"}), 400
        
        
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
    color = request.form.get("color")
    length = request.form.get("length")
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
    if length is not None:
        product.length = length
    if color is not None:
        product.color = color
    if category is not None:
        product.category = category

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

        
        if not session_id:
            session_id = str(uuid.uuid4())
            session[session_id]= session_id

        if not product_id:
            return jsonify({"message": "Product ID is required"}), 400

        product = Product.query.filter_by(id=product_id).first()
        if not product:
            return jsonify({"message": "Product not found"}), 404

        if quantity > product.stock:
            return jsonify({"message": "Not enough stock"}), 400

        # session_id = get_or_create_session_id()

        cart_item = Cart.query.filter_by(session_id=session_id, product_id=product_id).first()
        if cart_item:
            if cart_item.quantity + quantity > product.stock:
                return jsonify({"message": "Not enough stock"}), 400
            cart_item.quantity += quantity
        else:
            new_cart = Cart(session_id=session_id, product_id=product_id, quantity=quantity)
            db.session.add(new_cart)

        product.stock -= quantity
        db.session.commit()

        return jsonify({"message": "Product added to cart", "success": True, "session_id": session_id}), 200

    except Exception as e:
        print("Error in addto_cart:", str(e))
        return jsonify({"message": "Server error", "error": str(e)}), 500


@app.route("/view_cart/<id>", methods=["GET", "OPTIONS"])
def view_cart(id):
    if request.method == "OPTIONS":
        return jsonify({}), 200  # CORS preflight response  

    try:
        print("view_cart called with id:", id)
        session_id = id
        cart_items = Cart.query.filter_by(session_id=session_id).all()

        cart_data = [item.to_dict() for item in cart_items]

        return jsonify({
            "success": True,
            "cart": cart_data
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500



@app.route("/delete_Itemincart/<int:cart_id>/<int:product_id>", methods=["DELETE", "OPTIONS"])
def delete_itemInCart(cart_id, product_id):

    cart_item = db.session.query(Cart).filter_by(cart_id=cart_id, product_id=product_id).first()
    if not cart_item:
        return jsonify({"message":"item not found"}), 404
    
    db.session.delete(cart_item)
    db.session.commit()

    return jsonify({"message":"Item succesfully removed from the cart"}), 200

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

    # Create and flush the order first to get its ID
    new_order = Order(name=name, phone=phone, address=address, email=email)
    db.session.add(new_order)
    db.session.flush()

    for cart in cart_items:
        product = db.session.query(Product).filter_by(id=cart.product_id).first()

        if not product:
            return jsonify({"message": f"Product with id {cart.product_id} not found"}), 404

        if cart.quantity > product.stock:
            return jsonify({"message": f"Not enough stock for {product.product_name}"}), 400

        total_amount += product.product_price * cart.quantity

        order_item = OrderItem(
            order_id=new_order.id,
            product_id=cart.product_id,
            quantity=cart.quantity,
            price=product.product_price
        )
        db.session.add(order_item)

    db.session.commit()

    return jsonify({
        "message": "Order placed successfully",
        "total_amount": total_amount,
        "cart_id": cart_id,
        "order_id": new_order.id
    }), 200

         
 
    
    #login for admin 
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




    
    
@app.route('/payment', methods=['POST'])
def payment():
    data = request.get_json()

    email = data.get('email')
    amount  = data.get('amount')

    if not email or not amount:
        return jsonify({'error': 'Email and amount are required'}),400
    
    headers = {
        'Authorization' : f'Bearer {PAYSTACK_KEY}',
        'Content-Type' : 'application/json'
    }

    payload = {
    "email" : email,
    'amount' : int(amount) *100,
    'callback_url': 'http://localhost:5173/success',
}

    response = requests.post(PAYSTACK_INIT_URL, json=payload,  headers=headers)
    if response.status_code !=  200:
        return jsonify({'error': 'paystack initialization failed '}),500
    
    response_data = response.json()
    print(response_data.get("data"))
    auth_url = response_data.get("data").get("authorization_url")
    reference = response_data['data']['reference']
     
    orders =Order(
        reference =  reference,
       #authorization_url = auth_url,
        amount = amount,
        status = "pending" 
    )
    db.session.add(orders)
    db.session.commit()
    return jsonify({'authorization_url': auth_url}),201


@app.route('/admin/statistics', methods=['GET'])
def get_statistic():
    total_orders = db.session.query(func.count(Order.id)).scalar()
    total_revenue = db.session.query(func.sum(OrderItem.price * OrderItem.quantity)).scalar()
    total_customers = db.session.query(func.count(func.distinct(Order.user_id))).scalar()
    total_product = db.session.query(func.sum(Product.stock)).scalar() or 0

    return jsonify({
        "total_orders": total_orders,
        "total_revenue": total_revenue,
        "total_customers": total_customers,
        "total_product": total_product,
    }), 200

@app.route('/create_order', methods=['POST'])
def create_order():
    data = request.get_json()
    print(data.get('fullname'))
    try:
        new_order = Order(
            fullname=data.get('fullname'),
            email= data.get('email'),
            phone = data.get('phone'),
            address=data.get('address'),
            items= data.get('items'),
            amount=data.get('amount'),
            status=data.get('status', 'Processing'),
            created_at=datetime.utcnow(),
        )
        print(new_order.fullname)
        db.session.add(new_order)
        db.session.commit()
        return jsonify({'order_id': new_order.id}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/orders', methods=['GET'])  
def get_all_orders():
    try:
        orders = Order.query.all()
        result = []
        last_order =orders[-1]
        print(last_order.fullname)
        for order in orders:
            result.append({
                'id': order.id,
                'fullname': order.fullname,
                'email': order.email,
                'phone': order.phone,
                'address': order.address,
                'items': [item.to_dict() for item in order.items], 
                'total_amount': order.amount,
                'status': order.status,
                'created_at': order.created_at.isoformat(),
            })
       
       
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500



@app.route('/orders/<int:order_id>', methods=['GET'])
def get_singleorder(order_id):
    order = Order.query.get(order_id)
    if not order:
        return jsonify({'error': 'Order not found'}), 404

    return jsonify({
        'id': order.id,
        'fullname': order.fullname,
        'email': order.email,
        'phone': order.phone,
        'address': order.address,
        'items': json.loads(order.items),  # convert JSON string back to Python list
        'total_amount': order.amount,
        'status': order.status,
        'created_at': order.created_at.isoformat(),
    })


@app.route('/recent_orders', methods=['GET'])
def recent_orders():
        status = request.args.get('status')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)

        query = db.session.query(Order).order_by(Order.created_at.desc())

        if status:
            query = query.filter(Order.status == status)

        # pagination
        query = query.offset((page - 1) * per_page).limit(per_page)

        orders = query.all()

        result = [{
            "id": order.id,
            "amount": order.amount,
            "status": order.status,
            "paid": order.paid,
            "reference": order.reference,
            "created_at": order.created_at.strftime("%Y-%m-%d %H:%M:%S"),
            "user_id": order.user_id,
            "user_email": order.user.email if order.user else None,
            "fullname": order.fullname,
            "email": order.email,
            "address": order.address,
            "items": json.loads(order.items),

            "phone": order.phone,
            } for order in orders]

        return jsonify({
            "page": page,
            "per_page": per_page,
            "orders": result
        })   


@app.route("/debug/images")
def debug_images():
    images_dir = os.path.join(app.root_path, "static", "images")
    try:
        files = os.listdir(images_dir)
        return jsonify({ "images": files }), 200
    except Exception as e:
        return jsonify({ "error": str(e) }), 500


if __name__ == "__main__":
    # Initialize the database
    with app.app_context():
        db.create_all()
        print("Database initialized")
    app.run(debug=True, port=5002)

