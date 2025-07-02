from flask import Flask, jsonify, request, session, redirect
from flask_session import Session 
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy 
from flask_migrate import Migrate
from datetime import datetime
from werkzeug.utils import secure_filename
import uuid
import secrets
from flask import request
import bcrypt


from models import db, Product, User,  Order, Cart
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
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres@localhost/ecommerce_bd'
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

        if not product_id:
            return jsonify({"message": "Product ID is required"}), 400

        product = Product.query.filter_by(id=product_id).first()
        if not product:
            return jsonify({"message": "Product not found"}), 404

        if quantity > product.stock:
            return jsonify({"message": "Not enough stock"}), 400

        session_id = get_or_create_session_id()

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

        return jsonify({"message": "Product added to cart", "success": True}), 200

    except Exception as e:
        print("Error in addto_cart:", str(e))
        return jsonify({"message": "Server error", "error": str(e)}), 500


@app.route("/view_cart", methods=["GET", "OPTIONS"])
def view_cart():
    print("Session ID:", session.get('session_id'))
    if request.method == "OPTIONS":
        return jsonify({}), 200  # CORS preflight response  

    try:
        session_id = get_or_create_session_id()
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

@app.route("/checkout/<int:cart_id>", methods={"POST"})
def checkout(cart_id):
     
     cart_item = db.session.query(Cart).filter_by(cart_id=cart_id).all()

     data = request.get_json()
     quantity = data.get("quantity")
     
     if not cart_item:
        return jsonify({"message":"Cart is empty"})
     
     total_amount = 0
         
     for cart in cart_item:
         product = db.sesions.query(Product).filter_by(id=cart.production_id).first()
         if not product:
            return jsonify({"message": "product with id {cart.product_id} not found"}), 404
         
         if cart.quantity > product.stock:
             return jsonify({"message": f"Not enough stock for {product.name}"}),400 
     
         total_amount = product.price * cart.quantity

     return jsonify({
      "message": "Ready for checkout",
      "total_amount": total_amount,
      "cart_id": cart_id}), 200
 
    
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
    'callback_url': 'http://localhost:5173/verifyPayment',
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

@app.route('/verifyPayment', methods=['GET'])
def verifyPayment():
    data = request.get_json()

    reference = data.get('reference')

    if not reference: 
        return jsonify({"error": "Bad request"}), 404
    
    order =  Order.query.filter_by(reference=reference).first()

    if order is None: 
        abort(404, description="order not found")
    
    if order.paid:
        return redirect('/success')
    
    verify_url = f"https://api.paystack.co/transaction/verify/{reference}"
    response = requests.get(verify_url, headers={ 'Authorization': f'Bearer {PAYSTACK_SECRET_KEY}' })

    if response.status_code != 200:
        return jsonify({"error": "verification error "}), 

    data = response.json().get('data', {})
    status = data.get('status')

    if status == 'success':
        order.paid = True
        order.status ="paid"
        session.commit()
        return redirect('/success')
    else: 
        order.status ='Failed'
        session.commit()
        return redirect('/retry')

@app.route("/debug/images")
def debug_images():
    images_dir = os.path.join(app.root_path, "static", "images")
    try:
        files = os.listdir(images_dir)
        return jsonify({ "images": files }), 200
    except Exception as e:
        return jsonify({ "error": str(e) }), 500


if __name__ == "__main__":
    app.run(debug=True, port=5002)

