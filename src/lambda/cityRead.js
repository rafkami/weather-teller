import mongoose from "mongoose";
import db from "./server";
import City from "./cityModel";

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    // Use Product.Model to find all cities
    const cities = await City.find(),
      response = {
        data: cities
      };

    return {
      statusCode: 200,
      body: JSON.stringify(response)
    };
  } catch (err) {
    console.log(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ msg: err.message })
    };
  }
};
