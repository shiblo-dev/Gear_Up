import Stripe from "stripe";
import config from "../config";  

if (!config.stripe_secret_key && !process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is missing from environment variables!");
}

const stripe = new Stripe(
  (config.stripe_secret_key || process.env.STRIPE_SECRET_KEY) as string,
  {
     typescript: true,
  }
);

export default stripe;