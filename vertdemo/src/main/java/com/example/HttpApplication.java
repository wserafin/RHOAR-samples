package com.example;

import io.vertx.core.AbstractVerticle;
import io.vertx.core.Future;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.RoutingContext;
import io.vertx.ext.web.handler.StaticHandler;

import static io.vertx.core.http.HttpHeaders.CONTENT_TYPE;

public class HttpApplication extends AbstractVerticle {

  static final String template = "Hello, %s!";

  @Override
  public void start() {
    
    // Create a router object
    Router router = Router.router(vertx);    

    router.get("/api/greeting").handler(this::greeting);

    router.get("/*").handler(StaticHandler.create());

    vertx.createHttpServer().requestHandler(router::accept).listen(8080);
    
    System.out.println("THE HTTP APPLICATION HAS STARTED");
  }

  // TODO: Add method for greeting here
 private void greeting(RoutingContext rc) {
    String name = rc.request().getParam("name");
    if (name == null) {
        name = "World";
    }

    JsonObject response = new JsonObject()
        .put("content", String.format(template, name));

    rc.response()
        .putHeader(CONTENT_TYPE, "application/json; charset=utf-8")
        .end(response.encodePrettily());
    }
  
}
