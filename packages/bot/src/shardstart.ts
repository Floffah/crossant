import AppManager from "src/sharding/AppManager";

new AppManager().init({ debug: process.env.NODE_ENV === "development" });
