var mysql = require("mysql");
var inquirer = require("inquirer");
var currentStock = 0;

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,

    user: "root",

    password: "use your own",
    database: "bamazon"
});

connection.connect(function(err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    openStore();
});

function openStore() {
    connection.query("SELECT * FROM products where stock_quantity > 0", function(err, res) {
        if (err) throw err;
        console.log("-----------------------------------");
        console.log("Lisa's Way Cool Steampunk and Salt Water Goodies Store");
        console.log("-----------------------------------");
        console.log('Product ID' + " | " + 'Product name'+ " | " + 'Department Name' + " | " + 'Price' + " | " + 'Quantity');
        console.log("-----------------------------------");
        for (var i = 0; i < res.length; i++) {
            console.log(res[i].product_id + " | " + res[i].product_name + " | " + res[i].department_name + " | ","$", + res[i].price + " | " + res[i].stock_quantity);
        }
        console.log("-----------------------------------");
        takeOrder();
    });
}; //endof openStore

function takeOrder() {
    inquirer.prompt([{
        type: "input",
        name: "productID",
        message: "Enter the ID of the candle or lamp you would like to find?",
    }]).then(function(product) {
        var productID = product.productID;
        inquirer.prompt([{
            type: "input",
            name: "Quantity",
            message: "How many you would like to purchase?",
        }]).then(function(quantity) {
            productQuantity = quantity.Quantity
            checkStock(productID, productQuantity);
        }); //end of inquirer.prompt
    }); //end of inquirer.prompt
}; //end of takeOrder

function checkStock(productID, productQuantity) {
    connection.query('SELECT stock_quantity FROM products WHERE product_id=?', [productID], function(err, res) {
        if (err) throw err;
        currentStock = res[0].stock_quantity;
        if (currentStock < productQuantity) {
            console.log('Insufficient quantity! Please enter a valid order.');
            takeOrder();
        } else {
            var newStock = currentStock - productQuantity;
            fillOrder(productID, newStock, productQuantity);
        }
    });
} //end of checkStock

function fillOrder(productID, newStock, productQuantity) {
    connection.query("UPDATE products SET ? WHERE ?", [{
        stock_quantity: newStock
    }, {
        product_id: productID
    }], function(err, res) {
        if (err) throw err;
        connection.query('SELECT price FROM products WHERE product_id=?', [productID], function(err, res) {
            if (err) throw err;
            itemPrice = res[0].price;
            var orderTotal = itemPrice * productQuantity
            console.log("Your total $" + orderTotal + ". Thank you for shopping at Lisa's Way Cool Steampunk and Salt Water Goodies Store.");
            connection.end(function(err) {
                if (err) {
                    throw err;
                }
            })
        });
    });

} //end of fillOrder