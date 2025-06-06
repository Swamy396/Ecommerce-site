import tornado.ioloop
import tornado.web
import pymysql
import json
import decimal


DB_HOST = 'localhost'
DB_USER = 'root'
DB_PASS = 'Swamy@1234'
DB_NAME = 'ecommerce_db'


def get_connection():
    return pymysql.connect(
        host=DB_HOST, user=DB_USER, password=DB_PASS, db=DB_NAME,
        cursorclass=pymysql.cursors.DictCursor
    )


class RegisterHandler(tornado.web.RequestHandler):
    def set_default_headers(self):
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Headers", "Content-Type")
        self.set_header("Access-Control-Allow-Methods", "POST, OPTIONS")

    def options(self):
        self.set_status(204)
        self.finish()

    def post(self):
        try:
            data = json.loads(self.request.body)
            name = data.get("name")
            email = data.get("email")
            password = data.get("password")

            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO user_details (name, email_id, password) VALUES (%s, %s, %s)",
                (name, email, password)
            )
            conn.commit()
            conn.close()

            self.write({"status": "success", "message": "User registered successfully"})
        except pymysql.err.IntegrityError:
            self.set_status(400)
            self.write({"status": "error", "message": "Email already registered"})
        except Exception as e:
            self.set_status(400)
            self.write({"status": "error", "message": str(e)})



class LoginHandler(tornado.web.RequestHandler):
    def set_default_headers(self):
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Headers", "Content-Type")
        self.set_header("Access-Control-Allow-Methods", "POST, OPTIONS")

    def options(self):
        self.set_status(204)
        self.finish()

    def post(self):
        try:
            data = json.loads(self.request.body)
            email = data.get("email")
            password = data.get("password")

            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute(
                "SELECT userid, name, password FROM user_details WHERE email_id=%s",
                (email,)
            )
            result = cursor.fetchone()
            conn.close()

            if result is None:
                self.set_status(401)
                self.write({"status": "error", "message": "User not found"})
                return

            if password == result['password']:
                self.write({
                    "status": "success",
                    "message": "Login successful",
                    "user_id": result['userid'],
                    "name": result['name']
                })
            else:
                self.set_status(401)
                self.write({"status": "error", "message": "Incorrect password"})
        except Exception as e:
            self.set_status(400)
            self.write({"status": "error", "message": str(e)})



class ProductsHandler(tornado.web.RequestHandler):
    def set_default_headers(self):
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Headers", "Content-Type")
        self.set_header("Access-Control-Allow-Methods", "GET, OPTIONS")

    def options(self):
        self.set_status(204)
        self.finish()

    def get(self):
        try:
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT productid, name, category, price, image FROM products")
            products = cursor.fetchall()
            conn.close()

            for product in products:
                if isinstance(product['price'], decimal.Decimal):
                    product['price'] = float(product['price'])

            self.write({"status": "success", "products": products})
        except Exception as e:
            self.set_status(500)
            self.write({"status": "error", "message": str(e)})


class CartAddHandler(tornado.web.RequestHandler):
    def set_default_headers(self):
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Headers", "Content-Type")
        self.set_header("Access-Control-Allow-Methods", "POST, OPTIONS")

    def options(self):
        self.set_status(204)
        self.finish()

    def post(self):
        try:
            data = json.loads(self.request.body)
            user_id = data.get("user_id")
            product_id = data.get("product_id")

            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute(
                "SELECT * FROM cart WHERE user_id=%s AND product_id=%s", (user_id, product_id))
            if cursor.fetchone():
                self.set_status(400)
                self.write({"status": "error", "message": "Product already in cart"})
                return

            cursor.execute(
                "INSERT INTO cart (user_id, product_id) VALUES (%s, %s)", (user_id, product_id))
            conn.commit()
            conn.close()

            self.write({"status": "success", "message": "Product added to cart"})
        except Exception as e:
            self.set_status(500)
            self.write({"status": "error", "message": str(e)})


class CartDeleteHandler(tornado.web.RequestHandler):
    def set_default_headers(self):
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Headers", "Content-Type")
        self.set_header("Access-Control-Allow-Methods", "DELETE, OPTIONS")

    def options(self):
        self.set_status(204)
        self.finish()

    def delete(self):
        try:
            data = json.loads(self.request.body)
            user_id = data.get("user_id")
            product_id = data.get("product_id")

            if not user_id or not product_id:
                self.set_status(400)
                self.write({"status": "error", "message": "user_id and product_id are required"})
                return

            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute("DELETE FROM cart WHERE user_id=%s AND product_id=%s",
                           (user_id, product_id))
            conn.commit()
            conn.close()

            self.write({"status": "success", "message": "Product removed from cart"})
        except Exception as e:
            self.set_status(500)
            self.write({"status": "error", "message": str(e)})



class CartGetHandler(tornado.web.RequestHandler):
    def set_default_headers(self):
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Headers", "Content-Type")
        self.set_header("Access-Control-Allow-Methods", "GET, OPTIONS")

    def options(self):
        self.set_status(204)
        self.finish()

    def get(self, user_id):
        try:
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute("""
                SELECT p.productid, p.name, p.category, p.price, p.image
                FROM cart c
                JOIN products p ON c.product_id = p.productid
                WHERE c.user_id = %s
            """, (user_id,))
            products = cursor.fetchall()
            conn.close()

            for product in products:
                if isinstance(product['price'], decimal.Decimal):
                    product['price'] = float(product['price'])

            self.write({"status": "success", "cart": products})
        except Exception as e:
            self.set_status(500)
            self.write({"status": "error", "message": str(e)})


def make_app():
    return tornado.web.Application([
        (r"/register", RegisterHandler),
        (r"/login", LoginHandler),
        (r"/products", ProductsHandler),
        (r"/cart/add", CartAddHandler),
        (r"/cart", CartDeleteHandler),         
        (r"/cart/([0-9]+)", CartGetHandler),  
    ])



if __name__ == "__main__":
    app = make_app()
    app.listen(8888)
    print("✅ Server running at http://localhost:8888")
    tornado.ioloop.IOLoop.current().start()
