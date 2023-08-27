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

@WebServlet(urlPatterns = "/pages/customer")
public class CustomerServletAPI extends HttpServlet {
    Connection connection = DBConnection.getDbConnection().getConnection();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.addHeader("Access-Control-Allow-Origin", "*");
        resp.addHeader("Content-Type", "application/json");
        JsonObjectBuilder objectBuilder = Json.createObjectBuilder();

        try {
            PreparedStatement preparedStatement = connection.prepareStatement("SELECT * FROM customer");
            ResultSet resultSet = preparedStatement.executeQuery();
            JsonArrayBuilder arrayBuilder = Json.createArrayBuilder();
            while (resultSet.next()) {
                arrayBuilder.add(
                        Json.createObjectBuilder()
                                .add("nic", resultSet.getString(1))
                                .add("name", resultSet.getString(2))
                                .add("tel", resultSet.getString(3))
                                .add("address", resultSet.getString(4))
                );
            }
            resp.getWriter().print(
                    objectBuilder
                            .add("state", "Ok")
                            .add("message", "Successfully loaded...!")
                            .add("data", "[" + arrayBuilder.build() + "]")
                            .build());

        } catch (SQLException e) {
            resp.addHeader("Content-Type", "application/json");
            resp.setStatus(400);
            resp.getWriter().print(
                    objectBuilder
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
        String nic = req.getParameter("nic");
        String name = req.getParameter("name");
        String tel = req.getParameter("tel");
        String address = req.getParameter("address");
        System.out.println(nic + name + address + tel);
        JsonObjectBuilder objectBuilder = Json.createObjectBuilder();
        try {
            PreparedStatement preparedStatement = connection.prepareStatement("INSERT INTO customer VALUES (?,?,?,?)");
            preparedStatement.setObject(1, nic);
            preparedStatement.setObject(2, name);
            preparedStatement.setObject(3, tel);
            preparedStatement.setObject(4, address);
            if (preparedStatement.executeUpdate() > 0) {
                resp.getWriter().print(
                        objectBuilder
                                .add("state", "Ok")
                                .add("message", "Successfully Added...!")
                                .add("data", "[]")
                                .build()
                );
            }

        } catch (SQLException e) {
            resp.addHeader("Content-Type", "application/json");
            resp.setStatus(400);
            resp.getWriter().print(
                    objectBuilder
                            .add("state", "Error")
                            .add("message", e.getMessage())
                            .add("data", "[]")
                            .build()
            );
        }
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.addHeader("Access-Control-Allow-Origin", "*");
        resp.addHeader("Content-Type", "application/json");
        JsonObjectBuilder objectBuilder = Json.createObjectBuilder();

        JsonReader reader = Json.createReader(req.getReader());
        JsonObject jsonObject = reader.readObject();
        String nic = jsonObject.getString("nic");
        String name = jsonObject.getString("name");
        String tel = jsonObject.getString("tel");
        String address = jsonObject.getString("address");

        try {
            PreparedStatement preparedStatement = connection.prepareStatement("UPDATE customer SET name=?,tel=?,address=? WHERE nic=?");
            preparedStatement.setObject(1, name);
            preparedStatement.setObject(2, tel);
            preparedStatement.setObject(3, address);
            preparedStatement.setObject(4, nic);
            if (preparedStatement.executeUpdate() > 0) {
                resp.getWriter().print(
                        objectBuilder
                                .add("state", "Ok")
                                .add("message", "Successfully Updated...!")
                                .add("data", "[]")
                                .build()
                );
            }
        } catch (SQLException e) {
            resp.addHeader("Content-Type", "application/json");
            resp.setStatus(400);
            resp.getWriter().print(
                    objectBuilder
                            .add("state", "Error")
                            .add("message", e.getMessage())
                            .add("data", "[]")
                            .build()
            );
        }

    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.addHeader("Access-Control-Allow-Origin", "*");
        resp.addHeader("Content-Type", "application/json");
        JsonObjectBuilder objectBuilder = Json.createObjectBuilder();

        try {
            PreparedStatement preparedStatement = connection.prepareStatement("DELETE FROM customer WHERE nic=?");
            preparedStatement.setObject(1, req.getParameter("nic"));
            if (preparedStatement.executeUpdate() > 0) {
                resp.getWriter().print(
                        objectBuilder
                                .add("state", "Ok")
                                .add("message", "Successfully Deleted...!")
                                .add("data", "[]")
                                .build()
                );
            }
        } catch (SQLException e) {
            resp.addHeader("Content-Type", "application/json");
            resp.setStatus(400);
            resp.getWriter().print(
                    objectBuilder
                            .add("state", "Error")
                            .add("message", e.getMessage())
                            .add("data", "[]")
                            .build()
            );
        }
    }

    @Override
    protected void doOptions(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.addHeader("Access-Control-Allow-Origin", "*");
        resp.addHeader("Access-Control-Allow-Methods", "PUT,DELETE");
        resp.addHeader("Access-Control-Allow-Headers", "Content-Type");
    }
}
