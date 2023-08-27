package lk.ijse.servlet;

import lk.ijse.db.DBConnection;

import javax.json.*;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

@WebServlet(urlPatterns = "/pages/order")
public class PurchaseOrderServletAPI extends HttpServlet {
    Connection connection = DBConnection.getDbConnection().getConnection();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.addHeader("Access-Control-Allow-Origin", "*");
        resp.addHeader("Content-Type", "application/json");
        String option = req.getParameter("option");

        System.out.println("option ok");

        try {
            switch (option) {
                case "orders":
                    PreparedStatement preparedStatement1 = connection.prepareStatement("SELECT orderID FROM orders");
                    ResultSet resultSet1 = preparedStatement1.executeQuery();
                    JsonArrayBuilder arrayBuilder = Json.createArrayBuilder();

                    System.out.println("orders ok");

                    while (resultSet1.next()) {
                        arrayBuilder.add(
                                Json.createObjectBuilder()
                                        .add("orderID", resultSet1.getString(1))
                        );
                    }
                    resp.getWriter().print(
                            Json.createObjectBuilder()
                                    .add("state", "Ok")
                                    .add("message", "Successfully loaded...!")
                                    .add("data", "[" + arrayBuilder.build() + "]")
                                    .build()
                    );

                    break;
                case "orderCount":
                    PreparedStatement preparedStatement2 = connection.prepareStatement("SELECT COUNT(orderID) as orderCount FROM orders");
                    ResultSet resultSet = preparedStatement2.executeQuery();
                    JsonObjectBuilder objectBuilder = Json.createObjectBuilder();

                    System.out.println("orderCount ok");

                    if (resultSet.next()) {
                        objectBuilder.add("ordersCount", resultSet.getString(1));
                    }
                    resp.getWriter().print(
                            Json.createObjectBuilder()
                                    .add("state", "Ok")
                                    .add("message", "Successfully loaded...!")
                                    .add("data", "[" + objectBuilder.build() + "]")
                                    .build()
                    );
                    break;
                case "orderDetails":
                    String orderID = req.getParameter("orderID");
                    PreparedStatement getOrderStatement = connection.prepareStatement("SELECT * FROM orders WHERE orderID=?");
                    getOrderStatement.setObject(1, orderID);
                    ResultSet order = getOrderStatement.executeQuery();

                    JsonArrayBuilder array = Json.createArrayBuilder();

                    System.out.println("orderDetails ok");

                    if (order.next()) {
                        String date = order.getString(2);
                        String nic = order.getString(3);
                        String total = order.getString(4);
                        String subTotal = order.getString(5);
                        String cash = order.getString(6);
                        String balance = order.getString(7);
                        String discount = order.getString(8);

                        array.add(Json.createObjectBuilder()
                                .add("date", date)
                                .add("nic", nic)
                                .add("total", total)
                                .add("subTotal", subTotal)
                                .add("cash", cash)
                                .add("balance", balance)
                                .add("discount", discount)
                                .build()
                        );

                        System.out.println(1);

                        PreparedStatement getOrderDetailsStatement = connection.prepareStatement("SELECT * FROM orderDetails WHERE orderID=?");
                        getOrderDetailsStatement.setObject(1, orderID);
                        ResultSet orderDetails = getOrderDetailsStatement.executeQuery();

                        System.out.println(2);

                        JsonArrayBuilder orderDetailsArray = Json.createArrayBuilder();
                        while (orderDetails.next()) {
                            String code = orderDetails.getString(2);
                            String price = orderDetails.getString(3);
                            String qty = orderDetails.getString(4);

                            PreparedStatement getItemStatement = connection.prepareStatement("SELECT name FROM item WHERE code=?");
                            getItemStatement.setObject(1, code);

                            ResultSet itemDetails = getItemStatement.executeQuery();

                            System.out.println(3);

                            String itemName = null;
                            if (itemDetails.next()) {
                                itemName = itemDetails.getString(1);
                            }

                            orderDetailsArray.add(
                                    Json.createObjectBuilder()
                                            .add("itemCode", code)
                                            .add("itemName", itemName)
                                            .add("itemPrice", price)
                                            .add("itemQty", qty)
                                            .build()
                            );
                        }
                        array.add(orderDetailsArray.build());

                        System.out.println(4);

                        PreparedStatement getCustomerDetailsStatement = connection.prepareStatement("SELECT * FROM customer WHERE nic=?");
                        getCustomerDetailsStatement.setObject(1, nic);
                        ResultSet customerDetails = getCustomerDetailsStatement.executeQuery();
                        if (customerDetails.next()) {
                            String cusName = customerDetails.getString(2);
                            String tel = customerDetails.getString(3);
                            String address = customerDetails.getString(4);

                            System.out.println(5);

                            array.add(
                                    Json.createObjectBuilder()
                                            .add("nic", nic)
                                            .add("name", cusName)
                                            .add("tel", tel)
                                            .add("address", address)
                                            .build()
                            );
                        }
                    }

                    resp.getWriter().print(
                            Json.createObjectBuilder()
                                    .add("state", "Ok")
                                    .add("message", "Successfully loaded...!")
                                    .add("data", "[" + array.build() + "]")
                                    .build()
                    );
                    break;
            }
        } catch (SQLException e) {
            resp.addHeader("Content-Type", "application/json");
            resp.setStatus(400);
            resp.getWriter().print(
                    Json.createObjectBuilder()
                            .add("state", "Error")
                            .add("message", e.getMessage())
                            .add("data", "[]")
                            .build()
            );
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.addHeader("Access-Control-Allow-Origin", "*");
        resp.addHeader("Content-Type", "application/json");

        JsonReader reader = Json.createReader(req.getReader());
        JsonObject jsonObject = reader.readObject();

        String orderId = jsonObject.getString("orderId");
        String date = jsonObject.getString("date");
        String nic = jsonObject.getString("nic");
        double total = Double.parseDouble(jsonObject.getString("total"));
        double subTotal = Double.parseDouble(jsonObject.getString("subTotal"));
        double cash = Double.parseDouble(jsonObject.getString("cash"));
        int discount = Integer.parseInt(jsonObject.getString("discount"));
        double balance = Double.parseDouble(jsonObject.getString("balance"));

        try {
            try {
                connection.setAutoCommit(false);
                PreparedStatement orderStatement = connection.prepareStatement("INSERT INTO orders VALUES (?,?,?,?,?,?,?,?)");
                orderStatement.setObject(1, orderId);
                orderStatement.setObject(2, date);
                orderStatement.setObject(3, nic);
                orderStatement.setObject(4, total);
                orderStatement.setObject(5, subTotal);
                orderStatement.setObject(6, cash);
                orderStatement.setObject(7, balance);
                orderStatement.setObject(8, discount);

                if (orderStatement.executeUpdate() > 0) {

                    int count = 0;
                    JsonArray cartItems = jsonObject.getJsonArray("cartItems");
                    for (int i = 0; i < cartItems.size(); i++) {
                        PreparedStatement orderDetailsStatement = connection.prepareStatement("INSERT INTO orderdetails VALUES (?,?,?,?)");
                        JsonObject cartItem = cartItems.getJsonObject(i);

                        String itemCode = cartItem.getString("itemCode");
                        double itemPrice = Double.parseDouble(cartItem.getString("itemPrice"));
                        int itemQty = Integer.parseInt(cartItem.getString("itemQty"));

                        orderDetailsStatement.setObject(1, orderId);
                        orderDetailsStatement.setObject(2, itemCode);
                        orderDetailsStatement.setObject(3, itemQty);
                        orderDetailsStatement.setObject(4, itemPrice);

                        if (orderDetailsStatement.executeUpdate() > 0) {
                            count++;
                        }
                    }
                    if (count == cartItems.size()) {
                        count = 0;

                        for (int i = 0; i < cartItems.size(); i++) {
                            JsonObject cartItem = cartItems.getJsonObject(i);

                            String itemCode = cartItem.getString("itemCode");
                            int itemQty = Integer.parseInt(cartItem.getString("itemQty"));

                            PreparedStatement preparedStatement = connection.prepareStatement("SELECT qty FROM item WHERE code=?");
                            preparedStatement.setObject(1, itemCode);

                            ResultSet resultSet = preparedStatement.executeQuery();
                            System.out.println(resultSet.next());/////////
                            int oldQTY = Integer.parseInt(resultSet.getString(1));

                            PreparedStatement updateItemsStatement = connection.prepareStatement("UPDATE item SET qty=? WHERE code=?");
                            updateItemsStatement.setObject(1, oldQTY - itemQty);
                            updateItemsStatement.setObject(2, itemCode);

                            if (updateItemsStatement.executeUpdate() > 0) {
                                count++;
                            }
                        }

                        if (count == cartItems.size()) {
                            connection.commit();
                            resp.getWriter().print(
                                    Json.createObjectBuilder()
                                            .add("state", "Ok")
                                            .add("message", "Successfully Added...!")
                                            .add("data", "[]")
                                            .build()
                            );
                        }
                    }
                }
            } catch (Exception e) {
                connection.rollback();
            } finally {
                connection.setAutoCommit(true);
                connection.close();
            }
        } catch (SQLException e) {
            resp.addHeader("Content-Type", "application/json");
            resp.setStatus(400);
            resp.getWriter().print(
                    Json.createObjectBuilder()
                            .add("state", "Error")
                            .add("message", e.getMessage())
                            .add("data", "[]")
                            .build()
            );
        }
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {

    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {

    }

    @Override
    protected void doOptions(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.addHeader("Access-Control-Allow-Origin", "*");
        resp.addHeader("Access-Control-Allow-Methods", "PUT,DELETE");
        resp.addHeader("Access-Control-Allow-Headers", "Content-Type");
    }
}
